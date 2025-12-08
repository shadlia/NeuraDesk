from app.schemas.chat_models import ChatRequest, ChatResponse
from app.memory.manager import MemoryManager
from app.ai.llm import _llm_service
from app.schemas.classification_schema import MemoryClassificationSchema

class ChatService:
    def __init__(self):
        self.memory_manager = MemoryManager()

    async def get_response(self, user_id: str, user_message: str):
        # 1. Get user profile/facts
        old_facts = await self.memory_manager.get_user_profile(user_id)
        
        # 2. Ask LLM
        answer = self.ask_question(user_message, facts=str(old_facts))
        
        # 3. Process memory
        await self.memory_manager.process_query(user_id, user_message, str(old_facts))
        
        return ChatResponse(message=user_message, answer=answer)

    def ask_question(self, question: str, context: str = "", facts: str = "") -> str:
        """
        Ask a question to the LLM using LangChain + Langfuse.
        """
        user_content = f"""
        Context:
        {context}

        Question:
        {question}

        Information about user:
        {facts}
        """
        
        return _llm_service.invoke(
            prompt_name="neura_qa_v1",
            user_content=user_content,
            trace_name="qa_session"
        )

    def classify_fact_structured(self, user_message: str, old_facts: str):
        """
        Classify a fact using structured output.
        """
        return _llm_service.invoke(
            prompt_name="MemoryFactClassifier",
            user_content=f"User statement: {user_message} , User old facts: {old_facts} ",
            trace_name="fact_classifier",
            structured_output=MemoryClassificationSchema,
        )