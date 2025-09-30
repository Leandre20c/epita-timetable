// services/groupTreeBuilder.ts

import type { GroupInfo, TreeNode } from '@/types/groups';

export function buildGroupTree(groups: GroupInfo[]): TreeNode[] {
  const tree: Record<string, any> = {};
  
  groups.forEach(({ fullPath, year, specialization, group }) => {
    // Crée la structure: Année → Spécialité → Groupe
    
    if (!tree[year]) {
      tree[year] = {
        id: year,
        label: year,
        value: year,
        children: {}
      };
    }
    
    if (!tree[year].children[specialization]) {
      tree[year].children[specialization] = {
        id: `${year}-${specialization}`,
        label: specialization,
        value: `${year}-${specialization}`,
        children: []
      };
    }
    
    tree[year].children[specialization].children.push({
      id: fullPath,
      label: group.replace('GR', 'Groupe '),
      value: fullPath,
    });
  });
  
  // Convertir l'objet en array
  return Object.values(tree).map(yearNode => ({
    ...yearNode,
    children: Object.values(yearNode.children)
  }));
}