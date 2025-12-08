from fastapi import APIRouter
from app.schemas.chat_models import ChatRequest, ChatResponse
from app.services.chat_service import ChatService
from app.ai.llm import _llm_service
router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    chat_service = ChatService()
    return await chat_service.get_response(req.user_id, req.message)


@router.post("/test", response_model=ChatResponse)
async def test(req: ChatRequest):
    answer = _llm_service.invoke("MemoryFactClassifier", req.question,"qa_session")
    return ChatResponse(message=req.question, answer=answer)
