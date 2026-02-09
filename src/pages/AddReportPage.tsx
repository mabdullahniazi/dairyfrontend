import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db, getTodayDate, type Animal } from '../db/database';

export default function AddReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedId = searchParams.get('animal');

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(preselectedId ? Number(preselectedId) : null);
  const [form, setForm] = useState({ milk: '', feed: '', notes: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [reported, setReported] = useState<Set<number>>(new Set());

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    try {
      const all = await db.animals.toArray();
      const today = getTodayDate();
      const todayReports = await db.dailyReports.where('date').equals(today).toArray();
      setAnimals(all);
      setReported(new Set(todayReports.map(r => r.animalId)));
    } catch (err) {
      console.error('Load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!selectedId) {
      setError('Select an animal');
      return;
    }

    const today = getTodayDate();
    const exists = await db.dailyReports.where('[animalId+date]').equals([selectedId, today]).first();
    if (exists) {
      setError('Report already exists for today');
      return;
    }

    setSaving(true);
    try {
      await db.dailyReports.add({
        animalId: selectedId,
        date: today,
        milk: parseFloat(form.milk) || 0,
        feed: parseFloat(form.feed) || 0,
        notes: form.notes.trim(),
        synced: false,
        createdAt: new Date(),
      });
      navigate('/', { replace: true });
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const selected = animals.find(a => a.id === selectedId);

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  if (animals.length === 0) {
    return (
      <div className="empty">
        <div className="empty-circle"></div>
        <div className="empty-title">No Animals</div>
        <p className="empty-text">Add an animal first.</p>
        <button className="btn btn-sage" onClick={() => navigate('/animals/add')}>Add Animal</button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-muted mb-6">
        {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </p>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Animal Selection */}
        {!preselectedId && (
          <div className="form-group">
            <label className="form-label">Select Animal</label>
            <div className="animal-list" style={{ maxHeight: '180px', overflowY: 'auto' }}>
              {animals.map(a => {
                const done = reported.has(a.id!);
                return (
                  <button
                    key={a.id}
                    type="button"
                    className="animal-row"
                    onClick={() => !done && setSelectedId(a.id!)}
                    disabled={done}
                    style={{
                      opacity: done ? 0.4 : 1,
                      cursor: done ? 'not-allowed' : 'pointer',
                      border: selectedId === a.id ? '2px solid var(--sage)' : undefined,
                    }}
                  >
                    <div className="avatar" style={{ width: 36, height: 36, fontSize: '0.75rem' }}>
                      {a.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="animal-info">
                      <div className="animal-name">{a.name}</div>
                      <div className="animal-type">{done ? 'Done' : a.type}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Display */}
        {preselectedId && selected && (
          <div className="card mb-4 flex gap-4" style={{ padding: '16px', alignItems: 'center' }}>
            <div className="avatar">{selected.name.slice(0, 2).toUpperCase()}</div>
            <div>
              <div style={{ fontWeight: 600 }}>{selected.name}</div>
              <div className="text-muted">{selected.type}</div>
            </div>
          </div>
        )}

        {/* Inputs */}
        <div className="form-group">
          <label className="form-label">Milk (Liters)</label>
          <input
            type="number"
            className="form-input"
            placeholder="0"
            min="0"
            step="0.5"
            value={form.milk}
            onChange={e => setForm({ ...form, milk: e.target.value })}
            inputMode="decimal"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Feed (kg)</label>
          <input
            type="number"
            className="form-input"
            placeholder="0"
            min="0"
            step="0.5"
            value={form.feed}
            onChange={e => setForm({ ...form, feed: e.target.value })}
            inputMode="decimal"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Notes</label>
          <textarea
            className="form-input"
            placeholder="Any notes..."
            value={form.notes}
            onChange={e => setForm({ ...form, notes: e.target.value })}
            rows={2}
          />
        </div>

        <hr className="divider" />

        <div className="flex gap-3">
          <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-sage" style={{ flex: 2 }} disabled={saving || !selectedId}>
            {saving ? 'Saving...' : 'Save Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
