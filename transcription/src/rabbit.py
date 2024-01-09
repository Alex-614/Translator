
import pika


class Rabbit:

    def __init__(self, host, port):
        self.host = host
        self.port = port
        self.connection = pika.BlockingConnection(pika.ConnectionParameters(host = self.host, port = self.port))

    def newChannel(self, id: str):
        return Channel(self.connection.channel(), id)

    def close(self):
        self.connection.close()
    


class Channel:
    def __init__(self, channel: pika.adapters.blocking_connection.BlockingChannel, id: str):
        self.id: str = id
        self.channel = channel
        self.__createQueue(self.id)

    def __createQueue(self, id: str = None):
        if id == None:
            id = self.id
        self.channel.queue_declare(queue=id)

    def close(self, id: str = None):
        if id == None:
            id = self.id
        self.channel.queue_delete(queue=id)

    def enQueue(self, message: str, id: str = None):
        if id == None:
            id = self.id
        self.channel.basic_publish(exchange='', 
                                   routing_key=id, 
                                   body=message)
        


