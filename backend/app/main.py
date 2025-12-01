from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import llm_routes

app = FastAPI(title="NeuraDesk Backend - Phase 1")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "http://localhost:5173", "http://127.0.0.1:8080", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(llm_routes.router)

@app.get("/")
def root():
    return {"message": "NeuraDesk Backend Running!"}
