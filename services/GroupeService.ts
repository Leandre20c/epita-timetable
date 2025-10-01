// services/GroupService.ts

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthService } from './AuthService';

export interface Group {
  id: number;
  idParent: number | null;
  name: string;
  path: string;
  count: number;
  color: string;
  isVisible: boolean;
  children?: Group[];
}

export interface GroupNode {
  id: number;
  name: string;
  path: string;
  count: number;
  color: string;
  children: GroupNode[];
  level: number;
}

export class GroupService {
  private static readonly STORAGE_KEY = '@selected_group';
  private static readonly API_URL = 'https://zeus.ionis-it.com/api';

  /**
   * Récupère tous les groupes (liste plate)
   */
  static async fetchAllGroups(): Promise<Group[]> {
    const token = await AuthService.getEpitaToken();

    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`${this.API_URL}/group`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Récupère la hiérarchie complète
   */
  static async fetchGroupHierarchy(): Promise<GroupNode[]> {
    const token = await AuthService.getEpitaToken();

    if (!token) {
      throw new Error('Non authentifié');
    }

    const response = await fetch(`${this.API_URL}/group/hierarchy`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Erreur API: ${response.status}`);
    }

    const data = await response.json();
    return this.transformHierarchy(data, 0);
  }

  /**
   * Transforme la hiérarchie en format utilisable
   */
  private static transformHierarchy(nodes: any[], level: number): GroupNode[] {
    return nodes.map(node => ({
      id: node.id,
      name: node.name,
      path: this.buildPath(node),
      count: node.count || 0,
      color: node.color || '#759bf5',
      children: node.children ? this.transformHierarchy(node.children, level + 1) : [],
      level,
    }));
  }

  /**
   * Construit le chemin complet d'un groupe
   */
  private static buildPath(node: any): string {
    return node.name.toLowerCase().replace(/\s+/g, '_');
  }

  /**
   * Recherche dans l'arborescence
   */
  static searchGroups(nodes: GroupNode[], query: string): GroupNode[] {
    const lowerQuery = query.toLowerCase();
    const results: GroupNode[] = [];

    const search = (items: GroupNode[]) => {
      for (const item of items) {
        if (item.name.toLowerCase().includes(lowerQuery)) {
          results.push(item);
        }
        if (item.children.length > 0) {
          search(item.children);
        }
      }
    };

    search(nodes);
    return results;
  }

  /**
   * Sauvegarde le groupe sélectionné
   */
  static async saveSelectedGroup(group: GroupNode): Promise<void> {
    await AsyncStorage.setItem(this.STORAGE_KEY, JSON.stringify(group));
  }

  /**
   * Récupère le groupe sélectionné
   */
  static async getSelectedGroup(): Promise<GroupNode | null> {
    const data = await AsyncStorage.getItem(this.STORAGE_KEY);
    return data ? JSON.parse(data) : null;
  }

  /**
   * Récupère l'emploi du temps d'un groupe
   */
  static async fetchGroupCalendar(groupId: number, startDate?: Date): Promise<string> {
    const token = await AuthService.getEpitaToken();

    if (!token) {
      throw new Error('Non authentifié');
    }

    // Par défaut : 1er septembre de l'année scolaire en cours
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-11
    
    // Si on est entre janvier et août, prendre septembre de l'année précédente
    // Sinon, prendre septembre de l'année en cours
    const startYear = currentMonth < 8 ? currentYear - 1 : currentYear;
    const defaultStartDate = new Date(startYear, 8, 1); // 1er septembre
    
    const date = startDate || defaultStartDate;
    const dateStr = date.toISOString().split('T')[0]; // Format YYYY-MM-DD

    const url = `${this.API_URL}/group/${groupId}/ics?startDate=${dateStr}`;
    
    console.log('📅 Récupération ICS depuis:', dateStr, 'pour groupe:', groupId);

    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'text/calendar',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erreur API:', response.status, errorText);
      throw new Error(`Erreur API: ${response.status}`);
    }

    const icsContent = await response.text();
    console.log('✅ ICS reçu, taille:', icsContent.length, 'caractères');

    return icsContent;
  }
}