from typing import List
import os
from app.database.client import supabase_client

class VectorRepository:
    """
    Handles vector storage for semantic search of unstructured memories.
    Uses pgvector (Supabase).
    """
    
    def __init__(self):
        self.client = supabase_client.client
        self.table_name = "memory_embeddings"
    
    async def store_embedding(
        self, 
        user_id: str, 
        text: str, 
        embedding: List[float],
        metadata: dict = None
    ) -> str:
        """
        Store an embedding with associated text and metadata.
        Returns the ID of the stored embedding.
        """
        data = {
            "user_id": user_id,
            "content": text,
            "embedding": embedding,
            "metadata": metadata or {}
        }
        
        result = self.client.table(self.table_name).insert(data).execute()
        
        if result.data:
            return result.data[0]["id"]
        return None
    
    async def search_similar(
        self, 
        user_id: str, 
        query_embedding: List[float],
        limit: int = 5,
        match_threshold: float = 0.5
    ) -> List[dict]:
        """
        Search for similar embeddings using cosine similarity.
        Returns list of {content, metadata, similarity}
        """
        result = self.client.rpc(
            "match_embeddings", 
            {
                "query_embedding": query_embedding,
                "match_threshold": match_threshold, 
                "match_count": limit,
                "p_user_id": user_id
            }
        ).execute()

        return result.data
    
    async def delete_embeddings(self, user_id: str, ids: List[str]) -> bool:
        """Delete specific embeddings"""
        result = self.client.table(self.table_name)\
            .delete()\
            .in_("id", ids)\
            .eq("user_id", user_id)\
            .execute()
            
        return len(result.data) > 0
