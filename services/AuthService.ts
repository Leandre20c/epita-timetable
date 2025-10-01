// services/AuthService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';

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

  /**
   * Génère l'URL d'authentification Office365
   */
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

  /**
   * Extrait l'access_token d'une URL
   */
  static extractAccessTokenFromUrl(url: string): string | null {
    const fragmentMatch = url.match(/#(.+)$/);
    if (!fragmentMatch) return null;

    const fragment = fragmentMatch[1];
    const tokenMatch = fragment.match(/access_token=([^&]+)/);
    
    return tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
  }

  /**
   * Login sur l'API EPITA avec le token Office365
   */
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

  /**
   * Sauvegarde les tokens
   */
  static async saveTokens(officeToken: string, epitaJwt: string): Promise<void> {
    await Promise.all([
      AsyncStorage.setItem(this.STORAGE_KEYS.OFFICE_TOKEN, officeToken),
      AsyncStorage.setItem(this.STORAGE_KEYS.EPITA_JWT, epitaJwt),
    ]);
  }

  /**
   * Récupère le JWT EPITA
   */
  static async getEpitaToken(): Promise<string | null> {
    return await AsyncStorage.getItem(this.STORAGE_KEYS.EPITA_JWT);
  }

  /**
   * Vérifie si authentifié
   */
  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getEpitaToken();
    return token !== null;
  }

  // services/AuthService.ts (ajoute à la fin du fichier, avant le dernier })

/**
 * Récupère les informations de l'utilisateur via Microsoft Graph
 */
static async getUserInfo(): Promise<{
  name: string;
  email: string;
  firstName: string;
  lastName: string;
  photo?: string;
} | null> {
  try {
    const officeToken = await AsyncStorage.getItem(this.STORAGE_KEYS.OFFICE_TOKEN);

    if (!officeToken) {
      console.log('❌ Pas de token Office365');
      return null;
    }

    // Récupère les infos du profil
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

    console.log('✅ Profil récupéré:', {
      displayName: profileData.displayName,
      mail: profileData.mail || profileData.userPrincipalName,
    });

    // Récupère la photo de profil
    let photoUrl: string | undefined;
    try {
      const photoResponse = await fetch('https://graph.microsoft.com/v1.0/me/photo/$value', {
        headers: {
          'Authorization': `Bearer ${officeToken}`,
        },
      });

      if (photoResponse.ok) {
        const photoBlob = await photoResponse.blob();
        
        // Convertit le blob en base64 pour l'affichage
        const reader = new FileReader();
        photoUrl = await new Promise((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(photoBlob);
        });

        console.log('✅ Photo de profil récupérée');
      } else {
        console.log('⚠️ Pas de photo de profil');
      }
    } catch (photoError) {
      console.log('⚠️ Erreur photo (normal si pas de photo):', photoError);
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

/**
 * Teste les permissions disponibles
 */
static async testAvailablePermissions(): Promise<void> {
  try {
    const officeToken = await AsyncStorage.getItem(this.STORAGE_KEYS.OFFICE_TOKEN);

    if (!officeToken) {
      console.log('❌ Pas de token');
      return;
    }

    console.log('🧪 Test des permissions disponibles...\n');

    // Test 1 : Profil basique
    const tests = [
      {
        name: 'Profil utilisateur (/me)',
        url: 'https://graph.microsoft.com/v1.0/me',
      },
      {
        name: 'Photo de profil (/me/photo/$value)',
        url: 'https://graph.microsoft.com/v1.0/me/photo/$value',
      },
      {
        name: 'Calendriers (/me/calendars)',
        url: 'https://graph.microsoft.com/v1.0/me/calendars',
      },
      {
        name: 'Événements (/me/events)',
        url: 'https://graph.microsoft.com/v1.0/me/events',
      },
      {
        name: 'Groupes (/me/memberOf)',
        url: 'https://graph.microsoft.com/v1.0/me/memberOf',
      },
      {
        name: 'Mails (/me/messages)',
        url: 'https://graph.microsoft.com/v1.0/me/messages',
      },
    ];

    for (const test of tests) {
      try {
        const response = await fetch(test.url, {
          headers: {
            'Authorization': `Bearer ${officeToken}`,
          },
        });

        if (response.ok) {
          console.log(`✅ ${test.name}: OK`);
          const data = await response.json();
          console.log(`   → Données:`, JSON.stringify(data, null, 2).substring(0, 200));
        } else {
          console.log(`❌ ${test.name}: ${response.status} - ${response.statusText}`);
        }
      } catch (error: any) {
        console.log(`❌ ${test.name}: Error - ${error.message}`);
      }
      console.log(''); // Ligne vide
    }

  } catch (error) {
    console.error('❌ Erreur test permissions:', error);
  }
}

/**
 * 🧪 Teste les endpoints EPITA disponibles
 */
static async testEpitaEndpoints(): Promise<void> {
  try {
    const epitaToken = await this.getEpitaToken();

    if (!epitaToken) {
      console.log('❌ Pas de token EPITA');
      return;
    }

    console.log('🧪 Test des endpoints EPITA...\n');

    const tests = [
      // ⭐ Endpoints qui devraient marcher
      {
        name: '🎯 Group Hierarchy (IMPORTANT)',
        url: `${this.EPITA_API_URL}/group/hierarchy`,
      },
      {
        name: '📋 Group List',
        url: `${this.EPITA_API_URL}/group`,
      },
      {
        name: '📄 Group with Paging',
        url: `${this.EPITA_API_URL}/group/withpaging`,
      },
    ];

    for (const test of tests) {
      try {
        console.log(`\n🔍 Test: ${test.name}`);
        console.log(`   URL: ${test.url}`);
        
        const response = await fetch(test.url, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${epitaToken}`,
            'Accept': 'application/json',
          },
        });

        console.log(`   Status: ${response.status}`);

        if (response.ok) {
          const contentType = response.headers.get('content-type');
          console.log(`   Content-Type: ${contentType}`);
          
          if (contentType?.includes('application/json')) {
            const data = await response.json();
            console.log(`   ✅ SUCCESS!`);
            console.log(`   📊 Données (preview):`, JSON.stringify(data, null, 2).substring(0, 500));
            
            // Si c'est la hiérarchie, affiche plus d'infos
            if (test.name.includes('Hierarchy')) {
              console.log(`\n   🌳 Structure complète:`);
              console.log(JSON.stringify(data, null, 2));
            }
          } else {
            const text = await response.text();
            console.log(`   ✅ SUCCESS (text)`);
            console.log(`   📄 Texte:`, text.substring(0, 200));
          }
        } else {
          const errorText = await response.text();
          console.log(`   ❌ FAILED: ${response.status}`);
          if (errorText) {
            console.log(`   Error:`, errorText.substring(0, 300));
          }
        }
      } catch (error: any) {
        console.log(`   ❌ ERROR: ${error.message}`);
      }
    }

    console.log('\n\n🎯 NEXT STEP:');
    console.log('Si Group Hierarchy fonctionne, on pourra créer un sélecteur de groupe !');

  } catch (error) {
    console.error('❌ Erreur globale:', error);
  }
}

  /**
   * Déconnexion
   */
  static async logout(): Promise<void> {
    await Promise.all([
      AsyncStorage.removeItem(this.STORAGE_KEYS.OFFICE_TOKEN),
      AsyncStorage.removeItem(this.STORAGE_KEYS.EPITA_JWT),
    ]);
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