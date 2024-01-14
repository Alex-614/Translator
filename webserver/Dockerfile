
# webserver
FROM python:3.11.2 AS webserver
WORKDIR /webserver
COPY webserver.py ./
COPY index.html ./
COPY styles.css ./
COPY client.js ./

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

ENTRYPOINT [ "python", "webserver.py" ]
