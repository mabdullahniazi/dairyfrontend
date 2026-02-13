interface StatCardProps {
  icon: string;
  value: string | number;
  label: string;
  color: 'amber' | 'emerald' | 'blue' | 'rose';
}

const colorMap = {
  amber: { bg: 'bg-white/60', text: 'text-black', label: 'text-black/70' },
  emerald: { bg: 'bg-white/60', text: 'text-black', label: 'text-black/70' },
  blue: { bg: 'bg-white/60', text: 'text-black', label: 'text-black/70' },
  rose: { bg: 'bg-white/60', text: 'text-black', label: 'text-black/70' },
};

export function StatCard({ icon, value, label, color }: StatCardProps) {
  const c = colorMap[color];
  return (
    <div className={`bg-white/60 rounded-2xl p-3 ${c.bg} transition-all hover:shadow-md`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-xl text-black">{icon}</span>
      </div>
      <p className={`text-lg sm:text-2xl font-extrabold ${c.text} truncate`}>{value}</p>
      <p className={`text-[10px] sm:text-xs font-medium ${c.label} mt-0.5 truncate`}>{label}</p>
    </div>
  );
}
