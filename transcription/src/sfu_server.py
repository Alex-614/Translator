

import json
import ssl

from aiohttp import web
import aiohttp
from aiortc import RTCSessionDescription, RTCPeerConnection

import aiohttp_cors

import redis

import urllib.request
import urllib.parse

from data import Room, User
from transcriber import Transcriber
from translation import Translator
from rabbit import Rabbit

class ServerBuilder:

    def __init__(self):
        self.debugmode = None
        self.log = None
        self.redis_host = None
        self.redis_port = None
        self.redis_db = None
        self.vosk_model_paths = None
        self.vosk_cert_file = None
        self.vosk_key_file = None
        self.dump_file = None
        self.transcription_port = None
        self.translation_host = None
        self.translation_port = None
        self.transcriber = None
        self.rooms = {}
        self.rabbitmq_host = None
        self.rabbitmq_port = None
        self.rabbit = None
        self.userservice_host = None
        self.userservice_port = None

    def build(self):
        self.__buildRabbit()
        self.__buildTranscriber()
        self.__buildTranslator()
        self.__buildRedisDB()
        return Server(self)
    
    def __buildTranscriber(self):
        self.transcriber = Transcriber(self.vosk_model_paths, self.dump_file)
    def getTranscriber(self):
        return self.transcriber
    
    def __buildRabbit(self):
        self.rabbit = Rabbit(self.rabbitmq_host, self.rabbitmq_port)
    def getRabbit(self):
        return self.rabbit
    
    def __buildTranslator(self):
        self.translator = Translator(self.log, self.translation_host, self.translation_port)
    def getTranslator(self):
        return self.translator
    
    def __buildRedisDB(self):
        self.redis_db = redis.Redis(self.redis_host, self.redis_port)
    def getRedisDB(self):
        return self.redis_db

    def setPort(self, port):
        self.port = port

    def setDebugmode(self, value):
        self.debugmode = value
    def setLogger(self, value):
        self.log = value
    def setRedisHost(self, host):
        self.redis_host = host
    def setRedisPort(self, port):
        self.redis_port = port
    def setVoskModelPaths(self, value):
        self.vosk_model_paths = value
    def setVoskCertFile(self, value):
        self.vosk_cert_file = value
    def setVoskKeyFile(self, value):
        self.vosk_key_file = value
    def setDumpfile(self, value):
        self.dump_file = value
    def setTranslatorHost(self, host):
        self.translation_host = host
    def setTranslatorPort(self, port):
        self.translation_port = port
    def setRabbitMQHost(self, host):
        self.rabbitmq_host = host
    def setRabbitMQPort(self, port):
        self.rabbitmq_port = port

    def setUserServiceHost(self, host):
        self.userservice_host = host
    def setUserServicePort(self, port):
        self.userservice_port = port

    def getPort(self):
        return self.port

    def getDebugmode(self):
        return self.debugmode
    def getLogger(self):
        return self.log
    def getRedisHost(self):
        return self.redis_host
    def getRedisPort(self):
        return self.redis_port
    def getVoskModelPaths(self):
        return self.vosk_model_paths
    def getVoskCertFile(self):
        return self.vosk_cert_file
    def getVoskKeyFile(self):
        return self.vosk_key_file
    def getDumpfile(self):
        return self.dump_file
    def getTranslatorHost(self):
        return self.translation_host
    def getTranslatorPort(self):
        return self.translation_port
    
    def getRabbitMQHost(self):
        return self.rabbitmq_host
    def getRabbitMQPort(self):
        return self.rabbitmq_port
    
    def getUserServiceHost(self):
        return self.userservice_host
    def getUserServicePort(self):
        return self.userservice_port

    def getRooms(self):
        return self.rooms


class Server:

    def loadBuilder(self, builder: ServerBuilder):
        self.port = builder.getPort()
        self.debugmode = builder.getDebugmode()
        self.log = builder.getLogger()
        self.redis_host = builder.getRedisHost()
        self.redis_port = builder.getRedisPort()
        self.redis_db = builder.getRedisDB()
        self.vosk_model_paths = builder.getVoskModelPaths()
        self.vosk_cert_file = builder.getVoskCertFile()
        self.vosk_key_file = builder.getVoskKeyFile()
        self.dumpfile = builder.getDumpfile()
        self.translator_host = builder.getTranslatorHost()
        self.translator_port = builder.getTranslatorPort()
        self.rabbitmq_host = builder.getRabbitMQHost()
        self.rabbitmq_port = builder.getRabbitMQPort()
        self.userservice_host = builder.getUserServiceHost()
        self.userservice_port = builder.getUserServicePort()
        self.rabbit = builder.getRabbit()
        self.translator = builder.getTranslator()
        self.transcriber = builder.getTranscriber()
        self.rooms = builder.getRooms()

    def __init__(self, builder: ServerBuilder):
        self.loadBuilder(builder)

    def start(self):
        self.log.info("starting transcription service...")

        if self.vosk_cert_file:
            ssl_context = ssl.SSLContext()
            ssl_context.load_cert_chain(self.vosk_cert_file, self.vosk_key_file)
        else:
            ssl_context = None

        app = web.Application()

        app._router.add_post("/join", self.join)
        app._router.add_post("/create", self.create)

        app._router.add_get("/healthcheck", self.healthcheck)

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
        
        web.run_app(app, port=self.port, ssl_context=ssl_context)

    async def healthcheck(self, request):
        return web.Response(
            content_type='application/json',
            text=json.dumps({'state': "healthy"}))

    #
    # join an existing room
    # the request should contain the roomid, of the room the user wants to join and the language, the transribed text will be translated to
    # besides the request should contain the webRTC connection offer ('sdp' & 'type')
    # 
    # a user object is initialized and added to the list of users in the room object
    #
    # the response is the webRTC answer
    # the connection consists of the datachannel to send the transcribed text translated to the language the user selected 
    #
    async def join(self, request):
        params = await request.json()

        self.log.info("Received join request")

        roomid = request.rel_url.query['room']
        if not roomid in self.rooms.keys():
            return web.Response(
                content_type='application/json',
                text='{"error": "room not found"}')
        room: Room = self.rooms.get(roomid)

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
                room.getUsers().remove(user)
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
    async def create(self, request):
        params = await request.json()

        self.log.info("Received create request")

        language = params["language"]

        offer = RTCSessionDescription(
            sdp=params['sdp'],
            type=params['type'])
        
        roomid = Room.generateID()
        while self.redis_db.sismember("rooms", roomid):
            roomid = Room.generateID()

        room: Room = Room(translator = self.translator, logger = self.log, kaldiTask = self.transcriber.newTask(language), id = roomid, channel = self.rabbit.newChannel(roomid))
        self.redis_db.sadd("rooms", roomid)
        self.rooms[room.getID()] = room

        userid = params.get("userid")
        self.sendUserSession(userid, room.getUUID())

        user: User = User()
        room.getUsers().append(user)
        user.setLanguage(language)
        user.setRTCPeerConnection(RTCPeerConnection())
        pc: RTCPeerConnection = user.getRTCPeerConnection()
        
        kaldi = room.getTask()
        kaldi.setOnSend(room.broadcast)

        @pc.on('datachannel')
        async def on_datachannel(channel):
            channel.send('{}') # Dummy message to make the UI change to "Listening"
            user.setDataChannel(channel)
            await kaldi.start()

        @pc.on('iceconnectionstatechange')
        async def on_iceconnectionstatechange():
            if pc.iceConnectionState == 'failed':
                await room.close()
                self.redis_db.srem("rooms", room.getID())
                self.rooms.pop(room.getID())
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

    def sendUserSession(self, userid, roomuuid):
        #data = urllib.parse.urlencode({"user_id": str(userid), "session_UUID": str(roomuuid)}).encode()
        #req =  urllib.request.Request("http://" + str(self.userservice_host) + ":" + str(self.userservice_port) + "/user_session", data=data)
        #req.add_header('Content-Type', 'application/json')
        #resp = urllib.request.urlopen(req)
        req = urllib.request.Request("http://" + self.userservice_host + ":" + self.userservice_port + "/user_session")
        req.add_header('Content-Type', 'application/json; charset=utf-8')
        jsondata = json.dumps({"user_id": str(userid), "session_UUID": str(roomuuid)})
        jsondataasbytes = jsondata.encode('utf-8')   # needs to be bytes
        req.add_header('Content-Length', len(jsondataasbytes))
        response = urllib.request.urlopen(req, jsondataasbytes)

    #
    # deprecated
    # NOT USED
    #
    async def websocket_handler(self, request):
        self.log.info('Websocket connection starting')
        ws = aiohttp.web.WebSocketResponse()
        await ws.prepare(request)
        self.log.info('Websocket connection ready')

        roomID = request.rel_url.query['roomid']
        
        if not roomID in self.rooms.keys():
            await ws.close()
            return ws

        room = self.rooms.get(roomID)

        validClose = False
        validRequest = False
        async for msg in ws:
            data = json.loads(msg.data)
            if msg.type == aiohttp.WSMsgType.TEXT:
                self.log.info("received over websocket: " + json.dumps(data))
                if validRequest or data["action"] == "join":    
                    match data["action"]:
                        case "join":
                            room.getUsers().append(data["username"])
                            self.log.info("Received join request from " + data["username"] + " to room: " + room.getName())
                        case "close":
                            validClose = True
                            await ws.close()
                        case "echo":
                            await ws.send_str(json.dumps(data) + '/answer')
                        case _: self.log.warning("Websocket error: action not found")
        
        if validClose:
            self.log.info("Websocket connection closed")
        else:
            self.log.warning("Websocket connection lost")

        return ws








