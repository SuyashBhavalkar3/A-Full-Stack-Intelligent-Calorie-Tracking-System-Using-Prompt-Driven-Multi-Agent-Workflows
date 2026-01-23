import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { CaloriesMacrosCard } from '@/components/dashboard/CaloriesMacrosCard';
import { AIFoodLogger } from '@/components/dashboard/AIFoodLogger';
import { WaterTracker } from '@/components/dashboard/WaterTracker';
import { WeightTracker } from '@/components/dashboard/WeightTracker';
import { UserProfileCard } from '@/components/dashboard/UserProfileCard';
import { useWaterToday, useWeightHistory } from '@/hooks/use-services';
import { Loader2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

interface DailyData {
  caloriesConsumed: number;
  caloriesBurned: number;
  protein: number;
  carbs: number;
  fat: number;
}

const Dashboard: React.FC = () => {
  const { user, goals, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dailyData, setDailyData] = useState<DailyData>({
    caloriesConsumed: 0,
    caloriesBurned: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  // Use custom hooks for data fetching
  const { data: waterData, isLoading: waterLoading, error: waterError, refetch: refetchWater } = useWaterToday();
  const { data: weightHistory, isLoading: weightLoading, error: weightError, refetch: refetchWeight } = useWeightHistory();

  // Show error toasts
  useEffect(() => {
    if (waterError) {
      toast({
        title: 'Warning',
        description: 'Failed to load water data. Please refresh.',
        variant: 'destructive',
      });
    }
  }, [waterError, toast]);

  useEffect(() => {
    if (weightError) {
      toast({
        title: 'Warning',
        description: 'Failed to load weight history. Please refresh.',
        variant: 'destructive',
      });
    }
  }, [weightError, toast]);

  const handleFoodLogged = (data: { calories: number; protein: number; carbs: number; fat: number }) => {
    setDailyData((prev) => ({
      ...prev,
      caloriesConsumed: prev.caloriesConsumed + data.calories,
      protein: prev.protein + data.protein,
      carbs: prev.carbs + data.carbs,
      fat: prev.fat + data.fat,
    }));
  };

  const handleExerciseLogged = (caloriesBurned: number) => {
    setDailyData((prev) => ({
      ...prev,
      caloriesBurned: prev.caloriesBurned + caloriesBurned,
    }));
  };

  const handleWaterUpdate = async () => {
    await refetchWater();
  };

  const handleWaterGoalUpdate = async () => {
    await refetchWater();
  };

  const handleWeightLogged = async () => {
    await refetchWeight();
  };

  if (authLoading || waterLoading || weightLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="glass-card p-8 flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile sidebar toggle */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden glass-card"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content */}
      <div className="flex-1 lg:ml-64">
        <Header userName={user?.name || 'User'} />

        <main className="p-4 lg:p-6 pt-20 lg:pt-6">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="max-w-7xl mx-auto space-y-6"
          >
            {/* Top row - Calories & User Profile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div variants={itemVariants} className="lg:col-span-2">
                <CaloriesMacrosCard
                  targetCalories={goals?.daily_calories || 2000}
                  caloriesConsumed={dailyData.caloriesConsumed}
                  caloriesBurned={dailyData.caloriesBurned}
                  targetProtein={goals?.protein || 150}
                  proteinConsumed={dailyData.protein}
                  targetCarbs={goals?.carbs || 250}
                  carbsConsumed={dailyData.carbs}
                  targetFat={goals?.fat || 65}
                  fatConsumed={dailyData.fat}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <UserProfileCard />
              </motion.div>
            </div>

            {/* AI Food Logger */}
            <motion.div variants={itemVariants}>
              <AIFoodLogger
                onFoodLogged={handleFoodLogged}
                onExerciseLogged={handleExerciseLogged}
              />
            </motion.div>

            {/* Water & Weight Trackers */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={itemVariants}>
                <WaterTracker
                  goal={(waterData?.target_glasses || 8) * 250 / 1000}
                  glasses={waterData?.consumed_glasses || 0}
                  onGlassAdded={handleWaterUpdate}
                  onGoalUpdated={handleWaterGoalUpdate}
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <WeightTracker
                  history={Array.isArray(weightHistory) ? weightHistory : (weightHistory?.history || [])}
                  onWeightLogged={handleWeightLogged}
                />
              </motion.div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
