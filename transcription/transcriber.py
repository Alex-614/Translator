

import asyncio
import json
import os
import concurrent.futures

from vosk import KaldiRecognizer, Model
from av.audio.resampler import AudioResampler


class Transcriber:
    
    def __init__(self, model_paths, dump_file):
        self.pool = concurrent.futures.ThreadPoolExecutor((os.cpu_count() or 1))
        self.models: dict[str: Model] = {}
        for model in model_paths.keys():
            self.models[model] = Model(model_paths.get(model))
        self.dump_fd = None if dump_file is None else open(dump_file, "wb")

    def newTask(self, language):
        return KaldiTask(self.pool, self.models[language], language, self.dump_fd)

#
# KaldiTask manages the transcription of a audio stream and calls onSend whenever a part is transcribed
#
# the model is selected from models (preloaded vosk AI models)
# currently only the english model
#
class KaldiTask: # transcription
    
    # transcribe the audio
    @classmethod
    def process_chunk(cls, rec, message):
        try:
            res = rec.AcceptWaveform(message)
        except Exception:
            result = None
        else:
            if res > 0:
                result = rec.Result()
            else:
                result = rec.PartialResult()
        return result

    def __init__(self, pool, model, language, dump_fd):
        self.pool = pool
        self.dump_fd = dump_fd
        self.__resampler = AudioResampler(format='s16', layout='mono', rate=48000)
        self.__audio_task = None
        self.__track = None
        self.language = language
        self.__recognizer = KaldiRecognizer(model, 48000)
        self.__onSend = lambda: None

    async def set_audio_track(self, track):
        self.__track = track

    async def start(self):
        self.__audio_task = asyncio.create_task(self.__run_audio_xfer())

    async def stop(self):
        if self.__audio_task is not None:
            self.__audio_task.cancel()
            self.__audio_task = None

    async def __run_audio_xfer(self):
        loop = asyncio.get_running_loop()

        max_frames = 20
        frames = []
        while True:
            fr = await self.__track.recv()
            frames.append(fr)

            # collect frames to not send partial results too often
            if len(frames) < max_frames:
               continue

            dataframes = bytearray(b'')
            for fr in frames:
                for rfr in self.__resampler.resample(fr):
                    dataframes += bytes(rfr.planes[0])[:rfr.samples * 2]
            frames.clear()

            if self.dump_fd != None:
                self.dump_fd.write(bytes(dataframes))

            result = await loop.run_in_executor(self.pool, KaldiTask.process_chunk, self.__recognizer, bytes(dataframes))
            result: dict[str, str] = json.loads(result)
            result["language"] = self.language
            self.__onSend(result)
    
    def setOnSend(self, do):
        self.__onSend = do



