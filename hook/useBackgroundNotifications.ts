// hooks/useBackgroundNotifications.ts
import { useEffect, useState } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { NotificationService } from '../services/NotificationService';

interface BackgroundNotificationHook {
  isActive: boolean;
  permissionStatus: 'granted' | 'denied' | 'undetermined';
  startMonitoring: () => Promise<void>;
  stopMonitoring: () => void;
  checkNow: () => Promise<boolean>;
}

export const useBackgroundNotifications = (): BackgroundNotificationHook => {
  const [isActive, setIsActive] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'denied' | 'undetermined'>('undetermined');

  // Vérifier les permissions au montage
  useEffect(() => {
    checkPermissions();
  }, []);

  const checkPermissions = async () => {
    const status = await NotificationService.getPermissionStatus();
    setPermissionStatus(status);
    
    // Auto-démarrage si permissions accordées
    if (status === 'granted' && !isActive) {
      await startMonitoring();
    }
  };

  // Démarre la surveillance en arrière-plan
  const startMonitoring = async (): Promise<void> => {
    try {
      await NotificationService.startBackgroundMonitoring();
      setIsActive(true);
      console.log('🔔 Surveillance notifications système démarrée');
    } catch (error) {
      console.error('Erreur démarrage surveillance:', error);
      setIsActive(false);
    }
  };

  // Arrête la surveillance
  const stopMonitoring = (): void => {
    NotificationService.stopBackgroundMonitoring();
    setIsActive(false);
    console.log('🔕 Surveillance notifications système arrêtée');
  };

  // Vérification manuelle
  const checkNow = async (): Promise<boolean> => {
    try {
      return await NotificationService.checkNow();
    } catch (error) {
      console.error('Erreur vérification manuelle:', error);
      return false;
    }
  };

  // Gestion retour au premier plan
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && isActive) {
        // Vérification silencieuse quand l'app revient au premier plan
        NotificationService.checkNow();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription?.remove();
  }, [isActive]);

  // Nettoyage
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, []);

  return {
    isActive,
    permissionStatus,
    startMonitoring,
    stopMonitoring,
    checkNow
  };
};