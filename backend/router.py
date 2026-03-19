"""
Task classification logic and model routing table
Routes messages to appropriate AI models based on content analysis
"""

import os
import requests
import json
import time

# Load API keys from environment
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

def classify_message(message):
    """Classify message type and return routing decision"""
    message_lower = message.lower()
    
    # Coding keywords
    coding_keywords = ['code', 'write', 'function', 'class', 'react', 'javascript', 
                      'python', 'java', 'component', 'api', 'debug', 'fix', 'error', 
                      'bug', 'html', 'css', 'sql', 'database', 'algorithm']
    
    # Math keywords
    math_keywords = ['calculate', 'solve', 'equation', 'formula', 'compute', 'math', 
                    'percent', 'sqrt', 'power', '+', '-', '*', '/', '%']
    
    # Check message type
    if any(keyword in message_lower for keyword in coding_keywords):
        return 'CODE'
    elif any(keyword in message_lower for keyword in math_keywords):
        return 'MATH'
    else:
        return 'CHAT'

def get_model_for_type(task_type, model_override='auto'):
    """Get appropriate model based on task type"""
    routing_table = {
        'CODE': 'openai',      # ChatGPT for coding
        'MATH': 'math',        # Python calculator
        'CHAT': 'gemini'       # Gemini for general chat
    }
    
    if model_override != 'auto':
        return model_override
    
    return routing_table.get(task_type, 'gemini')

def call_gemini_api(messages):
    """Call Google Gemini API for chat"""
    try:
        url = f'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={GEMINI_API_KEY}'
        
        # Convert messages to Gemini format
        contents = []
        for msg in messages:
            role = "user" if msg['role'] == 'user' else "model"
            contents.append({
                "role": role,
                "parts": [{"text": msg['content']}]
            })
        
        payload = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "maxOutputTokens": 1000
            }
        }
        
        print(f"[GEMINI] Calling Gemini API")
        print(f"[GEMINI] Messages count: {len(messages)}")
        
        response = requests.post(url, json=payload, timeout=60)
        
        print(f"[GEMINI] Status Code: {response.status_code}")
        print(f"[GEMINI] Response: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            if 'candidates' in data and len(data['candidates']) > 0:
                content = data['candidates'][0].get('content', {}).get('parts', [{}])[0].get('text', '')
                print(f"[GEMINI] Got content: {content[:100]}")
                return content
        else:
            print(f"[GEMINI] Error {response.status_code}: {response.text}")
            return None
            
    except Exception as e:
        print(f"[GEMINI] Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def call_openai_api(messages):
    """Call OpenAI API for coding tasks"""
    try:
        url = 'https://api.openai.com/v1/chat/completions'
        
        headers = {
            'Authorization': f'Bearer {OPENAI_API_KEY}',
            'Content-Type': 'application/json'
        }
        
        payload = {
            'model': 'gpt-3.5-turbo',
            'messages': messages,
            'temperature': 0.7,
            'max_tokens': 500
        }
        
        print(f"[OPENAI] Calling OpenAI API")
        print(f"[OPENAI] Messages count: {len(messages)}")
        
        response = requests.post(url, headers=headers, json=payload, timeout=60)
        
        print(f"[OPENAI] Status Code: {response.status_code}")
        print(f"[OPENAI] Response: {response.text[:500]}")
        
        if response.status_code == 200:
            data = response.json()
            if 'choices' in data and len(data['choices']) > 0:
                content = data['choices'][0].get('message', {}).get('content', '')
                print(f"[OPENAI] Got content: {content[:100]}")
                return content
        else:
            print(f"[OPENAI] Error {response.status_code}: {response.text}")
            return None
            
    except Exception as e:
        print(f"[OPENAI] Exception: {str(e)}")
        import traceback
        traceback.print_exc()
        return None

def is_coding_question(message):
    """Detect if message is a coding-related question"""
    coding_keywords = [
        'code', 'write', 'function', 'class', 'react', 'javascript', 
        'python', 'java', 'component', 'api', 'debug', 'fix', 'error', 
        'bug', 'html', 'css', 'sql', 'database', 'algorithm', 'loop',
        'variable', 'array', 'object', 'method', 'syntax', 'import',
        'export', 'module', 'library', 'framework', 'typescript', 'jsx',
        'node', 'express', 'django', 'flask', 'database', 'query'
    ]
    message_lower = message.lower()
    return any(keyword in message_lower for keyword in coding_keywords)

def route_message(user_message, messages, model_override='auto'):
    """
    Route message to appropriate model and get response
    Optimized to minimize OpenAI API calls (free plan quota)
    
    Returns: (content, model_used, response_time)
    """
    start_time = time.time()
    
    # Determine which model to use
    use_openai = False
    
    if model_override == 'auto':
        # Auto rotate: ONLY use OpenAI for coding questions to save quota
        is_coding = is_coding_question(user_message)
        use_openai = is_coding
        print(f"[ROUTER] Auto Rotate - Is coding: {is_coding}")
        print(f"[ROUTER] Using OpenAI: {use_openai} (to minimize free plan quota usage)")
    elif model_override == 'openai':
        # Force OpenAI
        use_openai = True
        print(f"[ROUTER] Forced OpenAI")
    else:
        # Force Gemini (default) - saves OpenAI quota
        use_openai = False
        print(f"[ROUTER] Forced Gemini (saves OpenAI quota)")
    
    # Prepare messages for API
    api_messages = messages + [{'role': 'user', 'content': user_message}]
    
    # Try OpenAI for coding, fallback to Gemini
    content = None
    model_used = 'gemini'
    
    if use_openai:
        print(f"[ROUTER] Attempting to use OpenAI for coding question")
        content = call_openai_api(api_messages)
        if content:
            model_used = 'openai'
            print(f"[ROUTER] OpenAI succeeded")
        else:
            print(f"[ROUTER] OpenAI failed, falling back to Gemini")
    
    # Fallback to Gemini if OpenAI fails or not coding
    if not content:
        print(f"[ROUTER] Using Gemini (reliable, no quota limits)")
        content = call_gemini_api(api_messages)
        model_used = 'gemini'
    
    elapsed_time = int((time.time() - start_time) * 1000)
    
    return content, model_used, elapsed_time
