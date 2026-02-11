import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../lib/api';
import { useExpenses } from '../hooks/useExpenses';
import { useIncome } from '../hooks/useIncome';
import { useReminders } from '../hooks/useReminders';

export function CropDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [crop, setCrop] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  const { expenses, totalExpenses } = useExpenses(id);
  const { incomeRecords, summary } = useIncome(id);
  const { reminders } = useReminders(id);

  useEffect(() => {
    if (id) {
      api.getCrop(id).then((data) => {
        setCrop(data);
        setLoading(false);
      }).catch(() => setLoading(false));
    }
  }, [id]);

  const handleDelete = async () => {
    if (!confirm('Delete this crop and all its records?')) return;
    setDeleting(true);
    try {
      await api.deleteCrop(id!);
      navigate('/crops');
    } catch (err: any) {
      alert(err.message);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pt-6 max-w-3xl lg:mx-auto">
        <div className="glass-card rounded-2xl p-6 animate-pulse space-y-4">
          <div className="h-8 bg-stone-200 rounded w-1/2" />
          <div className="h-4 bg-stone-100 rounded w-1/3" />
          <div className="h-20 bg-stone-100 rounded" />
        </div>
      </div>
    );
  }

  if (!crop) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pt-6 max-w-3xl lg:mx-auto">
        <div className="glass-card rounded-2xl p-6 text-center text-stone-500">Crop not found</div>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    planned: 'bg-blue-100 text-blue-700',
    active: 'bg-emerald-100 text-emerald-700',
    harvested: 'bg-amber-100 text-amber-700',
  };

  const totalIncome = summary?.totalIncome || incomeRecords.reduce((s: number, r: any) => s + (r.total_income || 0), 0);
  const profitLoss = totalIncome - totalExpenses;

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 animate-[fadeIn_0.3s_ease-out] max-w-3xl lg:mx-auto space-y-4 pb-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h2 className="text-xl font-extrabold text-stone-800">{crop.crop_name}</h2>
            <p className="text-sm text-stone-500">{crop.crop_type}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[crop.crop_status] || ''}`}>
            {crop.crop_status}
          </span>
        </div>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="bg-stone-50 rounded-xl p-3">
            <p className="text-stone-400 text-xs font-medium">Sowing Date</p>
            <p className="font-bold text-stone-700">{new Date(crop.sowing_date).toLocaleDateString()}</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-3">
            <p className="text-stone-400 text-xs font-medium">Land Size</p>
            <p className="font-bold text-stone-700">{crop.land_size_acres} acres</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-3">
            <p className="text-stone-400 text-xs font-medium">Expected Production</p>
            <p className="font-bold text-stone-700">{crop.expected_production} {crop.production_unit}</p>
          </div>
          <div className="bg-stone-50 rounded-xl p-3">
            <p className="text-stone-400 text-xs font-medium">Notes</p>
            <p className="font-bold text-stone-700">{crop.notes || '—'}</p>
          </div>
        </div>
      </div>

      {/* P&L Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-xs text-stone-400 font-medium">Expenses</p>
          <p className="text-lg font-extrabold text-red-600">₨{totalExpenses.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-xs text-stone-400 font-medium">Income</p>
          <p className="text-lg font-extrabold text-emerald-600">₨{totalIncome.toLocaleString()}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-xs text-stone-400 font-medium">Profit/Loss</p>
          <p className={`text-lg font-extrabold ${profitLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
            {profitLoss >= 0 ? '+' : ''}₨{profitLoss.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 gap-2">
        <button onClick={() => navigate(`/expenses/add/${id}`)} className="glass-card rounded-xl p-3 text-center hover:bg-white/95 transition-colors active:scale-[0.97]">
          <span className="text-lg">💰</span>
          <p className="text-xs font-bold text-stone-600 mt-1">Add Expense</p>
        </button>
        <button onClick={() => navigate(`/income/add/${id}`)} className="glass-card rounded-xl p-3 text-center hover:bg-white/95 transition-colors active:scale-[0.97]">
          <span className="text-lg">📈</span>
          <p className="text-xs font-bold text-stone-600 mt-1">Add Income</p>
        </button>
        <button onClick={() => navigate(`/reminders/add?crop=${id}`)} className="glass-card rounded-xl p-3 text-center hover:bg-white/95 transition-colors active:scale-[0.97]">
          <span className="text-lg">⏰</span>
          <p className="text-xs font-bold text-stone-600 mt-1">Add Reminder</p>
        </button>
      </div>

      {/* Expenses List */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-bold text-stone-700 mb-3 flex items-center gap-2">
          <span>💰</span> Expenses ({expenses.length})
        </h3>
        {expenses.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-3">No expenses recorded</p>
        ) : (
          <div className="space-y-2">
            {expenses.slice(0, 5).map((exp: any) => (
              <div key={exp._id} className="flex items-center justify-between bg-stone-50 rounded-xl p-3">
                <div>
                  <p className="text-sm font-semibold text-stone-700">{new Date(exp.expense_date).toLocaleDateString()}</p>
                  <p className="text-xs text-stone-400">{exp.remarks || 'Expense'}</p>
                </div>
                <p className="font-bold text-red-600">₨{(exp.total_expense || 0).toLocaleString()}</p>
              </div>
            ))}
            {expenses.length > 5 && (
              <p className="text-xs text-center text-stone-400 pt-1">+ {expenses.length - 5} more</p>
            )}
          </div>
        )}
      </div>

      {/* Income List */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-bold text-stone-700 mb-3 flex items-center gap-2">
          <span>📈</span> Income ({incomeRecords.length})
        </h3>
        {incomeRecords.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-3">No income recorded</p>
        ) : (
          <div className="space-y-2">
            {incomeRecords.slice(0, 5).map((inc: any) => (
              <div key={inc._id} className="flex items-center justify-between bg-stone-50 rounded-xl p-3">
                <div>
                  <p className="text-sm font-semibold text-stone-700">{new Date(inc.harvest_date).toLocaleDateString()}</p>
                  <p className="text-xs text-stone-400">{inc.total_production} {inc.production_unit} × ₨{inc.rate_per_unit}</p>
                </div>
                <p className="font-bold text-emerald-600">₨{(inc.total_income || 0).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Reminders */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-bold text-stone-700 mb-3 flex items-center gap-2">
          <span>⏰</span> Reminders ({reminders.length})
        </h3>
        {reminders.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-3">No reminders set</p>
        ) : (
          <div className="space-y-2">
            {reminders.slice(0, 5).map((rem: any) => (
              <div key={rem._id} className={`flex items-center justify-between bg-stone-50 rounded-xl p-3 ${rem.is_done ? 'opacity-50' : ''}`}>
                <div>
                  <p className="text-sm font-semibold text-stone-700 capitalize">{rem.reminder_type}</p>
                  <p className="text-xs text-stone-400">{new Date(rem.scheduled_date).toLocaleDateString()}</p>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${rem.is_done ? 'bg-stone-200 text-stone-500' : 'bg-amber-100 text-amber-700'}`}>
                  {rem.is_done ? 'Done' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button onClick={() => navigate(`/crops/edit/${id}`)} className="flex-1 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-blue-700 shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98]">
          ✏️ Edit Crop
        </button>
        <button onClick={handleDelete} disabled={deleting} className="py-3 px-6 rounded-xl font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors disabled:opacity-50">
          {deleting ? '...' : '🗑️'}
        </button>
      </div>
    </div>
  );
}
