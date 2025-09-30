// hook/useGroupTree.ts

import type { TreeNode } from '@/types/groups';
import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { GroupTreeService } from '../services/GroupTreeService';

export function useGroupTree(): UseQueryResult<TreeNode[], Error> {
  return useQuery<TreeNode[], Error>({
    queryKey: ['groupTree'],
    queryFn: async () => {
      try {
        return await GroupTreeService.getGroupTree();
      } catch (error) {
        console.error('❌ Error fetching group tree:', error);
        throw error;
      }
    },
    staleTime: 1000 * 60 * 60, // Les données restent "fresh" pendant 1h
    gcTime: 1000 * 60 * 60 * 24, // Les données en cache sont gardées 24h
    retry: 2, // Réessaye 2 fois en cas d'erreur
    refetchOnWindowFocus: false, // Ne refetch pas au focus
  });
}