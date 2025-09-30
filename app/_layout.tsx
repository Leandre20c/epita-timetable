// app/_layout.tsx

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useBackgroundNotifications } from '../hook/useBackgroundNotifications';
import SubjectColorService from '../services/SubjectColorService';

export default function RootLayout() {
  // Créer une instance de QueryClient (une seule fois)
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute - les données restent "fresh"
        gcTime: 60 * 60 * 1000, // 1 heure - durée de conservation en cache
        retry: 2, // Réessaye 2 fois en cas d'erreur
        refetchOnWindowFocus: false, // Ne pas refetch quand l'app revient au premier plan
        refetchOnMount: true, // Refetch au montage du composant
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
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </GestureHandlerRootView>
    </QueryClientProvider>
  );
}