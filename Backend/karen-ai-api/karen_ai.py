import os
import tempfile
import google.generativeai as genai
from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from TTS.api import TTS
from pyannote.audio import Pipeline
from pyannote.audio.core.io import AudioFile
from pyannote.audio.pipelines.utils.hook import ProgressHook
import uvicorn
import torch
import torchaudio
import subprocess

load_dotenv()

# Configure your API key
genai.configure(api_key=os.getenv("GENAI_API_KEY"))
pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-community-1")

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Specify your frontend URL
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

def convert_to_wav(input_path, output_path):
    cmd = [
        r"C:\Program Files\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe", "-y",
        "-i", input_path,
        "-ac", "1",
        "-ar", "16000",
        output_path
    ]
    subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)

@app.post("/generate")
async def generate(transcript: str = Form(...), audio: UploadFile = File(...)):
#get voice
#get the data
# compare with db
# if user exists, add to prompt that karen is speaking to a known companion
# if user does exist, Karen will ask user to introduce themselves
#return name expected
# Debug logs to ensure multipart was parsed correctly
    print("success",pipeline)
    print("Received transcript:", transcript)
    audio_bytes = await audio.read()
    print("Received audio:", audio.filename, "type:", audio.content_type, "size:", len(audio_bytes))
# apply pretrained pipeline (with optional progress hook)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_audio_file:
        temp_audio_file.write(audio_bytes)
        temp_audio_file_path = temp_audio_file.name

    temp_wav_path = temp_audio_file_path + ".wav"
    convert_to_wav(temp_audio_file_path, temp_wav_path)
    print("Converted WAV:", temp_wav_path)

    try:
    # Apply pretrained pipeline (with optional progress hook)
        #with ProgressHook() as hook:
        waveform, sample_rate = torchaudio.load(temp_wav_path)
        audio_input = {"waveform": waveform, "sample_rate": int(sample_rate)}

        output = pipeline(audio_input)

    # Print the result
        for turn, speaker in output.speaker_diarization:
            print(f"start={turn.start:.1f}s stop={turn.end:.1f}s speaker_{speaker}")

    # Generate response from the model
        response = model.generate_content(transcript)
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

    except Exception as e:
        print("Error processing audio with Pyannote:", e)
        return {"error": str(e)}


if __name__ == "__main__":
    uvicorn.run(
        "karen_ai:app",
        host="127.0.0.1",
        port=8001,
        reload=False,  # MUST disable for debugging
        workers=1,    # optional, enforce single process
    )