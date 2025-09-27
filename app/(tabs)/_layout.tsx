// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { useMemo } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import TabBarIcon from '../../components/navigation/TabBarIcon';
import { COLORS } from '../../styles/screenStyles';

// Types pour une meilleure type safety
interface TabBarIconProps {
  color: string;
}

export default function TabLayout() {
  const insets = useSafeAreaInsets();

  // Optimisation des performances avec useMemo
  const screenOptions = useMemo(() => ({
    tabBarActiveTintColor: COLORS.primary,
    tabBarInactiveTintColor: COLORS.secondary,
    headerShown: false,
    tabBarStyle: {
      backgroundColor: COLORS.cardBackground,
      borderRadius: 2500, // make it round
      marginHorizontal: 20,
      marginBottom: insets.bottom + 10,
      paddingTop: 8,
      paddingBottom: 8,
      height: 70,
      position: 'absolute' as const,
      borderWidth: 0,
      elevation: 3,
    },
    tabBarLabelStyle: { // labels
      fontSize: 12,
      fontWeight: '600' as const,
      marginBottom: 4,
    },
    tabBarItemStyle: { // icons
      borderRadius: 20,
      marginHorizontal: 4,
      paddingVertical: 4,
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
    </Tabs>
  );
}