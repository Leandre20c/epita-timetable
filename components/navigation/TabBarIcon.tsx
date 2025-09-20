// components/navigation/TabBarIcon.tsx
import React from 'react';
import { Text } from 'react-native';

interface TabBarIconProps {
  name: string;
  color: string;
}

export default function TabBarIcon({ name, color }: TabBarIconProps) {
  const getEmoji = (iconName: string) => {
    switch (iconName) {
      // Icônes pour la vue jour
      case 'calendar':
      case 'calendar-outline':
        return '📅';
      
      // Icônes pour la vue semaine
      case 'grid':
      case 'grid-outline':
        return '📋';
      
      // Icônes pour la vue mois
      case 'calendar-month':
      case 'calendar-month-outline':
        return '🗓️';
        
      // Icônes génériques
      case 'day':
        return '📅';
      case 'week':
        return '📅';
      case 'month':
        return '📅';
        
      default:
        return '📱';
    }
  };

  return (
    <Text style={{ fontSize: 24, color }}>
      {getEmoji(name)}
    </Text>
  );
}