from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date
from pydantic import BaseModel
from typing import Union

from database.database import get_db
from auth_service.dependencies import get_current_user
from .schemas import LLMLogRequest, DailyNutritionResponse
from .service import process_llm_log, get_or_create_daily_nutrition
from .models import DailyNutrition
from llm_service.service import process_user_input

router = APIRouter(prefix="/food-or-workout", tags=["Food/Workout Log"])


class SimpleLogRequest(BaseModel):
    input: str


@router.post("/log", response_model=DailyNutritionResponse)
def log_food_or_exercise(
    data: Union[SimpleLogRequest, LLMLogRequest],
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Handle both simple text input and full LLMLogRequest
    if isinstance(data, SimpleLogRequest) or (hasattr(data, 'input') and not hasattr(data, 'intent')):
        # Process simple text input through LLM
        text_input = data.input if hasattr(data, 'input') else data.dict().get('input', '')
        llm_result = process_user_input(text_input)
        log_data = llm_result
    else:
        # Use full LLMLogRequest data
        log_data = data.dict()
    
    daily = process_llm_log(db, current_user.id, log_data)

    return DailyNutritionResponse(
        date=daily.date,
        consumed_calories=daily.consumed_calories,
        consumed_protein=daily.consumed_protein,
        consumed_carbs=daily.consumed_carbs,
        consumed_fat=daily.consumed_fat,
        burned_calories=daily.burned_calories,
        remaining_calories=daily.remaining_calories,
        remaining_protein=daily.remaining_protein,
        remaining_carbs=daily.remaining_carbs,
        remaining_fat=daily.remaining_fat,
    )


@router.get("/today", response_model=DailyNutritionResponse)
def get_today_summary(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    today = date.today()

    daily = db.query(DailyNutrition).filter_by(user_id=current_user.id, date=today).first()

    if not daily:
        daily = get_or_create_daily_nutrition(db, current_user.id, today)

    return DailyNutritionResponse(
        date=daily.date,
        consumed_calories=daily.consumed_calories,
        consumed_protein=daily.consumed_protein,
        consumed_carbs=daily.consumed_carbs,
        consumed_fat=daily.consumed_fat,
        burned_calories=daily.burned_calories,
        remaining_calories=daily.remaining_calories,
        remaining_protein=daily.remaining_protein,
        remaining_carbs=daily.remaining_carbs,
        remaining_fat=daily.remaining_fat,
    )


@router.get("/logs/today")
def get_today_logs(
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """Get all food and exercise logs for today"""
    today = date.today()
    
    from .models import FoodLog
    
    logs = db.query(FoodLog).filter(
        FoodLog.user_id == current_user.id,
        FoodLog.logged_at >= date.today().strftime('%Y-%m-%d 00:00:00')
    ).order_by(FoodLog.logged_at.desc()).all()
    
    # Format logs for frontend
    result = []
    for log in logs:
        result.append({
            "id": str(log.id),
            "name": log.name or log.raw_input,
            "calories": log.calories_kcal,
            "protein": log.protein_g,
            "carbs": log.carbs_g,
            "fat": log.fat_g,
            "time": log.logged_at.strftime("%H:%M") if log.logged_at else "now",
            "type": "food" if log.type.value == "food" else "workout",
            "category": log.name,
        })
    
    return result