"""
Authentication API routes.
Handles registration, login, token refresh, Google OAuth, and logout.
"""
from fastapi import APIRouter, Depends, Request, status
from sqlalchemy.orm import Session

from . import schemas, service
from .dependencies import get_current_user
from . import models
from database.database import get_db

router = APIRouter()


# =========================
# Local Authentication
# =========================

@router.post("/register", response_model=schemas.TokenResponse, status_code=status.HTTP_201_CREATED)
def register(data: schemas.RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user with email and password."""
    return service.register_user(db, data)


@router.post("/login", response_model=schemas.TokenResponse)
def login(data: schemas.LoginRequest, db: Session = Depends(get_db)):
    """Login with email and password."""
    return service.login_user(db, data)


@router.post("/refresh", response_model=schemas.TokenResponse)
def refresh_token(
    data: schemas.RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Refresh access token using a valid refresh token."""
    return service.refresh_access_token(db, data.refresh_token)


@router.post("/logout", response_model=schemas.MessageResponse, status_code=status.HTTP_200_OK)
def logout(
    data: schemas.RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """Logout by revoking refresh token."""
    service.revoke_refresh_token(db, data.refresh_token)
    return {"message": "Logged out successfully"}


# =========================
# Google OAuth
# =========================

@router.get("/google/login")
async def google_login(request: Request):
    """Redirect to Google OAuth login page."""
    return await service.google_login(request)


@router.get("/google/callback", name="google_callback")
async def google_callback(request: Request, db: Session = Depends(get_db)):
    """Handle Google OAuth callback."""
    return await service.google_callback(request, db)


# =========================
# User Profile (Protected)
# =========================

@router.get("/me", response_model=schemas.UserResponse)
def get_current_user_profile(current_user: models.User = Depends(get_current_user)):
    """Get current authenticated user profile."""
    return current_user