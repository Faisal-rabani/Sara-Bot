# Sara Bot - Complete File Structure

## Project Directory Tree

```
sara-bot/
│
├── backend/
│   ├── app.py                    # Flask server, all API routes only
│   ├── router.py                 # Only task classification logic and model routing table
│   ├── math_engine.py            # Only Python math calculation logic, no AI involved
│   ├── .env                      # Contains GEMINI_API_KEY and OPENAI_API_KEY
│   └── requirements.txt          # flask, flask-cors, requests, python-dotenv
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx           # Chat history list, new chat button, delete button, export button
│   │   │   ├── Header.jsx            # App title, compare models button, active model indicator
│   │   │   ├── ChatArea.jsx          # Scrollable message list, welcome screen with suggestions
│   │   │   ├── Message.jsx           # Single message bubble, model badge, code highlighting, copy button
│   │   │   ├── InputArea.jsx         # Textarea, model override dropdown, send button
│   │   │   └── CompareModal.jsx      # Two model selector, shared prompt, side by side results
│   │   │
│   │   ├── utils/
│   │   │   └── storage.js            # All localStorage read and write functions for chat sessions
│   │   │
│   │   ├── App.jsx                   # Main state management, connects all components
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Tailwind imports only
│   │
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── README.md                     # Project overview, features, quick start
├── SETUP.md                      # Installation and setup instructions
├── FILE_STRUCTURE.md             # This file - complete file structure documentation
└── .gitignore                    # Git ignore rules
```

## File Descriptions

### Backend Files

#### `backend/app.py`
**Purpose:** Flask server with all API routes
**Responsibilities:**
- Initialize Flask app with CORS
- Define `/api/chat` endpoint (POST)
- Define `/api/compare` endpoint (POST)
- Define `/health` endpoint (GET)
- Handle streaming responses
- Call router and math_engine modules
- Call Gemini and OpenAI APIs

**Key Functions:**
- `chat()` - Main chat endpoint
- `compare()` - Model comparison endpoint
- `health()` - Health check endpoint

#### `backend/router.py`
**Purpose:** Task classification and model routing logic
**Responsibilities:**
- Classify incoming messages (CODE, MATH, CHAT)
- Determine which model to use based on classification
- Maintain routing table

**Key Functions:**
- `classify_message(message)` - Returns task type
- `get_model_for_type(task_type, override)` - Returns model name

#### `backend/math_engine.py`
**Purpose:** Pure Python math calculations (no AI)
**Responsibilities:**
- Detect math expressions
- Calculate results instantly
- Support: +, -, *, /, %, sqrt, power

**Key Functions:**
- `is_math_expression(text)` - Check if text is math
- `calculate_math(expression)` - Calculate and return result

#### `backend/.env`
**Purpose:** Environment variables
**Contains:**
```
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
```

#### `backend/requirements.txt`
**Purpose:** Python dependencies
**Contains:**
```
flask
flask-cors
requests
python-dotenv
```

### Frontend Files

#### `frontend/src/components/Sidebar.jsx`
**Purpose:** Chat history sidebar
**Features:**
- List of all chat sessions
- New Chat button
- Delete button (on hover)
- Export button (on hover)
- Message count per session
- Active session highlighting

#### `frontend/src/components/Header.jsx`
**Purpose:** Top navigation bar
**Features:**
- App title "Sara Bot"
- Subtitle "Vibe Coding Agent"
- Compare Models button
- Active model indicator

#### `frontend/src/components/ChatArea.jsx`
**Purpose:** Main chat display area
**Features:**
- Scrollable message list
- Welcome screen with suggestions
- Auto-scroll to latest message
- Loading indicator while waiting

#### `frontend/src/components/Message.jsx`
**Purpose:** Individual message bubble
**Features:**
- User messages in purple (right side)
- AI messages in dark gray (left side)
- Model badge (if available)
- Code syntax highlighting
- Copy button for code blocks
- Metadata display (time, tokens)

#### `frontend/src/components/InputArea.jsx`
**Purpose:** Chat input interface
**Features:**
- Textarea for message input
- Model selector dropdown (Auto Rotate, Gemini, ChatGPT)
- Send button
- Keyboard shortcuts (Enter to send, Shift+Enter for newline)
- Helper text

#### `frontend/src/components/CompareModal.jsx`
**Purpose:** Model comparison modal
**Features:**
- Modal overlay
- Prompt input textarea
- Model 1 selector (Gemini or ChatGPT)
- Model 2 selector (Gemini or ChatGPT)
- Side-by-side response display
- New Comparison button
- Close button

#### `frontend/src/utils/storage.js`
**Purpose:** LocalStorage management
**Functions:**
- `getSessions()` - Get all chat sessions
- `createSession()` - Create new session
- `getSession(id)` - Get specific session
- `updateSession(id, data)` - Update session
- `deleteSession(id)` - Delete session
- `addMessageToSession(id, message)` - Add message to session

#### `frontend/src/App.jsx`
**Purpose:** Main application component
**Responsibilities:**
- State management (sessions, active session, loading, model override)
- Handle message sending
- Handle session management
- Handle export functionality
- Keyboard shortcuts (Ctrl+K, Ctrl+E)
- Connect all components

#### `frontend/src/main.jsx`
**Purpose:** React entry point
**Contains:**
- React app initialization
- Root element mounting

#### `frontend/src/index.css`
**Purpose:** Global styles
**Contains:**
- Tailwind CSS imports
- Custom CSS variables
- Global styling

#### `frontend/index.html`
**Purpose:** HTML entry point
**Contains:**
- Root div for React
- Script tag for main.jsx

#### `frontend/package.json`
**Purpose:** Node dependencies and scripts
**Scripts:**
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

#### `frontend/vite.config.js`
**Purpose:** Vite configuration
**Contains:**
- React plugin setup
- Dev server configuration
- Build configuration

#### `frontend/tailwind.config.js`
**Purpose:** Tailwind CSS configuration
**Contains:**
- Dark theme colors
- Custom color palette
- Dark mode setup

### Root Files

#### `README.md`
**Purpose:** Project documentation
**Sections:**
- Features overview
- Project structure
- Quick start guide
- How to use
- API endpoints
- Technology stack
- Troubleshooting
- Deployment guide

#### `SETUP.md`
**Purpose:** Installation and setup guide
**Sections:**
- Prerequisites
- Installation steps
- Getting API keys
- Running the application
- Troubleshooting
- Development commands

#### `FILE_STRUCTURE.md`
**Purpose:** This file - complete file structure documentation

#### `.gitignore`
**Purpose:** Git ignore rules
**Contains:**
```
node_modules/
__pycache__/
*.pyc
.env
.DS_Store
dist/
build/
```

## File Dependencies

### Backend Dependencies
```
app.py
├── router.py (imports classify_message, get_model_for_type)
├── math_engine.py (imports is_math_expression, calculate_math)
├── .env (loads API keys)
└── External APIs (Gemini, OpenAI)
```

### Frontend Dependencies
```
App.jsx (main component)
├── Sidebar.jsx
├── Header.jsx
├── ChatArea.jsx
│   └── Message.jsx
├── InputArea.jsx
└── CompareModal.jsx

utils/storage.js (used by App.jsx)
```

## API Endpoints

### POST /api/chat
**Request:**
```json
{
  "message": "string",
  "messages": [{"role": "user", "content": "string"}],
  "model_override": "auto|gemini|openai"
}
```

**Response:** Server-Sent Events stream
```
data: {"type": "content", "data": "response text"}
data: {"type": "metadata", "model": "", "task_type": "", "response_time": 0, "token_count": 0}
```

### POST /api/compare
**Request:**
```json
{
  "prompt": "string",
  "model1": "gemini|openai",
  "model2": "gemini|openai"
}
```

**Response:** Server-Sent Events stream
```
data: {"type": "model1_start"}
data: {"type": "content", "data": "model1 response"}
data: {"type": "model2_start"}
data: {"type": "content", "data": "model2 response"}
```

### GET /health
**Response:**
```json
{
  "status": "ok",
  "api_key_present": true
}
```

## Environment Setup

### Backend .env
```
GEMINI_API_KEY=your_gemini_key
OPENAI_API_KEY=your_openai_key
FLASK_ENV=development
```

### Frontend .env (optional)
```
VITE_API_URL=http://localhost:5000
```

## Development Workflow

1. **Backend Development**
   - Edit `backend/app.py` for routes
   - Edit `backend/router.py` for routing logic
   - Edit `backend/math_engine.py` for math calculations
   - Restart Flask server

2. **Frontend Development**
   - Edit components in `frontend/src/components/`
   - Edit utilities in `frontend/src/utils/`
   - Edit main app in `frontend/src/App.jsx`
   - Vite hot-reloads automatically

3. **Testing**
   - Test backend: `curl http://localhost:5000/health`
   - Test frontend: Open `http://localhost:5175`
   - Check browser console for errors
   - Check backend logs for errors

## Build & Deployment

### Frontend Build
```bash
cd frontend
npm run build
# Creates dist/ folder for deployment
```

### Backend Deployment
```bash
# Create Procfile for Heroku
web: gunicorn app:app

# Update requirements.txt
pip freeze > requirements.txt
```

---

**Total Files:** 25+ files organized in a clean, modular structure
**Backend:** 5 files (app.py, router.py, math_engine.py, .env, requirements.txt)
**Frontend:** 13 files (6 components, 1 util, 3 config, 3 entry points)
**Documentation:** 3 files (README.md, SETUP.md, FILE_STRUCTURE.md)
**Config:** 1 file (.gitignore)
