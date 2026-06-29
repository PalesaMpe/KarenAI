from piper import PiperVoice
import wave

class TTS:
    def __init__(self):
        self.voice = PiperVoice.load("assets/model.onnx", "assets/model.onnx.json")

    def generate_audio_to_bytes(self,text):
        print("Generating audio to_bytes")
        with wave.open("output.wav", "wb") as wav_file:
            self.voice.synthesize_wav(text, wav_file)
