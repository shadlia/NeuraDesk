import os
import json
from typing import Optional, List

from pydantic import BaseModel
from langgraph.checkpoint.memory import InMemorySaver
from langchain.agents import create_agent
from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace, HuggingFaceEndpointEmbeddings

from app.intergrations.langfuse import LangfuseConfig


class LLMService:
    """
    Unified service for interacting with LLMs via LangChain + Langfuse.
    Handles prompt loading, message formatting, and model invocation.

    Models used:
        - Chat: DeepSeek-V3 (via HuggingFace Inference API)
        - Classification: Qwen2.5-72B-Instruct (via HuggingFace Inference API)
        - Embeddings: all-mpnet-base-v2 (via HuggingFace Endpoint)
    """

    # Model identifiers
    CHAT_MODEL = "deepseek-ai/DeepSeek-V3"
    CLASSIFICATION_MODEL = "Qwen/Qwen2.5-72B-Instruct"
    EMBEDDING_MODEL = "sentence-transformers/all-mpnet-base-v2"

    def __init__(
        self,
        model_name: str = CHAT_MODEL,
        temperature: float = 0.4,
    ):
        self.model_name = model_name
        self.temperature = temperature
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.hf_token = os.getenv("HUGGINGFACE_API_KEY")
        self.memory_saver = InMemorySaver()

    # ── Model Factories ──────────────────────────────────────────────

    def _create_huggingface_model(self, repo_id: Optional[str] = None) -> ChatHuggingFace:
        """Create a HuggingFace Chat model using the Inference API."""
        model_id = repo_id or self.model_name
        llm = HuggingFaceEndpoint(
            repo_id=model_id,
            huggingfacehub_api_token=self.hf_token,
            task="text-generation",
            max_new_tokens=1024,
            temperature=self.temperature,
        )
        return ChatHuggingFace(llm=llm)

    # ── Core Invoke ──────────────────────────────────────────────────

    def invoke(
        self,
        prompt_name: str,
        user_content: str,
        trace_name: str,
        structured_output: Optional[BaseModel] = None,
        conversation_id: Optional[str] = None,
        use_short_term_memory: Optional[bool] = False,
    ) -> str:
        """
        Invoke the appropriate HuggingFace model.

        For classification (structured_output is set):
            Uses Qwen to extract JSON matching the Pydantic schema.
        For chat (default):
            Uses DeepSeek-V3 with LangGraph agent and short-term memory.
        """
        langfuse_config = LangfuseConfig()
        prompt_template = langfuse_config.get_prompt(prompt_name).prompt[0]["content"]

        # ── Classification Path ──────────────────────────────────────
        if structured_output:
            return self._invoke_classification(prompt_template, user_content, structured_output)

        # ── Chat Path ────────────────────────────────────────────────
        return self._invoke_chat(prompt_template, user_content, trace_name, conversation_id, langfuse_config)

    # ── Private Helpers ──────────────────────────────────────────────

    def _invoke_classification(self, prompt_template: str, user_content: str, structured_output):
        """Run classification via Qwen with JSON schema enforcement."""
        model = self._create_huggingface_model(self.CLASSIFICATION_MODEL)

        schema_str = json.dumps(structured_output.model_json_schema(), indent=2)
        system_instruction = (
            f"{prompt_template}\n\n"
            f"IMPORTANT: You MUST respond ONLY with valid JSON that matches the following schema:\n{schema_str}"
        )

        messages = [
            {"role": "system", "content": system_instruction},
            {"role": "user", "content": user_content},
        ]
        response = model.invoke(messages)

        try:
            content = response.content
            if "{" in content and "}" in content:
                json_str = content[content.find("{"):content.rfind("}") + 1]
                data = json.loads(json_str)
                return structured_output(**data)
        except Exception as e:
            print(f"[CLASSIFICATION] Parse error: {e}")

        # Fallback: return a "don't store" classification
        return structured_output(
            should_store=False,
            category="ephemeral",
            key="none",
            value="",
            importance=0.0,
            reason="Parse error — could not extract valid JSON from model response",
        )

    def _invoke_chat(self, prompt_template, user_content, trace_name, conversation_id, langfuse_config):
        """Run chat via DeepSeek-V3 with LangGraph agent + short-term memory."""
        model = self._create_huggingface_model()
        agent = create_agent(model=model, checkpointer=self.memory_saver)

        response = agent.invoke(
            {"messages": [
                {"role": "assistant", "content": prompt_template},
                {"role": "user", "content": user_content},
            ]},
            config={
                "callbacks": [langfuse_config._initialize_with_langchain()],
                "run_name": trace_name,
                "configurable": {"thread_id": conversation_id},
            },
        )

        # Extract content from last non-empty message
        last_msg = response["messages"][-1]
        content = getattr(last_msg, "content", "") or ""
        if not content.strip() and len(response["messages"]) > 1:
            content = getattr(response["messages"][-2], "content", "") or ""
        return content

    # ── Embeddings ───────────────────────────────────────────────────

    def get_embedding(self, text: str) -> List[float]:
        """Generate an embedding vector for the given text."""
        embeddings = HuggingFaceEndpointEmbeddings(
            model=self.EMBEDDING_MODEL,
            task="feature-extraction",
            huggingfacehub_api_token=self.hf_token,
        )
        emb = embeddings.embed_query(text)
        print(f"[EMBEDDING] Text: {text[:30]}... | Dimensions: {len(emb)}")
        return emb


# Singleton instance for reuse across the app
_llm_service = LLMService()
