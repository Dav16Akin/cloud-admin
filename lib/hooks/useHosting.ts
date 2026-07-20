'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminHostingApi,
  updateHostingApi,
  deleteHostingApi,
  AdminHostingAccount,
} from '@/lib/api/hosting';

const HOSTING_KEY = ['admin-hosting'] as const;

export function useAdminHosting() {
  return useQuery({
    queryKey: HOSTING_KEY,
    queryFn: getAdminHostingApi,
  });
}

export function useUpdateHosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Parameters<typeof updateHostingApi>[1] }) =>
      updateHostingApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOSTING_KEY });
    },
  });
}

export function useDeleteHosting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteHostingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: HOSTING_KEY });
    },
  });
}
