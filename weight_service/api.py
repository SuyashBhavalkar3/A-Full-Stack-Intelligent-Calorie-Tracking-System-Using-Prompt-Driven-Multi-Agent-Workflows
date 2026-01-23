from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime

from weight_service.schemas import (
    WeightLogCreate,
    WeightLogResponse,
    WeightHistoryResponse,
)
from database.models.weight_log import WeightLog
from auth_service.dependencies import get_current_user

router = APIRouter(prefix="/weight", tags=["Weight"])


# -----------------------------
# Add weight entry
# -----------------------------
@router.post("/log", response_model=WeightLogResponse)
def log_weight(
    payload: WeightLogCreate,
    request: Request,
    current_user=Depends(get_current_user)
):
    db: Session = request.state.db

    log_time = payload.logged_at or datetime.utcnow()

    entry = WeightLog(
        user_id=current_user.id,
        weight_kg=payload.weight_kg,
        logged_at=log_time
    )

    db.add(entry)
    db.commit()
    db.refresh(entry)

    return entry


# -----------------------------
# Get weight history
# -----------------------------
@router.get("/history", response_model=WeightHistoryResponse)
def get_weight_history(
    request: Request,
    current_user=Depends(get_current_user)
):
    db: Session = request.state.db

    logs = (
        db.query(WeightLog)
        .filter_by(user_id=current_user.id)
        .order_by(WeightLog.logged_at.asc())
        .all()
    )

    return {
        "history": logs
    }