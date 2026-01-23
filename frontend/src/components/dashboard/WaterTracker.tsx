import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { waterAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Droplets, Plus, Settings, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface WaterTrackerProps {
  goal: number; // liters
  glasses: number;
  onGlassAdded: (glasses: number) => void;
  onGoalUpdated: (goal: number) => void;
}

export const WaterTracker: React.FC<WaterTrackerProps> = ({
  goal,
  glasses,
  onGlassAdded,
  onGoalUpdated,
}) => {
  const [isAddingGlass, setIsAddingGlass] = useState(false);
  const [isSettingGoal, setIsSettingGoal] = useState(false);
  const [newGoal, setNewGoal] = useState((goal || 2).toString());
  const [dialogOpen, setDialogOpen] = useState(false);
  const { toast } = useToast();

  // Convert liters to glasses (250ml per glass)
  const totalGlasses = Math.ceil(((goal || 2) * 1000) / 250);
  const percentage = Math.min((glasses / totalGlasses) * 100, 100);

  const handleAddGlass = async () => {
    if (glasses >= totalGlasses) {
      toast({
        title: 'Goal reached!',
        description: 'You\'ve already met your water goal for today! 🎉',
      });
      return;
    }

    setIsAddingGlass(true);
    try {
      await waterAPI.addGlass();
      onGlassAdded(glasses + 1);
      
      if (glasses + 1 === totalGlasses) {
        toast({
          title: 'Congratulations! 🎉',
          description: 'You\'ve reached your daily water goal!',
        });
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add glass. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAddingGlass(false);
    }
  };

  const handleSetGoal = async () => {
    const goalValue = parseFloat(newGoal);
    if (isNaN(goalValue) || goalValue <= 0 || goalValue > 10) {
      toast({
        title: 'Invalid goal',
        description: 'Please enter a value between 0.5 and 10 liters.',
        variant: 'destructive',
      });
      return;
    }

    setIsSettingGoal(true);
    try {
      await waterAPI.setGoal(goalValue);
      onGoalUpdated(goalValue);
      setDialogOpen(false);
      toast({
        title: 'Goal updated!',
        description: `Your new daily goal is ${goalValue}L (${Math.ceil((goalValue * 1000) / 250)} glasses).`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update goal. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSettingGoal(false);
    }
  };

  return (
    <div className="glass-card p-6 h-full">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <Droplets className="h-5 w-5 text-primary" />
          Water Tracker
        </h2>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Set Daily Water Goal</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Goal (liters)</label>
                <Input
                  type="number"
                  value={newGoal}
                  onChange={(e) => setNewGoal(e.target.value)}
                  min="0.5"
                  max="10"
                  step="0.5"
                />
                <p className="text-xs text-muted-foreground">
                  This equals {Math.ceil((parseFloat(newGoal || '0') * 1000) / 250)} glasses (250ml each)
                </p>
              </div>
              <Button
                onClick={handleSetGoal}
                disabled={isSettingGoal}
                className="w-full gradient-primary text-primary-foreground"
              >
                {isSettingGoal ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Save Goal'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Progress */}
      <div className="text-center mb-6">
        <p className="text-4xl font-bold text-primary">
          {glasses} <span className="text-lg font-normal text-muted-foreground">/ {totalGlasses}</span>
        </p>
        <p className="text-sm text-muted-foreground">glasses today ({goal}L goal)</p>
      </div>

      {/* Progress bar */}
      <div className="h-4 bg-muted rounded-full overflow-hidden mb-6">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5 }}
          className="h-full progress-water rounded-full"
        />
      </div>

      {/* Glasses grid */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        {Array.from({ length: totalGlasses }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className={`water-glass ${index < glasses ? 'filled' : ''}`}
          />
        ))}
      </div>

      {/* Add glass button */}
      <Button
        onClick={handleAddGlass}
        disabled={isAddingGlass || glasses >= totalGlasses}
        className="w-full gradient-primary text-primary-foreground hover:opacity-90 transition-opacity"
      >
        {isAddingGlass ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Plus className="mr-2 h-4 w-4" />
        )}
        Add Glass
      </Button>
    </div>
  );
};
