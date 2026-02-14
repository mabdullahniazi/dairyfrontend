import { useNavigate } from 'react-router-dom';
import { useTodayStats } from '../hooks/useReports';
import { useAnimals } from '../hooks/useAnimals';
import { StatCard } from '../components/StatCard';
import { EmptyState } from '../components/EmptyState';
import { useEffect, useState } from 'react';
import { subscribeToPush, isPushSubscribed } from '../lib/notifications';
import { db } from '../lib/db';
import { useLiveQuery } from 'dexie-react-hooks';
import { DashboardChart } from '../components/DashboardChart';
import { FileText, PawPrint, GlassWater, Sprout, BellRing } from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const stats = useTodayStats();
  const { animals } = useAnimals();
  const [pushEnabled, setPushEnabled] = useState(false);

  const weekData = useLiveQuery(async () => {
    const days: { date: string; milk: number; feed: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayReports = await db.reports.where('date').equals(dateStr).toArray();
      const milk = dayReports.reduce((sum, r) => sum + (r.milk || 0), 0);
      const feed = dayReports.reduce((sum, r) => sum + (r.feed || 0), 0);
      days.push({ date: dateStr, milk, feed });
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
      <div className="px-4 sm:px-6 lg:px-6 pt-6">
        <div className="bg-white/60 rounded-2xl p-6 mb-4">
          <p className="text-stone-700 text-sm">{dateStr}</p>
          <h2 className="text-2xl font-extrabold text-stone-800 mt-1">{greeting} 👋</h2>
        </div>
        <div className="bg-white/60 rounded-2xl p-6">
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

  return (
    <div className="p-6 animate-[fadeIn_0.3s_ease-out] gap-5 flex flex-col overflow-hidden">
      {/* Greeting */}
      {/* <div className="flex items-center justify-center w-full gap-5">


        <div className="w-full bg-white/60 rounded-2xl p-3">
          <p className="text- text-sm">{dateStr}</p>
          <h2 className="text-2xl font-extrabold text-stone-800 mt-1">{greeting} 👋</h2>
        </div>

        <button
          onClick={() => navigate('/reports/add')}
          className="w-1/2 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white rounded-2xl p-6.5 font-bold text-base shadow-xl shadow-amber-600/20 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
        >
          <span className="text-xl">📝</span>
          Add Today's Report
        </button>
      </div> */}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard icon={<PawPrint className="w-5 h-5" />} value={stats.totalAnimals} label="Total Animals" color="amber" />
        <StatCard icon={<GlassWater className="w-5 h-5" />} value={`${stats.totalMilk}L`} label="Today's Milk" color="emerald" />
        <StatCard icon={<FileText className="w-5 h-5" />} value={stats.todayReportCount} label="Reports Today" color="blue" />
        <StatCard icon={<Sprout className="w-5 h-5" />} value={`${stats.totalFeed}kg`} label="Today's Feed" color="rose" />
      </div>

      {/* Milk Trend Chart */}
      {weekData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-white/60 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Milk Production</h3>
                <p className="text-sm text-stone-800">Daily milk records for the last 7 days</p>
              </div>
            </div>
            <DashboardChart data={weekData} dataKey="milk" color="emerald" unit="L" title="Milk" />
          </div>
          <div className="bg-white/60 rounded-2xl p-3">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-bold text-stone-900">Feed Consumption</h3>
                <p className="text-sm text-stone-800">Daily feed records for the last 7 days</p>
              </div>
            </div>
            <DashboardChart data={weekData} dataKey="feed" color="rose" unit="kg" title="Feed" />
          </div>
        </div>
      )}

      {/* Notification CTA */}
      {!pushEnabled && (
        <button
          onClick={handleEnableNotifications}
          className="w-full bg-white/60 hover:bg-white/95 rounded-2xl p-4 text-left transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl"><BellRing className="w-5 h-5" /></span>
            <div>
              <p className="font-bold text-stone-700 text-sm">Enable Reminders</p>
              <p className="text-xs text-stone-900">Get daily reminders to file your reports</p>
            </div>
          </div>
        </button>
      )}
    </div>
  );
}

export default Dashboard;