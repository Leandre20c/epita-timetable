// app/(tabs)/index.tsx

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
import { useNetworkStatus } from '../../hook/useNetworkStatus';
import { useSwipeNavigation } from '../../hook/useSwipeNavigation';
import { AuthService } from '../../services/AuthService';
import { CalendarService } from '../../services/CalendarService';
import { COLORS, screenStyles } from '../../styles/screenStyles';
import { CalendarEvent } from '../../types/CalendarTypes';
import EventEmitter from '../../utils/EventEmitter';

export default function DayScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [excludeFromRefresh, setExcludeFromRefresh] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const { isOnline } = useNetworkStatus();
  
  const [preloadedEvents, setPreloadedEvents] = useState<{
    [key: string]: CalendarEvent[];
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
      
      // ✅ Tri par heure de début
      dayEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      
      setEvents(dayEvents);
      
      setTimeout(() => preloadAdjacentDays(date), 100);
      console.log('✅ Jour chargé avec', dayEvents.length, 'événements');
    } catch (error) {
      console.error('❌ Erreur lors du chargement du jour:', error);
      Alert.alert('Erreur', 'Impossible de charger les événements du jour');
      setEvents([]);
    } finally {
      setIsLoading(false);
      setIsTransitioning(false);
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
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const authenticated = await AuthService.isAuthenticated();
    setIsAuthenticated(authenticated);
    
    if (authenticated) {
      loadDayData(currentDate);
    } else {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadDayData(currentDate);
    }
  }, [currentDate, isAuthenticated]);

  useEffect(() => {
    const handleAuthChange = async () => {
      console.log('🔄 Auth changé, vérification...');
      const authenticated = await AuthService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        setPreloadedEvents({});
        await loadDayData(currentDate);
      } else {
        setEvents([]);
      }
    };

    const handleGroupChange = async () => {
      console.log('🔄 Groupe changé, rechargement...');
      setPreloadedEvents({});
      await loadDayData(currentDate);
    };

    EventEmitter.on('authChanged', handleAuthChange);
    EventEmitter.on('groupChanged', handleGroupChange);

    return () => {
      EventEmitter.off('authChanged', handleAuthChange);
      EventEmitter.off('groupChanged', handleGroupChange);
    };
  }, [currentDate]);

  const handleRefresh = () => {
    CalendarService.clearCache();
    setPreloadedEvents({});
    loadDayData(currentDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const { panGesture, translateX } = useSwipeNavigation({
    onSwipeLeft: handleNext,
    onSwipeRight: handlePrevious,
    canSwipeLeft: true,
    canSwipeRight: true,
  });

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

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
      });
    } catch (error) {
      return 'Jour';
    }
  };

  const totalDayHours = (): number => {
    let totalMinutes = 0;
    
    for (let event of events) {
      const durationMs = event.endTime.getTime() - event.startTime.getTime();
      const durationMinutes = Math.round(durationMs / (1000 * 60));
      totalMinutes += durationMinutes;
    }
    
    return totalMinutes;
  };

  const formatTotalHours = (): string => {
    const totalMinutes = totalDayHours();
    
    if (totalMinutes === 0) return 'Pas';
    
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
          <Text style={screenStyles.loadingText}>Chargement du jour...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    
    <View style={screenStyles.container}>
      <View style={{ flex: 1 }}>
        
        {!isOnline && (
        <View style={screenStyles.offlineBanner}>
          <Text style={screenStyles.offlineText}>
            📡 Mode hors-ligne - Données en cache
          </Text>
        </View>
      )}

        <TouchableOpacity 
          style={[screenStyles.dayHeader, isToday() && screenStyles.todayHeader]}
          onPress={handleToday}
          activeOpacity={0.7}
        >
          <Text style={[screenStyles.dayTitle, isToday() && screenStyles.todayTitle]}>
            {formatDayLabel()}
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
              {events.length === 0 ? (
                <View style={screenStyles.emptyContainer}>
                  <Text style={screenStyles.emptyIcon}>☀️</Text>
                  <Text style={screenStyles.emptyTitle}>Aucun cours</Text>
                  <Text style={screenStyles.emptySubtitle}>
                    {isToday() ? 'Profitez de votre journée libre !' : 'Pas de cours prévu'}
                  </Text>
                </View>
              ) : (
                <View style={screenStyles.eventsContainer}>
                  {events.map((event, index) => {
                    const eventKey = event.id || `event-${index}`;
                    const shouldRefresh = excludeFromRefresh !== eventKey;
                    
                    return (
                      <EventCard 
                        key={shouldRefresh ? `${eventKey}-${refreshTrigger}` : eventKey}
                        event={event}
                        variant="default"
                        onColorChanged={(eventId) => {
                          if (eventId) {
                            setExcludeFromRefresh(eventId);
                          }
                          setRefreshTrigger(prev => prev + 1);
                          setTimeout(() => setExcludeFromRefresh(null), 1000);
                        }}
                      />
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