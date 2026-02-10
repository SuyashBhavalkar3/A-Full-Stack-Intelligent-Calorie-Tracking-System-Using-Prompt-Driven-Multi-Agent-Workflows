import { useState } from "react";
import { Send, Sparkles, Loader2, Mic, MicOff } from "lucide-react";
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
  const [transcriptionLoading, setTranscriptionLoading] = useState(false);
  const { toast } = useToast();
  const {
    isRecording,
    recordedAudio,
    error: recordingError,
    startRecording,
    stopRecording,
    clearRecording,
  } = useAudioRecorder();

  const handleSubmit = async () => {
    if (!input.trim() || isLoading || transcriptionLoading) return;
    await onSubmit(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleMicClick = async () => {
    if (isRecording) {
      await stopRecording();
    } else {
      await startRecording();
    }
  };

  const handleTranscribe = async () => {
    if (!recordedAudio) {
      toast({
        title: "No audio recorded",
        description: "Please record audio first",
        variant: "destructive",
      });
      return;
    }

    try {
      setTranscriptionLoading(true);
      const response = await speechToTextApi.transcribe(recordedAudio);
      const { text } = response.data;

      if (text) {
        setInput(text);
        toast({
          title: "Transcription successful",
          description: "Audio has been converted to text",
        });
      } else {
        toast({
          title: "No speech detected",
          description: "Please try recording again with clear audio",
          variant: "destructive",
        });
      }

      clearRecording();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Transcription failed";
      toast({
        title: "Transcription error",
        description: errorMessage,
        variant: "destructive",
      });
      console.error("Transcription error:", error);
    } finally {
      setTranscriptionLoading(false);
    }
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
            Describe what you ate or your workout
          </p>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="e.g., 'Had a chicken sandwich and a protein shake for lunch'"
          className="min-h-[80px] pr-24 resize-none bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
          disabled={isLoading || transcriptionLoading || isRecording}
        />

        <div className="absolute right-2 bottom-2 flex gap-2">
          {/* Microphone button with recording status */}
          <Button
            size="icon"
            onClick={handleMicClick}
            disabled={isLoading || transcriptionLoading}
            className={cn(
              "rounded-full w-9 h-9",
              isRecording
                ? "bg-red-500 hover:bg-red-600"
                : "gradient-primary hover:opacity-90"
            )}
            title={isRecording ? "Stop recording" : "Start recording"}
          >
            {isRecording ? (
              <MicOff className="w-4 h-4 animate-pulse" />
            ) : (
              <Mic className="w-4 h-4" />
            )}
          </Button>

          {/* Transcribe button (only show if audio is recorded) */}
          {recordedAudio && !isRecording && (
            <Button
              size="icon"
              onClick={handleTranscribe}
              disabled={isLoading || transcriptionLoading}
              className="rounded-full w-9 h-9 bg-blue-500 hover:bg-blue-600"
              title="Transcribe recorded audio"
            >
              {transcriptionLoading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
            </Button>
          )}

          {/* Send button */}
          <Button
            size="icon"
            onClick={handleSubmit}
            disabled={!input.trim() || isLoading || transcriptionLoading}
            className={cn(
              "rounded-full w-9 h-9",
              "gradient-primary hover:opacity-90 transition-opacity"
            )}
            title="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>

      {/* Recording indicator */}
      {isRecording && (
        <div className="mt-3 flex items-center gap-2 text-red-500 text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
          <span>Recording in progress...</span>
        </div>
      )}

      {/* Recorded audio indicator */}
      {recordedAudio && !isRecording && (
        <div className="mt-3 flex items-center justify-between px-3 py-2 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
          <span className="text-sm text-blue-700 dark:text-blue-300">
            Audio recorded • {(recordedAudio.size / 1024).toFixed(1)} KB
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={clearRecording}
            className="h-6 px-2 text-xs"
          >
            Clear
          </Button>
        </div>
      )}

      {/* Error message */}
      {recordingError && (
        <div className="mt-3 p-3 bg-red-50 dark:bg-red-950 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">{recordingError}</p>
        </div>
      )}

      {/* Quick suggestions */}
      <div className="flex gap-2 mt-3 flex-wrap">
        {SUGGESTIONS.map((suggestion) => (
          <button
            key={suggestion}
            onClick={() => setInput(suggestion)}
            className="text-xs px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-colors"
            disabled={isLoading || isRecording}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
