#!/bin/bash
unzip -o models/vosk-model-en-us-0.22.zip -d models
unzip -o models/vosk-model-de-0.21.zip -d models
python -u sfu_server.py