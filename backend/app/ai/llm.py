from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.intergrations.langfuse import LangfuseConfig
import os
from langgraph.checkpoint.memory import InMemorySaver

from typing import Optional, Type, TypeVar, List
from pydantic import BaseModel
from app.schemas.classification_schema import MemoryClassificationSchema
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_huggingface import HuggingFaceEndpoint, ChatHuggingFace, HuggingFaceEndpointEmbeddings

T = TypeVar('T', bound=BaseModel)


class LLMService:
    """
    Unified service for interacting with LLMs via LangChain + Langfuse.
    Handles prompt loading, message formatting, and model invocation.
    Currently supports Gemini, but designed to be extensible for other providers.
    """
    
    def __init__(
        self, 
        model_name: str = "deepseek-ai/DeepSeek-V3",
        temperature: float = 0.4,
        api_key: Optional[str] = None,
        memory_saver: Optional[InMemorySaver] = None
    ):
        """
        Initialize the LLM service.
        
        Args:
            model_name: LLM model to use (e.g., "gemini-2.5-flash", "gpt-4", etc.)
            temperature: Model temperature (0.0 - 1.0)
            api_key: Optional API key, defaults to GEMINI_API_KEY env var
        """
        self.model_name = model_name
        self.temperature = temperature
        self.api_key = api_key or os.getenv("GEMINI_API_KEY")
        self.memory_saver = InMemorySaver()
    def _create_gemini_model(
        self, 
        name: Optional[str] = None,
        response_format: Optional[dict] = None
    ) -> ChatGoogleGenerativeAI:
        """
        Create a Gemini model instance for fast classification.
        """
        kwargs = {
            "model": "gemini-2.0-flash",  # Fast model for classification
            "api_key": self.api_key,
            "temperature": self.temperature,
        }
        if name:
            kwargs["name"] = name
        if response_format:
            kwargs["model_kwargs"] = {"response_mime_type": "application/json"}
        return ChatGoogleGenerativeAI(**kwargs)
    def _create_huggingface_model(self, repo_id: Optional[str] = None):
        """
        Create a HuggingFace Chat model using the Inference API.
        Uses ChatHuggingFace wrapper for chat-style interactions.
        """
        model_id = repo_id or self.model_name
        llm = HuggingFaceEndpoint(
            repo_id=model_id,
            huggingfacehub_api_token=os.getenv("HUGGINGFACE_API_KEY"),
            task="text-generation",
            max_new_tokens=1024,
            temperature=self.temperature,
        )
        chat_model = ChatHuggingFace(llm=llm)
        return chat_model

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
        Invoke HuggingFace models for both chat and classification.
        Uses different models to avoid rate limits.
        """
        langfuse_config = LangfuseConfig()
        prompt_template = langfuse_config.get_prompt(prompt_name).prompt[0]["content"]
        
        # Use a smaller/faster HuggingFace model for classification
        if structured_output:
            # Use Qwen for classification (available on HF serverless inference)
            model = self._create_huggingface_model("Qwen/Qwen2.5-72B-Instruct")
            messages = [{"role": "system", "content": prompt_template}, {"role": "user", "content": user_content}]
            response = model.invoke(messages)
            
            # Parse the response into structured output
            import json
            try:
                # Try to extract JSON from the response
                content = response.content
                # Find JSON in the response
                if "{" in content and "}" in content:
                    json_start = content.find("{")
                    json_end = content.rfind("}") + 1
                    json_str = content[json_start:json_end]
                    data = json.loads(json_str)
                    return structured_output(**data)
            except Exception as e:
                print(f"Classification parse error: {e}")
                # Return a default "don't store" classification
                return structured_output(
                    should_store=False,
                    category="ephemeral",
                    key="none",
                    value="",
                    importance=0.0
                )
            return response
        
        # Use HuggingFace for regular chat
        model = self._create_huggingface_model()
        agent = create_agent(
            model=model,
            checkpointer=self.memory_saver
        )
        response = agent.invoke(
            {"messages": [{"role": "assistant", "content": prompt_template}, {"role": "user", "content": user_content}]},
            config={
                "callbacks": [langfuse_config._initialize_with_langchain()],
                "run_name": trace_name,
                "configurable": {"thread_id": conversation_id}
            }
        )
        print(response)
        
        # Handle empty response
        last_msg = response["messages"][-1]
        content = getattr(last_msg, 'content', '') or ''
        if not content.strip() and len(response["messages"]) > 1:
            content = getattr(response["messages"][-2], 'content', '') or ''
        return content

    def get_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a given text using Google GenerativeAIEmbeddings.
        
        Args:
            text: Text to embed
            
        Returns:
            List of embedding floats
        """
        embeddings = HuggingFaceEndpointEmbeddings(
            model="sentence-transformers/all-mpnet-base-v2",
            task="feature-extraction",
            huggingfacehub_api_token=os.getenv("HUGGINGFACE_API_KEY"),
        )
        emb = embeddings.embed_query(text)
        print(f"[EMBEDDING] Text: {text[:20]}... | Size: {len(emb)}")
        return emb


# Singleton instance for reuse
_llm_service = LLMService()
