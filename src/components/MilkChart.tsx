import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { db } from '../db/database';

interface ChartData {
  date: string;
  day: string;
  milk: number;
}

export default function MilkChart() {
  const [data, setData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadChartData();
  }, []);

  const loadChartData = async () => {
    try {
      const today = new Date();
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const reports = await db.dailyReports
        .where('date')
        .between(
          thirtyDaysAgo.toISOString().split('T')[0],
          today.toISOString().split('T')[0],
          true,
          true
        )
        .toArray();

      const dailyTotals: Record<string, number> = {};
      reports.forEach(report => {
        if (!dailyTotals[report.date]) {
          dailyTotals[report.date] = 0;
        }
        dailyTotals[report.date] += report.milk || 0;
      });

      const chartData: ChartData[] = [];
      for (let i = 13; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayLabel = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        chartData.push({
          date: dateStr,
          day: i === 0 ? 'Today' : dayLabel,
          milk: dailyTotals[dateStr] || 0,
        });
      }

      setData(chartData);
    } catch (err) {
      console.error('Failed to load chart data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />
    );
  }

  const maxMilk = Math.max(...data.map(d => d.milk), 1);
  const hasData = data.some(d => d.milk > 0);

  if (!hasData) {
    return (
      <div className="text-center text-muted" style={{ padding: '40px 0' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.3 }}>📊</div>
        <p style={{ fontWeight: 500 }}>No milk data yet</p>
        <p style={{ fontSize: '0.875rem' }}>Start adding daily reports to see the chart.</p>
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
        <XAxis 
          dataKey="day" 
          tick={{ fontSize: 11, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis 
          tick={{ fontSize: 11, fill: '#64748B' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(value) => `${value}L`}
        />
        <Tooltip 
          formatter={(value) => [`${value ?? 0}L`, 'Milk']}
          labelFormatter={(label) => label}
          contentStyle={{ 
            background: '#fff', 
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            fontSize: 13,
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)'
          }}
        />
        <Bar dataKey="milk" radius={[4, 4, 0, 0]}>
          {data.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={entry.milk > 0 ? (entry.milk >= maxMilk * 0.8 ? '#3B82F6' : '#60A5FA') : '#E2E8F0'} 
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
