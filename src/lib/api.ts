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
};
