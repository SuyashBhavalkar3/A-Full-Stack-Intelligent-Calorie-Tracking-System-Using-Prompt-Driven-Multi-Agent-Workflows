from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session

from goal_service.schemas import GoalCreate, GoalResponse
from goal_service.calculator import calculate_goal
from database.models.user_goal_setup import UserGoal
from database.models.user_profile_setup import UserProfile
from auth_service.dependencies import get_current_user

router = APIRouter(prefix="/goals", tags=["Goals"])


@router.post("/set", response_model=GoalResponse)
def set_goal(
    payload: GoalCreate,
    request: Request,
    current_user=Depends(get_current_user)
):
    db: Session = request.state.db

    profile = db.query(UserProfile).filter_by(user_id=current_user.id).first()
    if not profile:
        raise HTTPException(400, "Complete profile first")

    existing = db.query(UserGoal).filter_by(user_id=current_user.id).first()
    if existing:
        raise HTTPException(400, "Goal already set")

    result = calculate_goal(profile, payload.target_weight, payload.weekly_goal_kg)

    goal = UserGoal(
        user_id=current_user.id,
        target_weight=payload.target_weight,
        weekly_goal_kg=payload.weekly_goal_kg,
        **result
    )

    db.add(goal)
    db.commit()

    return result


@router.get("/me", response_model=GoalResponse)
def get_my_goal(
    request: Request,
    current_user=Depends(get_current_user)
):
    db: Session = request.state.db

    goal = db.query(UserGoal).filter_by(user_id=current_user.id).first()
    if not goal:
        raise HTTPException(404, "Goal not found")

    return goal