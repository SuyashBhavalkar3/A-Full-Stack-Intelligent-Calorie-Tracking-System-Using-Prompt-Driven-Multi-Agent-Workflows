import { ProgressRing } from "@/components/ui/progress-ring";
import { Flame } from "lucide-react";

interface CaloriesRingProps {
  consumed: number;
  goal: number;
  burned?: number;
}

export function CaloriesRing({ consumed, goal, burned = 0 }: CaloriesRingProps) {
  const netCalories = consumed - burned;
  const remaining = Math.max(goal - netCalories, 0);
  const percentage = Math.min((netCalories / goal) * 100, 100);

  return (
    <div className="bg-card rounded-3xl p-6 shadow-md border border-border/50">
      <div className="flex items-center justify-center gap-2 mb-4">
        <Flame className="w-5 h-5 text-calories" />
        <h3 className="text-lg font-semibold">Today's Calories</h3>
      </div>

      <div className="flex justify-center mb-4">
        <ProgressRing
          value={netCalories}
          max={goal}
          size={180}
          strokeWidth={12}
          colorClass="stroke-calories"
        >
          <div className="text-center">
            <div className="text-4xl font-bold">{remaining.toFixed(0)}</div>
            <div className="text-sm text-muted-foreground">remaining</div>
          </div>
        </ProgressRing>
      </div>

      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-xl font-bold text-primary">{goal}</div>
          <div className="text-xs text-muted-foreground">Goal</div>
        </div>
        <div>
          <div className="text-xl font-bold text-calories">{consumed}</div>
          <div className="text-xs text-muted-foreground">Eaten</div>
        </div>
        <div>
          <div className="text-xl font-bold text-accent">{burned}</div>
          <div className="text-xs text-muted-foreground">Burned</div>
        </div>
      </div>
    </div>
  );
}
