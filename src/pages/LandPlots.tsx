import { useNavigate } from 'react-router-dom';
import { useLandPlots } from '../hooks/useLandPlots';
import { EmptyState } from '../components/EmptyState';
import { api } from '../lib/api';

export function LandPlots() {
  const navigate = useNavigate();
  const { plots, loading, totalArea, refetch } = useLandPlots();

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this land plot?')) return;
    try {
      await api.deleteLandPlot(id);
      refetch();
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 animate-[fadeIn_0.3s_ease-out] max-w-3xl lg:mx-auto">
      {/* Summary */}
      <div className="glass-card rounded-2xl p-4 mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-stone-400 font-medium">Total Land</p>
          <p className="text-xl font-extrabold text-stone-800">{totalArea.toFixed(1)} acres</p>
        </div>
        <div>
          <p className="text-xs text-stone-400 font-medium">Total Plots</p>
          <p className="text-xl font-extrabold text-stone-800">{plots.length}</p>
        </div>
      </div>

      {/* Add button */}
      <button
        onClick={() => navigate('/land/add')}
        className="w-full bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white rounded-2xl p-4 font-bold text-base shadow-xl shadow-teal-600/20 transition-all duration-200 active:scale-[0.98] mb-4 flex items-center justify-center gap-2"
      >
        <span className="text-xl">🏕️</span>
        Add Land Plot
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
      ) : plots.length === 0 ? (
        <div className="glass-card rounded-2xl p-6">
          <EmptyState
            icon="🏕️"
            title="No Land Plots"
            description="Add your land plots to track crop assignments."
            action={{ label: '+ Add Plot', onClick: () => navigate('/land/add') }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {plots.map((plot) => (
            <div key={plot._id} className="glass-card rounded-2xl p-5">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-stone-800 flex items-center gap-2">
                    <span>🏕️</span> {plot.plot_name}
                  </h3>
                  <div className="flex items-center gap-3 mt-2 text-sm text-stone-500">
                    <span>📐 {plot.plot_area_acres} acres</span>
                    {plot.soil_type && <span>🌍 {plot.soil_type}</span>}
                  </div>
                  {plot.current_crop_id ? (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                      🌱 {plot.current_crop_id.crop_name || 'Assigned'}
                    </div>
                  ) : (
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-100 text-stone-500 text-xs font-bold">
                      No crop assigned
                    </div>
                  )}
                  {plot.notes && <p className="text-xs text-stone-400 mt-2">{plot.notes}</p>}
                </div>
                <div className="flex gap-1">
                  <button onClick={() => navigate(`/land/edit/${plot._id}`)} className="p-2 rounded-lg hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors">
                    ✏️
                  </button>
                  <button onClick={() => handleDelete(plot._id)} className="p-2 rounded-lg hover:bg-red-50 text-stone-400 hover:text-red-600 transition-colors">
                    🗑️
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
