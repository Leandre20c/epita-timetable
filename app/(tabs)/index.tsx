// app/(tabs)/index.tsx
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventCard } from '../../components/EventCard';
import { CalendarService } from '../../services/CalendarService';
import { CalendarEvent } from '../../types/CalendarTypes';


import { useSwipeNavigation } from '../../hook/useSwipeNavigation';

export default function DayScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // évenements préchargés pour les jours voisins
  const [preloadedEvents, setPreloadedEvents] = useState<{
    [key: string]: CalendarEvent[]
  }>({});

  const formatDateKey = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const preloadAdjacentDays = useCallback(async (centerDate: Date) => {
    const previousDay = new Date(centerDate);
    previousDay.setDate(centerDate.getDate() - 1);
    
    const nextDay = new Date(centerDate);
    nextDay.setDate(centerDate.getDate() + 1);

    const previousKey = formatDateKey(previousDay);
    const nextKey = formatDateKey(nextDay);

    // Précharger seulement si pas déjà en cache
    const preloadPromises = [];
    
    if (!preloadedEvents[previousKey]) {
      preloadPromises.push(
        CalendarService.getEventsForDate(previousDay).then(events => 
          setPreloadedEvents(prev => ({ ...prev, [previousKey]: events }))
        )
      );
    }
    
    if (!preloadedEvents[nextKey]) {
      preloadPromises.push(
        CalendarService.getEventsForDate(nextDay).then(events => 
          setPreloadedEvents(prev => ({ ...prev, [nextKey]: events }))
        )
      );
    }

    // Lancer les préchargements en arrière-plan
    Promise.all(preloadPromises).catch(error => 
      console.warn('Erreur préchargement:', error)
    );
  }, [preloadedEvents]);

  const loadDayData = async (date: Date) => {
    try {
      setIsLoading(true);
      const dateKey = formatDateKey(date);
      
      let dayEvents: CalendarEvent[];
      
      if (preloadedEvents[dateKey]) {
        console.log('⚡ Utilisation du cache préchargé pour', dateKey);
        dayEvents = preloadedEvents[dateKey];
      } else {
        console.log('🔄 Chargement du jour:', date.toLocaleDateString('fr-FR'));
        dayEvents = await CalendarService.getEventsForDate(date);
        setPreloadedEvents(prev => ({ ...prev, [dateKey]: dayEvents }));
      }
      
      setEvents(dayEvents);
      
      setTimeout(() => preloadAdjacentDays(date), 100);
      console.log('✅ Jour chargé avec', dayEvents.length, 'événements');
    } catch (error) {
      console.error('❌ Erreur lors du chargement du jour:', error);
      Alert.alert('Erreur', 'Impossible de charger les événements du jour');
      setEvents([]);
    } finally {
      setIsLoading(false);
      setIsTransitioning(false); // Arrêter le loading de transition
    }
  };

  const handlePrevious = () => {
    setIsTransitioning(true);
    const previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 1);
    setCurrentDate(previousDay);
  };

  const handleNext = () => {
    setIsTransitioning(true);
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDay);
  };

  useEffect(() => {
    loadDayData(currentDate);
  }, [currentDate]);

  const handleRefresh = () => {
    CalendarService.clearCache();
    loadDayData(currentDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const { panGesture, translateX } = useSwipeNavigation({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    canSwipeLeft: true,
    canSwipeRight: true
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const formatDayLabel = (): string => {
    try {
      const today = new Date();
      const isToday = currentDate.toDateString() === today.toDateString();
      
      if (isToday) return 'Aujourd\'hui';
      
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 1);
      const isYesterday = currentDate.toDateString() === yesterday.toDateString();
      
      if (isYesterday) return 'Hier';
      
      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);
      const isTomorrow = currentDate.toDateString() === tomorrow.toDateString();
      
      if (isTomorrow) return 'Demain';
      
      return currentDate.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long'
      });
    } catch (error) {
      return 'Jour';
    }
  };

  const totalDayHours = (): number => {
    let totalMinutes = 0;
    
    for (let event of events) {
      const start = event.startTime;
      const end = event.endTime;
      
      // Calculer la différence en millisecondes puis convertir en minutes
      const durationMs = end.getTime() - start.getTime();
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      
      totalMinutes += durationMinutes;
    }
    
    return totalMinutes;
  };

  // Fonction pour formater les minutes en format lisible
  const formatTotalHours = (): string => {
    const totalMinutes = totalDayHours();
    
    if (totalMinutes === 0) {
      return 'Pas';
    }
    
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    if (hours === 0) {
      return `${minutes} ${minutes > 1 ? 'minutes' : 'minute'}`;
    } else if (minutes === 0) {
      return `${hours} ${hours > 1 ? 'heures' : 'heure'}`;
    } else {
      return `${hours} ${hours > 1 ? 'heures' : 'heure'} et ${minutes} ${minutes > 1 ? 'minutes' : 'minute'}`;
    }
  };
    
  const isToday = (): boolean => {
    return currentDate.toDateString() === new Date().toDateString();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Chargement du jour...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ flex: 1 }}>
        {/* En-tête - EN DEHORS du GestureDetector */}
        {/* En-tête cliquable pour aller à aujourd'hui */}
        <TouchableOpacity 
          style={[styles.dayHeader, isToday() && styles.todayHeader]}
          onPress={handleToday}
          activeOpacity={0.7}
        >
          <Text style={[styles.dayTitle, isToday() && styles.todayTitle]}>
            {formatDayLabel()}
          </Text>
          <Text style={styles.eventCount}>
            {formatTotalHours()} de cours
          </Text>
        </TouchableOpacity>

        {/* Contenu avec swipe simple */}
        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            <ScrollView
              style={styles.scrollView}
              refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
            >
              {events.length === 0 ? (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyIcon}>☀️</Text>
                  <Text style={styles.emptyTitle}>Aucun cours</Text>
                  <Text style={styles.emptySubtitle}>
                    {isToday() ? 'Profitez de votre journée libre !' : 'Pas de cours prévu demain'}
                  </Text>
                </View>
              ) : (
                <View style={styles.eventsContainer}>
                  {events.map((event, index) => (
                    <EventCard key={event.id || `event-${index}`} event={event} />
                  ))}
                </View>
              )}
            </ScrollView>
          
          </Animated.View>
        </GestureDetector>
        
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa'
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d'
  },
  dayHeader: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
  },
  todayHeader: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 0,
    borderLeftColor: '#3498db'
  },
  dayTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textTransform: 'capitalize',
    textAlign: 'center'
  },
  todayTitle: {
    color: '#3498db'
  },
  eventCount: {
    fontSize: 16,
    color: '#7f8c8d',
    marginTop: 8
  },
  scrollView: {
    flex: 1
  },
  eventsContainer: {
    padding: 16
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 24
  },
});