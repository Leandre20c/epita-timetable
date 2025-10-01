// app/_layout.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useBackgroundNotifications } from '../hook/useBackgroundNotifications';
import SubjectColorService from '../services/SubjectColorService';

export default function RootLayout() {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000,
        gcTime: 60 * 60 * 1000,
        retry: 2,
        refetchOnWindowFocus: false,
        refetchOnMount: true,
      },
    },
  }));

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
    <QueryClientProvider client={queryClient}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="login" />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}