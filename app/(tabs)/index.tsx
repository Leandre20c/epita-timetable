// app/(tabs)/index.tsx

import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { GestureDetector } from 'react-native-gesture-handler';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { CalendarHeader } from '../../components/CalendarHeader';
import { EmptyState } from '../../components/EmptyState';
import { EventCard } from '../../components/EventCard';
import { Screen } from '../../components/Screen';
import { useCalendarScreen } from '../../hook/useCalendarScreen';
import { useSwipeNavigation } from '../../hook/useSwipeNavigation';
import { CalendarService } from '../../services/CalendarService';
import { COLORS, screenStyles } from '../../styles/screenStyles';

export default function DayScreen() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [excludeFromRefresh, setExcludeFromRefresh] = useState<string | null>(null);

  const { isAuthenticated, isRefreshing, data: events, handleRefresh } = useCalendarScreen({
    loadData: async () => {
      const dayEvents = await CalendarService.getEventsForDate(currentDate);
      dayEvents.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
      return dayEvents;
    },
    dependencies: [currentDate], // ✅ Ajoute cette ligne
  });

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
    if (!events) return 0;
    
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

  const isToday = currentDate.toDateString() === new Date().toDateString();

  return (
    <Screen 
      isAuthenticated={isAuthenticated} 
      isRefreshing={isRefreshing}
      loadingText="Chargement du jour..."
    >
      <View style={{ flex: 1  }}>
        <CalendarHeader
          title={formatDayLabel()}
          subtitle={`${formatTotalHours()} de cours`}
          isToday={isToday}
          onPress={handleToday}
        />

        <GestureDetector gesture={panGesture}>
          <Animated.View style={[{ flex: 1 }, animatedStyle]}>
            <ScrollView
              style={screenStyles.scrollView}
              contentContainerStyle={{ paddingBottom: 100 }}
              refreshControl={
                <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} />
              }
            >
              {!events || events.length === 0 ? (
                <EmptyState
                  icon="☀️"
                  title="Aucun cours"
                  subtitle={isToday ? 'Profitez de votre journée libre !' : 'Pas de cours prévu'}
                />
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
    </Screen>
  );
}