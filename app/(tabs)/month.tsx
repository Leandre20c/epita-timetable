// app/(tabs)/month.tsx
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
import { MonthSchedule } from '../../types/CalendarTypes';

export default function MonthScreen() {
  const [currentMonth, setCurrentMonth] = useState(() => new Date());
  const [monthSchedule, setMonthSchedule] = useState<MonthSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadMonthData = async (monthDate: Date) => {
    try {
      setIsLoading(true);
      console.log('🔄 Chargement du mois');
      
      const schedule = await CalendarService.getMonthSchedule(monthDate);
      setMonthSchedule(schedule);
      
      console.log('✅ Mois chargé avec', schedule.events.length, 'événements');
    } catch (error) {
      console.error('❌ Erreur lors du chargement du mois:', error);
      Alert.alert('Erreur', 'Impossible de charger le mois');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadMonthData(currentMonth);
  }, [currentMonth]);

  const handleRefresh = () => {
    CalendarService.clearCache();
    loadMonthData(currentMonth);
  };

  const handlePrevious = () => {
    const prevMonth = CalendarService.getPreviousMonth(currentMonth);
    setCurrentMonth(prevMonth);
  };

  const handleNext = () => {
    const nextMonth = CalendarService.getNextMonth(currentMonth);
    setCurrentMonth(nextMonth);
  };

  const getCurrentMonthLabel = (): string => {
    return CalendarService.formatMonthPeriod(currentMonth);
  };

  const getTotalEvents = (): number => {
    if (!monthSchedule) return 0;
    return monthSchedule.events.length;
  };

  const isCurrentMonth = (): boolean => {
    const today = new Date();
    return currentMonth.getFullYear() === today.getFullYear() && 
           currentMonth.getMonth() === today.getMonth();
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Chargement du mois...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Navigation */}
      <View style={styles.navigationContainer}>
        <TouchableOpacity style={styles.navButton} onPress={handlePrevious}>
          <Text style={styles.navButtonText}>← Précédent</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={handleNext}>
          <Text style={styles.navButtonText}>Prochain →</Text>
        </TouchableOpacity>
      </View>

      {/* En-tête du mois */}
      <View style={[styles.monthHeader, isCurrentMonth() && styles.currentMonthHeader]}>
        <Text style={[styles.monthTitle, isCurrentMonth() && styles.currentMonthTitle]}>
          {getCurrentMonthLabel()}
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
        {!monthSchedule || getTotalEvents() === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyIcon}>📅</Text>
            <Text style={styles.emptyTitle}>Aucun cours</Text>
            <Text style={styles.emptySubtitle}>
              {isCurrentMonth() ? 'Aucun cours prévu ce mois-ci' : 'Aucun cours prévu ce mois-là'}
            </Text>
          </View>
        ) : (
          <View style={styles.eventsContainer}>
            {monthSchedule.weeks.map((week, weekIndex) => {
              // Filtrer les jours qui ont des événements et appartiennent au mois courant
              const daysWithEvents = week.days.filter(day => {
                const dayDate = new Date(day.date + 'T00:00:00');
                const isCurrentMonthDay = dayDate.getMonth() === monthSchedule.month && 
                                        dayDate.getFullYear() === monthSchedule.year;
                return isCurrentMonthDay && day.events.length > 0;
              });

              if (daysWithEvents.length === 0) return null;

              return (
                <View key={weekIndex} style={styles.weekSection}>
                  <Text style={styles.weekTitle}>
                    Semaine du {CalendarService.formatWeekPeriod(week.weekStart, week.weekEnd)}
                  </Text>
                  
                  {daysWithEvents.map((day) => {
                    const dayDate = new Date(day.date + 'T00:00:00');
                    const isToday = new Date().toDateString() === dayDate.toDateString();
                    
                    return (
                      <View key={day.date} style={[styles.daySection, isToday && styles.todaySection]}>
                        <Text style={[styles.dayTitle, isToday && styles.todayTitle]}>
                          {dayDate.toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            day: 'numeric' 
                          })}
                          {isToday && ' (Aujourd\'hui)'}
                        </Text>
                        
                        {day.events.map((event, index) => (
                          <EventCard key={event.id || `event-${index}`} event={event} />
                        ))}
                      </View>
                    );
                  })}
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
  monthHeader: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
    alignItems: 'center'
  },
  currentMonthHeader: {
    backgroundColor: '#f0f8ff',
    borderLeftWidth: 4,
    borderLeftColor: '#3498db'
  },
  monthTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    textTransform: 'capitalize',
    textAlign: 'center'
  },
  currentMonthTitle: {
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
  weekSection: {
    marginBottom: 32
  },
  weekTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
    textAlign: 'center',
    textTransform: 'capitalize',
    backgroundColor: '#f8f9fa',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8
  },
  daySection: {
    marginBottom: 16,
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
    fontSize: 16,
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