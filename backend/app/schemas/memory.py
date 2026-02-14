from pydantic import BaseModel
from enum import Enum
from typing import Optional
from datetime import datetime


class MemoryType(str, Enum):
    """Classification of memory facts"""
    PERSONAL = "personal"  # Name, age, location, job title
    PREFERENCE = "preference"  # Likes, dislikes, habits
    PROJECT = "project"  # Project names, IDs, goals
    EPHEMERAL = "ephemeral"  # Temporary context (not stored long-term)
    PROJECT_MILESTONE = "project_milestone"  # Project milestones




class MemoryFact(BaseModel):
    """Represents a single memory fact"""
    id: Optional[str] = None
    user_id: str
    category: MemoryType
    importance: float
    key: str  # e.g., "name", "favorite_language", "project_alpha_id"
    value: str  # The actual fact
    context: Optional[str] = None  # Additional context
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None


class MemoryQuery(BaseModel):
    """Query to retrieve relevant memories"""
    user_id: str
    query: str
    limit: int = 5


class MemoryClassificationResult(BaseModel):
    """Result from the classifier"""
    category: str
    importance: float
    key: str
    value: str
    should_store: bool
    reason: Optional[str] = None
