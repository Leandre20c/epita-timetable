// services/ICSParser.ts
import { CalendarEvent } from '../types/CalendarType';

export class ICSParser {
  public static parseICS(icsContent: string): CalendarEvent[] {
    const events: CalendarEvent[] = [];
    const lines = icsContent.split(/\r?\n/);
    
    let currentEvent: Partial<CalendarEvent> | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Handle line folding (RFC 5545)
      while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
        i++;
        line += lines[i].substring(1);
      }
      
      if (line === 'BEGIN:VEVENT') {
        currentEvent = {
          id: Date.now().toString() + Math.random(),
          summary: '',
          description: '',
          location: '',
          startTime: new Date(),
          endTime: new Date(),
          allDay: false
        };
      } else if (line === 'END:VEVENT' && currentEvent) {
        if (currentEvent.summary && currentEvent.startTime && currentEvent.endTime) {
          events.push(currentEvent as CalendarEvent);
        }
        currentEvent = null;
      } else if (currentEvent && line.includes(':')) {
        const colonIndex = line.indexOf(':');
        if (colonIndex === -1) continue;
        
        const property = line.substring(0, colonIndex);
        const value = line.substring(colonIndex + 1);
        
        try {
          switch (property) {
            case 'UID':
              currentEvent.id = value || currentEvent.id;
              break;
            case 'SUMMARY':
              currentEvent.summary = this.decodeText(value);
              break;
            case 'DESCRIPTION':
              currentEvent.description = this.decodeText(value);
              break;
            case 'LOCATION':
              currentEvent.location = this.decodeText(value);
              break;
            case 'DTSTART':
            case 'DTSTART;VALUE=DATE':
              currentEvent.startTime = this.parseDateTime(value);
              currentEvent.allDay = property.includes('VALUE=DATE');
              break;
            case 'DTEND':
            case 'DTEND;VALUE=DATE':
              currentEvent.endTime = this.parseDateTime(value);
              break;
          }
        } catch (error) {
          console.warn('Erreur parsing propriété:', property, value, error);
        }
      }
    }
    
    return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  private static parseDateTime(dateTimeString: string): Date {
    try {
      if (!dateTimeString) return new Date();
      
      // Remove timezone info if present (Z, +XX:XX, etc.)
      const cleanDateTime = dateTimeString.replace(/[Z]$/, '').split(/[+-]/)[0];
      
      if (cleanDateTime.length === 8) {
        // Date only format: YYYYMMDD
        const year = parseInt(cleanDateTime.substring(0, 4));
        const month = parseInt(cleanDateTime.substring(4, 6)) - 1;
        const day = parseInt(cleanDateTime.substring(6, 8));
        return new Date(year, month, day);
      } else if (cleanDateTime.length >= 15) {
        // DateTime format: YYYYMMDDTHHMMSS
        const year = parseInt(cleanDateTime.substring(0, 4));
        const month = parseInt(cleanDateTime.substring(4, 6)) - 1;
        const day = parseInt(cleanDateTime.substring(6, 8));
        const hour = parseInt(cleanDateTime.substring(9, 11));
        const minute = parseInt(cleanDateTime.substring(11, 13));
        const second = parseInt(cleanDateTime.substring(13, 15)) || 0;
        
        // Use UTC if original string ended with Z
        if (dateTimeString.endsWith('Z')) {
          return new Date(Date.UTC(year, month, day, hour, minute, second));
        } else {
          return new Date(year, month, day, hour, minute, second);
        }
      }
    } catch (error) {
      console.warn('Erreur lors du parsing de la date:', dateTimeString, error);
    }
    
    return new Date();
  }

  private static decodeText(text: string): string {
    if (!text) return '';
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\')
      .trim();
  }

  public static formatDate(date: Date): string {
    try {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return date.toDateString();
    }
  }

  public static formatTime(date: Date): string {
    try {
      return date.toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
    }
  }

  public static isSameDay(date1: Date, date2: Date): boolean {
    try {
      return date1.getFullYear() === date2.getFullYear() &&
             date1.getMonth() === date2.getMonth() &&
             date1.getDate() === date2.getDate();
    } catch (error) {
      return false;
    }
  }
}