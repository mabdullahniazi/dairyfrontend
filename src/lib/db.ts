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

export interface ICrop {
  id?: number;
  serverId?: string;
  crop_name: string;
  crop_type: string;
  sowing_date: string;
  land_size_acres: number;
  expected_production: number;
  production_unit: 'kg' | 'maund' | 'ton';
  crop_status: 'planned' | 'active' | 'harvested';
  notes: string;
  synced: boolean;
  createdAt: string;
}

export interface IExpense {
  id?: number;
  serverId?: string;
  crop_id: string; // server crop _id
  expense_date: string;
  seed_cost: number;
  fertilizer_cost: number;
  spray_cost: number;
  water_irrigation_cost: number;
  labor_cost: number;
  diesel_machinery_cost: number;
  other_cost: number;
  total_expense: number;
  remarks: string;
  synced: boolean;
  createdAt: string;
}

export interface IIncome {
  id?: number;
  serverId?: string;
  crop_id: string;
  harvest_date: string;
  total_production: number;
  production_unit: 'kg' | 'maund' | 'ton';
  rate_per_unit: number;
  total_income: number;
  notes: string;
  synced: boolean;
  createdAt: string;
}

export interface ILandPlot {
  id?: number;
  serverId?: string;
  plot_name: string;
  plot_area_acres: number;
  soil_type: string;
  current_crop_id: string | null;
  notes: string;
  synced: boolean;
  createdAt: string;
}

export interface IReminder {
  id?: number;
  serverId?: string;
  crop_id: string;
  reminder_type: 'spraying' | 'irrigation' | 'fertilizer' | 'harvesting';
  scheduled_date: string;
  repeat: boolean;
  is_done: boolean;
  notes: string;
  synced: boolean;
  createdAt: string;
}

class LivestockDB extends Dexie {
  animals!: Table<IAnimal, number>;
  reports!: Table<IReport, number>;
  crops!: Table<ICrop, number>;
  expenses!: Table<IExpense, number>;
  incomeRecords!: Table<IIncome, number>;
  landPlots!: Table<ILandPlot, number>;
  reminders!: Table<IReminder, number>;

  constructor() {
    super('LivestockDB');
    this.version(1).stores({
      animals: '++id, serverId, type, synced, name',
      reports: '++id, serverId, animalId, serverAnimalId, date, synced, [animalId+date]',
    });
    this.version(2).stores({
      animals: '++id, serverId, type, synced, name',
      reports: '++id, serverId, animalId, serverAnimalId, date, synced, [animalId+date]',
      crops: '++id, serverId, crop_status, synced',
      expenses: '++id, serverId, crop_id, synced',
      incomeRecords: '++id, serverId, crop_id, synced',
      landPlots: '++id, serverId, current_crop_id, synced',
      reminders: '++id, serverId, crop_id, scheduled_date, is_done, synced',
    });
  }
}

export const db = new LivestockDB();
