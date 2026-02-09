import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Cell,
} from "recharts";
import { db } from "../db/database";

interface ChartData {
  date: string;
  day: string;
  milk: number;
}

export default function MilkChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const today = new Date();
      const ago = new Date(today);
      ago.setDate(ago.getDate() - 30);

      const reports = await db.dailyReports
        .where("date")
        .between(
          ago.toISOString().split("T")[0],
          today.toISOString().split("T")[0],
          true,
          true,
        )
        .toArray();

      const totals: Record<string, number> = {};
      reports.forEach((r) => {
        if (!totals[r.date]) totals[r.date] = 0;
        totals[r.date] += r.milk || 0;
      });

      const chartData: ChartData[] = [];
      for (let i = 13; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];
        chartData.push({
          date: dateStr,
          day:
            i === 0
              ? "Today"
              : d.toLocaleDateString("en-US", { weekday: "short" }),
          milk: totals[dateStr] || 0,
        });
      }

      setData(chartData);
    } catch (err) {
      console.error("Chart load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="skeleton" style={{ height: 160 }} />;

  const hasData = data.some((d) => d.milk > 0);
  if (!hasData) {
    return (
      <div className="text-center text-muted" style={{ padding: "32px 0" }}>
        <p style={{ fontWeight: 500 }}>No data yet</p>
        <p style={{ fontSize: "0.8rem" }}>Add reports to see the chart.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <XAxis
          dataKey="day"
          tick={{ fontSize: 10, fill: "#9199AD" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: "#9199AD" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}L`}
        />
        <Tooltip
          formatter={(value) => [`${value ?? 0}L`, "Milk"]}
          contentStyle={{
            background: "#fff",
            border: "1px solid #E3E5EB",
            borderRadius: 8,
            fontSize: 12,
          }}
        />
        <Bar dataKey="milk" radius={[3, 3, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`cell-${index}`}
              fill={entry.milk > 0 ? "#4361EE" : "#E3E5EB"}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
