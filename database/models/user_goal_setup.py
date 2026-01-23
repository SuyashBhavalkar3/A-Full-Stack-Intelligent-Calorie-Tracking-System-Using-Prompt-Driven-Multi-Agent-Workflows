from sqlalchemy import Column, Integer, Float, Date, ForeignKey, DateTime
from sqlalchemy.sql import func
from database.database import Base

class UserGoal(Base):
    __tablename__ = "user_goals"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)

    target_weight = Column(Float, nullable=False)
    weekly_goal_kg = Column(Float, nullable=False)

    target_date = Column(Date, nullable=False)

    daily_calories = Column(Integer, nullable=False)

    protein_g = Column(Integer, nullable=False)
    carbs_g = Column(Integer, nullable=False)
    fat_g = Column(Integer, nullable=False)

    created_at = Column(DateTime, server_default=func.now())