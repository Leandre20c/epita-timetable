// app/(tabs)/week.tsx

import { LinearGradient } from 'expo-linear-gradient';
import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { EventCard } from '../../components/EventCard';
import { useSwipeNavigation } from '../../hook/useSwipeNavigation';
import { AuthService } from '../../services/AuthService';
import { CalendarService } from '../../services/CalendarService';
import { COLORS, screenStyles } from '../../styles/screenStyles';
import { WeekSchedule } from '../../types/CalendarTypes';
import EventEmitter from '../../utils/EventEmitter';

export default function WeekScreen() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    CalendarService.getWeekStart(new Date())
  );
  const [weekSchedule, setWeekSchedule] = useState<WeekSchedule | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  const [preloadedSchedules, setPreloadedSchedules] = useState<{
    [key: string]: WeekSchedule;
  }>({});

  const formatWeekKey = (weekStart: Date): string => {
    return weekStart.toISOString().split('T')[0];
  };

  const preloadAdjacentWeeks = useCallback(async (centerWeekStart: Date) => {
    const previousWeek = CalendarService.getPreviousWeek(centerWeekStart);
    const nextWeek = CalendarService.getNextWeek(centerWeekStart);

    const previousKey = formatWeekKey(previousWeek);
    const nextKey = formatWeekKey(nextWeek);

    const preloadPromises = [];
    
    if (!preloadedSchedules[previousKey]) {
      preloadPromises.push(
        CalendarService.getWeekSchedule(previousWeek).then(schedule => 
          setPreloadedSchedules(prev => ({ ...prev, [previousKey]: schedule }))
        )
      );
    }
    
    if (!preloadedSchedules[nextKey]) {
      preloadPromises.push(
        CalendarService.getWeekSchedule(nextWeek).then(schedule => 
          setPreloadedSchedules(prev => ({ ...prev, [nextKey]: schedule }))
        )
      );
    }

    Promise.all(preloadPromises).catch(error => 
      console.warn('Erreur préchargement semaines:', error)
    );
  }, [preloadedSchedules]);

  const loadWeekData = async (weekStart: Date) => {
    try {
      setIsLoading(true);
      const weekKey = formatWeekKey(weekStart);
      
      let schedule: WeekSchedule;
      
      if (preloadedSchedules[weekKey]) {
        console.log('⚡ Utilisation du cache préchargé pour', weekKey);
        schedule = preloadedSchedules[weekKey];
      } else {
        console.log('🔄 Chargement de la semaine:', weekStart.toLocaleDateString('fr-FR'));
        schedule = await CalendarService.getWeekSchedule(weekStart);
        setPreloadedSchedules(prev => ({ ...prev, [weekKey]: schedule }));
      }
      
      setWeekSchedule(schedule);
      
      setTimeout(() => preloadAdjacentWeeks(weekStart), 100);
      const totalEvents = schedule.days.reduce((sum, day) => sum + day.events.length, 0);
      console.log('✅ Semaine chargée avec', totalEvents, 'événements');
    } catch (error) {
      console.error('❌ Erreur lors du chargement de la semaine:', error);
      Alert.alert('Erreur', 'Impossible de charger la semaine');
      setWeekSchedule(null);
    } finally {
      setIsLoading(false);
      setIsTransitioning(false);
    }
  };

  const handlePrevious = () => {
    setIsTransitioning(true);
    const prevWeek = CalendarService.getPreviousWeek(currentWeekStart);
    setCurrentWeekStart(prevWeek);
  };

  const handleNext = () => {
    setIsTransitioning(true);
    const nextWeek = CalendarService.getNextWeek(currentWeekStart);
    setCurrentWeekStart(nextWeek);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await AuthService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      loadWeekData(currentWeekStart);
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadWeekData(currentWeekStart);
    }
  }, [currentWeekStart, isAuthenticated]);

  useEffect(() => {
    const handleAuthChange = async () => {
      console.log('🔄 Auth changé, vérification...');
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        setPreloadedSchedules({});
        await loadWeekData(currentWeekStart);
      } else {
        setWeekSchedule(null);
      }
    };

    const handleGroupChange = async () => {
      console.log('🔄 Groupe changé, rechargement...');
      setPreloadedSchedules({});
      await loadWeekData(currentWeekStart);
    };

    EventEmitter.on('authChanged', handleAuthChange);
    EventEmitter.on('groupChanged', handleGroupChange);

    return () => {
      EventEmitter.off('authChanged', handleAuthChange);
      EventEmitter.off('groupChanged', handleGroupChange);
    };
  }, [currentWeekStart]);

  const handleRefresh = () => {
    CalendarService.clearCache();
    setPreloadedSchedules({});
    loadWeekData(currentWeekStart);
  };

  const handleToday = () => {
    const today = CalendarService.getWeekStart(new Date());
    setCurrentWeekStart(today);
  };

  const { panGesture, translateX } = useSwipeNavigation({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    canSwipeLeft: true,
    canSwipeRight: true,
  });

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
    };
  });

  const getCurrentWeekLabel = (): string => {
    if (!weekSchedule) return 'Semaine';
    
    try {
      const thisWeek = CalendarService.getWeekStart(new Date());
      const isCurrentWeek = Math.abs(currentWeekStart.getTime() - thisWeek.getTime()) < 24 * 60 * 60 * 1000;
      
      if (isCurrentWeek) return 'Cette semaine';
      
      return CalendarService.formatWeekPeriod(weekSchedule.weekStart, weekSchedule.weekEnd);
    } catch (error) {
      return 'Semaine';
    }
  };

  const getTotalEvents = (): number => {
    if (!weekSchedule) return 0;
    return weekSchedule.days.reduce((sum, day) => sum + day.events.length, 0);
  };

  const formatTotalHours = (): string => {
    const totalEvents = getTotalEvents();
    
    if (totalEvents === 0) {
      return 'Pas';
    }
    
    const totalHours = totalEvents * 2;
    return `${totalHours} ${totalHours > 1 ? 'heures' : 'heure'}`;
  };

  const isCurrentWeek = (): boolean => {
    const thisWeek = CalendarService.getWeekStart(new Date());
    return Math.abs(currentWeekStart.getTime() - thisWeek.getTime()) < 24 * 60 * 60 * 1000;
  };

  if (isAuthenticated === null) {
    return (
      <SafeAreaView style={screenStyles.container}>
        <View style={screenStyles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={screenStyles.loadingText}>Vérification...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={screenStyles.container}>
        <View style={screenStyles.emptyContainer}>
          <Text style={screenStyles.emptyIcon}>🔐</Text>
          <Text style={screenStyles.emptyTitle}>Non connecté</Text>
          <Text style={screenStyles.emptySubtitle}>
            Connectez-vous pour accéder à votre emploi du temps
          </Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={screenStyles.container}>
        <View style={screenStyles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={screenStyles.loadingText}>Chargement de la semaine...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={screenStyles.container}>
      <View style={{ flex: 1 }}>
        <TouchableOpacity 
          style={[screenStyles.dayHeader, isCurrentWeek() && screenStyles.todayHeader]}
          onPress={handleToday}
          activeOpacity={0.7}
        >
          <Text style={[screenStyles.dayTitle, isCurrentWeek() && screenStyles.todayTitle]}>
            {getCurrentWeekLabel()}
          </Text>
          <Text style={screenStyles.eventCount}>
            {formatTotalHours()} de cours
          </Text>
        </TouchableOpacity>

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            <ScrollView
              style={screenStyles.scrollView}
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
            >
              {!weekSchedule || getTotalEvents() === 0 ? (
                <View style={screenStyles.emptyContainer}>
                  <Text style={screenStyles.emptyIcon}>☀️</Text>
                  <Text style={screenStyles.emptyTitle}>Aucun cours</Text>
                  <Text style={screenStyles.emptySubtitle}>
                    {isCurrentWeek() 
                      ? 'Aucun cours prévu cette semaine\nProfitez-en pour réviser !' 
                      : 'Aucun cours prévu cette semaine-là'
                    }
                  </Text>
                </View>
              ) : (
                <View style={screenStyles.eventsContainer}>
                  {weekSchedule.days.map((day) => {
                    if (day.events.length === 0) return null;
                    
                    const dayDate = new Date(day.date + 'T00:00:00');
                    const isToday = new Date().toDateString() === dayDate.toDateString();
                    
                    return (
                      <View key={day.date} style={screenStyles.daySection}>
                        <Text style={[screenStyles.dayTitle, isToday && screenStyles.todayTitle]}>
                          {dayDate.toLocaleDateString('fr-FR', { 
                            weekday: 'long', 
                            day: 'numeric', 
                            month: 'short',
                          })}
                          {isToday && ' (Aujourd\'hui)'}
                        </Text>
                        
                        {day.events.map((event, index) => (
                          <EventCard 
                            key={event.id || `event-${index}`} 
                            event={event} 
                            variant="compact"
                          />
                        ))}
                      </View>
                    );
                  })}
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </GestureDetector>
        
        <LinearGradient
          colors={['transparent', COLORS.light.background]}
          style={screenStyles.tabBarFadeOverlay}
          pointerEvents="none"
        />
      </View>
    </View>
  );
}