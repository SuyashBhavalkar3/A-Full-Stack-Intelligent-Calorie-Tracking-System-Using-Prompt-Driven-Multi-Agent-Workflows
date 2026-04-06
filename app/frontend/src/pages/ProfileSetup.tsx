import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Check, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { profileApi, goalsApi, waterApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const profileSchema = z.object({
  age: z.coerce.number().min(13, "Must be at least 13").max(120, "Invalid age"),
  gender: z.enum(["male", "female", "other"]),
  height: z.coerce.number().min(100, "Enter height in cm").max(250, "Invalid height"),
  weight: z.coerce.number().min(30, "Minimum 30kg").max(300, "Invalid weight"),
  activity_level: z.enum(["sedentary", "light", "moderate", "active", "very_active"]),
});

const goalsSchema = z.object({
  goal_type: z.enum(["lose", "gain", "maintain"], { message: "Select a goal type" }),
  weight_goal: z.coerce.number().min(30).max(300),
  weekly_goal_kg: z.coerce.number().min(0.25).max(1),
  target_calories: z.coerce.number().min(1000).max(5000),
  protein_goal: z.coerce.number().min(0).max(500),
  carbs_goal: z.coerce.number().min(0).max(800),
  fat_goal: z.coerce.number().min(0).max(300),
  water_goal_glasses: z.coerce.number().min(1).max(20, "Maximum 20 glasses per day"),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type GoalsFormData = z.infer<typeof goalsSchema>;

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", description: "Little to no exercise" },
  { value: "light", label: "Light", description: "Light exercise 1-3 days/week" },
  { value: "moderate", label: "Moderate", description: "Moderate exercise 3-5 days/week" },
  { value: "active", label: "Active", description: "Hard exercise 6-7 days/week" },
  { value: "very_active", label: "Very Active", description: "Very hard exercise & physical job" },
];

export default function ProfileSetup() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { refreshUser } = useAuth();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [profileData, setProfileData] = useState<ProfileFormData | null>(null);
  const [existingGoals, setExistingGoals] = useState<any>(null);

  const profileForm = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      gender: "male",
      activity_level: "moderate",
    },
  });

  const goalsForm = useForm<GoalsFormData>({
    resolver: zodResolver(goalsSchema),
    defaultValues: {
      goal_type: "lose",
      weight_goal: undefined,
      weekly_goal_kg: 0.5,
      target_calories: undefined,
      protein_goal: undefined,
      carbs_goal: undefined,
      fat_goal: undefined,
      water_goal_glasses: 8,
    },
  });

  const [calculatedData, setCalculatedData] = useState<{
    estimatedDate?: string;
    adjustedCalories?: number;
  }>({});
  const [validationWarnings, setValidationWarnings] = useState<string[]>([]);

  // Fetch existing goals from backend
  useEffect(() => {
    const fetchGoals = async () => {
      try {
        const response = await goalsApi.me();
        if (response.data) {
          setExistingGoals(response.data);
          // Populate form with backend values
          goalsForm.reset({
            target_calories: response.data.daily_calories,
            protein_goal: response.data.protein_g,
            carbs_goal: response.data.carbs_g,
            fat_goal: response.data.fat_g,
            weight_goal: response.data.weight_goal,
            weekly_goal_kg: response.data.weekly_goal_kg ?? 0.5,
          });
        }
      } catch (error) {
        // No existing goals - form will use calculated values
        setExistingGoals(null);
      }
    };
    fetchGoals();
  }, [goalsForm]);

  const calculateWeightMetrics = (
    currentWeight: number,
    targetWeight: number,
    weeklyRate: number,
    goalType: string
  ) => {
    if (!currentWeight || !targetWeight || !weeklyRate) return null;

    // Calculate estimated date
    const weightDiff = Math.abs(currentWeight - targetWeight);
    const weeksRequired = Math.ceil(weightDiff / weeklyRate);
    const estimatedDate = new Date();
    estimatedDate.setDate(estimatedDate.getDate() + weeksRequired * 7);

    // Calculate calorie adjustment based on goal type
    if (profileData) {
      const bmr = profileData.gender === "male"
        ? 88.362 + (13.397 * profileData.weight) + (4.799 * profileData.height) - (5.677 * profileData.age)
        : 447.593 + (9.247 * profileData.weight) + (3.098 * profileData.height) - (4.330 * profileData.age);

      const activityMultipliers: Record<string, number> = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        very_active: 1.9,
      };

      const tdee = bmr * activityMultipliers[profileData.activity_level];
      // 1kg = 7700 kcal, so daily adjustment = (weeklyRate * 7700) / 7
      const dailyAdjustment = (weeklyRate * 7700) / 7;
      let adjustedCalories = tdee;

      if (goalType === "lose") {
        adjustedCalories = tdee - dailyAdjustment;
      } else if (goalType === "gain") {
        adjustedCalories = tdee + dailyAdjustment;
      }

      adjustedCalories = Math.max(1000, Math.round(adjustedCalories));

      return {
        estimatedDate: estimatedDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        }),
        adjustedCalories,
      };
    }

    return null;
  };

  // Watch for changes to recalculate weight metrics
  const goalTypeWatch = goalsForm.watch("goal_type");
  const weightGoalWatch = goalsForm.watch("weight_goal");
  const weeklyRateWatch = goalsForm.watch("weekly_goal_kg");

  useEffect(() => {
    const warnings: string[] = [];

    if (profileData && goalTypeWatch && weightGoalWatch && weeklyRateWatch) {
      // Validation checks
      if (weeklyRateWatch > 1) {
        warnings.push("Weekly loss exceeds 1kg - consider a slower pace for sustainability");
      }

      // Check for extreme weight targets
      if (profileData) {
        const bmi = profileData.weight / ((profileData.height / 100) ** 2);
        const goalBMI = weightGoalWatch / ((profileData.height / 100) ** 2);
        
        if (goalBMI < 16) {
          warnings.push("Target weight is very low - consider a healthier goal");
        } else if (goalBMI > 40) {
          warnings.push("Target weight is very high - consider a healthier goal");
        }
      }

      setValidationWarnings(warnings);

      const metrics = calculateWeightMetrics(
        profileData.weight,
        weightGoalWatch,
        weeklyRateWatch,
        goalTypeWatch
      );
      if (metrics) {
        setCalculatedData(metrics);
        // Pre-fill calorie recommendation only if user hasn't changed it
        if (!goalsForm.getValues("target_calories") || goalsForm.getValues("target_calories") === 0) {
          goalsForm.setValue("target_calories", metrics.adjustedCalories);
        }
      }
    }
  }, [goalTypeWatch, weightGoalWatch, weeklyRateWatch, profileData, goalsForm]);

  const handleProfileSubmit = async (data: ProfileFormData) => {
    setProfileData(data);
    
    // Calculate suggested macros based on profile
    const bmr = data.gender === "male"
      ? 88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age)
      : 447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age);
    
    const activityMultipliers: Record<string, number> = {
      sedentary: 1.2,
      light: 1.375,
      moderate: 1.55,
      active: 1.725,
      very_active: 1.9,
    };
    
    const tdee = Math.round(bmr * activityMultipliers[data.activity_level]);
    const proteinGoal = Math.round(data.weight * 2); // 2g per kg
    const fatGoal = Math.round((tdee * 0.25) / 9); // 25% of calories from fat
    const carbsGoal = Math.round((tdee - (proteinGoal * 4) - (fatGoal * 9)) / 4);
    
    goalsForm.setValue("weight_goal", data.weight);
    goalsForm.setValue("protein_goal", proteinGoal);
    goalsForm.setValue("carbs_goal", carbsGoal);
    goalsForm.setValue("fat_goal", fatGoal);
    
    setStep(2);
  };

  const handleGoalsSubmit = async (data: GoalsFormData) => {
    if (!profileData) return;
    
    setIsLoading(true);
    try {
      await profileApi.setup({
        age: profileData.age,
        gender: profileData.gender,
        height: profileData.height,
        weight: profileData.weight,
        activity_level: profileData.activity_level,
      });
      await goalsApi.set({
        target_calories: data.target_calories,
        protein_goal: data.protein_goal,
        carbs_goal: data.carbs_goal,
        fat_goal: data.fat_goal,
        weight_goal: data.weight_goal,
        weekly_goal_kg: data.weekly_goal_kg,
        goal_type: data.goal_type,
      });
      // Set user's water goal
      await waterApi.setGoal(data.water_goal_glasses);
      await refreshUser();
      
      toast({
        title: "Profile complete!",
        description: "You're all set to start tracking.",
      });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Setup failed",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="p-4 lg:p-6 border-b border-border">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Sparkles className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-bold text-xl">MacroMind</span>
        </div>
      </header>

      {/* Progress */}
      <div className="max-w-2xl mx-auto w-full px-4 py-6">
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex-1 h-2 rounded-full transition-colors",
            step >= 1 ? "bg-primary" : "bg-muted"
          )} />
          <div className={cn(
            "flex-1 h-2 rounded-full transition-colors",
            step >= 2 ? "bg-primary" : "bg-muted"
          )} />
        </div>
        <div className="flex justify-between mt-2 text-sm text-muted-foreground">
          <span className={step === 1 ? "text-primary font-medium" : ""}>Profile</span>
          <span className={step === 2 ? "text-primary font-medium" : ""}>Goals</span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-2xl mx-auto w-full px-4 pb-8">
        {step === 1 ? (
          <form onSubmit={profileForm.handleSubmit(handleProfileSubmit)} className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Tell us about yourself</h1>
              <p className="text-muted-foreground">
                This helps us calculate your daily calorie and macro targets
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  placeholder="25"
                  {...profileForm.register("age")}
                  className="h-12"
                />
                {profileForm.formState.errors.age && (
                  <p className="text-sm text-destructive">{profileForm.formState.errors.age.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Gender</Label>
                <RadioGroup
                  value={profileForm.watch("gender")}
                  onValueChange={(v) => profileForm.setValue("gender", v as any)}
                  className="flex gap-2"
                >
                  {["male", "female", "other"].map((g) => (
                    <Label
                      key={g}
                      className={cn(
                        "flex-1 flex items-center justify-center h-12 rounded-lg border-2 cursor-pointer transition-colors capitalize",
                        profileForm.watch("gender") === g
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value={g} className="sr-only" />
                      {g}
                    </Label>
                  ))}
                </RadioGroup>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height (cm)</Label>
                <Input
                  id="height"
                  type="number"
                  placeholder="170"
                  {...profileForm.register("height")}
                  className="h-12"
                />
                {profileForm.formState.errors.height && (
                  <p className="text-sm text-destructive">{profileForm.formState.errors.height.message}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="weight">Weight (kg)</Label>
                <Input
                  id="weight"
                  type="number"
                  placeholder="70"
                  {...profileForm.register("weight")}
                  className="h-12"
                />
                {profileForm.formState.errors.weight && (
                  <p className="text-sm text-destructive">{profileForm.formState.errors.weight.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <Label>Activity Level</Label>
              <RadioGroup
                value={profileForm.watch("activity_level")}
                onValueChange={(v) => profileForm.setValue("activity_level", v as any)}
                className="space-y-2"
              >
                {ACTIVITY_LEVELS.map((level) => (
                  <Label
                    key={level.value}
                    className={cn(
                      "flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors",
                      profileForm.watch("activity_level") === level.value
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    <RadioGroupItem value={level.value} />
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-muted-foreground">{level.description}</div>
                    </div>
                  </Label>
                ))}
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full h-12 gradient-primary hover:opacity-90">
              Continue <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </form>
        ) : (
          <form onSubmit={goalsForm.handleSubmit(handleGoalsSubmit)} className="space-y-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold mb-2">Set your goals</h1>
              <p className="text-muted-foreground">
                We've calculated suggested values based on your profile. Feel free to adjust.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="font-medium text-primary">AI Recommendation</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Based on your profile, we suggest {goalsForm.watch("target_calories")} calories/day
                for maintenance. Adjust lower to lose weight or higher to gain.
              </p>
            </div>

            {/* Weight Goal Card */}
            <div className="p-4 rounded-xl border border-border bg-card space-y-4">
              <h3 className="font-semibold flex items-center gap-2">
                <span>⚖️</span> Weight Management
              </h3>

              <div className="space-y-2">
                <Label className="text-base font-medium">Goal Type</Label>
                <RadioGroup
                  value={goalsForm.watch("goal_type")}
                  onValueChange={(v) => goalsForm.setValue("goal_type", v as any)}
                  className="flex gap-3"
                >
                  {["lose", "maintain", "gain"].map((type) => (
                    <Label
                      key={type}
                      className={cn(
                        "flex-1 flex items-center justify-center h-12 rounded-lg border-2 cursor-pointer transition-colors capitalize",
                        goalsForm.watch("goal_type") === type
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      <RadioGroupItem value={type} className="sr-only" />
                      <span>
                        {type === "lose" && "🔻 Lose"}
                        {type === "maintain" && "➡️ Maintain"}
                        {type === "gain" && "🔺 Gain"}
                      </span>
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="weight_goal">Target Weight (kg)</Label>
                  <Input
                    id="weight_goal"
                    type="number"
                    step="0.5"
                    placeholder={profileData?.weight?.toString()}
                    {...goalsForm.register("weight_goal")}
                    className="h-12"
                  />
                  {goalsForm.formState.errors.weight_goal && (
                    <p className="text-sm text-destructive">{goalsForm.formState.errors.weight_goal.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="weekly_goal_kg">Weekly Rate (kg/week)</Label>
                  <select
                    {...goalsForm.register("weekly_goal_kg")}
                    className="h-12 px-3 rounded-md border border-input bg-background"
                  >
                    <option value="0.25">0.25 kg</option>
                    <option value="0.5">0.5 kg</option>
                    <option value="0.75">0.75 kg</option>
                    <option value="1">1 kg</option>
                  </select>
                  {goalsForm.watch("weekly_goal_kg") > 1 && (
                    <p className="text-xs text-yellow-600">⚠️ Rate exceeds recommended 1kg/week</p>
                  )}
                </div>
              </div>

              {/* Calculated Metrics Display */}
              {calculatedData.estimatedDate && (
                <div className="mt-4 p-3 rounded-lg bg-muted space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Estimated Goal Date:</span>
                    <span className="font-semibold">{calculatedData.estimatedDate}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Adjusted Daily Calories:</span>
                    <span className="font-semibold">{calculatedData.adjustedCalories} kcal</span>
                  </div>
                </div>
              )}

              {/* Validation Warnings */}
              {validationWarnings.length > 0 && (
                <div className="mt-3 p-3 rounded-lg bg-yellow-50 border border-yellow-200 space-y-1">
                  {validationWarnings.map((warning, idx) => (
                    <p key={idx} className="text-sm text-yellow-700">⚠️ {warning}</p>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="target_calories">Daily Calories Target</Label>
                {calculatedData.adjustedCalories && (
                  <button
                    type="button"
                    onClick={() => goalsForm.setValue("target_calories", calculatedData.adjustedCalories!)}
                    className="text-xs text-primary hover:underline"
                  >
                    Reset to Recommended
                  </button>
                )}
              </div>
              <Input
                id="target_calories"
                type="number"
                {...goalsForm.register("target_calories")}
                className="h-12 text-lg font-semibold"
              />
              {goalsForm.formState.errors.target_calories && (
                <p className="text-sm text-destructive">{goalsForm.formState.errors.target_calories.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="protein_goal" className="text-protein">Protein (g)</Label>
                <Input
                  id="protein_goal"
                  type="number"
                  {...goalsForm.register("protein_goal")}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="carbs_goal" className="text-carbs">Carbs (g)</Label>
                <Input
                  id="carbs_goal"
                  type="number"
                  {...goalsForm.register("carbs_goal")}
                  className="h-12"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fat_goal" className="text-fat">Fat (g)</Label>
                <Input
                  id="fat_goal"
                  type="number"
                  {...goalsForm.register("fat_goal")}
                  className="h-12"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="weight_goal">
                Goal Weight (kg)
                {existingGoals?.weight_goal && (
                  <span className="text-xs text-muted-foreground ml-2">
                    (Current: {existingGoals.weight_goal} kg)
                  </span>
                )}
              </Label>
              <Input
                id="weight_goal"
                type="number"
                placeholder={existingGoals?.weight_goal ? `${existingGoals.weight_goal}` : "e.g., 70"}
                {...goalsForm.register("weight_goal")}
                className="h-12"
              />
              {!existingGoals?.weight_goal && (
                <p className="text-xs text-muted-foreground">No goal set yet</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="weekly_goal_kg">Target Weight Loss Per Week (kg)</Label>
              <Input
                id="weekly_goal_kg"
                type="number"
                step="0.25"
                min="0.25"
                max="3"
                placeholder={existingGoals?.weekly_goal_kg ? `${existingGoals.weekly_goal_kg}` : "e.g., 0.5"}
                {...goalsForm.register("weekly_goal_kg")}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                Recommended: 0.5-1 kg per week for sustainable loss
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="water_goal_glasses">Daily Water Goal (Glasses)</Label>
              <Input
                id="water_goal_glasses"
                type="number"
                min="1"
                max="20"
                placeholder="e.g., 8"
                {...goalsForm.register("water_goal_glasses")}
                className="h-12"
              />
              <p className="text-xs text-muted-foreground">
                8 glasses = 2 liters (250ml per glass). Recommended: 6-10 glasses per day
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(1)}
                className="h-12"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <Button
                type="submit"
                className="flex-1 h-12 gradient-primary hover:opacity-90"
                disabled={isLoading}
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Complete Setup <Check className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
