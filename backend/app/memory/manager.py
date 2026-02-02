from app.database.repositories.memory import MemoryRepository
from app.database.repositories.vector import VectorRepository
from app.memory.classifier import MemoryClassifier
from app.schemas.memory import MemoryFact, MemoryType
from typing import List, Optional
from app.ai.llm import _llm_service

class MemoryManager:
    """
    Main orchestrator for the memory system.
    Coordinates between classifier, structured store, and vector store.
    """
    
    def __init__(self):
        self.memory_repository = MemoryRepository()
        self.vector_repository = VectorRepository()
        self.classifier = MemoryClassifier()
    
    async def process_query(
        self, 
        user_id: str,
        user_message: str,
        old_facts: str
    ) -> Optional[MemoryFact]:
        """
        Process a conversation turn to extract and store memories.
        
        This is called after each AI response to check if anything should be remembered.
        """
        
        # 1. Classify the user message
        classification = await self.classifier.classify_fact(
            user_message=user_message,
            old_facts=old_facts
        )
        # 2. If nothing to store, return early
        if not classification.should_store:
            return None
        # 3. Create memory fact
        fact = MemoryFact(
            user_id=user_id,
            category=classification.category,
            importance=classification.importance,
            key=classification.key,
            value=classification.value,
            context=f"Q: {user_message}\nA:"
        )
       
        
        # 4. Store in structured DB (always for non-ephemeral)
        if classification.category != MemoryType.EPHEMERAL:
            fact = await self.memory_repository.store_fact(fact)
            
            # 5. Store in vector store for semantic search
            feature_text = f"{fact.key}: {fact.value}"
            embedding = _llm_service.get_embedding(feature_text)
            
            await self.vector_repository.store_embedding(
                user_id=user_id,
                text=feature_text,
                embedding=embedding,
                metadata={
                    "category": fact.category.value,
                    "key": fact.key,
                    "importance": fact.importance
                }
            )
        
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
        
        # 1. Get structured facts (just top 5 recent for now)
        # In a real app, maybe you assume generic facts, or just rely on vector search entirely
        # specific_facts = await self.memory_repository.get_facts(user_id=user_id, limit=5)
        
        # 2. Semantic Search (The new powerful part)
        query_embedding = _llm_service.get_embedding(query)
        vector_results = await self.vector_repository.search_similar(
            user_id=user_id,
            query_embedding=query_embedding,
            limit=limit,
            match_threshold=0.6 # Only good matches
        )
        
        relevant_memories = []
        
        # Convert vector results to MemoryFact-like objects so the LLM can read them
        for res in vector_results:
            relevant_memories.append(MemoryFact(
                user_id=user_id,
                category=MemoryType.EPHEMERAL, # Placeholder
                importance=0.8,
                key="context", # Placeholder
                value=res["content"],
                context=res["content"]
            ))
            
        return relevant_memories
    
    async def get_user_profile(self, user_id: str) -> dict:
        """
        Get a summary of what we know about the user.
        Useful for context injection.
        """
        
        personal_facts = await self.memory_repository.get_facts(
            user_id=user_id,
            category=MemoryType.PERSONAL
        )
        
        preferences = await self.memory_repository.get_facts(
            user_id=user_id,
            category=MemoryType.PREFERENCE
        )
        
        projects = await self.memory_repository.get_facts(
            user_id=user_id,
            category=MemoryType.PROJECT
        )
        
        return {
            "personal": [{"key": f.key, "value": f.value} for f in personal_facts],
            "preferences": [{"key": f.key, "value": f.value} for f in preferences],
            "projects": [{"key": f.key, "value": f.value} for f in projects]
        }
