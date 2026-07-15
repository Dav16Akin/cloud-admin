'use client';

import { useWhmcsSyncGaps, useSyncWhmcsUser } from '@/lib/hooks/useWhmcsSyncGaps';
import { useReconcileOrder } from '@/lib/hooks/useOrders';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function WhmcsSyncPage() {
  const { data, isLoading, error } = useWhmcsSyncGaps();
  const syncUser = useSyncWhmcsUser();
  const reconcile = useReconcileOrder();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">WHMCS Sync</h1>

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
                      {data.users.map((user) => (
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
                              onClick={() => syncUser.mutate(user.id)}
                              disabled={syncUser.isPending}
                              className="btn-primary btn-sm text-xs"
                            >
                              {syncUser.isPending ? '...' : 'Sync'}
                            </button>
                          </td>
                        </tr>
                      ))}
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
                      {data.orders.map((order) => (
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
                              onClick={() => reconcile.mutate(order.id)}
                              disabled={reconcile.isPending}
                              className="btn-navy btn-sm text-xs"
                            >
                              {reconcile.isPending ? '...' : 'Reconcile'}
                            </button>
                          </td>
                        </tr>
                      ))}
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
