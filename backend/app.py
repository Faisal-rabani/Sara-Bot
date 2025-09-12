from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import os
from dotenv import load_dotenv

load_dotenv()  # <-- add this

app = Flask(__name__)
CORS(app)

API_KEY = os.getenv("OPENROUTER_API_KEY")  
API_URL = "https://openrouter.ai/api/v1/chat/completions"

@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Flask backend is running. Use POST /chat to talk to the AI."})

@app.route("/chat", methods=["POST"])
def chat():
    user_message = request.json.get("message", "")

    headers = {
        "Authorization": f"Bearer {API_KEY}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost",
        "X-Title": "Jarvis Assistant"
    }

    payload = {
        "model": "deepseek/deepseek-r1-0528:free",
        "messages": [{"role": "user", "content": user_message}]
    }

    response = requests.post(API_URL, headers=headers, json=payload)

    if response.status_code != 200:
        return jsonify({
            "error": "AI API request failed",
            "details": response.text
        }), 500

    return jsonify(response.json())

if __name__ == "__main__":
    app.run(port=5000, debug=True)
