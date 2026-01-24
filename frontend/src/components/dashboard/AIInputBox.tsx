import { useState } from "react";
import { Send, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

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

  const handleSubmit = async () => {
    if (!input.trim() || isLoading) return;
    await onSubmit(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
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
          className="min-h-[80px] pr-12 resize-none bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary"
          disabled={isLoading}
        />
        <Button
          size="icon"
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading}
          className={cn(
            "absolute right-2 bottom-2 rounded-full w-9 h-9",
            "gradient-primary hover:opacity-90 transition-opacity"
          )}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </Button>
      </div>

      {/* Quick suggestions */}
      <div className="flex gap-2 mt-3 flex-wrap">
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
    </div>
  );
}
