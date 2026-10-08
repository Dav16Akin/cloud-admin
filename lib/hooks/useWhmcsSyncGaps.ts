'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWhmcsSyncGapsApi, syncWhmcsUserApi } from '@/lib/api/whmcs';
import type { WhmcsSyncGaps } from '@/types';

const WHMCS_GAPS_KEY = ['whmcs-sync-gaps'] as const;

export function useWhmcsSyncGaps() {
  return useQuery({
    queryKey: WHMCS_GAPS_KEY,
    queryFn: getWhmcsSyncGapsApi,
  });
}

export function useSyncWhmcsUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => syncWhmcsUserApi(userId),
    onSuccess: (_, userId) => {
      // Optimistically remove synced user from WHMCS sync gaps cache so they immediately disappear
      queryClient.setQueryData<WhmcsSyncGaps>(WHMCS_GAPS_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          users: old.users.filter((u) => u.id !== userId),
        };
      });

      // Invalidate related endpoints to refresh from server
      queryClient.invalidateQueries({ queryKey: WHMCS_GAPS_KEY });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-activity'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hosting'] });
      queryClient.invalidateQueries({ queryKey: ['profit-loss'] });
    },
  });
}
