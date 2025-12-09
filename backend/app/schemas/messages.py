from pydantic import BaseModel
from typing import Optional

class Message(BaseModel):
    id: str
    conversation_id: str
    role: str  # 'user' or 'assistant'
    content: str
    created_at: str

class MessageCreate(BaseModel):
    conversation_id: str
    role: str
    content: str
