import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Scale, TrendingDown, TrendingUp } from "lucide-react";

interface WeightEntry {
  date: string;
  weight: number;
}

interface WeightChartProps {
  data: WeightEntry[];
  goal?: number;
}

export function WeightChart({ data, goal }: WeightChartProps) {
  const currentWeight = data.length > 0 ? data[data.length - 1].weight : 0;
  const previousWeight = data.length > 1 ? data[data.length - 2].weight : currentWeight;
  const change = currentWeight - previousWeight;
  const isGaining = change > 0;

  const minWeight = Math.min(...data.map(d => d.weight), goal || Infinity) - 2;
  const maxWeight = Math.max(...data.map(d => d.weight)) + 2;

  return (
    <div className="bg-card rounded-2xl p-5 shadow-sm border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          <h3 className="font-semibold">Weight Progress</h3>
        </div>
        {data.length > 0 && (
          <div className="flex items-center gap-1 text-sm">
            {isGaining ? (
              <TrendingUp className="w-4 h-4 text-accent" />
            ) : (
              <TrendingDown className="w-4 h-4 text-primary" />
            )}
            <span className={isGaining ? "text-accent" : "text-primary"}>
              {isGaining ? "+" : ""}{change.toFixed(1)} kg
            </span>
          </div>
        )}
      </div>

      {data.length > 0 ? (
        <>
          <div className="text-3xl font-bold mb-4">
            {currentWeight.toFixed(1)} <span className="text-lg font-normal text-muted-foreground">kg</span>
          </div>

          <div className="h-[160px] -mx-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  tickFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
                  }}
                />
                <YAxis
                  domain={[minWeight, maxWeight]}
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
                  width={35}
                />
                <Tooltip
                  contentStyle={{
                    background: "hsl(var(--card))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "var(--shadow-md)",
                  }}
                  labelFormatter={(value) => {
                    const date = new Date(value);
                    return date.toLocaleDateString("en-US", { 
                      weekday: "short",
                      month: "short", 
                      day: "numeric" 
                    });
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)} kg`, "Weight"]}
                />
                {goal && (
                  <Line
                    type="monotone"
                    dataKey={() => goal}
                    stroke="hsl(var(--accent))"
                    strokeDasharray="5 5"
                    strokeWidth={1}
                    dot={false}
                  />
                )}
                <Line
                  type="monotone"
                  dataKey="weight"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 0, r: 3 }}
                  activeDot={{ fill: "hsl(var(--primary))", strokeWidth: 2, stroke: "hsl(var(--card))", r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {goal && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/50 text-sm">
              <span className="text-muted-foreground">Goal Weight</span>
              <span className="font-semibold">{goal} kg</span>
            </div>
          )}
        </>
      ) : (
        <div className="h-[160px] flex items-center justify-center text-muted-foreground">
          No weight data yet
        </div>
      )}
    </div>
  );
}
