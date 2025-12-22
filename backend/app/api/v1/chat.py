from fastapi import APIRouter
from app.schemas.chat_models import ChatRequest, ChatResponse
from app.schemas.conversations import Conversation, ConversationUpdate
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


@router.get("/conversation/{conversation_id}", response_model=Conversation)
async def get_conversation(conversation_id: str):
    """Get conversation details"""
    conversation_repo = ConversationRepository()
    return conversation_repo.get_conversation(conversation_id)


@router.get("/conversations/{conversation_id}/messages", response_model=List[Message])
async def get_messages(conversation_id: str):
    """Get all messages for a conversation"""
    message_repo = MessageRepository()
    return message_repo.get_messages(conversation_id, limit=100)


@router.post("/test", response_model=ChatResponse)
async def test(req: ChatRequest):
    return ChatResponse(message=req.question, answer=answer)

@router.patch("/conversations/{conversation_id}")
async def update_conversation(conversation_id: str, update: ConversationUpdate):
    """Update conversation title or favorite status"""
    repo = ConversationRepository()
    repo.update_conversation(conversation_id, title=update.title, is_favorite=update.is_favourite)
    return {"status": "success"}

@router.delete("/conversations/{conversation_id}")
async def delete_conversation(conversation_id: str):
    """Delete a conversation"""
    repo = ConversationRepository()
    repo.delete_conversation(conversation_id)
    return {"status": "success"}
