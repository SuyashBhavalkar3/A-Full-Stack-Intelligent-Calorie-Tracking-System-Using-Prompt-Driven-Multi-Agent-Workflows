from llm_client import get_llm

llm = get_llm()
print(llm.invoke("Say hello").content)