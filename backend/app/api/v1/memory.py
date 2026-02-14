from fastapi import APIRouter, HTTPException
from app.database.repositories.memory import MemoryRepository
from app.schemas.memory import MemoryFact, MemoryType
from typing import List, Optional

router = APIRouter()

@router.get("/{user_id}", response_model=List[MemoryFact])
async def get_memories(
    user_id: str, 
    category: Optional[MemoryType] = None
):
    """
    Get all structured memories for a user.
    Optionally filter by category (personal, preference, project).
    """
    repo = MemoryRepository()
    try:
        facts = await repo.get_facts(user_id, category=category, limit=100)
        return facts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{fact_id}")
async def delete_memory(fact_id: str, user_id: str):
    """
    Delete a specific memory fact.
    Requires user_id to ensure ownership.
    """
    repo = MemoryRepository()
    try:
        success = await repo.delete_fact(fact_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Fact not found or not owned by user")
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
