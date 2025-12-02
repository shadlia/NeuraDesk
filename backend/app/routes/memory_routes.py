from fastapi import APIRouter, HTTPException, Depends
from app.models.memory import MemoryFact, MemoryQuery, MemoryType
from app.memory.manager import MemoryManager
from typing import List

router = APIRouter(prefix="/memory", tags=["memory"])
memory_manager = MemoryManager()


@router.get("/facts/{user_id}", response_model=List[MemoryFact])
async def get_user_facts(
    user_id: str,
    fact_type: MemoryType = None,
    limit: int = 50
):
    """Get all stored facts for a user"""
    try:
        facts = await memory_manager.structured_store.get_facts(
            user_id=user_id,
            fact_type=fact_type,
            limit=limit
        )
        return facts
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/profile/{user_id}")
async def get_user_profile(user_id: str):
    """Get a summary of what we know about the user"""
    try:
        profile = await memory_manager.get_user_profile(user_id)
        return profile
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/facts", response_model=MemoryFact)
async def create_fact(fact: MemoryFact):
    """Manually add a fact"""
    try:
        stored_fact = await memory_manager.structured_store.store_fact(fact)
        return stored_fact
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/facts/{fact_id}")
async def delete_fact(fact_id: str, user_id: str):
    """Delete a specific fact"""
    try:
        success = await memory_manager.structured_store.delete_fact(fact_id, user_id)
        if not success:
            raise HTTPException(status_code=404, detail="Fact not found")
        return {"message": "Fact deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/facts/{fact_id}", response_model=MemoryFact)
async def update_fact(fact_id: str, user_id: str, updates: dict):
    """Update a specific fact"""
    try:
        updated_fact = await memory_manager.structured_store.update_fact(
            fact_id=fact_id,
            user_id=user_id,
            updates=updates
        )
        if not updated_fact:
            raise HTTPException(status_code=404, detail="Fact not found")
        return updated_fact
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
