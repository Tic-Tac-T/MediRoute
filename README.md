<<<<<<< HEAD
# 🏥 MediRoute — AI Healthcare Triage Assistant

MediRoute is an AI-powered triage system that helps users decide whether to:
- 🟢 Manage symptoms at home (self-care)
- 🟡 Visit a clinic
- 🔴 Seek emergency medical attention

Built with a hybrid approach combining **AI reasoning + rule-based safety checks**, making it more reliable for healthcare use cases.

---

## 🚀 Features

- 🧠 AI-based symptom analysis
- ⚠️ Emergency keyword detection (rule-based override)
- 📊 Structured triage output:
  - Severity (low / medium / high)
  - Recommended action
  - Reasoning
- 🎨 Clean UI with color-coded results
- 🔄 Real-time frontend-backend communication

---

## 🏗️ Tech Stack

**Frontend**
- React (Vite)
- CSS

**Backend**
- Node.js
- Express

**AI Layer**
- LLM API (Claude / Groq / OpenAI)

---

## ⚙️ How It Works

1. User enters:
   - Symptoms
   - Age
   - Duration

2. Backend processing:
   - Rule-based safety check (critical symptoms)
   - AI model evaluates severity

3. Output:
   ```json
   {
     "severity": "low | medium | high",
     "action": "self-care | clinic | emergency",
     "reason": "explanation"
   }
=======
# 🏥 MediRoute — AI Health Triage

An AI-powered medical triage assistant built for rural India.
Describe your symptoms and get an instant recommendation: self-care, clinic, or emergency.

---

## Project Structure

```
mediroute/
├── backend/
│   ├── server.js          ← Express API server
│   ├── package.json
│   └── .env.example       ← Copy to .env and add your API key
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        └── styles.css
```

---

## Setup Instructions

### Prerequisites
- Node.js 18+ installed (https://nodejs.org)
- A Claude API key from https://console.anthropic.com

---

### Step 1 — Clone / Download the project

If you downloaded a ZIP, extract it.
Open the `mediroute/` folder in VS Code.

---

### Step 2 — Set up the Backend

Open a terminal in VS Code (`Ctrl + `` ` ``).

```bash
cd backend
npm install
```

Create your `.env` file:

```bash
# On Mac/Linux:
cp .env.example .env

# On Windows (Command Prompt):
copy .env.example .env
```

Open `.env` and replace `your_claude_api_key_here` with your real Claude API key:

```
CLAUDE_API_KEY=sk-ant-api03-xxxxxxxxxxxxxxxxxxxx
PORT=5000
```

Start the backend server:

```bash
npm run dev
```

You should see:
```
MediRoute backend running on http://localhost:5000
```

---

### Step 3 — Set up the Frontend

Open a **second terminal** in VS Code (`Ctrl + Shift + `` ` ``).

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
```

---

### Step 4 — Open the App

Go to: **http://localhost:3000**

The frontend proxies `/triage` calls to `http://localhost:5000` automatically via `vite.config.js`.

---

## API Reference

### POST /triage

**Request body:**
```json
{
  "symptoms": "I have had a fever and sore throat for 2 days",
  "age": "28",
  "duration": "1–2 days"
}
```

**Response:**
```json
{
  "severity": "medium",
  "action": "clinic",
  "reason": "Your symptoms suggest a mild to moderate infection..."
}
```

**Severity override (safety layer):**
If symptoms include: `chest pain`, `breathing difficulty`, `unconscious`, etc.
→ API returns `high` / `emergency` immediately without calling Claude.

---

## Tech Stack

| Layer    | Technology              |
|----------|-------------------------|
| Frontend | React 18 + Vite         |
| Backend  | Node.js + Express       |
| AI       | Claude API (Anthropic)  |
| Styling  | Vanilla CSS             |

---

## Troubleshooting

**"Something went wrong" error in the UI**
- Check the backend terminal for error messages
- Make sure your `.env` file has the correct API key
- Make sure the backend is running on port 5000

**`npm install` fails**
- Update Node.js to version 18 or higher

**Port already in use**
- Change `PORT=5000` in `.env` and update `vite.config.js` proxy target to match

---

Built for Technophilia Hackathon 2026
College of Vocational Studies, University of Delhi
>>>>>>> a8be29d (Initial commit - MediRoute AI triage app)
