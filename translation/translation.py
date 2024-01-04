
import libretranslate, logging, os

debugmode = os.environ.get('TRANSCRIPTION_DEBUGMODE', False)

log = logging.getLogger("translation_logger")
ch = logging.StreamHandler()
loglevel = logging.INFO
if debugmode:
    loglevel = logging.DEBUG
ch.setLevel(loglevel)
log.addHandler(ch)
log.setLevel(loglevel)

log.info("starting translation service...")
#
# starts Libretranslate
#
libretranslate.main()
log.info("translation service stopped")


