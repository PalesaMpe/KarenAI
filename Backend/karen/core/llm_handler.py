import os
from dotenv import load_dotenv
from google import genai
from google import types
from qwen_tts import Qwen3TTSModel

class LLMHandler:
    def __init__(self):
        self.client = None
        self.load_config()

    def load_config(self):
        load_dotenv()
        # Configure your API key
        self.client = genai.Client(api_key=os.getenv("GENAI_API_KEY"))
        # pipeline = Pipeline.from_pretrained("pyannote/speaker-diarization-community-1")


    def generate(self,text:str):
        try:
            response = self.client.models.generate_content(
                model="gemini-3-flash-preview", contents="Explain how AI works in a few words"
            )
            print(response.text)
            return response.text

        except Exception as e:
            print("Error:", e)
            return {"error": str(e)}
