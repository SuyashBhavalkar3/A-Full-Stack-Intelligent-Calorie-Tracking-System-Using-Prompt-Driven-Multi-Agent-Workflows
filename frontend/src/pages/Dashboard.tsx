import { useState, useEffect } from "react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { CaloriesRing } from "@/components/dashboard/CaloriesRing";
import { MacroCard } from "@/components/dashboard/MacroCard";
import { WaterTracker } from "@/components/dashboard/WaterTracker";
import { AIInputBox } from "@/components/dashboard/AIInputBox";
import { FoodLogItem } from "@/components/dashboard/FoodLogItem";
import { WeightChart } from "@/components/dashboard/WeightChart";
import { useToast } from "@/hooks/use-toast";
import { loggingApi, waterApi, weightApi, goalsApi } from "@/lib/api";
import { Beef, Wheat, Droplet } from "lucide-react";

interface FoodLog {
  id: string;
  name: string;
  calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  time: string;
  type: "food" | "workout";
  category?: string;
}

interface Goals {
  target_calories: number;
  protein_goal: number;
  carbs_goal: number;
  fat_goal: number;
  weight_goal?: number;
}

interface DailySummary {
  calories_consumed: number;
  calories_burned: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface DailyNutrition {
  date: string;
  consumed_calories: number;
  consumed_protein: number;
  consumed_carbs: number;
  consumed_fat: number;
  burned_calories: number;
  remaining_calories: number;
  remaining_protein: number;
  remaining_carbs: number;
  remaining_fat: number;
}

interface WeightEntry {
  date: string;
  weight: number;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [logs, setLogs] = useState<FoodLog[]>([]);
  const [goals, setGoals] = useState<Goals | null>(null);
  const [summary, setSummary] = useState<DailySummary | null>(null);
  const [waterGlasses, setWaterGlasses] = useState(0);
  const [waterGoal, setWaterGoal] = useState(8);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const goalsRes = await goalsApi.me();
        
        // Map goals response from backend format
        const goalsData = goalsRes.data;
        setGoals({
          target_calories: goalsData.daily_calories || 2000,
          protein_goal: goalsData.protein_g || 150,
          carbs_goal: goalsData.carbs_g || 200,
          fat_goal: goalsData.fat_g || 65,
          weight_goal: goalsData.weight_goal,
        });
        
        // Fetch nutrition data
        const dailyNutritionRes = await loggingApi.today();
        const dailyNutrition: DailyNutrition = dailyNutritionRes.data;
        setSummary({
          calories_consumed: dailyNutrition.consumed_calories,
          calories_burned: dailyNutrition.burned_calories,
          protein: dailyNutrition.consumed_protein,
          carbs: dailyNutrition.consumed_carbs,
          fat: dailyNutrition.consumed_fat,
        });
        
        // Fetch today's food and exercise logs
        try {
          const logsRes = await loggingApi.logs();
          if (logsRes.data && Array.isArray(logsRes.data)) {
            setLogs(logsRes.data);
          }
        } catch (logsError) {
          console.log("No logs found for today");
          setLogs([]);
        }
        
        // Fetch weight history
        const weightRes = await weightApi.history();
        if (weightRes.data?.history && Array.isArray(weightRes.data.history)) {
          const formattedHistory: WeightEntry[] = weightRes.data.history.map((entry: any) => ({
            date: new Date(entry.logged_at).toISOString().split('T')[0],
            weight: entry.weight_kg,
          }));
          setWeightHistory(formattedHistory);
        }
        
        // Fetch water data - handle error if goal not set
        try {
          const waterRes = await waterApi.today();
          if (waterRes.data?.consumed_glasses !== undefined) {
            setWaterGlasses(waterRes.data.consumed_glasses);
          }
          if (waterRes.data?.target_glasses !== undefined) {
            setWaterGoal(waterRes.data.target_glasses);
          }
        } catch (waterError: any) {
          // Water goal might not be set yet - show 0 glasses with 8 target
          console.log("Water goal not set yet");
          setWaterGlasses(0);
          setWaterGoal(8);
        }
      } catch (error: any) {
        console.error("Error fetching dashboard data:", error?.message);
        toast({
          title: "Failed to load data",
          description: "Please refresh the page",
          variant: "destructive",
        });
      }
    };
    
    fetchData();
  }, [toast]);

  const handleAISubmit = async (input: string) => {
    setIsLoading(true);
    try {
      const previousCalories = summary?.calories_consumed || 0;
      const response = await loggingApi.log(input);
      const result = response.data as DailyNutrition;
      
      // Update summary with new data from backend
      setSummary({
        calories_consumed: result.consumed_calories,
        calories_burned: result.burned_calories,
        protein: result.consumed_protein,
        carbs: result.consumed_carbs,
        fat: result.consumed_fat,
      });
      
      // Parse input to get item name for display
      const itemName = input.split(' ').slice(0, 5).join(' ');
      const now = new Date();
      const timeStr = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
      
      // Calculate calories added (difference from previous)
      const caloriesAdded = Math.round(result.consumed_calories - previousCalories);
      
      // Create a display log entry
      const newLog: FoodLog = {
        id: `${Date.now()}`,
        name: itemName,
        calories: caloriesAdded,
        time: timeStr,
        type: "food",
      };
      
      setLogs(prev => [newLog, ...prev]);
      
      toast({
        title: "Logged successfully!",
        description: `Added to your diary.`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to log",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddWater = async () => {
    try {
      await waterApi.addGlass();
      setWaterGlasses(prev => Math.min(prev + 1, waterGoal));
      toast({
        title: "Water logged!",
        description: "Keep up the good hydration!",
      });
    } catch (error: any) {
      toast({
        title: "Failed to log water",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Track your nutrition and fitness progress</p>
        </div>

        {/* AI Input */}
        <AIInputBox onSubmit={handleAISubmit} isLoading={isLoading} />

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Left Column - Calories & Macros */}
          <div className="lg:col-span-2 space-y-6">
            {goals && summary ? (
              <>
                <CaloriesRing
                  consumed={summary.calories_consumed}
                  goal={goals.target_calories}
                  burned={summary.calories_burned}
                />

                <div className="grid grid-cols-3 gap-4">
                  <MacroCard
                    label="Protein"
                    value={summary.protein}
                    goal={goals.protein_goal}
                    unit="g"
                    colorClass="stroke-protein"
                    icon={<Beef className="w-4 h-4" />}
                  />
                  <MacroCard
                    label="Carbs"
                    value={summary.carbs}
                    goal={goals.carbs_goal}
                    unit="g"
                    colorClass="stroke-carbs"
                    icon={<Wheat className="w-4 h-4" />}
                  />
                  <MacroCard
                    label="Fat"
                    value={summary.fat}
                    goal={goals.fat_goal}
                    unit="g"
                    colorClass="stroke-fat"
                    icon={<Droplet className="w-4 h-4" />}
                  />
                </div>
              </>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <p className="text-lg">Loading your goals...</p>
                <p className="text-sm">Please ensure your goals are set up</p>
              </div>
            )}

            {/* Recent Logs */}
            <div>
              <h2 className="text-lg font-semibold mb-4">Today's Log</h2>
              <div className="space-y-3">
                {logs.length > 0 ? (
                  logs.map((log) => (
                    <FoodLogItem key={log.id} {...log} />
                  ))
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No entries yet today</p>
                    <p className="text-sm">Use the AI logger above to add your first meal!</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Water & Weight */}
          <div className="space-y-6">
            <WaterTracker
              glasses={waterGlasses}
              goal={waterGoal}
              onAddGlass={handleAddWater}
            />
            {goals && <WeightChart data={weightHistory} goal={goals.weight_goal} />}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
