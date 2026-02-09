import { db, type Animal, type DailyReport } from '../db/database';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Check if online
export const isOnline = (): boolean => navigator.onLine;

// Sync all unsynced animals
export const syncAnimals = async (): Promise<{ synced: number; errors: string[] }> => {
  if (!isOnline()) {
    return { synced: 0, errors: ['Offline - cannot sync'] };
  }

  // Get animals where synced is false (boolean comparison)
  const allAnimals = await db.animals.toArray();
  const unsynced = allAnimals.filter(a => a.synced === false);
  
  console.log(`[Sync] Found ${unsynced.length} unsynced animals`);
  
  const errors: string[] = [];
  let synced = 0;

  for (const animal of unsynced) {
    try {
      console.log(`[Sync] Syncing animal: ${animal.name}`);
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
        console.log(`[Sync] ✅ Animal ${animal.name} synced successfully, serverId: ${data._id}`);
        synced++;
      } else {
        const errorData = await response.json();
        console.error(`[Sync] ❌ Failed to sync ${animal.name}:`, errorData);
        errors.push(`Failed to sync ${animal.name}: ${errorData.error}`);
      }
    } catch (err) {
      console.error(`[Sync] ❌ Network error syncing ${animal.name}:`, err);
      errors.push(`Network error syncing ${animal.name}`);
    }
  }

  console.log(`[Sync] Completed: ${synced} synced, ${errors.length} errors`);
  return { synced, errors };
};

// Sync all unsynced reports
export const syncReports = async (): Promise<{ synced: number; errors: string[] }> => {
  if (!isOnline()) {
    return { synced: 0, errors: ['Offline - cannot sync'] };
  }

  const allReports = await db.dailyReports.toArray();
  const unsynced = allReports.filter(r => r.synced === false);
  
  console.log(`[Sync] Found ${unsynced.length} unsynced reports`);
  
  const errors: string[] = [];
  let synced = 0;

  for (const report of unsynced) {
    try {
      // Get the animal's server ID
      const animal = await db.animals.get(report.animalId);
      if (!animal?.serverId) {
        console.log(`[Sync] Skipping report - animal ${report.animalId} not synced yet`);
        continue;
      }

      console.log(`[Sync] Syncing report for animal ${animal.name}`);
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
        const data = response.ok ? await response.json() : null;
        await db.dailyReports.update(report.id!, {
          serverId: data?._id,
          animalServerId: animal.serverId,
          synced: true,
        });
        console.log(`[Sync] ✅ Report synced successfully`);
        synced++;
      } else {
        const errorData = await response.json();
        console.error(`[Sync] ❌ Failed to sync report:`, errorData);
        errors.push(`Failed to sync report: ${errorData.error}`);
      }
    } catch (err) {
      console.error(`[Sync] ❌ Network error syncing report:`, err);
      errors.push(`Network error syncing report`);
    }
  }

  return { synced, errors };
};

// Full sync
export const syncAll = async (): Promise<{ animals: number; reports: number; errors: string[] }> => {
  console.log('[Sync] Starting full sync...');
  const animalsResult = await syncAnimals();
  const reportsResult = await syncReports();

  const result = {
    animals: animalsResult.synced,
    reports: reportsResult.synced,
    errors: [...animalsResult.errors, ...reportsResult.errors],
  };
  
  console.log('[Sync] Full sync complete:', result);
  return result;
};

// Animal CRUD helpers
export const createAnimal = async (data: Omit<Animal, 'id' | 'synced' | 'createdAt' | 'updatedAt'>): Promise<number> => {
  const id = await db.animals.add({
    ...data,
    synced: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
  
  console.log(`[DB] Created animal with local id: ${id}`);
  
  // Try to sync immediately if online
  if (isOnline()) {
    console.log('[Sync] Online - triggering immediate sync');
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
  
  console.log(`[DB] Created report with local id: ${id}`);
  
  if (isOnline()) {
    console.log('[Sync] Online - triggering immediate sync');
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

// Trigger sync on load if online
if (typeof window !== 'undefined') {
  window.addEventListener('load', () => {
    if (isOnline()) {
      console.log('[Sync] Page loaded while online - triggering sync');
      setTimeout(() => syncAll(), 1000);
    }
  });
  
  window.addEventListener('online', () => {
    console.log('[Sync] Came back online - triggering sync');
    syncAll();
  });
}
