import { db, type Animal, type DailyReport } from "../db/database";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Check if online
export const isOnline = (): boolean => navigator.onLine;

// ══════════════════════════════════════════════════════════════
// PULL SYNC (Server → Local) - NEW!
// ══════════════════════════════════════════════════════════════

// Pull animals from server and merge into local DB
export const pullAnimals = async (): Promise<{
  pulled: number;
  errors: string[];
}> => {
  if (!isOnline()) {
    return { pulled: 0, errors: ["Offline - cannot pull"] };
  }

  console.log("[Sync] Pulling animals from server...");
  const errors: string[] = [];
  let pulled = 0;

  try {
    const response = await fetch(`${API_URL}/animals`);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const serverAnimals = await response.json();
    console.log(`[Sync] Server has ${serverAnimals.length} animals`);

    for (const serverAnimal of serverAnimals) {
      try {
        // Check if we already have this animal by serverId
        const existing = await db.animals
          .where("serverId")
          .equals(serverAnimal._id)
          .first();

        if (!existing) {
          // New animal from server - add to local DB
          await db.animals.add({
            serverId: serverAnimal._id,
            name: serverAnimal.name,
            tagNumber: serverAnimal.tagNumber || "",
            type: serverAnimal.type,
            age: serverAnimal.age || 0,
            attributes: serverAnimal.attributes || {},
            synced: true,
            createdAt: new Date(serverAnimal.createdAt),
            updatedAt: new Date(),
          });
          console.log(`[Sync] ⬇️ Pulled animal: ${serverAnimal.name}`);
          pulled++;
        }
      } catch (err) {
        console.error(`[Sync] Error pulling animal ${serverAnimal.name}:`, err);
        errors.push(`Error pulling ${serverAnimal.name}`);
      }
    }

    console.log(`[Sync] Pull complete: ${pulled} new animals`);
  } catch (err) {
    console.error("[Sync] Failed to fetch animals from server:", err);
    errors.push("Failed to fetch animals from server");
  }

  return { pulled, errors };
};

// Pull reports from server and merge into local DB
export const pullReports = async (): Promise<{
  pulled: number;
  errors: string[];
}> => {
  if (!isOnline()) {
    return { pulled: 0, errors: ["Offline - cannot pull"] };
  }

  console.log("[Sync] Pulling reports from server...");
  const errors: string[] = [];
  let pulled = 0;

  try {
    const response = await fetch(`${API_URL}/reports`);
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}`);
    }

    const serverReports = await response.json();
    console.log(`[Sync] Server has ${serverReports.length} reports`);

    // Build a map of serverId -> localId for animals
    const allAnimals = await db.animals.toArray();
    const serverIdToLocalId: Record<string, number> = {};
    for (const animal of allAnimals) {
      if (animal.serverId && animal.id) {
        serverIdToLocalId[animal.serverId] = animal.id;
      }
    }

    for (const serverReport of serverReports) {
      try {
        // Check if we already have this report by serverId
        const existingByServerId = await db.dailyReports
          .where("serverId")
          .equals(serverReport._id)
          .first();

        if (existingByServerId) {
          continue; // Already have it
        }

        // Get animal serverId - could be populated object or just ID string
        const animalServerId =
          typeof serverReport.animalId === "object"
            ? serverReport.animalId._id
            : serverReport.animalId;

        // Find local animal ID
        const localAnimalId = serverIdToLocalId[animalServerId];
        if (!localAnimalId) {
          console.log(
            `[Sync] Skipping report - no local animal for serverId ${animalServerId}`,
          );
          continue;
        }

        // Format date as YYYY-MM-DD
        const reportDate = new Date(serverReport.date);
        const dateStr = reportDate.toISOString().split("T")[0];

        // Check if we already have a report for this animal+date
        const existingByDate = await db.dailyReports
          .where("[animalId+date]")
          .equals([localAnimalId, dateStr])
          .first();

        if (existingByDate) {
          // Update with serverId if missing
          if (!existingByDate.serverId) {
            await db.dailyReports.update(existingByDate.id!, {
              serverId: serverReport._id,
              synced: true,
            });
          }
          continue;
        }

        // New report from server - add to local DB
        await db.dailyReports.add({
          serverId: serverReport._id,
          animalId: localAnimalId,
          animalServerId: animalServerId,
          date: dateStr,
          milk: serverReport.milk || 0,
          feed: serverReport.feed || 0,
          notes: serverReport.notes || "",
          synced: true,
          createdAt: new Date(serverReport.createdAt || Date.now()),
        });
        console.log(`[Sync] ⬇️ Pulled report for ${dateStr}`);
        pulled++;
      } catch (err) {
        console.error(`[Sync] Error pulling report:`, err);
        errors.push(`Error pulling report`);
      }
    }

    console.log(`[Sync] Pull complete: ${pulled} new reports`);
  } catch (err) {
    console.error("[Sync] Failed to fetch reports from server:", err);
    errors.push("Failed to fetch reports from server");
  }

  return { pulled, errors };
};

// ══════════════════════════════════════════════════════════════
// PUSH SYNC (Local → Server)
// ══════════════════════════════════════════════════════════════

// Push unsynced animals to server
export const pushAnimals = async (): Promise<{
  pushed: number;
  errors: string[];
}> => {
  if (!isOnline()) {
    return { pushed: 0, errors: ["Offline - cannot push"] };
  }

  const allAnimals = await db.animals.toArray();
  const unsynced = allAnimals.filter((a) => a.synced === false);

  console.log(`[Sync] Found ${unsynced.length} unsynced animals to push`);

  const errors: string[] = [];
  let pushed = 0;

  for (const animal of unsynced) {
    try {
      console.log(`[Sync] Pushing animal: ${animal.name}`);
      const response = await fetch(`${API_URL}/animals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        console.log(
          `[Sync] ⬆️ Pushed animal ${animal.name}, serverId: ${data._id}`,
        );
        pushed++;
      } else {
        const errorData = await response.json();
        console.error(`[Sync] ❌ Failed to push ${animal.name}:`, errorData);
        errors.push(`Failed to push ${animal.name}: ${errorData.error}`);
      }
    } catch (err) {
      console.error(`[Sync] ❌ Network error pushing ${animal.name}:`, err);
      errors.push(`Network error pushing ${animal.name}`);
    }
  }

  console.log(`[Sync] Push complete: ${pushed} animals`);
  return { pushed, errors };
};

// Push unsynced reports to server
export const pushReports = async (): Promise<{
  pushed: number;
  errors: string[];
}> => {
  if (!isOnline()) {
    return { pushed: 0, errors: ["Offline - cannot push"] };
  }

  const allReports = await db.dailyReports.toArray();
  const unsynced = allReports.filter((r) => r.synced === false);

  console.log(`[Sync] Found ${unsynced.length} unsynced reports to push`);

  const errors: string[] = [];
  let pushed = 0;

  for (const report of unsynced) {
    try {
      // Get the animal's server ID
      const animal = await db.animals.get(report.animalId);
      if (!animal?.serverId) {
        console.log(
          `[Sync] Skipping report - animal ${report.animalId} not synced yet`,
        );
        continue;
      }

      console.log(`[Sync] Pushing report for ${animal.name}`);
      const response = await fetch(`${API_URL}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        console.log(`[Sync] ⬆️ Pushed report`);
        pushed++;
      } else {
        const errorData = await response.json();
        console.error(`[Sync] ❌ Failed to push report:`, errorData);
        errors.push(`Failed to push report: ${errorData.error}`);
      }
    } catch (err) {
      console.error(`[Sync] ❌ Network error pushing report:`, err);
      errors.push(`Network error pushing report`);
    }
  }

  return { pushed, errors };
};

// ══════════════════════════════════════════════════════════════
// FULL SYNC (Bi-directional: Pull first, then Push)
// ══════════════════════════════════════════════════════════════

export const syncAll = async (): Promise<{
  pulled: { animals: number; reports: number };
  pushed: { animals: number; reports: number };
  errors: string[];
}> => {
  console.log("[Sync] === Starting full bi-directional sync ===");

  // PULL first (get new data from server)
  console.log("[Sync] Phase 1: PULL from server");
  const pullAnimalsResult = await pullAnimals();
  const pullReportsResult = await pullReports();

  // PUSH second (send local changes to server)
  console.log("[Sync] Phase 2: PUSH to server");
  const pushAnimalsResult = await pushAnimals();
  const pushReportsResult = await pushReports();

  const result = {
    pulled: {
      animals: pullAnimalsResult.pulled,
      reports: pullReportsResult.pulled,
    },
    pushed: {
      animals: pushAnimalsResult.pushed,
      reports: pushReportsResult.pushed,
    },
    errors: [
      ...pullAnimalsResult.errors,
      ...pullReportsResult.errors,
      ...pushAnimalsResult.errors,
      ...pushReportsResult.errors,
    ],
  };

  console.log("[Sync] === Full sync complete ===", result);
  return result;
};

// Legacy exports (for backward compatibility)
export const syncAnimals = pushAnimals;
export const syncReports = pushReports;

// ══════════════════════════════════════════════════════════════
// CRUD HELPERS
// ══════════════════════════════════════════════════════════════

export const createAnimal = async (
  data: Omit<Animal, "id" | "synced" | "createdAt" | "updatedAt">,
): Promise<number> => {
  const id = await db.animals.add({
    ...data,
    synced: false,
    createdAt: new Date(),
    updatedAt: new Date(),
  });

  console.log(`[DB] Created animal with local id: ${id}`);

  if (isOnline()) {
    console.log("[Sync] Online - triggering immediate sync");
    pushAnimals().catch(console.error);
  }

  return id as number;
};

export const updateAnimal = async (
  id: number,
  data: Partial<Animal>,
): Promise<void> => {
  await db.animals.update(id, {
    ...data,
    synced: false,
    updatedAt: new Date(),
  });

  if (isOnline()) {
    pushAnimals().catch(console.error);
  }
};

export const deleteAnimal = async (id: number): Promise<void> => {
  await db.dailyReports.where("animalId").equals(id).delete();
  await db.animals.delete(id);
};

export const createReport = async (
  data: Omit<DailyReport, "id" | "synced" | "createdAt">,
): Promise<number> => {
  const id = await db.dailyReports.add({
    ...data,
    synced: false,
    createdAt: new Date(),
  });

  console.log(`[DB] Created report with local id: ${id}`);

  if (isOnline()) {
    console.log("[Sync] Online - triggering immediate sync");
    pushReports().catch(console.error);
  }

  return id as number;
};

export const getTodayStats = async (): Promise<{
  totalMilk: number;
  reportCount: number;
}> => {
  const today = new Date().toISOString().split("T")[0];
  const reports = await db.dailyReports.where("date").equals(today).toArray();

  return {
    totalMilk: reports.reduce((sum, r) => sum + (r.milk || 0), 0),
    reportCount: reports.length,
  };
};

// ══════════════════════════════════════════════════════════════
// AUTO-SYNC ON LOAD
// ══════════════════════════════════════════════════════════════

if (typeof window !== "undefined") {
  window.addEventListener("load", () => {
    if (isOnline()) {
      console.log("[Sync] Page loaded while online - triggering full sync");
      setTimeout(() => syncAll(), 1000);
    }
  });

  window.addEventListener("online", () => {
    console.log("[Sync] Came back online - triggering full sync");
    syncAll();
  });
}
