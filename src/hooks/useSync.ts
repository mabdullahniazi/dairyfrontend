import { useState, useEffect, useCallback } from 'react';
import { syncAll } from '../lib/sync';
import { useOnlineStatus } from './useOnlineStatus';

export function useSync() {
  const isOnline = useOnlineStatus();
  const [syncing, setSyncing] = useState(false);
  const [lastSyncResult, setLastSyncResult] = useState<{ success: boolean; error?: string } | null>(null);

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

  return { syncing, lastSyncResult, doSync, isOnline };
}
