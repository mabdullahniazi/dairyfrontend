import { useParams, useNavigate } from 'react-router-dom';
import { useAnimal } from '../hooks/useAnimals';
import { useReports } from '../hooks/useReports';
import { deleteAnimalLocally } from '../lib/sync';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { useState } from 'react';

const typeEmojis: Record<string, string> = {
  cow: '🐄', buffalo: '🐃', goat: '🐐', sheep: '🐑',
};

export function AnimalDetail() {
  const { id } = useParams();
  const animalId = Number(id);
  const navigate = useNavigate();
  const { animal, loading } = useAnimal(animalId);
  const { reports } = useReports(undefined, animalId);
  const { showToast } = useToast();
  const [showDelete, setShowDelete] = useState(false);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="px-5 pt-8 text-center">
        <p className="text-stone-400">Animal not found</p>
        <button onClick={() => navigate('/animals')} className="mt-4 text-amber-600 font-semibold text-sm">
          ← Back to Animals
        </button>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteAnimalLocally(animalId);
    showToast('Animal deleted', 'success');
    navigate('/animals', { replace: true });
  };

  return (
    <div className="animate-[fadeIn_0.3s_ease-out]">
      {/* Hero */}
      <div className="bg-gradient-to-br from-amber-50 to-orange-50 px-5 py-8 text-center border-b border-amber-100">
        <span className="text-6xl">{typeEmojis[animal.type] || '🐾'}</span>
        <h2 className="text-2xl font-extrabold text-stone-800 mt-3">{animal.name}</h2>
        {animal.tagNumber && (
          <p className="text-sm text-stone-500 mt-1">Tag: {animal.tagNumber}</p>
        )}
        <div className="flex items-center justify-center gap-3 mt-3">
          <span className="text-xs font-semibold capitalize px-3 py-1 rounded-full bg-white/80 text-stone-600 border border-stone-200/60">
            {animal.type}
          </span>
          {animal.age > 0 && (
            <span className="text-xs font-semibold px-3 py-1 rounded-full bg-white/80 text-stone-600 border border-stone-200/60">
              {animal.age} {animal.age === 1 ? 'year' : 'years'} old
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="px-5 py-4 flex gap-3">
        <button
          onClick={() => navigate(`/animals/edit/${animalId}`)}
          className="flex-1 bg-amber-600 hover:bg-amber-700 text-white rounded-2xl py-3 font-semibold text-sm transition-colors"
        >
          ✏️ Edit
        </button>
        <button
          onClick={() => navigate(`/reports/add?animalId=${animalId}`)}
          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl py-3 font-semibold text-sm transition-colors"
        >
          📝 Add Report
        </button>
        <button
          onClick={() => setShowDelete(true)}
          className="px-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl py-3 font-semibold text-sm transition-colors border border-red-200"
        >
          🗑️
        </button>
      </div>

      {/* Attributes */}
      {animal.attributes && Object.keys(animal.attributes).length > 0 && (
        <div className="px-5 mb-4">
          <h3 className="text-sm font-bold text-stone-700 mb-2">Attributes</h3>
          <div className="bg-white rounded-2xl border border-stone-200/60 p-4">
            {Object.entries(animal.attributes).map(([key, value]) => (
              <div key={key} className="flex justify-between py-1.5 border-b border-stone-100 last:border-0">
                <span className="text-sm text-stone-500 capitalize">{key}</span>
                <span className="text-sm font-medium text-stone-700">{String(value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Reports */}
      <div className="px-5 pb-8">
        <h3 className="text-sm font-bold text-stone-700 mb-3">Recent Reports</h3>
        {reports.length === 0 ? (
          <div className="bg-white rounded-2xl border border-stone-200/60 p-6 text-center">
            <p className="text-stone-400 text-sm">No reports yet for this animal</p>
          </div>
        ) : (
          <div className="space-y-2">
            {reports.slice(0, 10).map(report => (
              <div key={report.id} className="bg-white rounded-2xl border border-stone-200/60 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-bold text-stone-700">
                    {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  {!report.synced && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">Unsynced</span>
                  )}
                </div>
                <div className="flex gap-4 text-sm">
                  {report.milk > 0 && (
                    <span className="text-emerald-600">🥛 {report.milk}L milk</span>
                  )}
                  {report.feed > 0 && (
                    <span className="text-amber-600">🌾 {report.feed}kg feed</span>
                  )}
                </div>
                {report.notes && (
                  <p className="text-xs text-stone-400 mt-1.5">{report.notes}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete confirmation */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Animal">
        <p className="text-sm text-stone-600 mb-4">
          Are you sure you want to delete <strong>{animal.name}</strong>? This will also remove all associated reports.
        </p>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDelete(false)}
            className="flex-1 py-3 bg-stone-100 hover:bg-stone-200 rounded-2xl font-semibold text-sm text-stone-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleDelete}
            className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-2xl font-semibold text-sm transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
