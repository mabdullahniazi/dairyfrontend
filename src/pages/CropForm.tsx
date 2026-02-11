import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';

export function CropForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    crop_name: '',
    crop_type: '',
    sowing_date: new Date().toISOString().split('T')[0],
    land_size_acres: '',
    expected_production: '',
    production_unit: 'kg',
    crop_status: 'planned',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (id) {
      api.getCrop(id).then((crop) => {
        setForm({
          crop_name: crop.crop_name || '',
          crop_type: crop.crop_type || '',
          sowing_date: crop.sowing_date ? new Date(crop.sowing_date).toISOString().split('T')[0] : '',
          land_size_acres: String(crop.land_size_acres || ''),
          expected_production: String(crop.expected_production || ''),
          production_unit: crop.production_unit || 'kg',
          crop_status: crop.crop_status || 'planned',
          notes: crop.notes || '',
        });
        setLoading(false);
      });
    }
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        land_size_acres: Number(form.land_size_acres),
        expected_production: Number(form.expected_production),
      };
      if (isEditing && id) {
        await api.updateCrop(id, payload);
      } else {
        await api.createCrop(payload);
      }
      navigate('/crops');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pt-6 max-w-3xl lg:mx-auto">
        <div className="glass-card rounded-2xl p-6 animate-pulse space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-12 bg-stone-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-white/60 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all";
  const labelClass = "block text-sm font-bold text-stone-600 mb-1.5";

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 animate-[fadeIn_0.3s_ease-out] max-w-3xl lg:mx-auto">
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5">
        <div>
          <label className={labelClass}>Crop Name *</label>
          <input type="text" required value={form.crop_name} onChange={(e) => setForm({ ...form, crop_name: e.target.value })} className={inputClass} placeholder="e.g. Wheat, Rice, Cotton" />
        </div>

        <div>
          <label className={labelClass}>Crop Type *</label>
          <input type="text" required value={form.crop_type} onChange={(e) => setForm({ ...form, crop_type: e.target.value })} className={inputClass} placeholder="e.g. Cereals, Cash Crop, Vegetables" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Sowing Date *</label>
            <input type="date" required value={form.sowing_date} onChange={(e) => setForm({ ...form, sowing_date: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Land Size (acres) *</label>
            <input type="number" required min="0" step="0.01" value={form.land_size_acres} onChange={(e) => setForm({ ...form, land_size_acres: e.target.value })} className={inputClass} />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Expected Production *</label>
            <input type="number" required min="0" step="0.01" value={form.expected_production} onChange={(e) => setForm({ ...form, expected_production: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Unit</label>
            <select value={form.production_unit} onChange={(e) => setForm({ ...form, production_unit: e.target.value })} className={inputClass}>
              <option value="kg">Kg</option>
              <option value="maund">Maund</option>
              <option value="ton">Ton</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Status</label>
          <select value={form.crop_status} onChange={(e) => setForm({ ...form, crop_status: e.target.value })} className={inputClass}>
            <option value="planned">Planned</option>
            <option value="active">Active</option>
            <option value="harvested">Harvested</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} rows={3} placeholder="Optional notes..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50">
            {saving ? 'Saving...' : isEditing ? 'Update Crop' : 'Add Crop'}
          </button>
        </div>
      </form>
    </div>
  );
}
