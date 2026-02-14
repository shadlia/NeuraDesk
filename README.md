# NeuraDesk : Personal Knowledge & Productivity Assistant


> **Evolving AI-powered assistant for organizing knowledge, automating tasks, and multimodal reasoning**

---

## Project Overview
**Goal:** Build a personal AI assistant that helps users:  
- **Remember everything:** Smart memory for user facts, preferences, and conversation history
- Organize knowledge from documents, notes, websites, images, and emails  
- Search and summarize information efficiently  
- Automate repetitive tasks (web forms, reminders, data extraction)  
- Gradually evolve into a multimodal, fine-tuned, deployed agent

**Key Features:**  
- **Smart Context:** Long-term memory and user awareness
- Multi-format ingestion (PDF, HTML, images, video, audio)  
- RAG (Retrieval-Augmented Generation) for searching knowledge  
- Agents that perform tasks using tools and automation  
- Optional fine-tuning for domain-specific knowledge  
- Web + API deployment for real-world usability  

---

## Current Progress

**Status:** Phase 2 - Memory & Context (Active)  
**Last Updated:** February 14, 2026

### ✅ Completed Milestones
- [x] **Core Backend:** FastAPI + Gemini 2.0 Flash + LangChain
- [x] **Observability:** Langfuse integration for full trace monitoring
- [x] **Frontend:** React + Vite + Tailwind + Modern UI/UX
- [x] **Authentication:** Supabase Auth (Email/OTP) + Protected Routes
- [x] **Memory Management System:**
  - [x] **Smart Classifier:** LLM-based classification including **Project Milestones** & **Skills**.
  - [x] **Entity Resolution:** Intelligently links updates to existing projects (e.g., "frontend done" -> linked to *Project NeuraDesk*).
  - [x] **Auto-Enhancement:** Expands generic updates (e.g., "finished" → "Backend Finished") for richer context.
  - [x] **Refactored Manager:** Clean architecture with dedicated helper methods for key generation and value enhancement.
  - [x] **Hybrid Storage:** 
    - **Structured:** Supabase for exact facts.
    - **Vector:** `pgvector` with **HuggingFace Embeddings** (768d) for semantic search.
  - [x] **Context Injection:** Auto-retrieval of relevant memories.
  - [x] **Background Processing:** Non-blocking memory extraction
- [x] **Conversation Persistence:**
  - [x] **Conversation Management:** Create and track conversations per user
  - [x] **Message Storage:** All user and AI messages saved to database
  - [x] **Unified Chat Endpoint:** Single endpoint handles both new and existing conversations
  - [x] **Auto Title Generation:** Conversations automatically titled from first message
- [x] **Frontend Enhancements:**
  - [x] **Growth Board:** New dashboard widget visualizing Projects, Skills, Focus, and Bio.
  - [x] **Skill Graph:** Dedicated visualization for user skills and tools.
  - [x] **Smart Milestones:** Clean date formatting for project updates.
  - [x] **Chat UI:** Smart dates, context menus, and favorites.
- [x] **Database Integration:**
  - [x] Centralized Supabase service
  - [x] Row Level Security (RLS) for user privacy
  - [x] Pydantic models for structured data validation
  - [x] Conversation and Message repositories

### 🔄 In Progress
- [ ] **RAG Integration:** Connecting Vector Search results to LLM context window.
- [ ] **Document Ingestion:** Uploading PDFs/MD files to vector store.
- [ ] Streaming responses

### 📋 Phase 2 Next Steps
1. **Refine RAG:** Connect vector retrieval to `ChatService` for long-term memory recall.
2. **Monitor Classification:** Fine-tune the LLM prompt to ensure consistent skill/milestone detection.
3. **Memory Explorer:** Advanced UI to browse and manage all stored memories.
4. **Archive:** Implement "Archive" functionality for old chats.

> 📊 **See [MILESTONES.md](./MILESTONES.md) for detailed progress tracking.**

---

## Project Scope (TODO)

| Phase | TODO / Description | Skills / Concepts | Tools / Tech | Expected Output |
|-------|-----------------|-----------------|---------------|----------------|
| **1. Setup and LLM API Base** | ✅ **Done** - FastAPI backend with Gemini 2.0 Flash, LangChain integration, Langfuse monitoring | Prompting, JSON output, LLM observability | Gemini 2.0 API, FastAPI, LangChain, Langfuse | User asks question → AI answers from text input |
| **2. Memory & Context** | ✅ **Done** - Conversation history, "Smart Memory" (Structured + Vector), Session management | Vector stores (long-term), User profiling | Supabase (pgvector), Postgres RPC, LangChain Memory | AI remembers you, your past chats, and preferences |
| **3. Document Ingestion / RAG** | 🔄 **Next Up** - Add PDF / HTML ingestion → store embeddings → searchable | Embeddings, chunking, vector DB, retrieval | HuggingFace Embeddings, Supabase Vector | Ask questions → AI answers using documents |
| **4. Multimodal Support** | TODO: Add image, screenshot, audio ingestion + OCR | Image → text, audio transcription, TTS | Gemini Vision, Whisper, XTTS, OpenCV | AI can understand images / screenshots / audio and answer questions |
| **5. Agents & Automation** | TODO: Enable AI to perform tasks like web scraping, form filling, email sending | Tool calling, multi-step reasoning, memory | LangChain / LlamaIndex, Selenium / Playwright | AI completes automated workflows for the user |
| **6. Fine-Tuning** | TODO: Fine-tune model on personal / domain-specific data | LoRA, QLoRA, SFT | HuggingFace TRL, LoRA adapters | AI answers more accurately for personal workflow or specialized domain |
| **7. Deployment** | TODO: Make the assistant accessible via web / API | FastAPI, Docker, Redis, async pipelines | Vercel / Railway / GCP | Live personal assistant available via web + API |
| **8. Scaling & Monitoring** | TODO: Optimize for performance, multi-user, logging, error handling | Async pipelines, Redis queues, monitoring | Celery, Redis, Prometheus, Grafana | Production-ready system with dashboard & analytics |

---

## Tech Stack (TODO / Planned)

- **LLM APIs:** Gemini 2.0  
- **Embeddings / RAG:** HuggingFace `all-mpnet-base-v2`, Supabase `pgvector`
- **Agents / Workflow:** LangChain, LlamaIndex, CrewAI  
- **Automation:** Selenium, Playwright, Python scripts  
- **Multimodal:** Gemini Vision, OpenCV, Whisper, XTTS  
- **Fine-tuning:** LoRA, QLoRA, HuggingFace TRL  
- **Backend / Deployment:** FastAPI, Docker, Redis, Vercel / Railway / GCP, **Supabase**
- **Frontend / Dashboard:** React / Next.js, Streamlit (optional)  

---

## Memory Management System

NeuraDesk features a sophisticated **Memory Management System** that allows the AI to "remember" users over time.

### Architecture

1.  **Classifier (`app/memory/classifier.py`)**:
    *   Analyzes every user message in the background.
    *   Uses Gemini with **Structured Output** (JSON Schema) to categorize facts.
    *   Categories: `Personal Profile`, `Preference`, `Project`, `Ephemeral`.
    *   Assigns an **Importance Score** (0.0 - 1.0).

2.  **Manager (`app/memory/manager.py`)**:
    *   Orchestrates the flow: User Query -> Classification -> Storage.
    *   **Hybrid Storage Strategy**:
        *   **Structured**: Stores exact Key/Value pairs in Postgres for instant "User Profile" lookup.
        *   **Vector**: Generates embeddings (numbers representing meaning) and stores them in Supabase Vector for "Fuzzy" semantic search.
    *   Retrieves relevant memories to inject into the chat context.

3.  **Memory Repository (`app/database/repositories/memory.py`)**:
    *   Persists facts to **Supabase** (`user_memories` table).
    *   Uses **Row Level Security (RLS)** to ensure users only access their own data.

4.  **Vector Repository (`app/database/repositories/vector.py`)**:
    *   Persists embeddings to **Supabase** (`memory_embeddings` table).
    *   Uses **Postgres RPC** (`match_embeddings`) to perform fast cosine similarity search.

### Data Flow
1.  **User asks:** "My name is Sarah and I love Python."
2.  **LLM Answers:** "Nice to meet you Sarah! Python is great."
3.  **Background Process:**
    *   Classifier detects: `Category: Personal`, `Key: name`, `Value: Sarah`.
    *   **Action 1**: Save to Structured DB (Role: Profile Display).
    *   **Action 2**: Generate Embedding -> Save to Vector DB (Role: Deep Recall).
4.  **Next Query:** "What language do I like?" (Note: "language" != "Python")
5.  **Context Injection (Future):** Vector Search finds "Sarah loves Python" because "language" is semantically close to "Python".
6.  **LLM Answers:** "You mentioned you love Python!"

---

## Conversation Persistence System

NeuraDesk now features a **Conversation Persistence System** that tracks all conversations and messages for each user.

### Architecture

1.  **Conversation Repository (`app/database/repositories/conversations.py`)**:
    *   Creates new conversations with auto-generated titles
    *   Retrieves conversations for a user
    *   Updates and deletes conversations
    *   Stores: `id`, `user_id`, `title`, `is_favorite`, `is_archived`, timestamps

2.  **Message Repository (`app/database/repositories/messages.py`)**:
    *   Saves every user and AI message to the database
    *   Retrieves message history for a conversation
    *   Formats conversation history for LLM context (future use)
    *   Stores: `id`, `conversation_id`, `role` (user/assistant), `content`, `created_at`

3.  **Chat Service (`app/services/chat_service.py`)**:
    *   Orchestrates conversation creation and message storage
    *   Handles both new and existing conversations seamlessly
    *   Auto-generates conversation titles from first message

### Workflow

#### New Conversation:
```
1. User sends message WITHOUT conversation_id
   ↓
2. Create new conversation in database
   - Title: First 50 chars of message
   - Returns: conversation_id
   ↓
3. Save user message to messages table
   ↓
4. Generate AI response (with user facts)
   ↓
5. Save AI response to messages table
   ↓
6. Return response WITH conversation_id
```

#### Existing Conversation:
```
1. User sends message WITH conversation_id
   ↓
2. Save user message to messages table
   ↓
3. Generate AI response (with user facts)
   ↓
4. Save AI response to messages table
   ↓
5. Return response WITH conversation_id
```

### Database Schema

**Conversations Table:**
```sql
CREATE TABLE conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    is_favorite BOOLEAN DEFAULT FALSE,
    is_archived BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);
```

**Messages Table:**
```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
    role TEXT NOT NULL,  -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoint

**POST `/api/v1/chat`**
- **Request:** `{ user_id, message, conversation_id? }`
- **Response:** `{ message, answer, conversation_id }`
- **Behavior:** 
  - If `conversation_id` is null → creates new conversation
  - If `conversation_id` is provided → continues existing conversation
  - All messages are automatically saved to database
  
**PATCH `/api/v1/conversations/{conversation_id}`**
- **Request:** `{ title?, is_favourite? }`
- **Response:** `{ status: "success" }`
- **Behavior:** Updates conversation title or favorite status

**DELETE `/api/v1/conversations/{conversation_id}`**
- **Request:** None
- **Response:** `{ status: "success" }`
- **Behavior:** Permanently deletes conversation and all associated messages

---

## Architecture & Design Principles

### Why We Refactored

As NeuraDesk evolved from a simple LLM wrapper to a sophisticated memory-aware assistant, the codebase needed to scale accordingly. The refactor implements **clean architecture principles** to ensure:

- **Separation of Concerns**: Each layer has a single, well-defined responsibility
- **Maintainability**: Easy to locate, understand, and modify code
- **Testability**: Isolated components can be tested independently
- **Scalability**: New features can be added without touching existing code
- **Team Collaboration**: Clear boundaries make parallel development easier

### Architecture Layers

```
┌─────────────────────────────────────────────────┐
│              API Layer (Outer)                  │  ← HTTP endpoints, request/response
├─────────────────────────────────────────────────┤
│           Services (Business Logic)             │  ← Orchestration, workflows
├─────────────────────────────────────────────────┤
│        Memory (Domain Logic)                    │  ← Memory management, classification
├─────────────────────────────────────────────────┤
│      Database (Data Access)                     │  ← Repositories, Supabase client
├─────────────────────────────────────────────────┤
│         Schemas (Data Models)                   │  ← Pydantic validation models
└─────────────────────────────────────────────────┘
```

**Key Principles:**
- **Outer layers depend on inner layers** (never the reverse)
- **Database layer knows nothing about business logic**
- **Memory layer focuses on domain logic, not DB operations**
- **Services orchestrate between layers**
- **API layer is thin, delegates to services**

---

## Project Structure

```
NeuraDesk/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI entry point with CORS & routing
│   │   │
│   │   ├── api/                       # 🌐 API Layer (Outer)
│   │   │   ├── deps.py               # Dependency injection
│   │   │   └── v1/
│   │   │       └── chat.py           # Chat endpoints (/api/v1/chat, /api/v1/test)
│   │   │
│   │   ├── services/                  # 🧠 Business Logic Layer
│   │   │   ├── chat_service.py       # Chat orchestration & LLM invocation
│   │   │   └── langfuse_service.py   # Observability & prompt management
│   │   │
│   │   ├── memory/                    # 💾 Memory Domain Layer
│   │   │   ├── manager.py            # Memory orchestration (process, retrieve)
│   │   │   └── classifier.py         # Fact classification logic
│   │   │
│   │   ├── database/                  # 🗄️ Data Access Layer
│   │   │   ├── client.py             # Supabase client singleton
│   │   │   └── repositories/
│   │   │       ├── memory.py         # Memory CRUD operations
│   │   │       ├── conversations.py  # Conversation CRUD operations
│   │   │       ├── messages.py       # Message CRUD operations
│   │   │       └── vector.py         # Vector storage (future)
│   │   │
│   │   ├── schemas/                   # 📋 Data Models Layer
│   │   │   ├── chat_models.py        # ChatRequest, ChatResponse
│   │   │   ├── memory.py             # MemoryFact, MemoryType, MemoryClassificationResult
│   │   │   ├── conversations.py      # Conversation model
│   │   │   ├── messages.py           # Message, MessageCreate models
│   │   │   └── classification_schema.py # LLM structured output schemas
│   │   │
│   │   └── ai/                        # 🤖 AI/LLM Layer
│   │       ├── llm.py                # LLMService (Gemini + LangChain)
│   │       └── chat_engine.py        # AI response & fact classification functions
│   │
│   ├── requirements.txt
│   └── .env                          # API Keys & Config
│
├── frontend/
│   ├── src/
│   │   ├── api/                      # API integration
│   │   ├── components/               # React components
│   │   └── pages/                    # Application routes
│   └── package.json
│
└── README.md
```

### Layer Responsibilities

#### 🌐 **API Layer** (`api/v1/`)
- Defines HTTP endpoints
- Validates requests/responses
- Delegates to services
- **Does NOT** contain business logic

#### 🧠 **Services Layer** (`services/`)
- Orchestrates workflows
- Coordinates between memory, AI, and database
- Implements business rules
- **Does NOT** directly access database

#### 💾 **Memory Layer** (`memory/`)
- Memory classification logic
- Memory retrieval strategies
- **Does NOT** know about Supabase or SQL

#### 🗄️ **Database Layer** (`database/`)
- Single source of truth for data access
- Repository pattern for each entity
- Supabase client management
- **Does NOT** contain business logic

#### 📋 **Schemas Layer** (`schemas/`)
- Pydantic models for validation
- Shared data contracts
- Type safety across layers

---

---

## Future Features (TODO / Stretch Goals)

- Multi-agent orchestration (agents querying each other)  
- Auto-update knowledge base (ingest new docs automatically)  
- Personalized recommendations and reminders  
- User authentication & multi-user support  
- Analytics dashboard to track queries, usage, and model performance  

---

## Project Deliverables (TODO)

- Phase 1: Working LLM answering questions from text  
- Phase 2: **Smart Memory & Context Awareness** (History, User Facts)
- Phase 3: RAG-powered knowledge retrieval  
- Phase 4: Multimodal support (images + audio)  
- Phase 5: Automation agent capable of tasks  
- Phase 6: Fine-tuned personalized AI  
- Phase 7: Deployed web + API assistant  
- Phase 8: Production-ready scaling + monitoring  

---

**Current Focus:**  
- **Complete RAG Pipeline:** Connect vector retrieval to ChatService.
- **Document Ingestion:** Implement PDF upload and chunking.
- Implement session management and conversation history
- Add streaming responses for better UX

**Maintenance Notes:**  
- Keep dependencies updated (especially SDK versions)
- Monitor Langfuse dashboard for LLM performance metrics
- Document API changes and breaking updates  

---

