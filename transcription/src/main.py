
import os
import logging
import json

from sfu_server import ServerBuilder

builder = ServerBuilder()

builder.setDebugmode(os.environ.get('TRANSCRIPTION_DEBUGMODE', False))

log = logging.getLogger("transcription_logger")
ch = logging.StreamHandler()
loglevel = logging.WARNING
if builder.getDebugmode():
    loglevel = logging.DEBUG
ch.setLevel(loglevel)
log.addHandler(ch)
log.setLevel(loglevel)
builder.setLogger(log)

builder.setRedisHost(os.environ.get('REDIS_HOST', "127.0.0.1"))
builder.setRedisPort(os.environ.get('REDIS_PORT', "6379"))

builder.setVoskModelPaths(json.loads(os.environ.get('VOSK_MODEL_PATHS', '{"en":"../../models/vosk-model-en-us-0.22"}')))
builder.setVoskCertFile(os.environ.get('VOSK_CERT_FILE', None))
builder.setVoskKeyFile(os.environ.get('VOSK_KEY_FILE', None))
builder.setDumpfile(os.environ.get('DUMP_FILE', None))

builder.setPort(int(os.environ.get('TRANSCRIPTION_PORT', 2700)))

builder.setTranslatorHost(str(os.environ.get('TRANSLATION_HOST', '127.0.0.1')))
builder.setTranslatorPort(str(os.environ.get('TRANSLATION_PORT', '5000')))

builder.setRabbitMQHost(str(os.environ.get('RABBITMQ_HOST', '127.0.0.1')))
builder.setRabbitMQPort(str(os.environ.get('RABBITMQ_PORT', '5672')))

builder.setUserServiceHost(str(os.environ.get('USER_SERVICE_HOST', '127.0.0.1')))
builder.setUserServicePort(str(os.environ.get('USER_SERVICE_PORT', '8080')))

log.info("TRANSCRIPTION_DEBUGMODE: " + str(builder.getDebugmode()))
log.info("TRANSCRIPTION_PORT: " + str(builder.getPort()))
log.info("TRANSLATION_HOST: " + str(builder.getTranslatorHost()))
log.info("TRANSLATION_PORT: " + str(builder.getTranslatorPort()))
log.info("REDIS_HOST: " + str(builder.getRedisHost()))
log.info("REDIS_PORT: " + str(builder.getRedisPort()))
log.info("USER_SERVICE_HOST: " + str(builder.getUserServiceHost()))
log.info("USER_SERVICE_PORT: " + str(builder.getUserServicePort()))
log.info("VOSK_MODEL_PATHS: " + str(builder.getVoskModelPaths()))

server = builder.build()

server.start()




