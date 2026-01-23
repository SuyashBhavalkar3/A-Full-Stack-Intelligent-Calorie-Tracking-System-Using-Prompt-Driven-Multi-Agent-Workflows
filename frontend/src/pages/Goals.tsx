import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { goalsAPI } from '@/lib/api';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Menu,
  Loader2,
  Target,
  TrendingDown,
  Flame,
  Beef,
  Wheat,
  Droplets,
  Calendar,
  Save,
} from 'lucide-react';

const Goals: React.FC = () => {
  const { user, goals, isLoading: authLoading, refreshGoals } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    target_weight: goals?.target_weight?.toString() || '',
    weekly_goal: goals?.weekly_goal || 0.5,
  });

  const handleSave = async () => {
    if (!formData.target_weight) {
      toast({
        title: 'Missing fields',
        description: 'Please enter your target weight.',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      await goalsAPI.set({
        target_weight: parseFloat(formData.target_weight),
        weekly_goal: formData.weekly_goal,
      });
      await refreshGoals();
      setIsEditing(false);
      toast({
        title: 'Goals updated!',
        description: 'Your new goals have been saved.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update goals. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center gradient-hero">
        <div className="glass-card p-8 flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 lg:hidden glass-card"
        onClick={() => setSidebarOpen(!sidebarOpen)}
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 lg:ml-64">
        <Header userName={user?.name || 'User'} />

        <main className="p-4 lg:p-6 pt-20 lg:pt-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-6"
          >
            {/* Current Goals */}
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  Current Goals
                </h2>
                {!isEditing ? (
                  <Button variant="outline" onClick={() => setIsEditing(true)}>
                    Edit Goals
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button variant="ghost" onClick={() => setIsEditing(false)}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="gradient-primary text-primary-foreground"
                    >
                      {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                      Save
                    </Button>
                  </div>
                )}
              </div>

              {isEditing ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Target Weight (kg)</Label>
                    <div className="relative">
                      <Target className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="number"
                        value={formData.target_weight}
                        onChange={(e) => setFormData({ ...formData, target_weight: e.target.value })}
                        className="pl-10"
                        step="0.1"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label>Weekly Goal</Label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, weekly_goal: 0.5 })}
                        className={`glass-card-hover p-4 text-center transition-all ${
                          formData.weekly_goal === 0.5
                            ? 'ring-2 ring-primary shadow-glow'
                            : ''
                        }`}
                      >
                        <TrendingDown className="h-6 w-6 mx-auto mb-2 text-primary" />
                        <span className="font-semibold block">0.5 kg/week</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, weekly_goal: 1 })}
                        className={`glass-card-hover p-4 text-center transition-all ${
                          formData.weekly_goal === 1
                            ? 'ring-2 ring-primary shadow-glow'
                            : ''
                        }`}
                      >
                        <TrendingDown className="h-6 w-6 mx-auto mb-2 text-secondary" />
                        <span className="font-semibold block">1 kg/week</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="glass-card-hover p-4 text-center">
                    <Target className="h-6 w-6 mx-auto mb-2 text-primary" />
                    <p className="text-2xl font-bold">{goals?.target_weight || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">Target Weight (kg)</p>
                  </div>
                  <div className="glass-card-hover p-4 text-center">
                    <TrendingDown className="h-6 w-6 mx-auto mb-2 text-success" />
                    <p className="text-2xl font-bold">{goals?.weekly_goal || 'N/A'}</p>
                    <p className="text-xs text-muted-foreground">kg/week</p>
                  </div>
                </div>
              )}
            </div>

            {/* Daily Targets */}
            {goals && (
              <div className="glass-card p-6">
                <h2 className="text-lg font-semibold mb-6">Daily Targets</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="glass-card-hover p-4 text-center">
                    <div className="w-12 h-12 rounded-xl progress-calories mx-auto mb-3 flex items-center justify-center">
                      <Flame className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{goals.daily_calories}</p>
                    <p className="text-xs text-muted-foreground">Calories</p>
                  </div>

                  <div className="glass-card-hover p-4 text-center">
                    <div className="w-12 h-12 rounded-xl progress-protein mx-auto mb-3 flex items-center justify-center">
                      <Beef className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{goals.protein}g</p>
                    <p className="text-xs text-muted-foreground">Protein</p>
                  </div>

                  <div className="glass-card-hover p-4 text-center">
                    <div className="w-12 h-12 rounded-xl progress-carbs mx-auto mb-3 flex items-center justify-center">
                      <Wheat className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{goals.carbs}g</p>
                    <p className="text-xs text-muted-foreground">Carbs</p>
                  </div>

                  <div className="glass-card-hover p-4 text-center">
                    <div className="w-12 h-12 rounded-xl progress-fat mx-auto mb-3 flex items-center justify-center">
                      <Droplets className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <p className="text-2xl font-bold">{goals.fat}g</p>
                    <p className="text-xs text-muted-foreground">Fat</p>
                  </div>
                </div>

                {/* Target date */}
                <div className="mt-6 glass-card-hover p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl progress-weight flex items-center justify-center">
                      <Calendar className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-semibold">Target Date</p>
                      <p className="text-sm text-muted-foreground">Estimated completion</p>
                    </div>
                  </div>
                  <p className="text-lg font-bold">{formatDate(goals.target_date)}</p>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Goals;
