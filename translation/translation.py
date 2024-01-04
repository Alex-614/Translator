
import logging, os
from aiohttp import web
import aiohttp_cors
import translate

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

async def doTranslate(request):
    params = await request.post()
    log.debug("received translate request: q='" + params.get("q") + "' source='" + params.get("source") + "' target='" + params.get("target") + "'")
    #{"q": q, "source": source, "target": target}
    translator = translate.Translator(from_lang = params.get("source"), to_lang = params.get("target"))
    translated = translator.translate(params.get("q"))
    log.debug("translated: " + translated)
    return web.Response(
            content_type='application/json',
            text='{"translatedText": "' + translated + '"}')


if __name__ == '__main__':

    app = web.Application()

    app._router.add_post("/translate", doTranslate)
    
    cors = aiohttp_cors.setup(app, defaults={
    "*": aiohttp_cors.ResourceOptions(
            allow_credentials=True,
            expose_headers="*",
            allow_headers="*"
        )
    })

    for route in list(app.router.routes()):
        cors.add(route)

    web.run_app(app, port=5000, ssl_context=None)

log.info("translation service stopped")


