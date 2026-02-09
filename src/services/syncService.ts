import { db, type Animal, type DailyReport } from '../db/database';

const API_URL = 'http://localhost:5000/api';

// Check if online
export const isOnline = (): boolean => navigator.onLine;

// Sync all unsynced animals
export const syncAnimals = async (): Promise<{ synced: number; errors: string[] }> => {
  if (!isOnline()) {
    return { synced: 0, errors: ['Offline - cannot sync'] };
  }

  const unsynced = await db.animals.where('synced').equals(0).toArray();
  const errors: string[] = [];
  let synced = 0;

  for (const animal of unsynced) {
    try {
      const response = await fetch(`${API_URL}/animals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: animal.name,
          tagNumber: animal.tagNumber,
          type: animal.type,
          age: animal.age,
          attributes: animal.attributes,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        await db.animals.update(animal.id!, {
          serverId: data._id,
          synced: true,
        });
        synced++;
      } else {
        const errorData = await response.json();
        errors.push(`Failed to sync ${animal.name}: ${errorData.error}`);
      }
    } catch (err) {
      errors.push(`Network error syncing ${animal.name}`);
    }
  }

  return { synced, errors };
};

// Sync all unsynced reports
export const syncReports = async (): Promise<{ synced: number; errors: string[] }> => {
  if (!isOnline()) {
    return { synced: 0, errors: ['Offline - cannot sync'] };
  }

  const unsynced = await db.dailyReports.where('synced').equals(0).toArray();
  const errors: string[] = [];
  let synced = 0;

  for (const report of unsynced) {
    try {
      // Get the animal's server ID
      const animal = await db.animals.get(report.animalId);
      if (!animal?.serverId) {
        // Animal not synced yet, skip this report
        continue;
      }

      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          animalId: animal.serverId,
          date: report.date,
          milk: report.milk,
          feed: report.feed,
          notes: report.notes,
        }),
      });

      if (response.ok || response.status === 409) {
        // 409 = duplicate, which means it's already synced
        const data = response.ok ? await response.json() : null;
        await db.dailyReports.update(report.id!, {
          serverId: data?._id,
          animalServerId: animal.serverId,
          synced: true,
        });
        synced++;
      } else {
        const errorData = await response.json();
        errors.push(`Failed to sync report: ${errorData.error}`);
      }
    } catch (err) {
      errors.push(`Network error syncing report`);
    }
  }

  return { synced, errors };
};

// Full sync
export const syncAll = async (): Promise<{ animals: number; reports: number; errors: string[] }> => {
  const animalsResult = await syncAnimals();
  const reportsResult = await syncReports();

  return {
    animals: animalsResult.synced,
    reports: reportsResult.synced,
    errors: [...animalsResult.errors, ...reportsResult.errors],
  };
};

// Animal CRUD helpers
export const createAnimal = async (data: Omit<Animal, 'id' | 'synced' | 'createdAt' | 'updatedAt'>): Promise<number> => {
  const id = await db.animals.add({
    ...data,
    synced: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  // Try to sync immediately if online
  if (isOnline()) {
    syncAnimals().catch(console.error);
  }
  
  return id as number;
};

export const updateAnimal = async (id: number, data: Partial<Animal>): Promise<void> => {
  await db.animals.update(id, {
    ...data,
    synced: false,
    updatedAt: new Date(),
  });
  
  if (isOnline()) {
    syncAnimals().catch(console.error);
  }
};

export const deleteAnimal = async (id: number): Promise<void> => {
  await db.dailyReports.where('animalId').equals(id).delete();
  await db.animals.delete(id);
};

// Report CRUD helpers
export const createReport = async (data: Omit<DailyReport, 'id' | 'synced' | 'createdAt'>): Promise<number> => {
  const id = await db.dailyReports.add({
    ...data,
    synced: false,
    createdAt: new Date(),
  });
  
  if (isOnline()) {
    syncReports().catch(console.error);
  }
  
  return id as number;
};

export const getTodayStats = async (): Promise<{ totalMilk: number; reportCount: number }> => {
  const today = new Date().toISOString().split('T')[0];
  const reports = await db.dailyReports.where('date').equals(today).toArray();
  
  return {
    totalMilk: reports.reduce((sum, r) => sum + (r.milk || 0), 0),
    reportCount: reports.length,
  };
};
