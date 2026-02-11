const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json();
}

// Animals
export const api = {
  // Animals
  getAnimals: (type?: string) =>
    request<any[]>(type ? `/animals?type=${type}` : '/animals'),
  getAnimal: (id: string) => request<any>(`/animals/${id}`),
  createAnimal: (data: any) =>
    request<any>('/animals', { method: 'POST', body: JSON.stringify(data) }),
  updateAnimal: (id: string, data: any) =>
    request<any>(`/animals/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAnimal: (id: string) =>
    request<any>(`/animals/${id}`, { method: 'DELETE' }),
  syncAnimals: (animals: any[]) =>
    request<any>('/animals/sync', { method: 'POST', body: JSON.stringify({ animals }) }),

  // Reports
  getReports: (params?: { date?: string; animalId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.date) searchParams.set('date', params.date);
    if (params?.animalId) searchParams.set('animalId', params.animalId);
    const qs = searchParams.toString();
    return request<any[]>(`/reports${qs ? `?${qs}` : ''}`);
  },
  getTodayReports: () => request<any>('/reports/today'),
  getMonthlyStats: (month: string) => request<any>(`/reports/monthly?month=${month}`),
  createReport: (data: any) =>
    request<any>('/reports', { method: 'POST', body: JSON.stringify(data) }),
  updateReport: (id: string, data: any) =>
    request<any>(`/reports/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteReport: (id: string) =>
    request<any>(`/reports/${id}`, { method: 'DELETE' }),
  syncReports: (reports: any[]) =>
    request<any>('/reports/sync', { method: 'POST', body: JSON.stringify({ reports }) }),

  // Push
  getVapidKey: () => request<{ publicKey: string }>('/push/vapid-key'),
  subscribePush: (subscription: PushSubscriptionJSON) =>
    request<any>('/push/subscribe', { method: 'POST', body: JSON.stringify(subscription) }),
  unsubscribePush: (endpoint: string) =>
    request<any>('/push/unsubscribe', { method: 'POST', body: JSON.stringify({ endpoint }) }),
  sendTestNotification: () =>
    request<any>('/push/send-test', { method: 'POST' }),

  // ─── Crops ───
  getCrops: (status?: string) =>
    request<any[]>(status ? `/crops?status=${status}` : '/crops'),
  getCrop: (id: string) => request<any>(`/crops/${id}`),
  createCrop: (data: any) =>
    request<any>('/crops', { method: 'POST', body: JSON.stringify(data) }),
  updateCrop: (id: string, data: any) =>
    request<any>(`/crops/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCrop: (id: string) =>
    request<any>(`/crops/${id}`, { method: 'DELETE' }),

  // ─── Expenses ───
  getExpenses: (cropId?: string) =>
    request<any[]>(cropId ? `/expenses?crop_id=${cropId}` : '/expenses'),
  getExpensesByCrop: (cropId: string) =>
    request<any[]>(`/expenses/crop/${cropId}`),
  getExpense: (id: string) => request<any>(`/expenses/${id}`),
  createExpense: (data: any) =>
    request<any>('/expenses', { method: 'POST', body: JSON.stringify(data) }),
  updateExpense: (id: string, data: any) =>
    request<any>(`/expenses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteExpense: (id: string) =>
    request<any>(`/expenses/${id}`, { method: 'DELETE' }),

  // ─── Income ───
  getIncomeRecords: (cropId?: string) =>
    request<any[]>(cropId ? `/income?crop_id=${cropId}` : '/income'),
  getIncomeByCrop: (cropId: string) =>
    request<any>(`/income/crop/${cropId}`),
  getIncomeRecord: (id: string) => request<any>(`/income/${id}`),
  createIncome: (data: any) =>
    request<any>('/income', { method: 'POST', body: JSON.stringify(data) }),
  updateIncome: (id: string, data: any) =>
    request<any>(`/income/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteIncome: (id: string) =>
    request<any>(`/income/${id}`, { method: 'DELETE' }),

  // ─── Land Plots ───
  getLandPlots: () => request<any[]>('/land'),
  getLandPlot: (id: string) => request<any>(`/land/${id}`),
  createLandPlot: (data: any) =>
    request<any>('/land', { method: 'POST', body: JSON.stringify(data) }),
  updateLandPlot: (id: string, data: any) =>
    request<any>(`/land/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteLandPlot: (id: string) =>
    request<any>(`/land/${id}`, { method: 'DELETE' }),

  // ─── Reminders ───
  getReminders: (params?: { crop_id?: string; is_done?: string }) => {
    const sp = new URLSearchParams();
    if (params?.crop_id) sp.set('crop_id', params.crop_id);
    if (params?.is_done !== undefined) sp.set('is_done', params.is_done);
    const qs = sp.toString();
    return request<any[]>(`/reminders${qs ? `?${qs}` : ''}`);
  },
  getUpcomingReminders: () => request<any[]>('/reminders/upcoming'),
  getOverdueReminders: () => request<any[]>('/reminders/overdue'),
  getReminder: (id: string) => request<any>(`/reminders/${id}`),
  createReminder: (data: any) =>
    request<any>('/reminders', { method: 'POST', body: JSON.stringify(data) }),
  updateReminder: (id: string, data: any) =>
    request<any>(`/reminders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  markReminderDone: (id: string) =>
    request<any>(`/reminders/${id}/done`, { method: 'PUT' }),
  deleteReminder: (id: string) =>
    request<any>(`/reminders/${id}`, { method: 'DELETE' }),

  // ─── Crop Reports / Analytics ───
  getCropProfitLoss: () => request<any[]>('/crop-reports/profit-loss'),
  getMonthlyExpenses: (year?: number) =>
    request<any>(`/crop-reports/monthly-expenses${year ? `?year=${year}` : ''}`),
  getMonthlyIncome: (year?: number) =>
    request<any>(`/crop-reports/monthly-income${year ? `?year=${year}` : ''}`),
  getExpenseBreakdown: (cropId: string) =>
    request<any>(`/crop-reports/expense-breakdown/${cropId}`),
};
