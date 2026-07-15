'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getWhmcsSyncGapsApi, syncWhmcsUserApi } from '@/lib/api/whmcs';

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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: WHMCS_GAPS_KEY });
    },
  });
}
