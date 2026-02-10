"""
Speech-to-Text Service using AssemblyAI
Handles audio file transcription with proper error handling and security.
"""

import asyncio
import os
import logging
from io import BytesIO
from typing import Optional

import aiofiles
import assemblyai as aai
from fastapi import HTTPException

logger = logging.getLogger(__name__)


class SpeechToTextService:
    """Service for transcribing audio using AssemblyAI API"""

    def __init__(self):
        """Initialize AssemblyAI client with API key from environment"""
        self.api_key = os.getenv("ASSEMBLYAI_API_KEY")
        if not self.api_key:
            raise ValueError(
                "ASSEMBLYAI_API_KEY environment variable is not set. "
                "Please configure it before using the speech-to-text service."
            )
        aai.settings.api_key = self.api_key

    async def transcribe_audio(
        self, 
        audio_data: bytes, 
        language: Optional[str] = None,
        timeout: int = 60
    ) -> str:
        """
        Transcribe audio data using AssemblyAI API.
        
        Args:
            audio_data: Raw audio file bytes (WAV, MP3, M4A, etc.)
            language: Optional language code (e.g., 'en', 'es', 'fr')
            timeout: Timeout in seconds for the transcription request
            
        Returns:
            Transcribed text
            
        Raises:
            HTTPException: If transcription fails or API call times out
        """
        try:
            # Validate audio data
            if not audio_data or len(audio_data) == 0:
                raise HTTPException(
                    status_code=400,
                    detail="Audio file is empty or missing"
                )

            if len(audio_data) > 100 * 1024 * 1024:  # 100MB limit
                raise HTTPException(
                    status_code=413,
                    detail="Audio file is too large (max 100MB)"
                )

            # Create config for transcription
            config = aai.TranscriptionConfig(
                language_code=language,
                # Use the universal model (best balance of accuracy and speed)
                # Valid options: 'best', 'nano', 'slam-1', 'universal'
                # Note: speech_models is a list (speech_model is deprecated)
                speech_models=["universal"],
                # Optional: Enable speaker detection
                speaker_labels=False,
                # Enable punctuation for better readability
                punctuate=True,
                # Format=JSON gives detailed output
                format_text=True,
            )

            # Create transcriber
            transcriber = aai.Transcriber(config=config)

            # Run transcription in thread pool to avoid blocking
            loop = asyncio.get_event_loop()
            transcript = await loop.run_in_executor(
                None,
                transcriber.transcribe,
                audio_data
            )

            # Check for transcription errors
            if transcript.status == aai.TranscriptStatus.error:
                logger.error(f"Transcription error: {transcript.error}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Transcription failed: {transcript.error}"
                )

            if not transcript.text:
                # Return a sensible message if no speech was detected
                return ""

            return transcript.text

        except asyncio.TimeoutError:
            logger.error("Transcription request timed out")
            raise HTTPException(
                status_code=504,
                detail="Transcription request timed out. Please try again."
            )
        except Exception as e:
            logger.error(f"Unexpected error during transcription: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail="An error occurred during transcription. Please try again."
            )

    async def transcribe_audio_file(
        self, 
        file_path: str,
        language: Optional[str] = None
    ) -> str:
        """
        Transcribe audio from a local file path.
        
        Args:
            file_path: Path to audio file
            language: Optional language code
            
        Returns:
            Transcribed text
        """
        try:
            async with aiofiles.open(file_path, 'rb') as f:
                audio_data = await f.read()
            return await self.transcribe_audio(audio_data, language)
        except FileNotFoundError:
            raise HTTPException(
                status_code=404,
                detail="Audio file not found"
            )


# Global instance
_speech_service: Optional[SpeechToTextService] = None


def get_speech_to_text_service() -> SpeechToTextService:
    """
    Get or initialize the SpeechToTextService singleton.
    
    Returns:
        SpeechToTextService instance
    """
    global _speech_service
    if _speech_service is None:
        _speech_service = SpeechToTextService()
    return _speech_service
