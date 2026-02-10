import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAnimals } from '../hooks/useAnimals';
import { useReports } from '../hooks/useReports';
import { useToast } from '../components/Toast';
import { db } from '../lib/db';

const typeEmojis: Record<string, string> = {
  cow: '🐄', buffalo: '🐃', goat: '🐐', sheep: '🐑',
};

export function AddReport() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAnimalId = searchParams.get('animalId');
  const { animals } = useAnimals();
  const { addReport } = useReports();
  const { showToast } = useToast();

  const [animalId, setAnimalId] = useState<number>(0);
  const [date, setDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [milk, setMilk] = useState('');
  const [feed, setFeed] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [existingReports, setExistingReports] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (preselectedAnimalId) {
      setAnimalId(Number(preselectedAnimalId));
    }
  }, [preselectedAnimalId]);

  // Check which animals already have reports for selected date
  useEffect(() => {
    (async () => {
      const reports = await db.reports.where('date').equals(date).toArray();
      setExistingReports(new Set(reports.map(r => r.animalId)));
    })();
  }, [date]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!animalId || !date) return;

    setSubmitting(true);
    try {
      await addReport({
        animalId,
        date,
        milk: Number(milk) || 0,
        feed: Number(feed) || 0,
        notes: notes.trim(),
      });
      showToast('Report saved!', 'success');
      navigate('/reports', { replace: true });
    } catch (err: any) {
      showToast(err.message || 'Failed to save', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const availableAnimals = animals.filter(a => !existingReports.has(a.id!));
  const selectedAnimal = animals.find(a => a.id === animalId);

  return (
    <div className="px-5 pt-4 pb-8 animate-[fadeIn_0.3s_ease-out]">
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date */}
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1.5">Date *</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Animal Selector */}
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1.5">
            Select Animal *
            {existingReports.size > 0 && (
              <span className="text-xs font-normal text-stone-400 ml-2">
                ({existingReports.size} already reported)
              </span>
            )}
          </label>
          {animals.length === 0 ? (
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-center">
              <p className="text-sm text-stone-400 mb-2">No animals found</p>
              <button
                type="button"
                onClick={() => navigate('/animals/add')}
                className="text-sm text-amber-600 font-semibold"
              >
                + Add Animal First
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {animals.map(animal => {
                const hasReport = existingReports.has(animal.id!);
                return (
                  <button
                    key={animal.id}
                    type="button"
                    disabled={hasReport}
                    onClick={() => setAnimalId(animal.id!)}
                    className={`
                      w-full text-left flex items-center gap-3 p-3 rounded-2xl border-2 transition-all duration-200
                      ${animalId === animal.id
                        ? 'border-amber-500 bg-amber-50'
                        : hasReport
                          ? 'border-stone-100 bg-stone-50 opacity-50'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }
                    `}
                  >
                    <span className="text-2xl">{typeEmojis[animal.type] || '🐾'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-800 text-sm truncate">{animal.name}</p>
                      {animal.tagNumber && (
                        <p className="text-[10px] text-stone-400">Tag: {animal.tagNumber}</p>
                      )}
                    </div>
                    {hasReport && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 font-medium flex-shrink-0">
                        ✓ Done
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Milk */}
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1.5">
            Milk (Litres)
            <span className="text-xs font-normal text-stone-400 ml-1">optional</span>
          </label>
          <input
            type="number"
            value={milk}
            onChange={e => setMilk(e.target.value)}
            placeholder="0"
            min="0"
            step="0.5"
            className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Feed */}
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1.5">Feed Amount (kg) *</label>
          <input
            type="number"
            value={feed}
            onChange={e => setFeed(e.target.value)}
            placeholder="0"
            min="0"
            step="0.5"
            required
            className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-bold text-stone-700 mb-1.5">Notes</label>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Any observations about the animal..."
            rows={3}
            className="w-full bg-white border border-stone-200 rounded-2xl px-4 py-3.5 text-stone-800 placeholder-stone-300 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={submitting || !animalId || !date}
          className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-stone-300 text-white rounded-2xl py-4 font-bold text-base shadow-xl shadow-emerald-600/20 transition-all duration-200 active:scale-[0.98]"
        >
          {submitting ? 'Saving...' : 'Save Report'}
        </button>
      </form>
    </div>
  );
}
