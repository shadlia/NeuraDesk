from typing import Optional

from app.ai.llm import _llm_service
from app.schemas.classification_schema import MemoryClassificationSchema


def classify_fact_structured(user_message: str, user_facts: str) -> MemoryClassificationSchema:
    """
    Classify a user message to extract storable facts.

    Args:
        user_message: The user's latest message.
        user_facts: Existing user facts for context.

    Returns:
        MemoryClassificationSchema with category, key, value, and storage decision.
    """
    return _llm_service.invoke(
        prompt_name="MemoryFactClassifier",
        user_content=f"User statement: {user_message} , User old facts: {user_facts}",
        trace_name="fact_classifier",
        structured_output=MemoryClassificationSchema,
    )


def ai_response(
    user_message: str,
    user_facts: str,
    context: Optional[str] = None,
    conversation_id: Optional[str] = None,
) -> str:
    """
    Generate an AI response using the chat LLM.

    Args:
        user_message: The user's message.
        user_facts: Structured profile information about the user.
        context: Optional semantic context from memory retrieval.
        conversation_id: Optional ID for short-term conversation memory.

    Returns:
        AI response as a string.
    """
    user_content = (
        f"Context:\n{context}\n\n"
        f"Message:\n{user_message}\n\n"
        f"Information about user:\n{user_facts}"
    )

    return _llm_service.invoke(
        prompt_name="neura_qa_v1",
        user_content=user_content,
        trace_name="qa_session",
        conversation_id=conversation_id,
        use_short_term_memory=True,
    )