// services/UserPreferencesService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEYS = {
  SELECTED_GROUP: '@epita_timetable:selected_group',
};

/**
 * Service pour gérer les préférences utilisateur
 */
export class UserPreferencesService {
  /**
   * Sauvegarde le groupe sélectionné par l'utilisateur
   * @param groupId - Ex: "B3-DEV-GR1"
   */
  static async setSelectedGroup(groupId: string): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_GROUP, groupId);
      console.log('✅ Groupe sauvegardé:', groupId);
    } catch (error) {
      console.error('❌ Erreur lors de la sauvegarde du groupe:', error);
      throw error;
    }
  }

  /**
   * Récupère le groupe sélectionné par l'utilisateur
   * @returns groupId ou null si aucun groupe n'est sélectionné
   */
  static async getSelectedGroup(): Promise<string | null> {
    try {
      const groupId = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_GROUP);
      console.log('📖 Groupe récupéré:', groupId || 'Aucun');
      return groupId;
    } catch (error) {
      console.error('❌ Erreur lors de la récupération du groupe:', error);
      return null;
    }
  }

  /**
   * Supprime le groupe sélectionné
   */
  static async clearSelectedGroup(): Promise<void> {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SELECTED_GROUP);
      console.log('🗑️ Groupe supprimé');
    } catch (error) {
      console.error('❌ Erreur lors de la suppression du groupe:', error);
      throw error;
    }
  }

  /**
   * Vérifie si un groupe est sélectionné
   */
  static async hasSelectedGroup(): Promise<boolean> {
    const group = await this.getSelectedGroup();
    return group !== null;
  }
}