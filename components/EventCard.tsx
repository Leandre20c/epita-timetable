// components/EventCard.tsx
import { Clock, MapPin } from 'lucide-react-native';
import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ICSParser } from '../services/ICSParser';
import SubjectColorService from '../services/SubjectColorService';
import { COLORS, screenStyles, SPACING } from '../styles/screenStyles';
import { CalendarEvent } from '../types/CalendarTypes';
import { EventDetailModal } from './EventDetailModal';

interface EventCardProps {
  event: CalendarEvent;
  onColorChanged?: (eventId?: string) => void; // Ajouter le paramètre optionnel
}

export const EventCard: React.FC<EventCardProps> = React.memo(({ 
  event, 
  onColorChanged 
}) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [colorKey, setColorKey] = useState(0); // Simple compteur pour forcer le re-render

  // Écouter les changements de couleurs avec un effect simple
  useEffect(() => {
    const unsubscribe = SubjectColorService.addListener(() => {
      // Forcer immédiatement le re-render en changeant la clé
      setColorKey(prev => prev + 1);
      console.log('🔄 EventCard re-render forcé pour:', event.summary);
    });

    return unsubscribe;
  }, [event.summary]);

  // Forcer une mise à jour quand le modal se ferme
  useEffect(() => {
    if (!isModalVisible) {
      // Le modal vient de se fermer, forcer la mise à jour de la couleur
      setColorKey(prev => prev + 1);
      console.log('🔄 Modal fermé, mise à jour couleur pour:', event.summary);
    }
  }, [isModalVisible, event.summary]);

  // Mémoisation des calculs coûteux
  const eventData = useMemo(() => {
    console.log(`🎨 Calcul couleur pour "${event.summary}" (key: ${colorKey})`);
    
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
    console.log(`🎨 Couleur calculée: ${subjectColor} pour "${event.summary}"`);

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

  // Style de la carte mémorisé
  const cardStyle = useMemo(() => {
    const style = [
      screenStyles.eventCard,
      { borderLeftColor: eventData.subjectColor },
      eventData.isCurrentEvent && styles.currentEvent,
      eventData.isUpcoming && styles.upcomingEvent
    ];
    console.log(`🎨 Style appliqué avec couleur: ${eventData.subjectColor}`);
    return style;
  }, [eventData.subjectColor, eventData.isCurrentEvent, eventData.isUpcoming]);

  const handleCardPress = () => {
    setIsModalVisible(true);
  };

  const handleColorChanged = () => {
    console.log('Couleur changée pour:', event.summary);
    // Passer l'ID de cet événement pour l'exclure du re-render
    onColorChanged?.(event.id || event.summary);
  };

  const handleModalClose = () => {
    console.log('Modal fermé, forcing color update pour:', event.summary);
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
        <View style={screenStyles.eventCardContent}>
          <Text style={screenStyles.eventTitle} numberOfLines={2}>
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
            <Text style={screenStyles.eventTime}>
              <Clock size={15} color="#7f8c8d" /> {eventData.startTimeFormatted} - {eventData.endTimeFormatted}
            </Text>
            <Text style={styles.duration}>
              ({eventData.duration})
            </Text>
          </View>
          
          {event.location && (
            <Text style={screenStyles.eventLocation} numberOfLines={1}>
              <MapPin size={15} color="#7f8c8d" /> {event.location}
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
  currentEvent: {
    backgroundColor: '#fff5f5',
  },
  upcomingEvent: {
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