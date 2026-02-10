import Dexie, { type Table } from 'dexie';

export interface IAnimal {
  id?: number;
  serverId?: string;
  name: string;
  tagNumber: string;
  type: 'cow' | 'buffalo' | 'goat' | 'sheep';
  age: number;
  attributes: Record<string, unknown>;
  synced: boolean;
  createdAt: string;
}

export interface IReport {
  id?: number;
  serverId?: string;
  animalId: number; // local Dexie ID
  serverAnimalId?: string; // MongoDB _id
  date: string; // YYYY-MM-DD
  milk: number;
  feed: number;
  notes: string;
  synced: boolean;
  createdAt: string;
}

class LivestockDB extends Dexie {
  animals!: Table<IAnimal, number>;
  reports!: Table<IReport, number>;

  constructor() {
    super('LivestockDB');
    this.version(1).stores({
      animals: '++id, serverId, type, synced, name',
      reports: '++id, serverId, animalId, serverAnimalId, date, synced, [animalId+date]',
    });
  }
}

export const db = new LivestockDB();
