// services/GroupTreeService.ts (nouveau fichier)

import type { TreeNode } from '@/types/groups';
import { extractGroupsFromICS } from './groupExtractor';
import { buildGroupTree } from './TreeBuilder';

const ICS_URL = 'https://zeus.ionis-it.com/api/group/1/ics/q2GXJsFwfL';

export class GroupTreeService {
  private static cache: TreeNode[] | null = null;
  private static cacheTime: number = 0;
  private static CACHE_DURATION = 1000 * 60 * 60; // 1h

  static async getGroupTree(): Promise<TreeNode[]> {
    const now = Date.now();
    
    // Retourne le cache s'il est valide
    if (this.cache && (now - this.cacheTime) < this.CACHE_DURATION) {
      return this.cache;
    }
    
    // Sinon, fetch les données
    const groups = await extractGroupsFromICS(ICS_URL);
    const tree = buildGroupTree(groups);
    
    // Met à jour le cache
    this.cache = tree;
    this.cacheTime = now;
    
    return tree;
  }
  
  static clearCache() {
    this.cache = null;
    this.cacheTime = 0;
  }
}