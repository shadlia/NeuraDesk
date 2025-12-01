from fastapi import APIRouter
from app.services.llm_service import ask_question
from app.models.llm_models import LLMRequest, LLMResponse
from app.memory.manager import MemoryManager

router = APIRouter()

@router.post("/llm/ask", response_model=LLMResponse)
async def llm_ask(req: LLMRequest):
    answer = ask_question(req.question, req.context)
    memory_manager = MemoryManager()
    await memory_manager.process_query(req.user_id, req.question)
    return LLMResponse(question=req.question, answer=answer)
