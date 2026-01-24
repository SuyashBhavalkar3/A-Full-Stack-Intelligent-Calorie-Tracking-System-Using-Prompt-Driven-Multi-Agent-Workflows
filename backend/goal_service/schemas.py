from pydantic import BaseModel, Field, field_serializer
from datetime import date

class GoalCreate(BaseModel):
    target_weight: float = Field(..., gt=0)
    weekly_goal_kg: float = Field(..., description="0.5 or 1")


class GoalResponse(BaseModel):
    daily_calories: int
    protein_g: int
    carbs_g: int
    fat_g: int
    target_date: date

    @field_serializer('target_date')
    def serialize_target_date(self, value: date) -> str:
        return value.strftime("%d-%m-%Y")