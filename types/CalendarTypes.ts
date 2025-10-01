// types/CalendarTypes.ts
export interface CalendarEvent {
  id: string;
  title: string;
  summary: string;
  subject: string;      // ✅ Ajouté
  type: string;         // ✅ Ajouté (TD, TP, CM, etc.)
  description?: string;
  location?: string;
  startTime: Date;      // Garde startTime (pas start)
  endTime: Date;        // Garde endTime (pas end)
  color?: string;       // ✅ Ajouté
  allDay?: boolean;
}

export interface DaySchedule {
  date: string;
  events: CalendarEvent[];
}

export interface WeekSchedule {
  weekStart: string;
  weekEnd: string;
  weekLabel: string;
  days: DaySchedule[];
}

export interface MonthSchedule {
  month: number;
  year: number;
  weeks: WeekSchedule[];
  events: CalendarEvent[];
}

export type ViewType = 'day' | 'week' | 'month';