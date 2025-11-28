from langfuse.langchain import CallbackHandler
from langfuse import Langfuse
import os
from dotenv import load_dotenv
import json

load_dotenv()
class LangfuseClientSingleton:
    _instance = None

    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            load_dotenv()
            cls._instance = Langfuse(
                secret_key=os.getenv("LANGFUSE_SECRET_KEY"),
                public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
                host=os.getenv("LANGFUSE_BASE_URL"),
                environment="dev",
            )
        return cls._instance


class LangfuseConfig:
    def __init__(self, session_id, trace_name=None):
        self.session_id = session_id
        self.trace_name = trace_name
        self.langfuse = LangfuseClientSingleton.get_instance()

    def _initialize_with_langchain(self):
        """Initialize Langfuse callback handler for LangChain.
        
        In Langfuse v3, the CallbackHandler uses the global client configuration.
        Session ID and trace name should be passed via LangChain's runnable config.
        """
        handler = CallbackHandler(
            public_key=os.getenv("LANGFUSE_PUBLIC_KEY"),
            update_trace=True
        )
        return handler

    def get_langchain_config(self):
        """Get LangChain configuration with Langfuse metadata.
        
        Returns a config dict that can be passed to LangChain's invoke/run methods.
        """
        metadata = {
            "langfuse_session_id": self.session_id,
        }
        if self.trace_name:
            metadata["langfuse_trace_name"] = self.trace_name
            
        return {
            "callbacks": [self._initialize_with_langchain()],
            "metadata": metadata
        }

    def get_prompt(self, prompt_id, label=None):
        if label:
            return self.langfuse.get_prompt(
                prompt_id,
                label=label,
            )
        return self.langfuse.get_prompt(prompt_id)
