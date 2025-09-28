// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TabBarIcon from '../../components/navigation/TabBarIcon';
import { COLORS } from '../../styles/screenStyles';

import { FEATURES } from '../../config/feature';

// Types pour une meilleure type safety
interface TabBarIconProps {
  color: string;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // Optimisation des performances avec useMemo
  const screenOptions = useMemo(() => ({
    // Couleurs des tabs : bleu pour actif, gris neutre pour inactif
    tabBarActiveTintColor: COLORS.primary, // Bleu #102B65 pour tab active
    tabBarInactiveTintColor: COLORS.light.text.secondary, // Gris neutre pour tabs inactives
    headerShown: false,
    tabBarStyle: {
      backgroundColor: COLORS.light.cardBackground, // Blanc pur pour la tab bar
      borderRadius: 25, // Coins arrondis pour un look moderne
      marginHorizontal: 20,
      marginBottom: insets.bottom + 10,
      paddingTop: 8,
      paddingBottom: 8,
      height: 70,
      position: 'absolute' as const,
      borderWidth: 0,
      elevation: 5, // Ombre plus prononcée pour faire "flotter"
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
    },
    tabBarLabelStyle: {
      fontSize: 12,
      fontWeight: '600' as const,
      marginBottom: 4,
    },
    tabBarItemStyle: {
      borderRadius: 20,
      marginHorizontal: 4,
      paddingVertical: 4,
      // L'item actif aura un background bleu très clair automatiquement
    },
  }), [insets.bottom]);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Jour',
          tabBarIcon: ({ color }: TabBarIconProps) => (
            <TabBarIcon name="day" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="week"
        options={{
          title: 'Semaine',
          tabBarIcon: ({ color }: TabBarIconProps) => (
            <TabBarIcon name="week" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="month"
        options={{
          title: 'Mois',
          tabBarIcon: ({ color }: TabBarIconProps) => (
            <TabBarIcon name="month" color={color} />
          ),
        }}
      />
      {FEATURES.PROFILE_TAB && (
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profil',
            tabBarIcon: ({ color }: TabBarIconProps) => (
              <TabBarIcon name="profile" color={color} />
            ),
          }}
        />
      )}
    </Tabs>
  );
}