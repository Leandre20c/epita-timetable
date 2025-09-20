// components/EventCard.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ICSParser } from '../services/ICSParser';
import { CalendarEvent } from '../types/CalendarType';

interface EventCardProps {
  event: CalendarEvent;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const getDuration = () => {
    const diffMs = event.endTime.getTime() - event.startTime.getTime();
    const diffMinutes = Math.round(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    if (hours > 0) {
      return minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`;
    }
    return `${minutes}min`;
  };

  const getTimeUntil = () => {
    const now = new Date();
    const diffMs = event.startTime.getTime() - now.getTime();
    
    if (diffMs < 0) {
      // Event has started
      const endDiffMs = event.endTime.getTime() - now.getTime();
      if (endDiffMs > 0) {
        return 'En cours';
      }
      return 'Terminé';
    }
    
    const diffMinutes = Math.round(diffMs / 60000);
    const diffHours = Math.round(diffMs / 3600000);
    const diffDays = Math.round(diffMs / 86400000);
    
    if (diffMinutes < 60) {
      return `Dans ${diffMinutes}min`;
    } else if (diffHours < 24) {
      return `Dans ${diffHours}h`;
    } else {
      return `Dans ${diffDays}j`;
    }
  };

  const isCurrentEvent = () => {
    const now = new Date();
    return now >= event.startTime && now <= event.endTime;
  };

  const isUpcoming = () => {
    const now = new Date();
    const diffMs = event.startTime.getTime() - now.getTime();
    return diffMs > 0 && diffMs <= 3600000; // Within 1 hour
  };

  return (
    <View style={[
      styles.container,
      isCurrentEvent() && styles.currentEvent,
      isUpcoming() && styles.upcomingEvent
    ]}>
      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>
          {event.summary}
        </Text>
        <Text style={[
          styles.status,
          isCurrentEvent() && styles.currentStatus
        ]}>
          {getTimeUntil()}
        </Text>
      </View>
      
      <View style={styles.details}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>
            🕐 {ICSParser.formatTime(event.startTime)} - {ICSParser.formatTime(event.endTime)}
          </Text>
          <Text style={styles.duration}>
            ({getDuration()})
          </Text>
        </View>
        
        {event.location && (
          <Text style={styles.location} numberOfLines={1}>
            📍 {event.location}
          </Text>
        )}
        
        {event.description && (
          <Text style={styles.description} numberOfLines={3}>
            {event.description}
          </Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    borderLeftWidth: 4,
    borderLeftColor: '#e9ecef',
  },
  currentEvent: {
    borderLeftColor: '#e74c3c',
    backgroundColor: '#fff5f5',
  },
  upcomingEvent: {
    borderLeftColor: '#f39c12',
    backgroundColor: '#fffbf0',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    flex: 1,
    marginRight: 8,
    lineHeight: 22,
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7f8c8d',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  currentStatus: {
    backgroundColor: '#e74c3c',
    color: '#ffffff',
  },
  details: {
    gap: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2c3e50',
  },
  duration: {
    fontSize: 12,
    color: '#7f8c8d',
    marginLeft: 8,
  },
  location: {
    fontSize: 13,
    color: '#7f8c8d',
  },
  description: {
    fontSize: 13,
    color: '#7f8c8d',
    lineHeight: 18,
    marginTop: 4,
  },
});