import { useState, useRef, useCallback } from 'react';

interface UseAudioRecorderReturn {
  isRecording: boolean;
  recordedAudio: Blob | null;
  isLoading: boolean;
  error: string | null;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<void>;
  clearRecording: () => void;
  requestPermission: () => Promise<boolean>;
}

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedAudio, setRecordedAudio] = useState<Blob | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    try {
      clearError();
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      // Store stream for cleanup
      streamRef.current = stream;
      // Stop the stream immediately - we're just requesting permission
      stream.getTracks().forEach((track) => track.stop());
      return true;
    } catch (err) {
      const errorMessage = err instanceof DOMException
        ? `Microphone permission denied: ${err.message}`
        : 'Failed to access microphone. Please check permissions.';
      setError(errorMessage);
      console.error('Microphone permission error:', err);
      return false;
    }
  }, [clearError]);

  const startRecording = useCallback(async () => {
    try {
      clearError();
      setIsLoading(true);

      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('MediaRecorder API not supported in your browser');
      }

      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      streamRef.current = stream;
      audioChunksRef.current = [];

      // Create MediaRecorder with appropriate mime type
      const mimeType = getSupportedMimeType();
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType,
      });

      mediaRecorderRef.current = mediaRecorder;

      // Collect audio chunks
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      // Handle recording stop
      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: mimeType });
        setRecordedAudio(blob);
      };

      mediaRecorder.onerror = (event) => {
        setError(`Recording error: ${event.error}`);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to start recording';
      setError(errorMessage);
      console.error('Start recording error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [clearError]);

  const stopRecording = useCallback(async () => {
    try {
      clearError();

      if (mediaRecorderRef.current && isRecording) {
        mediaRecorderRef.current.stop();
        setIsRecording(false);

        // Stop all tracks in the stream
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => {
            track.stop();
          });
          streamRef.current = null;
        }
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to stop recording';
      setError(errorMessage);
      console.error('Stop recording error:', err);
    }
  }, [isRecording, clearError]);

  const clearRecording = useCallback(() => {
    setRecordedAudio(null);
    audioChunksRef.current = [];
    clearError();
  }, [clearError]);

  return {
    isRecording,
    recordedAudio,
    isLoading,
    error,
    startRecording,
    stopRecording,
    clearRecording,
    requestPermission,
  };
}

/**
 * Get the first supported MIME type for audio recording
 * Fallback to undefined if none are supported (browser will use default)
 */
function getSupportedMimeType(): string {
  const mimeTypes = [
    'audio/webm',
    'audio/webm;codecs=opus',
    'audio/ogg;codecs=opus',
    'audio/mp4',
    'audio/wav',
    'audio/mpeg',
  ];

  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  // Return empty string to let browser use default
  return '';
}
