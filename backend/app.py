from flask import Flask, request, Response, jsonify
from flask_cors import CORS
import os
import json
from dotenv import load_dotenv
import time

# Import routing and math functions
from router import route_message, call_gemini_api, call_openai_api
from math_engine import is_math_expression, calculate_math

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Verify API keys are loaded
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

if not GEMINI_API_KEY:
    print("[WARNING] GEMINI_API_KEY not found in .env file")
if not OPENAI_API_KEY:
    print("[WARNING] OPENAI_API_KEY not found in .env file")

@app.route('/api/chat', methods=['POST'])
def chat():
    """Main chat endpoint"""
    try:
        data = request.json
        user_message = data.get('message', '')
        messages = data.get('messages', [])
        model_override = data.get('model_override', 'auto')
        
        print(f"\n[REQUEST] Message: {user_message}")
        print(f"[REQUEST] Model override: {model_override}")
        
        if not user_message:
            return jsonify({'error': 'No message provided'}), 400
        
        # Check if it's a math expression
        if is_math_expression(user_message):
            print(f"[MATH] Detected as math")
            result = calculate_math(user_message)
            if result:
                print(f"[MATH] Result: {result}")
                response_text = f"data: {json.dumps({'type': 'content', 'data': result})}\n\n"
                response_text += f"data: {json.dumps({'type': 'metadata', 'model': '', 'task_type': '', 'response_time': 0, 'token_count': 0})}\n\n"
                return Response(response_text, mimetype='text/event-stream')
        
        def generate():
            """Generator for response"""
            try:
                # Prepare messages with system prompt for coding
                api_messages = messages.copy()
                
                # Add system prompt if it's a coding question
                from router import is_coding_question
                if is_coding_question(user_message):
                    system_prompt = "You are a helpful coding assistant. When providing code, always wrap it in triple backticks with the language name. Example: ```python\ncode here\n```"
                    api_messages = [{'role': 'system', 'content': system_prompt}] + api_messages
                
                api_messages.append({'role': 'user', 'content': user_message})
                
                # Route message to appropriate model
                content, model_used, response_time = route_message(user_message, messages, model_override)
                
                if content:
                    print(f"[RESPONSE] Success! Content length: {len(content)}")
                    yield f"data: {json.dumps({'type': 'content', 'data': content})}\n\n"
                else:
                    print(f"[RESPONSE] No content from API")
                    error_msg = "Sorry, I couldn't get a response from the API. Please try again."
                    yield f"data: {json.dumps({'type': 'content', 'data': error_msg})}\n\n"
                
                # Format model name for display
                model_display = 'ChatGPT' if model_used == 'openai' else 'Gemini'
                
                metadata = {
                    'type': 'metadata',
                    'model': model_display,
                    'task_type': '',
                    'response_time': response_time,
                    'token_count': len(content.split()) if content else 0
                }
                
                print(f"[RESPONSE] Metadata: {metadata}")
                yield f"data: {json.dumps(metadata)}\n\n"
                
            except Exception as e:
                print(f"[ERROR] Exception: {str(e)}")
                import traceback
                traceback.print_exc()
                yield f"data: {json.dumps({'type': 'error', 'data': str(e)})}\n\n"
        
        return Response(generate(), mimetype='text/event-stream')
        
    except Exception as e:
        print(f"[ERROR] Chat error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'api_key_present': True})

@app.route('/api/compare', methods=['POST'])
def compare():
    """Compare two models side-by-side"""
    try:
        data = request.json
        prompt = data.get('prompt', '')
        model1 = data.get('model1', 'gemini')
        model2 = data.get('model2', 'openai')
        
        print(f"\n[COMPARE] Prompt: {prompt}")
        print(f"[COMPARE] Model 1: {model1}, Model 2: {model2}")
        
        if not prompt:
            return jsonify({'error': 'No prompt provided'}), 400
        
        def generate():
            """Generator for comparison"""
            # Add system prompt to ensure code is formatted with code blocks
            system_prompt = "You are a helpful coding assistant. When providing code, always wrap it in triple backticks with the language name. Example: ```python\ncode here\n```"
            messages = [
                {'role': 'system', 'content': system_prompt},
                {'role': 'user', 'content': prompt}
            ]
            
            # Get response from model 1
            print(f"[COMPARE] Getting response from {model1}")
            yield f"data: {json.dumps({'type': 'model1_start'})}\n\n"
            
            if model1 == 'openai':
                content1 = call_openai_api(messages)
            else:
                content1 = call_gemini_api(messages)
            
            if content1:
                print(f"[COMPARE] Model 1 response: {content1[:100]}")
                yield f"data: {json.dumps({'type': 'model1_content', 'data': content1})}\n\n"
            else:
                print(f"[COMPARE] Model 1 returned no content")
                yield f"data: {json.dumps({'type': 'model1_content', 'data': 'No response from model'})}\n\n"
            
            # Get response from model 2
            print(f"[COMPARE] Getting response from {model2}")
            yield f"data: {json.dumps({'type': 'model2_start'})}\n\n"
            
            if model2 == 'openai':
                content2 = call_openai_api(messages)
            else:
                content2 = call_gemini_api(messages)
            
            if content2:
                print(f"[COMPARE] Model 2 response: {content2[:100]}")
                yield f"data: {json.dumps({'type': 'model2_content', 'data': content2})}\n\n"
            else:
                print(f"[COMPARE] Model 2 returned no content")
                yield f"data: {json.dumps({'type': 'model2_content', 'data': 'No response from model'})}\n\n"
        
        return Response(generate(), mimetype='text/event-stream')
        
    except Exception as e:
        print(f"[ERROR] Compare error: {str(e)}")
        import traceback
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print(f"[START] Sara Bot Backend")
    print(f"[START] Using Google Gemini for chat")
    print(f"[START] Using OpenAI for coding (if available)")
    print(f"[START] API keys loaded from .env file")
    app.run(debug=True, port=5000)
