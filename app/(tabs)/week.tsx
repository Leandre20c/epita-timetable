// app/(tabs)/week.tsx

import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { RefreshControl, ScrollView, Text, View } from 'react-native';
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

const getInitialWeekStart = (): Date => {
    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Dimanche, 6 = Samedi
    
    // Si on est samedi (6) ou dimanche (0), passer au lundi suivant
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      const daysUntilMonday = dayOfWeek === 0 ? 1 : 2; // Dimanche = +1 jour, Samedi = +2 jours
      const nextMonday = new Date(today);
      nextMonday.setDate(today.getDate() + daysUntilMonday);
      return CalendarService.getWeekStart(nextMonday);
    }
    
    // Sinon, semaine courante
    return CalendarService.getWeekStart(today);
  };


export default function WeekScreen() {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => 
    getInitialWeekStart()
  );

  const { isAuthenticated, isRefreshing, data: weekSchedule, handleRefresh } = useCalendarScreen({
    loadData: async () => {
      return await CalendarService.getWeekSchedule(currentWeekStart);
    },
    dependencies: [currentWeekStart],
  });

  const handlePrevious = () => {
    const prevWeek = CalendarService.getPreviousWeek(currentWeekStart);
    setCurrentWeekStart(prevWeek);
  };

  const handleNext = () => {
    const nextWeek = CalendarService.getNextWeek(currentWeekStart);
    setCurrentWeekStart(nextWeek);
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

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }],
  }));

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
    
    if (totalEvents === 0) return 'Pas';
    
    const totalHours = totalEvents * 2;
    return `${totalHours} ${totalHours > 1 ? 'heures' : 'heure'}`;
  };

  const isCurrentWeek = (): boolean => {
    const thisWeek = CalendarService.getWeekStart(new Date());
    return Math.abs(currentWeekStart.getTime() - thisWeek.getTime()) < 24 * 60 * 60 * 1000;
  };

  return (
    <Screen 
      isAuthenticated={isAuthenticated} 
      isRefreshing={isRefreshing}
      loadingText="Chargement de la semaine..."
    >
      <View style={{ flex: 1 }}>
        <CalendarHeader
          title={getCurrentWeekLabel()}
          subtitle={`${formatTotalHours()} de cours`}
          isToday={isCurrentWeek()}
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
              {!weekSchedule || getTotalEvents() === 0 ? (
                <EmptyState
                  icon="☀️"
                  title="Aucun cours"
                  subtitle={
                    isCurrentWeek() 
                      ? 'Aucun cours prévu cette semaine\nProfitez-en pour réviser !' 
                      : 'Aucun cours prévu cette semaine-là'
                  }
                />
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
    </Screen>
  );
}