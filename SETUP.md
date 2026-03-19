# Sara Bot - Setup Guide

Complete step-by-step instructions to get Sara Bot running on your machine.

## Prerequisites

Before you start, make sure you have:
- **Node.js** 16+ ([Download](https://nodejs.org/))
- **Python** 3.8+ ([Download](https://www.python.org/))
- **Git** ([Download](https://git-scm.com/))
- **Google Gemini API Key** ([Get here](https://aistudio.google.com/app/apikeys))
- **OpenAI API Key** ([Get here](https://platform.openai.com/account/api-keys))

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd sara-bot
```

### 2. Backend Setup

Navigate to backend folder:
```bash
cd backend
```

Install Python dependencies:
```bash
pip install -r requirements.txt
```

Create `.env` file with your API keys:
```bash
# On Windows
echo GEMINI_API_KEY=your_key_here > .env
echo OPENAI_API_KEY=your_key_here >> .env

# On Mac/Linux
cat > .env << EOF
GEMINI_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
EOF
```

### 3. Frontend Setup

Navigate to frontend folder:
```bash
cd ../frontend
```

Install Node dependencies:
```bash
npm install
```

## Running the Application

### Start Backend (Terminal 1)

```bash
cd backend
python app.py
```

You should see:
```
[START] Sara Bot Backend
[START] Using Google Gemini for chat
[START] Using OpenAI for coding (if available)
 * Running on http://127.0.0.1:5000
```

### Start Frontend (Terminal 2)

```bash
cd frontend
npm run dev
```

You should see:
```
  VITE v4.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5175/
```

### Open in Browser

Go to: **http://localhost:5175**

## Getting API Keys

### Google Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikeys)
2. Click "Create API Key"
3. Copy the key
4. Add to `backend/.env` as `GEMINI_API_KEY`

### OpenAI API Key

1. Go to [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Click "Create new secret key"
3. Copy the key
4. Make sure your account has billing enabled
5. Add to `backend/.env` as `OPENAI_API_KEY`

## Troubleshooting

### Backend Issues

**Error: "ModuleNotFoundError: No module named 'flask'"**
```bash
pip install -r requirements.txt
```

**Error: "Port 5000 already in use"**
```bash
# Find process using port 5000
lsof -i :5000  # Mac/Linux
netstat -ano | findstr :5000  # Windows

# Kill the process
kill -9 <PID>  # Mac/Linux
taskkill /PID <PID> /F  # Windows
```

**Error: "Invalid API key"**
- Check `.env` file has correct keys
- Verify keys are not expired
- Make sure OpenAI account has billing enabled

### Frontend Issues

**Error: "npm: command not found"**
- Install Node.js from https://nodejs.org/

**Error: "Port 5175 already in use"**
```bash
# Kill process on port 5175
lsof -i :5175  # Mac/Linux
netstat -ano | findstr :5175  # Windows
```

**Error: "Cannot find module"**
```bash
npm install
npm cache clean --force
```

### General Issues

**Chat not responding**
1. Check backend is running on http://localhost:5000
2. Check browser console for errors (F12)
3. Check backend logs for error messages
4. Verify API keys in `.env`

**Chat history not saving**
1. Check browser localStorage is enabled
2. Clear browser cache
3. Check browser console for errors

## Project Structure

```
sara-bot/
├── backend/
│   ├── app.py              # Main Flask app
│   ├── router.py           # Message routing logic
│   ├── math_engine.py      # Math calculations
│   ├── requirements.txt    # Python dependencies
│   └── .env               # API keys (create this)
│
├── frontend/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── utils/         # Helper functions
│   │   ├── App.jsx        # Main app
│   │   └── index.css      # Styles
│   ├── package.json
│   └── vite.config.js
│
├── README.md              # Project overview
└── SETUP.md              # This file
```

## Next Steps

1. **Explore the UI** - Try different questions
2. **Test Model Selection** - Click model selector to try different models
3. **Compare Models** - Click "Compare Models" to see side-by-side responses
4. **Export Chats** - Use Ctrl+E to export conversations
5. **Read README.md** - For more detailed documentation

## Support

If you encounter issues:
1. Check this SETUP.md file
2. Check README.md for more info
3. Check browser console (F12) for errors
4. Check backend logs for error messages

## Development

### Useful Commands

**Backend**
```bash
# Run with debug mode
python app.py

# Run tests
python -m pytest
```

**Frontend**
```bash
# Development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Deployment

See README.md for deployment instructions to Vercel, Netlify, Heroku, etc.

---

**Happy coding with Sara Bot!** 🚀
