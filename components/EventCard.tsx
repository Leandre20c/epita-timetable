// components/EventCard.tsx
import { Clock, MapPin } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ICSParser } from '../services/ICSParser';
import SubjectColorService from '../services/SubjectColorService';
import { COLORS, SPACING } from '../styles/screenStyles';
import { CalendarEvent } from '../types/CalendarTypes';
import { EventDetailModal } from './EventDetailModal';

interface EventCardProps {
  event: CalendarEvent;
  variant?: 'default' | 'compact'; // 'default' pour index (elevation 3), 'compact' pour week (elevation 0)
  onColorChanged?: (eventId?: string) => void;
}

export const EventCard: React.FC<EventCardProps> = React.memo(({ 
  event, 
  variant = 'default',
  onColorChanged 
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [colorKey, setColorKey] = useState(0); // Simple compteur pour forcer le re-render

  // Écouter les changements de couleurs avec un effect simple
  useEffect(() => {
    const unsubscribe = SubjectColorService.addListener(() => {
      // Forcer immédiatement le re-render en changeant la clé
      setColorKey(prev => prev + 1);
    });

    return unsubscribe;
  }, [event.summary]);

  // Forcer une mise à jour quand le modal se ferme
  useEffect(() => {
    if (!isModalVisible) {
      // Le modal vient de se fermer, forcer la mise à jour de la couleur
      setColorKey(prev => prev + 1);
    }
  }, [isModalVisible, event.summary]);

  // Mémoisation des calculs coûteux
  const eventData = useMemo(() => {
    
    const now = new Date();
    const startTime = event.startTime.getTime();
    const endTime = event.endTime.getTime();
    const currentTime = now.getTime();
    
    // Calcul de la durée
    const diffMs = endTime - startTime;
    const diffMinutes = Math.round(diffMs / 60000);
    const hours = Math.floor(diffMinutes / 60);
    const minutes = diffMinutes % 60;
    
    const duration = hours > 0 
      ? (minutes > 0 ? `${hours}h${minutes}min` : `${hours}h`)
      : `${minutes}min`;

    // Statut de l'événement
    let timeUntil: string;
    let isCurrentEvent = false;
    let isUpcoming = false;

    if (currentTime >= startTime && currentTime <= endTime) {
      timeUntil = 'En cours';
      isCurrentEvent = true;
    } else if (currentTime > endTime) {
      timeUntil = 'Terminé';
    } else {
      const diffToStart = startTime - currentTime;
      if (diffToStart <= 3600000) { // Dans l'heure
        isUpcoming = true;
      }
      
      const diffMinutes = Math.round(diffToStart / 60000);
      const diffHours = Math.round(diffToStart / 3600000);
      const diffDays = Math.round(diffToStart / 86400000);
      
      if (diffMinutes < 60) {
        timeUntil = `Dans ${diffMinutes}min`;
      } else if (diffHours < 24) {
        timeUntil = `Dans ${diffHours}h`;
      } else {
        timeUntil = `Dans ${diffDays}j`;
      }
    }

    // Couleur de la matière (TOUJOURS recalculée grâce à colorKey)
    const subjectColor = SubjectColorService.getColorBySubjectName(event.summary);

    // Formatage des heures
    const startTimeFormatted = ICSParser.formatTime(event.startTime);
    const endTimeFormatted = ICSParser.formatTime(event.endTime);

    return {
      duration,
      timeUntil,
      isCurrentEvent,
      isUpcoming,
      subjectColor,
      startTimeFormatted,
      endTimeFormatted
    };
  }, [event.startTime, event.endTime, event.summary, colorKey]); // colorKey force le recalcul

  // Style de la carte mémorisé avec variant
  const cardStyle = useMemo(() => {
    // Choisir le style de base selon le variant
    const baseCardStyle = variant === 'compact' ? styles.compactCard : styles.defaultCard;
    
    const style = [
      baseCardStyle,
      { borderLeftColor: eventData.subjectColor },
      eventData.isCurrentEvent && styles.currentEvent,
      eventData.isUpcoming && styles.upcomingEvent
    ];
    return style;
  }, [eventData.subjectColor, eventData.isCurrentEvent, eventData.isUpcoming, variant]);

  const handleCardPress = () => {
    setIsModalVisible(true);
  };

  const handleColorChanged = () => {
    onColorChanged?.(event.id || event.summary);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
    setColorKey(prev => prev + 1);
  };

  return (
    <>
      <TouchableOpacity 
        style={cardStyle}
        onPress={handleCardPress}
        activeOpacity={0.7}
      >
        <View style={styles.cardContent}>
          <Text style={styles.eventTitle} numberOfLines={2}>
            {event.summary}
          </Text>
          <Text style={[
            styles.status,
            eventData.isCurrentEvent && styles.currentStatus
          ]}>
            {eventData.timeUntil}
          </Text>
        </View>
        
        <View style={styles.details}>
          <View style={styles.timeContainer}>
            <Text style={styles.eventTime}>
              <Clock size={15} color={COLORS.primary} /> {eventData.startTimeFormatted} - {eventData.endTimeFormatted}
            </Text>
            <Text style={styles.duration}>
              ({eventData.duration})
            </Text>
          </View>
          
          {event.location && (
            <Text style={styles.eventLocation} numberOfLines={1}>
              <MapPin size={15} color={COLORS.light.text.secondary} /> {event.location}
            </Text>
          )}
          
          {event.description && (
            <Text style={styles.description} numberOfLines={3}>
              {event.description}
            </Text>
          )}
        </View>
      </TouchableOpacity>

      {/* Modal de détail */}
      <EventDetailModal
        event={event}
        isVisible={isModalVisible}
        onClose={handleModalClose}
        onColorChanged={handleColorChanged}
      />
    </>
  );
});

EventCard.displayName = 'EventCard';

// Styles spécifiques à EventCard
const styles = StyleSheet.create({
  // Style par défaut (pour index) - avec elevation
  defaultCard: {
    backgroundColor: COLORS.light.cardBackground,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 3, // Elevation pour vue index
    borderLeftWidth: 4,
  },
  
  // Style compact (pour week/month) - sans elevation
  compactCard: {
    backgroundColor: COLORS.light.cardBackground,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 0, // Pas d'elevation pour vues week/month
    borderLeftWidth: 4,
  },
  
  cardContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  
  eventTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.light.text.primary,
    flex: 1,
    marginRight: SPACING.sm,
    lineHeight: 22,
  },
  
  eventTime: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary, // Bleu pour l'heure (info importante)
  },
  
  eventLocation: {
    fontSize: 13,
    color: COLORS.light.text.secondary,
  },
  
  currentEvent: {
    backgroundColor: COLORS.blue[50], // Background bleu très clair
  },
  
  upcomingEvent: {
    backgroundColor: COLORS.blue[50], // Background bleu très clair
  },
  
  status: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.light.text.secondary,
    backgroundColor: COLORS.light.surface,
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
    color: COLORS.light.text.secondary,
    marginLeft: SPACING.sm,
  },
  
  description: {
    fontSize: 13,
    color: COLORS.light.text.secondary,
    lineHeight: 18,
    marginTop: SPACING.xs,
  },
});