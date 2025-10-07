// app/login.tsx

import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { CustomAlert } from '../components/CustomAlert';
import { AuthService } from '../services/AuthService';

export default function LoginScreen() {
  const webViewRef = useRef<WebView>(null);
  const [authUrl, setAuthUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    AuthService.getAuthUrl().then(setAuthUrl);
  }, []);

  const handleNavigationStateChange = async (navState: any) => {
    const { url } = navState;
    
    console.log('📍 Navigation:', url);

    if (url.includes('zeus.ionis-it.com/officeConnect/') && url.includes('access_token=')) {
      
      if (isProcessing) return;
      setIsProcessing(true);

      console.log('🎯 Token détecté dans l\'URL !');

      try {
        const officeToken = AuthService.extractAccessTokenFromUrl(url);

        if (!officeToken) {
          throw new Error('Token non trouvé dans l\'URL');
        }

        console.log('✅ Token Office365 extrait');

        const epitaJwt = await AuthService.loginToEpitaAPI(officeToken);

        console.log('✅ JWT EPITA obtenu');

        await AuthService.saveTokens(officeToken, epitaJwt);

        console.log('✅✅ Connexion réussie !');

        setShowSuccessAlert(true);

      } catch (error: any) {
        console.error('❌ Erreur:', error);
        setErrorMessage(error.message || 'Une erreur est survenue');
        setShowErrorAlert(true);
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
        userAgent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
        sharedCookiesEnabled={true}
        thirdPartyCookiesEnabled={true}
      />
      
      {isProcessing && (
        <View style={styles.processingOverlay}>
          <ActivityIndicator size="large" color="white" />
        </View>
      )}

      {/* Alert de succès */}
      <CustomAlert
        visible={showSuccessAlert}
        title="Connexion réussie !"
        message="Vous pouvez désormais choisir un groupe."
        onConfirm={() => {
          setShowSuccessAlert(false);
          router.replace('/(tabs)/profile');
        }}
        confirmText="Continuer"
      />

      {/* Alert d'erreur */}
      <CustomAlert
        visible={showErrorAlert}
        title="Erreur"
        message={errorMessage}
        onConfirm={() => {
          setShowErrorAlert(false);
        }}
        confirmText="Réessayer"
        type="error"
      />
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