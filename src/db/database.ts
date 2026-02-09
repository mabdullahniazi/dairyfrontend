import Dexie, { type EntityTable } from 'dexie';

// Types for our database entities
export interface Animal {
  id?: number;
  serverId?: string; // MongoDB _id after sync
  name: string;
  tagNumber: string;
  type: 'cow' | 'buffalo' | 'goat' | 'sheep';
  age: number;
  attributes: Record<string, unknown>;
  synced: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DailyReport {
  id?: number;
  serverId?: string;
  animalId: number; // Local ID
  animalServerId?: string; // Server ID for synced animals
  date: string; // YYYY-MM-DD format
  milk: number;
  feed: number;
  notes: string;
  synced: boolean;
  createdAt: Date;
}

export interface SyncQueue {
  id?: number;
  type: 'animal' | 'report';
  action: 'create' | 'update' | 'delete';
  localId: number;
  data: Record<string, unknown>;
  createdAt: Date;
}

export interface AppSettings {
  id?: number;
  key: string;
  value: unknown;
}

// Database class
class LivestockDB extends Dexie {
  animals!: EntityTable<Animal, 'id'>;
  dailyReports!: EntityTable<DailyReport, 'id'>;
  syncQueue!: EntityTable<SyncQueue, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;

  constructor() {
    super('LivestockManager');
    
    this.version(1).stores({
      animals: '++id, serverId, name, type, synced, createdAt',
      dailyReports: '++id, serverId, animalId, animalServerId, date, synced, [animalId+date]',
      syncQueue: '++id, type, action, localId, createdAt',
      settings: '++id, key'
    });
  }
}

// Singleton instance
export const db = new LivestockDB();

// Helper functions
export const getAnimalEmoji = (type: string): string => {
  const emojis: Record<string, string> = {
    cow: '🐄',
    buffalo: '🐃',
    goat: '🐐',
    sheep: '🐑'
  };
  return emojis[type] || '🐄';
};

export const formatDate = (date: Date | string): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toISOString().split('T')[0];
};

export const getTodayDate = (): string => {
  return formatDate(new Date());
};
