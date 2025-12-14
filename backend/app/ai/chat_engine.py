from app.ai.llm import _llm_service
from app.schemas.classification_schema import MemoryClassificationSchema
from typing import Optional
def classify_fact_structured(user_message: str, user_facts: str):
    """
    Classify a fact using structured output with Pydantic validation.
    
    Args:
        user_message: User's message containing potential facts
        user_facts: Existing user facts
        
    Returns:
        MemoryClassificationSchema instance with validated data
    """
    return _llm_service.invoke(
        prompt_name="MemoryFactClassifier",
        user_content=f"User statement: {user_message} , User old facts: {user_facts} ",
        trace_name="fact_classifier",
        structured_output=MemoryClassificationSchema,
    )

def ai_response(user_message: str, user_facts: str, context: Optional[str] = None, conversation_id: Optional[str] = None):
    """
    Ask a question to the LLM using LangChain + Langfuse.
    
    Args:
        user_message: User's message
        user_facts: Information about user
        context: Optional context to provide
        
    Returns:
        AI response as string
    """
    user_content = f"""
    Context:
    {context}

    Message:
    {user_message}

    Information about user:
    {user_facts}
    """
    
    return _llm_service.invoke(
        prompt_name="neura_qa_v1",
        user_content=user_content,
        trace_name="qa_session",
        conversation_id=conversation_id,
        use_short_term_memory=True
    )