import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Target, Loader2, Check, Sparkles, Calendar } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { goalsApi } from "@/lib/api";
import { ProgressRing } from "@/components/ui/progress-ring";

const goalsSchema = z.object({
  target_calories: z.coerce.number().min(1000, "Minimum 1000 calories").max(5000, "Maximum 5000 calories"),
  protein_goal: z.coerce.number().min(0).max(500),
  carbs_goal: z.coerce.number().min(0).max(800),
  fat_goal: z.coerce.number().min(0).max(300),
  weight_goal: z.coerce.number().min(30).max(300),
  weekly_goal_kg: z.coerce.number().min(0.25).max(3, "Maximum 3kg per week"),
});

type GoalsFormData = z.infer<typeof goalsSchema>;

interface FetchedGoals {
  daily_calories?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  target_weight?: number;  // Backend field name
  weekly_goal_kg?: number;
  target_date?: string;
}

export default function Goals() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [currentWeight, setCurrentWeight] = useState<number | null>(null);
  const [estimatedDate, setEstimatedDate] = useState<string | null>(null);

  const form = useForm<GoalsFormData>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      target_calories: undefined,
      protein_goal: undefined,
      carbs_goal: undefined,
      fat_goal: undefined,
      weight_goal: undefined,
      weekly_goal_kg: 0.5,
    },
  });

  // Fetch goals from backend (source of truth)
  useEffect(() => {
    const fetchGoals = async () => {
      setIsLoading(true);
      try {
        const response = await goalsApi.me();
        if (response.data) {
          const data: FetchedGoals = response.data;
          
          // Populate form with backend data if it exists
          if (data.daily_calories !== undefined && data.target_weight !== undefined) {
            form.reset({
              target_calories: data.daily_calories,
              protein_goal: data.protein_g ?? 150,
              carbs_goal: data.carbs_g ?? 200,
              fat_goal: data.fat_g ?? 65,
              weight_goal: data.target_weight,
              weekly_goal_kg: data.weekly_goal_kg ?? 0.5,
            });
          } else {
            // No complete goals from backend - show empty form (no defaults)
            form.reset({
              target_calories: undefined as any,
              protein_goal: undefined as any,
              carbs_goal: undefined as any,
              fat_goal: undefined as any,
              weight_goal: undefined as any,
              weekly_goal_kg: 0.5,
            });
          }
        }
      } catch (error) {
        // No goals set yet - show empty form
        form.reset({
          target_calories: undefined as any,
          protein_goal: undefined as any,
          carbs_goal: undefined as any,
          fat_goal: undefined as any,
          weight_goal: undefined as any,
          weekly_goal_kg: 0.5,
        });
      } finally {
        setIsLoading(false);
      }
    };
    fetchGoals();
  }, [form]);

  // Calculate estimated goal date whenever weight_goal or weekly_goal_kg changes
  const watchedValues = form.watch();
  useEffect(() => {
    if (currentWeight && watchedValues.weight_goal && watchedValues.weekly_goal_kg > 0) {
      const remainingWeight = currentWeight - watchedValues.weight_goal;
      const weeksNeeded = remainingWeight / watchedValues.weekly_goal_kg;
      const daysNeeded = weeksNeeded * 7;
      
      const today = new Date();
      const estimatedTargetDate = new Date(today.getTime() + daysNeeded * 24 * 60 * 60 * 1000);
      
      setEstimatedDate(estimatedTargetDate.toLocaleDateString("en-US", { 
        year: "numeric", 
        month: "long", 
        day: "numeric" 
      }));
    } else {
      setEstimatedDate(null);
    }
  }, [currentWeight, watchedValues.weight_goal, watchedValues.weekly_goal_kg]);

  const onSubmit = async (data: GoalsFormData) => {
    if (!watchedValues.target_calories || !watchedValues.weight_goal || !watchedValues.weekly_goal_kg) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all goal fields",
        variant: "destructive",
      });
      return;
    }

    console.log("Submitting goals with:", {
      weight_goal: data.weight_goal,
      weekly_goal_kg: data.weekly_goal_kg,
      target_calories: data.target_calories,
    });

    setIsSaving(true);
    try {
      const result = await goalsApi.set({
        target_calories: data.target_calories,
        protein_goal: data.protein_goal,
        carbs_goal: data.carbs_goal,
        fat_goal: data.fat_goal,
        weight_goal: data.weight_goal,
        weekly_goal_kg: data.weekly_goal_kg,
      });
      
      console.log("Goals saved successfully:", result.data);
      
      toast({
        title: "Goals updated!",
        description: "Your nutrition and weight targets have been saved.",
      });
    } catch (error: any) {
      console.error("Error saving goals:", error);
      toast({
        title: "Failed to save",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const totalMacroCalories = 
    (watchedValues.protein_goal * 4) + 
    (watchedValues.carbs_goal * 4) + 
    (watchedValues.fat_goal * 9);

  const proteinPercent = watchedValues.target_calories ? Math.round((watchedValues.protein_goal * 4 / watchedValues.target_calories) * 100) : 0;
  const carbsPercent = watchedValues.target_calories ? Math.round((watchedValues.carbs_goal * 4 / watchedValues.target_calories) * 100) : 0;
  const fatPercent = watchedValues.target_calories ? Math.round((watchedValues.fat_goal * 9 / watchedValues.target_calories) * 100) : 0;

  const hasGoals = watchedValues.target_calories !== undefined && watchedValues.target_calories > 0;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
            <Target className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Goals & Targets</h1>
            <p className="text-muted-foreground">Set your daily nutrition and weight loss goals</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Calories */}
            {hasGoals && (
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <h2 className="text-lg font-semibold mb-4">Daily Calories</h2>
                <div className="flex items-center gap-6">
                  <ProgressRing
                    value={totalMacroCalories}
                    max={watchedValues.target_calories}
                    size={100}
                    strokeWidth={8}
                    colorClass="stroke-calories"
                  >
                    <div className="text-center">
                      <div className="text-sm font-bold">{Math.round((totalMacroCalories / watchedValues.target_calories) * 100)}%</div>
                    </div>
                  </ProgressRing>
                  <div className="flex-1">
                    <Label htmlFor="target_calories">Target Calories</Label>
                    <Input
                      id="target_calories"
                      type="number"
                      {...form.register("target_calories")}
                      className="h-14 text-2xl font-bold mt-2"
                    />
                    {form.formState.errors.target_calories && (
                      <p className="text-sm text-destructive mt-1">{form.formState.errors.target_calories.message}</p>
                    )}
                    <p className="text-sm text-muted-foreground mt-2">
                      Macros total: {totalMacroCalories} cal
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Calories Input (shown first if no goals set) */}
            {!hasGoals && (
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <h2 className="text-lg font-semibold mb-4">Daily Calories</h2>
                <div>
                  <Label htmlFor="target_calories">Target Daily Calories</Label>
                  <Input
                    id="target_calories"
                    type="number"
                    placeholder="e.g., 2000"
                    {...form.register("target_calories")}
                    className="h-12 mt-2"
                  />
                  {form.formState.errors.target_calories && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.target_calories.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Macros */}
            {hasGoals && (
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <h2 className="text-lg font-semibold mb-4">Macro Distribution</h2>
                
                {/* Visual distribution bar */}
                <div className="h-4 rounded-full overflow-hidden flex mb-6">
                  <div 
                    className="bg-protein transition-all" 
                    style={{ width: `${proteinPercent}%` }} 
                  />
                  <div 
                    className="bg-carbs transition-all" 
                    style={{ width: `${carbsPercent}%` }} 
                  />
                  <div 
                    className="bg-fat transition-all" 
                    style={{ width: `${fatPercent}%` }} 
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="protein_goal" className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-protein" />
                      Protein
                    </Label>
                    <Input
                      id="protein_goal"
                      type="number"
                      {...form.register("protein_goal")}
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">{proteinPercent}% • {watchedValues.protein_goal * 4} cal</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbs_goal" className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-carbs" />
                      Carbs
                    </Label>
                    <Input
                      id="carbs_goal"
                      type="number"
                      {...form.register("carbs_goal")}
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">{carbsPercent}% • {watchedValues.carbs_goal * 4} cal</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat_goal" className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-fat" />
                      Fat
                    </Label>
                    <Input
                      id="fat_goal"
                      type="number"
                      {...form.register("fat_goal")}
                      className="h-12"
                    />
                    <p className="text-xs text-muted-foreground">{fatPercent}% • {watchedValues.fat_goal * 9} cal</p>
                  </div>
                </div>
              </div>
            )}

            {/* Macro inputs (shown first if no goals) */}
            {!hasGoals && (
              <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
                <h2 className="text-lg font-semibold mb-4">Macro Distribution</h2>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="protein_goal">Protein (g)</Label>
                    <Input
                      id="protein_goal"
                      type="number"
                      placeholder="e.g., 150"
                      {...form.register("protein_goal")}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbs_goal">Carbs (g)</Label>
                    <Input
                      id="carbs_goal"
                      type="number"
                      placeholder="e.g., 200"
                      {...form.register("carbs_goal")}
                      className="h-12"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fat_goal">Fat (g)</Label>
                    <Input
                      id="fat_goal"
                      type="number"
                      placeholder="e.g., 65"
                      {...form.register("fat_goal")}
                      className="h-12"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Weight Goal */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
              <h2 className="text-lg font-semibold mb-4">Weight Goal</h2>
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <Label htmlFor="weight_goal">Target Weight</Label>
                    <Input
                      id="weight_goal"
                      type="number"
                      placeholder="e.g., 70"
                      {...form.register("weight_goal")}
                      className="h-12 mt-2"
                    />
                  </div>
                  <span className="text-lg text-muted-foreground mt-8">kg</span>
                </div>
              </div>
            </div>

            {/* Weekly Weight Loss Target */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
              <h2 className="text-lg font-semibold mb-4">Weekly Weight Loss Target</h2>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Label htmlFor="weekly_goal_kg">Target Weight Loss Per Week</Label>
                  <Input
                    id="weekly_goal_kg"
                    type="number"
                    step="0.25"
                    min="0.25"
                    max="3"
                    placeholder="e.g., 0.5"
                    {...form.register("weekly_goal_kg")}
                    className="h-12 mt-2"
                  />
                  {form.formState.errors.weekly_goal_kg && (
                    <p className="text-sm text-destructive mt-1">{form.formState.errors.weekly_goal_kg.message}</p>
                  )}
                  <p className="text-sm text-muted-foreground mt-2">
                    Recommended: 0.5-1 kg per week for sustainable loss
                  </p>
                </div>
                <span className="text-lg text-muted-foreground mt-8">kg</span>
              </div>
            </div>

            {/* Estimated Goal Date */}
            {estimatedDate && (
              <div className="p-4 rounded-xl bg-accent/10 border border-accent/30">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-accent mt-0.5" />
                  <div>
                    <h3 className="font-medium text-accent mb-1">Estimated Goal Achievement</h3>
                    <p className="text-sm text-muted-foreground">
                      Based on your target of {watchedValues.weekly_goal_kg}kg per week, you should reach your goal weight on approximately <span className="font-semibold text-accent">{estimatedDate}</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recommendation card */}
            {hasGoals && (
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <h3 className="font-medium text-primary mb-1">AI Tip</h3>
                    <p className="text-sm text-muted-foreground">
                      For optimal muscle building, aim for 1.6-2.2g of protein per kg of body weight. 
                      Your current target is {(watchedValues.protein_goal / (watchedValues.weight_goal || 70)).toFixed(1)}g per kg.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 gradient-primary hover:opacity-90"
              disabled={isSaving}
            >
              {isSaving ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Check className="w-5 h-5 mr-2" />
                  Save Goals
                </>
              )}
            </Button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
