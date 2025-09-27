// services/NotificationService.ts - Version avec fallback pour test
import { Platform } from 'react-native';
import { CalendarEvent } from '../types/CalendarTypes';
import { CalendarService } from './CalendarService';

// Import conditionnel pour éviter l'erreur Expo Go
let Notifications: any = null;
try {
  // Seulement importer si pas dans Expo Go
  if (!__DEV__ || Platform.OS !== 'web') {
    Notifications = require('expo-notifications');
    
    // Configuration seulement si disponible
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
      }),
    });
  }
} catch (error) {
  console.log('📱 Notifications non disponibles dans Expo Go - normal pour le test');
}

interface EventChange {
  type: 'added' | 'removed' | 'moved' | 'modified';
  event: CalendarEvent;
  originalEvent?: CalendarEvent;
}

export class NotificationService {
  private static lastKnownEvents: CalendarEvent[] = [];
  private static isInitialized = false;
  private static monitoringInterval: number | null = null;
  private static isExpoGo = false;

  // Vérifie si on est dans Expo Go
  private static checkExpoGo(): boolean {
    try {
      // Tentative de détecter Expo Go
      return __DEV__ && !Notifications;
    } catch {
      return true;
    }
  }

  // Initialise les notifications système
  public static async initialize(): Promise<boolean> {
    this.isExpoGo = this.checkExpoGo();
    
    if (this.isExpoGo) {
      console.log('🟡 Mode Expo Go détecté - notifications simulées');
      this.lastKnownEvents = await CalendarService.fetchSchedule();
      this.isInitialized = true;
      return true;
    }

    if (!Notifications) {
      console.warn('❌ expo-notifications non disponible');
      return false;
    }

    try {
      // Demander les permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('❌ Permissions notifications refusées');
        return false;
      }

      // Configurer le canal Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('course-changes', {
          name: 'Changements de cours',
          description: 'Notifications pour les modifications d\'emploi du temps',
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#3498db',
          sound: 'default',
          enableVibrate: true,
        });
      }

      this.lastKnownEvents = await CalendarService.fetchSchedule();
      this.isInitialized = true;
      
      console.log('✅ Notifications système initialisées');
      return true;
    } catch (error) {
      console.error('❌ Erreur initialisation notifications:', error);
      return false;
    }
  }

  // Démarre la surveillance en arrière-plan
  public static async startBackgroundMonitoring(): Promise<void> {
    if (!this.isInitialized) {
      const success = await this.initialize();
      if (!success) return;
    }

    // Vérification toutes les 30 minutes
    this.monitoringInterval = setInterval(async () => {
      await this.checkForChangesAndNotify();
    }, 30 * 60 * 1000);

    // Première vérification immédiate
    await this.checkForChangesAndNotify();
    
    console.log('📱 Surveillance en arrière-plan démarrée');
  }

  // Arrête la surveillance
  public static stopBackgroundMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    console.log('📱 Surveillance arrêtée');
  }

  // Vérifie les changements et envoie les notifications système
  public static async checkForChangesAndNotify(): Promise<EventChange[]> {
    if (!this.isInitialized) {
      await this.initialize();
      return [];
    }

    try {
      const currentEvents = await CalendarService.fetchSchedule();
      const changes = this.detectChanges(this.lastKnownEvents, currentEvents);
      
      if (changes.length > 0) {
        console.log(`🔔 ${changes.length} changement(s) détecté(s)`);
        
        // Envoyer les notifications
        for (const change of changes) {
          if (this.isExpoGo) {
            this.simulateNotification(change);
          } else {
            await this.sendSystemNotification(change);
          }
        }
      }

      this.lastKnownEvents = currentEvents;
      return changes;
    } catch (error) {
      console.error('❌ Erreur vérification changements:', error);
      return [];
    }
  }

  // Simule une notification pour Expo Go (logs)
  private static simulateNotification(change: EventChange): void {
    let title = '';
    let body = '';

    switch (change.type) {
      case 'added':
        title = '📅 Nouveau cours';
        body = `${change.event.title} - ${this.formatDateTime(change.event.startTime)}`;
        break;
      case 'removed':
        title = '❌ Cours annulé';
        body = `${change.event.title} - ${this.formatDateTime(change.event.startTime)}`;
        break;
      case 'moved':
        title = '📍 Cours déplacé';
        body = `${change.event.title}`;
        break;
      case 'modified':
        title = '✏️ Cours modifié';
        body = `${change.event.title} - ${this.formatDateTime(change.event.startTime)}`;
        break;
    }

    console.log(`📱 NOTIFICATION SIMULÉE: ${title} - ${body}`);
  }

  // Détecte les changements (code identique)
  private static detectChanges(oldEvents: CalendarEvent[], newEvents: CalendarEvent[]): EventChange[] {
    const changes: EventChange[] = [];

    for (const oldEvent of oldEvents) {
      const found = newEvents.find(e => this.isSameEvent(e, oldEvent));
      if (!found) {
        changes.push({ type: 'removed', event: oldEvent });
      }
    }

    for (const newEvent of newEvents) {
      const oldEvent = oldEvents.find(e => this.isSameEvent(e, newEvent));
      
      if (!oldEvent) {
        changes.push({ type: 'added', event: newEvent });
      } else if (!this.isEventIdentical(oldEvent, newEvent)) {
        const isMoved = oldEvent.startTime.getTime() !== newEvent.startTime.getTime() ||
                       oldEvent.endTime.getTime() !== newEvent.endTime.getTime() ||
                       oldEvent.location !== newEvent.location;
        
        changes.push({
          type: isMoved ? 'moved' : 'modified',
          event: newEvent,
          originalEvent: oldEvent
        });
      }
    }

    return changes;
  }

  private static isSameEvent(event1: CalendarEvent, event2: CalendarEvent): boolean {
    return event1.id === event2.id || 
           (event1.title === event2.title && 
            Math.abs(event1.startTime.getTime() - event2.startTime.getTime()) < 24 * 60 * 60 * 1000);
  }

  private static isEventIdentical(event1: CalendarEvent, event2: CalendarEvent): boolean {
    return event1.title === event2.title &&
           event1.startTime.getTime() === event2.startTime.getTime() &&
           event1.endTime.getTime() === event2.endTime.getTime() &&
           event1.location === event2.location &&
           event1.description === event2.description;
  }

  // Envoie une notification système (vraie)
  private static async sendSystemNotification(change: EventChange): Promise<void> {
    if (!Notifications) return;

    let title = '';
    let body = '';

    switch (change.type) {
      case 'added':
        title = '📅 Nouveau cours';
        body = `${change.event.title}\n${this.formatDateTime(change.event.startTime)}`;
        break;
      case 'removed':
        title = '❌ Cours annulé';
        body = `${change.event.title}\n${this.formatDateTime(change.event.startTime)}`;
        break;
      case 'moved':
        title = '📍 Cours déplacé';
        if (change.originalEvent) {
          body = `${change.event.title}\n${this.formatDateTime(change.originalEvent.startTime)} → ${this.formatDateTime(change.event.startTime)}`;
        } else {
          body = `${change.event.title}\n${this.formatDateTime(change.event.startTime)}`;
        }
        break;
      case 'modified':
        title = '✏️ Cours modifié';
        body = `${change.event.title}\n${this.formatDateTime(change.event.startTime)}`;
        break;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          sound: 'default',
          priority: Notifications.AndroidNotificationPriority.HIGH,
          vibrate: [0, 250, 250, 250],
          data: {
            type: 'course_change',
            changeType: change.type,
            eventId: change.event.id
          }
        },
        trigger: Platform.OS === 'android'
          ? { channelId: 'course-changes', seconds: 0 }
          : null
      });

      console.log(`📱 Notification système envoyée: ${title}`);
    } catch (error) {
      console.error('❌ Erreur notification système:', error);
    }
  }

  private static formatDateTime(date: Date): string {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    const time = date.toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit'
    });

    if (isToday) {
      return `Aujourd'hui ${time}`;
    } else if (isTomorrow) {
      return `Demain ${time}`;
    } else {
      return date.toLocaleDateString('fr-FR', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  }

  public static async checkNow(): Promise<boolean> {
    const changes = await this.checkForChangesAndNotify();
    return changes.length > 0;
  }

  public static async getPermissionStatus(): Promise<'granted' | 'denied' | 'undetermined'> {
    if (this.isExpoGo) return 'granted'; // Simulé
    
    if (!Notifications) return 'denied';
    
    try {
      const { status } = await Notifications.getPermissionsAsync();
      return status as any;
    } catch (error) {
      return 'denied';
    }
  }
}