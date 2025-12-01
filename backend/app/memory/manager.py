from app.memory.structured_store import StructuredStore
from app.memory.vector_store import VectorStore
from app.memory.classifier import MemoryClassifier
from app.models.memory import MemoryFact, MemoryType, MemoryImportance
from typing import List, Optional


class MemoryManager:
    """
    Main orchestrator for the memory system.
    Coordinates between classifier, structured store, and vector store.
    """
    
    def __init__(self):
        self.structured_store = StructuredStore()
        self.vector_store = VectorStore()
        self.classifier = MemoryClassifier()
    
    async def process_conversation(
        self, 
        user_id: str,
        user_message: str,
        ai_response: str,
        context: str = ""
    ) -> Optional[MemoryFact]:
        """
        Process a conversation turn to extract and store memories.
        
        This is called after each AI response to check if anything should be remembered.
        """
        
        # 1. Classify the conversation
        classification = await self.classifier.classify_fact(
            user_message=user_message,
            ai_response=ai_response,
            context=context
        )
        
        # 2. If nothing to store, return early
        if not classification.should_store:
            return None
        
        # 3. Create memory fact
        fact = MemoryFact(
            user_id=user_id,
            fact_type=classification.fact_type,
            importance=classification.importance,
            key=classification.key,
            value=classification.value,
            context=context
        )
        
        # 4. Store in structured DB (always for non-ephemeral)
        if classification.fact_type != MemoryType.EPHEMERAL:
            fact = await self.structured_store.store_fact(fact)
        
        # 5. TODO: Store in vector store for semantic search
        # This would involve generating embeddings and storing them
        # await self.vector_store.store_embedding(...)
        
        return fact
    
    async def get_relevant_memories(
        self, 
        user_id: str,
        query: str,
        limit: int = 5
    ) -> List[MemoryFact]:
        """
        Retrieve relevant memories for a given query.
        Combines structured and vector search.
        """
        
        # For now, just get recent structured facts
        # TODO: Add semantic search via vector store
        facts = await self.structured_store.get_facts(
            user_id=user_id,
            limit=limit
        )
        
        return facts
    
    async def get_user_profile(self, user_id: str) -> dict:
        """
        Get a summary of what we know about the user.
        Useful for context injection.
        """
        
        personal_facts = await self.structured_store.get_facts(
            user_id=user_id,
            fact_type=MemoryType.PERSONAL
        )
        
        preferences = await self.structured_store.get_facts(
            user_id=user_id,
            fact_type=MemoryType.PREFERENCE
        )
        
        projects = await self.structured_store.get_facts(
            user_id=user_id,
            fact_type=MemoryType.PROJECT
        )
        
        return {
            "personal": [{"key": f.key, "value": f.value} for f in personal_facts],
            "preferences": [{"key": f.key, "value": f.value} for f in preferences],
            "projects": [{"key": f.key, "value": f.value} for f in projects]
        }
