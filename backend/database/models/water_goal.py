from sqlalchemy import Column, Integer, Float, ForeignKey
from database.database import Base

class WaterGoal(Base):
    __tablename__ = "water_goals"

    user_id = Column(Integer, ForeignKey("users.id"), primary_key=True)
    target_liters = Column(Float, nullable=False)
    glass_size_ml = Column(Integer, default=250)
    target_glasses = Column(Integer, nullable=False)