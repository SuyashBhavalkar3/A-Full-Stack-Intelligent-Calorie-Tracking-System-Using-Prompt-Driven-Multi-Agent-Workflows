"""
Pydantic schemas for Speech-to-Text API
"""

from pydantic import BaseModel, Field
from typing import Optional


class SpeechToTextRequest(BaseModel):
    """Request model for speech-to-text transcription"""
    
    # Note: audio file is passed as multipart/form-data, not in JSON body
    language: Optional[str] = Field(
        default=None,
        description="Optional language code (e.g., 'en', 'es', 'fr')"
    )


class SpeechToTextResponse(BaseModel):
    """Response model for speech-to-text transcription"""
    
    text: str = Field(
        description="Transcribed text from audio"
    )
    language: Optional[str] = Field(
        default=None,
        description="Language code if detected"
    )
    confidence: Optional[float] = Field(
        default=None,
        description="Confidence score of transcription (0-1)"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "text": "I had a chicken sandwich and a protein shake",
                "language": "en",
                "confidence": 0.95
            }
        }


class SpeechToTextErrorResponse(BaseModel):
    """Error response model"""
    
    detail: str = Field(description="Error message")
    
    class Config:
        json_schema_extra = {
            "example": {
                "detail": "Audio file is too large (max 100MB)"
            }
        }
