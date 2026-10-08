'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RowDetailDrawer } from '@/components/ui/row-detail-drawer';
import {
  useAdminHosting,
  useUpdateHosting,
  useDeleteHosting,
} from '@/lib/hooks/useHosting';
import {
  Server,
  Search,
  Globe,
  User,
  HardDrive,
  Calendar,
  ShieldAlert,
  Edit3,
  Trash2,
  X,
  Check,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';

export default function HostingPage() {
  const { data: hostings, isLoading, refetch } = useAdminHosting();
  const updateHosting = useUpdateHosting();
  const deleteHosting = useDeleteHosting();

  // Search filter
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectedAccount, setInspectedAccount] = useState<any | null>(null);

  // Modal / Form States
  const [selectedAccount, setSelectedAccount] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form Fields
  const [cpanelUsername, setCpanelUsername] = useState('');
  const [serverIp, setServerIp] = useState('');
  const [status, setStatus] = useState<'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'PENDING'>('ACTIVE');
  const [expiresAt, setExpiresAt] = useState('');

  // Toast / Alert banner state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleOpenEditModal = (account: any) => {
    setSelectedAccount(account);
    setCpanelUsername(account.cpanelUsername);
    setServerIp(account.serverIp);
    setStatus(account.status);

    // Format date string to YYYY-MM-DD for HTML5 date input
    if (account.expiresAt) {
      const dateObj = new Date(account.expiresAt);
      const formattedDate = dateObj.toISOString().split('T')[0];
      setExpiresAt(formattedDate);
    } else {
      setExpiresAt('');
    }

    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccount) return;

    try {
      await updateHosting.mutateAsync({
        id: selectedAccount.id,
        data: {
          cpanelUsername,
          serverIp,
          status,
          expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        },
      });
      setIsModalOpen(false);
      showToast(`Hosting account for ${selectedAccount.domain} updated successfully`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Something went wrong', 'error');
    }
  };

  const handleDeleteAccount = async (account: any) => {
    if (!confirm(`Are you sure you want to permanently delete the database record for ${account.domain}? This action cannot be undone.`)) {
      return;
    }
    try {
      await deleteHosting.mutateAsync(account.id);
      showToast(`Hosting account record for ${account.domain} deleted`, 'success');
      refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete record', 'error');
    }
  };

  // Metrics calculations
  const totalCount = hostings?.length ?? 0;
  const activeCount = hostings?.filter((h) => h.status === 'ACTIVE').length ?? 0;
  const suspendedCount = hostings?.filter((h) => h.status === 'SUSPENDED').length ?? 0;
  const pendingCount = hostings?.filter((h) => h.status === 'PENDING').length ?? 0;

  // Search filtering
  const filteredHostings = hostings?.filter(
    (h) =>
      h.domain.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.cpanelUsername.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.serverIp.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.user?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.user?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.plan?.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="relative min-h-screen pb-12">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Hosting Accounts</h1>
          <p className="text-sm text-[#64748b]">
            Manage user cPanel credentials, server IPs, visibility state, and active subscriptions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              showToast('Hosting accounts refreshed', 'success');
            }}
            disabled={isLoading}
          >
            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Total Accounts</span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isLoading ? <span className="text-muted-foreground">...</span> : totalCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-[#16a34a] uppercase tracking-wider">Active</span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#16a34a]">
              {isLoading ? <span className="text-muted-foreground">...</span> : activeCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-destructive uppercase tracking-wider">Suspended</span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">
              {isLoading ? <span className="text-muted-foreground">...</span> : suspendedCount}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-[#e8900a] uppercase tracking-wider">Pending</span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#e8900a]">
              {isLoading ? <span className="text-muted-foreground">...</span> : pendingCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Table Card */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle>All Active cPanel Subscriptions</CardTitle>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search domain, username, IP, or user email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-xs border border-[#cbd5e1] rounded-lg pl-9 pr-4 py-2 bg-white text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 py-8">
              <div className="h-6 bg-muted animate-pulse w-full" />
              <div className="h-10 bg-muted animate-pulse w-full" />
              <div className="h-10 bg-muted animate-pulse w-full" />
            </div>
          ) : filteredHostings.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-12">
              No hosting accounts found matching search criteria.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-medium uppercase tracking-wider text-xs">
                    <th className="pb-3 pr-4 font-bold">Primary Domain</th>
                    <th className="pb-3 pr-4 font-bold">cPanel Username</th>
                    <th className="pb-3 pr-4 font-bold">Package Plan</th>
                    <th className="pb-3 pr-4 font-bold">Server IP Address</th>
                    <th className="pb-3 pr-4 font-bold">Client Owner</th>
                    <th className="pb-3 pr-4 font-bold">Expiration Date</th>
                    <th className="pb-3 pr-4 font-bold">Status</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHostings.map((acc) => (
                    <tr
                      key={acc.id}
                      onClick={() => setInspectedAccount(acc)}
                      className="border-b border-[#e2e8f0] last:border-0 hover:bg-[#f8fafc] transition-colors cursor-pointer group"
                    >
                      <td className="py-4 pr-4 font-bold text-[#0f172a] group-hover:text-emerald-600 transition-colors flex items-center gap-2">
                        <Globe size={14} className="text-[#64748b]" />
                        {acc.domain}
                      </td>
                      <td className="py-4 pr-4 text-[#64748b] font-mono text-xs">
                        {acc.cpanelUsername}
                      </td>
                      <td className="py-4 pr-4">
                        <div className="text-[#0f172a] font-medium text-xs">{acc.plan?.name}</div>
                        <div className="text-[#64748b] text-[11px] flex items-center gap-1 mt-0.5">
                          <HardDrive size={10} />
                          {acc.plan?.storage}
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-[#64748b] font-mono text-xs">
                        {acc.serverIp || '—'}
                      </td>
                      <td className="py-4 pr-4">
                        <div className="text-[#0f172a] font-medium text-xs flex items-center gap-1">
                          <User size={12} className="text-[#64748b]" />
                          {acc.user?.firstName} {acc.user?.lastName}
                        </div>
                        <div className="text-[#64748b] text-[11px]">{acc.user?.email}</div>
                      </td>
                      <td className="py-4 pr-4 text-[#64748b] text-xs">
                        <div className="flex items-center gap-1">
                          <Calendar size={12} />
                          {new Date(acc.expiresAt).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <Badge
                          variant={
                            acc.status === 'ACTIVE'
                              ? 'success'
                              : acc.status === 'PENDING'
                                ? 'warning'
                                : 'danger'
                          }
                        >
                          {acc.status}
                        </Badge>
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleOpenEditModal(acc);
                            }}
                            variant="outline"
                            size="sm"
                            className="px-2 py-1 h-7 text-xs font-semibold"
                          >
                            <Edit3 size={12} className="mr-1" />
                            Edit
                          </Button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteAccount(acc);
                            }}
                            className="p-1 text-[#94a3b8] hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete hosting account record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* EDIT MODAL DIALOG */}
      {isModalOpen && selectedAccount && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-40 transition-opacity duration-300 opacity-100"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Panel */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-[#e2e8f0] shadow-2xl rounded-xl z-50 p-6 flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-lg font-bold text-foreground">Configure Account: {selectedAccount.domain}</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer rounded-lg"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">cPanel Username</label>
                <input
                  type="text"
                  required
                  value={cpanelUsername}
                  onChange={(e) => setCpanelUsername(e.target.value)}
                  className="w-full text-sm border border-[#cbd5e1] rounded-lg p-2 bg-white text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono"
                  placeholder="e.g. nupatusr"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Server IP Address</label>
                <input
                  type="text"
                  required
                  value={serverIp}
                  onChange={(e) => setServerIp(e.target.value)}
                  className="w-full text-sm border border-[#cbd5e1] rounded-lg p-2 bg-white text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-slate-400 font-mono"
                  placeholder="e.g. 192.168.1.1"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Expiration Date</label>
                <input
                  type="date"
                  required
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full text-sm border border-[#cbd5e1] rounded-lg p-2 bg-white text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Status Visibility</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as any)}
                  className="w-full text-sm border border-[#cbd5e1] rounded-lg p-2 bg-white text-[#0f172a] focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="ACTIVE">ACTIVE</option>
                  <option value="SUSPENDED">SUSPENDED</option>
                  <option value="TERMINATED">TERMINATED</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              {/* Warning Banner */}
              <div className="flex gap-2 p-3 bg-amber-50 border border-amber-200 text-amber-800 text-xs">
                <ShieldAlert size={16} className="shrink-0 text-amber-600 mt-0.5" />
                <p>
                  <strong>Note:</strong> Saving updates here adjusts bookkeeping data only. It will not communicate server suspension or termination commands to cPanel directly.
                </p>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-border mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={updateHosting.isPending}
                >
                  {updateHosting.isPending ? 'Saving...' : 'Apply Changes'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Row Inspector Drawer */}
      <RowDetailDrawer
        isOpen={!!inspectedAccount}
        onClose={() => setInspectedAccount(null)}
        title={inspectedAccount?.domain || 'Hosting Account'}
        subtitle={`cPanel: ${inspectedAccount?.cpanelUsername || '—'}`}
        entityType="HOSTING ACCOUNT"
        data={inspectedAccount}
        status={inspectedAccount?.status}
        statusVariant={
          inspectedAccount?.status === 'ACTIVE'
            ? 'success'
            : inspectedAccount?.status === 'PENDING'
              ? 'warning'
              : 'danger'
        }
        overviewFields={
          inspectedAccount
            ? [
                { label: 'Domain', value: inspectedAccount.domain },
                { label: 'cPanel Username', value: inspectedAccount.cpanelUsername, mono: true },
                { label: 'Server IP', value: inspectedAccount.serverIp || 'Unassigned', mono: true },
                { label: 'Package Plan', value: inspectedAccount.plan?.name || 'Standard' },
                { label: 'Client Email', value: inspectedAccount.user?.email || '—' },
                { label: 'Client Name', value: `${inspectedAccount.user?.firstName || ''} ${inspectedAccount.user?.lastName || ''}`.trim() || '—' },
                { label: 'Status', value: inspectedAccount.status },
                { label: 'Expires Date', value: new Date(inspectedAccount.expiresAt).toLocaleDateString() },
                { label: 'Created At', value: new Date(inspectedAccount.createdAt).toLocaleString() },
              ]
            : undefined
        }
      />
    </div>
  );
}
