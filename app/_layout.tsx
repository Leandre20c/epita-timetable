// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useBackgroundNotifications } from '../hook/useBackgroundNotifications';
import SubjectColorService from '../services/SubjectColorService';

export default function RootLayout() {
  useBackgroundNotifications();

  useEffect(() => {
    const initializeApp = async () => {
      try {
        await SubjectColorService.loadColors();
        console.log('✅ Application initialisée');
      } catch (error) {
        console.error('❌ Erreur initialisation app:', error);
      }
    };

    initializeApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </GestureHandlerRootView>
  );
}