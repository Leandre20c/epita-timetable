// types/CalendarTypes.ts
export interface CalendarEvent {
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

export type TabType = 'today' | 'next';

export interface TabItem {
  key: TabType;
  label: string;
  badge?: number;
}