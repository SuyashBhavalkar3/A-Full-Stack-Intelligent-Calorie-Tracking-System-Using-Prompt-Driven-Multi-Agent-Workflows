import os
from langchain_groq import ChatGroq

_llm_instance = None  # singleton

def get_llm():
    global _llm_instance

    if _llm_instance is None:
        _llm_instance = ChatGroq(
            model="llama-3.3-70b-versatile",
            temperature=0.1,
            api_key=os.getenv("GROQ_API_KEY")
        )

    return _llm_instance