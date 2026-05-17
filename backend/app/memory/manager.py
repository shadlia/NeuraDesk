import time
from datetime import datetime
from typing import List, Optional

from app.ai.llm import _llm_service
from app.database.repositories.memory import MemoryRepository
from app.database.repositories.vector import VectorRepository
from app.memory.classifier import MemoryClassifier
from app.schemas.memory import MemoryFact, MemoryType


class MemoryManager:
    """
    Main orchestrator for the memory system.
    Coordinates between classifier, structured store, and vector store.

    Workflow:
        1. Classify incoming user message (extract facts)
        2. Resolve entity (link to existing project if applicable)
        3. Generate storage key & adjust category
        4. Enhance generic values with context
        5. Store in structured DB + vector DB
    """

    def __init__(self):
        self.memory_repository = MemoryRepository()
        self.vector_repository = VectorRepository()
        self.classifier = MemoryClassifier()

    # ── Public API ───────────────────────────────────────────────────

    async def process_query(
        self,
        user_id: str,
        user_message: str,
        profile: dict,
        relevant_memories: List[dict] = None,
    ) -> Optional[MemoryFact]:
        """
        Process a conversation turn to extract and store memories.
        Called after each AI response to check if anything should be remembered.
        """
        # 1. Prepare context for classification
        search_context = self._build_search_context(relevant_memories)
        full_facts_str = f"User Profile: {str(profile)}\nRecent Relevant Memories: {search_context}"

        # 2. Classify the user message
        classification = await self.classifier.classify_fact(
            user_message=user_message,
            old_facts=full_facts_str,
        )
        if not classification.should_store:
            return None

        # 3. Entity Resolution — link to existing project if applicable
        base_project_key = self._align_project_key(classification, profile, relevant_memories)

        # 4. Key Generation & Category Adjustment
        fact_key, category = self._resolve_fact_key(classification, base_project_key)

        # 5. Value Enhancement — improve generic values like "finished"
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
            context=f"Q: {user_message}",
        )

        if fact.category != MemoryType.EPHEMERAL:
            fact = await self.memory_repository.store_fact(fact)
            await self._store_embedding(user_id, fact)

        return fact

    async def get_relevant_memories(
        self,
        user_id: str,
        query: str,
        limit: int = 5,
    ) -> List[MemoryFact]:
        """
        Retrieve relevant memories for a given query via semantic (vector) search.
        """
        query_embedding = _llm_service.get_embedding(query)
        vector_results = await self.vector_repository.search_similar(
            user_id=user_id,
            query_embedding=query_embedding,
            limit=limit,
            match_threshold=0.5,
        )

        return [
            MemoryFact(
                user_id=user_id,
                category=MemoryType.EPHEMERAL,
                importance=0.8,
                key="context",
                value=res["content"],
                context=res["content"],
            )
            for res in vector_results
        ]

    async def get_user_profile(self, user_id: str) -> dict:
        """
        Build a summary of what we know about the user.
        Used for context injection into chat prompts.
        """
        personal_facts = await self.memory_repository.get_facts(
            user_id=user_id, category=MemoryType.PERSONAL
        )
        preferences = await self.memory_repository.get_facts(
            user_id=user_id, category=MemoryType.PREFERENCE
        )
        projects = await self.memory_repository.get_facts(
            user_id=user_id, category=MemoryType.PROJECT
        )
        milestones = await self.memory_repository.get_facts(
            user_id=user_id, category=MemoryType.PROJECT_MILESTONE
        )

        return {
            "personal": [{"key": f.key, "value": f.value} for f in personal_facts],
            "preferences": [{"key": f.key, "value": f.value} for f in preferences],
            "projects": [{"key": f.key, "value": f.value} for f in projects + milestones],
        }

    # ── Private Helpers ──────────────────────────────────────────────

    @staticmethod
    def _build_search_context(relevant_memories: Optional[List] = None) -> str:
        """Extract text values from memory objects/dicts into a single context string."""
        results = []
        for m in relevant_memories or []:
            if hasattr(m, "value"):
                results.append(m.value)
            elif isinstance(m, dict):
                results.append(m.get("value", m.get("content", "")))
        return "\n".join(results)

    async def _store_embedding(self, user_id: str, fact: MemoryFact) -> None:
        """Generate and store an embedding for the given fact."""
        feature_text = f"{fact.key}: {fact.value}"
        embedding = _llm_service.get_embedding(feature_text)

        await self.vector_repository.store_embedding(
            user_id=user_id,
            text=feature_text,
            embedding=embedding,
            metadata={
                "category": fact.category.value,
                "key": fact.key,
                "importance": fact.importance,
            },
        )

    def _align_project_key(
        self,
        classification,
        profile: dict,
        relevant_memories: Optional[List[MemoryFact]] = None,
    ) -> Optional[str]:
        """
        Entity resolution: determine if a new fact relates to an existing project.
        Scans both the structured profile and semantically retrieved memories.
        """
        try:
            existing_projects = self._collect_existing_projects(profile, relevant_memories)
            if not existing_projects:
                return None

            new_key_clean = classification.key.lower().replace("project_", "").replace("_", " ")
            new_value_clean = classification.value.lower()

            for p in existing_projects:
                base_key = self._extract_base_key(p["key"])

                # Direct key match
                if base_key == classification.key.lower():
                    return base_key

                # New key contains base key
                if base_key in classification.key.lower():
                    return base_key

                # Content/value matching
                project_name = base_key.replace("project_", "").replace("_", " ")
                if not project_name:
                    continue

                # Exact phrase match: "project <name>"
                if (
                    f"project {project_name}" in new_value_clean
                    or f"project {project_name}" in new_key_clean
                ):
                    print(f"[ENTITY RESOLUTION] Matched via 'project {project_name}' -> {base_key}")
                    return base_key

                # Key-part match: e.g. key="project_x_update" contains part "x"
                if project_name in new_key_clean.split(" "):
                    print(
                        f"[ENTITY RESOLUTION] Matched via key part '{project_name}' -> {base_key}"
                    )
                    return base_key

                # Substring match for longer names (>= 4 chars to avoid false positives)
                if len(project_name) >= 4 and project_name in new_value_clean:
                    print(
                        f"[ENTITY RESOLUTION] Matched via substring '{project_name}' -> {base_key}"
                    )
                    return base_key

            return None

        except Exception as e:
            print(f"[ENTITY RESOLUTION ERROR] {e}")
            return None

    @staticmethod
    def _collect_existing_projects(
        profile: dict, relevant_memories: Optional[List] = None
    ) -> List[dict]:
        """Pool all known project keys from profile and relevant memories."""
        projects = []

        if profile and "projects" in profile:
            projects.extend(profile["projects"])

        for rm in relevant_memories or []:
            cat = getattr(rm, "category", "")
            key = getattr(rm, "key", "")
            val = getattr(rm, "value", "")
            if cat in [MemoryType.PROJECT, MemoryType.PROJECT_MILESTONE] or "project" in key:
                projects.append({"key": key, "value": val})

        return projects

    @staticmethod
    def _extract_base_key(raw_key: str) -> str:
        """Extract the root project key, stripping milestone suffixes."""
        key = raw_key.lower()
        if "_milestone_" in key:
            return key.split("_milestone_")[0]
        return key

    def _resolve_fact_key(self, classification, base_project_key: Optional[str]) -> tuple[str, str]:
        """
        Determine the final storage key and category.
        Converts PROJECT updates to MILESTONEs and adds timestamps.
        """
        category = classification.category
        fact_key = classification.key.lower().replace(" ", "_")

        # Non-project categories keep their key as-is
        if category not in [MemoryType.PROJECT, MemoryType.PROJECT_MILESTONE]:
            return fact_key, category

        date_str = datetime.now().strftime("%Y-%m-%d")
        ts_short = int(time.time()) % 10000

        if category == MemoryType.PROJECT_MILESTONE:
            base_key = base_project_key or fact_key.split("_milestone_")[0]
            if not base_key.startswith("project_"):
                base_key = f"project_{base_key}"
            return f"{base_key}_milestone_{date_str}_{ts_short}", category

        # category == PROJECT
        if base_project_key:
            # Update to existing project -> treat as milestone
            return (
                f"{base_project_key}_milestone_{date_str}_{ts_short}",
                MemoryType.PROJECT_MILESTONE,
            )

        # Brand new project
        if not fact_key.startswith("project_"):
            return f"project_{fact_key}", category
        return fact_key, category

    @staticmethod
    def _enhance_milestone_value(
        original_value: str,
        fact_key: str,
        base_project_key: Optional[str],
    ) -> str:
        """
        Enhance generic milestone descriptions (e.g. "finished") by
        extracting meaningful context from the key.
        """
        GENERIC_VALUES = {"finished", "completed", "started", "done", "updated", "fixed"}
        if original_value.strip().lower() not in GENERIC_VALUES:
            return original_value

        key_parts = fact_key.split("_")

        # Determine which parts belong to the project name (to exclude)
        if "_milestone_" in fact_key:
            base_parts = fact_key.split("_milestone_")[0].split("_")
        elif base_project_key:
            base_parts = base_project_key.lower().split("_")
        else:
            base_parts = []

        # Structural/noise words to filter out
        noise = GENERIC_VALUES | {"project", "milestone"}

        interesting = [
            p.capitalize()
            for p in key_parts
            if p.lower() not in noise and not p[0].isdigit() and p.lower() not in base_parts
        ]

        if interesting:
            enhanced = f"{' '.join(interesting)} {original_value}"
            print(f"[VALUE ENHANCE] '{original_value}' -> '{enhanced}'")
            return enhanced

        return original_value
