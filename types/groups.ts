// types/groups.ts

export interface GroupInfo {
  fullPath: string;      // "B3-DEV-GR1"
  year: string;          // "B3"
  specialization: string; // "DEV"
  group: string;         // "GR1"
}

export interface TreeNode {
  id: string;
  label: string;
  value: string;
  children?: TreeNode[];
}