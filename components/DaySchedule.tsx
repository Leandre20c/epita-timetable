// components/DaySchedule.tsx
import React from 'react';
import { RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ICSParser } from '../services/ICSParser';
import { CalendarEvent } from '../types/CalendarType';
import { EventCard } from './EventCard';

interface DayScheduleProps {
  date: Date;
  events: CalendarEvent[];
  isLoading?: boolean;
  onRefresh?: () => void;
  onEventPress?: (event: CalendarEvent) => void;
}

export const DaySchedule: React.FC<DayScheduleProps> = ({
  date,
  events,
  isLoading = false,
  onRefresh,
  onEventPress
}) => {
  const isToday = ICSParser.isSameDay(date, new Date());
  
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyIcon}>📅</Text>
      <Text style={styles.emptyTitle}>Aucun cours aujourd'hui</Text>
      <Text style={styles.emptySubtitle}>
        {isToday ? 'Profitez de votre journée libre !' : 'Rien de prévu pour cette date'}
      </Text>
    </View>
  );

  const groupEventsByTimeSlot = (events: CalendarEvent[]) => {
    // Group overlapping events
    const grouped: CalendarEvent[][] = [];
    
    events.forEach(event => {
      let placed = false;
      
      for (const group of grouped) {
        const hasOverlap = group.some(groupEvent => 
          event.startTime < groupEvent.endTime && event.endTime > groupEvent.startTime
        );
        
        if (!hasOverlap) {
          group.push(event);
          placed = true;
          break;
        }
      }
      
      if (!placed) {
        grouped.push([event]);
      }
    });
    
    return grouped;
  };

  const eventGroups = groupEventsByTimeSlot(events);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.dateText}>
          {ICSParser.formatDate(date)}
        </Text>
        {isToday && (
          <View style={styles.todayBadge}>
            <Text style={styles.todayText}>Aujourd'hui</Text>
          </View>
        )}
      </View>
      
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={isLoading} onRefresh={onRefresh} />
          ) : undefined
        }
      >
        {events.length === 0 ? (
          renderEmptyState()
        ) : (
          <View style={styles.eventsContainer}>
            <View style={styles.statsContainer}>
              <Text style={styles.statsText}>
                {events.length} cours • {Math.round(
                  events.reduce((total, event) => 
                    total + (event.endTime.getTime() - event.startTime.getTime()), 0
                  ) / (1000 * 60 * 60)
                )}h de cours
              </Text>
            </View>
            
            {eventGroups.map((group, groupIndex) => (
              <View key={groupIndex} style={styles.eventGroup}>
                {group.map(event => (
                  <EventCard
                    key={event.id}
                    event={event}
                  />
                ))}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  dateText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    textTransform: 'capitalize',
  },
  todayBadge: {
    backgroundColor: '#3498db',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  todayText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  eventsContainer: {
    paddingVertical: 16,
  },
  statsContainer: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#e8f4f8',
    borderRadius: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#2c3e50',
    textAlign: 'center',
    fontWeight: '500',
  },
  eventGroup: {
    marginBottom: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 8,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    lineHeight: 20,
  },
}); 