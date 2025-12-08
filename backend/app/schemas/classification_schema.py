from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional, Literal


class FactCategory(str, Enum):
    """Categories for memory classification"""
    PERSONAL = "personal"
    PREFERENCE = "preference"
    PROJECT = "project"
    EPHEMERAL = "ephemeral"


class MemoryClassificationSchema(BaseModel):
    """
    Structured output schema for memory classification.
    Used with Gemini's structured output feature.
    """
    category: Literal["personal", "preference", "project", "ephemeral"] = Field(
        description="The category of the user's statement"
    )
    importance: float = Field(
        ge=0.0,
        le=1.0,
        description="Importance score from 0.0 (not important) to 1.0 (very important)"
    )
    should_store: bool = Field(
        description="Whether this fact should be stored in long-term memory"
    )
    key: Optional[str] = Field(
        default=None,
        description="A concise key for this fact (e.g., 'name', 'favorite_game', 'project_name')"
    )
    value: Optional[str] = Field(
        default=None,
        description="The actual value of the fact"
    )
    reason: str = Field(
        description="Brief explanation of the classification decision"
    )
    
    
        
