// components/navigation/TabBarIcon.tsx
import React from 'react';
import { Text } from 'react-native';

interface TabBarIconProps {
  name: string;
  color: string;
}

// Dans TabBarIcon.tsx
const TabBarIcon = ({ name, color }: TabBarIconProps) => {
  const getEmoji = (iconName: string) => {
    switch (iconName) {
      case 'calendar':
      case 'calendar-outline':
        return '📅';
      case 'grid':
      case 'grid-outline':
        return '📋';
      default:
        return '📱';
    }
  };

  return (
    <Text style={{ fontSize: 20, color }}>
      {getEmoji(name)}
    </Text>
  );
};

export default TabBarIcon;
