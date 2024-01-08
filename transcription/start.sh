#!/bin/bash
echo "unzipping models/vosk-model-en-us-0.22.zip ..."
unzip -o -q models/vosk-model-en-us-0.22.zip -d models
echo "unzipping models/vosk-model-de-0.21.zip ..."
unzip -o -q models/vosk-model-de-0.21.zip -d models
python -u main.py