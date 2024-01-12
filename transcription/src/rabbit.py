
import amqpstorm
from amqpstorm import Message

class Rabbit:

    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.connection = amqpstorm.Connection(str(host), "guest", "guest", int(port))

    def newChannel(self, id: str):
        return Channel(self.connection.channel(), id)

    def close(self):
        self.connection.close()
    


class Channel:
    def __init__(self, channel: amqpstorm.Channel, id: str):
        self.id: str = id
        self.channel = channel
        #self.__createQueue(self.id)

    def __createQueue(self, id: str = None):
        if id == None:
            id = self.id
        self.channel.queue.declare(id)

    def close(self):
        self.channel.close()

    def enQueue(self, message: str, id: str = None):
        if id == None:
            id = self.id

        properties = {
            'content_type': 'text/plain',
            'headers': {'key': 'value'}
        }
        message: Message = Message.create(self.channel, message, properties)
        message.publish("room_queue", exchange = "room_exchange")
        


