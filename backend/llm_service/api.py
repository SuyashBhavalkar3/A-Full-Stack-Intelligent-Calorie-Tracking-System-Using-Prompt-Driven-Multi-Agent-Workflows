from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel
from sqlalchemy.orm import Session
from llm_service.service import process_user_input
from auth_service.dependencies import get_current_user
from database.models.user_profile_setup import UserProfile
from database.models.user_goal_setup import UserGoal
from food_or_workout_log_service.service import process_llm_log
from database.database import get_db

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

    # 1. Validate profile & goals
    profile = db.query(UserProfile).filter_by(user_id=current_user.id).first()
    goal = db.query(UserGoal).filter_by(user_id=current_user.id).first()

    if not goal:
        raise HTTPException(400, "Set your goal before using AI logging")
    if not profile:
        raise HTTPException(400, "Complete your profile before using AI logging")

    # 2. Run LLM
    llm_result = process_user_input(payload.text)

    """
    llm_result format:
    {
        input: "...",
        intent: "food" | "exercise",
        parsed_data: [...],
        nutrition: {...}
    }
    """

    # 3. Store + update daily nutrition automatically
    try:
        daily = process_llm_log(db, current_user.id, llm_result)
    except Exception as e:
        db.rollback()
        raise HTTPException(500, f"Food log failed: {str(e)}")

    # 4. Return combined response
    return {
        "llm_result": llm_result,
        "daily_nutrition": {
            "date": str(daily.date),
            "consumed_calories": daily.consumed_calories,
            "burned_calories": daily.burned_calories,
            "remaining_calories": daily.remaining_calories,
            "remaining_protein": daily.remaining_protein,
            "remaining_carbs": daily.remaining_carbs,
            "remaining_fat": daily.remaining_fat,
        }
    }