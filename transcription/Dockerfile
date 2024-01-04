
# transcription service
FROM python:3.11.2 AS transcription
WORKDIR /transcription
COPY requirements.txt ./
COPY sfu_server.py ./
RUN pip install --no-cache-dir -r requirements.txt
EXPOSE 2700
ENTRYPOINT [ "python", "sfu_server.py" ]
