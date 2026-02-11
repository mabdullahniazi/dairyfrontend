import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { useCrops } from '../hooks/useCrops';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const COLORS = ['#059669', '#d97706', '#dc2626', '#2563eb', '#7c3aed', '#0891b2', '#64748b'];

export function CropReports() {
  const { crops } = useCrops();
  const [profitLoss, setProfitLoss] = useState<any[]>([]);
  const [monthlyExpenses, setMonthlyExpenses] = useState<any>(null);
  const [monthlyIncome, setMonthlyIncome] = useState<any>(null);
  const [selectedCrop, setSelectedCrop] = useState('');
  const [expenseBreakdown, setExpenseBreakdown] = useState<any>(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [pl, me, mi] = await Promise.all([
          api.getCropProfitLoss(),
          api.getMonthlyExpenses(year),
          api.getMonthlyIncome(year),
        ]);
        setProfitLoss(pl);
        setMonthlyExpenses(me);
        setMonthlyIncome(mi);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [year]);

  useEffect(() => {
    if (selectedCrop) {
      api.getExpenseBreakdown(selectedCrop).then(setExpenseBreakdown).catch(console.error);
    } else {
      setExpenseBreakdown(null);
    }
  }, [selectedCrop]);

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-8 pt-6 max-w-3xl lg:mx-auto">
        <div className="glass-card rounded-2xl p-6 animate-pulse space-y-6">
          <div className="h-8 bg-stone-200 rounded w-1/3" />
          <div className="h-48 bg-stone-100 rounded-xl" />
          <div className="h-48 bg-stone-100 rounded-xl" />
        </div>
      </div>
    );
  }

  // Build line chart data: merge monthly expenses and income
  const lineData = monthlyExpenses?.months?.map((m: any, i: number) => ({
    name: m.monthName,
    expenses: m.totalExpense,
    income: monthlyIncome?.months?.[i]?.totalIncome || 0,
  })) || [];

  // Build bar chart data for per-crop income comparison
  const barData = profitLoss.map((c) => ({
    name: c.crop_name.length > 10 ? c.crop_name.slice(0, 10) + '…' : c.crop_name,
    income: c.totalIncome,
    expenses: c.totalExpenses,
    profit: c.profitOrLoss,
  }));

  return (
    <div className="px-4 sm:px-6 lg:px-8 pt-6 animate-[fadeIn_0.3s_ease-out] max-w-3xl lg:mx-auto space-y-4 pb-6">
      {/* Year selector */}
      <div className="glass-card rounded-2xl p-4 flex items-center justify-between">
        <h2 className="font-bold text-stone-700">📊 Analytics</h2>
        <select
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
          className="bg-white/60 border border-stone-200 rounded-xl px-3 py-2 text-sm font-bold text-stone-700 focus:outline-none"
        >
          {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {/* Profit/Loss per Crop */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-bold text-stone-700 mb-3">💰 Profit / Loss per Crop</h3>
        {profitLoss.length === 0 ? (
          <p className="text-sm text-stone-400 text-center py-6">No crop data available yet.</p>
        ) : (
          <div className="space-y-2">
            {profitLoss.map((c) => (
              <div key={c.crop_id} className="flex items-center justify-between bg-stone-50 rounded-xl p-3">
                <div>
                  <p className="font-semibold text-stone-700 text-sm">{c.crop_name}</p>
                  <p className="text-xs text-stone-400">Exp: ₨{c.totalExpenses.toLocaleString()} · Inc: ₨{c.totalIncome.toLocaleString()}</p>
                </div>
                <span className={`font-extrabold text-sm ${c.profitOrLoss >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                  {c.profitOrLoss >= 0 ? '+' : ''}₨{c.profitOrLoss.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Line Chart: Expenses Over Time */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-bold text-stone-700 mb-3">📈 Monthly Expenses & Income</h3>
        {lineData.some((d: any) => d.expenses > 0 || d.income > 0) ? (
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#78716c' }} />
              <YAxis tick={{ fontSize: 11, fill: '#78716c' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '12px' }}
                formatter={(value: any) => `₨${Number(value).toLocaleString()}`}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Line type="monotone" dataKey="expenses" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} name="Expenses" />
              <Line type="monotone" dataKey="income" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} name="Income" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-stone-400 text-center py-6">No data for {year}</p>
        )}
      </div>

      {/* Bar Chart: Income Comparison */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-bold text-stone-700 mb-3">📊 Income vs Expenses by Crop</h3>
        {barData.length > 0 ? (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#78716c' }} />
              <YAxis tick={{ fontSize: 11, fill: '#78716c' }} />
              <Tooltip
                contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '12px' }}
                formatter={(value: any) => `₨${Number(value).toLocaleString()}`}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="expenses" fill="#dc2626" radius={[4, 4, 0, 0]} name="Expenses" />
              <Bar dataKey="income" fill="#059669" radius={[4, 4, 0, 0]} name="Income" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-stone-400 text-center py-6">No crop data yet</p>
        )}
      </div>

      {/* Pie Chart: Expense Breakdown */}
      <div className="glass-card rounded-2xl p-5">
        <h3 className="font-bold text-stone-700 mb-3">🥧 Expense Breakdown</h3>
        <select
          value={selectedCrop}
          onChange={(e) => setSelectedCrop(e.target.value)}
          className="w-full bg-white/60 border border-stone-200 rounded-xl px-4 py-3 text-stone-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/40 mb-3"
        >
          <option value="">Select a crop</option>
          {crops.map((c) => (
            <option key={c._id} value={c._id}>{c.crop_name}</option>
          ))}
        </select>

        {selectedCrop && expenseBreakdown?.chartData?.length > 0 ? (
          <div className="flex flex-col items-center">
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={expenseBreakdown.chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }: any) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {expenseBreakdown.chartData.map((_: any, index: number) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '12px', border: '1px solid #e7e5e4', fontSize: '12px' }}
                  formatter={(value: any) => `₨${Number(value).toLocaleString()}`}
                />
              </PieChart>
            </ResponsiveContainer>
            <p className="text-sm font-bold text-stone-600 mt-2">
              Total: ₨{expenseBreakdown.total.toLocaleString()}
            </p>
          </div>
        ) : selectedCrop ? (
          <p className="text-sm text-stone-400 text-center py-6">No expenses for this crop</p>
        ) : (
          <p className="text-sm text-stone-400 text-center py-6">Select a crop to view breakdown</p>
        )}
      </div>
    </div>
  );
}
