import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCrops } from '../hooks/useCrops';
import { EmptyState } from '../components/EmptyState';

const STATUS_COLORS: Record<string, string> = {
  planned: 'bg-blue-100 text-blue-700',
  active: 'bg-emerald-100 text-emerald-700',
  harvested: 'bg-amber-100 text-amber-700',
};

const STATUS_ICONS: Record<string, string> = {
  planned: '📋',
  active: '🌱',
  harvested: '🌾',
};

export function CropsList() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<string>('');
  const { crops, loading } = useCrops(filter || undefined);

  const filters = [
    { label: 'All', value: '' },
    { label: 'Planned', value: 'planned' },
    { label: 'Active', value: 'active' },
    { label: 'Harvested', value: 'harvested' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 animate-[fadeIn_0.3s_ease-out] max-w-3xl lg:mx-auto">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-1">
        {filters.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
              filter === f.value
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20'
                : 'glass-card text-stone-600 hover:bg-white/90'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Add button */}
      <button
        onClick={() => navigate('/crops/add')}
        className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white rounded-2xl p-4 font-bold text-base shadow-xl shadow-emerald-600/20 transition-all duration-200 active:scale-[0.98] mb-4 flex items-center justify-center gap-2"
      >
        <span className="text-xl">🌱</span>
        Add New Crop
      </button>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
              <div className="h-5 bg-stone-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-stone-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : crops.length === 0 ? (
        <div className="glass-card rounded-2xl p-6">
          <EmptyState
            icon="🌾"
            title="No Crops Yet"
            description="Start tracking your crops by adding your first one."
            action={{ label: '+ Add Crop', onClick: () => navigate('/crops/add') }}
          />
        </div>
      ) : (
        <div className="space-y-3">
          {crops.map((crop) => (
            <button
              key={crop._id}
              onClick={() => navigate(`/crops/${crop._id}`)}
              className="w-full text-left glass-card rounded-2xl p-5 hover:bg-white/95 active:scale-[0.99] transition-all duration-200"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{STATUS_ICONS[crop.crop_status] || '🌱'}</span>
                    <h3 className="font-bold text-stone-800 truncate">{crop.crop_name}</h3>
                  </div>
                  <p className="text-sm text-stone-500">{crop.crop_type}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-stone-400">
                    <span>📐 {crop.land_size_acres} acres</span>
                    <span>📅 {new Date(crop.sowing_date).toLocaleDateString()}</span>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${STATUS_COLORS[crop.crop_status] || ''}`}>
                  {crop.crop_status}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
