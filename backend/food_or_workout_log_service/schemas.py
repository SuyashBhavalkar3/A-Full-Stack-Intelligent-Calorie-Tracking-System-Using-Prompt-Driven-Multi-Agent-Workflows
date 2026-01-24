from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime, date


class ParsedFoodItem(BaseModel):
    name: str
    quantity: float
    unit: Optional[str]
    preparation: Optional[str]
    calories_kcal: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: float
    confidence: float


class NutritionTotals(BaseModel):
    calories_kcal: float
    protein_g: float
    carbs_g: float
    fat_g: float
    fiber_g: Optional[float] = 0


class LLMLogRequest(BaseModel):
    input: str
    intent: str
    parsed_data: List[ParsedFoodItem]
    nutrition: NutritionTotals


class DailyNutritionResponse(BaseModel):
    date: date

    consumed_calories: float
    consumed_protein: float
    consumed_carbs: float
    consumed_fat: float

    burned_calories: float

    remaining_calories: float
    remaining_protein: float
    remaining_carbs: float
    remaining_fat: float


class FoodLogResponse(BaseModel):
    id: str
    name: Optional[str]
    calories_kcal: float
    logged_at: datetime