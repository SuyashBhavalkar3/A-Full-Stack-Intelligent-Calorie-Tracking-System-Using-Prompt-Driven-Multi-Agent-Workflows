from typing import TypedDict, Optional, Dict

class LLMState(TypedDict):
    input: str
    intent: Optional[str]
    parsed_data: Optional[Dict]
    nutrition: Optional[Dict]