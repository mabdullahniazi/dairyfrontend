import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../lib/api';
import { useCrops } from '../hooks/useCrops';

export function LandPlotForm() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);
  const { crops } = useCrops();

  const [form, setForm] = useState({
    plot_name: '',
    plot_area_acres: '',
    soil_type: '',
    current_crop_id: '',
    notes: '',
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);

  useEffect(() => {
    if (id) {
      api.getLandPlot(id).then((plot) => {
        setForm({
          plot_name: plot.plot_name || '',
          plot_area_acres: String(plot.plot_area_acres || ''),
          soil_type: plot.soil_type || '',
          current_crop_id: plot.current_crop_id?._id || plot.current_crop_id || '',
          notes: plot.notes || '',
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
        plot_area_acres: Number(form.plot_area_acres),
        current_crop_id: form.current_crop_id || null,
      };
      if (isEditing && id) {
        await api.updateLandPlot(id, payload);
      } else {
        await api.createLandPlot(payload);
      }
      navigate('/land');
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
          {[1, 2, 3].map((i) => <div key={i} className="h-12 bg-stone-200 rounded-xl" />)}
        </div>
      </div>
    );
  }

  const inputClass = "w-full bg-white/60 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-teal-500/40 focus:border-teal-500 transition-all";
  const labelClass = "block text-sm font-bold text-stone-600 mb-1.5";

  // Only show active crops that are available for assignment
  const activeCrops = crops.filter((c) => c.crop_status === 'active' || c.crop_status === 'planned');

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 animate-[fadeIn_0.3s_ease-out] max-w-3xl lg:mx-auto">
      <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 space-y-5">
        <div>
          <label className={labelClass}>Plot Name *</label>
          <input type="text" required value={form.plot_name} onChange={(e) => setForm({ ...form, plot_name: e.target.value })} className={inputClass} placeholder="e.g. North Field, Plot A" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Area (acres) *</label>
            <input type="number" required min="0" step="0.01" value={form.plot_area_acres} onChange={(e) => setForm({ ...form, plot_area_acres: e.target.value })} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Soil Type</label>
            <input type="text" value={form.soil_type} onChange={(e) => setForm({ ...form, soil_type: e.target.value })} className={inputClass} placeholder="e.g. Clay, Sandy" />
          </div>
        </div>

        <div>
          <label className={labelClass}>Assign Crop</label>
          <select value={form.current_crop_id} onChange={(e) => setForm({ ...form, current_crop_id: e.target.value })} className={inputClass}>
            <option value="">No crop assigned</option>
            {activeCrops.map((c) => (
              <option key={c._id} value={c._id}>{c.crop_name} ({c.crop_status})</option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputClass} rows={2} placeholder="Optional notes..." />
        </div>

        <div className="flex gap-3 pt-2">
          <button type="button" onClick={() => navigate(-1)} className="flex-1 py-3 rounded-xl font-bold text-stone-600 bg-stone-100 hover:bg-stone-200 transition-colors">
            Cancel
          </button>
          <button type="submit" disabled={saving} className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 shadow-lg shadow-teal-600/20 transition-all disabled:opacity-50">
            {saving ? 'Saving...' : isEditing ? 'Update Plot' : 'Add Plot'}
          </button>
        </div>
      </form>
    </div>
  );
}
