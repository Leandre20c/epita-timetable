// services/CalendarService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import ICAL from 'ical.js';
import { CalendarEvent } from '../types/CalendarTypes';
import { AuthService } from './AuthService';
import { CacheService } from './CacheService';
import { GroupService } from './GroupeService';
import SubjectColorService from './SubjectColorService';

// Types locaux pour la structure de planning de semaine
export type DaySchedule = {
  date: string;
  dayName: string;
  events: CalendarEvent[];
};

export type WeekSchedule = {
  weekStart: Date;
  weekEnd: Date;
  days: DaySchedule[];
};

export type MonthSchedule = {
  year: number;
  month: number;
  events: CalendarEvent[];
};

export class CalendarService {
  /**
   * 🆕 Récupère les événements avec cache intelligent IndexedDB
   */
  static async fetchSchedule(): Promise<CalendarEvent[]> {
    try {
      // 1. Vérifier l'authentification
      const isAuthenticated = await AuthService.isAuthenticated();
      if (!isAuthenticated) {
        console.log('⚠️ Non authentifié');
        return [];
      }

      // 2. Récupérer le groupe sélectionné
      const selectedGroup = await GroupService.getSelectedGroup();
      if (!selectedGroup) {
        console.log('⚠️ Aucun groupe sélectionné');
        return [];
      }

      const groupId = selectedGroup.id;
      const groupName = selectedGroup.name;

      // 3. Vérifier le cache IndexedDB
      const cached = await CacheService.getCalendarFromCache(groupId);
      const isOnline = await CacheService.isOnline();

      // 4. Mode OFFLINE → utiliser cache (même périmé)
      if (!isOnline) {
        if (cached) {
          console.log('📡 Mode hors-ligne - Cache utilisé');
          return cached.events;
        } else {
          console.log('❌ Mode hors-ligne - Aucun cache disponible');
          throw new Error('Aucune donnée en cache et pas de connexion');
        }
      }

      // 5. Cache FRAIS → utiliser cache (même online)
      if (cached && CacheService.isCacheFresh(cached.timestamp)) {
        console.log('⚡ Cache frais - Chargement instantané');
        return cached.events;
      }

      // 6. FETCH depuis l'API (cache périmé ou inexistant)
      console.log('📡 Récupération réseau pour:', groupName);
      
      try {
        const icsContent = await GroupService.fetchGroupCalendar(groupId);
        const events = this.parseICS(icsContent);
        
        // 7. Sauvegarder dans IndexedDB
        await CacheService.saveCalendarToCache(
          groupId,
          groupName,
          events,
          icsContent
        );

        // 8. Nettoyer l'ancien cache AsyncStorage (migration)
        await this.migrateOldCache();

        // 9. Nettoyer les vieux caches
        await CacheService.cleanOldCache();

        console.log(`✅ ${events.length} événements chargés et mis en cache`);
        return events;

      } catch (fetchError) {
        // 10. Erreur réseau → Fallback sur cache périmé
        if (cached) {
          console.log('⚠️ Erreur réseau - Utilisation du cache périmé');
          return cached.events;
        }
        throw fetchError;
      }

    } catch (error) {
      console.error('❌ Erreur fetchSchedule:', error);
      throw error;
    }
  }

  /**
   * 🆕 Migration de l'ancien cache AsyncStorage vers IndexedDB
   * (Peut être supprimé après quelques versions)
   */
  private static async migrateOldCache(): Promise<void> {
    try {
      const oldCache = await AsyncStorage.getItem('@calendar_cache');
      if (oldCache) {
        console.log('🔄 Migration ancien cache AsyncStorage...');
        await AsyncStorage.multiRemove([
          '@calendar_cache',
          '@calendar_cache_timestamp'
        ]);
        console.log('✅ Ancien cache supprimé');
      }
    } catch (error) {
      // Ignorer les erreurs de migration
      console.warn('⚠️ Erreur migration cache:', error);
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
   * 🆕 Vide le cache (nouvelle version avec IndexedDB)
   */
  static async clearCache(): Promise<void> {
    // Vider le cache IndexedDB
    await CacheService.clearAllCache();
    
    // Migration: vider aussi l'ancien cache AsyncStorage
    try {
      await AsyncStorage.multiRemove([
        '@calendar_cache',
        '@calendar_cache_timestamp'
      ]);
    } catch (error) {
      // Ignorer les erreurs
    }
    
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

  /**
   * Obtient le début de semaine (lundi) pour une date donnée
   */
  static getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi comme premier jour
    return new Date(d.setDate(diff));
  }

  /**
   * Obtient la semaine précédente
   */
  static getPreviousWeek(weekStart: Date): Date {
    const prev = new Date(weekStart);
    prev.setDate(prev.getDate() - 7);
    return prev;
  }

  /**
   * Obtient la semaine suivante
   */
  static getNextWeek(weekStart: Date): Date {
    const next = new Date(weekStart);
    next.setDate(next.getDate() + 7);
    return next;
  }

  /**
   * Formate la période d'une semaine (ex: "27 jan - 2 fév")
   */
  static formatWeekPeriod(weekStart: Date, weekEnd: Date): string {
    const startStr = weekStart.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
    const endStr = weekEnd.toLocaleDateString('fr-FR', { 
      day: 'numeric', 
      month: 'short' 
    });
    return `${startStr} - ${endStr}`;
  }

  /**
   * Obtient le planning d'une semaine avec structure organisée
   */
  static async getWeekSchedule(weekStart: Date): Promise<WeekSchedule> {
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6); // 6 jours après le lundi

    const events = await this.getEventsForWeek(weekStart);

    // Créer un tableau de 7 jours
    const days: DaySchedule[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDay = new Date(weekStart);
      currentDay.setDate(currentDay.getDate() + i);
      
      const dayEvents = events.filter(event => {
        const eventDate = event.startTime;
        return (
          eventDate.getFullYear() === currentDay.getFullYear() &&
          eventDate.getMonth() === currentDay.getMonth() &&
          eventDate.getDate() === currentDay.getDate()
        );
      });

      // Trier les événements par heure de début
      dayEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

      days.push({
        date: currentDay.toISOString().split('T')[0],
        dayName: currentDay.toLocaleDateString('fr-FR', { weekday: 'long' }),
        events: dayEvents,
      });
    }

    return {
      weekStart,
      weekEnd,
      days,
    };
  }

  /**
   * Obtient le mois précédent
   */
  static getPreviousMonth(date: Date): Date {
    const prev = new Date(date);
    prev.setMonth(prev.getMonth() - 1);
    return prev;
  }

  /**
   * Obtient le mois suivant
   */
  static getNextMonth(date: Date): Date {
    const next = new Date(date);
    next.setMonth(next.getMonth() + 1);
    return next;
  }

  /**
   * Formate le nom du mois (ex: "Janvier 2025")
   */
  static formatMonthPeriod(date: Date): string {
    return date.toLocaleDateString('fr-FR', { 
      month: 'long', 
      year: 'numeric' 
    });
  }

  /**
   * Obtient le planning d'un mois avec structure organisée
   */
  static async getMonthSchedule(date: Date): Promise<MonthSchedule> {
    const year = date.getFullYear();
    const month = date.getMonth();

    const events = await this.getEventsForMonth(year, month);

    // Trier les événements par date
    events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());

    return {
      year,
      month,
      events,
    };
  }
}