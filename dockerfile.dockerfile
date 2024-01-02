
# transcription service
FROM python:3.11.2 as transcription
ADD https://github.com/Alex-614/Translator/blob/main/transcription/requirements.txt /usr/
RUN pip install --no-cache-dir -r requirements.txt


# translation service
FROM python:3.11.2 as translation
ADD https://github.com/Alex-614/Translator/blob/main/translation/requirements.txt /usr/
RUN pip install --no-cache-dir -r requirements.txt
