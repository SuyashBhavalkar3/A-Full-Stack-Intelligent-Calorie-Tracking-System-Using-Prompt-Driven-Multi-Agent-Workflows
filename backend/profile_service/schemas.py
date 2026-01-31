from pydantic import BaseModel, Field

class ProfileCreate(BaseModel):
    age: int = Field(..., ge=10, le=100)
    height_cm: float = Field(..., ge=100, le=250)
    weight_kg: float = Field(..., ge=30, le=300)
    gender: str
    activity_level: str


class ProfileResponse(ProfileCreate):
    user_id: int
    recommended_calories: int = 0