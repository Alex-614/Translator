

import json
import ssl
import sys
import os
import concurrent.futures
import asyncio

from pathlib import Path
from vosk import KaldiRecognizer, Model
from aiohttp import web
import aiohttp
from aiohttp.web_exceptions import HTTPServiceUnavailable
from aiortc import RTCSessionDescription, RTCPeerConnection
from av.audio.resampler import AudioResampler

import random, aiohttp_cors, websockets
from websockets.server import serve
from urllib import request, parse

ROOT = Path(__file__).parent
WEBSERVER = Path(__file__).parent.parent

vosk_interface = os.environ.get('VOSK_SERVER_INTERFACE', '0.0.0.0')
vosk_port = int(os.environ.get('VOSK_SERVER_PORT', 2700))
vosk_model_path = os.environ.get('VOSK_MODEL_PATH', '../../models/vosk-model-en-us-0.22')
vosk_cert_file = os.environ.get('VOSK_CERT_FILE', None)
vosk_key_file = os.environ.get('VOSK_KEY_FILE', None)
vosk_dump_file = os.environ.get('VOSK_DUMP_FILE', None)

translation_url = os.environ.get('TRANSLATION_URL', 'http://127.0.0.1:5000/')

models: dict[str: Model] = {"en": Model(vosk_model_path)}
pool = concurrent.futures.ThreadPoolExecutor((os.cpu_count() or 1))
dump_fd = None if vosk_dump_file is None else open(vosk_dump_file, "wb")

class Room:
    pass

rooms: dict[str, Room] = {}

class Log:
    lastPrint = "info"
    @classmethod
    def printInfo(cls, error):
        if cls.lastPrint != "info":
            print("----- Info -----")
        print(error)
        cls.lastPrint = "info"
    @classmethod
    def printError(cls, error):
        if cls.lastPrint != "error":
            print("----- Error -----")
        print(error)
        cls.lastPrint = "error"

def translate(q: str, source: str = "en", target: str = "de", timeout: int | None = None):
    params: dict[str, str] = {"q": q, "source": source, "target": target}
    url_params = parse.urlencode(params)
    req = request.Request(translation_url + "translate", data=url_params.encode())
    response = request.urlopen(req, timeout = timeout)
    response_str = response.read().decode()
    return str(json.loads(response_str)["translatedText"])

def detect(q: str, timeout: int | None = None):
    params: dict[str, str] = {"q": q}
    url_params = parse.urlencode(params)
    req = request.Request(translation_url + "detect", data=url_params.encode())
    response = request.urlopen(req, timeout = timeout)
    response_str = response.read().decode()
    return json.loads(response_str)




def process_chunk(rec, message): # transcribe
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


class KaldiTask: # transcription
    def __init__(self):
        self.__resampler = AudioResampler(format='s16', layout='mono', rate=48000)
        self.__audio_task = None
        self.__track = None
        self.__channel = None
        self.channels:list = []
        self.language = "en"
        self.__recognizer = KaldiRecognizer(models[self.language], 48000)
        self.__onSend = lambda: None

    async def set_audio_track(self, track):
        self.__track = track

    async def set_text_channel(self, channel):
        self.__channel = channel

    async def add_text_channel(self, channel):
        self.channels.append(channel)

    async def remove_text_channel(self, channel):
        self.channels.remove(channel)

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
            #self.__channel.send(result)
            self.__onSend(result)
    
    def setOnSend(self, do):
        self.__onSend = do


async def join(request):
    params = await request.json()

    Log.printInfo("Received join request")

    roomid = request.rel_url.query['room']
    if not roomid in rooms.keys():
        return web.Response(
            content_type='application/json',
            text='{"error": "room not found"}')
    room = rooms.get(roomid)

    user: User = User()
    room.getUsers().append(user)
    language = params["language"]
    user.setLanguage(language)

    offer = RTCSessionDescription(
        sdp=params['sdp'],
        type=params['type'])

    user.setRTCPeerConnection(RTCPeerConnection())
    pc: RTCPeerConnection = user.getRTCPeerConnection()

    @pc.on('datachannel')
    async def on_datachannel(channel):
        channel.send('{}') # Dummy message to make the UI change to "Recieiving"
        user.setDataChannel(channel)
        await room.getTask().add_text_channel(channel)

    @pc.on('iceconnectionstatechange')
    async def on_iceconnectionstatechange():
        if pc.iceConnectionState == 'failed':
            room.getUsers().remove(user)
            await room.getTask().remove_text_channel(user.getDataChannel())
            await pc.close()

    await pc.setRemoteDescription(offer)
    answer = await pc.createAnswer()
    await pc.setLocalDescription(answer)

    return web.Response(
        content_type='application/json',
        text=json.dumps({
            'sdp': pc.localDescription.sdp,
            'type': pc.localDescription.type
        }))

async def create(request):
    params = await request.json()

    Log.printInfo("Received create request")

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
        await kaldi.add_text_channel(channel)
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

    @classmethod
    def generateID(cls):
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

    async def close(self):
        await self.task.stop()
        for user in  self.users:
            await user.getRTCPeerConnection().close()
        rooms.pop(self.id)

    def sendToUsers(self, result: dict[str, str]):
        language = result.get("language")
        partial = result.get("partial")
        text = result.get("text")
        translated = ""
        for user in self.users:
            try:
                if partial != None and partial != "":
                    translated = json.dumps({"partial": translate(q = partial, source = language, target = user.getLanguage(), timeout = 250)})
                elif text != None and text != "":
                    translated = json.dumps({"text": translate(q = text, source = language, target = user.getLanguage(), timeout = 250)})
                print("sending to: " + user.getLanguage() + " translated: '" + str(translated) + "' type: " + str(type(translated)))
                user.getDataChannel().send(translated)
            except:
                pass

class User:

    def __init__(self):
        self.rtcPeerConnection = None
        self.language = "en"
        self.channel = None

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



async def websocket_handler(request):
    Log.printInfo('Websocket connection starting')
    ws = aiohttp.web.WebSocketResponse()
    await ws.prepare(request)
    Log.printInfo('Websocket connection ready')

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
            Log.printInfo("received over websocket: " + json.dumps(data))
            if validRequest or data["action"] == "join":    
                match data["action"]:
                    case "join":
                        room.getUsers().append(data["username"])
                        Log.printInfo("Received join request from " + data["username"] + " to room: " + room.getName())
                    case "close":
                        validClose = True
                        await ws.close()
                    case "echo":
                        await ws.send_str(json.dumps(data) + '/answer')
                    case _: Log.printError("Websocket error: action not found")
    
    if validClose:
        Log.printInfo("Websocket connection closed")
    else:
        Log.printError("Websocket connection lost")

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
    
    web.run_app(app, port=vosk_port, ssl_context=ssl_context)





