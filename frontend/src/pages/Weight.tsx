import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Header } from '@/components/dashboard/Header';
import { weightAPI } from '@/lib/api';
import { WeightTracker } from '@/components/dashboard/WeightTracker';
import { Button } from '@/components/ui/button';
import { Menu, Loader2 } from 'lucide-react';

interface WeightEntry {
  weight: number;
  date: string;
  time: string;
}

const Weight: React.FC = () => {
  const { user, isLoading: authLoading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [weightHistory, setWeightHistory] = useState<WeightEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await weightAPI.getHistory();
        const history = Array.isArray(response.data) ? response.data : (response.data?.history || []);
        setWeightHistory(history);
      } catch (error) {
        console.error('Error fetching weight data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleWeightLogged = (entry: WeightEntry) => {
    setWeightHistory((prev) =>
      [...prev, entry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    );
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
            <h1 className="text-2xl font-bold mb-6">Weight Tracker</h1>
            <WeightTracker history={weightHistory} onWeightLogged={handleWeightLogged} />
          </motion.div>
        </main>
      </div>
    </div>
  );
};

export default Weight;
