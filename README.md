# NeuraDesk : Personal Knowledge & Productivity Assistant


> **Evolving AI-powered assistant for organizing knowledge, automating tasks, and multimodal reasoning**

---

## Project Overview
**Goal:** Build a personal AI assistant that helps users:  
- Organize knowledge from documents, notes, websites, images, and emails  
- Search and summarize information efficiently  
- Automate repetitive tasks (web forms, reminders, data extraction)  
- Gradually evolve into a multimodal, fine-tuned, deployed agent

**Key Features:**  
- Multi-format ingestion (PDF, HTML, images, video, audio)  
- RAG (Retrieval-Augmented Generation) for searching knowledge  
- Agents that perform tasks using tools and automation  
- Optional fine-tuning for domain-specific knowledge  
- Web + API deployment for real-world usability  

---

## Current Progress

**Status:** Phase 1 - LLM API Base (In Progress)  
**Last Updated:** November 28, 2025

### ✅ Completed Milestones
- [x] FastAPI backend scaffolding
- [x] Gemini 2.0 Flash API integration  
- [x] LangChain integration for LLM orchestration
- [x] Langfuse observability & monitoring setup
- [x] Basic `/llm/ask` endpoint with question-answer functionality
- [x] Environment configuration with `.env` support
- [x] Request/Response models with Pydantic
- [x] SDK v3 compatibility fixes for Langfuse
- [x] **Frontend Foundation:** React + Vite + Tailwind setup
- [x] **Home Page Redesign:** Modern "Workspace" aesthetic, Hero preview, Blog/Contact sections
- [x] **User Dashboard:** Interactive dashboard with stats, quick actions, and insights widgets
- [x] **Navigation & Routing:** Implemented sidebar and top navigation structure

### 🔄 In Progress
- [ ] **Backend Integration:** Connecting Frontend to `/llm/ask` endpoint
- [ ] Testing and API validation
- [ ] Error handling and edge cases

### 📋 Phase 1 Next Steps
1. Build simple frontend UI to test LLM endpoint
2. Add conversation history/session management
3. Implement streaming responses
4. Complete Phase 1 before moving to Phase 2 (RAG)

> 📊 **See [MILESTONES.md](./MILESTONES.md) for detailed progress tracking with granular task breakdown and timeline estimates.**

---

## Project Scope (TODO)

| Phase | TODO / Description | Skills / Concepts | Tools / Tech | Expected Output |
|-------|-----------------|-----------------|---------------|----------------|
| **1. LLM API Base** | ✅ **IN PROGRESS** - FastAPI backend with Gemini 2.0 Flash, LangChain integration, Langfuse monitoring | Prompting, JSON output, LLM observability | Gemini 2.0 API, FastAPI, LangChain, Langfuse | User asks question → AI answers from text input |
| **2. Document Ingestion / RAG** | TODO: Add PDF / HTML ingestion → store embeddings → searchable | Embeddings, chunking, vector DB, retrieval | Chroma / Pinecone, OpenAI / BGE embeddings | Ask questions → AI answers using documents |
| **3. Multimodal Support** | TODO: Add image, screenshot, audio ingestion + OCR | Image → text, audio transcription, TTS | Gemini Vision, Whisper, XTTS, OpenCV | AI can understand images / screenshots / audio and answer questions |
| **4. Agents & Automation** | TODO: Enable AI to perform tasks like web scraping, form filling, email sending | Tool calling, multi-step reasoning, memory | LangChain / LlamaIndex, Selenium / Playwright | AI completes automated workflows for the user |
| **5. Fine-Tuning** | TODO: Fine-tune model on personal / domain-specific data | LoRA, QLoRA, SFT | HuggingFace TRL, LoRA adapters | AI answers more accurately for personal workflow or specialized domain |
| **6. Deployment** | TODO: Make the assistant accessible via web / API | FastAPI, Docker, Redis, async pipelines | Vercel / Railway / GCP | Live personal assistant available via web + API |
| **7. Scaling & Monitoring** | TODO: Optimize for performance, multi-user, logging, error handling | Async pipelines, Redis queues, monitoring | Celery, Redis, Prometheus, Grafana | Production-ready system with dashboard & analytics |

---

## Tech Stack (TODO / Planned)

- **LLM APIs:** OpenAI GPT-4.2 / GPT-5 / Gemini 2.0  
- **Embeddings / RAG:** OpenAI embeddings, BGE, Chroma, Pinecone  
- **Agents / Workflow:** LangChain, LlamaIndex, CrewAI  
- **Automation:** Selenium, Playwright, Python scripts  
- **Multimodal:** Gemini Vision, OpenCV, Whisper, XTTS  
- **Fine-tuning:** LoRA, QLoRA, HuggingFace TRL  
- **Backend / Deployment:** FastAPI, Docker, Redis, Vercel / Railway / GCP  
- **Frontend / Dashboard:** React / Next.js, Streamlit (optional)  

---

## Current Project Structure

```
NeuraDesk/
├── backend/
│   ├── app/
│   │   ├── main.py                    # FastAPI application entry point
│   │   ├── routes/
│   │   │   └── llm_routes.py         # /llm/ask endpoint
│   │   ├── services/
│   │   │   ├── llm_service.py        # Gemini LLM integration
│   │   │   └── langfuse_service.py   # Langfuse observability
│   │   └── models/
│   │       └── llm_models.py         # Pydantic request/response models
│   ├── data/                          # Future: Document storage
│   ├── notebooks/                     # Future: Experimentation
│   ├── requirements.txt               # Python dependencies
│   ├── .env                          # Environment variables (API keys)
│   └── venv/                         # Virtual environment
├── frontend/
│   ├── src/
│   │   ├── components/        # UI components (Chat, Dashboard, Layout)
│   │   ├── pages/             # Route pages (Home, Dashboard, Chat)
│   │   └── lib/               # Utilities
└── README.md                         # Project documentation
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
- Phase 2: RAG-powered knowledge retrieval  
- Phase 3: Multimodal support (images + audio)  
- Phase 4: Automation agent capable of tasks  
- Phase 5: Fine-tuned personalized AI  
- Phase 6: Deployed web + API assistant  
- Phase 7: Production-ready scaling + monitoring  

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

