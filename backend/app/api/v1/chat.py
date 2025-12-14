from fastapi import APIRouter
from app.schemas.chat_models import ChatRequest, ChatResponse
from app.schemas.conversations import Conversation
from app.schemas.messages import Message
from app.services.chat_service import ChatService
from app.database.repositories.conversations import ConversationRepository
from app.database.repositories.messages import MessageRepository
from app.ai.llm import _llm_service
from typing import List

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat(req: ChatRequest):
    chat_service = ChatService()
    if req.conversation_id:
        # existing conversation
        return await chat_service.get_response(req.user_id, req.message, req.conversation_id)
    else:
        # new conversation - let chat_service handle everything
        return await chat_service.create_and_respond(req.user_id, req.message)


@router.get("/conversations/{user_id}", response_model=List[Conversation])
async def get_conversations(user_id: str):
    """Get all conversations for a user"""
    conversation_repo = ConversationRepository()
    return conversation_repo.get_conversations(user_id)


@router.get("/conversations/{conversation_id}/messages", response_model=List[Message])
async def get_messages(conversation_id: str):
    """Get all messages for a conversation"""
    message_repo = MessageRepository()
    return message_repo.get_messages(conversation_id, limit=100)


@router.post("/test", response_model=ChatResponse)
async def test(req: ChatRequest):
    answer = _llm_service.invoke("MemoryFactClassifier", req.question,"qa_session")
    return ChatResponse(message=req.question, answer=answer)
