

FROM libretranslate/libretranslate
WORKDIR /app

EXPOSE 5000
ENTRYPOINT [ "./venv/bin/libretranslate", "--host", "0.0.0.0" ]



# translation service
#FROM python:3.11.2 AS translation
#WORKDIR /translation
#COPY translation.py ./
#COPY requirements.txt ./
#RUN pip install --no-cache-dir -r requirements.txt
#EXPOSE 5000
#ENTRYPOINT [ "python", "translation.py" ]
