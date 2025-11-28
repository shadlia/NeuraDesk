from fastapi import FastAPI
from app.routes import llm_routes

app = FastAPI(title="NeuraDesk Backend - Phase 1")

app.include_router(llm_routes.router)

@app.get("/")
def root():
    return {"message": "NeuraDesk Backend Running!"}
