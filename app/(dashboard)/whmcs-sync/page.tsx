'use client';

import { useState } from 'react';
import { useWhmcsSyncGaps, useSyncWhmcsUser } from '@/lib/hooks/useWhmcsSyncGaps';
import { useReconcileOrder } from '@/lib/hooks/useOrders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RowDetailDrawer } from '@/components/ui/row-detail-drawer';
import { RefreshCw, Check, AlertCircle, ShieldAlert, ArrowUpRight, UserCheck } from 'lucide-react';

export default function WhmcsSyncPage() {
  const { data, isLoading, error, refetch, isFetching } = useWhmcsSyncGaps();
  const syncUser = useSyncWhmcsUser();
  const reconcile = useReconcileOrder();

  const [inspectedItem, setInspectedItem] = useState<{ type: string; title: string; data: any; status?: string } | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  const handleSyncUser = async (userId: string, email: string) => {
    try {
      await syncUser.mutateAsync(userId);
      showToast(`User ${email} synced with WHMCS successfully`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to sync user', 'error');
    }
  };

  const userGapsCount = data?.users?.length ?? 0;
  const orderGapsCount = data?.orders?.length ?? 0;

  return (
    <div className="relative space-y-6">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 border shadow-lg rounded-xl transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">WHMCS sync bridge</h1>
          <p className="text-xs text-[#64748b] mt-1">
            Detect and reconcile unsynced users, client accounts, and orders missing invoices.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="navy"
            size="sm"
            onClick={async () => {
              await refetch();
              showToast('WHMCS sync data refreshed', 'success');
            }}
            disabled={isLoading || isFetching}
          >
            <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Unsynced users</CardTitle>
            <UserCheck size={14} className="text-[#94a3b8]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono tracking-tight text-[#0f172a]">
              {isLoading ? <span className="text-[#94a3b8]">...</span> : userGapsCount}
            </p>
            <p className="text-xs text-[#64748b] mt-1">Missing WHMCS Client ID</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Unreconciled orders</CardTitle>
            <ShieldAlert size={14} className="text-[#94a3b8]" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono tracking-tight text-amber-600">
              {isLoading ? <span className="text-[#94a3b8]">...</span> : orderGapsCount}
            </p>
            <p className="text-xs text-[#64748b] mt-1">Missing WHMCS Invoice ID</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Bridge status</CardTitle>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold font-mono tracking-tight text-emerald-600">
              {userGapsCount === 0 && orderGapsCount === 0 ? 'SYNCED' : 'ACTION REQ'}
            </p>
            <p className="text-xs text-[#64748b] mt-1">Gateway API responding normally</p>
          </CardContent>
        </Card>
      </div>

      {isLoading && <p className="text-xs text-[#64748b]">Loading sync gaps...</p>}
      {error && <p className="text-xs text-rose-600">Failed to load WHMCS sync data.</p>}

      {data && (
        <div className="space-y-6">
          {/* USERS CARD */}
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-sm font-semibold text-[#0f172a]">
                  Users missing WHMCS Client ID ({data.users.length})
                </h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Platform users without an associated WHMCS client profile.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {data.users.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-emerald-600 font-medium">All users are currently synchronized with WHMCS.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#e2e8f0] text-[#64748b] uppercase tracking-wider font-semibold">
                        <th className="pb-3 pr-4">Email</th>
                        <th className="pb-3 pr-4">Name</th>
                        <th className="pb-3 pr-4">Role</th>
                        <th className="pb-3 pr-4">Joined</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {data.users.map((user) => {
                        const isUserPending = syncUser.isPending && syncUser.variables === user.id;
                        return (
                          <tr
                            key={user.id}
                            onClick={() =>
                              setInspectedItem({
                                type: 'UNSYNCED USER',
                                title: user.email,
                                data: user,
                                status: user.role,
                              })
                            }
                            className="hover:bg-[#f8fafc] transition-colors cursor-pointer group"
                          >
                            <td className="py-3.5 pr-4 text-[#0f172a] font-medium group-hover:text-sky-600 transition-colors">
                              {user.email}
                            </td>
                            <td className="py-3.5 pr-4 text-[#64748b]">{user.name || '—'}</td>
                            <td className="py-3.5 pr-4">
                              <Badge variant={user.role === 'ADMIN' ? 'info' : 'default'}>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="py-3.5 pr-4 text-[#64748b]">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 text-right">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleSyncUser(user.id, user.email);
                                }}
                                disabled={syncUser.isPending}
                                className="px-2.5 py-1 text-[11px] font-medium font-mono rounded-md bg-white hover:bg-slate-50 text-[#0f172a] border border-[#cbd5e1] transition-colors cursor-pointer"
                              >
                                {isUserPending ? '...' : 'Sync'}
                              </button>
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

          {/* ORDERS CARD */}
          <Card>
            <CardHeader>
              <div>
                <h3 className="text-sm font-semibold text-[#0f172a]">
                  Orders missing WHMCS Invoice ID ({data.orders.length})
                </h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Platform orders that have not yet been assigned a WHMCS billing invoice.
                </p>
              </div>
            </CardHeader>
            <CardContent>
              {data.orders.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-xs text-emerald-600 font-medium">All orders are reconciled with WHMCS invoices.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left">
                    <thead>
                      <tr className="border-b border-[#e2e8f0] text-[#64748b] uppercase tracking-wider font-semibold">
                        <th className="pb-3 pr-4">Order ID</th>
                        <th className="pb-3 pr-4">Customer</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 pr-4">Created</th>
                        <th className="pb-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9]">
                      {data.orders.map((order) => {
                        const isOrderPending = reconcile.isPending && reconcile.variables === order.id;
                        return (
                          <tr
                            key={order.id}
                            onClick={() =>
                              setInspectedItem({
                                type: 'UNRECONCILED ORDER',
                                title: `Order ${order.id.slice(0, 8)}...`,
                                data: order,
                                status: order.status,
                              })
                            }
                            className="hover:bg-[#f8fafc] transition-colors cursor-pointer group"
                          >
                            <td className="py-3.5 pr-4 font-mono text-[11px] text-[#64748b] group-hover:text-[#0f172a] transition-colors">
                              {order.id.slice(0, 8)}...
                            </td>
                            <td className="py-3.5 pr-4 text-[#0f172a] font-medium">
                              {order.user?.email ?? order.userId.slice(0, 8)}
                            </td>
                            <td className="py-3.5 pr-4">
                              <Badge
                                variant={
                                  order.status === 'ACTIVE'
                                    ? 'success'
                                    : order.status === 'PENDING'
                                      ? 'warning'
                                      : 'default'
                                }
                              >
                                {order.status}
                              </Badge>
                            </td>
                            <td className="py-3.5 pr-4 text-[#64748b]">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3.5 text-right">
                              {order.status === 'FAILED' ? (
                                <span className="text-[11px] font-mono text-rose-600">Failed</span>
                              ) : (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleReconcileOrder(order.id);
                                  }}
                                  disabled={reconcile.isPending}
                                  className="px-2.5 py-1 text-[11px] font-medium font-mono rounded-md bg-white hover:bg-slate-50 text-[#0f172a] border border-[#cbd5e1] transition-colors cursor-pointer"
                                >
                                  {isOrderPending ? '...' : 'Reconcile'}
                                </button>
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
        </div>
      )}

      {/* Row Inspector Drawer */}
      <RowDetailDrawer
        isOpen={!!inspectedItem}
        onClose={() => setInspectedItem(null)}
        title={inspectedItem?.title || 'Item Inspection'}
        entityType={inspectedItem?.type || 'WHMCS GAP'}
        data={inspectedItem?.data}
        status={inspectedItem?.status}
      />
    </div>
  );
}
