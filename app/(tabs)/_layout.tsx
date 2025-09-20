// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import TabBarIcon from '../../components/navigation/TabBarIcon';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#3498db',
        tabBarInactiveTintColor: '#7f8c8d',
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#e9ecef',
          borderTopWidth: 1,
          paddingTop: 8,
          paddingBottom: 8,
          height: 70
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600'
        }
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Jour',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="day" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="week"
        options={{
          title: 'Semaine',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="week" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="month"
        options={{
          title: 'Mois',
          tabBarIcon: ({ color }) => (
            <TabBarIcon name="month" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}