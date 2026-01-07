# Reader Helper (Flux)

**Flux** is a premium, privacy-focused reading assistant application designed to bridge the gap between language learning and fluent reading. It leverages **Self-Hosted AI** to provide instant key-value translations, context-aware insights, and a natural audio reading experience, all running locally on your machine.

> [!NOTE]
> This project is a **Monorepo** containing both the React Frontend and the NestJS Backend.

## ✨ Core Features

### 🧠 Smart Reader
The core reading engine allows for deep interaction with text:
- **Interactive Tokenization**: Text is processed into interactive tokens, allowing users to select individual words or phrases.
- **Context-Aware Dictionary**: Hover over any word to see a translation that considers the surrounding sentence context, not just the isolated definition.
- **Streaming Generation**: Generate custom reading material with AI, featuring real-time streaming feedback (NDJSON).

### 🔊 Audio Experience
A fully integrated text-to-speech system designed for learners:
- **Neural TTS**: Utilizes the browser's best available voices for natural speech.
- **Karaoke Highlighting**: Words are highlighted in real-time as they are spoken, aiding in pronunciation and tracking.
- **Smart Resume**: Playback remembers your position. If paused or stopped, it resumes intelligently from the start of the last spoken sentence or word.

### 🛡️ Privacy & Local AI
Flux is built to run entirely offline (after setup) using **Ollama**:
- **Zero Data Leakage**: All translations and text generation happen on your local machine via the Backend Proxy.
- **Cost Efficient**: No API keys or usage fees.

---

## 🚀 Getting Started

### 1. Prerequisites
-   **Node.js**: v18+
-   **Docker**: Required for the PostgreSQL database.
-   **Ollama**: Installed locally/networked. Run `ollama serve` and pull your models.

### 2. Installation & Run
We use **NPM Workspaces** to manage the full stack from the root directory.

```bash
# 1. Install Dependencies (Frontend + Backend)
npm install

# 2. Start Infrastructure (Postgres)
# (In a separate terminal)
docker compose up -d postgres

# 3. Setup Database
npx prisma migrate dev --schema=apps/server/prisma/schema.prisma

# 4. Start Development (Both Apps)
npm run dev
```

The platform will be available at:
-   **Frontend**: `http://localhost:5173`
-   **Backend API**: `http://localhost:3000`
-   **Prisma Studio**: `http://localhost:5555` (View your data)

---

## 🏗 Technical Architecture

Flux is architected as a **"Self-Hosted Cloud"**.

### The Hybrid Monorepo
-   **`apps/client`**: A React 19 application (Vite). It handles the UI, text rendering, and audio orchestration. To the user, it feels like a native app.
-   **`apps/server`**: A NestJS Backend. It acts as the "Brain" and Proxy. It connects to the database for saving words/decks and proxies requests to Ollama to manage AI interactions secureley.

### Tech Stack
-   **Frontend**: React 19, TypeScript, Tailwind CSS, Zustand, Framer Motion.
-   **Backend**: NestJS, prisma (ORM), Express.
-   **Database**: PostgreSQL (Dockerized).
-   **AI**: Ollama (Local LLM).

---

## 📂 Project Structure

```bash
/
├── apps/
│   ├── client/       # The Frontend Web App
│   └── server/       # The Backend API & Proxy
├── docker-compose.yml # Infrastructure (DB)
└── README.md          # This file
```

For deep architectural details, see [ARCHITECTURE.md](./ARCHITECTURE.md).
