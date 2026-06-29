import speech_recognition as sr

class SpeechHandler:
    def __init__(self,enabled:bool):
        self.enabled = enabled
        self.wake_word = "Karen"
        self.recognizer = sr.Recognizer()

    def listen(self):
       while True:
           with sr.Microphone() as source:
            print("Listening...")
            audio = self.recognizer.listen(source)
            text = self.recognizer.recognize_google(audio)
            print(f"You said: {text}")
            return text

