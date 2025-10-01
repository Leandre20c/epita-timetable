// services/CalendarService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import ICAL from 'ical.js'; // ✅ Utilise ical.js au lieu de node-ical
import { CalendarEvent } from '../types/CalendarTypes';
import { GroupService } from './GroupeService';
import SubjectColorService from './SubjectColorService';

export class CalendarService {
  private static readonly CACHE_KEY = '@calendar_cache';
  private static readonly CACHE_TIMESTAMP_KEY = '@calendar_cache_timestamp';
  private static readonly CACHE_DURATION = 60 * 60 * 1000; // 1 heure

  /**
   * Récupère les événements du groupe sélectionné
   */
  static async fetchSchedule(): Promise<CalendarEvent[]> {
    try {
      const cached = await this.getCachedEvents();
      if (cached) {
        console.log('📦 Cache utilisé');
        return cached;
      }

      const selectedGroup = await GroupService.getSelectedGroup();
      
      if (!selectedGroup) {
        console.log('⚠️ Aucun groupe sélectionné');
        return [];
      }

      console.log('📡 Récupération pour:', selectedGroup.name);

      const icsContent = await GroupService.fetchGroupCalendar(selectedGroup.id);
      const events = this.parseICS(icsContent);
      
      await this.cacheEvents(events);
      
      console.log(`✅ ${events.length} événements chargés`);
      
      return events;

    } catch (error) {
      console.error('❌ Erreur fetchSchedule:', error);
      throw error;
    }
  }

  /**
   * Parse le contenu ICS avec ical.js
   */
  private static parseICS(icsContent: string): CalendarEvent[] {
    try {
      // Parse avec ical.js
      const jcalData = ICAL.parse(icsContent);
      const comp = new ICAL.Component(jcalData);
      const vevents = comp.getAllSubcomponents('vevent');

      const events: CalendarEvent[] = [];

      for (const vevent of vevents) {
        const event = new ICAL.Event(vevent);
        
        const summary = event.summary || 'Sans titre';
        const { subject, type } = this.parseEventTitle(summary);
        
        events.push({
          id: event.uid || `${Date.now()}-${Math.random()}`,
          title: summary,
          summary: summary,
          subject: subject,
          type: type,
          startTime: event.startDate.toJSDate(),
          endTime: event.endDate.toJSDate(),
          location: event.location || '',
          description: event.description || '',
          color: SubjectColorService.getColorBySubjectName(subject),
          allDay: event.startDate.isDate, // true si c'est un événement toute la journée
        });
      }

      return events;

    } catch (error) {
      console.error('❌ Erreur parsing ICS:', error);
      throw new Error('Impossible de parser le calendrier');
    }
  }

  /**
   * Extrait la matière et le type depuis le titre
   */
  private static parseEventTitle(title: string): { subject: string; type: string } {
    const patterns = [
      /^([A-Z\s]+)\s*-\s*(TD|TP|CM|COURS|EXAM)/i,
      /^(TD|TP|CM|COURS|EXAM)\s*-\s*([A-Z\s]+)/i,
      /^([A-Z\s]+)\s*\((TD|TP|CM|COURS|EXAM)\)/i,
    ];

    for (const pattern of patterns) {
      const match = title.match(pattern);
      if (match) {
        return {
          subject: match[1].trim(),
          type: match[2].trim().toUpperCase(),
        };
      }
    }

    return {
      subject: title,
      type: 'COURS',
    };
  }

  /**
   * Cache les événements
   */
  private static async cacheEvents(events: CalendarEvent[]): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CACHE_KEY, JSON.stringify(events));
      await AsyncStorage.setItem(this.CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      console.error('Erreur cache:', error);
    }
  }

  /**
   * Récupère du cache
   */
  private static async getCachedEvents(): Promise<CalendarEvent[] | null> {
    try {
      const cached = await AsyncStorage.getItem(this.CACHE_KEY);
      const timestamp = await AsyncStorage.getItem(this.CACHE_TIMESTAMP_KEY);

      if (!cached || !timestamp) return null;

      const age = Date.now() - parseInt(timestamp);
      if (age > this.CACHE_DURATION) {
        console.log('⏰ Cache expiré');
        return null;
      }

      const events = JSON.parse(cached);
      
      return events.map((e: any) => ({
        ...e,
        startTime: new Date(e.startTime),
        endTime: new Date(e.endTime),
      }));

    } catch (error) {
      return null;
    }
  }

  /**
   * Vide le cache
   */
  static async clearCache(): Promise<void> {
    await AsyncStorage.multiRemove([this.CACHE_KEY, this.CACHE_TIMESTAMP_KEY]);
    console.log('🗑️ Cache vidé');
  }

  /**
   * Événements pour une date
   */
  static async getEventsForDate(date: Date): Promise<CalendarEvent[]> {
    const allEvents = await this.fetchSchedule();
    
    return allEvents.filter(event => {
      const eventDate = event.startTime;
      return (
        eventDate.getFullYear() === date.getFullYear() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getDate() === date.getDate()
      );
    });
  }

  /**
   * Événements pour une semaine
   */
  static async getEventsForWeek(weekStart: Date): Promise<CalendarEvent[]> {
    const allEvents = await this.fetchSchedule();
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 7);

    return allEvents.filter(event => {
      return event.startTime >= weekStart && event.startTime < weekEnd;
    });
  }

  /**
   * Événements pour un mois
   */
  static async getEventsForMonth(year: number, month: number): Promise<CalendarEvent[]> {
    const allEvents = await this.fetchSchedule();

    return allEvents.filter(event => {
      return (
        event.startTime.getFullYear() === year &&
        event.startTime.getMonth() === month
      );
    });
  }
  
  /**
   * Alias pour compatibilité
   */
  static async getTodayEvents(): Promise<CalendarEvent[]> {
    return this.getEventsForDate(new Date());
  }
}