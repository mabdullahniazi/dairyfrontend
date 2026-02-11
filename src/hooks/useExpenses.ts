import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useExpenses(cropId?: string) {
  const [expenses, setExpenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      const data = cropId
        ? await api.getExpensesByCrop(cropId)
        : await api.getExpenses();
      setExpenses(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cropId]);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const totalExpenses = expenses.reduce((sum, e) => sum + (e.total_expense || 0), 0);

  return { expenses, loading, error, totalExpenses, refetch: fetchExpenses };
}
