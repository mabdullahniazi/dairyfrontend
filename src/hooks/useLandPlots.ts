import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useLandPlots() {
  const [plots, setPlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPlots = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getLandPlots();
      setPlots(data);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPlots();
  }, [fetchPlots]);

  const totalArea = plots.reduce((sum, p) => sum + (p.plot_area_acres || 0), 0);

  return { plots, loading, error, totalArea, refetch: fetchPlots };
}
