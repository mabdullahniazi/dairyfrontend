import { useState, useEffect, useCallback } from 'react';
import { syncAll } from '../services/syncService';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSync: Date | null;
  pendingCount: number;
}

export function useSync() {
  const [state, setState] = useState<SyncState>({
    isOnline: navigator.onLine,
    isSyncing: false,
    lastSync: null,
    pendingCount: 0,
  });

  const handleOnline = useCallback(async () => {
    setState(prev => ({ ...prev, isOnline: true }));
    // Auto-sync when coming online
    await performSync();
  }, []);

  const handleOffline = useCallback(() => {
    setState(prev => ({ ...prev, isOnline: false }));
  }, []);

  const performSync = useCallback(async () => {
    if (!navigator.onLine) return;

    setState(prev => ({ ...prev, isSyncing: true }));
    try {
      const result = await syncAll();
      console.log('Sync complete:', result);
      setState(prev => ({
        ...prev,
        isSyncing: false,
        lastSync: new Date(),
        pendingCount: result.errors.length,
      }));
    } catch (err) {
      console.error('Sync failed:', err);
      setState(prev => ({ ...prev, isSyncing: false }));
    }
  }, []);

  useEffect(() => {
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial sync if online
    if (navigator.onLine) {
      performSync();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [handleOnline, handleOffline, performSync]);

  return {
    ...state,
    sync: performSync,
  };
}
