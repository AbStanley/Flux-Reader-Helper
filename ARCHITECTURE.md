# High-Level Architecture: The "Self-Hosted Cloud"

This project is architected as a **Personal Cloud Platform**. It is designed to run entirely on the user's local machine (or a private server) while offering a cloud-like experience (API persistence, AI services) to the frontend.

## 🏗️ System Overview

```mermaid
graph TD
    subgraph "Frontend Layer (Browser)"
        UI[React Client]
        Ext[Chrome Extension (Future)]
    end

    subgraph "Backend Layer (NestJS)"
        API[API Gateway (Port 3000)]
        Auth[Auth Guard]
        Proxy[AI Proxy Service]
    end

    subgraph "Infrastructure Layer (Docker)"
        DB[(PostgreSQL)]
        Ollama[[Ollama AI Engine]]
    end

    UI -->|HTTP/REST| API
    Ext -->|HTTP/REST| API
    
    API -->|Read/Write| DB
    API --> Auth
    API -->|Stream| Proxy
    
    Proxy -->|Generate| Ollama
```

## 🧩 Components

### 1. Monorepo Structure
We use **NPM Workspaces** to manage multiple applications in a single repository.
-   `apps/client`: The Frontend application (Vite + React).
-   `apps/server`: The Backend API (NestJS).

### 2. Apps

#### **Client (`@reader-helper/client`)**
-   **Unexpected Design**: It thinks it's talking to a real cloud API, but it's just `localhost:3000`.
-   **Tech**: React 19, Tailwind, Zustand, Lucide React.
-   **Responsibility**: User Interface, Tokenization of text, Audio Playback.

#### **Server (`@reader-helper/server`)**
-   **The Brain**: Centralizes logic that requires persistence or heavy compute access.
-   **Tech**: NestJS, Prisma ORM, Express.
-   **Responsibility**:
    -   **Persistence**: Saves "Words", "Decks", and "User Progress" to Postgres.
    -   **AI Proxying**: Hides the complexity of Ollama. Checks logic, logs usage, and streams responses back to the client.
    -   **CORS**: Handles security policies for the frontend.

### 3. Data & AI

#### **PostgreSQL**
-   **Role**: Primary Source of Truth.
-   **Access**: Through Prisma ORM only.

#### **Ollama**
-   **Role**: The Intelligence Engine.
-   **Access**: Hidden behind the NestJS Proxy. The frontend *never* talks to Ollama directly. This allows us to swap Ollama for OpenAI/Anthropic in the future without updating the client.
