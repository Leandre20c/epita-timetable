// types/CalendarTypes.ts

export interface CalendarEvent {
  id: string;
  title: string;
  summary: string;
  subject: string;
  type: string; // TD, TP, CM, etc.
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  color?: string;
  allDay?: boolean;
}

export interface DaySchedule {
  date: string; // Format YYYY-MM-DD
  dayName: string; // Ex: "lundi", "mardi"
  events: CalendarEvent[];
}

export interface WeekSchedule {
  weekStart: Date;
  weekEnd: Date;
  days: DaySchedule[];
}

export interface MonthSchedule {
  month: number;
  year: number;
  weeks: WeekSchedule[];
  events: CalendarEvent[];
}

export type ViewType = 'day' | 'week' | 'month';