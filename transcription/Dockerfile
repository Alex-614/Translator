
# transcription service
FROM python:3.11.2 AS transcription
WORKDIR /transcription
COPY src/main.py ./
COPY src/sfu_server.py ./
COPY src/transcriber.py ./
COPY src/data.py ./
COPY src/translation.py ./

COPY start.sh ./

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt


RUN mkdir models
ADD https://alphacephei.com/vosk/models/vosk-model-en-us-0.22.zip models
ADD https://alphacephei.com/vosk/models/vosk-model-de-0.21.zip models
#RUN unzip models/vosk-model-en-us-0.22.zip -d models

EXPOSE 2700
#CMD [ "./start.sh" ]
#ENTRYPOINT [ "python", "sfu_server.py" ]
#CMD [ "unzip", "-o", "models/vosk-model-en-us-0.22.zip", "-d", "models" ]
#ENTRYPOINT [ "unzip", "-o", "models/vosk-model-en-us-0.22.zip", "-d", "models", ";" , "python", "sfu_server.py" ]
ENTRYPOINT [ "./start.sh" ]
