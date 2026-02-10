import { useCallback } from 'react';
import { db, type IReport } from '../lib/db';
import { saveReport, updateReport, deleteReportLocally } from '../lib/sync';
import { useLiveQuery } from 'dexie-react-hooks';

export function useReports(date?: string, animalId?: number) {
  const reports = useLiveQuery(
    async () => {
      let collection = db.reports.orderBy('date');
      const results = await collection.reverse().toArray();

      let filtered = results;
      if (date) {
        filtered = filtered.filter(r => r.date === date);
      }
      if (animalId) {
        filtered = filtered.filter(r => r.animalId === animalId);
      }

      // Attach animal info
      const withAnimal = await Promise.all(
        filtered.map(async (report) => {
          const animal = await db.animals.get(report.animalId);
          return { ...report, animal };
        })
      );
      return withAnimal;
    },
    [date, animalId]
  );

  const addReport = useCallback(async (data: Omit<IReport, 'id' | 'synced' | 'createdAt'>) => {
    return saveReport(data);
  }, []);

  const editReport = useCallback(async (id: number, data: Partial<IReport>) => {
    return updateReport(id, data);
  }, []);

  const removeReport = useCallback(async (id: number) => {
    return deleteReportLocally(id);
  }, []);

  return {
    reports: reports || [],
    addReport,
    editReport,
    removeReport,
    loading: reports === undefined,
  };
}

export function useTodayStats() {
  const today = new Date().toISOString().split('T')[0];

  const stats = useLiveQuery(async () => {
    const totalAnimals = await db.animals.count();
    const todayReports = await db.reports.where('date').equals(today).toArray();
    const totalMilk = todayReports.reduce((sum, r) => sum + (r.milk || 0), 0);
    const totalFeed = todayReports.reduce((sum, r) => sum + (r.feed || 0), 0);
    return {
      totalAnimals,
      todayReportCount: todayReports.length,
      totalMilk,
      totalFeed,
    };
  }, [today]);

  return stats || { totalAnimals: 0, todayReportCount: 0, totalMilk: 0, totalFeed: 0 };
}
