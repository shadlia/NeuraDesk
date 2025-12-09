from app.schemas.chat_models import ChatRequest, ChatResponse
from app.memory.manager import MemoryManager
from app.ai.llm import _llm_service
from app.ai.chat_engine import ai_response
from typing import Optional
from app.database.repositories.conversations import ConversationRepository
from app.database.repositories.messages import MessageRepository

class ChatService:
    def __init__(self):
        self.memory_manager = MemoryManager()
        self.conversation_repository = ConversationRepository()
        self.message_repository = MessageRepository()

    async def get_response(self, user_id: str, user_message: str, conversation_id: Optional[str] = None):
        # 1. Save user message
        self.message_repository.save_message(conversation_id, "user", user_message)
        
        # 2. Get user profile/facts
        old_facts = await self.memory_manager.get_user_profile(user_id)
        
        # 3. Ask LLM
        answer = ai_response(user_message, user_facts=str(old_facts), conversation_id=conversation_id)
        
        # 4. Save AI response
        self.message_repository.save_message(conversation_id, "assistant", answer)
        
        # 5. Process memory
        await self.memory_manager.process_query(user_id, user_message, str(old_facts))
        
        return ChatResponse(message=user_message, answer=answer, conversation_id=conversation_id)

    async def new_conversation(self, user_id: str, user_message: str):
        # 1 Generate title 
        title = user_message[:50] if len(user_message) > 50 else user_message
        # 2 create new conversation
        conversation_id = self.conversation_repository.create_conversation(user_id, title)
        # 3 return conversation id
        return conversation_id.data[0].get("id")