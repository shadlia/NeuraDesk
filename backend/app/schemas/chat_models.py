from pydantic import BaseModel

class ChatRequest(BaseModel):
    message: str
    context: str
    user_id: str

class ChatResponse(BaseModel):
    message: str
    answer: str
