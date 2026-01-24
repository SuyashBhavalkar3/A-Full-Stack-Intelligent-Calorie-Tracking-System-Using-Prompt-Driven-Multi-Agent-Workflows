from pydantic import BaseModel

class WaterGoalCreate(BaseModel):
    target_liters: float


class WaterStatusResponse(BaseModel):
    target_glasses: int
    consumed_glasses: int
    remaining_glasses: int
    percentage: float