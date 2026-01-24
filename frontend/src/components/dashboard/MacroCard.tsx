import { cn } from "@/lib/utils";
import { ProgressRing } from "@/components/ui/progress-ring";

interface MacroCardProps {
  label: string;
  value: number;
  goal: number;
  unit: string;
  colorClass: string;
  icon?: React.ReactNode;
}

export function MacroCard({ label, value, goal, colorClass, unit, icon }: MacroCardProps) {
  const percentage = Math.min((value / goal) * 100, 100);
  const remaining = Math.max(goal - value, 0);

  return (
    <div className="bg-card rounded-2xl p-4 shadow-sm border border-border/50 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-2 mb-3">
        {icon && <span className={cn("text-lg", colorClass.replace("stroke-", "text-"))}>{icon}</span>}
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      
      <div className="flex items-center justify-between">
        <ProgressRing
          value={value}
          max={goal}
          size={80}
          strokeWidth={6}
          colorClass={colorClass}
        >
          <div className="text-center">
            <div className="text-lg font-bold">{Math.round(percentage)}%</div>
          </div>
        </ProgressRing>
        
        <div className="text-right">
          <div className="text-2xl font-bold">{value.toFixed(0)}</div>
          <div className="text-sm text-muted-foreground">
            / {goal}{unit}
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            {remaining.toFixed(0)}{unit} left
          </div>
        </div>
      </div>
    </div>
  );
}
