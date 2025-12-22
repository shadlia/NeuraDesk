from app.database.client import supabase_client
from app.schemas.conversations import Conversation
import os
from dotenv import load_dotenv

load_dotenv()

class ConversationRepository:
    def __init__(self):
        self.client = supabase_client.client
        self.table_name = "conversations"
    
    def get_conversations(self, user_id: str) -> list[Conversation]:
        data = self.client.table(self.table_name).select("*").eq("user_id", user_id).execute()
        conversations = []
        for row in data.data:
            conversations.append(
                Conversation(
                id=row["id"],
                user_id=row["user_id"],
                title=row["title"],
                is_favourite=row["is_favorite"],
                is_archived=row["is_archived"],
                created_at=row["created_at"],
                updated_at=row["updated_at"]
            ))
        return conversations
    
    def get_conversation(self, conversation_id: str) -> Conversation:
        data = self.client.table(self.table_name).select("*").eq("id", conversation_id).execute()
        return Conversation(
            id=data.data[0]["id"],
            user_id=data.data[0]["user_id"],
            title=data.data[0]["title"],
            is_favourite=data.data[0]["is_favorite"],
            is_archived=data.data[0]["is_archived"],
            created_at=data.data[0]["created_at"],
            updated_at=data.data[0]["updated_at"]
        )
    
    def create_conversation(self, user_id: str, title: str):
        return self.client.table(self.table_name).insert({"user_id": user_id, "title": title}).execute()
    
    def update_conversation(self, conversation_id: str, title: str = None, is_favorite: bool = None):
        update_data = {}
        if title is not None:
            update_data["title"] = title
        if is_favorite is not None:
            update_data["is_favorite"] = is_favorite
            
        if not update_data:
            return None
            
        return self.client.table(self.table_name).update(update_data).eq("id", conversation_id).execute()
    
    def delete_conversation(self, conversation_id: str):
        return self.client.table(self.table_name).delete().eq("id", conversation_id).execute()