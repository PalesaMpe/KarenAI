import asyncio
import socketio
from fastapi import FastAPI
from uvicorn import Config, Server
from voice.speech_handler import SpeechHandler
from core.llm_handler import LLMHandler
from voice.tts import TTS

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins="*")
app = FastAPI()
sio_app = socketio.ASGIApp(sio, app)

sh = SpeechHandler(True)
llm = LLMHandler()
tts = TTS()

@sio.event
async def connect(sid, environ):
    print(f"Client {sid} connected")

@sio.event
async def send_to_frontend(sid):
    print(f"KAREN is online, session {sid}")
    while True:
     try:
         transcript = await asyncio.to_thread(sh.listen)
         if transcript:
             print(f"User: {transcript}")
             response = llm.generate(transcript)
             print(response)
             audio_bytes = await asyncio.to_thread(tts.generate_audio_to_bytes, response)
             with open("output.wav", "rb") as f:
                 audio_bytes = f.read()
             await sio.emit('audio', {'audio': audio_bytes}, to=sid)
     except Exception as e:
         print("Error:", e)


async def main():
    config = Config(app=sio_app, host="127.0.0.1", port=5000)
    server = Server(config)
    await server.serve()

if __name__ == "__main__":
    asyncio.run(main())
