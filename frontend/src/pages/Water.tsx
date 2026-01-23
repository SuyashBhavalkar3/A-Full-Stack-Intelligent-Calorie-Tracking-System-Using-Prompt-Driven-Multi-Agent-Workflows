import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { waterAPI } from '@/lib/api';
import { WaterTracker } from '@/components/dashboard/WaterTracker';
import { Button } from '@/components/ui/button';
import { Menu, Loader2 } from 'lucide-react';

const Water: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [waterData, setWaterData] = useState({ goal: 2, glasses: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await waterAPI.getToday();
        const data = response.data;
        // Map backend response to component props
        setWaterData({
          goal: (data.target_glasses * 250) / 1000, // Convert glasses back to liters
          glasses: data.consumed_glasses,
        });
      } catch (error) {
        console.error('Error fetching water data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWaterUpdate = (glasses: number) => {
    setWaterData((prev) => ({ ...prev, glasses }));
  };

  const handleGoalUpdate = (goal: number) => {
    setWaterData((prev) => ({ ...prev, goal }));
  };

  if (authLoading || isLoading) {
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
            className="max-w-2xl mx-auto"
          >
            <h1 className="text-2xl font-bold mb-6">Water Tracker</h1>
            <WaterTracker
              goal={waterData.goal}
              glasses={waterData.glasses}
              onGlassAdded={handleWaterUpdate}
              onGoalUpdated={handleGoalUpdate}
            />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Water;
