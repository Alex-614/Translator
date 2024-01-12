
import random
import json
import uuid
import time

from aiortc import RTCPeerConnection, RTCDataChannel

from transcriber import KaldiTask
from translation import Translator
from rabbit import Channel

class Room:

    # generate a new room id
    @classmethod
    def generateID(cls):
        # list of chars to generate the id from
        chars:list[str] = ["A","B","C","D","E","F","G","H","I","J","K","L","M","N","O","P","Q","R","S","T","U","V","W","X","Y","Z","0","1","2","3","4","5","6","7","8","9"]
        random.shuffle(chars)
        return "".join(chars[0:5])
    
    def __init__(self, translator, logger, kaldiTask: KaldiTask, channel: Channel, id: str = None):
        self.log = logger
        self.id: str = Room.generateID() if id == None else id
        self.uuid: str = uuid.uuid4()
        self.users: list[User] = []
        self.task: KaldiTask = kaldiTask
        self.translator: Translator = translator
        self.channel = channel

    def getID(self):
        return self.id

    def getUUID(self):
        return self.uuid

    def getUsers(self):
        return self.users
    
    def getTask(self):
        return self.task

    # close the room
    # closes all connections and deletes the data on memory
    async def close(self):
        for user in self.users:
            await user.disconnect()

    # broadcast
    def broadcast(self, result: dict[str, str]):
        language = result.get("language")
        partial = result.get("partial")
        text = result.get("text")
        self.log.debug("original text: '" + str(text) + "'")
        self.log.debug("original partial: '" + str(partial) + "'")
        if text != None and text != "":
            self.channel.enQueue(json.dumps({"text": str(text), "timestamp": str(time.time()), "uuid": str(self.uuid)}))
        translated = ""
        cache = {}
        # iterate all users
        for user in self.users:
            try:
                if not "closed" in user.getDataChannel().readyState:
                    if cache.get(user.getLanguage()) == None:
                        if partial != None and partial != "":
                            if self.translator == None:
                                translated = json.dumps({"partial": partial})
                            else:
                                # translate partial
                                translated = json.dumps({"partial": self.translator.translate(q = partial, source = language, target = user.getLanguage(), timeout = 100)})
                        elif text != None and text != "":
                            if self.translator == None:
                                translated = json.dumps({"text": text})
                            else:
                                # translate text
                                translated = json.dumps({"text": self.translator.translate(q = text, source = language, target = user.getLanguage(), timeout = 100)})
                        cache[user.getLanguage()] = translated
                    else:
                        translated = cache.get(user.getLanguage())
                    self.log.debug("sending to: " + user.getLanguage() + "; translated: '" + str(translated) + "'")
                    # send to user
                    if user.getDataChannel() != None:
                        user.getDataChannel().send(translated)
                    else:
                        self.log.debug("user datachannel == None")
            except Exception as e:
                self.log.error("error while sending: " + str(e))



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










