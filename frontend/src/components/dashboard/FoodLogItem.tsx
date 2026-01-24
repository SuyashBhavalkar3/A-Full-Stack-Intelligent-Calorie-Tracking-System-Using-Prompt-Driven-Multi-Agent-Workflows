import { Clock, Flame, Dumbbell } from "lucide-react";
import { cn } from "@/lib/utils";

interface FoodLogItemProps {
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  time: string;
  type: "food" | "workout";
  category?: string;
}

export function FoodLogItem({
  name,
  calories,
  protein,
  carbs,
  fat,
  time,
  type,
  category,
}: FoodLogItemProps) {
  const isWorkout = type === "workout";

  return (
    <div className="bg-card rounded-xl p-4 border border-border/50 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
              isWorkout ? "bg-accent/10" : "bg-primary/10"
            )}
          >
            {isWorkout ? (
              <Dumbbell className="w-5 h-5 text-accent" />
            ) : (
              <Flame className="w-5 h-5 text-primary" />
            )}
          </div>
          <div className="min-w-0">
            <h4 className="font-medium truncate">{name}</h4>
            {category && (
              <span className="text-xs text-muted-foreground capitalize">
                {category}
              </span>
            )}
          </div>
        </div>

        <div className="text-right shrink-0">
          <div className={cn(
            "font-bold",
            isWorkout ? "text-accent" : "text-calories"
          )}>
            {isWorkout ? "+" : "-"}{Math.abs(calories)} cal
          </div>
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            {time}
          </div>
        </div>
      </div>

      {!isWorkout && (protein !== undefined || carbs !== undefined || fat !== undefined) && (
        <div className="flex gap-4 mt-3 pt-3 border-t border-border/50">
          {protein !== undefined && (
            <div className="text-center">
              <div className="text-sm font-semibold text-protein">{protein}g</div>
              <div className="text-xs text-muted-foreground">Protein</div>
            </div>
          )}
          {carbs !== undefined && (
            <div className="text-center">
              <div className="text-sm font-semibold text-carbs">{carbs}g</div>
              <div className="text-xs text-muted-foreground">Carbs</div>
            </div>
          )}
          {fat !== undefined && (
            <div className="text-center">
              <div className="text-sm font-semibold text-fat">{fat}g</div>
              <div className="text-xs text-muted-foreground">Fat</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
