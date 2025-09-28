// app/(tabs)/profile.tsx
import React from 'react';
import {
    Text,
    View
} from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { screenStyles } from '../../styles/screenStyles';

import { ArrowUpRight } from 'lucide-react-native';


export default function ProfileScreen() {
  return (

    <SafeAreaProvider>
        <SafeAreaView style={screenStyles.container}>
            <View style={screenStyles.appHeader}>
                <Text style={screenStyles.appTitle}>Epita TimeTable</Text>
                <Text style={screenStyles.appSubtitle}>Version 1.0.0</Text>
            </View>
            <View style={screenStyles.profileHeader}>
                <View style={screenStyles.profileTextContainer}>
                    <Text style={screenStyles.profileTypeClass}>Rennes Spe</Text>
                    <Text style={screenStyles.profileTypeGroup}>Groupe A</Text>
                </View>
                <View style={screenStyles.profileTypeSwitch}>
                    <ArrowUpRight size={60} color="#ffffff" />
                </View>
            </View>
        </SafeAreaView>
  </SafeAreaProvider>
  );
}