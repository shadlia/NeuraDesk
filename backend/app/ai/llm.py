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

T = TypeVar('T', bound=BaseModel)


class LLMService:
    """
    Unified service for interacting with LLMs via LangChain + Langfuse.
    Handles prompt loading, message formatting, and model invocation.
    Currently supports Gemini, but designed to be extensible for other providers.
    """
    
    def __init__(
        self, 
        model_name: str = "gemini-2.5-flash",
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
    def _create_model(
        self, 
        name: Optional[str] = None,
        response_format: Optional[dict] = None
    ) -> ChatGoogleGenerativeAI:
        """
        Create an LLM model instance.
        Currently uses ChatGoogleGenerativeAI, but can be extended for other providers.
        
        Args:
            name: Optional name for the model instance
            response_format: Optional response format for structured output
        """
        kwargs = {
            "model": self.model_name,
            "name": self.model_name,
            "api_key": self.api_key,
            "temperature": self.temperature,
        }
        if name:
            kwargs["name"] = name
        if response_format:
            kwargs["model_kwargs"] = {"response_mime_type": "application/json"}
        return ChatGoogleGenerativeAI(**kwargs)
    

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
        Generic method to invoke the LLM with a Langfuse prompt.
        
        Args:
            prompt_name: Name of the prompt in Langfuse
            user_content: User's input content
            trace_name: Session ID for Langfuse tracking
            
        Returns:
            Model response content as string
        """
        # Load prompt from Langfuse
        langfuse_config = LangfuseConfig()
        prompt_template = langfuse_config.get_prompt(prompt_name).prompt[0]["content"]
        
    
        # Create agent
        model = self._create_model()
        if structured_output : 
            agent = create_agent(
            model=model,
            response_format=ToolStrategy(structured_output),
            checkpointer=self.memory_saver

        )
        else:
            agent = create_agent(
            model=model,
            checkpointer=self.memory_saver
        )        
        response = agent.invoke({"messages": [{"role":"assistant", "content": prompt_template},{"role": "user", "content": user_content}]},
        config={"callbacks": [langfuse_config._initialize_with_langchain()],
                "run_name": trace_name ,
                "configurable": {"thread_id": conversation_id}    
        })
        print(response)
        if structured_output:
            return response["structured_response"]
        return response["messages"][-1].content

    def get_embedding(self, text: str) -> List[float]:
        """
        Generate embedding for a given text using Google GenerativeAIEmbeddings.
        
        Args:
            text: Text to embed
            
        Returns:
            List of embedding floats
        """
        embeddings = GoogleGenerativeAIEmbeddings(
            model="models/text-embedding-004",
            api_key=self.api_key
        )
        return embeddings.embed_query(text)


# Singleton instance for reuse
_llm_service = LLMService()
