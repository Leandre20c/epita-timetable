// types/CalendarTypes.ts
export interface CalendarEvent {
  title: string;
  id: string;
  summary: string;
  description?: string;
  location?: string;
  startTime: Date;
  endTime: Date;
  allDay?: boolean;
}

export interface DaySchedule {
  date: string; // Format YYYY-MM-DD
  events: CalendarEvent[];
}

export interface WeekSchedule {
  weekStart: Date;
  weekEnd: Date;
  days: DaySchedule[];
}

export interface MonthSchedule {
  month: number; // 0-11
  year: number;
  weeks: WeekSchedule[];
  events: CalendarEvent[];
}

export type ViewType = 'day' | 'week' | 'month';