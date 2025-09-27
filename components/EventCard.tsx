// components/EventCard.tsx
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ICSParser } from '../services/ICSParser';
import { COLORS, screenStyles, SPACING } from '../styles/screenStyles';
import { CalendarEvent } from '../types/CalendarTypes';

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
      screenStyles.eventCard,
      isCurrentEvent() && styles.currentEvent,
      isUpcoming() && styles.upcomingEvent
    ]}>
      <View style={screenStyles.eventCardContent}>
        <Text style={screenStyles.eventTitle} numberOfLines={2}>
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
          <Text style={screenStyles.eventTime}>
            🕐 {ICSParser.formatTime(event.startTime)} - {ICSParser.formatTime(event.endTime)}
          </Text>
          <Text style={styles.duration}>
            ({getDuration()})
          </Text>
        </View>
        
        {event.location && (
          <Text style={screenStyles.eventLocation} numberOfLines={1}>
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

// Styles spécifiques à EventCard qui ne sont pas dans le système centralisé
const styles = StyleSheet.create({
  currentEvent: {
    borderLeftColor: COLORS.danger,
    backgroundColor: '#fff5f5',
  },
  upcomingEvent: {
    borderLeftColor: COLORS.warning,
    backgroundColor: '#fffbf0',
  },
  status: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.secondary,
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: 12,
  },
  currentStatus: {
    backgroundColor: COLORS.danger,
    color: '#ffffff',
  },
  details: {
    gap: 6,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  duration: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginLeft: SPACING.sm,
  },
  description: {
    fontSize: 13,
    color: COLORS.text.secondary,
    lineHeight: 18,
    marginTop: SPACING.xs,
  },
});