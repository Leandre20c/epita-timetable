// services/CalendarService.ts
import { CalendarEvent, DaySchedule, WeekSchedule } from '../types/CalendarTypes';
import { ICSParser } from './ICSParser';
import { UserPreferencesService } from './UserPreferencesService';

export class CalendarService {
  // URL de l'ICS global contenant TOUS les groupes
  private static readonly ICS_BASE_URL = 'https://zeus.ionis-it.com/api/group/1/ics/q2GXJsFwfL';
  
  // Fallback vers ton ancien lien si aucun groupe n'est sélectionné
  private static readonly FALLBACK_ICS_URL = 'https://zeus.ionis-it.com/api/group/203/ics/q2GXJsFwfL?startDate=2025-09-01';
  
  private static cachedEvents: CalendarEvent[] | null = null;
  private static lastFetch: number = 0;
  private static readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  private static currentGroupId: string | null = null;

  /**
   * Fetch et filtre les événements selon le groupe sélectionné
   */
  public static async fetchSchedule(): Promise<CalendarEvent[]> {
    const now = Date.now();
    const selectedGroup = await UserPreferencesService.getSelectedGroup();
    
    // Invalider le cache si le groupe a changé
    if (selectedGroup !== this.currentGroupId) {
      console.log('🔄 Groupe changé, invalidation du cache');
      this.cachedEvents = null;
      this.currentGroupId = selectedGroup;
    }
    
    // Return cached data if still valid
    if (this.cachedEvents && (now - this.lastFetch) < this.CACHE_DURATION) {
      console.log('📋 Utilisation du cache pour les événements');
      return this.cachedEvents;
    }

    try {
      console.log('🔄 Chargement des événements depuis l\'API...');
      
      // Choisir l'URL selon si un groupe est sélectionné
      const icsUrl = selectedGroup ? this.ICS_BASE_URL : this.FALLBACK_ICS_URL;
      console.log('🌐 URL utilisée:', icsUrl);
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15s timeout
      
      const response = await fetch(icsUrl, {
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
      
      let allEvents = ICSParser.parseICS(icsContent);
      
      // Filtrer par groupe si un groupe est sélectionné
      if (selectedGroup) {
        console.log(`🔍 Filtrage des événements pour le groupe: ${selectedGroup}`);
        allEvents = this.filterEventsByGroup(allEvents, selectedGroup);
        console.log(`✅ ${allEvents.length} événements après filtrage`);
      }
      
      this.cachedEvents = allEvents;
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
      
      console.log('📭 Retour d\'un tableau vide');
      return [];
    }
  }

  /**
   * Filtre les événements pour ne garder que ceux du groupe spécifié
   */
  private static filterEventsByGroup(events: CalendarEvent[], groupId: string): CalendarEvent[] {
    return events.filter(event => {
      const text = `${event.summary || ''} ${event.description || ''}`;
      // Cherche le groupId dans le texte de l'événement
      return text.toUpperCase().includes(groupId.toUpperCase());
    });
  }

  /**
   * Force le rechargement des événements (utile après changement de groupe)
   */
  public static async refreshSchedule(): Promise<CalendarEvent[]> {
    this.cachedEvents = null;
    this.lastFetch = 0;
    return this.fetchSchedule();
  }

  /**
   * Invalide le cache (utile après changement de groupe)
   */
  public static clearCache(): void {
    this.cachedEvents = null;
    this.lastFetch = 0;
    this.currentGroupId = null;
    console.log('🗑️ Cache du calendrier invalidé');
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

  // Méthode pour récupérer les événements d'aujourd'hui
  public static async getTodayEvents(): Promise<CalendarEvent[]> {
    return this.getEventsForDate(new Date());
  }

  // Méthode pour récupérer les événements à venir
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

  // Méthode pour récupérer une semaine d'événements
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
        
        const dateString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
        
        weekSchedule.push({
          date: dateString,
          events: dayEvents
        });
      }
      
      return weekSchedule;
    } catch (error) {
      console.error('Erreur getEventsForWeek:', error);
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
        
        const dateString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}`;
        
        days.push({
          date: dateString,
          events: dayEvents
        });
      }
      
      const weekLabel = `${weekStart.getDate()} ${this.getMonthName(weekStart)} - ${weekEnd.getDate()} ${this.getMonthName(weekEnd)} ${weekEnd.getFullYear()}`;
      
      return {
        weekStart: weekStart.toISOString(),
        weekEnd: weekEnd.toISOString(),
        weekLabel,
        days
      };
    } catch (error) {
      console.error('Erreur getWeekSchedule:', error);
      return {
        weekStart: weekStartDate.toISOString(),
        weekEnd: weekStartDate.toISOString(),
        weekLabel: '',
        days: []
      };
    }
  }

  // Helper methods
  public static getWeekStart(date: Date): Date {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    return new Date(d.setDate(diff));
  }

  public static getNextWeek(currentWeekStart: Date): Date {
    const nextWeek = new Date(currentWeekStart);
    nextWeek.setDate(currentWeekStart.getDate() + 7);
    return nextWeek;
  }

  public static getPreviousWeek(currentWeekStart: Date): Date {
    const previousWeek = new Date(currentWeekStart);
    previousWeek.setDate(currentWeekStart.getDate() - 7);
    return previousWeek;
  }

  private static getMonthName(date: Date): string {
    const months = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin', 'Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc'];
    return months[date.getMonth()];
  }
} 