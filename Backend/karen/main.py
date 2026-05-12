import asyncio
import socketio
from fastapi import FastAPI
from uvicorn import Config, Server
from speech_handler import SpeechHandler
from core.llm_handler import LLMHandler
from voice.tts import TTS

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins="*")
app = FastAPI()
sio_app = socketio.ASGIApp(sio, app)

sh = SpeechHandler(True)
llm = LLMHandler()
tts = TTS(ref_audio_path="assets/Karen.wav",
                               ref_transcript="Nope, I'm still delirious, but I like it.")

@sio.event
async def connect(sid, environ):
    print(f"Karen's connected: {sid}")


async def send_to_frontend():
    print("KAREN is online")

    while True:
        transcript = sh.listen()

        response = llm.generate(transcript)
        print(response)

        audio_buffer = tts.tts_buffer(response)

        audio_data = audio_buffer.read()
        await sio.emit({'audio': audio_data})

async def main():
    print("start")
    config = Config(app=sio_app, host="127.0.0.0", port=5000, reload=False)
    server = Server(config)

    await asyncio.gather(
        server.serve(),
        send_to_frontend()
    )




if __name__ == "__main__":
    asyncio.run(main())
