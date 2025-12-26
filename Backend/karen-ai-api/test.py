import google.generativeai as genai

genai.configure(api_key="AIzaSyD_1ljcaF3l4GBjMLDpbJZz5AyVs9R8jKM")
model = genai.GenerativeModel(model_name="gemini-2.5-flash")
model.start_chat()
# generate text
response = model.generate_content("hi how are you?")

print(response.text)