from fastapi import APIRouter
from app.services.llm_service import ask_question
from app.models.llm_models import LLMRequest, LLMResponse

router = APIRouter()

@router.post("/llm/ask", response_model=LLMResponse)
def llm_ask(req: LLMRequest):
    answer = ask_question(req.question, req.context)
    return LLMResponse(question=req.question, answer=answer)
