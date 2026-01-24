from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.orm import Session

from profile_service.schemas import ProfileCreate, ProfileResponse
from database.models.user_profile_setup import UserProfile
from auth_service.dependencies import get_current_user

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
    
    if existing:
        db.refresh(existing)
        return existing
    else:
        db.refresh(profile)
        return profile


@router.get("/me", response_model=ProfileResponse)
def get_my_profile(
    request: Request,
    current_user=Depends(get_current_user)
):
    db: Session = request.state.db

    profile = db.query(UserProfile).filter_by(user_id=current_user.id).first()
    if not profile:
        raise HTTPException(404, "Profile not found")

    return profile