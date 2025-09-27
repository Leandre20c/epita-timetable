// app/(tabs)/week.tsx
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
import { WeekSchedule } from '../../types/CalendarTypes';

export default function WeekScreen() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    CalendarService.getWeekStart(new Date())
  );
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadWeekData = async (weekStart: Date) => {
    try {
      setIsLoading(true);
      console.log('🔄 Chargement de la semaine');
      
      const schedule = await CalendarService.getWeekSchedule(weekStart);
      setWeekSchedule(schedule);
      
      const totalEvents = schedule.days.reduce((sum, day) => sum + day.events.length, 0);
      console.log('✅ Semaine chargée avec', totalEvents, 'événements');
    } catch (error) {
      console.error('❌ Erreur lors du chargement de la semaine:', error);
      Alert.alert('Erreur', 'Impossible de charger la semaine');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeekData(currentWeekStart);
  }, [currentWeekStart]);

  const handleRefresh = () => {
    CalendarService.clearCache();
    loadWeekData(currentWeekStart);
  };

  const handlePrevious = () => {
    const prevWeek = CalendarService.getPreviousWeek(currentWeekStart);
    setCurrentWeekStart(prevWeek);
  };

  const handleNext = () => {
    const nextWeek = CalendarService.getNextWeek(currentWeekStart);
    setCurrentWeekStart(nextWeek);
  };

  const getCurrentWeekLabel = (): string => {
    if (!weekSchedule) return 'Semaine';
    return CalendarService.formatWeekPeriod(weekSchedule.weekStart, weekSchedule.weekEnd);
  };

  const getTotalEvents = (): number => {
    if (!weekSchedule) return 0;
    return weekSchedule.days.reduce((sum, day) => sum + day.events.length, 0);
  };

  const isCurrentWeek = (): boolean => {
    const thisWeek = CalendarService.getWeekStart(new Date());
    return Math.abs(currentWeekStart.getTime() - thisWeek.getTime()) < 24 * 60 * 60 * 1000;
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Chargement de la semaine...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
          <Text style={styles.navButtonText}>◄</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={handleNext}>
          <Text style={styles.navButtonText}>►</Text>
        </TouchableOpacity>
      </View>

      {/* En-tête de la semaine */}
      <View style={[styles.weekHeader, isCurrentWeek() && styles.currentWeekHeader]}>
        <Text style={[styles.weekTitle, isCurrentWeek() && styles.currentWeekTitle]}>
          {getCurrentWeekLabel()} 
        </Text>
        <Text style={styles.eventCount}>
          {getTotalEvents()} cours{getTotalEvents() > 1 ? '' : ''}
        </Text>
      </View>

      {/* Contenu */}
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
      >
        {!weekSchedule || getTotalEvents() === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>☀️</Text>
            <Text style={styles.emptyTitle}>Aucun cours</Text>
            <Text style={styles.emptySubtitle}>
              {isCurrentWeek() ? 'Aucun cours prévu cette semaine\nVa trouver un travail au moins' : 'Aucun cours prévu cette semaine-là\nPrévois de réviser au moins'}
            </Text>
          </View>
        ) : (
          <View style={styles.eventsContainer}>
            {weekSchedule.days
              .filter(dayObj => dayObj.events.length > 0)
              .map((dayObj) => {
                // CORRECTION: Créer la date directement à partir des composants
                // au lieu d'utiliser new Date(day.date + 'T00:00:00') qui peut causer des décalages UTC
                const [year, month, dayNum] = dayObj.date.split('-').map(Number);
                const dayDate = new Date(year, month - 1, dayNum);
                
                const isToday = new Date().toDateString() === dayDate.toDateString();

                // Vérification que le jour fait partie de la semaine courante
                const isInCurrentWeek = dayDate >= weekSchedule.weekStart && 
                           dayDate <= weekSchedule.weekEnd;
                           
                if (!isInCurrentWeek) return null;
                
                return (
                  <View key={dayObj.date} style={[styles.daySection, isToday && styles.todaySection]}>
                    <Text style={[styles.dayTitle, isToday && styles.todayTitle]}>
                      {dayDate.toLocaleDateString('fr-FR', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'short' 
                      })}
                      {isToday && ' (Aujourd\'hui)'}
                    </Text>
                    
                    {dayObj.events.map((event, index) => (
                      <EventCard key={event.id || `event-${index}`} event={event} />
                    ))}
                  </View>
                );
              })}
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
  weekHeader: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center'
  },
  currentWeekHeader: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3498db'
  },
  weekTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textTransform: 'capitalize',
    textAlign: 'center'
  },
  currentWeekTitle: {
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
  daySection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5
  },
  todaySection: {
    borderWidth: 2,
    borderColor: '#3498db'
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 12,
    textTransform: 'capitalize'
  },
  todayTitle: {
    color: '#3498db'
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