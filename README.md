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
**Last Updated:** December 1, 2025

### ✅ Completed Milestones
- [x] **Core Backend:** FastAPI + Gemini 2.0 Flash + LangChain
- [x] **Observability:** Langfuse integration for full trace monitoring
- [x] **Frontend:** React + Vite + Tailwind + Modern UI/UX
- [x] **Authentication:** Supabase Auth (Email/OTP) + Protected Routes
- [x] **Memory Management System:**
  - [x] **Smart Classifier:** LLM-based classification of user facts (Personal, Preference, Project, Ephemeral)
  - [x] **Structured Storage:** Supabase (PostgreSQL) storage for long-term facts
  - [x] **Context Injection:** Auto-retrieval of relevant memories for chat context
  - [x] **Background Processing:** Non-blocking memory extraction
- [x] **Database Integration:**
  - [x] Centralized Supabase service
  - [x] Row Level Security (RLS) for user privacy
  - [x] Pydantic models for structured data validation

### 🔄 In Progress
- [ ] Vector Embeddings for semantic search (RAG)
- [ ] Conversation History tracking
- [ ] Streaming responses

### 📋 Phase 2 Next Steps
1. Implement vector storage for semantic memory retrieval
2. Add conversation history to Supabase
3. Refine memory importance scoring
4. Build "Memory Explorer" UI in dashboard

> 📊 **See [MILESTONES.md](./MILESTONES.md) for detailed progress tracking.**

---

## Project Scope (TODO)

| Phase | TODO / Description | Skills / Concepts | Tools / Tech | Expected Output |
|-------|-----------------|-----------------|---------------|----------------|
| **1. Setup and LLM API Base** | ✅ **Done** - FastAPI backend with Gemini 2.0 Flash, LangChain integration, Langfuse monitoring | Prompting, JSON output, LLM observability | Gemini 2.0 API, FastAPI, LangChain, Langfuse | User asks question → AI answers from text input |
| **2. Memory & Context** | ✅ **In Progress** - Conversation history, "Smart Memory" (user preferences, facts), Session management | Vector stores (long-term), Redis (short-term), User profiling | Supabase (pgvector), Redis, LangChain Memory | AI remembers you, your past chats, and preferences |
| **3. Document Ingestion / RAG** | TODO: Add PDF / HTML ingestion → store embeddings → searchable | Embeddings, chunking, vector DB, retrieval | Chroma / Pinecone, OpenAI / BGE embeddings | Ask questions → AI answers using documents |
| **4. Multimodal Support** | TODO: Add image, screenshot, audio ingestion + OCR | Image → text, audio transcription, TTS | Gemini Vision, Whisper, XTTS, OpenCV | AI can understand images / screenshots / audio and answer questions |
| **5. Agents & Automation** | TODO: Enable AI to perform tasks like web scraping, form filling, email sending | Tool calling, multi-step reasoning, memory | LangChain / LlamaIndex, Selenium / Playwright | AI completes automated workflows for the user |
| **6. Fine-Tuning** | TODO: Fine-tune model on personal / domain-specific data | LoRA, QLoRA, SFT | HuggingFace TRL, LoRA adapters | AI answers more accurately for personal workflow or specialized domain |
| **7. Deployment** | TODO: Make the assistant accessible via web / API | FastAPI, Docker, Redis, async pipelines | Vercel / Railway / GCP | Live personal assistant available via web + API |
| **8. Scaling & Monitoring** | TODO: Optimize for performance, multi-user, logging, error handling | Async pipelines, Redis queues, monitoring | Celery, Redis, Prometheus, Grafana | Production-ready system with dashboard & analytics |

---

## Tech Stack (TODO / Planned)

- **LLM APIs:** OpenAI GPT-4.2 / GPT-5 / Gemini 2.0  
- **Embeddings / RAG:** OpenAI embeddings, BGE, Chroma, Pinecone  
- **Agents / Workflow:** LangChain, LlamaIndex, CrewAI  
- **Automation:** Selenium, Playwright, Python scripts  
- **Multimodal:** Gemini Vision, OpenCV, Whisper, XTTS  
- **Fine-tuning:** LoRA, QLoRA, HuggingFace TRL  
- **Backend / Deployment:** FastAPI, Docker, Redis, Vercel / Railway / GCP, **Supabase**
- **Frontend / Dashboard:** React / Next.js, Streamlit (optional)  

---

## Memory Management System

NeuraDesk now features a sophisticated **Memory Management System** that allows the AI to "remember" users over time.

### Architecture

1.  **Classifier (`app/memory/classifier.py`)**:
    *   Analyzes every user message in the background.
    *   Uses Gemini with **Structured Output** (JSON Schema) to categorize facts.
    *   Categories: `Personal Profile`, `Preference`, `Project`, `Ephemeral`.
    *   Assigns an **Importance Score** (0.0 - 1.0).

2.  **Manager (`app/memory/manager.py`)**:
    *   Orchestrates the flow: User Query -> Classification -> Storage.
    *   Decides what to store based on importance and category.
    *   Retrieves relevant memories to inject into the chat context.

3.  **Structured Store (`app/memory/structured_store.py`)**:
    *   Persists facts to **Supabase** (`user_memories` table).
    *   Uses **Row Level Security (RLS)** to ensure users only access their own data.

### Data Flow
1.  **User asks:** "My name is Sarah and I love Python."
2.  **LLM Answers:** "Nice to meet you Sarah! Python is great."
3.  **Background Process:**
    *   Classifier detects: `Category: Personal`, `Key: name`, `Value: Sarah`, `Importance: 0.9`.
    *   Manager saves this fact to Supabase.
4.  **Next Query:** "What's my favorite language?"
5.  **Context Injection:** Manager retrieves "Sarah loves Python" and feeds it to the LLM.
6.  **LLM Answers:** "You mentioned you love Python!"

---

## Project Structure

```
NeuraDesk/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI entry point
│   │   ├── routes/
│   │   │   ├── llm_routes.py         # Chat endpoint with memory integration
│   │   │   └── memory_routes.py      # (Future) Memory management endpoints
│   │   ├── services/
│   │   │   ├── llm_service.py        # Gemini LLM & Structured Output
│   │   │   ├── supabase_service.py   # Centralized Supabase client
│   │   │   └── langfuse_service.py   # Observability
│   │   ├── memory/
│   │   │   ├── manager.py            # Memory orchestration
│   │   │   ├── classifier.py         # Fact classification logic
│   │   │   ├── structured_store.py   # Supabase storage
│   │   │   └── vector_store.py       # (Future) Vector storage
│   │   └── models/
│   │       ├── llm_models.py         # API Request/Response models
│   │       ├── memory.py             # Memory domain models
│   │       └── classification_schema.py # JSON Schemas for LLM
│   ├── prompts/                      # System prompts
│   ├── requirements.txt
│   └── .env                          # API Keys & Config
├── frontend/
│   ├── src/
│   │   ├── api/                      # API integration
│   │   ├── components/               # React components
│   │   └── pages/                    # Application routes
└── README.md
```

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
- Complete Phase 1: LLM API with frontend testing interface  
- Implement session management and conversation history
- Add streaming responses for better UX
- Begin Phase 2 planning: Document ingestion and RAG setup  

**Maintenance Notes:**  
- Keep dependencies updated (especially SDK versions)
- Monitor Langfuse dashboard for LLM performance metrics
- Document API changes and breaking updates  

---

