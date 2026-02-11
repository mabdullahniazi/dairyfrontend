import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useCrops(statusFilter?: string) {
  const [crops, setCrops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCrops = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getCrops(statusFilter);
      setCrops(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchCrops();
  }, [fetchCrops]);

  return { crops, loading, error, refetch: fetchCrops };
}
