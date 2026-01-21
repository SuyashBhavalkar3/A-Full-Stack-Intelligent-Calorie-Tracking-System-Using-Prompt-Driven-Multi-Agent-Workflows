"""
Authentication service with local auth and Google OAuth.
Handles user registration, login, token generation, and refresh token management.
"""
from datetime import datetime, timedelta, timezone
import secrets

from fastapi import HTTPException, status, Request
from sqlalchemy.orm import Session

from . import models, schemas
from .security import (
    hash_password,
    verify_password,
    create_access_token,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    REFRESH_TOKEN_EXPIRE_DAYS
)
from .oauth import oauth


# =========================
# Helpers
# =========================

def generate_refresh_token() -> str:
    """Generate secure random refresh token."""
    return secrets.token_urlsafe(48)


def get_utc_now():
    """Get current UTC datetime."""
    return datetime.now(timezone.utc)


# =========================
# Local Auth: Registration & Login
# =========================

def register_user(db: Session, data: schemas.RegisterRequest):
    """Register a new user with email and password."""
    # Validate passwords match
    if data.password != data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match"
        )

    # Check if user already exists
    existing_user = db.query(models.User).filter(
        models.User.email == data.email
    ).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user
    user = models.User(
        email=data.email,
        full_name=data.full_name,
        hashed_password=hash_password(data.password),
        provider="local",
        is_active=True
    )

    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create user"
        )

    # Generate tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = generate_refresh_token()
    save_refresh_token(db, user.id, refresh_token)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


def login_user(db: Session, data: schemas.LoginRequest):
    """Authenticate user with email and password."""
    # Find user
    user = db.query(models.User).filter(models.User.email == data.email).first()

    if not user or not user.hashed_password:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Verify password
    if not verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials"
        )

    # Generate tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = generate_refresh_token()
    save_refresh_token(db, user.id, refresh_token)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


# =========================
# Google OAuth
# =========================

async def google_login(request: Request):
    """Redirect to Google OAuth login."""
    try:
        redirect_uri = request.url_for("google_callback")
        return await oauth.google.authorize_redirect(request, redirect_uri)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to redirect to Google OAuth"
        )


async def google_callback(request: Request, db: Session):
    """Handle Google OAuth callback and create/find user in database."""
    try:
        # Exchange authorization code for tokens
        token = await oauth.google.authorize_access_token(request)
        
        if not token:
            raise ValueError("Failed to obtain access token from Google")

        # Fetch user info from Google userinfo endpoint
        user_info = await oauth.google.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            token=token
        )
        user_info = user_info.json()

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Google authentication failed: {str(e)}"
        )

    # Extract user information
    email = user_info.get("email")
    full_name = user_info.get("name", "")
    
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not provided by Google"
        )

    # Find or create user
    user = db.query(models.User).filter(models.User.email == email).first()

    if not user:
        try:
            user = models.User(
                email=email,
                full_name=full_name,
                hashed_password=None,
                provider="google",
                is_active=True
            )
            db.add(user)
            db.commit()
            db.refresh(user)
        except Exception as e:
            db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create user in database"
            )
    
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive"
        )

    # Generate tokens
    access_token = create_access_token({"sub": str(user.id)})
    refresh_token = generate_refresh_token()
    save_refresh_token(db, user.id, refresh_token)

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


# =========================
# Refresh Token Management
# =========================

def save_refresh_token(db: Session, user_id: int, token: str):
    """Save refresh token to database."""
    expires_at = get_utc_now() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)

    refresh = models.RefreshToken(
        token=token,
        user_id=user_id,
        expires_at=expires_at,
        is_revoked=False
    )

    try:
        db.add(refresh)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save refresh token"
        )


def refresh_access_token(db: Session, refresh_token: str):
    """Refresh access token using valid refresh token."""
    # Find refresh token
    token_entry = db.query(models.RefreshToken).filter(
        models.RefreshToken.token == refresh_token,
        models.RefreshToken.is_revoked == False
    ).first()

    if not token_entry:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )

    # Check if expired
    if token_entry.expires_at < get_utc_now():
        # Mark as revoked for security
        token_entry.is_revoked = True
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token expired"
        )

    # Check user is active
    user = db.query(models.User).filter(models.User.id == token_entry.user_id).first()
    if not user or not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User is inactive"
        )

    # Generate new access token
    new_access_token = create_access_token({"sub": str(user.id)})

    # Optional: Rotate refresh token (generate new one)
    new_refresh_token = generate_refresh_token()
    
    # Revoke old refresh token
    token_entry.is_revoked = True
    
    # Save new refresh token
    save_refresh_token(db, user.id, new_refresh_token)

    return {
        "access_token": new_access_token,
        "refresh_token": new_refresh_token,
        "token_type": "bearer"
    }


def revoke_refresh_token(db: Session, refresh_token: str):
    """Revoke a refresh token (logout functionality)."""
    token_entry = db.query(models.RefreshToken).filter(
        models.RefreshToken.token == refresh_token
    ).first()

    if not token_entry:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Refresh token not found"
        )

    try:
        token_entry.is_revoked = True
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to revoke token"
        )