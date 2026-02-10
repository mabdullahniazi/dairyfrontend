import { db, type IAnimal, type IReport } from './db';
import { api } from './api';

// Save animal locally (offline-first)
export async function saveAnimalLocally(data: Omit<IAnimal, 'id' | 'synced' | 'createdAt'>): Promise<number> {
  const id = await db.animals.add({
    ...data,
    synced: false,
    createdAt: new Date().toISOString(),
  });
  trySync();
  return id;
}

// Update animal locally
export async function updateAnimalLocally(id: number, data: Partial<IAnimal>): Promise<void> {
  await db.animals.update(id, { ...data, synced: false });
  trySync();
}

// Delete animal locally
export async function deleteAnimalLocally(id: number): Promise<void> {
  const animal = await db.animals.get(id);
  if (animal?.serverId) {
    try {
      await api.deleteAnimal(animal.serverId);
    } catch { /* offline — will be gone on next full sync */ }
  }
  await db.reports.where('animalId').equals(id).delete();
  await db.animals.delete(id);
}

// Save report locally (with one-per-day guard)
export async function saveReportLocally(data: Omit<IReport, 'id' | 'synced' | 'createdAt'>): Promise<number> {
  // Check for duplicate
  const existing = await db.reports
    .where('[animalId+date]')
    .equals([data.animalId, data.date])
    .first();
  if (existing) {
    throw new Error('A report already exists for this animal on this date');
  }

  const id = await db.reports.add({
    ...data,
    synced: false,
    createdAt: new Date().toISOString(),
  });
  trySync();
  return id;
}

// Update report locally
export async function updateReportLocally(id: number, data: Partial<IReport>): Promise<void> {
  await db.reports.update(id, { ...data, synced: false });
  trySync();
}

// Delete report locally
export async function deleteReportLocally(id: number): Promise<void> {
  const report = await db.reports.get(id);
  if (report?.serverId) {
    try {
      await api.deleteReport(report.serverId);
    } catch { /* offline */ }
  }
  await db.reports.delete(id);
}

// Full sync: push unsynced → pull all from server
export async function syncAll(): Promise<{ success: boolean; error?: string }> {
  if (!navigator.onLine) return { success: false, error: 'Offline' };

  try {
    // 1) Push unsynced animals
    const unsyncedAnimals = await db.animals.where('synced').equals(0).toArray();
    if (unsyncedAnimals.length > 0) {
      const payload = unsyncedAnimals.map(a => ({
        localId: a.id,
        name: a.name,
        tagNumber: a.tagNumber,
        type: a.type,
        age: a.age,
        attributes: a.attributes,
      }));
      const result = await api.syncAnimals(payload);
      for (const r of result.results) {
        if (r.serverId) {
          await db.animals.update(r.localId, { serverId: r.serverId, synced: true });
        }
      }
    }

    // 2) Push unsynced reports
    const unsyncedReports = await db.reports.where('synced').equals(0).toArray();
    if (unsyncedReports.length > 0) {
      const payload = [];
      for (const rep of unsyncedReports) {
        const animal = await db.animals.get(rep.animalId);
        if (animal?.serverId) {
          payload.push({
            localId: rep.id,
            animalId: animal.serverId,
            date: rep.date,
            milk: rep.milk,
            feed: rep.feed,
            notes: rep.notes,
          });
        }
      }
      if (payload.length > 0) {
        const result = await api.syncReports(payload);
        for (const r of result.results) {
          if (r.localId) {
            await db.reports.update(r.localId, {
              serverId: r.serverId || undefined,
              synced: true,
            });
          }
        }
      }
    }

    // 3) Pull animals from server
    const serverAnimals = await api.getAnimals();
    for (const sa of serverAnimals) {
      const existing = await db.animals.where('serverId').equals(sa._id).first();
      if (!existing) {
        await db.animals.add({
          serverId: sa._id,
          name: sa.name,
          tagNumber: sa.tagNumber || '',
          type: sa.type,
          age: sa.age || 0,
          attributes: sa.attributes || {},
          synced: true,
          createdAt: sa.createdAt,
        });
      } else {
        await db.animals.update(existing.id!, {
          name: sa.name,
          tagNumber: sa.tagNumber || '',
          type: sa.type,
          age: sa.age || 0,
          attributes: sa.attributes || {},
          synced: true,
        });
      }
    }

    // 4) Pull reports from server
    const serverReports = await api.getReports();
    for (const sr of serverReports) {
      const existingReport = await db.reports.where('serverId').equals(sr._id).first();
      const animal = await db.animals.where('serverId').equals(sr.animalId?._id || sr.animalId).first();
      if (!existingReport && animal) {
        const dateStr = new Date(sr.date).toISOString().split('T')[0];
        const dupCheck = await db.reports.where('[animalId+date]').equals([animal.id!, dateStr]).first();
        if (!dupCheck) {
          await db.reports.add({
            serverId: sr._id,
            animalId: animal.id!,
            serverAnimalId: sr.animalId?._id || sr.animalId,
            date: dateStr,
            milk: sr.milk || 0,
            feed: sr.feed || 0,
            notes: sr.notes || '',
            synced: true,
            createdAt: sr.createdAt,
          });
        }
      }
    }

    return { success: true };
  } catch (err: any) {
    console.error('Sync error:', err);
    return { success: false, error: err.message };
  }
}

// Non-blocking sync attempt
function trySync() {
  if (navigator.onLine) {
    syncAll().catch(console.error);
  }
}
