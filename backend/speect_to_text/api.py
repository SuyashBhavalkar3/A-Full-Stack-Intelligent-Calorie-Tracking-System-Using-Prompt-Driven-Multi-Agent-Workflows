"""
Speech-to-Text API Endpoints
FastAPI endpoints for audio transcription using AssemblyAI
"""

import logging
from fastapi import APIRouter, File, UploadFile, HTTPException, Depends
from fastapi.responses import JSONResponse

from .service import get_speech_to_text_service
from .schemas import SpeechToTextResponse, SpeechToTextErrorResponse

logger = logging.getLogger(__name__)

router = APIRouter(
    prefix="/api/speech-to-text",
    tags=["speech-to-text"],
    responses={
        400: {"model": SpeechToTextErrorResponse, "description": "Invalid audio file"},
        413: {"model": SpeechToTextErrorResponse, "description": "Audio file too large"},
        500: {"model": SpeechToTextErrorResponse, "description": "Server error"},
    }
)


@router.post(
    "/",
    response_model=SpeechToTextResponse,
    summary="Transcribe audio to text",
    description=(
        "Transcribe audio file using AssemblyAI. "
        "Accepts audio in WAV, MP3, M4A, and other common formats. "
        "Maximum file size: 100MB."
    ),
    status_code=200,
)
async def transcribe_audio(
    file: UploadFile = File(
        ...,
        description="Audio file to transcribe (WAV, MP3, M4A, etc.)"
    ),
    language: str = None,
    speech_service = Depends(get_speech_to_text_service),
) -> SpeechToTextResponse:
    """
    Transcribe an audio file to text.
    
    **Request:**
    - `file`: Audio file (required, multipart/form-data)
    - `language`: Optional language code (e.g., 'en', 'es', 'fr')
    
    **Response:**
    - `text`: Transcribed text
    - `language`: Detected or specified language code
    - `confidence`: Confidence score (0-1)
    
    **Example Usage:**
    ```python
    import requests
    
    with open("audio.wav", "rb") as f:
        files = {"file": f}
        params = {"language": "en"}
        response = requests.post(
            "http://localhost:8000/api/speech-to-text/",
            files=files,
            params=params,
            headers={"Authorization": "Bearer YOUR_TOKEN"}
        )
    textuated = response.json()["text"]
    ```
    
    **cURL Example:**
    ```bash
    curl -X POST "http://localhost:8000/api/speech-to-text/" \\
      -H "Authorization: Bearer YOUR_TOKEN" \\
      -F "file=@audio.wav" \\
      -F "language=en"
    ```
    """
    try:
        # Validate file
        if not file.filename:
            raise HTTPException(
                status_code=400,
                detail="No file provided"
            )

        # Read audio data
        audio_data = await file.read()

        # Transcribe
        text = await speech_service.transcribe_audio(
            audio_data=audio_data,
            language=language
        )

        return SpeechToTextResponse(
            text=text,
            language=language,
            confidence=None  # AssemblyAI provides confidence per word, not overall
        )

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unexpected error in transcribe_audio: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An unexpected error occurred during transcription"
        )


@router.get(
    "/health",
    summary="Health check for speech-to-text service",
    description="Check if the speech-to-text service is available",
)
async def health_check() -> dict:
    """
    Check if the speech-to-text service is healthy.
    
    **Response:**
    - `status`: 'ok' if service is available, 'error' otherwise
    - `message`: Status message
    """
    try:
        # Try to access the service to verify API key is configured
        speech_service = get_speech_to_text_service()
        return {
            "status": "ok",
            "message": "Speech-to-text service is operational"
        }
    except ValueError as e:
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "message": str(e)
            }
        )
    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        return JSONResponse(
            status_code=503,
            content={
                "status": "error",
                "message": "Speech-to-text service is unavailable"
            }
        )
