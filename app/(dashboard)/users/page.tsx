'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUsers, useUserActivity } from '@/lib/hooks/useUsers';
import { useOrders } from '@/lib/hooks/useOrders';

export default function UsersPage() {
  const { data: users, isLoading: isUsersLoading, error } = useUsers();
  const { data: orders, isLoading: isOrdersLoading } = useOrders();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'services' | 'orders'>('logs');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
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

  const {
    data: activityData,
    isLoading: isActivityLoading,
    error: activityError,
  } = useUserActivity(selectedUserId);

  const totalUsers = users?.length ?? 0;
  const verifiedUsers = users?.filter((u) => u.verified).length ?? 0;

  // Calculate total gained excluding admin users
  const adminUserIds = new Set(
    users?.filter((u) => u.role === 'ADMIN').map((u) => u.id) ?? []
  );

  const totalGained = orders
    ?.filter(
      (order) =>
        (order.status === 'PAID' || order.status === 'COMPLETED' || order.status === 'ACTIVE') &&
        !adminUserIds.has(order.userId),
    )
    .reduce((sum, order) => sum + Number(order.amount), 0) ?? 0;

  const handleOpenDrawer = (userId: string) => {
    setSelectedUserId(userId);
    setIsDrawerOpen(true);
    setActiveTab('logs');
    setExpandedLogId(null);
  };

  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setTimeout(() => {
      setSelectedUserId(null);
    }, 300);
  };

  const toggleLogExpand = (logId: string) => {
    setExpandedLogId(expandedLogId === logId ? null : logId);
  };

  return (
    <div className="relative min-h-screen">
      <h1 className="text-2xl font-bold text-foreground mb-6">Users</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isUsersLoading ? <span className="text-muted-foreground">...</span> : totalUsers}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Verified Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#16a34a]">
              {isUsersLoading ? <span className="text-muted-foreground">...</span> : verifiedUsers}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unverified Users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">
              {isUsersLoading ? <span className="text-muted-foreground">...</span> : totalUsers - verifiedUsers}
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
              {isOrdersLoading || isUsersLoading ? (
                <span className="text-muted-foreground">...</span>
              ) : showAmount ? (
                `₦${totalGained.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              ) : (
                '₦••••••'
              )}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isUsersLoading && <p className="text-muted-foreground">Loading users...</p>}
          {error && <p className="text-destructive">Failed to load users.</p>}
          {users && users.length === 0 && (
            <p className="text-muted-foreground">No users found.</p>
          )}
          {users && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Name</th>
                    <th className="pb-3 pr-4 font-medium">Email</th>
                    <th className="pb-3 pr-4 font-medium">Company</th>
                    <th className="pb-3 pr-4 font-medium">Phone</th>
                    <th className="pb-3 pr-4 font-medium">Verified</th>
                    <th className="pb-3 pr-4 font-medium">Role</th>
                    <th className="pb-3 font-medium">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {[...users]
                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                    .map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-border last:border-0 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleOpenDrawer(user.id)}
                      >
                        <td className="py-3 pr-4 text-foreground font-medium">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.email}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">{user.email}</td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {user.companyName || '—'}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {user.phoneNumber || '—'}
                        </td>
                        <td className="py-3 pr-4">
                          <Badge variant={user.verified ? 'success' : 'danger'}>
                            {user.verified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </td>
                        <td className="py-3 pr-4 text-foreground">{user.role}</td>
                        <td className="py-3 text-muted-foreground">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backdrop overlay */}
      {selectedUserId && (
        <div
          className={`fixed inset-0 bg-[#031033]/40 backdrop-blur-xs z-40 transition-opacity duration-300 ${
            isDrawerOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          onClick={handleCloseDrawer}
        />
      )}

      {/* Slide-over Drawer Panel */}
      {selectedUserId && (
        <div
          className={`fixed top-0 right-0 h-full w-full max-w-xl md:max-w-2xl bg-card border-l border-border shadow-2xl flex flex-col z-50 transform transition-transform duration-300 ease-in-out ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="p-6 border-b border-border flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-secondary border border-border flex items-center justify-center font-bold text-lg text-primary">
                {activityData?.user?.firstName?.[0] || activityData?.user?.email?.[0]?.toUpperCase() || '?'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                  {activityData?.user?.firstName && activityData?.user?.lastName
                    ? `${activityData.user.firstName} ${activityData.user.lastName}`
                    : activityData?.user?.email || 'Loading Details...'}
                </h2>
                <p className="text-sm text-muted-foreground">{activityData?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleCloseDrawer}
              className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User quick metrics and metadata */}
          <div className="px-6 py-4 bg-muted/30 border-b border-border grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <span className="text-muted-foreground block mb-0.5">Role</span>
              <Badge variant="info">{activityData?.user?.role || '...'}</Badge>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">Verification</span>
              <Badge variant={activityData?.user?.verified ? 'success' : 'danger'}>
                {activityData?.user?.verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">WHMCS Sync</span>
              {activityData?.user?.whmcsClientId ? (
                <Badge variant="green">Sync ID: {activityData.user.whmcsClientId}</Badge>
              ) : (
                <Badge variant="default">Not Synced</Badge>
              )}
            </div>
            <div>
              <span className="text-muted-foreground block mb-0.5">Joined</span>
              <span className="font-semibold text-foreground">
                {activityData?.user?.createdAt
                  ? new Date(activityData.user.createdAt).toLocaleDateString()
                  : '...'}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-border bg-muted/10">
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-colors cursor-pointer ${
                activeTab === 'logs'
                  ? 'border-primary text-primary bg-background'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              Audit Logs
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-colors cursor-pointer ${
                activeTab === 'services'
                  ? 'border-primary text-primary bg-background'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              Domains & Hosting
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 py-3 text-sm font-semibold border-b-2 text-center transition-colors cursor-pointer ${
                activeTab === 'orders'
                  ? 'border-primary text-primary bg-background'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
              }`}
            >
              Orders
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {isActivityLoading && (
              <div className="flex flex-col items-center justify-center h-48 space-y-3">
                <svg
                  className="animate-spin h-8 w-8 text-primary"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-sm text-muted-foreground">Loading details and logs...</p>
              </div>
            )}

            {activityError && (
              <div className="p-4 bg-destructive/10 text-destructive text-sm border border-destructive/20">
                Failed to load user activity details: {activityError instanceof Error ? activityError.message : 'Unknown error'}
              </div>
            )}

            {!isActivityLoading && !activityError && activityData && (
              <>
                {/* Audit Logs Tab */}
                {activeTab === 'logs' && (
                  <div className="space-y-6">
                    {activityData.activity.logs.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-12">
                        No activity logs recorded for this user.
                      </p>
                    ) : (
                      <div className="relative border-l-2 border-border ml-3 pl-6 space-y-6">
                        {activityData.activity.logs.map((log) => (
                          <div key={log.id} className="relative group">
                            {/* Timeline circle node */}
                            <div className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 border-2 border-primary bg-background flex items-center justify-center" />

                            <div>
                              <div className="flex items-start justify-between gap-4">
                                <h4 className="text-sm font-semibold text-foreground">
                                  {log.action}
                                </h4>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {new Date(log.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                <span>IP: {log.ipAddress || 'Unknown'}</span>
                                {log.metadata && (
                                  <>
                                    <span>•</span>
                                    <button
                                      onClick={() => toggleLogExpand(log.id)}
                                      className="text-primary hover:underline font-semibold cursor-pointer"
                                    >
                                      {expandedLogId === log.id ? 'Hide Details' : 'View Details'}
                                    </button>
                                  </>
                                )}
                              </div>

                              {log.metadata && expandedLogId === log.id && (
                                <pre className="mt-2 p-3 bg-secondary text-[11px] overflow-x-auto border border-border text-muted-foreground font-mono">
                                  {JSON.stringify(log.metadata, null, 2)}
                                </pre>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Domains & Hosting Tab */}
                {activeTab === 'services' && (
                  <div className="space-y-6">
                    {/* Hosting Section */}
                    <div>
                      <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 mb-3 uppercase tracking-wider">
                        Hosting Accounts ({activityData.user.hostingAccounts.length})
                      </h3>
                      {activityData.user.hostingAccounts.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2">
                          No hosting accounts found for this user.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {activityData.user.hostingAccounts.map((host) => (
                            <div
                              key={host.id}
                              className="border border-border p-4 bg-muted/10 flex flex-col md:flex-row md:items-center justify-between gap-3"
                            >
                              <div>
                                <span className="text-xs text-muted-foreground block">
                                  {host.plan.name} Plan
                                </span>
                                <span className="text-sm font-bold text-foreground">
                                  {host.domain}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs">
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">
                                    Expires
                                  </span>
                                  <span className="font-medium text-foreground">
                                    {new Date(host.expiresAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <Badge
                                  variant={
                                    host.status === 'ACTIVE'
                                      ? 'green'
                                      : host.status === 'PENDING'
                                        ? 'warning'
                                        : 'danger'
                                  }
                                >
                                  {host.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Domains Section */}
                    <div className="pt-2">
                      <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 mb-3 uppercase tracking-wider">
                        Domains ({activityData.user.domains.length})
                      </h3>
                      {activityData.user.domains.length === 0 ? (
                        <p className="text-xs text-muted-foreground py-2">
                          No domains registered for this user.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {activityData.user.domains.map((dom) => (
                            <div
                              key={dom.id}
                              className="border border-border p-4 bg-muted/10 flex flex-col md:flex-row md:items-center justify-between gap-3"
                            >
                              <div>
                                <span className="text-sm font-bold text-foreground">
                                  {dom.name}
                                </span>
                                <span className="text-[10px] text-muted-foreground block mt-1">
                                  NS: {dom.nameservers?.join(', ') || '—'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs">
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">
                                    Expires
                                  </span>
                                  <span className="font-medium text-foreground">
                                    {dom.expiresAt
                                      ? new Date(dom.expiresAt).toLocaleDateString()
                                      : '—'}
                                  </span>
                                </div>
                                <Badge
                                  variant={
                                    dom.status === 'ACTIVE'
                                      ? 'green'
                                      : dom.status === 'PENDING'
                                        ? 'warning'
                                        : 'danger'
                                  }
                                >
                                  {dom.status}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Orders Tab */}
                {activeTab === 'orders' && (
                  <div className="space-y-4">
                    {activityData.user.orders.length === 0 ? (
                      <p className="text-muted-foreground text-sm text-center py-12">
                        No orders placed by this user.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {activityData.user.orders.map((order) => (
                          <div key={order.id} className="border border-border p-4 bg-muted/10">
                            <div className="flex items-start justify-between gap-4 mb-3 border-b border-border pb-2">
                              <div>
                                <span className="text-[10px] text-muted-foreground block">
                                  Order ID
                                </span>
                                <span className="text-xs font-mono font-bold text-foreground">
                                  {order.id}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <span className="text-muted-foreground block text-[10px]">
                                    Amount
                                  </span>
                                  <span className="text-sm font-bold text-foreground">
                                    ₦{Number(order.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                                <Badge
                                  variant={
                                    order.status === 'PAID' || order.status === 'COMPLETED' || order.status === 'ACTIVE'
                                      ? 'green'
                                      : order.status === 'PENDING'
                                        ? 'warning'
                                        : 'danger'
                                  }
                                >
                                  {order.status}
                                </Badge>
                              </div>
                            </div>

                            <div className="space-y-2">
                              <span className="text-[10px] text-muted-foreground block uppercase font-bold tracking-wider">
                                Items Ordered
                              </span>
                              {order.items?.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between text-xs bg-background p-2 border border-border"
                                >
                                  <span className="font-semibold text-foreground">
                                    {item.type} {item.domainName ? `(${item.domainName})` : ''}
                                  </span>
                                  <span className="text-muted-foreground">
                                    ₦{Number(item.price).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="text-[10px] text-muted-foreground text-right mt-3">
                              Placed on {new Date(order.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
