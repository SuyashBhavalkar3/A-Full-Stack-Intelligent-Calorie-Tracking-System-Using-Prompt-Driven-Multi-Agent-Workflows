from fastapi import APIRouter
from pydantic import BaseModel
from llm_service.service import process_user_input

router = APIRouter()


class LogRequest(BaseModel):
    text: str


@router.post("/log")
def log_input(payload: LogRequest):
    result = process_user_input(payload.text)
    return result
