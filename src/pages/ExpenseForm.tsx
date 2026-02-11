import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useCrops } from '../hooks/useCrops';

export function ExpenseForm() {
  const navigate = useNavigate();
  const { cropId } = useParams();
  const { crops } = useCrops();

  const [form, setForm] = useState({
    crop_id: cropId || '',
    expense_date: new Date().toISOString().split('T')[0],
    seed_cost: '',
    fertilizer_cost: '',
    spray_cost: '',
    water_irrigation_cost: '',
    labor_cost: '',
    diesel_machinery_cost: '',
    other_cost: '',
    remarks: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cropId) setForm((f) => ({ ...f, crop_id: cropId }));
  }, [cropId]);

  const total =
    Number(form.seed_cost || 0) +
    Number(form.fertilizer_cost || 0) +
    Number(form.spray_cost || 0) +
    Number(form.water_irrigation_cost || 0) +
    Number(form.labor_cost || 0) +
    Number(form.diesel_machinery_cost || 0) +
    Number(form.other_cost || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        crop_id: form.crop_id,
        expense_date: form.expense_date,
        seed_cost: Number(form.seed_cost || 0),
        fertilizer_cost: Number(form.fertilizer_cost || 0),
        spray_cost: Number(form.spray_cost || 0),
        water_irrigation_cost: Number(form.water_irrigation_cost || 0),
        labor_cost: Number(form.labor_cost || 0),
        diesel_machinery_cost: Number(form.diesel_machinery_cost || 0),
        other_cost: Number(form.other_cost || 0),
        remarks: form.remarks,
      };
      await api.createExpense(payload);
      navigate(cropId ? `/crops/${cropId}` : '/crops');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white/60 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all";
  const labelClass = "block text-sm font-bold text-stone-600 mb-1.5";

  const costFields = [
    { key: 'seed_cost', label: '🌰 Seeds', icon: '' },
    { key: 'fertilizer_cost', label: '🧪 Fertilizer', icon: '' },
    { key: 'spray_cost', label: '💨 Spray', icon: '' },
    { key: 'water_irrigation_cost', label: '💧 Water/Irrigation', icon: '' },
    { key: 'labor_cost', label: '👷 Labor', icon: '' },
    { key: 'diesel_machinery_cost', label: '⛽ Diesel/Machinery', icon: '' },
    { key: 'other_cost', label: '📦 Other', icon: '' },
  ];

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 animate-[fadeIn_0.3s_ease-out] max-w-3xl lg:mx-auto">
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5">
        {/* Crop selector */}
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
          <label className={labelClass}>Expense Date *</label>
          <input type="date" required value={form.expense_date} onChange={(e) => setForm({ ...form, expense_date: e.target.value })} className={inputClass} />
        </div>

        {/* Cost breakdown */}
        <div>
          <label className={labelClass}>Cost Breakdown (₨)</label>
          <div className="grid grid-cols-2 gap-3">
            {costFields.map((field) => (
              <div key={field.key}>
                <label className="block text-xs text-stone-500 mb-1">{field.label}</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={(form as any)[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className={inputClass}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Live total */}
        <div className="bg-gradient-to-r from-red-50 to-red-100 rounded-xl p-4 text-center">
          <p className="text-xs text-red-500 font-medium">Total Expense</p>
          <p className="text-2xl font-extrabold text-red-700">₨{total.toLocaleString()}</p>
        </div>

        <div>
          <label className={labelClass}>Remarks</label>
          <textarea value={form.remarks} onChange={(e) => setForm({ ...form, remarks: e.target.value })} className={inputClass} rows={2} placeholder="Optional remarks..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 shadow-lg shadow-red-600/20 transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Save Expense'}
          </button>
        </div>
      </form>
    </div>
  );
}
