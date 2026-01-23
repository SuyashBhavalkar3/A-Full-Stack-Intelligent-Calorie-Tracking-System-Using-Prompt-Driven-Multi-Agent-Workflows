import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { llmAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Loader2, Utensils, Dumbbell, Flame, Beef, Wheat, Droplets, X } from 'lucide-react';

interface LoggedItem {
  id: string;
  type: 'food' | 'exercise';
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
}

interface AIFoodLoggerProps {
  onFoodLogged: (data: { calories: number; protein: number; carbs: number; fat: number }) => void;
  onExerciseLogged: (calories: number) => void;
}

export const AIFoodLogger: React.FC<AIFoodLoggerProps> = ({
  onFoodLogged,
  onExerciseLogged,
}) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loggedItems, setLoggedItems] = useState<LoggedItem[]>([]);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!input.trim()) {
      toast({
        title: 'Empty input',
        description: 'Please describe what you ate or your exercise.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await llmAPI.log(input);
      const data = response.data;

      // Handle food items
      if (data.foods && data.foods.length > 0) {
        let totalFood = { calories: 0, protein: 0, carbs: 0, fat: 0 };
        const newItems: LoggedItem[] = data.foods.map((food: {
          name: string;
          calories: number;
          protein: number;
          carbs: number;
          fat: number;
        }) => {
          totalFood.calories += food.calories;
          totalFood.protein += food.protein;
          totalFood.carbs += food.carbs;
          totalFood.fat += food.fat;
          return {
            id: Date.now().toString() + Math.random(),
            type: 'food' as const,
            name: food.name,
            calories: food.calories,
            protein: food.protein,
            carbs: food.carbs,
            fat: food.fat,
          };
        });
        setLoggedItems((prev) => [...newItems, ...prev]);
        onFoodLogged(totalFood);
      }

      // Handle exercise
      if (data.exercises && data.exercises.length > 0) {
        let totalBurned = 0;
        const newItems: LoggedItem[] = data.exercises.map((exercise: {
          name: string;
          calories_burned: number;
        }) => {
          totalBurned += exercise.calories_burned;
          return {
            id: Date.now().toString() + Math.random(),
            type: 'exercise' as const,
            name: exercise.name,
            calories: exercise.calories_burned,
          };
        });
        setLoggedItems((prev) => [...newItems, ...prev]);
        onExerciseLogged(totalBurned);
      }

      setInput('');
      toast({
        title: 'Logged successfully!',
        description: 'Your entry has been recorded.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process your entry. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = (id: string) => {
    setLoggedItems((prev) => prev.filter((item) => item.id !== id));
  };

  return (
    <div className="glass-card p-6">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-secondary" />
        AI Food & Exercise Logger
      </h2>

      <div className="space-y-4">
        <Textarea
          placeholder="Describe what you ate or your exercise... e.g., 'I had a chicken salad with olive oil dressing and ran for 30 minutes'"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[100px] resize-none"
          disabled={isLoading}
        />

        <Button
          onClick={handleSubmit}
          disabled={isLoading || !input.trim()}
          className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Log Entry
            </>
          )}
        </Button>

        {/* Logged items */}
        <AnimatePresence>
          {loggedItems.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-4 border-t border-border"
            >
              <h3 className="text-sm font-medium text-muted-foreground">Today's Log</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {loggedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="glass-card-hover p-4 relative group"
                  >
                    <button
                      onClick={() => removeItem(item.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded-full hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4 text-destructive" />
                    </button>

                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          item.type === 'food' ? 'progress-calories' : 'progress-weight'
                        }`}
                      >
                        {item.type === 'food' ? (
                          <Utensils className="h-5 w-5 text-primary-foreground" />
                        ) : (
                          <Dumbbell className="h-5 w-5 text-primary-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{item.name}</p>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="inline-flex items-center gap-1 text-xs bg-warning/10 text-warning px-2 py-1 rounded-full">
                            <Flame className="h-3 w-3" />
                            {item.calories} cal
                          </span>
                          {item.type === 'food' && (
                            <>
                              <span className="inline-flex items-center gap-1 text-xs bg-destructive/10 text-destructive px-2 py-1 rounded-full">
                                <Beef className="h-3 w-3" />
                                {item.protein}g
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-2 py-1 rounded-full">
                                <Wheat className="h-3 w-3" />
                                {item.carbs}g
                              </span>
                              <span className="inline-flex items-center gap-1 text-xs bg-secondary/30 text-secondary-foreground px-2 py-1 rounded-full">
                                <Droplets className="h-3 w-3" />
                                {item.fat}g
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
