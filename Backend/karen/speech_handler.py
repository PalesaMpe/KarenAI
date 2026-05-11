import speech_recognition as sr

class SpeechHandler:
    def __init__(self,enabled:bool):
        self.enabled = enabled
        self.recognizer = sr.Recognizer()

    def listen(self):
        if not self.enabled:
            return

        with sr.Microphone() as source:
            print("Listening...")
            audio = self.recognizer.listen(source)

            try:
                text = self.recognizer.recognize_google(audio)
                if self.wake_word in text.lower():
                    print(f"You said: {text}")
                    return text
                return None
            except sr.UnknownValueError:
                print("Could not understand audio")
            except sr.RequestError:
                print("Could not request results from service")
            except Exception as e:
                print(e)

    # def speak(self,text:str):
    #     output_file = "assets/output.wav"
    #     self.tts.tts_to_file(
    #         text=text,
    #         file_path=output_file,
    #         speaker_wav="./Karen.wav",
    #         language="en"
    #     )
    #
    #     return FileResponse(output_file, media_type="audio/wav", filename="assets/output.wav")
