// components/QuickNavigation.tsx
import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

interface QuickNavigationProps {
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  periodLabel: string;
  canGoPrevious: boolean;
  canGoNext: boolean;
  viewType: 'week' | 'month';
}

export const QuickNavigation: React.FC<QuickNavigationProps> = ({
  onPrevious,
  onNext,
  onToday,
  periodLabel,
  canGoPrevious,
  canGoNext,
  viewType
}) => {
  return (
    <View style={styles.container}>
      {/* Ligne de navigation */}
      <View style={styles.navigationRow}>
        <TouchableOpacity 
          style={[styles.navButton, !canGoPrevious && styles.navButtonDisabled]}
          onPress={onPrevious}
          disabled={!canGoPrevious}
        >
          <Text style={[styles.navButtonText, !canGoPrevious && styles.navButtonTextDisabled]}>
            ← {viewType === 'week' ? 'Semaine précédente' : 'Mois précédent'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.todayButton} onPress={onToday}>
          <Text style={styles.todayButtonText}>Aujourd'hui</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.navButton, !canGoNext && styles.navButtonDisabled]}
          onPress={onNext}
          disabled={!canGoNext}
        >
          <Text style={[styles.navButtonText, !canGoNext && styles.navButtonTextDisabled]}>
            {viewType === 'week' ? 'Semaine suivante' : 'Mois suivant'} →
          </Text>
        </TouchableOpacity>
      </View>

      {/* Ligne de période */}
      <View style={styles.periodRow}>
        <Text style={styles.periodLabel}>{periodLabel}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef'
  },
  navigationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12
  },
  navButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    flex: 1,
    marginHorizontal: 4
  },
  navButtonDisabled: {
    opacity: 0.5
  },
  navButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#495057',
    textAlign: 'center'
  },
  navButtonTextDisabled: {
    color: '#adb5bd'
  },
  todayButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#3498db',
    marginHorizontal: 8
  },
  todayButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff'
  },
  periodRow: {
    alignItems: 'center',
    paddingBottom: 12
  },
  periodLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    textTransform: 'capitalize'
  }
});