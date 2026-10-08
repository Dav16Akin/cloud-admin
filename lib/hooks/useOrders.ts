'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getOrdersApi, reconcileOrderApi } from '@/lib/api/orders';
import type { Order, WhmcsSyncGaps } from '@/types';

const ORDERS_KEY = ['orders'] as const;
const WHMCS_GAPS_KEY = ['whmcs-sync-gaps'] as const;

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
    onSuccess: (updatedOrder, orderId) => {
      // Optimistically remove reconciled order from WHMCS sync gaps cache so it immediately disappears
      queryClient.setQueryData<WhmcsSyncGaps>(WHMCS_GAPS_KEY, (old) => {
        if (!old) return old;
        return {
          ...old,
          orders: old.orders.filter((o) => o.id !== orderId),
        };
      });

      // Update the orders query cache if it exists
      queryClient.setQueryData<Order[]>(ORDERS_KEY, (old) => {
        if (!old) return old;
        return old.map((o) => (o.id === orderId ? { ...o, ...updatedOrder } : o));
      });

      // Invalidate and refresh all related endpoints so they fetch the latest state
      queryClient.invalidateQueries({ queryKey: ORDERS_KEY });
      queryClient.invalidateQueries({ queryKey: WHMCS_GAPS_KEY });
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['user-activity'] });
      queryClient.invalidateQueries({ queryKey: ['admin-hosting'] });
      queryClient.invalidateQueries({ queryKey: ['profit-loss'] });
    },
  });
}
