import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { weightAPI } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Scale, Loader2, TrendingDown, TrendingUp, Minus } from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface WeightEntry {
  weight: number;
  date: string;
  time: string;
}

interface WeightTrackerProps {
  history: WeightEntry[];
  onWeightLogged: (() => Promise<void>) | ((entry: WeightEntry) => void);
}

export const WeightTracker: React.FC<WeightTrackerProps> = ({
  history,
  onWeightLogged,
}) => {
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  });
  const [isLogging, setIsLogging] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!weight || !date || !time) {
      toast({
        title: 'Missing fields',
        description: 'Please fill in all fields.',
        variant: 'destructive',
      });
      return;
    }

    // Validate date format (YYYY-MM-DD)
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      toast({
        title: 'Invalid date format',
        description: 'Please use a valid date (YYYY-MM-DD).',
        variant: 'destructive',
      });
      return;
    }

    // Validate time format (HH:mm)
    if (!/^\d{2}:\d{2}$/.test(time)) {
      toast({
        title: 'Invalid time format',
        description: 'Please use a valid time (HH:mm).',
        variant: 'destructive',
      });
      return;
    }

    // Validate that date is not in the future
    const selectedDateTime = new Date(`${date}T${time}:00`);
    if (selectedDateTime > new Date()) {
      toast({
        title: 'Invalid date',
        description: 'Weight cannot be logged for a future date.',
        variant: 'destructive',
      });
      return;
    }

    setIsLogging(true);
    try {
      await weightAPI.log({
        weight: parseFloat(weight),
        date,
        time,
      });

      // Call onWeightLogged - supports both refetch function and entry callback
      if (onWeightLogged.length === 0) {
        // It's a refetch function (async with no parameters)
        await (onWeightLogged as any)();
      } else {
        // It's the old callback function
        onWeightLogged({
          weight: parseFloat(weight),
          date,
          time,
        } as any);
      }

      setWeight('');
      toast({
        title: 'Weight logged!',
        description: `Recorded ${weight} kg for ${date}.`,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to log weight. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLogging(false);
    }
  };

  // Prepare chart data
  const safeHistory = Array.isArray(history) ? history : [];
  const chartData = [...safeHistory]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(-14) // Last 14 entries
    .map((entry) => ({
      date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      weight: entry.weight,
    }));

  // Calculate trend
  const getTrend = () => {
    if (safeHistory.length < 2) return null;
    const sorted = [...safeHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latest = sorted[0].weight;
    const previous = sorted[1].weight;
    const diff = latest - previous;
    return { diff, direction: diff > 0 ? 'up' : diff < 0 ? 'down' : 'same' };
  };

  const trend = getTrend();

  return (
    <div className="glass-card p-6 h-full">
      <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <Scale className="h-5 w-5 text-success" />
        Weight Tracker
      </h2>

      {/* Input form */}
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-3 gap-3">
          <div className="space-y-2">
            <Label htmlFor="weight" className="text-xs">Weight (kg)</Label>
            <Input
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              placeholder="70.5"
              step="0.1"
              min="30"
              max="300"
              disabled={isLogging}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date" className="text-xs">Date</Label>
            <Input
              id="date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              disabled={isLogging}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="time" className="text-xs">Time</Label>
            <Input
              id="time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              disabled={isLogging}
            />
          </div>
        </div>
        <Button
          type="submit"
          disabled={isLogging}
          className="w-full gradient-primary text-primary-foreground hover:opacity-90"
        >
          {isLogging ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            'Log Weight'
          )}
        </Button>
      </form>

      {/* Trend indicator */}
      {trend && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`flex items-center justify-center gap-2 p-3 rounded-xl mb-4 ${
            trend.direction === 'down'
              ? 'bg-success/10 text-success'
              : trend.direction === 'up'
              ? 'bg-destructive/10 text-destructive'
              : 'bg-muted text-muted-foreground'
          }`}
        >
          {trend.direction === 'down' ? (
            <TrendingDown className="h-5 w-5" />
          ) : trend.direction === 'up' ? (
            <TrendingUp className="h-5 w-5" />
          ) : (
            <Minus className="h-5 w-5" />
          )}
          <span className="font-medium">
            {trend.direction === 'same'
              ? 'No change'
              : `${Math.abs(trend.diff).toFixed(1)} kg ${trend.direction === 'down' ? 'lost' : 'gained'}`}
          </span>
        </motion.div>
      )}

      {/* Chart */}
      {chartData.length > 0 ? (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
              <defs>
                <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(142, 52%, 60%)" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="hsl(160, 52%, 50%)" stopOpacity={0.2} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
              />
              <YAxis
                domain={['dataMin - 1', 'dataMax + 1']}
                tick={{ fontSize: 10 }}
                className="text-muted-foreground"
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                }}
                labelStyle={{ color: 'hsl(var(--foreground))' }}
              />
              <Line
                type="monotone"
                dataKey="weight"
                stroke="url(#weightGradient)"
                strokeWidth={3}
                dot={{ fill: 'hsl(142, 52%, 60%)', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, fill: 'hsl(142, 52%, 50%)' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="h-48 flex items-center justify-center text-muted-foreground">
          <p>No weight data yet. Start logging to see your progress!</p>
        </div>
      )}

      {/* History table */}
      {safeHistory.length > 0 && (
        <div className="mt-4 max-h-32 overflow-y-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-muted-foreground border-b border-border">
                <th className="text-left py-2 font-medium">Date</th>
                <th className="text-left py-2 font-medium">Time</th>
                <th className="text-right py-2 font-medium">Weight</th>
              </tr>
            </thead>
            <tbody>
              {[...safeHistory]
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .slice(0, 5)
                .map((entry, index) => (
                  <tr key={index} className="border-b border-border/50">
                    <td className="py-2">
                      {new Date(entry.date).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-2">{entry.time}</td>
                    <td className="py-2 text-right font-medium">{entry.weight} kg</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
