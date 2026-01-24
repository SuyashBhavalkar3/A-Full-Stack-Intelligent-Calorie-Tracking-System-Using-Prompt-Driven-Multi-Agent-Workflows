from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import date

from database.database import get_db
from auth_service.dependencies import get_current_user
from .schemas import LLMLogRequest, DailyNutritionResponse
from .service import process_llm_log, get_or_create_daily_nutrition
from .models import DailyNutrition

router = APIRouter(prefix="/food-or-workout", tags=["Food/Workout Log"])


@router.post("/log", response_model=DailyNutritionResponse)
def log_food_or_exercise(
    data: LLMLogRequest,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    daily = process_llm_log(db, current_user.id, data.dict())

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