from app.models.memory import MemoryClassificationResult, MemoryType, MemoryImportance
from app.services.llm_service import classify_fact
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
        response = classify_fact(user_message)
        print(response)
        try:
            result_dict = json.loads(response)
            
            if not result_dict.get("should_store", False):
                return MemoryClassificationResult(
                    fact_type=MemoryType.EPHEMERAL,
                    importance=MemoryImportance.LOW,
                    key="",
                    value="",
                    should_store=False,
                    reasoning=result_dict.get("reasoning", "No facts to store")
                )
            
            return MemoryClassificationResult(
                fact_type=MemoryType(result_dict["fact_type"]),
                importance=MemoryImportance(result_dict["importance"]),
                key=result_dict["key"],
                value=result_dict["value"],
                should_store=True,
                reasoning=result_dict.get("reasoning")
            )
        
        except (json.JSONDecodeError, KeyError, ValueError) as e:
            # If parsing fails, don't store
            return MemoryClassificationResult(
                fact_type=MemoryType.EPHEMERAL,
                importance=MemoryImportance.LOW,
                key="",
                value="",
                should_store=False,
                reasoning=f"Classification failed: {str(e)}"
            )
