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
  const [customAttributes, setCustomAttributes] = useState<{ key: string; value: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditing) {
      loadAnimal();
    }
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
        // Convert attributes object to array
        const attrs = Object.entries(animal.attributes || {}).map(([key, value]) => ({
          key,
          value: String(value),
        }));
        setCustomAttributes(attrs);
      }
    } catch (err) {
      console.error('Failed to load animal:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.name.trim()) {
      setError('Please enter animal name');
      return;
    }

    setSaving(true);
    try {
      // Convert custom attributes array to object
      const attributes: Record<string, string> = {};
      customAttributes.forEach(({ key, value }) => {
        if (key.trim()) {
          attributes[key.trim()] = value;
        }
      });

      const animalData: Omit<Animal, 'id'> = {
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
        await db.animals.update(Number(id), {
          ...animalData,
          updatedAt: new Date(),
        });
      } else {
        await db.animals.add(animalData);
      }

      navigate('/animals', { replace: true });
    } catch (err) {
      console.error('Failed to save animal:', err);
      setError('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const addCustomAttribute = () => {
    setCustomAttributes([...customAttributes, { key: '', value: '' }]);
  };

  const removeCustomAttribute = (index: number) => {
    setCustomAttributes(customAttributes.filter((_, i) => i !== index));
  };

  const updateCustomAttribute = (index: number, field: 'key' | 'value', value: string) => {
    const updated = [...customAttributes];
    updated[index][field] = value;
    setCustomAttributes(updated);
  };

  if (loading) {
    return (
      <div className="loader">
        <div className="spinner" />
      </div>
    );
  }

  return (
    <div>
      <div className="page-title">
        <h1>{isEditing ? 'Edit Animal' : 'Add Animal'}</h1>
        <p className="page-subtitle">
          {isEditing ? 'Update animal information' : 'Add a new animal to your farm'}
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        {/* Name */}
        <div className="form-group">
          <label className="form-label">Name *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. Ganga, Lakshmi"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            autoFocus
          />
        </div>

        {/* Tag Number */}
        <div className="form-group">
          <label className="form-label">Tag Number (Optional)</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g. A001, 1234"
            value={form.tagNumber}
            onChange={(e) => setForm({ ...form, tagNumber: e.target.value })}
          />
        </div>

        {/* Animal Type */}
        <div className="form-group">
          <label className="form-label">Type *</label>
          <div className="type-selector">
            {animalTypes.map((type) => (
              <button
                key={type}
                type="button"
                className={`type-option ${form.type === type ? 'selected' : ''}`}
                onClick={() => setForm({ ...form, type })}
              >
                <span className="type-option-icon">{type.slice(0, 2).toUpperCase()}</span>
                <span className="type-option-label">{type}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Age */}
        <div className="form-group">
          <label className="form-label">Age (Years)</label>
          <input
            type="number"
            className="form-input"
            placeholder="0"
            min="0"
            max="30"
            value={form.age || ''}
            onChange={(e) => setForm({ ...form, age: parseInt(e.target.value) || 0 })}
          />
        </div>

        {/* Custom Attributes */}
        <div className="form-group">
          <div className="section-header">
            <label className="form-label" style={{ marginBottom: 0 }}>Custom Details</label>
            <button type="button" className="btn btn-sm btn-outline" onClick={addCustomAttribute}>
              + Add
            </button>
          </div>
          {customAttributes.map((attr, index) => (
            <div key={index} className="flex gap-sm mb-md" style={{ marginTop: index === 0 ? '12px' : 0 }}>
              <input
                type="text"
                className="form-input"
                placeholder="Field name"
                value={attr.key}
                onChange={(e) => updateCustomAttribute(index, 'key', e.target.value)}
                style={{ flex: 1 }}
              />
              <input
                type="text"
                className="form-input"
                placeholder="Value"
                value={attr.value}
                onChange={(e) => updateCustomAttribute(index, 'value', e.target.value)}
                style={{ flex: 1 }}
              />
              <button
                type="button"
                className="btn btn-sm btn-danger"
                onClick={() => removeCustomAttribute(index)}
                style={{ padding: '8px 12px' }}
              >
                X
              </button>
            </div>
          ))}
          {customAttributes.length === 0 && (
            <p className="text-muted" style={{ fontSize: '0.875rem', marginTop: '8px' }}>
              Add custom fields like milk/day, breed, color, etc.
            </p>
          )}
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
            disabled={saving}
            style={{ flex: 2 }}
          >
            {saving ? 'Saving...' : isEditing ? 'Update Animal' : 'Add Animal'}
          </button>
        </div>
      </form>
    </div>
  );
}
