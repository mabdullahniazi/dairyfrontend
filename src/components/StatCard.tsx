interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color: 'amber' | 'emerald' | 'blue' | 'rose';
}

const colorMap = {
  amber: { bg: 'bg-amber-50/80', text: 'text-amber-700', label: 'text-amber-600/70' },
  emerald: { bg: 'bg-emerald-50/80', text: 'text-emerald-700', label: 'text-emerald-600/70' },
  blue: { bg: 'bg-blue-50/80', text: 'text-blue-700', label: 'text-blue-600/70' },
  rose: { bg: 'bg-rose-50/80', text: 'text-rose-700', label: 'text-rose-600/70' },
};

export function StatCard({ icon, value, label, color }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`glass-card rounded-2xl p-4 ${c.bg} transition-all hover:shadow-md`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl">{icon}</span>
      </div>
      <p className={`text-lg sm:text-2xl font-extrabold ${c.text} truncate`}>{value}</p>
      <p className={`text-[10px] sm:text-xs font-medium ${c.label} mt-0.5 truncate`}>{label}</p>
    </div>
  );
}
