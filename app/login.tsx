// app/login.tsx

import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { AuthService } from '../services/AuthService';

export default function LoginScreen() {
  const webViewRef = useRef<WebView>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    // Génère l'URL d'authentification au chargement
    AuthService.getAuthUrl().then(setAuthUrl);
  }, []);

  /**
   * Intercepte les changements d'URL dans la WebView
   */
  const handleNavigationStateChange = async (navState: any) => {
    const { url } = navState;
    
    console.log('📍 Navigation:', url);

    // Si on arrive sur le redirect URI avec un token
    if (url.includes('zeus.ionis-it.com/officeConnect/') && url.includes('access_token=')) {
      
      if (isProcessing) return; // Évite les doublons
      setIsProcessing(true);

      console.log('🎯 Token détecté dans l\'URL !');

      try {
        // Extrait le token
        const officeToken = AuthService.extractAccessTokenFromUrl(url);

        if (!officeToken) {
          throw new Error('Token non trouvé dans l\'URL');
        }

        console.log('✅ Token Office365 extrait');

        // Login sur l'API EPITA
        const epitaJwt = await AuthService.loginToEpitaAPI(officeToken);

        console.log('✅ JWT EPITA obtenu');

        // Sauvegarde
        await AuthService.saveTokens(officeToken, epitaJwt);

        console.log('✅✅ Connexion réussie !');

        // Redirige vers l'app
        Alert.alert('✅ Connexion réussie !', '', [
          { text: 'OK', onPress: () => router.replace('/(tabs)') },
        ]);

      } catch (error: any) {
        console.error('❌ Erreur:', error);
        Alert.alert('❌ Erreur', error.message);
        setIsProcessing(false);
      }
    }
  };

  if (!authUrl) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ uri: authUrl }}
        onNavigationStateChange={handleNavigationStateChange}
        onLoadStart={() => console.log('🔄 Chargement...')}
        onLoadEnd={() => console.log('✅ Chargé')}
        style={styles.webView}
        // Important pour Office365
        userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
      />
      
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'white',
  },
  webView: {
    flex: 1,
  },
  processingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(102, 126, 234, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});