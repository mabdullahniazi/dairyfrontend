import { useState, useEffect, useCallback } from 'react';
import { syncAll } from '../lib/sync';
import { db } from '../lib/db';
import { useOnlineStatus } from './useOnlineStatus';
import { useLiveQuery } from 'dexie-react-hooks';

export function useSync() {
  const isOnline = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ success: boolean; error?: string } | null>(null);

  // Live count of unsynced records (reactive — updates when IndexedDB changes)
  const pendingCount = useLiveQuery(async () => {
    const unsyncedAnimals = await db.animals.where('synced').equals(0).count();
    const unsyncedReports = await db.reports.where('synced').equals(0).count();
    return unsyncedAnimals + unsyncedReports;
  }, []) ?? 0;

  const doSync = useCallback(async () => {
    if (!navigator.onLine || syncing) return;
    setSyncing(true);
    try {
      const result = await syncAll();
      setLastSyncResult(result);
    } catch (err: any) {
      setLastSyncResult({ success: false, error: err.message });
    } finally {
      setSyncing(false);
    }
  }, [syncing]);

  // Auto-sync when coming back online
  useEffect(() => {
    if (isOnline) {
      doSync();
    }
  }, [isOnline]);

  // Initial sync on mount
  useEffect(() => {
    doSync();
  }, []);

  return { syncing, lastSyncResult, doSync, isOnline, pendingCount };
}
