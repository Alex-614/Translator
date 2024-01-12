import json
import logging

from urllib import request, parse


class Translator:

    translation_host = None
    translation_port = None
    log = logging.getLogger()

    def __init__(self, logger, translation_host, translation_port):
        self.log = logger
        self.translation_host = translation_host
        self.translation_port = translation_port

    # send a request to the libretranslate service
    # to translate a text q from language source to language target
    def translate(self, q: str, source: str = "en", target: str = "de", timeout: int | None = None):
        params: dict[str, str] = {"q": q, "source": source, "target": target}
        url_params = parse.urlencode(params)
        req = request.Request("http://" + self.translation_host + ":" + self.translation_port + "/translate", data=url_params.encode())
        response = request.urlopen(req, timeout = timeout)
        self.log.debug("translation request sent: " + str(params))
        response_str = response.read().decode()
        return str(json.loads(response_str)["translatedText"])

    # send a language to the libretranslate service
    # to detext the language of the text
    # NOT USED YET
    def detect(self, q: str, timeout: int | None = None):
        params: dict[str, str] = {"q": q}
        url_params = parse.urlencode(params)
        req = request.Request("http://" + self.translation_host + ":" + self.translation_port + "/detect", data=url_params.encode())
        response = request.urlopen(req, timeout = timeout)
        response_str = response.read().decode()
        return json.loads(response_str)









