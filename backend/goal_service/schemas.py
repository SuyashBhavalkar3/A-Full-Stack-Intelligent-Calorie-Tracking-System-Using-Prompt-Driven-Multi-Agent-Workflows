from pydantic import BaseModel, Field, field_serializer, ConfigDict
from datetime import date

class GoalCreate(BaseModel):
    target_weight: float = Field(..., gt=0)
    weekly_goal_kg: float = Field(..., description="0.5 or 1")
    target_calories: int = Field(..., gt=0, description="Daily calorie target")
    goal_type: str = Field(default="lose", description="lose, gain, or maintain")



class GoalResponse(BaseModel):
    model_config = ConfigDict(populate_by_name=True, by_alias=False)
    
    daily_calories: int
    protein_g: int
    carbs_g: int
    fat_g: int
    target_date: date
    target_weight: float
    weekly_goal_kg: float
    goal_type: str = "lose"

    @field_serializer('target_date')
    def serialize_target_date(self, value: date) -> str:
        return value.strftime("%d-%m-%Y")
