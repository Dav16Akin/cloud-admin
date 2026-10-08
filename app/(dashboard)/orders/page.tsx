'use client';

import { useState } from 'react';
import { useOrders, useReconcileOrder } from '@/lib/hooks/useOrders';
import { useUsers } from '@/lib/hooks/useUsers';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RowDetailDrawer } from '@/components/ui/row-detail-drawer';
import {
  RefreshCw,
  Check,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  EyeOff,
  MoreHorizontal,
} from 'lucide-react';
import type { OrderStatus } from '@/types';

const statusVariant: Record<
  OrderStatus,
  'success' | 'warning' | 'danger' | 'info' | 'default' | 'green'
> = {
  PENDING: 'warning',
  ACTIVE: 'success',
  PAUSED: 'info',
  CANCELLED: 'danger',
  COMPLETED: 'default',
  PAID: 'green',
  FAILED: 'danger',
};

export default function OrdersPage() {
  const { data: orders, isLoading, error, refetch, isFetching } = useOrders();
  const { data: users, isLoading: isUsersLoading } = useUsers();
  const reconcile = useReconcileOrder();

  const [inspectedOrder, setInspectedOrder] = useState<any | null>(null);
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PAID' | 'PENDING'>('ALL');

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleReconcileOrder = async (orderId: string) => {
    try {
      await reconcile.mutateAsync(orderId);
      showToast(`Order ${orderId.slice(0, 8)}... reconciled successfully`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to reconcile order', 'error');
    }
  };

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
  const adminUserIds = new Set(users?.filter((u) => u.role === 'ADMIN').map((u) => u.id) ?? []);

  const totalOrders = orders?.length ?? 0;
  const paidOrders =
    orders?.filter((o) => o.status === 'PAID' || o.status === 'COMPLETED').length ?? 0;
  const pendingOrders = orders?.filter((o) => o.status === 'PENDING').length ?? 0;

  const totalGained =
    orders
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
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(amount);
  }

  const filteredOrders = (orders ?? [])
    .filter((order) => {
      if (statusFilter === 'PAID') return order.status === 'PAID' || order.status === 'COMPLETED';
      if (statusFilter === 'PENDING') return order.status === 'PENDING';
      return true;
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="relative space-y-6">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl border px-4 py-3 shadow-lg transition-all duration-300 ${
            notification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-800'
          }`}
        >
          {notification.type === 'success' ? (
            <Check size={18} className="text-emerald-600" />
          ) : (
            <AlertCircle size={18} className="text-rose-600" />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Orders overview</h1>
          <p className="mt-1 text-xs text-[#64748b]">
            Top metrics, customer invoices, and WHMCS settlement at a glance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Pills */}
          <div className="flex items-center rounded-lg border border-[#e2e8f0] bg-slate-100 p-1 text-xs">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`rounded-md px-3 py-1 transition-colors ${
                statusFilter === 'ALL'
                  ? 'bg-white font-medium text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('PAID')}
              className={`rounded-md px-3 py-1 transition-colors ${
                statusFilter === 'PAID'
                  ? 'bg-white font-medium text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => setStatusFilter('PENDING')}
              className={`rounded-md px-3 py-1 transition-colors ${
                statusFilter === 'PENDING'
                  ? 'bg-white font-medium text-[#0f172a] shadow-xs'
                  : 'text-[#64748b] hover:text-[#0f172a]'
              }`}
            >
              Pending
            </button>
          </div>

          <Button
            variant="navy"
            size="sm"
            onClick={async () => {
              await refetch();
              showToast('Orders refreshed', 'success');
            }}
            disabled={isLoading || isFetching}
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Top Metric Cards - 4 Columns */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total orders</CardTitle>
            <MoreHorizontal size={14} className="text-[#94a3b8]" />
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-bold tracking-tight text-[#0f172a]">
              {isLoading ? (
                <span className="text-[#94a3b8]">...</span>
              ) : (
                totalOrders.toLocaleString()
              )}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <ArrowUpRight size={13} />
              <span>Platform lifetime</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Paid orders</CardTitle>
            <MoreHorizontal size={14} className="text-[#94a3b8]" />
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-bold tracking-tight text-[#0f172a]">
              {isLoading ? (
                <span className="text-[#94a3b8]">...</span>
              ) : (
                paidOrders.toLocaleString()
              )}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <ArrowUpRight size={13} />
              <span>Settled invoices</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pending orders</CardTitle>
            <MoreHorizontal size={14} className="text-[#94a3b8]" />
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-bold tracking-tight text-amber-600">
              {isLoading ? (
                <span className="text-[#94a3b8]">...</span>
              ) : (
                pendingOrders.toLocaleString()
              )}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-amber-600">
              <ArrowDownRight size={13} />
              <span>Awaiting settlement</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total gained</CardTitle>
            <button
              onClick={toggleShowAmount}
              className="cursor-pointer text-[#94a3b8] transition-colors hover:text-[#0f172a]"
              title={showAmount ? 'Hide amount' : 'Show amount'}
            >
              {showAmount ? <Eye size={14} /> : <EyeOff size={14} />}
            </button>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-bold tracking-tight text-[#0f172a]">
              {isLoading || isUsersLoading ? (
                <span className="text-[#94a3b8]">...</span>
              ) : showAmount ? (
                formatAmount(totalGained)
              ) : (
                '₦••••••'
              )}
            </p>
            <div className="mt-2 flex items-center gap-1.5 text-xs font-medium text-emerald-600">
              <ArrowUpRight size={13} />
              <span>Excluding admins</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Transactions Table Card */}
      <Card>
        <CardHeader>
          <div>
            <h3 className="text-sm font-semibold text-[#0f172a]">Transactions list</h3>
            <p className="mt-0.5 text-xs text-[#64748b]">
              Showing {filteredOrders.length}{' '}
              {statusFilter !== 'ALL' ? statusFilter.toLowerCase() : ''} orders
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading && <p className="py-6 text-xs text-[#64748b]">Loading orders ledger...</p>}
          {error && <p className="py-6 text-xs text-rose-600">Failed to load orders ledger.</p>}
          {orders && orders.length === 0 && (
            <p className="py-6 text-xs text-[#64748b]">No orders found in ledger.</p>
          )}
          {orders && orders.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e2e8f0] font-semibold tracking-wider text-[#64748b] uppercase">
                    <th className="pr-4 pb-3">Order ID</th>
                    <th className="pr-4 pb-3">Customer</th>
                    <th className="pr-4 pb-3">Amount</th>
                    <th className="pr-4 pb-3">Status</th>
                    <th className="pr-4 pb-3">WHMCS Invoice</th>
                    <th className="pr-4 pb-3">Created</th>
                    <th className="pb-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {filteredOrders.map((order) => {
                    const isOrderPending = reconcile.isPending && reconcile.variables === order.id;
                    return (
                      <tr
                        key={order.id}
                        onClick={() => setInspectedOrder(order)}
                        className="group cursor-pointer transition-colors hover:bg-[#f8fafc]"
                      >
                        <td className="py-3.5 pr-4 font-mono text-[11px] text-[#64748b] transition-colors group-hover:text-[#0f172a]">
                          {order.id.slice(0, 8)}...
                        </td>
                        <td className="py-3.5 pr-4 font-medium text-[#0f172a]">
                          {getUserName(order.userId)}
                        </td>
                        <td className="py-3.5 pr-4 font-mono font-medium text-[#0f172a]">
                          {formatAmount(order.amount)}
                        </td>
                        <td className="py-3.5 pr-4">
                          <Badge variant={statusVariant[order.status]}>{order.status}</Badge>
                        </td>
                        <td className="py-3.5 pr-4 font-mono text-[11px] text-[#64748b]">
                          {order.whmcsInvoiceId ? `#${order.whmcsInvoiceId}` : '—'}
                        </td>
                        <td className="py-3.5 pr-4 text-[#64748b]">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 text-right">
                          {order.status === 'FAILED' ? (
                            <span className="font-mono text-[11px] text-rose-600">Failed</span>
                          ) : !order.whmcsInvoiceId ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleReconcileOrder(order.id);
                              }}
                              disabled={reconcile.isPending}
                              className="cursor-pointer rounded-md border border-[#cbd5e1] bg-white px-2.5 py-1 font-mono text-[11px] font-medium text-[#0f172a] transition-colors hover:bg-slate-50"
                            >
                              {isOrderPending ? '...' : 'Reconcile'}
                            </button>
                          ) : (
                            <span className="font-mono text-[11px] font-medium text-emerald-600">
                              Synced
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row Inspector Drawer */}
      <RowDetailDrawer
        isOpen={!!inspectedOrder}
        onClose={() => setInspectedOrder(null)}
        title={`Order #${inspectedOrder?.id?.slice(0, 8)}...`}
        subtitle={`Placed by ${inspectedOrder ? getUserName(inspectedOrder.userId) : ''}`}
        entityType="ORDER"
        data={inspectedOrder}
        status={inspectedOrder?.status}
        statusVariant={
          inspectedOrder ? statusVariant[inspectedOrder.status as OrderStatus] : 'default'
        }
        overviewFields={
          inspectedOrder
            ? [
                { label: 'Order ID', value: inspectedOrder.id, mono: true },
                { label: 'Customer', value: getUserName(inspectedOrder.userId) },
                { label: 'User ID', value: inspectedOrder.userId, mono: true },
                {
                  label: 'Amount',
                  value: `₦${Number(inspectedOrder.amount).toLocaleString()}`,
                  mono: true,
                },
                { label: 'Status', value: inspectedOrder.status },
                {
                  label: 'WHMCS Invoice ID',
                  value: inspectedOrder.whmcsInvoiceId
                    ? `#${inspectedOrder.whmcsInvoiceId}`
                    : 'Not Generated',
                  mono: true,
                },
                { label: 'Created At', value: new Date(inspectedOrder.createdAt).toLocaleString() },
                { label: 'Updated At', value: new Date(inspectedOrder.updatedAt).toLocaleString() },
                { label: 'Total Items', value: inspectedOrder.items?.length || 0, mono: true },
              ]
            : undefined
        }
      />
    </div>
  );
}
