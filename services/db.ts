// services/db.ts
import Dexie, { Table } from 'dexie';
import { CalendarEvent } from '../types/CalendarTypes';

export interface CachedCalendar {
  id: string;              // Format: "group-{groupId}"
  groupId: number;         // 🔧 CHANGÉ: number au lieu de string
  groupName: string;
  events: CalendarEvent[]; // Tous les événements du calendrier
  timestamp: number;       // Date de mise en cache
  icsContent: string;      // Le contenu ICS brut (optionnel, pour debug)
}

export class AppDatabase extends Dexie {
  calendars!: Table<CachedCalendar, string>;

  constructor() {
    super('EpiTimeDB');
    this.version(1).stores({
      // Index sur groupId pour recherche rapide
      calendars: 'id, groupId, timestamp'
    });
  }
}

export const db = new AppDatabase();