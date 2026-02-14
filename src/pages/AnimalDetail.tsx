import { useParams, useNavigate } from 'react-router-dom';
import { useAnimal } from '../hooks/useAnimals';
import { useReports } from '../hooks/useReports';
import { deleteAnimalLocally } from '../lib/sync';
import { Modal } from '../components/Modal';
import { useToast } from '../components/Toast';
import { useState } from 'react';
import { Edit, FilePenLine, GlassWater, PawPrint, Sprout, Trash2 } from 'lucide-react';

const typeEmojis: Record<string, string> = {
  cow: '🐄', buffalo: '🐃', goat: '🐐', sheep: '🐑',
};

const AnimalDetail = () => {
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
        <div className="w-8 h-8 border-3 border-sky-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!animal) {
    return (
      <div className="px-4 sm:px-6 lg:px-6 pt-6 text-center">
        <div className="bg-white/60 rounded-2xl p-8">
          <p className="text-stone-400">Animal not found</p>
          <button onClick={() => navigate('/animals')} className="mt-4 text-sky-600 font-semibold text-sm">
            ← Back to Animals
          </button>
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    await deleteAnimalLocally(animalId);
    showToast('Animal deleted', 'success');
    navigate('/animals', { replace: true });
  };

  return (
    <div className="px-4 sm:px-6 lg:px-6 pt-6 animate-[fadeIn_0.3s_ease-out] lg:mx-auto overflow-hidden">
      {/* Hero */}
      <div className="bg-white/50 backdrop-blur-sm rounded-xl overflow-hidden mb-4 w-full">
        <div className="px-6 py-8 text-center">
          <span className="text-5xl flex items-center justify-center gap-2">{typeEmojis[animal.type] || <PawPrint className="w-5 h-5" />}</span>
          <h2 className="text-4xl font-extrabold text-stone-800 mt-3">{animal.name}</h2>
          <div className="flex items-center justify-center gap-3 mt-3">
            {animal.tagNumber && (
              <p className="text-sm font-semibold capitalize px-[20px] py-1 rounded-full bg-white/60 text-stone-600 border border-stone-200/60 text-md text-stone-200">Tag: {animal.tagNumber}</p>
            )}

            <span className="text-sm font-semibold capitalize px-[20px] py-1 rounded-full bg-white/60 text-stone-600 border border-stone-200/60">
              {animal.type}
            </span>
            
            {animal.age > 0 && (
              <span className="text-sm font-semibold px-[20px] py-1 rounded-full bg-white/60 text-stone-600 border border-stone-200/60">
                {animal.age} {animal.age === 1 ? 'year' : 'years'} old
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="w-full items-end justify-end p-4 flex flex-col lg:flex-row gap-2 lg:gap-3 border-t border-stone-100">
          <button
            onClick={() => navigate(`/animals/edit/${animalId}`)}
            className="w-full flex items-center justify-center gap-2 lg:w-44 bg-gradient-to-r from-sky-600/80 to-sky-700/80 hover:from-sky-600/90 hover:to-sky-700/90 text-white rounded-xl py-3 font-semibold text-sm transition-colors"
          >
            <Edit className="w-5 h-5" /> Edit
          </button>
          <button
            onClick={() => navigate(`/reports/add?animalId=${animalId}`)}
            className="w-full flex items-center justify-center gap-2 lg:w-44 bg-gradient-to-r from-emerald-600/80 to-emerald-700/80 hover:from-emerald-600/90 hover:to-emerald-700/90 text-white rounded-xl py-3 font-semibold text-sm transition-colors"
          >
            <FilePenLine className="w-5 h-5" /> Add Report
          </button>
          <button
            onClick={() => setShowDelete(true)}
            className="flex items-center justify-center gap-2 px-4 bg-gradient-to-r from-red-500/70 to-red-600/70 hover:from-red-500/80 hover:to-red-600/80 text-white rounded-xl py-3 font-semibold text-sm transition-colors"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>



      <div className="w-full items-center justify-center grid grid-cols-3 gap-3">
        {/* Attributes */}
        {animal.attributes && Object.keys(animal.attributes).length > 0 && (
          <div className="bg-white/60 rounded-xl p-5 w-full h-full col-span-1 ">
            <h3 className="text-sm font-bold text-stone-700 mb-2">Attributes</h3>
            <div className="space-y-2 h-full">
              {Object.entries(animal.attributes).map(([key, value]) => (
                <div key={key} className="bg-stone-50/50 rounded-xl p-3 border border-stone-100/50 flex justify-between items-center">
                  <span className="text-sm text-stone-500 capitalize font-medium">{key}</span>
                  <span className="text-sm font-bold text-stone-700">{String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent Reports */}
        <div className="bg-white/60 rounded-xl p-5 w-full h-full col-span-2 !h-[280px] overflow-y-auto">
          <h3 className="text-sm font-bold text-stone-700 mb-2">Recent Reports</h3>
          {reports.length === 0 ? (
            <p className="text-stone-400 text-sm text-center py-4">No reports yet for this animal</p>
          ) : (
            <div className="space-y-3">
              {reports.slice(0, 10).map(report => (
                <div key={report.id} className="bg-stone-50/50 rounded-xl p-4 border border-stone-100/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-bold text-stone-700">
                      {new Date(report.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    {!report.synced && (
                      <span className="text-[10px] px-2 py-1 rounded-full bg-amber-100 text-amber-700 font-semibold">Unsynced</span>
                    )}
                  </div>
                  <div className="flex gap-3 sm:gap-4 text-sm flex-wrap">
                    {report.milk > 0 && <span className="text-emerald-600 font-semibold"><GlassWater className="w-5 h-5" /> {report.milk}L milk</span>}
                    {report.feed > 0 && <span className="text-amber-600 font-semibold"><Sprout className="w-5 h-5" /> {report.feed}kg feed</span>}
                  </div>
                  {report.notes && <p className="text-sm text-stone-600 mt-1.5">{report.notes}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete confirmation */}
      <Modal open={showDelete} onClose={() => setShowDelete(false)} title="Delete Animal">
        <p className="text-sm text-stone-600 mb-4">
          Are you sure you want to delete <strong>{animal.name}</strong>? This will also remove all associated reports.
        </p>
        <div className="flex gap-3">
          <button onClick={() => setShowDelete(false)} className="flex-1 py-3 bg-stone-300 hover:bg-stone-200 rounded-xl font-semibold text-sm text-stone-700 transition-colors">Cancel</button>
          <button onClick={handleDelete} className="flex-1 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold text-sm transition-colors">Delete</button>
        </div>
      </Modal>
    </div>
  );
}

export default AnimalDetail;