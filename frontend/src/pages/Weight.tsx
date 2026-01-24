import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Scale, Plus, Loader2, TrendingDown, TrendingUp, Calendar } from "lucide-react";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { weightApi, goalsApi } from "@/lib/api";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, ReferenceLine } from "recharts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

interface WeightEntry {
  date: string;
  weight: number;
}

export default function Weight() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [history, setHistory] = useState<WeightEntry[]>([]);
  const [goalWeight, setGoalWeight] = useState<number | null>(null);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newWeight, setNewWeight] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch weight history
        const weightRes = await weightApi.history();
        
        // Extract history array from response
        if (weightRes.data?.history && Array.isArray(weightRes.data.history)) {
          const formattedHistory: WeightEntry[] = weightRes.data.history.map((entry: any) => ({
            date: new Date(entry.logged_at).toISOString().split('T')[0],
            weight: entry.weight_kg,
          }));
          setHistory(formattedHistory);
        }
      } catch (error: any) {
        console.error("Error fetching weight history:", error?.message);
        toast({
          title: "Failed to load weight history",
          description: "Please refresh the page",
          variant: "destructive",
        });
      }

      // Fetch goals separately - 404 is expected if no goals exist
      try {
        const goalsRes = await goalsApi.me();
        
        console.log("Goals response:", goalsRes.data);
        
        // Get weight goal from backend - backend returns "target_weight" field
        if (goalsRes.data?.target_weight) {
          console.log("Setting goalWeight to:", goalsRes.data.target_weight);
          setGoalWeight(goalsRes.data.target_weight);
        } else {
          console.log("No target_weight in response, setting to null");
          setGoalWeight(null);
        }
      } catch (error: any) {
        // 404 is expected if no goals are set yet
        if (error.response?.status === 404) {
          console.log("Goals not found (404), setting to null");
          setGoalWeight(null);
        } else {
          console.error("Error fetching goals:", error?.message);
          setGoalWeight(null);
        }
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [toast]);

  const handleAddWeight = async () => {
    const weight = parseFloat(newWeight);
    if (isNaN(weight) || weight < 30 || weight > 300) {
      toast({
        title: "Invalid weight",
        description: "Please enter a valid weight between 30-300 kg",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      await weightApi.log(weight);
      const today = new Date().toISOString().split("T")[0];
      setHistory(prev => [...prev, { date: today, weight }]);
      toast({
        title: "Weight logged!",
        description: `Recorded ${weight} kg for today.`,
      });
      setShowAddDialog(false);
      setNewWeight("");
    } catch (error: any) {
      toast({
        title: "Failed to log weight",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const currentWeight = history.length > 0 ? history[history.length - 1].weight : 0;
  const startWeight = history.length > 0 ? history[0].weight : 0;
  const totalChange = currentWeight - startWeight;
  const toGoal = goalWeight !== null ? currentWeight - goalWeight : 0;
  const isLosing = totalChange < 0;

  const minWeight = Math.min(...history.map(d => d.weight), goalWeight ?? 0) - 2;
  const maxWeight = Math.max(...history.map(d => d.weight)) + 2;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl gradient-primary flex items-center justify-center">
              <Scale className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Weight Tracking</h1>
              <p className="text-muted-foreground">Monitor your progress over time</p>
            </div>
          </div>
          <Button onClick={() => setShowAddDialog(true)} className="gradient-primary">
            <Plus className="w-4 h-4 mr-2" />
            Log Weight
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Current</div>
                <div className="text-3xl font-bold">{currentWeight.toFixed(1)}</div>
                <div className="text-sm text-muted-foreground">kg</div>
              </div>
              <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Goal</div>
                <div className="text-3xl font-bold text-primary">
                  {goalWeight !== null ? goalWeight.toFixed(1) : "—"}
                </div>
                <div className="text-sm text-muted-foreground">
                  {goalWeight !== null ? "kg" : "No goal set"}
                </div>
              </div>
              <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">To Goal</div>
                <div className="text-3xl font-bold flex items-center gap-2">
                  {goalWeight !== null ? (
                    toGoal > 0 ? (
                      <>
                        <TrendingDown className="w-5 h-5 text-primary" />
                        {toGoal.toFixed(1)}
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-5 h-5 text-accent" />
                        {Math.abs(toGoal).toFixed(1)}
                      </>
                    )
                  ) : (
                    "—"
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {goalWeight !== null ? `kg ${toGoal > 0 ? "to lose" : "to gain"}` : "No goal set"}
                </div>
              </div>
              <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
                <div className="text-sm text-muted-foreground mb-1">Total Change</div>
                <div className={`text-3xl font-bold flex items-center gap-2 ${isLosing ? "text-primary" : "text-accent"}`}>
                  {isLosing ? (
                    <TrendingDown className="w-5 h-5" />
                  ) : (
                    <TrendingUp className="w-5 h-5" />
                  )}
                  {Math.abs(totalChange).toFixed(1)}
                </div>
                <div className="text-sm text-muted-foreground">kg {isLosing ? "lost" : "gained"}</div>
              </div>
            </div>

            {/* Goal Setup Hint */}
            {goalWeight === null && (
              <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                  <div className="text-blue-600 dark:text-blue-400 mt-0.5">ℹ️</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Set Your Weight Goal</h3>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">Visit your goals page to set a target weight. This will help you track your progress towards your objective.</p>
                    <Button 
                      onClick={() => navigate("/goals")}
                      variant="outline"
                      size="sm"
                      className="text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                    >
                      Set Weight Goal →
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Chart */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
              <h2 className="text-lg font-semibold mb-4">Weight History</h2>
              <div className="h-[300px] lg:h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={history} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      tickFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                      }}
                    />
                    <YAxis
                      domain={[minWeight, maxWeight]}
                      axisLine={false}
                      tickLine={false}
                      tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                      width={45}
                      tickFormatter={(value) => `${value} kg`}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        boxShadow: "var(--shadow-md)",
                      }}
                      labelFormatter={(value) => {
                        const date = new Date(value);
                        return date.toLocaleDateString("en-US", { 
                          weekday: "long",
                          month: "long", 
                          day: "numeric" 
                        });
                      }}
                      formatter={(value: number) => [`${value.toFixed(1)} kg`, "Weight"]}
                    />
                    {goalWeight !== null && (
                      <ReferenceLine
                        y={goalWeight}
                        stroke="hsl(var(--primary))"
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        label={{
                          value: `Goal: ${goalWeight} kg`,
                          position: "right",
                          fill: "hsl(var(--primary))",
                          fontSize: 12,
                        }}
                      />
                    )}
                    <Line
                      type="monotone"
                      dataKey="weight"
                      stroke="hsl(var(--accent))"
                      strokeWidth={3}
                      dot={{ fill: "hsl(var(--accent))", strokeWidth: 0, r: 4 }}
                      activeDot={{ fill: "hsl(var(--accent))", strokeWidth: 3, stroke: "hsl(var(--card))", r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* History List */}
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border/50">
              <h2 className="text-lg font-semibold mb-4">Recent Entries</h2>
              <div className="space-y-3">
                {[...history].reverse().slice(0, 7).map((entry, idx) => {
                  const prevWeight = history[history.length - 2 - idx]?.weight;
                  const change = prevWeight ? entry.weight - prevWeight : 0;
                  
                  return (
                    <div key={`${entry.date}-${idx}`} className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {new Date(entry.date).toLocaleDateString("en-US", { 
                            weekday: "short",
                            month: "short", 
                            day: "numeric" 
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        {change !== 0 && (
                          <span className={`text-sm ${change < 0 ? "text-primary" : "text-accent"}`}>
                            {change > 0 ? "+" : ""}{change.toFixed(1)} kg
                          </span>
                        )}
                        <span className="font-semibold">{entry.weight.toFixed(1)} kg</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>

      {/* Add Weight Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Log Today's Weight</DialogTitle>
          </DialogHeader>
          <div className="py-6">
            <div className="flex items-center gap-4">
              <Input
                type="number"
                step="0.1"
                placeholder="73.5"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                className="h-16 text-3xl font-bold text-center"
                autoFocus
              />
              <span className="text-xl text-muted-foreground">kg</span>
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddWeight} className="gradient-primary" disabled={isSaving}>
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
