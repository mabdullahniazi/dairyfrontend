interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color?: 'amber' | 'emerald' | 'blue' | 'rose';
}

const colorMap = {
  amber: 'from-amber-500/15 to-amber-600/5 border-amber-200/60 text-amber-700',
  emerald: 'from-emerald-500/15 to-emerald-600/5 border-emerald-200/60 text-emerald-700',
  blue: 'from-blue-500/15 to-blue-600/5 border-blue-200/60 text-blue-700',
  rose: 'from-rose-500/15 to-rose-600/5 border-rose-200/60 text-rose-700',
};

export function StatCard({ icon, value, label, color = 'amber' }: StatCardProps) {
  return (
    <div className={`
      bg-gradient-to-br ${colorMap[color]}
      border rounded-2xl p-4 flex flex-col gap-1
      transition-transform active:scale-[0.97]
    `}>
      <span className="text-2xl">{icon}</span>
      <span className="text-2xl font-extrabold tracking-tight">{value}</span>
      <span className="text-xs font-medium opacity-70 uppercase tracking-wider">{label}</span>
    </div>
  );
}
