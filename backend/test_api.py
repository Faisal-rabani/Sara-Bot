import os
import requests
import json
from dotenv import load_dotenv

load_dotenv()

API_KEY = os.getenv('OPENROUTER_API_KEY')
print(f"API Key loaded: {bool(API_KEY)}")
print(f"API Key (first 20 chars): {API_KEY[:20] if API_KEY else 'None'}")

if not API_KEY:
    print("ERROR: No API key found!")
    exit(1)

# Test the API
url = 'https://openrouter.io/api/v1/chat/completions'
headers = {
    'Authorization': f'Bearer {API_KEY}',
    'Content-Type': 'application/json',
    'HTTP-Referer': 'http://localhost:5173',
    'X-Title': 'Sara Bot'
}

payload = {
    'model': 'mistralai/mistral-nemo:free',
    'messages': [{'role': 'user', 'content': 'Hello, say hi back'}],
    'temperature': 0.7,
    'max_tokens': 100,
    'stream': False
}

print("\nTesting API connection...")
print(f"URL: {url}")
print(f"Headers: {headers}")
print(f"Payload: {json.dumps(payload, indent=2)}")

try:
    response = requests.post(url, headers=headers, json=payload, timeout=30)
    print(f"\nResponse Status: {response.status_code}")
    print(f"Response Headers: {dict(response.headers)}")
    print(f"Response Body: {response.text}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"\nSUCCESS! API is working!")
        print(f"Response: {json.dumps(data, indent=2)}")
    else:
        print(f"\nERROR! Status code: {response.status_code}")
        print(f"Error: {response.text}")
except Exception as e:
    print(f"\nERROR! Connection failed: {str(e)}")
    import traceback
    traceback.print_exc()
