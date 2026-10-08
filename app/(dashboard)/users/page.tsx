'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useUsers, useUserActivity } from '@/lib/hooks/useUsers';
import { useOrders } from '@/lib/hooks/useOrders';

export default function UsersPage() {
  const { data: users, isLoading: isUsersLoading, error } = useUsers();
  const { data: orders, isLoading: isOrdersLoading } = useOrders();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'logs' | 'services' | 'orders' | 'json'>('logs');
  const [copiedJson, setCopiedJson] = useState(false);
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
  const adminUserIds = new Set(users?.filter((u) => u.role === 'ADMIN').map((u) => u.id) ?? []);

  const totalGained =
    orders
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
    <div className="relative space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Users & clients</h1>
        <p className="mt-1 text-xs text-[#64748b]">
          Client accounts, verification status, credentials, and ledger overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle>Total users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-bold tracking-tight text-[#0f172a]">
              {isUsersLoading ? (
                <span className="text-[#94a3b8]">...</span>
              ) : (
                totalUsers.toLocaleString()
              )}
            </p>
            <p className="mt-1.5 text-xs text-[#64748b]">Registered identities</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Verified users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-bold tracking-tight text-emerald-600">
              {isUsersLoading ? (
                <span className="text-[#94a3b8]">...</span>
              ) : (
                verifiedUsers.toLocaleString()
              )}
            </p>
            <p className="mt-1.5 text-xs text-emerald-600">KYC / Email verified</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Unverified users</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-bold tracking-tight text-rose-600">
              {isUsersLoading ? (
                <span className="text-[#94a3b8]">...</span>
              ) : (
                (totalUsers - verifiedUsers).toLocaleString()
              )}
            </p>
            <p className="mt-1.5 text-xs text-rose-600">Pending verification</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Total gained</CardTitle>
            <button
              onClick={toggleShowAmount}
              className="cursor-pointer p-1 text-[#94a3b8] transition-colors hover:text-[#0f172a]"
              title={showAmount ? 'Hide Amount' : 'Show Amount'}
            >
              {showAmount ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.815 7.815L21 21m-2.772-2.772-3.65-3.65m0 0a3 3 0 1 1-4.243-4.243m4.242 4.242L9.88 9.88"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                  />
                </svg>
              )}
            </button>
          </CardHeader>
          <CardContent>
            <p className="font-mono text-2xl font-bold tracking-tight text-[#0f172a]">
              {isOrdersLoading || isUsersLoading ? (
                <span className="text-[#94a3b8]">...</span>
              ) : showAmount ? (
                `₦${totalGained.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
              ) : (
                '₦••••••'
              )}
            </p>
            <p className="mt-1.5 text-xs text-emerald-600">Non-admin client volume</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Users</CardTitle>
        </CardHeader>
        <CardContent>
          {isUsersLoading && <p className="text-[#64748b]">Loading users...</p>}
          {error && <p className="text-rose-600">Failed to load users.</p>}
          {users && users.length === 0 && <p className="text-[#64748b]">No users found.</p>}
          {users && users.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0] bg-[#f8fafc]/50 text-left text-[#64748b]">
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider uppercase">
                      Name
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider uppercase">
                      Email
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider uppercase">
                      Company
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider uppercase">
                      Phone
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider uppercase">
                      Verified
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider uppercase">
                      Role
                    </th>
                    <th className="px-4 py-3 text-xs font-semibold tracking-wider uppercase">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {[...users]
                    .sort(
                      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
                    )
                    .map((user) => (
                      <tr
                        key={user.id}
                        className="cursor-pointer transition-colors hover:bg-[#f8fafc]"
                        onClick={() => handleOpenDrawer(user.id)}
                      >
                        <td className="px-4 py-3.5 font-medium text-[#0f172a]">
                          {user.firstName && user.lastName
                            ? `${user.firstName} ${user.lastName}`
                            : user.email}
                        </td>
                        <td className="px-4 py-3.5 text-[#64748b]">{user.email}</td>
                        <td className="px-4 py-3.5 text-[#64748b]">{user.companyName || '—'}</td>
                        <td className="px-4 py-3.5 text-[#64748b]">{user.phoneNumber || '—'}</td>
                        <td className="px-4 py-3.5">
                          <Badge variant={user.verified ? 'success' : 'danger'}>
                            {user.verified ? 'Verified' : 'Unverified'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 font-mono text-[11px] text-[#64748b]">
                          {user.role}
                        </td>
                        <td className="px-4 py-3.5 text-[#64748b]">
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
          className={`fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px] transition-opacity duration-300 ${
            isDrawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
          }`}
          onClick={handleCloseDrawer}
        />
      )}

      {/* Slide-over Drawer Panel */}
      {selectedUserId && (
        <div
          className={`fixed top-0 right-0 z-50 flex h-full w-full max-w-xl transform flex-col border-l border-[#e2e8f0] bg-white shadow-2xl transition-transform duration-300 ease-in-out md:max-w-2xl ${
            isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {/* Drawer Header */}
          <div className="flex items-start justify-between border-b border-[#e2e8f0] bg-[#f8fafc] p-6">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 bg-slate-100 text-base font-bold text-[#0f172a]">
                {activityData?.user?.firstName?.[0] ||
                  activityData?.user?.email?.[0]?.toUpperCase() ||
                  '?'}
              </div>
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-[#0f172a]">
                  {activityData?.user?.firstName && activityData?.user?.lastName
                    ? `${activityData.user.firstName} ${activityData.user.lastName}`
                    : activityData?.user?.email || 'Loading Details...'}
                </h2>
                <p className="text-xs text-[#64748b]">{activityData?.user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleCloseDrawer}
              className="cursor-pointer rounded-md p-1 text-[#64748b] transition-colors hover:bg-slate-200/70 hover:text-[#0f172a]"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="h-6 w-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* User quick metrics and metadata */}
          <div className="grid grid-cols-2 gap-4 border-b border-[#e2e8f0] bg-white px-6 py-4 text-xs md:grid-cols-4">
            <div>
              <span className="mb-1 block text-[10px] font-semibold tracking-wider text-[#64748b] uppercase">
                Role
              </span>
              <Badge variant="info">{activityData?.user?.role || '...'}</Badge>
            </div>
            <div>
              <span className="mb-1 block text-[10px] font-semibold tracking-wider text-[#64748b] uppercase">
                Verification
              </span>
              <Badge variant={activityData?.user?.verified ? 'success' : 'danger'}>
                {activityData?.user?.verified ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
            <div>
              <span className="mb-1 block text-[10px] font-semibold tracking-wider text-[#64748b] uppercase">
                WHMCS Sync
              </span>
              {activityData?.user?.whmcsClientId ? (
                <Badge variant="green">Sync ID: {activityData.user.whmcsClientId}</Badge>
              ) : (
                <Badge variant="default">Not Synced</Badge>
              )}
            </div>
            <div>
              <span className="mb-1 block text-[10px] font-semibold tracking-wider text-[#64748b] uppercase">
                Joined
              </span>
              <span className="font-semibold text-[#0f172a]">
                {activityData?.user?.createdAt
                  ? new Date(activityData.user.createdAt).toLocaleDateString()
                  : '...'}
              </span>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex border-b border-[#e2e8f0] bg-white">
            <button
              onClick={() => setActiveTab('logs')}
              className={`flex-1 cursor-pointer border-b-2 py-3 text-center text-xs font-semibold transition-colors ${
                activeTab === 'logs'
                  ? 'border-[#0f172a] text-[#0f172a]'
                  : 'border-transparent text-[#64748b] hover:bg-slate-50 hover:text-[#0f172a]'
              }`}
            >
              Audit Logs
            </button>
            <button
              onClick={() => setActiveTab('services')}
              className={`flex-1 cursor-pointer border-b-2 py-3 text-center text-xs font-semibold transition-colors ${
                activeTab === 'services'
                  ? 'border-[#0f172a] text-[#0f172a]'
                  : 'border-transparent text-[#64748b] hover:bg-slate-50 hover:text-[#0f172a]'
              }`}
            >
              Domains & Hosting
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`flex-1 cursor-pointer border-b-2 py-3 text-center text-xs font-semibold transition-colors ${
                activeTab === 'orders'
                  ? 'border-[#0f172a] text-[#0f172a]'
                  : 'border-transparent text-[#64748b] hover:bg-slate-50 hover:text-[#0f172a]'
              }`}
            >
              Orders
            </button>
            <button
              onClick={() => setActiveTab('json')}
              className={`flex-1 cursor-pointer border-b-2 py-3 text-center text-xs font-semibold transition-colors ${
                activeTab === 'json'
                  ? 'border-[#0f172a] text-[#0f172a]'
                  : 'border-transparent text-[#64748b] hover:bg-slate-50 hover:text-[#0f172a]'
              }`}
            >
              API Response
            </button>
          </div>

          {/* Drawer Scrollable Content */}
          <div className="flex-1 overflow-y-auto bg-white p-6">
            {isActivityLoading && (
              <div className="flex h-48 flex-col items-center justify-center space-y-3">
                <svg
                  className="h-7 w-7 animate-spin text-emerald-400"
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
                <p className="text-xs text-[#64748b]">Loading details and logs...</p>
              </div>
            )}

            {activityError && (
              <div className="rounded-lg border border-rose-200 bg-rose-50 p-4 text-xs text-rose-700">
                Failed to load user activity details:{' '}
                {activityError instanceof Error ? activityError.message : 'Unknown error'}
              </div>
            )}

            {!isActivityLoading && !activityError && activityData && (
              <>
                {/* Audit Logs Tab */}
                {activeTab === 'logs' && (
                  <div className="space-y-6">
                    {activityData.activity.logs.length === 0 ? (
                      <p className="py-12 text-center text-xs text-[#64748b]">
                        No activity logs recorded for this user.
                      </p>
                    ) : (
                      <div className="relative ml-3 space-y-6 border-l border-[#e2e8f0] pl-6">
                        {activityData.activity.logs.map((log) => (
                          <div key={log.id} className="group relative">
                            {/* Timeline circle node */}
                            <div className="absolute top-1.5 -left-[31px] h-3 w-3 rounded-full border border-sky-500 bg-white ring-4 ring-slate-100" />

                            <div>
                              <div className="flex items-start justify-between gap-4">
                                <h4 className="text-xs font-semibold text-[#0f172a]">
                                  {log.action}
                                </h4>
                                <span className="text-[11px] whitespace-nowrap text-[#64748b]">
                                  {new Date(log.createdAt).toLocaleString()}
                                </span>
                              </div>
                              <div className="mt-1 flex items-center gap-2 text-[11px] text-[#64748b]">
                                <span>IP: {log.ipAddress || 'Unknown'}</span>
                                {log.metadata && (
                                  <>
                                    <span>•</span>
                                    <button
                                      onClick={() => toggleLogExpand(log.id)}
                                      className="cursor-pointer font-medium text-sky-600 hover:underline"
                                    >
                                      {expandedLogId === log.id ? 'Hide Details' : 'View Details'}
                                    </button>
                                  </>
                                )}
                              </div>

                              {log.metadata && expandedLogId === log.id && (
                                <pre className="mt-2 overflow-x-auto rounded border border-[#1e293b] bg-[#0f172a] p-3 font-mono text-[11px] text-[#93c5fd]">
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
                      <h3 className="mb-3 border-b border-[#e2e8f0] pb-2 text-xs font-bold tracking-wider text-[#0f172a] uppercase">
                        Hosting Accounts ({activityData.user.hostingAccounts.length})
                      </h3>
                      {activityData.user.hostingAccounts.length === 0 ? (
                        <p className="py-2 text-xs text-[#64748b]">
                          No hosting accounts found for this user.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {activityData.user.hostingAccounts.map((host) => (
                            <div
                              key={host.id}
                              className="flex flex-col justify-between gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4 md:flex-row md:items-center"
                            >
                              <div>
                                <span className="block text-[11px] text-[#64748b]">
                                  {host.plan.name} Plan
                                </span>
                                <span className="text-xs font-semibold text-[#0f172a]">
                                  {host.domain}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs">
                                <div>
                                  <span className="block text-[10px] text-[#64748b]">Expires</span>
                                  <span className="text-[11px] font-medium text-[#0f172a]">
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
                      <h3 className="mb-3 border-b border-[#e2e8f0] pb-2 text-xs font-bold tracking-wider text-[#0f172a] uppercase">
                        Domains ({activityData.user.domains.length})
                      </h3>
                      {activityData.user.domains.length === 0 ? (
                        <p className="py-2 text-xs text-[#64748b]">
                          No domains registered for this user.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {activityData.user.domains.map((dom) => (
                            <div
                              key={dom.id}
                              className="flex flex-col justify-between gap-3 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4 md:flex-row md:items-center"
                            >
                              <div>
                                <span className="text-xs font-semibold text-[#0f172a]">
                                  {dom.name}
                                </span>
                                <span className="mt-0.5 block text-[10px] text-[#64748b]">
                                  NS: {dom.nameservers?.join(', ') || '—'}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-xs">
                                <div>
                                  <span className="block text-[10px] text-[#64748b]">Expires</span>
                                  <span className="text-[11px] font-medium text-[#0f172a]">
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
                      <p className="py-12 text-center text-xs text-[#64748b]">
                        No orders placed by this user.
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {activityData.user.orders.map((order) => (
                          <div
                            key={order.id}
                            className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-4"
                          >
                            <div className="mb-3 flex items-start justify-between gap-4 border-b border-[#e2e8f0] pb-2">
                              <div>
                                <span className="block text-[10px] font-semibold tracking-wider text-[#64748b] uppercase">
                                  Order ID
                                </span>
                                <span className="font-mono text-xs font-semibold text-[#0f172a]">
                                  {order.id}
                                </span>
                              </div>
                              <div className="flex items-center gap-4 text-right">
                                <div>
                                  <span className="block text-[10px] text-[#64748b]">Amount</span>
                                  <span className="text-xs font-bold text-[#0f172a]">
                                    ₦
                                    {Number(order.amount).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                                <Badge
                                  variant={
                                    order.status === 'PAID' ||
                                    order.status === 'COMPLETED' ||
                                    order.status === 'ACTIVE'
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
                              <span className="block text-[10px] font-semibold tracking-wider text-[#64748b] uppercase">
                                Items Ordered
                              </span>
                              {order.items?.map((item, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between rounded border border-[#e2e8f0] bg-white p-2.5 text-xs"
                                >
                                  <span className="font-medium text-[#0f172a]">
                                    {item.type} {item.domainName ? `(${item.domainName})` : ''}
                                  </span>
                                  <span className="text-[#64748b]">
                                    ₦
                                    {Number(item.price).toLocaleString(undefined, {
                                      minimumFractionDigits: 2,
                                    })}
                                  </span>
                                </div>
                              ))}
                            </div>

                            <div className="mt-3 text-right text-[10px] text-[#64748b]">
                              Placed on {new Date(order.createdAt).toLocaleString()}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'json' && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-2">
                      <div>
                        <h3 className="text-xs font-semibold tracking-wider text-[#0f172a] uppercase">
                          Raw API Response & Payload
                        </h3>
                        <p className="mt-0.5 text-[11px] text-[#64748b]">
                          Complete backend response for user identity and activity
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const payload =
                            activityData || users?.find((u) => u.id === selectedUserId);
                          navigator.clipboard.writeText(JSON.stringify(payload, null, 2));
                          setCopiedJson(true);
                          setTimeout(() => setCopiedJson(false), 2000);
                        }}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded border border-[#cbd5e1] bg-white px-2.5 py-1 font-mono text-xs text-[#0f172a] transition-colors hover:bg-slate-50"
                      >
                        {copiedJson ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span className="text-emerald-600">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>Copy JSON</span>
                          </>
                        )}
                      </button>
                    </div>

                    <pre className="max-h-[520px] overflow-x-auto rounded-lg border border-[#1e293b] bg-[#0f172a] p-4 font-mono text-[11px] leading-relaxed text-[#93c5fd] selection:bg-slate-700">
                      {JSON.stringify(
                        activityData || users?.find((u) => u.id === selectedUserId) || {},
                        null,
                        2,
                      )}
                    </pre>
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
