from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import AIMessage, HumanMessage, SystemMessage
from app.services.langfuse_service import LangfuseConfig
import os

def ask_question(question: str, context: str = "") -> str:
    """
    Ask a question to Gemini using LangChain + Langfuse.
    """
    # 1. Load prompt from Langfuse
    prompt_name = "neura_qa_v1"
    langfuse_config = LangfuseConfig(session_id="123")  
    prompt_template = langfuse_config.get_prompt(prompt_name).prompt[0]["content"]
    print("Prompt loaded from Langfuse: ", prompt_template)
    
    # 2. Combine context + question into a string
    user_content = f"""
    Context:
    {context}

    Question:
    {question}
    """
    
    # 3. Format messages for Gemini
    formatted_prompt_text = [
        SystemMessage(content=prompt_template),
        HumanMessage(content=user_content),
    ]

    # 4. Init Gemini model
    model = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
        api_key=os.getenv("GEMINI_API_KEY"),
        temperature=0.4,
    )

    # 5. Call model + log to Langfuse
    response = model.invoke(
        formatted_prompt_text,
        config={"callbacks": [langfuse_config._initialize_with_langchain()]}
    )
    return response.content
