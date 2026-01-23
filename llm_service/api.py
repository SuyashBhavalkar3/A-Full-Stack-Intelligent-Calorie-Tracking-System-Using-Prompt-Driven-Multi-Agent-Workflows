from fastapi import APIRouter
from pydantic import BaseModel
from llm_service.service import process_user_input
from fastapi import Depends, HTTPException, Request
from auth_service.dependencies import get_current_user
from sqlalchemy.orm import Session
from database.models.user_profile_setup import UserProfile
from database.models.user_goal_setup import UserGoal
from datetime import datetime

router = APIRouter()


class LogRequest(BaseModel):
    text: str

@router.post("/log")
def log_input(
    payload: LogRequest,
    request: Request,
    current_user=Depends(get_current_user)
):
    db: Session = request.state.db

    profile = db.query(UserProfile).filter_by(user_id=current_user.id).first()
    goal = db.query(UserGoal).filter_by(user_id=current_user.id).first()
    if not goal:
        raise HTTPException(400, "Set your goal before using AI logging")
    if not profile:
        raise HTTPException(400, "Complete your profile before using AI logging")

    result = process_user_input(payload.text, db, current_user.id)

    return result