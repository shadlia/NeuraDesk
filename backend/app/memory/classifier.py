from app.models.memory import MemoryClassificationResult, MemoryType
from app.services.llm_service import classify_fact_structured
import json

class MemoryClassifier:
    """
    Classifies incoming facts to determine:
    1. Type (personal, preference, project, ephemeral)
    2. Importance (high, medium, low)
    3. Whether to store it
    
    Uses a Langfuse prompt for classification logic.
    """
    
    def __init__(self):
        pass
    
    async def classify_fact(self, user_message: str) -> MemoryClassificationResult:
        """
        Analyze a conversation turn to extract and classify facts.
        
        Args:
            user_message: What the user said
        
        Returns:
            Classification result with type, importance, and storage decision
        """
        response = classify_fact_structured(user_message)
        try:
            
            if not response.should_store:
                return MemoryClassificationResult(
                    category="ephemeral",
                    importance=0,
                    key="",
                    value="",
                    should_store=False,
                    reason=response.reason
                )
            
            return MemoryClassificationResult(
                category=response.category,
                importance=response.importance,
                key=response.key,
                value=response.value,
                should_store=True,
                reason=response.reason
            )
        
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            # If parsing fails, don't store
            return MemoryClassificationResult(
                category="ephemeral",
                importance=0,
                key="",
                value="",
                should_store=False,
                reason=f"Classification failed: {str(e)}"
            )
