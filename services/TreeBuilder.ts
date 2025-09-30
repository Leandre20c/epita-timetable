// services/treeBuilder.ts

import type { GroupInfo, TreeNode } from '@/types/groups';

export function buildGroupTree(groups: GroupInfo[]): TreeNode[] {
  const yearMap: Record<string, {
    id: string;
    label: string;
    value: string;
    children: Record<string, TreeNode>;
  }> = {};
  
  groups.forEach(({ fullPath, year, specialization, group }) => {
    if (!yearMap[year]) {
      yearMap[year] = {
        id: year,
        label: year,
        value: year,
        children: {}
      };
    }
    
    const yearNode = yearMap[year];
    
    if (!yearNode.children[specialization]) {
      yearNode.children[specialization] = {
        id: `${year}-${specialization}`,
        label: specialization,
        value: `${year}-${specialization}`,
        children: []
      };
    }
    
    const specNode = yearNode.children[specialization];
    specNode.children = specNode.children || [];
    specNode.children.push({
      id: fullPath,
      label: group.replace('GR', 'Groupe '),
      value: fullPath
    });
  });
  
  return Object.values(yearMap)
    .map(yearNode => ({
      ...yearNode,
      children: Object.values(yearNode.children)
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}