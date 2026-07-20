'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminPlansApi,
  createPlanApi,
  updatePlanApi,
  deletePlanApi,
  AdminPlan,
} from '@/lib/api/plans';

const PLANS_KEY = ['admin-plans'] as const;

export function useAdminPlans() {
  return useQuery({
    queryKey: PLANS_KEY,
    queryFn: getAdminPlansApi,
  });
}

export function useCreatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createPlanApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLANS_KEY });
    },
  });
}

export function useUpdatePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Omit<AdminPlan, 'id' | 'createdAt' | 'updatedAt'>> }) =>
      updatePlanApi(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLANS_KEY });
    },
  });
}

export function useDeletePlan() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePlanApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PLANS_KEY });
    },
  });
}
