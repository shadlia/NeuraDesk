from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage, SystemMessage
from app.services.langfuse_service import LangfuseConfig
import os
import json
from typing import Optional, Type, TypeVar
from pydantic import BaseModel
from app.models.classification_schema import MemoryClassificationSchema
from langchain.agents import create_agent
from langchain.agents.structured_output import ToolStrategy

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
            response_format=ToolStrategy(structured_output)

        )
        else:
            agent = create_agent(
            model=model,
            system_prompt=prompt_template,
        )
        
        response = agent.invoke({"messages": [{"role": "user", "content": user_content}]},
        config={"callbacks": [langfuse_config._initialize_with_langchain()],
                "run_name": trace_name 
        })
        if structured_output:
            return response["structured_response"]
        return response["messages"][1].content
    

# Singleton instance for reuse
_llm_service = LLMService()


def ask_question(question: str, context: str = "",facts: str = "") -> str:
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

    Information about user:
    {facts}
    """
    
    return _llm_service.invoke(
        prompt_name="neura_qa_v1",
        user_content=user_content,
        trace_name="qa_session"
    )

def classify_fact_structured(user_message: str,old_facts: str):
    """
    Classify a fact using structured output with Pydantic validation.
    
    Args:
        user_message: User's message containing potential facts
        
    Returns:
        MemoryClassificationSchema instance with validated data
    """
    
    return _llm_service.invoke(
        prompt_name="MemoryFactClassifier",
        user_content=f"User statement: {user_message} , User old facts: {old_facts} ",
        trace_name="fact_classifier",
        structured_output=MemoryClassificationSchema,
       
    )

