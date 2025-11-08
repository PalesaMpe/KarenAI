from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
import ollama
import torch
import requests
from TTS.api import TTS


app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # or ["*"] for local testing
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get device
device = "cuda" if torch.cuda.is_available() else "cpu"

# List available 🐸TTS models
print(TTS().list_models())

device = "cuda" if torch.cuda.is_available() else "cpu"

# Load TTS model (no gpu=True)
tts = TTS("tts_models/multilingual/multi-dataset/your_tts")

# Move model to correct device
tts.to(device)

@app.post("/generate")
def generate(prompt: str):
    response = ollama.chat(model="mistral", messages=[{"role": "user", "content": prompt}])
    ai_text = response["message"]["content"]

    output_file = "output.wav"
    tts.tts_to_file(
        text=ai_text,
        file_path=output_file,
        speaker_wav="./Karen.wav",
        language="en")
    return FileResponse(output_file, media_type="audio/wav", filename="output.wav")


