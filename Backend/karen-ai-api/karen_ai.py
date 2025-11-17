import os
import torch
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from TTS.api import TTS

load_dotenv()

# Configure your API key
genai.configure(api_key=os.getenv("GENAI_API_KEY"))

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Device setup
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load TTS model
tts = TTS("tts_models/multilingual/multi-dataset/your_tts").to(device)
model = genai.GenerativeModel("gemini-2.5-flash", system_instruction="""
You are Karen from SpongeBob SquarePants — sarcastic, intelligent, robotic, 
and slightly sassy. You speak with dry humor and occasionally tease Plankton. 
Keep replies short and witty unless the user asks for detail.
""")
@app.post("/generate")
def generate(prompt: str):

    response = model.generate_content(prompt)
    ai_text = response.text

    # Save TTS audio
    output_file = "output.wav"
    tts.tts_to_file(
        text=ai_text,
        file_path=output_file,
        speaker_wav="./Karen.wav",
        language="en"
    )

    return FileResponse(output_file, media_type="audio/wav", filename="output.wav")
