import React from 'react';
import { motion } from 'framer-motion';
import { Flame, Minus, Plus, Equal } from 'lucide-react';

interface CaloriesMacrosCardProps {
  targetCalories: number;
  caloriesConsumed: number;
  caloriesBurned: number;
  targetProtein: number;
  proteinConsumed: number;
  targetCarbs: number;
  carbsConsumed: number;
  targetFat: number;
  fatConsumed: number;
}

export const CaloriesMacrosCard: React.FC<CaloriesMacrosCardProps> = ({
  targetCalories,
  caloriesConsumed,
  caloriesBurned,
  targetProtein,
  proteinConsumed,
  targetCarbs,
  carbsConsumed,
  targetFat,
  fatConsumed,
}) => {
  const remainingCalories = targetCalories - caloriesConsumed + caloriesBurned;

  const MacroProgressBar = ({
    label,
    current,
    target,
    colorClass,
  }: {
    label: string;
    current: number;
    target: number;
    colorClass: string;
  }) => {
    const percentage = Math.min((current / target) * 100, 100);

    return (
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="font-medium">{label}</span>
          <span className="text-muted-foreground">
            {current}g / {target}g
          </span>
        </div>
        <div className="h-3 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className={`h-full rounded-full ${colorClass}`}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="glass-card p-6 h-full">
      <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <Flame className="h-5 w-5 text-warning" />
        Today's Progress
      </h2>

      {/* Calories Summary */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="text-center">
          <p className="text-2xl lg:text-3xl font-bold text-primary">{targetCalories}</p>
          <p className="text-xs text-muted-foreground">Target</p>
        </div>
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-1">
            <Minus className="h-4 w-4 text-muted-foreground" />
            <p className="text-2xl lg:text-3xl font-bold text-warning">{caloriesConsumed}</p>
          </div>
          <p className="text-xs text-muted-foreground">Consumed</p>
        </div>
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-1">
            <Plus className="h-4 w-4 text-muted-foreground" />
            <p className="text-2xl lg:text-3xl font-bold text-success">{caloriesBurned}</p>
          </div>
          <p className="text-xs text-muted-foreground">Burned</p>
        </div>
        <div className="text-center flex flex-col items-center">
          <div className="flex items-center gap-1">
            <Equal className="h-4 w-4 text-muted-foreground" />
            <p
              className={`text-2xl lg:text-3xl font-bold ${
                remainingCalories >= 0 ? 'text-primary' : 'text-destructive'
              }`}
            >
              {remainingCalories}
            </p>
          </div>
          <p className="text-xs text-muted-foreground">Remaining</p>
        </div>
      </div>

      {/* Calories progress bar */}
      <div className="mb-8">
        <div className="h-4 bg-muted rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min((caloriesConsumed / targetCalories) * 100, 100)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full progress-calories rounded-full"
          />
        </div>
      </div>

      {/* Macros */}
      <div className="space-y-4">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
          Macronutrients
        </h3>
        <MacroProgressBar
          label="Protein"
          current={proteinConsumed}
          target={targetProtein}
          colorClass="progress-protein"
        />
        <MacroProgressBar
          label="Carbs"
          current={carbsConsumed}
          target={targetCarbs}
          colorClass="progress-carbs"
        />
        <MacroProgressBar
          label="Fat"
          current={fatConsumed}
          target={targetFat}
          colorClass="progress-fat"
        />
      </div>
    </div>
  );
};
