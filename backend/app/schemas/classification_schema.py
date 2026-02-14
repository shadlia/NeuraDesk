from pydantic import BaseModel, Field
from enum import Enum
from typing import Optional, Literal


class FactCategory(str, Enum):
    """Categories for memory classification"""
    PERSONAL = "personal"
    PREFERENCE = "preference"
    PROJECT = "project"
    PROJECT_MILESTONE = "project_milestone"
    EPHEMERAL = "ephemeral"


class MemoryClassificationSchema(BaseModel):
    """
    Structured output schema for memory classification.
    Used with Gemini's structured output feature.
    """
    category: Literal["personal", "preference", "project", "project_milestone", "ephemeral"] = Field(
        description="The category of the user's statement. Use 'project' for NEW projects. Use 'project_milestone' for updates on EXISTING projects. Use 'preference' or 'personal' for SKILLS, tools, languages, and technologies."
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
        description="A concise key (e.g., 'skill_python', 'project_name', 'preference_theme'). For skills, prefix with 'skill_'."
    )
    value: Optional[str] = Field(
        default=None,
        description="The actual value of the fact. For milestones, use a full descriptive phrase. For skills, just the skill name or proficiency."
    )
    reason: str = Field(
        description="Brief explanation of the classification decision"
    )
    
    
        
