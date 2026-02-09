import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { db, getAnimalEmoji, getTodayDate, type Animal } from '../db/database';

export default function AddReportPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preselectedAnimalId = searchParams.get('animalId');

  const [animals, setAnimals] = useState<Animal[]>([]);
  const [selectedAnimalId, setSelectedAnimalId] = useState<number | null>(
    preselectedAnimalId ? Number(preselectedAnimalId) : null
  );
  const [form, setForm] = useState({
    milk: '',
    feed: '',
    notes: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [animalsWithReport, setAnimalsWithReport] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const allAnimals = await db.animals.toArray();
      const today = getTodayDate();
      const todayReports = await db.dailyReports.where('date').equals(today).toArray();
      
      setAnimals(allAnimals);
      setAnimalsWithReport(new Set(todayReports.map(r => r.animalId)));
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!selectedAnimalId) {
      setError('Please select an animal');
      return;
    }

    // Check for duplicate
    const today = getTodayDate();
    const existing = await db.dailyReports
      .where('[animalId+date]')
      .equals([selectedAnimalId, today])
      .first();

    if (existing) {
      setError('A report already exists for this animal today!');
      return;
    }

    setSaving(true);
    try {
      await db.dailyReports.add({
        animalId: selectedAnimalId,
        date: today,
        milk: parseFloat(form.milk) || 0,
        feed: parseFloat(form.feed) || 0,
        notes: form.notes.trim(),
        synced: false,
        createdAt: new Date(),
      });

      navigate('/', { replace: true });
    } catch (err) {
      console.error('Failed to save report:', err);
      setError('Failed to save report. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const selectedAnimal = animals.find(a => a.id === selectedAnimalId);
  const availableAnimals = animals.filter(a => !animalsWithReport.has(a.id!));

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner" />
      </div>
    );
  }

  if (animals.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-icon">🐄</div>
        <h3 className="empty-title">No Animals Yet</h3>
        <p className="empty-text">Add your first animal before creating a report.</p>
        <button className="btn btn-primary" onClick={() => navigate('/animals/add')}>
          + Add Animal
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="page-title">
        <h1>📝 Daily Report</h1>
        <p className="page-subtitle">
          {new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {availableAnimals.length === 0 && !selectedAnimalId && (
        <div className="alert alert-success">
          ✅ All animals have reports for today! Great job!
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Animal Selector */}
        {!preselectedAnimalId && (
          <div className="form-group">
            <label className="form-label">Select Animal *</label>
            <div className="animal-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
              {animals.map(animal => {
                const hasReport = animalsWithReport.has(animal.id!);
                return (
                  <button
                    key={animal.id}
                    type="button"
                    className={`animal-item ${selectedAnimalId === animal.id ? 'selected' : ''}`}
                    onClick={() => !hasReport && setSelectedAnimalId(animal.id!)}
                    disabled={hasReport}
                    style={{
                      opacity: hasReport ? 0.5 : 1,
                      cursor: hasReport ? 'not-allowed' : 'pointer',
                      border: selectedAnimalId === animal.id ? '2px solid var(--primary)' : undefined,
                    }}
                  >
                    <div className="animal-avatar">{getAnimalEmoji(animal.type)}</div>
                    <div className="animal-info">
                      <div className="animal-name">{animal.name}</div>
                      <div className="animal-meta">
                        {hasReport ? '✅ Report added' : animal.type}
                      </div>
                    </div>
                    {!hasReport && selectedAnimalId === animal.id && (
                      <span style={{ color: 'var(--success)', fontWeight: 600 }}>✓</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Selected Animal Display */}
        {preselectedAnimalId && selectedAnimal && (
          <div className="card mb-lg" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ fontSize: '2.5rem' }}>{getAnimalEmoji(selectedAnimal.type)}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: '1.125rem' }}>{selectedAnimal.name}</div>
              <div className="text-muted">{selectedAnimal.type}</div>
            </div>
          </div>
        )}

        {/* Milk Input */}
        <div className="form-group">
          <label className="form-label">🥛 Milk (Liters)</label>
          <input
            type="number"
            className="form-input"
            placeholder="0"
            min="0"
            step="0.5"
            value={form.milk}
            onChange={(e) => setForm({ ...form, milk: e.target.value })}
            inputMode="decimal"
            style={{ fontSize: '1.25rem', fontWeight: 600 }}
          />
        </div>

        {/* Feed Input */}
        <div className="form-group">
          <label className="form-label">🌾 Feed (kg)</label>
          <input
            type="number"
            className="form-input"
            placeholder="0"
            min="0"
            step="0.5"
            value={form.feed}
            onChange={(e) => setForm({ ...form, feed: e.target.value })}
            inputMode="decimal"
            style={{ fontSize: '1.25rem', fontWeight: 600 }}
          />
        </div>

        {/* Notes */}
        <div className="form-group">
          <label className="form-label">📝 Notes (Optional)</label>
          <textarea
            className="form-input"
            placeholder="Any observations, health notes, etc."
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
          />
        </div>

        <hr className="divider" />

        {/* Submit */}
        <div className="flex gap-sm">
          <button
            type="button"
            className="btn btn-outline"
            onClick={() => navigate(-1)}
            style={{ flex: 1 }}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={saving || !selectedAnimalId}
            style={{ flex: 2 }}
          >
            {saving ? 'Saving...' : 'Save Report'}
          </button>
        </div>
      </form>
    </div>
  );
}
