import os
import requests
from dotenv import load_dotenv

load_dotenv()

def ask_openai(prompt):
    api_key = os.getenv("OPENAI_API_KEY")
    url = "https://openrouter.ai/api/v1"

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": "mistralai/mistral-nemo:free",
        "messages": [
            {"role": "user", "content": prompt}
        ]
    }

    try:
        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data['choices'][0]['message']['content']
    except requests.exceptions.HTTPError:
        return f"HTTP Error: {response.text}"
    except Exception as e:
        return f"General Error: {e}"
