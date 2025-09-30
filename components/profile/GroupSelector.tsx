// components/profile/GroupSelector.tsx

import { useGroupTree } from '@/hook/useGroupTree';
import { CalendarService } from '@/services/CalendarService';
import { UserPreferencesService } from '@/services/UserPreferencesService';
import { COLORS } from '@/styles/screenStyles';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface GroupSelectorProps {
  onGroupChanged?: () => void;
}

export function GroupSelector({ onGroupChanged }: GroupSelectorProps) {
  const { data: tree, isLoading, error, refetch } = useGroupTree();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [expandedYears, setExpandedYears] = useState<Set<string>>(new Set());
  const [expandedSpecs, setExpandedSpecs] = useState<Set<string>>(new Set());

  // Charger le groupe sélectionné au montage
  useEffect(() => {
    loadSelectedGroup();
  }, []);

  const loadSelectedGroup = async () => {
    const group = await UserPreferencesService.getSelectedGroup();
    setSelectedGroup(group);
  };

  const handleSelectGroup = async (groupId: string) => {
    try {
      await UserPreferencesService.setSelectedGroup(groupId);
      setSelectedGroup(groupId);
      
      // Invalider le cache du calendrier
      CalendarService.clearCache();
      
      setIsModalVisible(false);
      
      Alert.alert(
        '✅ Groupe modifié',
        `Votre planning est maintenant configuré pour ${groupId}`,
        [{ text: 'OK' }]
      );

      // Notifier le parent pour rafraîchir
      onGroupChanged?.();
      
    } catch (error) {
      Alert.alert(
        '❌ Erreur',
        'Impossible de sauvegarder votre choix',
        [{ text: 'OK' }]
      );
    }
  };

  const toggleYear = (yearId: string) => {
    const newExpanded = new Set(expandedYears);
    if (newExpanded.has(yearId)) {
      newExpanded.delete(yearId);
    } else {
      newExpanded.add(yearId);
    }
    setExpandedYears(newExpanded);
  };

  const toggleSpec = (specId: string) => {
    const newExpanded = new Set(expandedSpecs);
    if (newExpanded.has(specId)) {
      newExpanded.delete(specId);
    } else {
      newExpanded.add(specId);
    }
    setExpandedSpecs(newExpanded);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.button}
        onPress={() => setIsModalVisible(true)}
      >
        <Text style={styles.buttonText}>
          {selectedGroup || 'Sélectionner ma classe'}
        </Text>
        <Text style={styles.buttonIcon}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Choisir ma classe</Text>
              <TouchableOpacity
                onPress={() => setIsModalVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.closeButtonText}>✕</Text>
              </TouchableOpacity>
            </View>

            {isLoading && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={COLORS.primary} />
                <Text style={styles.loadingText}>Chargement des classes...</Text>
              </View>
            )}

            {error && (
              <View style={styles.errorContainer}>
                <Text style={styles.errorText}>
                  Erreur lors du chargement des classes
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => refetch()}
                >
                  <Text style={styles.retryButtonText}>Réessayer</Text>
                </TouchableOpacity>
              </View>
            )}

            {tree && (
              <ScrollView style={styles.scrollView}>
                {tree.map(yearNode => (
                  <View key={yearNode.id}>
                    <TouchableOpacity
                      style={styles.yearButton}
                      onPress={() => toggleYear(yearNode.id)}
                    >
                      <Text style={styles.yearText}>
                        {expandedYears.has(yearNode.id) ? '▼' : '▶'} {yearNode.label}
                      </Text>
                    </TouchableOpacity>

                    {expandedYears.has(yearNode.id) && yearNode.children?.map(specNode => (
                      <View key={specNode.id} style={styles.specContainer}>
                        <TouchableOpacity
                          style={styles.specButton}
                          onPress={() => toggleSpec(specNode.id)}
                        >
                          <Text style={styles.specText}>
                            {expandedSpecs.has(specNode.id) ? '▼' : '▶'} {specNode.label}
                          </Text>
                        </TouchableOpacity>

                        {expandedSpecs.has(specNode.id) && specNode.children?.map(groupNode => (
                          <TouchableOpacity
                            key={groupNode.id}
                            style={[
                              styles.groupButton,
                              selectedGroup === groupNode.value && styles.groupButtonSelected
                            ]}
                            onPress={() => handleSelectGroup(groupNode.value)}
                          >
                            <Text style={[
                              styles.groupText,
                              selectedGroup === groupNode.value && styles.groupTextSelected
                            ]}>
                              {groupNode.label}
                            </Text>
                            {selectedGroup === groupNode.value && (
                              <Text style={styles.checkmark}>✓</Text>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    ))}
                  </View>
                ))}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  button: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    color: '#fff',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.light.text.primary,
  },
  closeButton: {
    padding: 4,
  },
  closeButtonText: {
    fontSize: 24,
    color: COLORS.light.text.secondary,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.light.text.secondary,
  },
  errorContainer: {
    padding: 40,
    alignItems: 'center',
  },
  errorText: {
    color: '#e74c3c',
    marginBottom: 16,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  scrollView: {
    padding: 16,
  },
  yearButton: {
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  yearText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.light.text.primary,
  },
  specContainer: {
    marginLeft: 20,
  },
  specButton: {
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  specText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.light.text.primary,
  },
  groupButton: {
    marginLeft: 20,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginVertical: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  groupButtonSelected: {
    backgroundColor: COLORS.primary + '20',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  groupText: {
    fontSize: 15,
    color: COLORS.light.text.primary,
  },
  groupTextSelected: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  checkmark: {
    fontSize: 18,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
});