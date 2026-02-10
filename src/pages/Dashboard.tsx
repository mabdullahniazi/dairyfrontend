import { useNavigate } from 'react-router-dom';
import { useTodayStats } from '../hooks/useReports';
import { useAnimals } from '../hooks/useAnimals';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { useEffect, useState } from 'react';
import { subscribeToPush, isPushSubscribed } from '../lib/notifications';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';

export function Dashboard() {
  const navigate = useNavigate();
  const stats = useTodayStats();
  const { animals } = useAnimals();
  const [pushEnabled, setPushEnabled] = useState(false);

  const weekData = useLiveQuery(async () => {
    const days: { date: string; milk: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayReports = await db.reports.where('date').equals(dateStr).toArray();
      const milk = dayReports.reduce((sum, r) => sum + (r.milk || 0), 0);
      days.push({ date: dateStr, milk });
    }
    return days;
  }, []);

  useEffect(() => {
    isPushSubscribed().then(setPushEnabled);
  }, []);

  const handleEnableNotifications = async () => {
    const ok = await subscribeToPush();
    setPushEnabled(ok);
  };

  const today = new Date();
  const greeting = today.getHours() < 12 ? 'Good Morning' : today.getHours() < 17 ? 'Good Afternoon' : 'Good Evening';
  const dateStr = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  if (animals.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pt-6">
        <div className="glass-card rounded-2xl p-6 mb-4">
          <p className="text-stone-400 text-sm">{dateStr}</p>
          <h2 className="text-2xl font-extrabold text-stone-800 mt-1">{greeting} 👋</h2>
        </div>
        <div className="glass-card rounded-2xl p-6">
          <EmptyState
            icon="🐄"
            title="Welcome to Livestock Managers"
            description="Start by adding your first animal to track daily reports and milk production."
            action={{ label: '+ Add First Animal', onClick: () => navigate('/animals/add') }}
          />
        </div>
      </div>
    );
  }

  const maxMilk = Math.max(...(weekData || []).map(d => d.milk), 1);

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 animate-[fadeIn_0.3s_ease-out] max-w-3xl lg:mx-auto">
      {/* Greeting */}
      <div className="glass-card rounded-2xl p-5 mb-4">
        <p className="text-stone-400 text-sm">{dateStr}</p>
        <h2 className="text-2xl font-extrabold text-stone-800 mt-1">{greeting} 👋</h2>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard icon="🐾" value={stats.totalAnimals} label="Total Animals" color="amber" />
        <StatCard icon="🥛" value={`${stats.totalMilk}L`} label="Today's Milk" color="emerald" />
        <StatCard icon="📋" value={stats.todayReportCount} label="Reports Today" color="blue" />
        <StatCard icon="🌾" value={`${stats.totalFeed}kg`} label="Today's Feed" color="rose" />
      </div>

      {/* Quick Action */}
      <button
        onClick={() => navigate('/reports/add')}
        className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-2xl p-4 font-bold text-base shadow-xl shadow-amber-600/20 transition-all duration-200 active:scale-[0.98] mb-4 flex items-center justify-center gap-2"
      >
        <span className="text-xl">📝</span>
        Add Today's Report
      </button>

      {/* Milk Trend Sparkline */}
      {weekData && weekData.some(d => d.milk > 0) && (
        <div className="glass-card rounded-2xl p-5 mb-4">
          <h3 className="text-sm font-bold text-stone-700 mb-3">Milk This Week</h3>
          <div className="flex items-end gap-1.5 h-20">
            {weekData.map((day, i) => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full relative flex items-end justify-center" style={{ height: '52px' }}>
                  <div
                    className="w-full max-w-[32px] rounded-lg bg-gradient-to-t from-emerald-500 to-emerald-400 transition-all duration-500"
                    style={{
                      height: `${Math.max((day.milk / maxMilk) * 100, 4)}%`,
                      opacity: i === weekData.length - 1 ? 1 : 0.6,
                    }}
                  />
                </div>
                <span className="text-[9px] text-stone-400 font-medium">
                  {new Date(day.date).toLocaleDateString('en', { weekday: 'narrow' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notification CTA */}
      {!pushEnabled && (
        <button
          onClick={handleEnableNotifications}
          className="w-full glass-card hover:bg-white/95 rounded-2xl p-4 text-left transition-colors mb-4"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔔</span>
            <div>
              <p className="font-bold text-stone-700 text-sm">Enable Reminders</p>
              <p className="text-xs text-stone-400">Get daily reminders to file your reports</p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}
