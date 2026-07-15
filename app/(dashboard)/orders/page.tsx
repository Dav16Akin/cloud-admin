'use client';

import { useState } from 'react';
import { useOrders, useReconcileOrder } from '@/lib/hooks/useOrders';
import { useUsers } from '@/lib/hooks/useUsers';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OrderStatus } from '@/types';

const statusVariant: Record<OrderStatus, 'success' | 'warning' | 'danger' | 'info' | 'default' | 'green'> = {
  PENDING: 'warning',
  ACTIVE: 'success',
  PAUSED: 'info',
  CANCELLED: 'danger',
  COMPLETED: 'default',
  PAID: 'green',
};

export default function OrdersPage() {
  const { data: orders, isLoading, error } = useOrders();
  const { data: users, isLoading: isUsersLoading } = useUsers();
  const reconcile = useReconcileOrder();

  const [showAmount, setShowAmount] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.localStorage.getItem('show-amounts');
      return saved !== 'false';
    }
    return true;
  });

  const toggleShowAmount = () => {
    setShowAmount((prev) => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('show-amounts', String(next));
      }
      return next;
    });
  };

  const userMap = new Map(users?.map((u) => [u.id, u]));
  const adminUserIds = new Set(
    users?.filter((u) => u.role === 'ADMIN').map((u) => u.id) ?? []
  );

  const totalOrders = orders?.length ?? 0;
  const paidOrders = orders?.filter((o) => o.status === 'PAID' || o.status === 'COMPLETED').length ?? 0;
  const pendingOrders = orders?.filter((o) => o.status === 'PENDING').length ?? 0;

  const totalGained = orders
    ?.filter(
      (order) =>
        (order.status === 'PAID' || order.status === 'COMPLETED' || order.status === 'ACTIVE') &&
        !adminUserIds.has(order.userId),
    )
    .reduce((sum, order) => sum + Number(order.amount), 0) ?? 0;

  function getUserName(userId: string): string {
    const user = userMap.get(userId);
    if (!user) return userId.slice(0, 8);
    if (user.firstName && user.lastName) return `${user.firstName} ${user.lastName}`;
    return user.email;
  }

  function formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', minimumFractionDigits: 0 }).format(amount);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-foreground mb-6">Orders</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoading ? <span className="text-muted-foreground">...</span> : totalOrders}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Paid Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#16a34a]">
              {isLoading ? <span className="text-muted-foreground">...</span> : paidOrders}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Pending Orders</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">
              {isLoading ? <span className="text-muted-foreground">...</span> : pendingOrders}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle>Total Gained</CardTitle>
            <button
              onClick={toggleShowAmount}
              className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer p-1"
              title={showAmount ? 'Hide Amount' : 'Show Amount'}
            >
              {showAmount ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815L21 21m-2.772-2.772-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                </svg>
              )}
            </button>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#e8900a]">
              {isLoading || isUsersLoading ? (
                <span className="text-muted-foreground">...</span>
              ) : showAmount ? (
                formatAmount(totalGained)
              ) : (
                '₦••••••'
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Orders</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="text-muted-foreground">Loading orders...</p>}
          {error && <p className="text-destructive">Failed to load orders.</p>}
          {orders && orders.length === 0 && (
            <p className="text-muted-foreground">No orders found.</p>
          )}
          {orders && orders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">ID</th>
                    <th className="pb-3 pr-4 font-medium">User</th>
                    <th className="pb-3 pr-4 font-medium">Amount</th>
                    <th className="pb-3 pr-4 font-medium">Status</th>
                    <th className="pb-3 pr-4 font-medium">WHMCS Invoice</th>
                    <th className="pb-3 pr-4 font-medium">Created</th>
                    <th className="pb-3 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...orders].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0">
                      <td className="py-3 pr-4 font-mono text-xs text-foreground">
                        {order.id.slice(0, 8)}...
                      </td>
                      <td className="py-3 pr-4 text-foreground">
                        {getUserName(order.userId)}
                      </td>
                      <td className="py-3 pr-4 text-foreground font-medium">
                        {formatAmount(order.amount)}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                      </td>
                      <td className="py-3 pr-4 font-mono text-xs text-muted-foreground">
                        {order.whmcsInvoiceId ?? '—'}
                      </td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3">
                        {!order.whmcsInvoiceId && (
                          <button
                            onClick={() => reconcile.mutate(order.id)}
                            disabled={reconcile.isPending}
                            className="btn-navy btn-sm text-xs"
                          >
                            {reconcile.isPending ? '...' : 'Reconcile'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
