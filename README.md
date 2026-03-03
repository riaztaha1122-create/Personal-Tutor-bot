# Personal Tutor Bot

Personal Tutor Bot is a beginner‑friendly AI tutor that explains concepts step‑by‑step in plain language.  
It supports **Math, Physics, English, and Urdu**, and runs as a simple web app with a Node/Express backend and an OpenAI‑powered assistant.

The chatbot UI is inspired by modern chat apps (light/dark modes, typing‑like streaming, message bubbles, and a subtle emoji background).

---

## Features

- **AI “Personal Tutor” assistant**
  - Explains topics in Math, Physics, English, and Urdu.
  - Uses clear structure: headings, bullet points, examples, and formulas in plain text.
  - Avoids LaTeX noise so answers stay readable.

- **Modern chat UI**
  - Light and dark themes with a toggle button.
  - User and assistant message bubbles with avatars.
  - Streaming responses (text appears progressively, token‑by‑token).
  - Subtle emoji wallpaper in the page background.

- **Secure configuration**
  - OpenAI API key is loaded from `.env` (not committed to Git).
  - `.gitignore` excludes `node_modules` and secrets by default.

---

## Tech Stack

- **Frontend:** Vanilla HTML, CSS, and JavaScript (`Frontend/index.html`)
- **Backend:** Node.js, Express (`Backend/Server.js`)
- **AI:** OpenAI Chat Completions API via `openai` Node SDK

---

## Project Structure

```txt
Backend/
  Server.js        # Express API + OpenAI streaming endpoint
  package.json     # Backend dependencies and scripts
  .env             # OPENAI_API_KEY (not committed)

Frontend/
  index.html       # Single‑page chat UI

.gitignore         # Ignores node_modules, .env, logs, etc.
README.md          # Project documentation
```

---

## Prerequisites

- **Node.js** (v18+ recommended)
- **npm** (comes with Node)
- An **OpenAI API key** with access to the `gpt-4o-mini` (or compatible) model

---

## Setup & Installation

1. **Clone or download the project**

   ```bash
   git clone https://github.com/<your-username>/Personal-Tutor-bot.git
   cd "Personal-Tutor-bot/Backend"
   ```

2. **Install backend dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   In the `Backend` folder, create a `.env` file if it does not exist, and add:

   ```env
   OPENAI_API_KEY=sk-...your_real_key_here...
   ```

   > Never commit your `.env` file. It is already ignored by `.gitignore`.

4. **Start the backend server**

   From the `Backend` directory:

   ```bash
   npm start
   ```

   You should see:

   ```txt
   Server running at http://localhost:5000
   ```

5. **Open the frontend**

   - Option 1: Open `Frontend/index.html` directly in your browser (double‑click or “Open With > Browser”).
   - Option 2 (recommended): Serve it via a simple static server (for example, using VS Code Live Server or `npx serve` from the project root).

   Once opened, you can start chatting with your Personal Tutor.

---

## How It Works

### 1. Backend (Express + OpenAI)

- `POST /chat`  
  Standard (non‑streaming) chat completion endpoint that:
  - Builds a structured prompt with a **system message** describing the Personal Tutor behavior.
  - Sends the full conversation history to the OpenAI Chat Completions API.
  - Returns the assistant reply as JSON.

- `POST /chat-stream`  
  Streaming endpoint used by the frontend:
  - Calls OpenAI with `stream: true`.
  - Writes each `delta.content` chunk directly to the HTTP response.
  - The frontend reads this stream and gradually updates the assistant bubble (typing effect).

Environment variables are loaded via `dotenv`, and the OpenAI client is initialized with `OPENAI_API_KEY` from `.env`.

### 2. Frontend (chat UI)

- Renders:
  - Header with bot avatar and theme toggle.
  - Initial welcome message.
  - Scrollable messages area with user + assistant bubbles.
  - Text area + Send button.

- Sends user messages to `/chat-stream`:
  - Press **Enter** to send, **Shift+Enter** for a new line.
  - Shows streaming assistant replies, using `fetch` + `ReadableStream` + `TextDecoder`.

- Renders assistant content as Markdown:
  - Uses `marked` to parse Markdown.
  - Uses `DOMPurify` to sanitize HTML and prevent XSS.

- Theme:
  - Light/dark colors driven by CSS variables (`:root` + `body.dark`).
  - Theme preference stored in `localStorage`.

---

## Running in Development

1. Start backend:

   ```bash
   cd Backend
   npm start
   ```

2. Open the frontend:

   - Open `Frontend/index.html` directly, or
   - Serve `Frontend` with a static server.

3. Make changes:

   - **Frontend UI:** edit `Frontend/index.html` (CSS and JS are inline).
   - **Backend behavior:** edit `Backend/Server.js` (prompt, model, ports, etc.).

---

## Deployment Notes

This project is currently structured for **local development**. To deploy it:

- Host the backend (Express app) on a Node‑friendly platform (Render, Railway, Fly.io, etc.).
- Update the frontend `fetch` URL (currently `http://localhost:5000/chat-stream`) to your deployed backend URL.
- Make sure the `OPENAI_API_KEY` is provided as an environment variable in your hosting provider (never hard‑code keys in the repo).

---

## Security & Best Practices

- **Never commit API keys** or `.env` files.
- Regenerate your OpenAI key immediately if you suspect it has been exposed.
- Use rate limits or simple auth on the backend before exposing it publicly.

---

## License

This project is currently unlicensed (default “all rights reserved”).  
You may adapt or extend it for your personal learning; for any other use, please add an explicit license file (for example, MIT) according to your needs.

