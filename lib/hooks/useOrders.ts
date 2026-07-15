'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrdersApi, reconcileOrderApi } from '@/lib/api/orders';

const ORDERS_KEY = ['orders'] as const;

export function useOrders() {
  return useQuery({
    queryKey: ORDERS_KEY,
    queryFn: getOrdersApi,
  });
}

export function useReconcileOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (orderId: string) => reconcileOrderApi(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
    },
  });
}
