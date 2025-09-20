// services/CalendarService.ts
import { CalendarEvent, DaySchedule, MonthSchedule, WeekSchedule } from '../types/CalendarTypes';
import { ICSParser } from './ICSParser';

export class CalendarService {
  private static readonly ICS_URL = 'https://zeus.ionis-it.com/api/group/203/ics/q2GXJsFwfL?startDate=2025-09-01';
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
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
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

  // Méthode pour récupérer les événements d'un jour spécifique
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

  // Navigation par semaine
  public static async getWeekSchedule(weekStartDate: Date): Promise<WeekSchedule> {
    try {
      const events = await this.fetchSchedule();
      const weekStart = this.getWeekStart(weekStartDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const days: DaySchedule[] = [];
      
      for (let i = 0; i < 7; i++) {
        const currentDate = new Date(weekStart);
        currentDate.setDate(weekStart.getDate() + i);
        
        const dayEvents = events.filter(event => 
          ICSParser.isSameDay(event.startTime, currentDate)
        );
        
        days.push({
          date: currentDate.toISOString().split('T')[0],
          events: dayEvents
        });
      }
      
      return {
        weekStart,
        weekEnd,
        days
      };
    } catch (error) {
      console.error('Erreur getWeekSchedule:', error);
      const weekStart = this.getWeekStart(weekStartDate);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      return {
        weekStart,
        weekEnd,
        days: Array.from({ length: 7 }, (_, i) => {
          const date = new Date(weekStart);
          date.setDate(weekStart.getDate() + i);
          return {
            date: date.toISOString().split('T')[0],
            events: []
          };
        })
      };
    }
  }

  // Navigation par mois
  public static async getMonthSchedule(monthDate: Date): Promise<MonthSchedule> {
    try {
      const events = await this.fetchSchedule();
      const year = monthDate.getFullYear();
      const month = monthDate.getMonth();
      
      // Premier jour du mois
      const monthStart = new Date(year, month, 1);
      // Dernier jour du mois
      const monthEnd = new Date(year, month + 1, 0);
      
      // Événements du mois
      const monthEvents = events.filter(event => {
        const eventDate = event.startTime;
        return eventDate.getFullYear() === year && eventDate.getMonth() === month;
      });
      
      // Générer les semaines du mois
      const weeks: WeekSchedule[] = [];
      const firstWeekStart = this.getWeekStart(monthStart);
      
      let currentWeekStart = new Date(firstWeekStart);
      
      while (currentWeekStart <= monthEnd) {
        const weekSchedule = await this.getWeekSchedule(currentWeekStart);
        
        // Ne garder que si la semaine touche le mois courant
        const weekTouchesMonth = weekSchedule.days.some(day => {
          const dayDate = new Date(day.date + 'T00:00:00');
          return dayDate.getMonth() === month && dayDate.getFullYear() === year;
        });
        
        if (weekTouchesMonth) {
          weeks.push(weekSchedule);
        }
        
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }
      
      return {
        month,
        year,
        weeks,
        events: monthEvents
      };
    } catch (error) {
      console.error('Erreur getMonthSchedule:', error);
      return {
        month: monthDate.getMonth(),
        year: monthDate.getFullYear(),
        weeks: [],
        events: []
      };
    }
  }

  // Utilitaires de navigation
  public static getWeekStart(date: Date): Date {
    const weekStart = new Date(date);
    const dayOfWeek = weekStart.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Lundi comme premier jour
    weekStart.setDate(weekStart.getDate() + diff);
    weekStart.setHours(0, 0, 0, 0);
    return weekStart;
  }

  public static getPreviousWeek(currentWeekStart: Date): Date {
    const previousWeek = new Date(currentWeekStart);
    previousWeek.setDate(currentWeekStart.getDate() - 7);
    return previousWeek;
  }

  public static getNextWeek(currentWeekStart: Date): Date {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(currentWeekStart.getDate() + 7);
    return nextWeek;
  }

  public static getPreviousMonth(currentDate: Date): Date {
    const previousMonth = new Date(currentDate);
    previousMonth.setMonth(currentDate.getMonth() - 1);
    return previousMonth;
  }

  public static getNextMonth(currentDate: Date): Date {
    const nextMonth = new Date(currentDate);
    nextMonth.setMonth(currentDate.getMonth() + 1);
    return nextMonth;
  }

  // Formatage des périodes
  public static formatWeekPeriod(weekStart: Date, weekEnd: Date): string {
    try {
      const startStr = weekStart.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short' 
      });
      const endStr = weekEnd.toLocaleDateString('fr-FR', { 
        day: 'numeric', 
        month: 'short',
        year: 'numeric'
      });
      
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${weekStart.getDate()}-${endStr}`;
      } else {
        return `${startStr} - ${endStr}`;
      }
    } catch (error) {
      return 'Semaine';
    }
  }

  public static formatMonthPeriod(date: Date): string {
    try {
      return date.toLocaleDateString('fr-FR', { 
        month: 'long', 
        year: 'numeric' 
      });
    } catch (error) {
      return 'Mois';
    }
  }

  // Limitations de navigation (optionnel)
  public static canNavigateToPreviousWeek(currentWeekStart: Date): boolean {
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 1); // 1 an en arrière max
    return currentWeekStart > minDate;
  }

  public static canNavigateToNextWeek(currentWeekStart: Date): boolean {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1); // 1 an en avant max
    return currentWeekStart < maxDate;
  }

  public static canNavigateToPreviousMonth(currentDate: Date): boolean {
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 1);
    return currentDate > minDate;
  }

  public static canNavigateToNextMonth(currentDate: Date): boolean {
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() + 1);
    return currentDate < maxDate;
  }

  public static clearCache(): void {
    console.log('🗑️ Cache des événements effacé');
    this.cachedEvents = null;
    this.lastFetch = 0;
  }
}