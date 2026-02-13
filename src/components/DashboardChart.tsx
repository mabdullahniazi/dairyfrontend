import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export interface DashboardChartProps {
  data: any[];
  dataKey: string;
  color?: string; // Hex color
  unit?: string;
  title?: string;
}

const COLORS: Record<string, string> = {
  emerald: '#10b981',
  rose: '#f43f5e',
  amber: '#f59e0b',
  blue: '#3b82f6',
};

export function DashboardChart({ data, dataKey, color = 'emerald', unit = '', title = 'Value' }: DashboardChartProps) {
  const hexColor = COLORS[color] || color;

  // Custom Tick for X Axis
  const CustomXAxisTick = ({ x, y, payload }: any) => {
    const date = new Date(payload.value);
    const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
    return (
      <g transform={`translate(${x},${y})`}>
        <text x={0} y={0} dy={16} textAnchor="middle" fill="#343231ff" fontSize={12} fontWeight={500}>
          {dayName}
        </text>
      </g>
    );
  };

  // Custom Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const dateStr = new Date(label).toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      return (
        <div className="glass-card rounded-lg p-2 shadow-lg border border-stone-200/50 !bg-white/95">
          <p className="text-xs text-stone-500 mb-1">{dateStr}</p>
          <p className="text-sm font-bold" style={{ color: hexColor }}>
            {payload[0].value}
            {unit} <span className="font-normal text-stone-500">{title}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-[250px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={hexColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={hexColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
          <XAxis
            dataKey="date"
            tickLine={false}
            axisLine={false}
            tick={CustomXAxisTick}
            interval={0}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            tick={{ fill: '#21201fff', fontSize: 12 }}
            domain={[0, 'auto']}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#d6d3d1', strokeWidth: 1, strokeDasharray: '4 4' }} />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={hexColor}
            strokeWidth={3}
            fillOpacity={1}
            fill={`url(#color-${dataKey})`}
            animationDuration={1500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
