import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAnimals } from '../hooks/useAnimals';
import { useReports } from '../hooks/useReports';
import { useToast } from '../components/Toast';
import { db } from '../lib/db';

const typeEmojis: Record<string, string> = {
  cow: '🐄', buffalo: '🐃', goat: '🐐', sheep: '🐑',
};

const AddReport = () => {
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


  return (
    <div className="px-4 sm:px-6 lg:px-6 py-6 animate-[fadeIn_0.3s_ease-out]">
      <div className="bg-white/60 rounded-2xl p-4 sm:p-6 lg:mx-auto">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="w-full grid grid-cols-2 items-center gap-5">
            {/* Date */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1.5">Date *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-white/60 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* Animal Dropdown Selector */}
            <div>
              <label className="block text-sm font-bold text-stone-700 mb-1.5">
                Select Animal *
                {existingReports.size > 0 && (
                  <span className="text-xs font-normal text-stone-400 ml-2">
                    ({existingReports.size} already reported today)
                  </span>
                )}
              </label>
              {animals.length === 0 ? (
                <div className="bg-white/60 border border-stone-200 rounded-xl p-4 text-center">
                  <p className="text-sm text-stone-400 mb-2">No animals found</p>
                  <button
                    type="button"
                    onClick={() => navigate('/animals/add')}
                    className="text-sm text-sky-600 font-semibold"
                  >
                    + Add Animal First
                  </button>
                </div>
              ) : (
                <div className="relative">
                  <select
                    value={animalId}
                    onChange={e => setAnimalId(Number(e.target.value))}
                    className="w-full bg-white/60 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all appearance-none cursor-pointer"
                  >
                    <option value={0}>— Choose an animal —</option>
                    {animals.map(animal => (
                      <option
                        key={animal.id}
                        value={animal.id}
                        disabled={existingReports.has(animal.id!)}
                      >
                        {typeEmojis[animal.type] || '🐾'} {animal.name}
                        {animal.tagNumber ? ` (${animal.tagNumber})` : ''}
                        {existingReports.has(animal.id!) ? ' ✓ Done' : ''}
                      </option>
                    ))}
                  </select>
                  {/* Custom dropdown arrow */}
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 text-stone-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
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
                className="w-full bg-white/60 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
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
                className="w-full bg-white/60 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-600 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all"
              />
            </div>

            {/* Notes */}
            <div className="col-span-2">
              <label className="block text-sm font-bold text-stone-700 mb-1.5">Notes</label>
              <textarea
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Any observations about the animal..."
                rows={5}
                className="w-full bg-white/60 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-sky-500/30 focus:border-sky-500 transition-all resize-none"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex justify-end w-full">
            <button
              type="submit"
              disabled={submitting || !animalId || !date}
              className="w-full lg:w-72 bg-gradient-to-r from-sky-600/80 to-sky-700/80 hover:from-sky-600/90 hover:to-sky-700/90 disabled:bg-stone-300 text-white rounded-xl py-3.5 font-bold text-base shadow-xl shadow-sky-600/20 transition-all duration-200 active:scale-[0.98]"
            >
              {submitting ? 'Saving...' : 'Save Report'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default AddReport;
