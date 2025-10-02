// services/CacheService.ts
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { CalendarEvent } from '../types/CalendarTypes';

export interface CachedCalendar {
  id: string;
  groupId: number;
  groupName: string;
  events: CalendarEvent[];
  timestamp: number;
  icsContent?: string;
}

export class CacheService {
  private static CACHE_VALIDITY_MS = 60 * 60 * 1000; // 1 heure
  private static CACHE_PREFIX = '@epitime_cache_';

  /**
   * Vérifie si le cache est encore frais
   */
  static isCacheFresh(timestamp: number): boolean {
    const now = Date.now();
    const age = now - timestamp;
    return age < this.CACHE_VALIDITY_MS;
  }

  /**
   * Génère la clé de cache pour un groupe
   */
  static generateCacheKey(groupId: number): string {
    return `${this.CACHE_PREFIX}group_${groupId}`;
  }

  /**
   * Récupère le calendrier depuis AsyncStorage
   */
  static async getCalendarFromCache(
    groupId: number
  ): Promise<CachedCalendar | null> {
    try {
      const key = this.generateCacheKey(groupId);
      const cached = await AsyncStorage.getItem(key);
      
      if (!cached) {
        console.log('⚪ Cache miss:', key);
        return null;
      }

      const data: CachedCalendar = JSON.parse(cached);

      // Reconstituer les dates
      const events = data.events.map(e => ({
        ...e,
        startTime: new Date(e.startTime),
        endTime: new Date(e.endTime),
      }));

      const result = { ...data, events };

      if (this.isCacheFresh(data.timestamp)) {
        console.log('✅ Cache HIT (fresh):', key);
      } else {
        console.log('⚠️ Cache HIT (stale):', key);
      }

      return result;
    } catch (error) {
      console.error('❌ Cache read error:', error);
      return null;
    }
  }

  /**
   * Sauvegarde le calendrier dans AsyncStorage
   */
  static async saveCalendarToCache(
    groupId: number,
    groupName: string,
    events: CalendarEvent[],
    icsContent?: string
  ): Promise<void> {
    try {
      const key = this.generateCacheKey(groupId);
      
      const cacheEntry: CachedCalendar = {
        id: key,
        groupId,
        groupName,
        events,
        timestamp: Date.now(),
        icsContent,
      };

      await AsyncStorage.setItem(key, JSON.stringify(cacheEntry));
      console.log('💾 Saved to cache:', key, `(${events.length} events)`);
    } catch (error) {
      console.error('❌ Cache write error:', error);
    }
  }

  /**
   * Vérifie l'état de connexion réseau
   */
  static async isOnline(): Promise<boolean> {
    try {
      const state = await NetInfo.fetch();
      return state.isConnected === true && state.isInternetReachable !== false;
    } catch (error) {
      console.warn('⚠️ Erreur vérification réseau:', error);
      return true;
    }
  }

  /**
   * Nettoie les caches anciens (> 7 jours)
   */
  static async cleanOldCache(): Promise<void> {
    try {
      // Récupérer toutes les clés
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(this.CACHE_PREFIX));

      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const keysToDelete: string[] = [];

      // Vérifier chaque cache
      for (const key of cacheKeys) {
        try {
          const cached = await AsyncStorage.getItem(key);
          if (cached) {
            const data: CachedCalendar = JSON.parse(cached);
            if (data.timestamp < sevenDaysAgo) {
              keysToDelete.push(key);
            }
          }
        } catch (error) {
          // Si erreur de lecture, supprimer la clé corrompue
          keysToDelete.push(key);
        }
      }

      if (keysToDelete.length > 0) {
        await AsyncStorage.multiRemove(keysToDelete);
        console.log(`🧹 ${keysToDelete.length} ancien(s) cache(s) supprimé(s)`);
      }
    } catch (error) {
      console.error('❌ Erreur nettoyage cache:', error);
    }
  }

  /**
   * Vide tout le cache
   */
  static async clearAllCache(): Promise<void> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      if (cacheKeys.length > 0) {
        await AsyncStorage.multiRemove(cacheKeys);
        console.log(`🗑️ ${cacheKeys.length} cache(s) vidé(s)`);
      }
    } catch (error) {
      console.error('❌ Erreur vidage cache:', error);
    }
  }

  /**
   * Obtient la taille du cache (nombre d'entrées)
   */
  static async getCacheSize(): Promise<number> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      return allKeys.filter(key => key.startsWith(this.CACHE_PREFIX)).length;
    } catch (error) {
      console.error('❌ Erreur lecture taille cache:', error);
      return 0;
    }
  }

  /**
   * Obtient toutes les entrées du cache (pour debug)
   */
  static async getAllCachedCalendars(): Promise<CachedCalendar[]> {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const cacheKeys = allKeys.filter(key => key.startsWith(this.CACHE_PREFIX));
      
      const caches: CachedCalendar[] = [];
      
      for (const key of cacheKeys) {
        const cached = await AsyncStorage.getItem(key);
        if (cached) {
          try {
            const data: CachedCalendar = JSON.parse(cached);
            caches.push(data);
          } catch (error) {
            console.warn('⚠️ Cache corrompu:', key);
          }
        }
      }
      
      return caches;
    } catch (error) {
      console.error('❌ Erreur lecture cache:', error);
      return [];
    }
  }
}