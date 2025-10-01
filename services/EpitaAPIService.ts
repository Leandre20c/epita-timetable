// services/EpitaAPIService.ts

import { AuthService } from './AuthService';

export class EpitaAPIService {
  private static readonly BASE_URL = 'https://zeus.ionis-it.com/api';

  /**
   * Fetch le calendrier au format ICS
   */
  static async fetchCalendarICS(groupPath: string): Promise<string> {
    const token = await AuthService.getEpitaToken();

    if (!token) {
      throw new Error('Non authentifié');
    }

    // Adapte l'endpoint selon ce que tu vois dans Swagger
    // Exemple possible :
    const endpoint = `/Calendar/ICS?group=${encodeURIComponent(groupPath)}`;
    // ou `/Schedule/Generate?groupId=${groupPath}`
    
    const url = `${this.BASE_URL}${endpoint}`;

    console.log('📡 Fetching calendar:', url);

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/calendar',
      },
    });

    if (response.status === 401 || response.status === 403) {
      // Token expiré
      await AuthService.logout();
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return await response.text();
  }
}