'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  getAdminVpsPlansApi,
  createVpsPlanApi,
  updateVpsPlanApi,
  deleteVpsPlanApi,
  VpsPlanInput,
} from '@/lib/api/vpsPlans';

const VPS_PLANS_KEY = ['admin-vps-plans'] as const;

export function useAdminVpsPlans() {
  return useQuery({
    queryKey: VPS_PLANS_KEY,
    queryFn: getAdminVpsPlansApi,
  });
}

export function useCreateVpsPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createVpsPlanApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VPS_PLANS_KEY });
    },
  });
}

export function useUpdateVpsPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<VpsPlanInput> }) =>
      updateVpsPlanApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VPS_PLANS_KEY });
    },
  });
}

export function useDeleteVpsPlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteVpsPlanApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: VPS_PLANS_KEY });
    },
  });
}
