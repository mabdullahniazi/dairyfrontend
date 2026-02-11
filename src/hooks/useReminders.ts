import { useState, useEffect, useCallback } from 'react';
import { api } from '../lib/api';

export function useReminders(cropId?: string) {
  const [reminders, setReminders] = useState<any[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [overdue, setOverdue] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      const [all, up, over] = await Promise.all([
        api.getReminders(cropId ? { crop_id: cropId } : undefined),
        api.getUpcomingReminders(),
        api.getOverdueReminders(),
      ]);
      setReminders(all);
      setUpcoming(up);
      setOverdue(over);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [cropId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return { reminders, upcoming, overdue, loading, error, refetch: fetchAll };
}
