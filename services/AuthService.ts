// services/AuthService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import EventEmitter from '../utils/EventEmitter';

export class AuthService {
  private static readonly OFFICE_CONFIG = {
    clientId: '39cd5b3d-08c6-4e1b-8730-6603bc77ba45',
    tenantId: 'common',
    redirectUri: 'https://zeus.ionis-it.com/officeConnect/',
    scopes: ['openid', 'profile', 'email'],
  };

  private static readonly EPITA_API_URL = 'https://zeus.ionis-it.com/api';
  
  private static readonly STORAGE_KEYS = {
    EPITA_JWT: '@epita_jwt_token',
    OFFICE_TOKEN: '@office_access_token',
  };

  static async getAuthUrl(): Promise<string> {
    const state = await this.generateRandomString(43);
    const nonce = await this.generateRandomString(43);

    const params = new URLSearchParams({
      client_id: this.OFFICE_CONFIG.clientId,
      response_type: 'id_token token',
      redirect_uri: this.OFFICE_CONFIG.redirectUri,
      scope: this.OFFICE_CONFIG.scopes.join(' '),
      state: state,
      nonce: nonce,
    });

    const baseUrl = `https://login.microsoftonline.com/${this.OFFICE_CONFIG.tenantId}/oauth2/v2.0/authorize`;
    return `${baseUrl}?${params.toString()}`;
  }

  static extractAccessTokenFromUrl(url: string): string | null {
    const fragmentMatch = url.match(/#(.+)$/);
    if (!fragmentMatch) return null;

    const fragment = fragmentMatch[1];
    const tokenMatch = fragment.match(/access_token=([^&]+)/);
    
    return tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
  }

  static async loginToEpitaAPI(officeToken: string): Promise<string> {
    console.log('📡 Envoi token à EPITA API...');

    const response = await fetch(`${this.EPITA_API_URL}/User/OfficeLogin`, {
      method: 'POST',
      headers: {
        'Accept': 'text/plain',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        accessToken: officeToken,
      }),
    });

    console.log('📥 Status:', response.status);

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erreur:', error);
      throw new Error(`EPITA login failed: ${response.status}`);
    }

    return await response.text();
  }

  static async saveTokens(officeToken: string, epitaJwt: string): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem(this.STORAGE_KEYS.OFFICE_TOKEN, officeToken),
      AsyncStorage.setItem(this.STORAGE_KEYS.EPITA_JWT, epitaJwt),
    ]);
    
    EventEmitter.emit('authChanged');
  }

  static async getEpitaToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.STORAGE_KEYS.EPITA_JWT);
  }

  static async getOfficeToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.STORAGE_KEYS.OFFICE_TOKEN);
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getEpitaToken();
    return token !== null;
  }

  static async getUserInfo(): Promise<{
    name: string;
    email: string;
    firstName: string;
    lastName: string;
    photo?: string;
  } | null> {
    try {
      const officeToken = await this.getOfficeToken();

      if (!officeToken) {
        console.log('❌ Pas de token Office365');
        return null;
      }

      const profileResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
        headers: {
          'Authorization': `Bearer ${officeToken}`,
        },
      });

      if (!profileResponse.ok) {
        console.error('❌ Erreur récupération profil:', profileResponse.status);
        return null;
      }

      const profileData = await profileResponse.json();

      let photoUrl: string | undefined;
      try {
        const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
          headers: {
            'Authorization': `Bearer ${officeToken}`,
          },
        });

        if (photoResponse.ok) {
          const photoBlob = await photoResponse.blob();
          const reader = new FileReader();
          photoUrl = await new Promise((resolve) => {
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(photoBlob);
          });
        }
      } catch (photoError) {
        console.log('⚠️ Pas de photo de profil');
      }

      return {
        name: profileData.displayName,
        email: profileData.mail || profileData.userPrincipalName,
        firstName: profileData.givenName || '',
        lastName: profileData.surname || '',
        photo: photoUrl,
      };

    } catch (error) {
      console.error('❌ Erreur getUserInfo:', error);
      return null;
    }
  }

  static async logout(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(this.STORAGE_KEYS.OFFICE_TOKEN),
      AsyncStorage.removeItem(this.STORAGE_KEYS.EPITA_JWT),
    ]);
    
    EventEmitter.emit('authChanged');
  }

  private static async generateRandomString(length: number): Promise<string> {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
    
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars[randomBytes[i % randomBytes.length] % 64];
    }
    
    return result;
  }
}