

import json
import ssl
import sys
import os
import concurrent.futures
import asyncio
import logging

from pathlib import Path
from vosk import KaldiRecognizer, Model
from aiohttp import web
import aiohttp
from aiortc import RTCSessionDescription, RTCPeerConnection, RTCDataChannel
from av.audio.resampler import AudioResampler

import random, aiohttp_cors
from urllib import request, parse

from websockets.server import serve


debugmode = os.environ.get('TRANSCRIPTION_DEBUGMODE', False)

log = logging.getLogger("transcription_logger")
ch = logging.StreamHandler()
loglevel = logging.WARNING
if debugmode:
    loglevel = logging.DEBUG
ch.setLevel(loglevel)
log.addHandler(ch)
log.setLevel(loglevel)

if __name__ == '__main__':
    log.info("starting transcription service...")


ROOT = Path(__file__).parent
WEBSERVER = Path(__file__).parent.parent

vosk_model_paths: dict[str, str] = json.loads(os.environ.get('VOSK_MODEL_PATHS', '{"en":"../../models/vosk-model-en-us-0.22"}'))
vosk_cert_file = os.environ.get('VOSK_CERT_FILE', None)
vosk_key_file = os.environ.get('VOSK_KEY_FILE', None)
print(vosk_model_paths)
print(type(vosk_model_paths))
dump_file = os.environ.get('DUMP_FILE', None)

transcription_port = int(os.environ.get('TRANSCRIPTION_PORT', 2700))

translation_domain = str(os.environ.get('TRANSLATION_DOMAIN', '127.0.0.1:5000'))

models: dict[str: Model] = {}
for model in vosk_model_paths.keys():
    models[model] = Model(vosk_model_paths.get(model))
pool = concurrent.futures.ThreadPoolExecutor((os.cpu_count() or 1))
dump_fd = None if dump_file is None else open(dump_file, "wb")

# dict[str: Room]
rooms: dict = {}


log.info("TRANSCRIPTION_PORT: " + str(transcription_port))
log.info("TRANSLATION_DOMAIN: " + str(translation_domain))
log.info("TRANSCRIPTION_DEBUGMODE: " + str(debugmode))
log.info("VOSK_MODEL_PATH: " + str(vosk_model_paths))


# send a request to the libretranslate service
# to translate a text q from language source to language target
def translate(q: str, source: str = "en", target: str = "de", timeout: int | None = None):
    params: dict[str, str] = {"q": q, "source": source, "target": target}
    url_params = parse.urlencode(params)
    req = request.Request("http://" + translation_domain + "/translate", data=url_params.encode())
    response = request.urlopen(req, timeout = timeout)
    log.debug("translation request sent: " + str(params))
    response_str = response.read().decode()
    return str(json.loads(response_str)["translatedText"])

# send a language to the libretranslate service
# to detext the language of the text
# NOT USED / IMPLEMENTED YET
def detect(q: str, timeout: int | None = None):
    params: dict[str, str] = {"q": q}
    url_params = parse.urlencode(params)
    req = request.Request("http://" + translation_domain + "/detect", data=url_params.encode())
    response = request.urlopen(req, timeout = timeout)
    response_str = response.read().decode()
    return json.loads(response_str)

# transcribe the audio
def process_chunk(rec, message):
    try:
        res = rec.AcceptWaveform(message)
    except Exception:
        result = None
    else:
        if res > 0:
            result = rec.Result()
        else:
            result = rec.PartialResult()
    return result

#
# KaldiTask manages the transcription of a audio stream and calls onSend whenever a part is transcribed
#
# the model is selected from models (preloaded vosk AI models)
# currently only the english model
#
class KaldiTask: # transcription
    def __init__(self):
        self.__resampler = AudioResampler(format='s16', layout='mono', rate=48000)
        self.__audio_task = None
        self.__track = None
        self.language = "en"
        self.__recognizer = KaldiRecognizer(models[self.language], 48000)
        self.__onSend = lambda: None

    async def set_audio_track(self, track):
        self.__track = track

    async def start(self):
        self.__audio_task = asyncio.create_task(self.__run_audio_xfer())

    async def stop(self):
        if self.__audio_task is not None:
            self.__audio_task.cancel()
            self.__audio_task = None

    async def __run_audio_xfer(self):
        loop = asyncio.get_running_loop()

        max_frames = 20
        frames = []
        while True:
            fr = await self.__track.recv()
            frames.append(fr)

            # collect frames to not send partial results too often
            if len(frames) < max_frames:
               continue

            dataframes = bytearray(b'')
            for fr in frames:
                for rfr in self.__resampler.resample(fr):
                    dataframes += bytes(rfr.planes[0])[:rfr.samples * 2]
            frames.clear()

            if dump_fd != None:
                dump_fd.write(bytes(dataframes))

            result = await loop.run_in_executor(pool, process_chunk, self.__recognizer, bytes(dataframes))
            result: dict[str, str] = json.loads(result)
            result["language"] = self.language
            self.__onSend(result)
    
    def setOnSend(self, do):
        self.__onSend = do
 
#
# join a existing room
# the request should contain the roomid, of the room the user wants to join and the language, the transribed text will be translated to
# besides the request should contain the webRTC connection offer ('sdp' & 'type')
# 
# a user object is initialized and added to the list of users in the room object
#
# the response is the webRTC answer
# the connection consists of the datachannel to send the transcribed text translated to the language the user selected 
#
async def join(request):
    params = await request.json()

    log.info("Received join request")

    roomid = request.rel_url.query['room']
    if not roomid in rooms.keys():
        return web.Response(
            content_type='application/json',
            text='{"error": "room not found"}')
    room: Room = rooms.get(roomid)

    user: User = User()
    room.getUsers().append(user)
    language = params["language"]
    user.setLanguage(language)

    user.setRTCPeerConnection(RTCPeerConnection())
    pc: RTCPeerConnection = user.getRTCPeerConnection()

    @pc.on('datachannel')
    async def on_datachannel(channel):
        channel.send('{}') # Dummy message to make the UI change to "Recieiving"
        user.setDataChannel(channel)

    @pc.on('iceconnectionstatechange')
    async def on_iceconnectionstatechange():
        if pc.iceConnectionState == 'failed':
            print("------------------------------")
            print(str(len(room.getUsers())))
            print("------------------------------")
            room.getUsers().remove(user)
            print("------------------------------")
            print(str(len(room.getUsers())))
            print("------------------------------")
            await user.disconnect()


    offer = RTCSessionDescription(
        sdp=params['sdp'],
        type=params['type'])
    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.Response(
        content_type='application/json',
        text=json.dumps({
            'sdp': pc.localDescription.sdp,
            'type': pc.localDescription.type
        }))

#
# create a new room
# the request should contain the language the room leader speaks in and the webRTC peer connection offer ('sdp' & 'type')
# a room object is with a new generated ID is initialized
# the response contains the webRTC connection answer and the roomid
#
# the webRTC connection consists of the audio track for sending the speech of the user and a datachannel for sending the transcription (same language as spoken)
# 
async def create(request):
    params = await request.json()

    log.info("Received create request")

    language = params["language"]

    offer = RTCSessionDescription(
        sdp=params['sdp'],
        type=params['type'])
    
    room: Room = Room()
    rooms[room.getID()] = room

    user: User = User()
    room.getUsers().append(user)
    user.setLanguage(language)
    user.setRTCPeerConnection(RTCPeerConnection())
    pc: RTCPeerConnection = user.getRTCPeerConnection()
    
    kaldi = room.getTask()
    kaldi.setOnSend(room.sendToUsers)

    @pc.on('datachannel')
    async def on_datachannel(channel):
        channel.send('{}') # Dummy message to make the UI change to "Listening"
        user.setDataChannel(channel)
        await kaldi.start()

    @pc.on('iceconnectionstatechange')
    async def on_iceconnectionstatechange():
        if pc.iceConnectionState == 'failed':
            await room.close()
            await pc.close()

    @pc.on('track')
    async def on_track(track):
        if track.kind == 'audio':
            await kaldi.set_audio_track(track)

        @track.on('ended')
        async def on_ended():
            await kaldi.stop()

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.Response(
        content_type='application/json',
        text=json.dumps({
            'sdp': pc.localDescription.sdp,
            'type': pc.localDescription.type,
            'roomid': room.getID()
        }))


class Room:

    # generate a new room id
    @classmethod
    def generateID(cls):
        # list of chars to generate the id from
        chars:list[str] = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9"]
        random.shuffle(chars)
        id = "".join(chars[0:5])
        while id in rooms.keys():
            random.shuffle(chars)
            id = "".join(chars[0:5])
        return id

    def __init__(self):
        self.id: str = Room.generateID()
        self.users: list[User] = []
        self.task: KaldiTask = KaldiTask()

    def getID(self):
        return self.id
    
    def getUsers(self):
        return self.users
    
    def getTask(self):
        return self.task

    # close the room
    # closes all connections and deletes the data on memory
    async def close(self):
        for user in self.users:
            await user.disconnect()
        rooms.pop(self.id)

    # broadcast
    def sendToUsers(self, result: dict[str, str]):
        language = result.get("language")
        partial = result.get("partial")
        text = result.get("text")
        log.debug("original text: '" + str(text) + "'")
        log.debug("original partial: '" + str(partial) + "'")
        translated = ""
        # iterate all users
        for user in self.users:
            try:
                if not "closed" in user.getDataChannel().readyState:
                    if partial != None and partial != "":
                        # translate partial
                        translated = json.dumps({"partial": translate(q = partial, source = language, target = user.getLanguage(), timeout = 100)})
                    elif text != None and text != "":
                        # translate text
                        translated = json.dumps({"text": translate(q = text, source = language, target = user.getLanguage(), timeout = 100)})
                    log.info("sending to: " + user.getLanguage() + "; translated: '" + str(translated) + "'")
                    # send to user
                    if user.getDataChannel() != None:
                        user.getDataChannel().send(translated)
                    else:
                        log.debug("user datachannel == None")
            except Exception as e:
                log.error("error while sending: " + str(e))

#
# class User; handles all information about connected clients
# contains the webRTC connection and its datachannel to send the text
# the language determines the language the user speeks in, or to translate the text to
#
class User:

    def __init__(self):
        self.rtcPeerConnection: RTCPeerConnection = None
        self.language: str = "en"
        self.channel: RTCDataChannel = None

    def getRTCPeerConnection(self):
        return self.rtcPeerConnection

    def setRTCPeerConnection(self, connection: RTCPeerConnection):
        self.rtcPeerConnection = connection

    def getLanguage(self):
        return self.language
    def setLanguage(self, language):
        self.language = language
    
    def setDataChannel(self, channel):
        self.channel = channel
    def getDataChannel(self):
        return self.channel

    async def disconnect(self):
        self.channel.close()
        await self.rtcPeerConnection.close()

#
# deprecated
#
async def websocket_handler(request):
    log.info('Websocket connection starting')
    ws = aiohttp.web.WebSocketResponse()
    await ws.prepare(request)
    log.info('Websocket connection ready')

    roomID = request.rel_url.query['roomid']
    
    if not roomID in rooms.keys():
        await ws.close()
        return ws

    room = rooms.get(roomID)

    validClose = False
    validRequest = False
    async for msg in ws:
        data = json.loads(msg.data)
        if msg.type == aiohttp.WSMsgType.TEXT:
            log.info("received over websocket: " + json.dumps(data))
            if validRequest or data["action"] == "join":    
                match data["action"]:
                    case "join":
                        room.getUsers().append(data["username"])
                        log.info("Received join request from " + data["username"] + " to room: " + room.getName())
                    case "close":
                        validClose = True
                        await ws.close()
                    case "echo":
                        await ws.send_str(json.dumps(data) + '/answer')
                    case _: log.warning("Websocket error: action not found")
    
    if validClose:
        log.info("Websocket connection closed")
    else:
        log.warning("Websocket connection lost")

    return ws



if __name__ == '__main__':

    if vosk_cert_file:
        ssl_context = ssl.SSLContext()
        ssl_context.load_cert_chain(vosk_cert_file, vosk_key_file)
    else:
        ssl_context = None

    app = web.Application()

    app._router.add_post("/join", join)
    app._router.add_post("/create", create)

    # websocket (deprecated)
    #app._router.add_get("/ws", websocket_handler)

    cors = aiohttp_cors.setup(app, defaults={
    "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*"
        )
    })

    for route in list(app.router.routes()):
        cors.add(route)
    
    web.run_app(app, port=transcription_port, ssl_context=ssl_context)





