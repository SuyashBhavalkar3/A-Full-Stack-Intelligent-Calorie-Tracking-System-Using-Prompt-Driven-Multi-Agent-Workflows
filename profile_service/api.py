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
        raise HTTPException(400, "Profile already exists")

    profile = UserProfile(
        user_id=current_user.id,
        **payload.dict()
    )

    db.add(profile)
    db.commit()
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