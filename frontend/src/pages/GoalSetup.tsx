import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { useGoalsSet } from '@/hooks/use-services';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Loader2, Target, TrendingDown, Flame, Beef, Wheat, Droplets, Calendar, Dumbbell } from 'lucide-react';

const GoalSetup: React.FC = () => {
  const [targetWeight, setTargetWeight] = useState('');
  const [weeklyGoal, setWeeklyGoal] = useState<number | null>(null);
  const [goalResult, setGoalResult] = useState<{
    daily_calories: number;
    protein: number;
    carbs: number;
    fat: number;
    target_date: string;
  } | null>(null);
  const { refreshGoals, profile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutate: setGoals, isLoading } = useGoalsSet();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!targetWeight || weeklyGoal === null) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const response = await setGoals({
        target_weight: parseFloat(targetWeight),
        weekly_goal: weeklyGoal,
      });
      setGoalResult(response as any);
      await refreshGoals();
      toast({
        title: 'Goals saved!',
        description: 'Your personalized plan is ready.',
      });
    } catch (error) {
      const message = error instanceof Error 
        ? error.message 
        : 'Failed to save goals. Please try again.';
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
    }
  };

  const handleContinue = () => {
    navigate('/dashboard');
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

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
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <div className="glass-card p-8 space-y-6">
          {/* Header */}
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl gradient-primary mb-4 shadow-glow">
              <Dumbbell className="h-8 w-8 text-primary-foreground" />
            </div>
            <h1 className="text-2xl font-bold">Set Your Goals</h1>
            <p className="text-muted-foreground mt-2">
              Define your target weight and pace
            </p>
          </motion.div>

          {/* Progress indicator */}
          <div className="flex justify-center gap-2">
            <div className="w-8 h-2 rounded-full gradient-primary" />
            <div className="w-8 h-2 rounded-full gradient-primary" />
          </div>

          {!goalResult ? (
            <motion.form
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              onSubmit={handleSubmit}
              className="space-y-5"
            >
              <motion.div variants={itemVariants} className="space-y-2">
                <Label htmlFor="targetWeight">Target Weight (kg)</Label>
                <div className="relative">
                  <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="targetWeight"
                    type="number"
                    placeholder={profile?.weight ? `Current: ${profile.weight} kg` : '65'}
                    value={targetWeight}
                    onChange={(e) => setTargetWeight(e.target.value)}
                    className="pl-10"
                    min="30"
                    max="300"
                    step="0.1"
                    disabled={isLoading}
                  />
                </div>
              </motion.div>

              <motion.div variants={itemVariants} className="space-y-3">
                <Label>Weekly Goal</Label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setWeeklyGoal(0.5)}
                    disabled={isLoading}
                    className={`glass-card-hover p-4 text-center transition-all ${
                      weeklyGoal === 0.5
                        ? 'ring-2 ring-primary shadow-glow'
                        : 'hover:shadow-soft-md'
                    }`}
                  >
                    <TrendingDown className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <span className="font-semibold block">0.5 kg/week</span>
                    <span className="text-xs text-muted-foreground">Gradual & steady</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setWeeklyGoal(1)}
                    disabled={isLoading}
                    className={`glass-card-hover p-4 text-center transition-all ${
                      weeklyGoal === 1
                        ? 'ring-2 ring-primary shadow-glow'
                        : 'hover:shadow-soft-md'
                    }`}
                  >
                    <TrendingDown className="h-6 w-6 mx-auto mb-2 text-secondary" />
                    <span className="font-semibold block">1 kg/week</span>
                    <span className="text-xs text-muted-foreground">Moderate pace</span>
                  </button>
                </div>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  type="submit"
                  className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Calculating...
                    </>
                  ) : (
                    'Calculate My Plan'
                  )}
                </Button>
              </motion.div>
            </motion.form>
          ) : (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
              <motion.div
                variants={itemVariants}
                className="text-center p-4 rounded-xl bg-success/10 border border-success/20"
              >
                <h3 className="font-semibold text-success mb-1">Your Personalized Plan</h3>
                <p className="text-sm text-muted-foreground">Based on your profile and goals</p>
              </motion.div>

              <div className="grid grid-cols-2 gap-3">
                <motion.div
                  variants={itemVariants}
                  className="glass-card-hover p-4 text-center"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl progress-calories mb-2">
                    <Flame className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{goalResult.daily_calories}</p>
                  <p className="text-xs text-muted-foreground">Daily Calories</p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="glass-card-hover p-4 text-center"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl progress-protein mb-2">
                    <Beef className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{goalResult.protein}g</p>
                  <p className="text-xs text-muted-foreground">Protein</p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="glass-card-hover p-4 text-center"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl progress-carbs mb-2">
                    <Wheat className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{goalResult.carbs}g</p>
                  <p className="text-xs text-muted-foreground">Carbs</p>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="glass-card-hover p-4 text-center"
                >
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl progress-fat mb-2">
                    <Droplets className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <p className="text-2xl font-bold">{goalResult.fat}g</p>
                  <p className="text-xs text-muted-foreground">Fat</p>
                </motion.div>
              </div>

              <motion.div
                variants={itemVariants}
                className="glass-card-hover p-4 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl progress-weight">
                    <Calendar className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <p className="font-semibold">Target Date</p>
                    <p className="text-sm text-muted-foreground">Estimated completion</p>
                  </div>
                </div>
                <p className="text-lg font-bold">{formatDate(goalResult.target_date)}</p>
              </motion.div>

              <motion.div variants={itemVariants}>
                <Button
                  onClick={handleContinue}
                  className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
                >
                  Go to Dashboard
                </Button>
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default GoalSetup;
