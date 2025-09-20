// app/(tabs)/index.tsx
import React, { useEffect, useState } from 'react';
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
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventCard } from '../../components/EventCard';
import { CalendarService } from '../../services/CalendarService';
import { CalendarEvent } from '../../types/CalendarTypes';

export default function DayScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadDayData = async (date: Date) => {
    try {
      setIsLoading(true);
      console.log('🔄 Chargement du jour:', date.toLocaleDateString('fr-FR'));
      
      const dayEvents = await CalendarService.getEventsForDate(date);
      setEvents(dayEvents);
      
      console.log('✅ Jour chargé avec', dayEvents.length, 'événements');
    } catch (error) {
      console.error('❌ Erreur lors du chargement du jour:', error);
      Alert.alert('Erreur', 'Impossible de charger les événements du jour');
      setEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDayData(currentDate);
  }, [currentDate]);

  const handleRefresh = () => {
    CalendarService.clearCache();
    loadDayData(currentDate);
  };

  const handlePrevious = () => {
    const previousDay = new Date(currentDate);
    previousDay.setDate(currentDate.getDate() - 1);
    setCurrentDate(previousDay);
  };

  const handleNext = () => {
    const nextDay = new Date(currentDate);
    nextDay.setDate(currentDate.getDate() + 1);
    setCurrentDate(nextDay);
  };

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
        month: 'long',
        year: 'numeric'
      });
    } catch (error) {
      return 'Jour';
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
      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
          <Text style={styles.navButtonText}>← Précédente</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={handleNext}>
          <Text style={styles.navButtonText}>Prochaine →</Text>
        </TouchableOpacity>
      </View>

      {/* En-tête de la journée */}
      <View style={[styles.dayHeader, isToday() && styles.todayHeader]}>
        <Text style={[styles.dayTitle, isToday() && styles.todayTitle]}>
          {formatDayLabel()}
        </Text>
        <Text style={styles.eventCount}>
          {events.length} cours{events.length > 1 ? '' : ''}
        </Text>
      </View>

      {/* Contenu */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
      >
        {events.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Aucun cours</Text>
            <Text style={styles.emptySubtitle}>
              {isToday() ? 'Profitez de votre journée libre !' : 'Pas de cours prévu ce jour-là'}
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
  navigationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  navButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef'
  },
  navButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#495057'
  },
  dayHeader: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center'
  },
  todayHeader: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
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
  }
});