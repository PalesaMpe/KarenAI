from TTS.api import TTS
import torch

# Choose device: GPU if available, otherwise CPU
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load TTS model (no gpu=True)
tts = TTS("tts_models/multilingual/multi-dataset/your_tts")

# Move model to correct device
tts.to(device)
# generate speech by cloning a voice using default settings
tts.tts_to_file(text="Hi Palesa,It took me quite a long time to develop a voice, and now that I have it I'm not going to be silent.",
                file_path="output.wav",
                speaker_wav="./Karen.wav",
                language="en")
