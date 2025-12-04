from fastapi import APIRouter
from app.models.llm_models import LLMRequest, LLMResponse
from app.memory.manager import MemoryManager
from app.services.llm_service import LLMService
from app.models.classification_schema import MemoryClassificationSchema
from app.services.llm_service import ask_question
router = APIRouter()

@router.post("/llm/ask", response_model=LLMResponse)
async def llm_ask(req: LLMRequest):

    #before saving should check if it exists so should update or add
    memory_manager = MemoryManager()
    old_facts = await memory_manager.get_user_profile(req.user_id)
    answer = ask_question(req.question, old_facts)
    await memory_manager.process_query(req.user_id, req.question,old_facts)
    return LLMResponse(question=req.question, answer=answer)


@router.post("/llm/test", response_model=LLMResponse)
async def llm_ask(req: LLMRequest):
    llm_service = LLMService()
    answer = llm_service.invoke("MemoryFactClassifier", req.question,"qa_session")
    return LLMResponse(question=req.question, answer=answer)
