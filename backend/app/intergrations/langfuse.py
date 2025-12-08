from langfuse.langchain import CallbackHandler
from langfuse import Langfuse
import os
from dotenv import load_dotenv

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
    def __init__(self):
      
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

    def get_prompt(self, prompt_name, label=None,version=None):
        if label and version:
            return self.langfuse.get_prompt(
                prompt_name,
                label=label,
                version=version,
            )   
        elif label:
            return self.langfuse.get_prompt(
                prompt_name,
                label=label,
            )
        elif version:
            return self.langfuse.get_prompt(
                prompt_name,
                version=version,
            )
        return self.langfuse.get_prompt(prompt_name)
