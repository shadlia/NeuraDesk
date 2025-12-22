from pydantic import BaseModel


class Conversation(BaseModel):
    id: str
    user_id: str
    title: str
    is_favourite: bool
    is_archived: bool
    created_at: str
    updated_at: str

class ConversationUpdate(BaseModel):
    title: str = None
    is_favourite: bool = None
