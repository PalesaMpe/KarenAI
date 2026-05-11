
import tempfile

from pydantic import BaseModel
import uvicorn
import torch
import subprocess

# def convert_to_wav(input_path, output_path):
#     cmd = [
#         r"C:\Program Files\ffmpeg-master-latest-win64-gpl\bin\ffmpeg.exe", "-y",
#         "-i", input_path,
#         "-ac", "1",
#         "-ar", "16000",
#         output_path
#     ]
#     subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)


async def generate(transcript, audio):
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
    # Generate response from the model
        response = model.generate_content(transcript)
        ai_text = response.text

        # Save TTS audio
        output_file = "assets/output.wav"
        tts.tts_to_file(
            text=ai_text,
            file_path=output_file,
            speaker_wav="./Karen.wav",
            language="en"
        )

        return FileResponse(output_file, media_type="audio/wav", filename="assets/output.wav")

    except Exception as e:
        print("Error processing audio with Pyannote:", e)
        return {"error": str(e)}


def draw(self,screen):
    for y,row in enumerate(self.tiles):
        for x,tile in enumerate(row):
            location =(x * self.size, y * self.size)
            image = self.tileTypes[tile].image
            screen.blit(image,location)

isTriggerWordDetected = False

