'use client';

import { useState } from 'react';
import { useWhmcsSyncGaps, useSyncWhmcsUser } from '@/lib/hooks/useWhmcsSyncGaps';
import { useReconcileOrder } from '@/lib/hooks/useOrders';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';

export default function WhmcsSyncPage() {
  const { data, isLoading, error, refetch, isFetching } = useWhmcsSyncGaps();
  const syncUser = useSyncWhmcsUser();
  const reconcile = useReconcileOrder();

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

  return (
    <div className="relative space-y-6">
      {/* Toast Notification Banner */}
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 border shadow-lg transition-all duration-300 ${
            notification.type === 'success'
              ? 'bg-[#fff8ee] border-[#e8900a]/20 text-[#031033]'
              : 'bg-destructive/10 border-destructive/20 text-destructive'
          }`}
        >
          {notification.type === 'success' ? (
            <Check size={18} className="text-[#e8900a]" />
          ) : (
            <AlertCircle size={18} />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">WHMCS Sync</h1>
          <p className="text-sm text-muted-foreground">
            View and reconcile unsynced users and orders with WHMCS.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={async () => {
              await refetch();
              showToast('WHMCS sync data refreshed', 'success');
            }}
            disabled={isLoading || isFetching}
          >
            <RefreshCw size={14} className={isFetching ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {isLoading && <p className="text-muted-foreground">Loading sync gaps...</p>}
      {error && <p className="text-destructive">Failed to load WHMCS sync data.</p>}

      {data && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Users Missing WHMCS Client ID ({data.users.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {data.users.length === 0 ? (
                <p className="text-sm text-muted-foreground">All users are synced.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-3 pr-4 font-medium">Email</th>
                        <th className="pb-3 pr-4 font-medium">Name</th>
                        <th className="pb-3 pr-4 font-medium">Role</th>
                        <th className="pb-3 pr-4 font-medium">Joined</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.users.map((user) => {
                        const isUserPending = syncUser.isPending && syncUser.variables === user.id;
                        return (
                          <tr key={user.id} className="border-b border-border last:border-0">
                            <td className="py-3 pr-4 text-foreground">{user.email}</td>
                            <td className="py-3 pr-4 text-muted-foreground">
                              {user.name || '—'}
                            </td>
                            <td className="py-3 pr-4">
                              <Badge variant={user.role === 'ADMIN' ? 'info' : 'default'}>
                                {user.role}
                              </Badge>
                            </td>
                            <td className="py-3 pr-4 text-muted-foreground">
                              {new Date(user.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              <button
                                onClick={() => handleSyncUser(user.id, user.email)}
                                disabled={syncUser.isPending}
                                className="btn-primary btn-sm text-xs"
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

          <Card>
            <CardHeader>
              <CardTitle>Orders Missing WHMCS Invoice ID ({data.orders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {data.orders.length === 0 ? (
                <p className="text-sm text-muted-foreground">All orders are reconciled.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-3 pr-4 font-medium">Order ID</th>
                        <th className="pb-3 pr-4 font-medium">User</th>
                        <th className="pb-3 pr-4 font-medium">Status</th>
                        <th className="pb-3 pr-4 font-medium">Created</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.orders.map((order) => {
                        const isOrderPending = reconcile.isPending && reconcile.variables === order.id;
                        return (
                          <tr key={order.id} className="border-b border-border last:border-0">
                            <td className="py-3 pr-4 font-mono text-xs text-foreground">
                              {order.id.slice(0, 8)}...
                            </td>
                            <td className="py-3 pr-4 text-foreground">
                              {order.user?.email ?? order.userId.slice(0, 8)}
                            </td>
                            <td className="py-3 pr-4">
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
                            <td className="py-3 pr-4 text-muted-foreground">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3">
                              <button
                                onClick={() => handleReconcileOrder(order.id)}
                                disabled={reconcile.isPending}
                                className="btn-navy btn-sm text-xs"
                              >
                                {isOrderPending ? '...' : 'Reconcile'}
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
        </>
      )}
    </div>
  );
}
