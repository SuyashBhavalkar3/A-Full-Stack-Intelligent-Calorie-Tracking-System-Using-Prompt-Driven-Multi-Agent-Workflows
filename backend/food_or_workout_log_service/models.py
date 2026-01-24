from sqlalchemy import Column, Integer, String, Float, Date, DateTime, Enum, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import uuid
import enum

from database.database import Base


class LogType(enum.Enum):
    food = "food"
    exercise = "exercise"


class FoodLog(Base):
    __tablename__ = "food_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    type = Column(Enum(LogType), nullable=False)
    raw_input = Column(String, nullable=False)

    name = Column(String)
    quantity = Column(Float)
    unit = Column(String)

    calories_kcal = Column(Float, default=0)
    protein_g = Column(Float, default=0)
    carbs_g = Column(Float, default=0)
    fat_g = Column(Float, default=0)
    fiber_g = Column(Float, default=0)
    confidence = Column(Float, default=0)

    logged_at = Column(DateTime, default=func.now())
    created_at = Column(DateTime, default=func.now())


class DailyNutrition(Base):
    __tablename__ = "daily_nutrition"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    date = Column(Date, nullable=False)

    consumed_calories = Column(Float, default=0)
    consumed_protein = Column(Float, default=0)
    consumed_carbs = Column(Float, default=0)
    consumed_fat = Column(Float, default=0)

    burned_calories = Column(Float, default=0)

    remaining_calories = Column(Float, default=0)
    remaining_protein = Column(Float, default=0)
    remaining_carbs = Column(Float, default=0)
    remaining_fat = Column(Float, default=0)

    created_at = Column(DateTime, default=func.now())
    updated_at = Column(DateTime, default=func.now(), onupdate=func.now())