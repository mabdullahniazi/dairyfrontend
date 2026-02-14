import { useState } from 'react';
import { useReports } from '../hooks/useReports';
import { useNavigate } from 'react-router-dom';
import { EmptyState } from '../components/EmptyState';
import { GlassWater, Sprout } from 'lucide-react';

const ReportsList = () => {
  const [selectedDate, setSelectedDate] = useState(() => new Date().toISOString().split('T')[0]);
  const { reports, loading } = useReports(selectedDate);
  const navigate = useNavigate();

  const navigateDay = (offset: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + offset);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const displayDate = new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric'
  });

  const totalMilk = reports.reduce((sum, r) => sum + (r.milk || 0), 0);
  const totalFeed = reports.reduce((sum, r) => sum + (r.feed || 0), 0);

  return (
    <div className="px-4 sm:px-6 lg:px-6 py-6 animate-[fadeIn_0.3s_ease-out] lg:mx-auto">
      {/* Date Navigator */}
      <div className="bg-white/60 rounded-2xl p-3 mb-4 flex items-center justify-between">
        <button
          onClick={() => navigateDay(-1)}
          className="p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="text-center">
          <p className="font-bold text-stone-800 text-md">{displayDate}</p>
          {isToday && <p className="text-[13px] text-sky-700 font-bold">TODAY</p>}
        </div>
        <button
          onClick={() => navigateDay(1)}
          className="p-2 hover:bg-stone-100 rounded-xl transition-colors text-stone-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* Day Summary */}
      {reports.length > 0 && (
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          <div className="bg-white/60 rounded-2xl p-2 sm:p-3 text-center">
            <p className="text-base sm:text-2xl font-extrabold text-emerald-700 truncate">{totalMilk}L</p>
            <p className="text-[9px] sm:text-[16px] text-emerald-700 font-bold uppercase tracking-wider">Milk</p>
          </div>
          <div className="bg-white/60 rounded-2xl p-2 sm:p-3 text-center">
            <p className="text-base sm:text-2xl font-extrabold text-amber-700 truncate">{totalFeed}kg</p>
            <p className="text-[9px] sm:text-[16px] text-amber-700 font-bold uppercase tracking-wider">Feed</p>
          </div>
          <div className="bg-white/60 rounded-2xl p-2 sm:p-3 text-center">
            <p className="text-base sm:text-2xl font-extrabold text-sky-700">{reports.length}</p>
            <p className="text-[9px] sm:text-[16px] text-sky-700 font-bold uppercase tracking-wider">Reports</p>
          </div>
        </div>
      )}

      {/* Reports List */}
      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-white/60 rounded-2xl p-6">
          <EmptyState
            icon="📋"
            title="No Reports"
            description={`No reports filed for ${displayDate}. Tap below to add one.`}
            action={{ label: '+ Add Report', onClick: () => navigate('/reports/add') }}
          />
        </div>
      ) : (
        <div className="space-y-3 pb-16 md:pb-0">
          {reports.map(report => (
            <div key={report.id} className="bg-white/60 rounded-2xl p-4 transition-all hover:shadow-md">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-4xl">
                  {report.animal?.type === 'cow' ? '🐄' : report.animal?.type === 'buffalo' ? '🐃' : report.animal?.type === 'goat' ? '🐐' : report.animal?.type === 'sheep' ? '🐑' : '🐾'}
                </span>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-stone-800 text-2xl truncate">
                    {report.animal?.name || 'Unknown Animal'}
                  </h4>
                  {report.animal?.tagNumber && (
                    <p className="text-[14px] text-stone-700 font-medium">Tag: {report.animal.tagNumber}</p>
                  )}
                </div>
                {!report.synced && (
                  <span className="text-[12px] px-3 py-1 rounded-full bg-amber-100 text-amber-700 font-medium flex-shrink-0">
                    Unsynced
                  </span>
                )}
              </div>
              <div className="flex gap-6 text-2xl">
                {report.milk > 0 && <span className="flex items-center gap-2 text-emerald-700 font-bold"><GlassWater className="w-5 h-5" /> {report.milk}L</span>}
                {report.feed > 0 && <span className="flex items-center gap-2 text-amber-700 font-bold"><Sprout className="w-5 h-5" /> {report.feed}kg</span>}
              </div>
              {report.notes && <p className="text-md capitalize text-stone-700 mt-2 mx-2 leading-relaxed">{report.notes}</p>}
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={() => navigate('/reports/add')}
        className="fixed bottom-24 md:bottom-8 right-4 md:right-8 w-14 h-14 bg-gradient-to-br from-sky-500 to-sky-700 hover:bg-sky-700 text-white rounded-2xl shadow-2xl shadow-sky-600/30 flex items-center justify-center text-2xl font-light transition-all duration-200 active:scale-90 z-20"
      >
        +
      </button>
    </div>
  );
}

export default ReportsList;