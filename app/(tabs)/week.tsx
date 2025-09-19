// app/(tabs)/week.tsx
import React, { useEffect, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Reprendre les mêmes types et fonctions de index.tsx
interface SimpleEvent {
  id: string;
  summary: string;
  description: string;
  location: string;
  startTime: Date;
  endTime: Date;
}

const parseICS = (icsContent: string): SimpleEvent[] => {
  const events: SimpleEvent[] = [];
  const lines = icsContent.split(/\r?\n/);
  
  let currentEvent: Partial<SimpleEvent> | null = null;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    if (line === 'BEGIN:VEVENT') {
      currentEvent = {
        id: '',
        summary: '',
        description: '',
        location: '',
        startTime: new Date(),
        endTime: new Date()
      };
    } else if (line === 'END:VEVENT' && currentEvent) {
      if (currentEvent.id && currentEvent.summary && currentEvent.startTime && currentEvent.endTime) {
        events.push(currentEvent as SimpleEvent);
      }
      currentEvent = null;
    } else if (currentEvent && line.indexOf(':') > -1) {
      if (line.startsWith(' ') || line.startsWith('\t')) {
        continue;
      }
      
      const colonIndex = line.indexOf(':');
      const property = line.substring(0, colonIndex);
      const value = line.substring(colonIndex + 1);
      
      switch (property) {
        case 'UID':
          currentEvent.id = value;
          break;
        case 'SUMMARY':
          currentEvent.summary = value.trim();
          break;
        case 'DESCRIPTION':
          currentEvent.description = value.trim();
          break;
        case 'LOCATION':
          currentEvent.location = value.trim();
          break;
        case 'DTSTART':
          try {
            const year = parseInt(value.substring(0, 4));
            const month = parseInt(value.substring(4, 6)) - 1;
            const day = parseInt(value.substring(6, 8));
            const hour = parseInt(value.substring(9, 11));
            const minute = parseInt(value.substring(11, 13));
            currentEvent.startTime = new Date(Date.UTC(year, month, day, hour, minute));
          } catch (e) {
            console.warn('Erreur parsing date start:', value);
          }
          break;
        case 'DTEND':
          try {
            const year = parseInt(value.substring(0, 4));
            const month = parseInt(value.substring(4, 6)) - 1;
            const day = parseInt(value.substring(6, 8));
            const hour = parseInt(value.substring(9, 11));
            const minute = parseInt(value.substring(11, 13));
            currentEvent.endTime = new Date(Date.UTC(year, month, day, hour, minute));
          } catch (e) {
            console.warn('Erreur parsing date end:', value);
          }
          break;
      }
    }
  }
  
  return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('fr-FR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short'
  });
};

const isSameDay = (date1: Date, date2: Date): boolean => {
  return date1.getFullYear() === date2.getFullYear() &&
         date1.getMonth() === date2.getMonth() &&
         date1.getDate() === date2.getDate();
};

export default function WeekScreen() {
  const [allEvents, setAllEvents] = useState<SimpleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadWeekEvents = async () => {
    try {
      setIsLoading(true);
      
      const response = await fetch('https://zeus.ionis-it.com/api/group/203/ics/q2GXJsFwfL');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const icsContent = await response.text();
      const events = parseICS(icsContent);
      
      // Garder les 7 prochains jours
      const now = new Date();
      const oneWeekLater = new Date();
      oneWeekLater.setDate(now.getDate() + 7);
      
      const weekEvents = events.filter(event => 
        event.startTime >= now && event.startTime <= oneWeekLater
      );
      
      setAllEvents(weekEvents);
      
    } catch (error) {
      console.error('Erreur week:', error);
      Alert.alert('Erreur', 'Impossible de charger la semaine');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWeekEvents();
  }, []);

  const getWeekDays = () => {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      
      const dayEvents = allEvents.filter(event => 
        isSameDay(event.startTime, date)
      );
      
      days.push({ date, events: dayEvents });
    }
    
    return days;
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

  const weekDays = getWeekDays();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Vue Semaine</Text>
        <TouchableOpacity onPress={loadWeekEvents}>
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>
        {weekDays.map(({ date, events }, index) => {
          const isToday = isSameDay(date, new Date());
          
          return (
            <View key={index} style={[styles.dayCard, isToday && styles.todayCard]}>
              <Text style={[styles.dayTitle, isToday && styles.todayTitle]}>
                {formatDate(date)} {isToday && '(Aujourd\'hui)'}
              </Text>
              
              {events.length === 0 ? (
                <Text style={styles.noEvents}>Aucun cours</Text>
              ) : (
                events.map(event => (
                  <View key={event.id} style={styles.eventItem}>
                    <Text style={styles.eventTime}>
                      {event.startTime.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </Text>
                    <Text style={styles.eventTitle}>{event.summary}</Text>
                    {event.location && (
                      <Text style={styles.eventLocation}>{event.location}</Text>
                    )}
                  </View>
                ))
              )}
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#7f8c8d',
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  refreshText: {
    fontSize: 18,
    padding: 8,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  dayCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  todayCard: {
    borderWidth: 2,
    borderColor: '#3498db',
  },
  dayTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  todayTitle: {
    color: '#3498db',
  },
  noEvents: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
  },
  eventItem: {
    marginBottom: 8,
    paddingVertical: 4,
  },
  eventTime: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  eventTitle: {
    fontSize: 16,
    color: '#2c3e50',
    marginTop: 2,
  },
  eventLocation: {
    fontSize: 12,
    color: '#7f8c8d',
    marginTop: 2,
  },
});