from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.services.langfuse_service import LangfuseConfig
import os
from typing import Optional


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
        api_key: Optional[str] = None
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
        
    def _create_model(self, name: Optional[str] = None) -> ChatGoogleGenerativeAI:
        """
        Create an LLM model instance.
        Currently uses ChatGoogleGenerativeAI, but can be extended for other providers.
        """
        kwargs = {
            "model": self.model_name,
            "api_key": self.api_key,
            "temperature": self.temperature,
        }
        if name:
            kwargs["name"] = name
        return ChatGoogleGenerativeAI(**kwargs)
    
    def invoke(
        self,
        prompt_name: str,
        user_content: str,
        session_id: str,
        model_name_override: Optional[str] = None
    ) -> str:
        """
        Generic method to invoke the LLM with a Langfuse prompt.
        
        Args:
            prompt_name: Name of the prompt in Langfuse
            user_content: User's input content
            session_id: Session ID for Langfuse tracking
            model_name_override: Optional name for the model instance
            
        Returns:
            Model response content as string
        """
        # 1. Load prompt from Langfuse
        langfuse_config = LangfuseConfig(session_id=session_id)
        prompt_template = langfuse_config.get_prompt(prompt_name).prompt[0]["content"]
        
        # 2. Format messages for LLM
        messages = [
            SystemMessage(content=prompt_template),
            HumanMessage(content=user_content),
        ]
        
        # 3. Create model instance
        model = self._create_model(name=model_name_override)
        
        # 4. Invoke model with Langfuse callbacks
        response = model.invoke(
            messages,
            config={"callbacks": [langfuse_config._initialize_with_langchain()]}
        )
        
        return response.content



_llm_service = LLMService()


def ask_question(question: str, context: str = "") -> str:
    """
    Ask a question to the LLM using LangChain + Langfuse.
    
    Args:
        question: User's question
        context: Optional context to provide
        
    Returns:
        AI response as string
    """
    user_content = f"""
    Context:
    {context}

    Question:
    {question}
    """
    
    return _llm_service.invoke(
        prompt_name="neura_qa_v1",
        user_content=user_content,
        session_id="qa_session"
    )


def classify_fact(user_message: str) -> str:
    """
    Classify a fact using the LLM via LangChain + Langfuse.
    
    Args:
        user_message: User's message containing potential facts
        
    Returns:
        Classification result as JSON string
    """
    user_content = f"""
    user_fact:
    {user_message}
    """
    
    return _llm_service.invoke(
        prompt_name="MemoryFactClassifier",
        user_content=user_content,
        session_id="fact_classifier",
        model_name_override="fact_classifier"
    )