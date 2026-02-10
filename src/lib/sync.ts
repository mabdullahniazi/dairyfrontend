import { db, type IAnimal, type IReport } from './db';
import { api } from './api';

// ─── Animals ─────────────────────────────────────────────────────

// Save animal: try API first, fall back to local-only
export async function saveAnimal(data: Omit<IAnimal, 'id' | 'synced' | 'createdAt'>): Promise<number> {
  const now = new Date().toISOString();

  if (navigator.onLine) {
    try {
      const serverAnimal = await api.createAnimal({
        name: data.name,
        tagNumber: data.tagNumber,
        type: data.type,
        age: data.age,
        attributes: data.attributes,
      });
      // API success → save locally with synced: true
      const id = await db.animals.add({
        ...data,
        serverId: serverAnimal._id,
        synced: true,
        createdAt: now,
      });
      return id;
    } catch (err) {
      console.warn('API save failed, storing locally:', err);
    }
  }

  // Offline or API failed → save locally with synced: false
  const id = await db.animals.add({
    ...data,
    synced: false,
    createdAt: now,
  });
  return id;
}

// Update animal: try API first, fall back to local-only
export async function updateAnimal(id: number, data: Partial<IAnimal>): Promise<void> {
  const existing = await db.animals.get(id);

  if (navigator.onLine && existing?.serverId) {
    try {
      await api.updateAnimal(existing.serverId, {
        name: data.name ?? existing.name,
        tagNumber: data.tagNumber ?? existing.tagNumber,
        type: data.type ?? existing.type,
        age: data.age ?? existing.age,
        attributes: data.attributes ?? existing.attributes,
      });
      // API success → update locally with synced: true
      await db.animals.update(id, { ...data, synced: true });
      return;
    } catch (err) {
      console.warn('API update failed, storing locally:', err);
    }
  }

  // Offline or API failed → update locally with synced: false
  await db.animals.update(id, { ...data, synced: false });
}

// Delete animal: try API, then always delete locally
export async function deleteAnimalLocally(id: number): Promise<void> {
  const animal = await db.animals.get(id);
  if (animal?.serverId && navigator.onLine) {
    try {
      await api.deleteAnimal(animal.serverId);
    } catch {
      /* If API delete fails, still delete locally */
    }
  }
  await db.reports.where('animalId').equals(id).delete();
  await db.animals.delete(id);
}

// ─── Reports ─────────────────────────────────────────────────────

// Save report: try API first, fall back to local-only
export async function saveReport(data: Omit<IReport, 'id' | 'synced' | 'createdAt'>): Promise<number> {
  // Check for local duplicate
  const existing = await db.reports
    .where('[animalId+date]')
    .equals([data.animalId, data.date])
    .first();
  if (existing) {
    throw new Error('A report already exists for this animal on this date');
  }

  const now = new Date().toISOString();

  if (navigator.onLine) {
    try {
      // Look up the animal's serverId for the API call
      const animal = await db.animals.get(data.animalId);
      if (animal?.serverId) {
        const serverReport = await api.createReport({
          animalId: animal.serverId,
          date: data.date,
          milk: data.milk,
          feed: data.feed,
          notes: data.notes,
        });
        // API success → save locally with synced: true
        const id = await db.reports.add({
          ...data,
          serverId: serverReport._id,
          serverAnimalId: animal.serverId,
          synced: true,
          createdAt: now,
        });
        return id;
      }
      // Animal doesn't have serverId yet — can't send report to server
      // Fall through to local-only save
    } catch (err) {
      console.warn('API report save failed, storing locally:', err);
    }
  }

  // Offline or API failed → save locally with synced: false
  const id = await db.reports.add({
    ...data,
    synced: false,
    createdAt: now,
  });
  return id;
}

// Update report: try API first, fall back to local-only
export async function updateReport(id: number, data: Partial<IReport>): Promise<void> {
  const existing = await db.reports.get(id);

  if (navigator.onLine && existing?.serverId) {
    try {
      await api.updateReport(existing.serverId, {
        milk: data.milk ?? existing.milk,
        feed: data.feed ?? existing.feed,
        notes: data.notes ?? existing.notes,
      });
      await db.reports.update(id, { ...data, synced: true });
      return;
    } catch (err) {
      console.warn('API report update failed, storing locally:', err);
    }
  }

  await db.reports.update(id, { ...data, synced: false });
}

// Delete report: try API, then always delete locally
export async function deleteReportLocally(id: number): Promise<void> {
  const report = await db.reports.get(id);
  if (report?.serverId && navigator.onLine) {
    try {
      await api.deleteReport(report.serverId);
    } catch {
      /* offline */
    }
  }
  await db.reports.delete(id);
}

// ─── Sync unsynced records (retry queue) ─────────────────────────

export async function syncAll(): Promise<{ success: boolean; error?: string }> {
  if (!navigator.onLine) return { success: false, error: 'Offline' };

  try {
    let syncedCount = 0;

    // 1) Push unsynced animals (one by one via direct API)
    const unsyncedAnimals = await db.animals.where('synced').equals(0).toArray();
    for (const animal of unsyncedAnimals) {
      try {
        if (animal.serverId) {
          // Has serverId → it was created on server before but update wasn't synced
          await api.updateAnimal(animal.serverId, {
            name: animal.name,
            tagNumber: animal.tagNumber,
            type: animal.type,
            age: animal.age,
            attributes: animal.attributes,
          });
          await db.animals.update(animal.id!, { synced: true });
        } else {
          // No serverId → create on server
          const serverAnimal = await api.createAnimal({
            name: animal.name,
            tagNumber: animal.tagNumber,
            type: animal.type,
            age: animal.age,
            attributes: animal.attributes,
          });
          await db.animals.update(animal.id!, {
            serverId: serverAnimal._id,
            synced: true,
          });
        }
        syncedCount++;
      } catch (err) {
        console.warn(`Failed to sync animal ${animal.id}:`, err);
      }
    }

    // 2) Push unsynced reports (one by one via direct API)
    const unsyncedReports = await db.reports.where('synced').equals(0).toArray();
    for (const report of unsyncedReports) {
      try {
        const animal = await db.animals.get(report.animalId);
        if (!animal?.serverId) {
          // Animal hasn't been synced yet — skip this report for now
          continue;
        }

        if (report.serverId) {
          // Has serverId → update on server
          await api.updateReport(report.serverId, {
            milk: report.milk,
            feed: report.feed,
            notes: report.notes,
          });
          await db.reports.update(report.id!, { synced: true });
        } else {
          // No serverId → create on server
          const serverReport = await api.createReport({
            animalId: animal.serverId,
            date: report.date,
            milk: report.milk,
            feed: report.feed,
            notes: report.notes,
          });
          await db.reports.update(report.id!, {
            serverId: serverReport._id,
            serverAnimalId: animal.serverId,
            synced: true,
          });
        }
        syncedCount++;
      } catch (err) {
        console.warn(`Failed to sync report ${report.id}:`, err);
      }
    }

    // 3) Pull from server to pick up any data created elsewhere
    await pullFromServer();

    console.log(`✅ Sync complete: ${syncedCount} records pushed`);
    return { success: true };
  } catch (err: any) {
    console.error('Sync error:', err);
    return { success: false, error: err.message };
  }
}

// Pull server data into local DB (for initial load or manual sync)
async function pullFromServer(): Promise<void> {
  try {
    // Pull animals
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
        // Only update if the local record is already synced (don't overwrite pending changes)
        if (existing.synced) {
          await db.animals.update(existing.id!, {
            name: sa.name,
            tagNumber: sa.tagNumber || '',
            type: sa.type,
            age: sa.age || 0,
            attributes: sa.attributes || {},
          });
        }
      }
    }

    // Pull reports
    const serverReports = await api.getReports();
    for (const sr of serverReports) {
      const existingReport = await db.reports.where('serverId').equals(sr._id).first();
      const animalServerId = sr.animalId?._id || sr.animalId;
      const animal = await db.animals.where('serverId').equals(animalServerId).first();

      if (!existingReport && animal) {
        const dateStr = new Date(sr.date).toISOString().split('T')[0];
        const dupCheck = await db.reports
          .where('[animalId+date]')
          .equals([animal.id!, dateStr])
          .first();
        if (!dupCheck) {
          await db.reports.add({
            serverId: sr._id,
            animalId: animal.id!,
            serverAnimalId: animalServerId,
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
  } catch (err) {
    console.warn('Pull from server failed:', err);
  }
}
