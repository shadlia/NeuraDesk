from pydantic import BaseModel
from typing import Optional
class ChatRequest(BaseModel):
    message: str
    context: str
    user_id: str
    conversation_id: Optional[str] = None

class ChatResponse(BaseModel):
    message: str
    answer: str
    conversation_id: str
    title: Optional[str] = None
