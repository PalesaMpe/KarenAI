import torch
import soundfile as sf
from qwen_tts import Qwen3TTSModel

class TTS:
    def __init__(self):
        self.model = Qwen3TTSModel.from_pretrained(
            "Qwen/Qwen3-TTS-12Hz-1.7B-Base",
            device_map="cuda:0",
            dtype=torch.bfloat16,
            attn_implementation="flash_attention_2",
        )

    def convert(self, transcript, audio):
        # single inference
        ref_audio = audio
        ref_transcript = transcript

        wavs, sr = self.model.generate_voice_clone(
            text="I am solving the equation: x = [-b ± √(b²-4ac)] / 2a? Nobody can — it's a disaster (◍•͈⌔•͈◍), very sad!",
            language="English",
            ref_audio=ref_audio,
            ref_text=ref_transcript
        )
        sf.write("output_voice_clone.wav", wavs[0], sr)
