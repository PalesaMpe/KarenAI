---
# Project Karen

Follow the instructions below to get both the frontend (FE) and backend (BE) running on your local machine.

---
## Frontend

Navigate to the frontend directory and run the following commands to install dependencies and start the development server.

**Prerequisite:** Ensure you have **Node version 20.20.2** installed on your system before proceeding.

### Setup Instructions

1. **Install dependencies:**
```bash
npm install
```


2. **Start the development server:**
```bash
npm run dev
```


## Backend

**Prerequisite:** Ensure you have **Python 3.11** installed on your system before proceeding.

### Setup Instructions

1. **Create a virtual environment:**
```bash
py -3.11 -m venv .venv
```


2. **Activate the virtual environment:**
* **On macOS/Linux:**
```bash
.venv/Scripts/activate
```


3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

Here are a few ways to rewrite that section, depending on how detailed you want it to be.

4. **Configure Environment Variables:**
The `LLMHandler` requires a GenAI API key
https://aistudio.google.com/api-keys

Create a `.env` file in the root of the backend directory and add your key:

```env
GENAI_API_KEY=your_api_key_here
```
