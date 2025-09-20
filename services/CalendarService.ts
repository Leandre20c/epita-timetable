// services/CalendarService.ts
import { CalendarEvent, DaySchedule } from '../types/CalendarType';
import { ICSParser } from './ICSParser';

export class CalendarService {
  private static readonly ICS_URL = 'https://zeus.ionis-it.com/api/group/203/ics/q2GXJsFwfL';
  private static cachedEvents: CalendarEvent[] | null = null;
  private static lastFetch: number = 0;
  private static readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

  public static async fetchSchedule(): Promise<CalendarEvent[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cachedEvents && (now - this.lastFetch) < this.CACHE_DURATION) {
      console.log('📋 Utilisation du cache pour les événements');
      return this.cachedEvents;
    }

    try {
      console.log('🔄 Chargement des événements depuis l\'API...');
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout
      
      const response = await fetch(this.ICS_URL, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'Accept': 'text/calendar, text/plain, */*',
          'User-Agent': 'ScheduleApp/1.0'
        }
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }
      
      const icsContent = await response.text();
      console.log('📄 Contenu ICS reçu, taille:', icsContent.length);
      
      if (!icsContent || icsContent.length < 100) {
        throw new Error('Contenu ICS vide ou trop court');
      }
      
      if (!icsContent.includes('BEGIN:VCALENDAR') && !icsContent.includes('BEGIN:VEVENT')) {
        throw new Error('Format ICS invalide');
      }
      
      this.cachedEvents = ICSParser.parseICS(icsContent);
      this.lastFetch = now;
      
      console.log(`✅ ${this.cachedEvents.length} événements chargés avec succès`);
      return this.cachedEvents;
      
    } catch (error) {
      console.error('❌ Erreur lors du chargement du calendrier:', error);
      
      // Return cached data if available, even if expired
      if (this.cachedEvents) {
        console.log('📋 Utilisation du cache expiré en cas d\'erreur');
        return this.cachedEvents;
      }
      
      // Return empty array instead of throwing to prevent app crash
      console.log('📭 Retour d\'un tableau vide');
      return [];
    }
  }

  public static async getEventsForDate(date: Date): Promise<CalendarEvent[]> {
    try {
      const events = await this.fetchSchedule();
      return events.filter(event => 
        ICSParser.isSameDay(event.startTime, date)
      );
    } catch (error) {
      console.error('Erreur getEventsForDate:', error);
      return [];
    }
  }

  public static async getTodayEvents(): Promise<CalendarEvent[]> {
    return this.getEventsForDate(new Date());
  }

  public static async getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
    try {
      const events = await this.fetchSchedule();
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(now.getDate() + days);
      
      return events.filter(event => 
        event.startTime >= now && event.startTime <= futureDate
      );
    } catch (error) {
      console.error('Erreur getUpcomingEvents:', error);
      return [];
    }
  }

  public static async getEventsForWeek(startDate?: Date): Promise<DaySchedule[]> {
    try {
      const events = await this.fetchSchedule();
      const weekStart = startDate || this.getWeekStart(new Date());
      const weekSchedule: DaySchedule[] = [];
      
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i);
        
        const dayEvents = events.filter(event => 
          ICSParser.isSameDay(event.startTime, currentDate)
        );
        
        weekSchedule.push({
          date: currentDate.toISOString().split('T')[0],
          events: dayEvents
        });
      }
      
      return weekSchedule;
    } catch (error) {
      console.error('Erreur getEventsForWeek:', error);
      return [];
    }
  }

  public static getWeekStart(date: Date): Date {
    const weekStart = new Date(date);
    const dayOfWeek = weekStart.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday as first day
    weekStart.setDate(weekStart.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  public static clearCache(): void {
    console.log('🗑️ Cache des événements effacé');
    this.cachedEvents = null;
    this.lastFetch = 0;
  }
}