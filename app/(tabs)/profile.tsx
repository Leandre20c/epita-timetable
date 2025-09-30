// app/(tabs)/profile.tsx

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function ProfileScreen() {
  const handleTestAPI = async () => {
    try {
      console.log('🧪 Testing ZEUS API...');
      
      const response = await fetch('https://zeus.ionis-it.com/api/group/hierarchy');
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        console.error('❌ Failed:', response.status);
        return;
      }
      
      const data = await response.json();
      console.log('✅ SUCCESS! Data:', JSON.stringify(data, null, 2));
      
    } catch (error) {
      console.error('❌ Error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profil</Text>
      
      {/* Bouton de Test Temporaire */}
      <TouchableOpacity 
        style={styles.testButton} 
        onPress={handleTestAPI}
      >
        <Text style={styles.testButtonText}>🧪 Test API ZEUS</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 20,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});