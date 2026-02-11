import { useNavigate } from 'react-router-dom';
import { useReminders } from '../hooks/useReminders';
import { api } from '../lib/api';
import { EmptyState } from '../components/EmptyState';

const TYPE_ICONS: Record<string, string> = {
  spraying: '💨',
  irrigation: '💧',
  fertilizer: '🧪',
  harvesting: '🌾',
};

export function RemindersList() {
  const navigate = useNavigate();
  const { reminders, upcoming, overdue, loading, refetch } = useReminders();

  const handleMarkDone = async (id: string) => {
    try {
      await api.markReminderDone(id);
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this reminder?')) return;
    try {
      await api.deleteReminder(id);
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const doneReminders = reminders.filter((r) => r.is_done);

  const ReminderCard = ({ rem, showActions = true }: { rem: any; showActions?: boolean }) => (
    <div className={`glass-card rounded-xl p-4 ${rem.is_done ? 'opacity-50' : ''}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="text-lg">{TYPE_ICONS[rem.reminder_type] || '⏰'}</span>
            <h4 className="font-bold text-stone-700 capitalize">{rem.reminder_type}</h4>
          </div>
          <p className="text-sm text-stone-500 mt-1">
            {rem.crop_id?.crop_name || 'Unknown Crop'} · {new Date(rem.scheduled_date).toLocaleDateString()}
          </p>
          {rem.notes && <p className="text-xs text-stone-400 mt-1">{rem.notes}</p>}
        </div>
        {showActions && !rem.is_done && (
          <div className="flex gap-1">
            <button onClick={() => handleMarkDone(rem._id)} className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-bold hover:bg-emerald-100 transition-colors">
              ✓ Done
            </button>
            <button onClick={() => handleDelete(rem._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors text-sm">
              🗑️
            </button>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 animate-[fadeIn_0.3s_ease-out] max-w-3xl lg:mx-auto space-y-4">
      {/* Add button */}
      <button
        onClick={() => navigate('/reminders/add')}
        className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white rounded-2xl p-4 font-bold text-base shadow-xl shadow-amber-600/20 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <span className="text-xl">⏰</span>
        Add Reminder
      </button>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
              <div className="h-5 bg-stone-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-stone-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : reminders.length === 0 ? (
        <div className="glass-card rounded-2xl p-6">
          <EmptyState
            icon="⏰"
            title="No Reminders"
            description="Set reminders for spraying, irrigation, fertilizer, and harvesting."
            action={{ label: '+ Add Reminder', onClick: () => navigate('/reminders/add') }}
          />
        </div>
      ) : (
        <>
          {/* Overdue */}
          {overdue.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-red-600 mb-2 flex items-center gap-1.5">
                🚨 Overdue ({overdue.length})
              </h3>
              <div className="space-y-2">
                {overdue.map((rem) => (
                  <div key={rem._id} className="border-l-4 border-red-400 rounded-r-xl">
                    <ReminderCard rem={rem} />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-amber-600 mb-2 flex items-center gap-1.5">
                📅 Upcoming ({upcoming.length})
              </h3>
              <div className="space-y-2">
                {upcoming.map((rem) => (
                  <ReminderCard key={rem._id} rem={rem} />
                ))}
              </div>
            </div>
          )}

          {/* Done */}
          {doneReminders.length > 0 && (
            <div>
              <h3 className="text-sm font-bold text-stone-400 mb-2 flex items-center gap-1.5">
                ✅ Completed ({doneReminders.length})
              </h3>
              <div className="space-y-2">
                {doneReminders.map((rem) => (
                  <ReminderCard key={rem._id} rem={rem} showActions={false} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
