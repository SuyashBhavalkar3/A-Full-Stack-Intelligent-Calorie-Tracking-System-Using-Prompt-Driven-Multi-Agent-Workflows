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
    
    # Calculate macros based on user's target_calories (calories are source of truth)
    result = calculate_goal(
        profile, 
        payload.target_weight, 
        payload.weekly_goal_kg,
        target_calories=payload.target_calories,
        goal_type=payload.goal_type
    )

    if existing:
        # Update existing goal
        existing.target_weight = payload.target_weight
        existing.weekly_goal_kg = payload.weekly_goal_kg
        existing.goal_type = payload.goal_type
        existing.daily_calories = payload.target_calories
        existing.protein_g = result["protein_g"]
        existing.carbs_g = result["carbs_g"]
        existing.fat_g = result["fat_g"]
        existing.target_date = result["target_date"]
        db.commit()
        db.refresh(existing)
        return existing
    else:
        # Create new goal
        goal = UserGoal(
            user_id=current_user.id,
            target_weight=payload.target_weight,
            weekly_goal_kg=payload.weekly_goal_kg,
            goal_type=payload.goal_type,
            daily_calories=payload.target_calories,
            protein_g=result["protein_g"],
            carbs_g=result["carbs_g"],
            fat_g=result["fat_g"],
            target_date=result["target_date"]
        )

        db.add(goal)
        db.commit()
        db.refresh(goal)
        return goal


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
