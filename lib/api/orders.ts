import { api } from './client';
import type { Order } from '@/types';

export async function getOrdersApi(): Promise<Order[]> {
  return api<Order[]>('/admin/orders');
}

export async function reconcileOrderApi(orderId: string): Promise<Order> {
  return api<Order>(`/admin/reconcile-order/${orderId}`, {
    method: 'POST',
  });
}
