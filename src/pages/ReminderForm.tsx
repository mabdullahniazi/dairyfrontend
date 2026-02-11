import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useCrops } from '../hooks/useCrops';

export function ReminderForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const cropFromUrl = searchParams.get('crop') || '';
  const { crops } = useCrops();

  const [form, setForm] = useState({
    crop_id: cropFromUrl,
    reminder_type: 'irrigation',
    scheduled_date: new Date().toISOString().split('T')[0],
    repeat: false,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (cropFromUrl) setForm((f) => ({ ...f, crop_id: cropFromUrl }));
  }, [cropFromUrl]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createReminder(form);
      navigate('/reminders');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const inputClass = "w-full bg-white/60 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 transition-all";
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
          <label className={labelClass}>Reminder Type *</label>
          <select required value={form.reminder_type} onChange={(e) => setForm({ ...form, reminder_type: e.target.value })} className={inputClass}>
            <option value="spraying">💨 Spraying</option>
            <option value="irrigation">💧 Irrigation</option>
            <option value="fertilizer">🧪 Fertilizer</option>
            <option value="harvesting">🌾 Harvesting</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Scheduled Date *</label>
          <input type="date" required value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} className={inputClass} />
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input type="checkbox" checked={form.repeat} onChange={(e) => setForm({ ...form, repeat: e.target.checked })} className="w-5 h-5 rounded border-stone-300 text-amber-600 focus:ring-amber-500" />
            <span className="text-sm font-bold text-stone-600">Repeat</span>
          </label>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} rows={2} placeholder="Optional notes..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 shadow-lg shadow-amber-600/20 transition-all disabled:opacity-50">
            {saving ? 'Saving...' : 'Add Reminder'}
          </button>
        </div>
      </form>
    </div>
  );
}
