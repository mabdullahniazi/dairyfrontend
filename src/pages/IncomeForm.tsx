import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useCrops } from '../hooks/useCrops';

export function IncomeForm() {
  const navigate = useNavigate();
  const { cropId } = useParams();
  const { crops } = useCrops();

  const [form, setForm] = useState({
    crop_id: cropId || '',
    harvest_date: new Date().toISOString().split('T')[0],
    total_production: '',
    production_unit: 'kg',
    rate_per_unit: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cropId) setForm((f) => ({ ...f, crop_id: cropId }));
  }, [cropId]);

  const totalIncome = Number(form.total_production || 0) * Number(form.rate_per_unit || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        crop_id: form.crop_id,
        harvest_date: form.harvest_date,
        total_production: Number(form.total_production),
        production_unit: form.production_unit,
        rate_per_unit: Number(form.rate_per_unit),
        notes: form.notes,
      };
      await api.createIncome(payload);
      navigate(cropId ? `/crops/${cropId}` : '/crops');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white/60 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all";
  const labelClass = "block text-sm font-bold text-stone-600 mb-1.5";

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 animate-[fadeIn_0.3s_ease-out] max-w-3xl lg:mx-auto">
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5">
        <div>
          <label className={labelClass}>Crop *</label>
          <select required value={form.crop_id} onChange={(e) => setForm({ ...form, crop_id: e.target.value })} className={inputClass}>
            <option value="">Select Crop</option>
            {crops.map((c) => (
              <option key={c._id} value={c._id}>{c.crop_name} ({c.crop_type})</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Harvest Date *</label>
          <input type="date" required value={form.harvest_date} onChange={(e) => setForm({ ...form, harvest_date: e.target.value })} className={inputClass} />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Total Production *</label>
            <input type="number" required min="0" step="0.01" value={form.total_production} onChange={(e) => setForm({ ...form, total_production: e.target.value })} className={inputClass} placeholder="e.g. 500" />
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
          <label className={labelClass}>Rate per {form.production_unit} (₨) *</label>
          <input type="number" required min="0" step="0.01" value={form.rate_per_unit} onChange={(e) => setForm({ ...form, rate_per_unit: e.target.value })} className={inputClass} placeholder="e.g. 100" />
        </div>

        {/* Live total */}
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-xl p-4 text-center">
          <p className="text-xs text-emerald-500 font-medium">Total Income</p>
          <p className="text-2xl font-extrabold text-emerald-700">₨{totalIncome.toLocaleString()}</p>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} rows={2} placeholder="Optional notes..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Income'}
          </button>
        </div>
      </form>
    </div>
  );
}
