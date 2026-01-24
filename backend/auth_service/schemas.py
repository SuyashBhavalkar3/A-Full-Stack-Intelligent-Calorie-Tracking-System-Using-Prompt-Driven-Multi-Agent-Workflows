"""
Pydantic request and response schemas.
"""
from pydantic import BaseModel, EmailStr, Field
from typing import Optional
from datetime import datetime


# =========================
# Request Schemas
# =========================

class RegisterRequest(BaseModel):
    """User registration request."""
    full_name: str = Field(..., min_length=2, max_length=100, description="User's full name")
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")
    confirm_password: str = Field(..., min_length=8, description="Password confirmation")


class LoginRequest(BaseModel):
    """User login request."""
    email: EmailStr = Field(..., description="User's email address")
    password: str = Field(..., description="User's password")


class RefreshTokenRequest(BaseModel):
    """Refresh token request."""
    refresh_token: str = Field(..., description="Valid refresh token")


# =========================
# Response Schemas
# =========================

class TokenResponse(BaseModel):
    """Authentication token response."""
    access_token: str = Field(..., description="JWT access token")
    token_type: str = Field(default="bearer", description="Token type")
    refresh_token: Optional[str] = Field(None, description="Refresh token for token rotation")


class UserResponse(BaseModel):
    """User profile response."""
    id: int = Field(..., description="User ID")
    email: str = Field(..., description="User email")
    full_name: str = Field(..., description="User's full name")
    provider: str = Field(..., description="Authentication provider (local/google)")
    is_active: bool = Field(..., description="User account status")
    created_at: datetime = Field(..., description="Account creation timestamp")

    class Config:
        from_attributes = True  # Updated for Pydantic v2


class MessageResponse(BaseModel):
    """Generic message response."""
    message: str = Field(..., description="Response message")