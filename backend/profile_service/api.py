from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from profile_service.schemas import ProfileCreate, ProfileResponse
from database.models.user_profile_setup import UserProfile
from auth_service.dependencies import get_current_user
from goal_service.calculator import calculate_bmr, ACTIVITY_FACTORS

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.post("/setup", response_model=ProfileResponse)
def setup_profile(
    payload: ProfileCreate,
    request: Request,
    current_user=Depends(get_current_user)
):
    db: Session = request.state.db

    existing = db.query(UserProfile).filter_by(user_id=current_user.id).first()
    if existing:
        # Update existing profile
        existing.age = payload.age
        existing.height_cm = payload.height_cm
        existing.weight_kg = payload.weight_kg
        existing.gender = payload.gender
        existing.activity_level = payload.activity_level
    else:
        # Create new profile
        profile = UserProfile(
            user_id=current_user.id,
            **payload.dict()
        )
        db.add(profile)

    db.commit()

    # Calculate recommended calories using Mifflin-St Jeor + activity multiplier
    # Use payload values (updated values) for calculation
    try:
        bmr = calculate_bmr(payload.weight_kg, payload.height_cm, payload.age, payload.gender)
        multiplier = ACTIVITY_FACTORS.get(payload.activity_level, 1.2)
        recommended = int(round(bmr * multiplier))
        # Ensure within reasonable validated bounds (frontend expects >=1000)
        recommended = max(1000, recommended)
    except Exception:
        recommended = 0

    response_obj = {
        "user_id": current_user.id,
        "age": payload.age,
        "height_cm": payload.height_cm,
        "weight_kg": payload.weight_kg,
        "gender": payload.gender,
        "activity_level": payload.activity_level,
        "recommended_calories": recommended,
    }

    return response_obj


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    request: Request,
    current_user=Depends(get_current_user)
):
    db: Session = request.state.db

    profile = db.query(UserProfile).filter_by(user_id=current_user.id).first()
    if not profile:
        raise HTTPException(404, "Profile not found")

    # Compute recommended calories based on stored profile
    try:
        bmr = calculate_bmr(profile.weight_kg, profile.height_cm, profile.age, profile.gender)
        multiplier = ACTIVITY_FACTORS.get(profile.activity_level, 1.2)
        recommended = int(round(bmr * multiplier))
        recommended = max(1000, recommended)
    except Exception:
        recommended = 0

    return {
        "user_id": profile.user_id,
        "age": profile.age,
        "height_cm": profile.height_cm,
        "weight_kg": profile.weight_kg,
        "gender": profile.gender,
        "activity_level": profile.activity_level,
        "recommended_calories": recommended,
    }