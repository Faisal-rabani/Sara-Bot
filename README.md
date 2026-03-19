# Sara Bot - Vibe Coding Agent

A full-stack AI chatbot application that intelligently routes questions to the best AI models. Sara Bot uses **Google Gemini** for general chat and **OpenAI ChatGPT** for coding tasks, with instant math calculations powered by Python.

## 🎯 Features

### Core Functionality
- **Smart Model Routing** - Automatically selects the best AI model based on question type
- **Manual Model Selection** - Choose between Gemini, ChatGPT, or Auto Rotate mode
- **Model Comparison** - Compare side-by-side responses from Gemini and ChatGPT
- **Instant Math** - Calculate math expressions instantly without API calls
- **Chat History** - All conversations saved in browser local storage
- **Export Chats** - Download chat sessions as markdown files

### UI/UX
- **Dark Theme** - Modern dark interface with purple accents
- **Purple User Messages** - User messages highlighted in purple on the right
- **Real-time Streaming** - AI responses stream word-by-word as they arrive
- **Code Highlighting** - Syntax highlighting for code blocks with copy button
- **Responsive Design** - Works on desktop and tablet devices
- **Keyboard Shortcuts** - Ctrl+K for new chat, Ctrl+E to export

## 📁 Project Structure

```
sara-bot/
├── backend/
│   ├── app.py                 # Flask server, all API routes
│   ├── requirements.txt        # Python dependencies
│   └── .env                   # API keys (Gemini, OpenAI)
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Sidebar.jsx           # Chat history list
│   │   │   ├── Header.jsx            # App title, compare button
│   │   │   ├── ChatArea.jsx          # Message display area
│   │   │   ├── Message.jsx           # Single message bubble
│   │   │   ├── InputArea.jsx         # Chat input, model selector
│   │   │   └── CompareModal.jsx      # Model comparison modal
│   │   ├── utils/
│   │   │   └── storage.js            # LocalStorage functions
│   │   ├── App.jsx                   # Main app component
│   │   ├── main.jsx                  # React entry point
│   │   └── index.css                 # Tailwind styles
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
│
├── README.md                  # This file
├── SETUP.md                   # Installation instructions
└── .gitignore
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Python 3.8+
- Google Gemini API key
- OpenAI API key (optional, for ChatGPT features)

### Installation

1. **Clone the repository**
```bash
git clone <repo-url>
cd sara-bot
```

2. **Setup Backend**
```bash
cd backend
pip install -r requirements.txt
```

3. **Setup Frontend**
```bash
cd frontend
npm install
```

4. **Configure API Keys**
Create `backend/.env`:
```
GEMINI_API_KEY=your_gemini_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

### Running the Application

**Terminal 1 - Backend:**
```bash
cd backend
python app.py
```
Backend runs on `http://localhost:5000`

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```
Frontend runs on `http://localhost:5175`

Open your browser to `http://localhost:5175`

## 🎮 How to Use

### Model Selection
Click the model selector button (left of chat input) to choose:
- **🔄 Auto Rotate** - Smart routing (coding → ChatGPT, general → Gemini)
- **✨ Gemini** - Always use Google Gemini
- **🤖 ChatGPT** - Always use OpenAI

### Compare Models
1. Click "Compare Models" button in header
2. Enter a prompt
3. Select two models to compare
4. View side-by-side responses

### Chat Features
- **New Chat** - Ctrl+K or click "New Chat" button
- **Export Chat** - Ctrl+E or click export icon on session
- **Delete Chat** - Hover over session and click trash icon
- **Code Copy** - Click copy button on code blocks

## 🔧 API Endpoints

### Chat Endpoint
```
POST /api/chat
Body: {
  message: string,
  messages: array,
  model_override: "auto" | "gemini" | "openai"
}
Response: Server-Sent Events stream
```

### Compare Endpoint
```
POST /api/compare
Body: {
  prompt: string,
  model1: "gemini" | "openai",
  model2: "gemini" | "openai"
}
Response: Server-Sent Events stream
```

### Health Check
```
GET /health
Response: { status: "ok", api_key_present: true }
```

## 🤖 Model Routing Logic

### Auto Rotate Mode
- **Coding Keywords**: code, write, function, class, react, javascript, python, java, component, api, debug, fix, error, bug, html, css, sql, database
  - Routes to: **OpenAI ChatGPT**
- **Everything Else**: General questions, explanations, chat
  - Routes to: **Google Gemini**
- **Math Expressions**: 2+2, 15% of 240, sqrt(144), 2^8
  - Calculated instantly with Python

### Manual Selection
- **Gemini**: Always uses Google Gemini API
- **ChatGPT**: Always uses OpenAI API

## 💾 Data Storage

All chat data is stored in browser **localStorage**:
- Chat sessions with full message history
- Session titles (auto-generated from first message)
- Message metadata (model used, response time, token count)
- Persists across page refreshes

## 🎨 Technology Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Lucide Icons** - Icon library

### Backend
- **Flask** - Web framework
- **Flask-CORS** - Cross-origin requests
- **Requests** - HTTP client
- **Python-dotenv** - Environment variables

### APIs
- **Google Gemini API** - General chat and explanations
- **OpenAI API** - Coding assistance
- **Python Math** - Instant calculations

## 📝 Environment Variables

### Backend (.env)
```
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
FLASK_ENV=development
```

## 🔐 Security Notes

- API keys stored in `.env` (never commit to git)
- `.gitignore` excludes sensitive files
- CORS enabled for localhost development
- No sensitive data stored in localStorage

## 🐛 Troubleshooting

### Backend won't start
- Check Python version: `python --version` (need 3.8+)
- Install dependencies: `pip install -r requirements.txt`
- Check port 5000 is available

### Frontend won't load
- Check Node version: `node --version` (need 16+)
- Install dependencies: `npm install`
- Clear npm cache: `npm cache clean --force`

### API responses are empty
- Verify API keys in `.env`
- Check backend logs for errors
- Test API directly: `curl http://localhost:5000/health`

### Chat not saving
- Check browser localStorage is enabled
- Clear browser cache and try again
- Check browser console for errors

## 📚 API Key Setup

### Google Gemini
1. Go to [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Create new API key
3. Add to `.env` as `GEMINI_API_KEY`

### OpenAI
1. Go to [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Create new API key
3. Ensure account has billing enabled
4. Add to `.env` as `OPENAI_API_KEY`

## 🚀 Deployment

### Frontend (Vercel/Netlify)
```bash
cd frontend
npm run build
# Deploy dist/ folder
```

### Backend (Heroku/Railway)
```bash
# Update requirements.txt
pip freeze > requirements.txt

# Deploy with Procfile
web: gunicorn app:app
```

## 📄 License

MIT License - feel free to use for personal or commercial projects

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📞 Support

For issues or questions:
- Check existing GitHub issues
- Create a new issue with details
- Include error messages and steps to reproduce

## 🎉 Credits

Built with ❤️ using React, Flask, and AI APIs

---

**Sara Bot v1.0** - Your AI-powered vibe coding agent
