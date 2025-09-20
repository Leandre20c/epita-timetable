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
import { ICSParser } from '../../services/ICSParser';
import { CalendarEvent, TabType } from '../../types/CalendarType';

export default function ScheduleScreen() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState<TabType>('today');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      let fetchedEvents: CalendarEvent[];
      
      switch (selectedTab) {
        case 'today':
          fetchedEvents = await CalendarService.getTodayEvents();
          setSelectedDate(new Date());
          break;
        case 'next':
          fetchedEvents = await CalendarService.getUpcomingEvents(10);
          setSelectedDate(fetchedEvents[0]?.startTime || new Date());
          break;
        default:
          fetchedEvents = await CalendarService.getTodayEvents();
          setSelectedDate(new Date());
      }
      
      console.log('Événements pour', selectedTab, ':', fetchedEvents.length);
      setEvents(fetchedEvents);
      
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      Alert.alert(
        'Erreur',
        'Impossible de charger l\'emploi du temps. Vérifiez votre connexion internet.',
        [
          { text: 'Réessayer', onPress: loadEvents },
          { text: 'Annuler', style: 'cancel' }
        ]
      );
      setEvents([]); // Reset events on error
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvents();
  }, [selectedTab]);

  const handleRefresh = () => {
    CalendarService.clearCache();
    loadEvents();
  };

  const getTabs = () => [
    {
      key: 'today' as TabType,
      label: 'Aujourd\'hui',
      badge: selectedTab === 'today' ? events.length : undefined
    },
    {
      key: 'next' as TabType,
      label: 'Prochains',
      badge: selectedTab === 'next' ? events.length : undefined
    }
  ];

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3498db" />
          <Text style={styles.loadingText}>Chargement de l'emploi du temps...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>📚 Mon Emploi du Temps</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <Text style={styles.refreshText}>🔄</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {getTabs().map(tab => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, selectedTab === tab.key && styles.activeTab]}
            onPress={() => setSelectedTab(tab.key)}
          >
            <Text style={[styles.tabText, selectedTab === tab.key && styles.activeTabText]}>
              {tab.label}
            </Text>
            {tab.badge !== undefined && tab.badge > 0 && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{tab.badge}</Text>
              </View>
            )}
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.content}>
        <View style={styles.dateHeader}>
          <Text style={styles.dateText}>
            {selectedTab === 'today' 
              ? ICSParser.formatDate(selectedDate)
              : `${events.length} prochains cours`
            }
          </Text>
        </View>
        
        <ScrollView
          style={styles.scrollView}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={handleRefresh} />}
        >
          {events.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>📅</Text>
              <Text style={styles.emptyTitle}>Aucun cours</Text>
              <Text style={styles.emptySubtitle}>
                {selectedTab === 'today' 
                  ? 'Profitez de votre journée libre !' 
                  : 'Aucun cours à venir'
                }
              </Text>
            </View>
          ) : (
            <View style={styles.eventsContainer}>
              <Text style={styles.statsText}>
                {events.length} cours
              </Text>
              {events.map(event => (
                <EventCard key={event.id} event={event} />
              ))}
            </View>
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { marginTop: 16, fontSize: 16, color: '#7f8c8d' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    paddingHorizontal: 16, 
    paddingVertical: 16, 
    backgroundColor: '#ffffff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e9ecef' 
  },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2c3e50' },
  refreshButton: { padding: 8 },
  refreshText: { fontSize: 18 },
  tabContainer: { 
    flexDirection: 'row', 
    backgroundColor: '#ffffff', 
    borderBottomWidth: 1, 
    borderBottomColor: '#e9ecef' 
  },
  tab: { 
    flex: 1, 
    paddingVertical: 16, 
    paddingHorizontal: 8, 
    alignItems: 'center', 
    flexDirection: 'row', 
    justifyContent: 'center' 
  },
  activeTab: { borderBottomWidth: 3, borderBottomColor: '#3498db' },
  tabText: { fontSize: 14, fontWeight: '600', color: '#7f8c8d' },
  activeTabText: { color: '#3498db' },
  badge: { 
    backgroundColor: '#e74c3c', 
    borderRadius: 10, 
    minWidth: 20, 
    height: 20, 
    alignItems: 'center', 
    justifyContent: 'center', 
    marginLeft: 8 
  },
  badgeText: { color: '#ffffff', fontSize: 12, fontWeight: 'bold' },
  content: { flex: 1 },
  dateHeader: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#ffffff' },
  dateText: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#2c3e50', 
    textTransform: 'capitalize' 
  },
  scrollView: { flex: 1 },
  eventsContainer: { padding: 16 },
  statsText: { fontSize: 14, color: '#7f8c8d', marginBottom: 16, textAlign: 'center' },
  emptyContainer: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    paddingVertical: 80, 
    paddingHorizontal: 32 
  },
  emptyIcon: { fontSize: 64, marginBottom: 16 },
  emptyTitle: { 
    fontSize: 18, 
    fontWeight: '600', 
    color: '#2c3e50', 
    marginBottom: 8, 
    textAlign: 'center' 
  },
  emptySubtitle: { 
    fontSize: 14, 
    color: '#7f8c8d', 
    textAlign: 'center', 
    lineHeight: 20 
  }
});