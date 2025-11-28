from dotenv import load_dotenv
import os
from google import genai
load_dotenv()
from langchain_google_genai import ChatGoogleGenerativeAI
from app.services.langfuse_service import LangfuseConfig

# Initialize Gemini client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))


def ask_question(question: str, context: str) -> str:
    """
    Ask a question to Gemini LLM using context.
    """
    prompt = f"Context: {context}\n\nQuestion: {question}\nAnswer:"
    langfuse_config = LangfuseConfig(session_id="123")    
    model = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.7,
    )
    response = model.invoke(prompt,
     config={"callbacks": [langfuse_config._initialize_with_langchain()]})
    return response.text
