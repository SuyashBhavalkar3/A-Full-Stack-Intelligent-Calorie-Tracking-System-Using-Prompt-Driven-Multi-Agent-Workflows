from sqlalchemy import Column, Integer, Date, ForeignKey, UniqueConstraint
from database.database import Base

class WaterLog(Base):
    __tablename__ = "water_logs"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    date = Column(Date, nullable=False)
    glasses_consumed = Column(Integer, default=0)

    __table_args__ = (
        UniqueConstraint("user_id", "date", name="unique_user_day"),
    )