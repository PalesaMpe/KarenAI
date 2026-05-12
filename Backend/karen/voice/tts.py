import io

import torch
import soundfile as sf
from qwen_tts import Qwen3TTSModel

class TTS:
    def __init__(self,ref_audio_path, ref_transcript):
        self.model = Qwen3TTSModel.from_pretrained(
            "Qwen/Qwen3-TTS-12Hz-1.7B-Base",
            device_map="cpu",
            dtype=torch.bfloat16,
            #attn_implementation="flash_attention_2",
        )
        self.ref_audio = ref_audio_path
        self.ref_transcript = ref_transcript

    def tts_buffer(self, text):
        wavs, sr = self.model.generate_voice_clone(
            text=text,
            language="English",
            ref_audio=self.ref_audio,
            ref_text=self.ref_transcript
        )
        buffer = io.BytesIO
        sf.write(buffer, wavs[0], sr,format="wav")
        buffer.seek(0)
        return buffer
