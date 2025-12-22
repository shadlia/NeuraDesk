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
        # 1. Get user profile/facts
        #old_facts = await self.memory_manager.get_user_profile(user_id)
        old_facts=""
        
        # 2. Ask LLM 
        try:
            answer = ai_response(user_message, user_facts=str(old_facts), conversation_id=conversation_id)
        except Exception as e:
            # If AI fails, don't save anything, just raise the error
            raise Exception(f"AI failed to generate response: {str(e)}")
        
        # 3. Only save if we got a successful response
        if answer and answer.strip():
            # Save user message
            self.message_repository.save_message(conversation_id, "user", user_message)
            
            # Save AI response
            self.message_repository.save_message(conversation_id, "assistant", answer)
            
            # Process memory (background task, can fail without affecting the response)
            # try:
            #     await self.memory_manager.process_query(user_id, user_message, str(old_facts))
            # except Exception as e:
            #     print(f"Memory processing failed (non-critical): {str(e)}")
        else:
            raise Exception("AI returned empty response")
        
        return ChatResponse(message=user_message, answer=answer, conversation_id=conversation_id)

    async def create_and_respond(self, user_id: str, user_message: str):
        """Create new conversation and get response - only saves if AI succeeds"""
        # 1. Get user profile/facts
        #old_facts = await self.memory_manager.get_user_profile(user_id)
        old_facts=""
        # 2. Ask LLM 
        try:
            answer = ai_response(user_message, user_facts=str(old_facts), conversation_id=None)
        except Exception as e:
            # If AI fails, don't create conversation
            raise Exception(f"AI failed to generate response: {str(e)}")
        
        # 3. Validate response
        if not answer or not answer.strip():
            raise Exception("AI returned empty response")
        
        # 4. Only NOW create conversation (AI worked!)
        title = user_message[:50] if len(user_message) > 50 else user_message
        conversation_result = self.conversation_repository.create_conversation(user_id, title)
        conversation_id = conversation_result.data[0].get("id")
        
        # 5. Save messages
        self.message_repository.save_message(conversation_id, "user", user_message)
        self.message_repository.save_message(conversation_id, "assistant", answer)
        
        # 6. Process query to save informatiaons  (non-critical)
        # try:
        #     await self.memory_manager.process_query(user_id, user_message, str(old_facts))
        # except Exception as e:
        #     print(f"Memory processing failed (non-critical): {str(e)}")
        
        return ChatResponse(message=user_message, answer=answer, conversation_id=conversation_id, title=title)
