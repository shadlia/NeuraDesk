from typing import List, Optional
from app.models.memory import MemoryFact, MemoryType
import os
from supabase import create_client, Client


class StructuredStore:
    """
    Handles structured storage of exact facts in Supabase/Postgres.
    Uses Row-Level Security (RLS) for user isolation.
    """
    
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials not found in environment")
        
        self.client: Client = create_client(supabase_url, supabase_key)
        self.table_name = "user_memories"
    
    async def store_fact(self, fact: MemoryFact) -> MemoryFact:
        """Store a structured fact in the database"""
        data = {
            "user_id": fact.user_id,
            "fact_type": fact.fact_type.value,
            "importance": fact.importance.value,
            "key": fact.key,
            "value": fact.value,
            "context": fact.context
        }
        
        result = self.client.table(self.table_name).insert(data).execute()
        
        if result.data:
            stored_fact = result.data[0]
            fact.id = stored_fact["id"]
            fact.created_at = stored_fact["created_at"]
            fact.updated_at = stored_fact["updated_at"]
        
        return fact
    
    async def get_facts(
        self, 
        user_id: str, 
        fact_type: Optional[MemoryType] = None,
        limit: int = 50
    ) -> List[MemoryFact]:
        """Retrieve facts for a user, optionally filtered by type"""
        query = self.client.table(self.table_name).select("*").eq("user_id", user_id)
        
        if fact_type:
            query = query.eq("fact_type", fact_type.value)
        
        result = query.limit(limit).execute()
        
        facts = []
        for row in result.data:
            facts.append(MemoryFact(
                id=row["id"],
                user_id=row["user_id"],
                fact_type=MemoryType(row["fact_type"]),
                importance=row["importance"],
                key=row["key"],
                value=row["value"],
                context=row.get("context"),
                created_at=row["created_at"],
                updated_at=row["updated_at"]
            ))
        
        return facts
    
    async def update_fact(self, fact_id: str, user_id: str, updates: dict) -> Optional[MemoryFact]:
        """Update an existing fact"""
        result = self.client.table(self.table_name)\
            .update(updates)\
            .eq("id", fact_id)\
            .eq("user_id", user_id)\
            .execute()
        
        if result.data:
            row = result.data[0]
            return MemoryFact(
                id=row["id"],
                user_id=row["user_id"],
                fact_type=MemoryType(row["fact_type"]),
                importance=row["importance"],
                key=row["key"],
                value=row["value"],
                context=row.get("context"),
                created_at=row["created_at"],
                updated_at=row["updated_at"]
            )
        
        return None
    
    async def delete_fact(self, fact_id: str, user_id: str) -> bool:
        """Delete a fact"""
        result = self.client.table(self.table_name)\
            .delete()\
            .eq("id", fact_id)\
            .eq("user_id", user_id)\
            .execute()
        
        return len(result.data) > 0
