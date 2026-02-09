import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { db, type Animal } from '../db/database';

type AnimalType = 'cow' | 'buffalo' | 'goat' | 'sheep';
const animalTypes: AnimalType[] = ['cow', 'buffalo', 'goat', 'sheep'];

export default function AnimalFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [form, setForm] = useState({
    name: '',
    tagNumber: '',
    type: 'cow' as AnimalType,
    age: 0,
  });
  const [attrs, setAttrs] = useState<{ key: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) loadAnimal();
  }, [id]);

  const loadAnimal = async () => {
    setLoading(true);
    try {
      const animal = await db.animals.get(Number(id));
      if (animal) {
        setForm({
          name: animal.name,
          tagNumber: animal.tagNumber,
          type: animal.type,
          age: animal.age,
        });
        setAttrs(Object.entries(animal.attributes || {}).map(([key, value]) => ({ key, value: String(value) })));
      }
    } catch (err) {
      console.error('Load failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }

    setSaving(true);
    try {
      const attributes: Record<string, string> = {};
      attrs.forEach(({ key, value }) => {
        if (key.trim()) attributes[key.trim()] = value;
      });

      const data: Omit<Animal, 'id'> = {
        name: form.name.trim(),
        tagNumber: form.tagNumber.trim(),
        type: form.type,
        age: Math.max(0, form.age),
        attributes,
        synced: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      if (isEditing) {
        await db.animals.update(Number(id), { ...data, updatedAt: new Date() });
      } else {
        await db.animals.add(data);
      }
      navigate('/animals', { replace: true });
    } catch (err) {
      console.error('Save failed:', err);
      setError('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="loader"><div className="spinner" /></div>;

  return (
    <div>
      <h2 className="mb-4">{isEditing ? 'Edit Animal' : 'Add Animal'}</h2>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="form-label">Name</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Ganga"
            value={form.name}
            onChange={e => setForm({ ...form, name: e.target.value })}
            autoFocus
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tag Number</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. A001"
            value={form.tagNumber}
            onChange={e => setForm({ ...form, tagNumber: e.target.value })}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Type</label>
          <div className="type-picker">
            {animalTypes.map(t => (
              <button
                key={t}
                type="button"
                className={`type-btn ${form.type === t ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, type: t })}
              >
                <div className="type-btn-code">{t.slice(0, 2).toUpperCase()}</div>
                <div className="type-btn-name">{t}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Age (Years)</label>
          <input
            type="number"
            className="form-input"
            min="0"
            max="30"
            value={form.age || ''}
            onChange={e => setForm({ ...form, age: parseInt(e.target.value) || 0 })}
          />
        </div>

        <div className="form-group">
          <div className="flex gap-4 mb-4" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <label className="form-label" style={{ margin: 0 }}>Custom Fields</label>
            <button type="button" className="btn btn-sm btn-outline" onClick={() => setAttrs([...attrs, { key: '', value: '' }])}>
              + Add
            </button>
          </div>
          {attrs.map((attr, i) => (
            <div key={i} className="flex gap-2 mb-4">
              <input
                type="text"
                className="form-input"
                placeholder="Field"
                value={attr.key}
                onChange={e => { const u = [...attrs]; u[i].key = e.target.value; setAttrs(u); }}
                style={{ flex: 1 }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Value"
                value={attr.value}
                onChange={e => { const u = [...attrs]; u[i].value = e.target.value; setAttrs(u); }}
                style={{ flex: 1 }}
              />
              <button type="button" className="btn btn-sm btn-danger" onClick={() => setAttrs(attrs.filter((_, j) => j !== i))}>
                X
              </button>
            </div>
          ))}
        </div>

        <hr className="divider" />

        <div className="flex gap-3">
          <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => navigate(-1)}>
            Cancel
          </button>
          <button type="submit" className="btn btn-sage" style={{ flex: 2 }} disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Update' : 'Add Animal'}
          </button>
        </div>
      </form>
    </div>
  );
}
