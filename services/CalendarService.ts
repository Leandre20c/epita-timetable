// services/CalendarService.ts
import { CalendarEvent, DaySchedule } from '../types/CalendarTypes';
import { ICSParser } from './ICSParser';

export class CalendarService {
  private static readonly ICS_URL = 'https://zeus.ionis-it.com/api/group/203/ics/q2GXJsFwfL?startDate=2025-09-18';
  private static cachedEvents: CalendarEvent[] | null = null;
  private static lastFetch: number = 0;
  private static readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

  public static async fetchSchedule(): Promise<CalendarEvent[]> {
    const now = Date.now();
    
    // Return cached data if still valid
    if (this.cachedEvents && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cachedEvents;
    }

    try {
      const response = await fetch(this.ICS_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const icsContent = await response.text();
      this.cachedEvents = ICSParser.parseICS(icsContent);
      this.lastFetch = now;
      
      return this.cachedEvents;
    } catch (error) {
      console.error('Erreur lors du chargement du calendrier:', error);
      throw new Error('Impossible de charger l\'emploi du temps');
    }
  }

  public static async getEventsForDate(date: Date): Promise<CalendarEvent[]> {
    const events = await this.fetchSchedule();
    
    return events.filter(event => 
      ICSParser.isSameDay(event.startTime, date)
    );
  }

  public static async getEventsForWeek(startDate: Date): Promise<DaySchedule[]> {
    const events = await this.fetchSchedule();
    const weekSchedule: DaySchedule[] = [];
    
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayEvents = events.filter(event => 
        ICSParser.isSameDay(event.startTime, currentDate)
      );
      
      weekSchedule.push({
        date: currentDate.toISOString().split('T')[0],
        events: dayEvents
      });
    }
    
    return weekSchedule;
  }

  public static async getTodayEvents(): Promise<CalendarEvent[]> {
    return this.getEventsForDate(new Date());
  }

  public static async getUpcomingEvents(days: number = 7): Promise<CalendarEvent[]> {
    const events = await this.fetchSchedule();
    const now = new Date();
    const futureDate = new Date();
    futureDate.setDate(now.getDate() + days);
    
    return events.filter(event => 
      event.startTime >= now && event.startTime <= futureDate
    );
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
    this.cachedEvents = null;
    this.lastFetch = 0;
  }
}