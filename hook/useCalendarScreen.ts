// hooks/useCalendarScreen.ts
import { useCallback, useEffect, useState } from 'react';
import { AuthService } from '../services/AuthService';
import { CalendarService } from '../services/CalendarService';
import EventEmitter from '../utils/EventEmitter';

type UseCalendarScreenOptions<T> = {
  loadData: () => Promise<T>;
  dependencies?: any[]; // ← Ajoute cette ligne
  onAuthChange?: () => void;
  onGroupChange?: () => void;
};

export function useCalendarScreen<T>({
  loadData,
  dependencies = [],
  onAuthChange,
  onGroupChange,
}: UseCalendarScreenOptions<T>) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false); // ← Nouveau
  const [data, setData] = useState<T | null>(null);

  // Chargement des données
  const handleLoad = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setIsLoading(true);
      }
      const result = await loadData();
      setData(result);
    } catch (error) {
      console.error('Erreur chargement:', error);
      setData(null);
    } finally {
      if (showLoading) {
        setIsLoading(false);
      }
    }
  }, [loadData]);

  // Vérification auth
  const checkAuth = useCallback(async () => {
    const authenticated = await AuthService.isAuthenticated();
    setIsAuthenticated(authenticated);

    if (authenticated) {
      await handleLoad(true); // ← Affiche loading initial
    } else {
      setIsLoading(false);
    }
  }, [handleLoad]);

  // Refresh
  const handleRefresh = useCallback(() => {
    CalendarService.clearCache();
    setIsRefreshing(true);
    handleLoad(false).finally(() => setIsRefreshing(false));
  }, [handleLoad]);

  // Init
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Recharger quand les dépendances changent (SANS loading)
  useEffect(() => {
    if (isAuthenticated && dependencies.length > 0) {
      handleLoad(false); // ← Pas de loading visible
    }
  }, [...dependencies]);

  // EventEmitter listeners
  useEffect(() => {
    const handleAuthChanged = async () => {
      console.log('🔄 Auth changé');
      await checkAuth();
      onAuthChange?.();
    };

    const handleGroupChanged = async () => {
      console.log('🔄 Groupe changé');
      await handleLoad(true); // ← Affiche loading pour changement de groupe
      onGroupChange?.();
    };

    EventEmitter.on('authChanged', handleAuthChanged);
    EventEmitter.on('groupChanged', handleGroupChanged);

    return () => {
      EventEmitter.off('authChanged', handleAuthChanged);
      EventEmitter.off('groupChanged', handleGroupChanged);
    };
  }, [checkAuth, handleLoad, onAuthChange, onGroupChange]);

  return {
    isAuthenticated,
    isLoading,
    isRefreshing, // ← Expose ça
    data,
    handleRefresh,
    handleLoad,
  };
}