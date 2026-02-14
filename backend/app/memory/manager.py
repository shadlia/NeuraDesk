from app.database.repositories.memory import MemoryRepository
from app.database.repositories.vector import VectorRepository
from app.memory.classifier import MemoryClassifier
from app.schemas.memory import MemoryFact, MemoryType
from typing import List, Optional
from app.ai.llm import _llm_service

class MemoryManager:
    """
    Main orchestrator for the memory system.
    Coordinates between classifier, structured store, and vector store.
    """
    
    def __init__(self):
        self.memory_repository = MemoryRepository()
        self.vector_repository = VectorRepository()
        self.classifier = MemoryClassifier()
    
    async def process_query(
        self, 
        user_id: str,
        user_message: str,
        profile: dict,
        relevant_memories: List[dict] = None
    ) -> Optional[MemoryFact]:
        """
        Process a conversation turn to extract and store memories.
        
        This is called after each AI response to check if anything should be remembered.
        """
        
        # 1. Prepare context for classification
        search_results = []
        for m in (relevant_memories or []):
            if hasattr(m, 'value'):
                search_results.append(m.value)
            elif isinstance(m, dict):
                search_results.append(m.get('value', m.get('content', '')))
        search_context = "\n".join(search_results)
        full_facts_str = f"User Profile: {str(profile)}\nRecent Relevant Memories: {search_context}"
        
        # 2. Classify the user message
        classification = await self.classifier.classify_fact(
            user_message=user_message,
            old_facts=full_facts_str
        )
        if not classification.should_store:
            return None
            
        # 3. Entity Resolution
        # Try to find an existing project this relates to
        base_project_key = self._align_project_key(classification, profile, relevant_memories)
        
        # 4. Key Generation & Category Adjustment
        # Handles milestone logic and timestamping
        fact_key, category = self._resolve_fact_key(classification, base_project_key)
        
        # 5. Value Enhancement
        # Improves generic values (e.g. "finished") with context from the key
        fact_value = classification.value
        if category == MemoryType.PROJECT_MILESTONE:
            fact_value = self._enhance_milestone_value(fact_value, fact_key, base_project_key)

        # 6. Create & Store
        fact = MemoryFact(
            user_id=user_id,
            category=category,
            importance=classification.importance,
            key=fact_key,
            value=fact_value,
            context=f"Q: {user_message}"
        )
        
        if fact.category != MemoryType.EPHEMERAL:
            fact = await self.memory_repository.store_fact(fact)
            
            # Semantic Index
            feature_text = f"{fact.key}: {fact.value}"
            embedding = _llm_service.get_embedding(feature_text)
            
            await self.vector_repository.store_embedding(
                user_id=user_id,
                text=feature_text,
                embedding=embedding,
                metadata={
                    "category": fact.category.value,
                    "key": fact.key,
                    "importance": fact.importance
                }
            )
        
        return fact
    
    async def get_relevant_memories(
        self, 
        user_id: str,
        query: str,
        limit: int = 5
    ) -> List[MemoryFact]:
        """
        Retrieve relevant memories for a given query.
        Combines structured and vector search.
        """
        
        # 1. Get structured facts (just top 5 recent for now)
        # specific_facts = await self.memory_repository.get_facts(user_id=user_id, limit=5)
        
        # 2. Semantic Search 
        query_embedding = _llm_service.get_embedding(query)
        vector_results = await self.vector_repository.search_similar(
            user_id=user_id,
            query_embedding=query_embedding,
            limit=limit,
            match_threshold=0.5 
        )
        
        relevant_memories = []
        
        # Convert vector results to MemoryFact-like objects so the LLM can read them
        for res in vector_results:
            relevant_memories.append(MemoryFact(
                user_id=user_id,
                category=MemoryType.EPHEMERAL, 
                importance=0.8,
                key="context", 
                value=res["content"],
                context=res["content"]
            ))
        
        return relevant_memories
    
    async def get_user_profile(self, user_id: str) -> dict:
        """
        Get a summary of what we know about the user.
        Useful for context injection.
        """
        
        personal_facts = await self.memory_repository.get_facts(
            user_id=user_id,
            category=MemoryType.PERSONAL
        )
        
        preferences = await self.memory_repository.get_facts(
            user_id=user_id,
            category=MemoryType.PREFERENCE
        )
        
        projects = await self.memory_repository.get_facts(
            user_id=user_id,
            category=MemoryType.PROJECT
        )
        
        # Also get milestones so the AI has full project context
        milestones = await self.memory_repository.get_facts(
            user_id=user_id,
            category=MemoryType.PROJECT_MILESTONE
        )
        
        all_projects = projects + milestones
        
        return {
            "personal": [{"key": f.key, "value": f.value} for f in personal_facts],
            "preferences": [{"key": f.key, "value": f.value} for f in preferences],
            "projects": [{"key": f.key, "value": f.value} for f in all_projects]
        }

    def _align_project_key(self, classification, profile: dict, relevant_memories: List[MemoryFact] = None) -> Optional[str]:
        """
        Entity resolution: See if the new fact relates to an existing project.
        Scans both profile and semantically retrieved memories.
        """
        try:
            # 1. Pool all known project keys
            existing_projects = []
            
            # From structured profile
            if profile and 'projects' in profile:
                existing_projects.extend(profile['projects'])
                
            # From relevant memories (semantic context)
            if relevant_memories:
                for rm in relevant_memories:
                    # Check both category and key content
                    cat = getattr(rm, 'category', '')
                    key = getattr(rm, 'key', '')
                    val = getattr(rm, 'value', '')
                    
                    if cat in [MemoryType.PROJECT, MemoryType.PROJECT_MILESTONE] or 'project' in key:
                        existing_projects.append({'key': key, 'value': val})

            if not existing_projects:
                return None

            # 2. Prepare search terms
            # clean the new key (e.g. "project_y_frontend" -> "y frontend")
            new_key_clean = classification.key.lower().replace('project_', '').replace('_', ' ')
            new_value_clean = classification.value.lower()
            
            # 3. Fuzzy Match
            for p in existing_projects:
                # Extract clean base key (e.g. "project_y_milestone_123" -> "project_y")
                raw_key = p['key'].lower()
                
                # specific logic to find the "root" key
                if '_milestone_' in raw_key:
                    base_key = raw_key.split('_milestone_')[0]
                else:
                    base_key = raw_key
                
                # Check for direct key match
                # e.g. existing="project_y", new="project_y_update" -> MATCH
                if base_key == classification.key.lower():
                    return base_key
                
                # Check if new key contains base key (e.g. new="project_y_frontend", base="project_y")
                if base_key in classification.key.lower():
                    return base_key
                    
                # Check content/value match
                # If the project name "NeuraDesk" acts as the ID "project_neuradesk"
                project_name_guess = base_key.replace('project_', '').replace('_', ' ')
                
                # Robust matching for project names
                if project_name_guess:
                     # Check if the exact phrase "project <name>" appears
                     # This is safe even for short names like "Y" -> "project y"
                     if f"project {project_name_guess}" in new_value_clean or f"project {project_name_guess}" in new_key_clean:
                         print(f"[ENTITY RESOLUTION] Found match via 'project {project_name_guess}' -> {base_key}")
                         return base_key

                     # key match (e.g. key="project_x_update", name="x")
                     # Split new key into parts and check if name is a distinct part
                     # e.g. "project_x_update" -> ["project", "x", "update"]
                     new_key_parts = new_key_clean.split(' ')
                     if project_name_guess in new_key_parts:
                          print(f"[ENTITY RESOLUTION] Found match via key part '{project_name_guess}' -> {base_key}")
                          return base_key

                     # For longer unique names, simple substring match is usually safe
                     if len(project_name_guess) >= 4:
                         if project_name_guess in new_value_clean:
                             print(f"[ENTITY RESOLUTION] Found match via substring '{project_name_guess}' -> {base_key}")
                             return base_key

            return None
            
        except Exception as e:
            print(f"[ENTITY RESOLUTION ERROR] {str(e)}")
            return None

    def _resolve_fact_key(self, classification, base_project_key: Optional[str]) -> tuple[str, str]:
        """
        Determines the final storage key and category.
        Handles converting PROJECT updates to MILESTONEs and timestamping.
        """
        import time
        from datetime import datetime
        
        category = classification.category
        fact_key = classification.key.lower().replace(' ', '_')
        
        # Default key for non-project/milestone
        if category not in [MemoryType.PROJECT, MemoryType.PROJECT_MILESTONE]:
            return fact_key, category

        # Logic for Projects & Milestones
        if category == MemoryType.PROJECT_MILESTONE:
            if base_project_key:
                base_key = base_project_key
            else:
                # Fallback: try to extract from key or namespace
                base_key = fact_key.split('_milestone_')[0]
                if not base_key.startswith('project_'):
                    base_key = f"project_{base_key}"
            
            date_str = datetime.now().strftime("%Y-%m-%d")
            ts_short = int(time.time()) % 10000
            final_key = f"{base_key}_milestone_{date_str}_{ts_short}"
            
        elif category == MemoryType.PROJECT:
            if base_project_key:
                # Update to existing project -> Treat as Milestone
                category = MemoryType.PROJECT_MILESTONE
                date_str = datetime.now().strftime("%Y-%m-%d")
                ts_short = int(time.time()) % 10000
                final_key = f"{base_project_key}_milestone_{date_str}_{ts_short}"
            else:
                # New Project
                if not fact_key.startswith('project_'):
                    final_key = f"project_{fact_key}"
                else:
                    final_key = fact_key
                    
        return final_key, category

    def _enhance_milestone_value(self, original_value: str, fact_key: str, base_project_key: Optional[str]) -> str:
        """
        Enhances generic milestone descriptions (e.g. "finished") by extracting context from the key.
        """
        clean_value = original_value.strip().lower()
        # If generic value
        if clean_value in ['finished', 'completed', 'started', 'done', 'updated', 'fixed']:
            key_parts = fact_key.split('_')
            
            # Identify base parts to exclude (project name)
            if '_milestone_' in fact_key:
                effective_base = fact_key.split('_milestone_')[0]
                base_parts = effective_base.split('_')
            elif base_project_key:
                base_parts = base_project_key.lower().split('_')
            else:
                base_parts = []
            
            interesting_parts = []
            for p in key_parts:
                p_lower = p.lower()
                # Filter out structural words, digits, and project name parts
                if (p_lower not in ['project', 'milestone', 'finished', 'completed', 'started', 'done', 'updated', 'fixed'] 
                    and not p[0].isdigit() 
                    and p_lower not in base_parts):
                    interesting_parts.append(p.capitalize())
            
            if interesting_parts:
                enhanced_value = f"{' '.join(interesting_parts)} {original_value}"
                print(f"[VALUE ENHANCE] '{original_value}' -> '{enhanced_value}'")
                return enhanced_value
                
        return original_value