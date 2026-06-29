import os
from dotenv import load_dotenv
from google import genai

class LLMHandler:
    def __init__(self):
        load_dotenv()
        self.client = genai.Client(api_key=os.getenv("GENAI_API_KEY"))
        self.model = "gemini-3-flash-preview"
        self.config = {
            "system_instruction": "You are Karen from SpongeBob. You are sarcastic, highly intelligent, and Plankton's computer wife."
        }


    def generate(self,text:str):
        try:
            response = self.client.models.generate_content(
                model=self.model,
                contents=text,
                config=self.config
            )
            print(response.text)
            return response.text

        except Exception as e:
            print("Error:", e)
            return {"error": str(e)}
