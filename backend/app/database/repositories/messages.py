from app.database.client import supabase_client
from app.schemas.messages import Message, MessageCreate
from typing import List

class MessageRepository:
    def __init__(self):
        self.client = supabase_client.client
        self.table_name = "messages"
    
    def save_message(self, conversation_id: str, role: str, content: str) -> Message:
        """Save a message to the database"""
        data = self.client.table(self.table_name).insert({
            "conversation_id": conversation_id,
            "role": role,
            "content": content
        }).execute()
        
        return Message(
            id=data.data[0]["id"],
            conversation_id=data.data[0]["conversation_id"],
            role=data.data[0]["role"],
            content=data.data[0]["content"],
            created_at=data.data[0]["created_at"]
        )
    
    def get_messages(self, conversation_id: str, limit: int = 10) -> List[Message]:
        """Get messages for a conversation, ordered by creation time"""
        data = self.client.table(self.table_name)\
            .select("*")\
            .eq("conversation_id", conversation_id)\
            .order("created_at", desc=False)\
            .limit(limit)\
            .execute()
        
        messages = []
        for row in data.data:
            messages.append(Message(
                id=row["id"],
                conversation_id=row["conversation_id"],
                role=row["role"],
                content=row["content"],
                created_at=row["created_at"]
            ))
        return messages
    
    def get_conversation_history(self, conversation_id: str, limit: int = 10) -> str:
        """Get formatted conversation history for LLM context"""
        messages = self.get_messages(conversation_id, limit)
        
        history = []
        for msg in messages:
            history.append(f"{msg.role}: {msg.content}")
        
        return "\n".join(history)
