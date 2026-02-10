import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, Loader2, Mic, MicOff, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useAudioRecorder } from "@/hooks/use-audio-recorder";
import { speechToTextApi } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface AIInputBoxProps {
  onSubmit: (input: string) => Promise<void>;
  isLoading?: boolean;
}

const SUGGESTIONS = [
  "2 eggs and toast for breakfast",
  "Chicken salad with olive oil",
  "30 min morning run",
  "Large pepperoni pizza slice",
];

export function AIInputBox({ onSubmit, isLoading = false }: AIInputBoxProps) {
  const [input, setInput] = useState("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const { toast } = useToast();
  
  const {
    isRecording,
    recordedAudio,
    error: recordingError,
    startRecording,
    stopRecording,
    clearRecording,
  } = useAudioRecorder();

  // Track if we've already started transcription for current audio blob
  const transcriptionStartedRef = useRef(false);

  /**
   * Automatically transcribe and submit when recording stops
   * This useEffect watches recordedAudio and triggers the flow:
   * 1. Audio recorded → transcribe starts automatically
   * 2. Transcription completes → immediately submit
   * 3. Submission completes → clear recording state
   */
  useEffect(() => {
    // Only proceed if we have audio and haven't already started transcription
    if (!recordedAudio || transcriptionStartedRef.current) {
      return;
    }

    // Mark that we're starting transcription to prevent duplicate attempts
    transcriptionStartedRef.current = true;
    setTranscriptionError(null);
    setIsTranscribing(true);

    const performAutoSubmit = async () => {
      try {
        // Step 1: Transcribe audio
        const response = await speechToTextApi.transcribe(recordedAudio);
        const { text } = response.data;

        // Validate transcription result
        if (!text || text.trim().length === 0) {
          throw new Error(
            "No speech detected. Please speak clearly and try again."
          );
        }

        // Step 2: Auto-submit transcribed text using existing handler
        await onSubmit(text);

        // Step 3: Clear recording state and show success
        clearRecording();
        toast({
          title: "Voice input processed successfully",
          description: `"${text.substring(0, 50)}${text.length > 50 ? "..." : ""}"`,
        });
      } catch (error) {
        // Handle errors gracefully
        const errorMessage =
          error instanceof Error ? error.message : "Failed to process voice input";
        
        setTranscriptionError(errorMessage);
        toast({
          title: "Voice processing failed",
          description: errorMessage,
          variant: "destructive",
        });

        console.error("Auto-transcription error:", error);
      } finally {
        setIsTranscribing(false);
      }
    };

    performAutoSubmit();
  }, [recordedAudio, onSubmit, clearRecording, toast]);

  /**
   * Reset transcription tracking when user clears recording manually
   */
  const handleClearError = () => {
    setTranscriptionError(null);
    transcriptionStartedRef.current = false;
    clearRecording();
  };

  /**
   * Handle microphone button click
   * Starts recording on first click, stops and triggers auto-flow on second click
   */
  const handleMicClick = async () => {
    if (isRecording) {
      // Stop recording - this will automatically trigger transcription via useEffect
      await stopRecording();
    } else {
      // Reset error state when starting new recording
      setTranscriptionError(null);
      transcriptionStartedRef.current = false;
      await startRecording();
    }
  };

  /**
   * Handle manual text submission (when user types instead of using voice)
   */
  const handleSubmit = async () => {
    if (!input.trim() || isLoading || isTranscribing) return;
    await onSubmit(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Determine if mic button should be disabled
  const isMicDisabled = isLoading || isTranscribing;
  
  // Determine mic button appearance based on state
  const getMicButtonColor = () => {
    if (isTranscribing) return "bg-blue-500 hover:bg-blue-600";
    if (isRecording) return "bg-red-500 hover:bg-red-600";
    return "gradient-primary hover:opacity-90";
  };

  const getMicButtonTitle = () => {
    if (isTranscribing) return "Processing your voice...";
    if (isRecording) return "Click to stop recording";
    return "Click to start recording";
  };

  return (
    <div className="bg-card rounded-2xl p-4 shadow-md border border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center">
          <Sparkles className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-semibold">AI Food & Workout Logger</h3>
          <p className="text-xs text-muted-foreground">
            Speak or type to log your meals and workouts
          </p>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe what you ate or your workout, or click the mic to speak..."
          className="min-h-[80px] pr-24 resize-none bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
          disabled={isLoading || isTranscribing || isRecording}
        />

        <div className="absolute right-2 bottom-2 flex gap-2">
          {/* Microphone button - always visible */}
          <Button
            size="icon"
            onClick={handleMicClick}
            disabled={isMicDisabled}
            className={cn(
              "rounded-full w-9 h-9 transition-all",
              getMicButtonColor(),
              isRecording && "animate-pulse"
            )}
            title={getMicButtonTitle()}
          >
            {isTranscribing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : isRecording ? (
              <MicOff className="w-4 h-4" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>

          {/* Send button - for manual text submission */}
          {input.trim() && !isRecording && (
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={isLoading || isTranscribing}
              className={cn(
                "rounded-full w-9 h-9",
                "gradient-primary hover:opacity-90 transition-opacity animate-in fade-in duration-200"
              )}
              title="Send message (or press Enter)"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="mt-3 flex items-center gap-2 text-red-500 text-sm animate-in fade-in duration-200">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>Recording your voice...</span>
        </div>
      )}

      {/* Transcribing indicator */}
      {isTranscribing && (
        <div className="mt-3 flex items-center gap-2 text-blue-500 text-sm animate-in fade-in duration-200">
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Processing your voice input...</span>
        </div>
      )}

      {/* Transcription error state with recovery options */}
      {transcriptionError && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-700 dark:text-red-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm text-red-700 dark:text-red-300 mb-1">
                Voice Processing Error
              </h4>
              <p className="text-xs text-red-600 dark:text-red-400 mb-3">
                {transcriptionError}
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleMicClick}
                  className="h-7 px-2 text-xs"
                  disabled={isLoading}
                >
                  Try Recording Again
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleClearError}
                  className="h-7 px-2 text-xs"
                >
                  Dismiss
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Recording permission error */}
      {recordingError && !transcriptionError && (
        <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800 animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-yellow-700 dark:text-yellow-300 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-yellow-700 dark:text-yellow-300">
                {recordingError}
              </p>
              <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                Check your browser microphone permissions in settings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Quick suggestions - only show when not recording or transcribing */}
      {!isRecording && !isTranscribing && (
        <div className="flex gap-2 mt-3 flex-wrap animate-in fade-in duration-200">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion}
              onClick={() => setInput(suggestion)}
              className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
              disabled={isLoading}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Info text about the voice feature */}
      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        💡 <strong>Tip:</strong> Click the microphone, speak clearly, and release to automatically process your input. 
        No need to click transcribe or send!
      </p>
    </div>
  );
}
