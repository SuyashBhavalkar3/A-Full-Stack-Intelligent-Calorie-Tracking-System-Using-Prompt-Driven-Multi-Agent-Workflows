import { Droplets, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WaterTrackerProps {
  glasses: number;
  goal: number;
  onAddGlass: () => void;
}

export function WaterTracker({ glasses, goal, onAddGlass }: WaterTrackerProps) {
  const percentage = Math.min((glasses / goal) * 100, 100);

  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Droplets className="w-5 h-5 text-water" />
          <h3 className="font-semibold">Water</h3>
        </div>
        <span className="text-sm text-muted-foreground">
          {glasses} / {goal} glasses
        </span>
      </div>

      {/* Water glass indicators */}
      <div className="flex gap-1.5 mb-4 flex-wrap">
        {Array.from({ length: goal }).map((_, i) => (
          <div
            key={i}
            className={cn(
              "w-6 h-8 rounded-md border-2 transition-all duration-300",
              i < glasses
                ? "bg-water/20 border-water"
                : "bg-muted/50 border-muted-foreground/20"
            )}
          >
            <div
              className={cn(
                "w-full rounded-b-sm transition-all duration-500",
                i < glasses ? "bg-water h-full" : "h-0"
              )}
            />
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-muted rounded-full overflow-hidden mb-3">
        <div
          className="h-full bg-water rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      <Button
        onClick={onAddGlass}
        variant="outline"
        className="w-full border-water text-water hover:bg-water hover:text-water-foreground"
        disabled={glasses >= goal}
      >
        <Plus className="w-4 h-4 mr-2" />
        Add Glass
      </Button>
    </div>
  );
}
