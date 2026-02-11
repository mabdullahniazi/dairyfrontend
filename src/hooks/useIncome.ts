import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useIncome(cropId?: string) {
  const [incomeRecords, setIncomeRecords] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchIncome = useCallback(async () => {
    try {
      setLoading(true);
      if (cropId) {
        const data = await api.getIncomeByCrop(cropId);
        setIncomeRecords(data.records || []);
        setSummary(data.summary || null);
      } else {
        const data = await api.getIncomeRecords();
        setIncomeRecords(data);
        setSummary(null);
      }
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cropId]);

  useEffect(() => {
    fetchIncome();
  }, [fetchIncome]);

  return { incomeRecords, summary, loading, error, refetch: fetchIncome };
}
