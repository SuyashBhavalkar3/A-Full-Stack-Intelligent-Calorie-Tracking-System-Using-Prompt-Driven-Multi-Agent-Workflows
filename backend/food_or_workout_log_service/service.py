from sqlalchemy.orm import Session
from datetime import date
from uuid import UUID

from .models import FoodLog, DailyNutrition, LogType


# TODO: Replace with real goal_service integration
def get_user_goals(user_id: UUID, db: Session):
    return {
        "calories": 2200,
        "protein": 150,
        "carbs": 250,
        "fat": 70,
    }



def get_or_create_daily_nutrition(db: Session, user_id: UUID, today: date) -> DailyNutrition:
    daily = db.query(DailyNutrition).filter_by(user_id=user_id, date=today).first()

    if not daily:
        goals = get_user_goals(user_id, db)

        daily = DailyNutrition(
            user_id=user_id,
            date=today,
            remaining_calories=goals["calories"],
            remaining_protein=goals["protein"],
            remaining_carbs=goals["carbs"],
            remaining_fat=goals["fat"],
        )
        db.add(daily)
        db.commit()
        db.refresh(daily)

    return daily



def process_llm_log(db: Session, user_id: UUID, llm_data: dict) -> DailyNutrition:
    today = date.today()
    daily = get_or_create_daily_nutrition(db, user_id, today)

    intent = llm_data["intent"]
    nutrition = llm_data["nutrition"]

    # Safe calorie handling - ensure values are numeric
    calories = nutrition.get("calories_kcal", 0)
    calories = calories if isinstance(calories, (int, float)) else 0
    
    protein = nutrition.get("protein_g", 0)
    protein = protein if isinstance(protein, (int, float)) else 0
    
    carbs = nutrition.get("carbs_g", 0)
    carbs = carbs if isinstance(carbs, (int, float)) else 0
    
    fat = nutrition.get("fat_g", 0)
    fat = fat if isinstance(fat, (int, float)) else 0

    # Save individual parsed items
    for item in llm_data.get("parsed_data", []):
        # Handle both food (calories_kcal) and exercise (calories_estimate) fields
        item_calories = item.get("calories_kcal") or item.get("calories_estimate", 0)
        
        log = FoodLog(
            user_id=user_id,
            type=LogType.food if intent == "food" else LogType.exercise,
            raw_input=llm_data.get("input"),
            name=item.get("name"),
            quantity=item.get("quantity"),
            unit=item.get("unit"),
            calories_kcal=item_calories,
            protein_g=item.get("protein_g", 0),
            carbs_g=item.get("carbs_g", 0),
            fat_g=item.get("fat_g", 0),
            fiber_g=item.get("fiber_g", 0),
            confidence=item.get("confidence", 0),
        )
        db.add(log)

    if intent == "food":
        # Food reduces net calories (stored as consumed_calories)
        daily.consumed_calories += calories
        daily.consumed_protein += protein
        daily.consumed_carbs += carbs
        daily.consumed_fat += fat

        # Remaining calories decrease (food is negative contribution)
        daily.remaining_calories -= calories
        daily.remaining_protein -= protein
        daily.remaining_carbs -= carbs
        daily.remaining_fat -= fat

    elif intent == "exercise":
        # Exercise increases net calories available (burned_calories)
        daily.burned_calories += calories
        # Remaining calories increase (exercise is positive contribution)
        daily.remaining_calories += calories

    # Prevent negative values
    daily.remaining_calories = max(0, daily.remaining_calories)
    daily.remaining_protein = max(0, daily.remaining_protein)
    daily.remaining_carbs = max(0, daily.remaining_carbs)
    daily.remaining_fat = max(0, daily.remaining_fat)

    db.commit()
    db.refresh(daily)

    return daily