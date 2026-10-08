'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useAdminPlans,
  useCreatePlan,
  useUpdatePlan,
  useDeletePlan,
} from '@/lib/hooks/usePlans';
import { RowDetailDrawer } from '@/components/ui/row-detail-drawer';
import {
  LayoutDashboard,
  Plus,
  Edit3,
  Trash2,
  CheckCircle,
  XCircle,
  HardDrive,
  Activity,
  Globe,
  Mail,
  ListPlus,
  X,
  AlertCircle,
  Check,
  Code,
} from 'lucide-react';

export default function PlansPage() {
  const { data: plans, isLoading, refetch } = useAdminPlans();
  const createPlan = useCreatePlan();
  const updatePlan = useUpdatePlan();
  const deletePlan = useDeletePlan();

  // Row Inspection state
  const [inspectedPlan, setInspectedPlan] = useState<any | null>(null);

  // Modal / Form States
  const [selectedPlan, setSelectedPlan] = useState<any | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [monthlyPrice, setMonthlyPrice] = useState('');
  const [quarterlyPrice, setQuarterlyPrice] = useState('');
  const [billingCycle, setBillingCycle] = useState('yearly');
  const [storage, setStorage] = useState('');
  const [bandwidth, setBandwidth] = useState('');
  const [websites, setWebsites] = useState('');
  const [emails, setEmails] = useState('');
  const [featuresText, setFeaturesText] = useState('');
  const [isPopular, setIsPopular] = useState(false);
  const [isActive, setIsActive] = useState(true);

  // Toast / Alert banner state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setSelectedPlan(null);
    setName('');
    setPrice('');
    setMonthlyPrice('');
    setQuarterlyPrice('');
    setBillingCycle('yearly');
    setStorage('');
    setBandwidth('');
    setWebsites('');
    setEmails('');
    setFeaturesText('');
    setIsPopular(false);
    setIsActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (plan: any) => {
    setIsEditing(true);
    setSelectedPlan(plan);
    setName(plan.name);
    setPrice(String(plan.price));
    setMonthlyPrice(plan.monthlyPrice !== null ? String(plan.monthlyPrice) : '');
    setQuarterlyPrice(plan.quarterlyPrice !== null ? String(plan.quarterlyPrice) : '');
    setBillingCycle(plan.billingCycle);
    setStorage(plan.storage);
    setBandwidth(plan.bandwidth);
    setWebsites(String(plan.websites));
    setEmails(String(plan.emails));
    setFeaturesText(plan.features?.join('\n') || '');
    setIsPopular(plan.isPopular);
    setIsActive(plan.isActive);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const planData = {
      name,
      price: parseFloat(price),
      monthlyPrice: monthlyPrice ? parseFloat(monthlyPrice) : null,
      quarterlyPrice: quarterlyPrice ? parseFloat(quarterlyPrice) : null,
      billingCycle,
      storage,
      bandwidth,
      websites: parseInt(websites, 10),
      emails: parseInt(emails, 10),
      features: featuresText.split('\n').map((f) => f.trim()).filter((f) => f.length > 0),
      isPopular,
      isActive,
    };

    try {
      if (isEditing && selectedPlan) {
        await updatePlan.mutateAsync({ id: selectedPlan.id, data: planData });
        showToast(`Plan "${name}" updated successfully`, 'success');
      } else {
        await createPlan.mutateAsync(planData);
        showToast(`Plan "${name}" created successfully`, 'success');
      }
      setIsModalOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Something went wrong', 'error');
    }
  };

  const handleDeletePlan = async (plan: any) => {
    if (!confirm(`Are you sure you want to delete/deactivate "${plan.name}"?`)) {
      return;
    }
    try {
      await deletePlan.mutateAsync(plan.id);
      showToast(`Deactivated/deleted "${plan.name}" successfully`, 'success');
      refetch();
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Deletion failed', 'error');
    }
  };

  return (
    <div className="relative min-h-screen pb-12">
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

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Hosting Plans</h1>
          <p className="text-sm text-muted-foreground">
            Configure rates, parameters, limits, and visibility statuses for cPanel hosting packages.
          </p>
        </div>

        <Button onClick={handleOpenCreateModal} variant="primary" size="sm" className="h-9">
          <Plus size={16} className="mr-1.5" />
          Create New Plan
        </Button>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
          <div className="h-64 bg-muted animate-pulse" />
          <div className="h-64 bg-muted animate-pulse" />
          <div className="h-64 bg-muted animate-pulse" />
        </div>
      ) : !plans || plans.length === 0 ? (
        <Card className="text-center py-16 border-dashed">
          <CardContent className="flex flex-col items-center gap-4">
            <LayoutDashboard size={48} className="text-muted-foreground" />
            <div>
              <p className="text-lg font-bold">No hosting plans configured</p>
              <p className="text-sm text-muted-foreground">
                Get started by creating your first subscription package.
              </p>
            </div>
            <Button onClick={handleOpenCreateModal} variant="primary" size="sm">
              <Plus size={16} className="mr-1.5" />
              Create Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-xl border bg-white shadow-xs transition-all duration-200 border-[#e2e8f0] hover:border-[#cbd5e1] hover:shadow-md ${
                plan.isPopular ? 'border-t-2 border-t-amber-500' : 'border-t-2 border-t-sky-500'
              } ${!plan.isActive ? 'opacity-60' : ''}`}
            >
              <div className="p-5 pb-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-[#0f172a]">{plan.name}</h3>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                      <Badge variant={plan.isActive ? 'success' : 'danger'}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      {plan.isPopular && (
                        <span className="px-2 py-0.5 text-[10px] font-mono font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          Popular
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#0f172a] font-mono">
                      ₦{plan.price.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-[#64748b] block font-mono">/ {plan.billingCycle}</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col p-5 pt-3 border-t border-[#e2e8f0]">
                {/* Secondary Pricing (Monthly/Quarterly) */}
                <div className="grid grid-cols-2 gap-2 text-xs bg-[#f8fafc] p-2.5 mb-4 border border-[#e2e8f0] rounded-lg">
                  <div>
                    <span className="text-[#64748b] block text-[10px] uppercase font-semibold">Monthly Price</span>
                    <span className="font-semibold font-mono text-[#0f172a] text-xs">
                      {plan.monthlyPrice !== null ? `₦${plan.monthlyPrice.toLocaleString()}` : '—'}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#64748b] block text-[10px] uppercase font-semibold">Quarterly Price</span>
                    <span className="font-semibold font-mono text-[#0f172a] text-xs">
                      {plan.quarterlyPrice !== null ? `₦${plan.quarterlyPrice.toLocaleString()}` : '—'}
                    </span>
                  </div>
                </div>

                {/* Resource Limits List */}
                <div className="space-y-2 mb-6 text-xs">
                  <div className="flex items-center gap-2 text-[#64748b]">
                    <HardDrive size={14} className="text-sky-600" />
                    <span className="font-medium text-[#0f172a]">{plan.storage}</span> SSD Storage
                  </div>
                  <div className="flex items-center gap-2 text-[#64748b]">
                    <Activity size={14} className="text-sky-600" />
                    <span className="font-medium text-[#0f172a]">{plan.bandwidth}</span> Bandwidth
                  </div>
                  <div className="flex items-center gap-2 text-[#64748b]">
                    <Globe size={14} className="text-sky-600" />
                    <span className="font-medium text-[#0f172a]">
                      {plan.websites >= 999 ? 'Unlimited' : plan.websites}
                    </span>{' '}
                    Websites
                  </div>
                  <div className="flex items-center gap-2 text-[#64748b]">
                    <Mail size={14} className="text-sky-600" />
                    <span className="font-medium text-[#0f172a]">
                      {plan.emails >= 999 ? 'Unlimited' : plan.emails}
                    </span>{' '}
                    Emails
                  </div>
                </div>

                {/* Plan Features */}
                {plan.features && plan.features.length > 0 && (
                  <div className="border-t border-[#e2e8f0] pt-3 mb-6 flex-1">
                    <span className="text-[10px] font-semibold text-[#64748b] uppercase tracking-wider block mb-2">
                      Included Features
                    </span>
                    <ul className="space-y-1.5 text-xs text-[#64748b]">
                      {plan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <Check size={12} className="text-emerald-600 mt-0.5 shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-2 pt-3 border-t border-[#e2e8f0] mt-auto">
                  <button
                    type="button"
                    onClick={() => setInspectedPlan(plan)}
                    className="h-8 px-2.5 rounded-lg bg-white hover:bg-slate-50 text-[#0f172a] border border-[#cbd5e1] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                    title="Inspect API response"
                  >
                    <Code size={13} className="text-sky-600" />
                    <span className="hidden sm:inline">Inspect</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenEditModal(plan)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 h-8 text-xs font-semibold rounded-lg bg-[#0f172a] hover:bg-[#1e293b] text-white border border-[#0f172a] transition-colors cursor-pointer"
                  >
                    <Edit3 size={12} className="text-sky-400" />
                    <span>Configure Details</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeletePlan(plan)}
                    className="h-8 w-8 flex items-center justify-center rounded-lg bg-white hover:bg-rose-50 text-[#64748b] hover:text-rose-600 border border-[#e2e8f0] hover:border-rose-200 transition-colors cursor-pointer"
                    title="Deactivate/Delete plan"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE & EDIT MODAL DIALOG */}
      {isModalOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 transition-opacity"
            onClick={() => setIsModalOpen(false)}
          />

          {/* Modal Panel */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-xl bg-white border border-[#e2e8f0] rounded-xl shadow-2xl z-50 p-6 flex flex-col max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-[#e2e8f0] pb-3 mb-4">
              <h3 className="text-base font-bold text-[#0f172a]">
                {isEditing ? 'Configure Package Details' : 'Create Hosting Package'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-md hover:bg-slate-100 text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Row 1: Name & Billing Cycle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Plan Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                    placeholder="e.g. Personal Starter"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Billing Cycle</label>
                  <select
                    value={billingCycle}
                    onChange={(e) => setBillingCycle(e.target.value)}
                    className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                  >
                    <option value="yearly">Yearly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>

              {/* Row 2: Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Base Price (₦)</label>
                  <input
                    type="number"
                    required
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                    placeholder="e.g. 30000"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Monthly Override (₦)</label>
                  <input
                    type="number"
                    value={monthlyPrice}
                    onChange={(e) => setMonthlyPrice(e.target.value)}
                    className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                    placeholder="Optional override"
                    min="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Quarterly Override (₦)</label>
                  <input
                    type="number"
                    value={quarterlyPrice}
                    onChange={(e) => setQuarterlyPrice(e.target.value)}
                    className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                    placeholder="Optional override"
                    min="0"
                  />
                </div>
              </div>

              {/* Row 3: Resources (Storage & Bandwidth) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">SSD Storage Limit</label>
                  <input
                    type="text"
                    required
                    value={storage}
                    onChange={(e) => setStorage(e.target.value)}
                    className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                    placeholder="e.g. 2GB SSD"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Bandwidth Limit</label>
                  <input
                    type="text"
                    required
                    value={bandwidth}
                    onChange={(e) => setBandwidth(e.target.value)}
                    className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                    placeholder="e.g. 10GB or Unlimited"
                  />
                </div>
              </div>

              {/* Row 4: Account Limits (Websites & Emails) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Websites Limit</label>
                  <input
                    type="number"
                    required
                    value={websites}
                    onChange={(e) => setWebsites(e.target.value)}
                    className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                    placeholder="e.g. 1 (use 999 for Unlimited)"
                    min="1"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Emails Limit</label>
                  <input
                    type="number"
                    required
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                    className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                    placeholder="e.g. 2 (use 999 for Unlimited)"
                    min="1"
                  />
                </div>
              </div>

              {/* Textarea: Feature strings */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">
                  Additional Feature Bullets
                </label>
                <textarea
                  value={featuresText}
                  onChange={(e) => setFeaturesText(e.target.value)}
                  rows={4}
                  className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a] font-sans"
                  placeholder="Enter each feature on a separate line, e.g.:&#10;Free SSL Certificate&#10;Daily Automatic Backups&#10;cPanel Access Dashboard"
                />
              </div>

              {/* Row 5: Options (isActive & isPopular) */}
              <div className="flex flex-wrap items-center gap-6 bg-muted/40 p-3 border border-border">
                <label className="flex items-center gap-2 text-xs font-bold uppercase cursor-pointer text-foreground">
                  <input
                    type="checkbox"
                    checked={isPopular}
                    onChange={(e) => setIsPopular(e.target.checked)}
                    className="h-4 w-4 border-border rounded-none text-[#e8900a] focus:ring-0"
                  />
                  Mark as Popular / Highlighted
                </label>

                <label className="flex items-center gap-2 text-xs font-bold uppercase cursor-pointer text-foreground">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="h-4 w-4 border-border rounded-none text-[#e8900a] focus:ring-0"
                  />
                  Make Plan Active (Visible)
                </label>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-[#e2e8f0] mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={createPlan.isPending || updatePlan.isPending}
                >
                  {createPlan.isPending || updatePlan.isPending ? 'Processing...' : 'Save Package'}
                </Button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-50 text-[#0f172a] border border-[#cbd5e1] transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* Row Inspector Drawer */}
      <RowDetailDrawer
        isOpen={!!inspectedPlan}
        onClose={() => setInspectedPlan(null)}
        title={inspectedPlan?.name || 'Hosting Plan'}
        subtitle={`₦${inspectedPlan?.price?.toLocaleString() || 0} / ${inspectedPlan?.billingCycle || 'yearly'}`}
        entityType="HOSTING PLAN"
        data={inspectedPlan}
        status={inspectedPlan?.isActive ? 'ACTIVE' : 'INACTIVE'}
        statusVariant={inspectedPlan?.isActive ? 'success' : 'danger'}
        overviewFields={
          inspectedPlan
            ? [
                { label: 'Plan Name', value: inspectedPlan.name },
                { label: 'Base Price', value: `₦${Number(inspectedPlan.price).toLocaleString()}`, mono: true },
                { label: 'Billing Cycle', value: inspectedPlan.billingCycle },
                { label: 'Monthly Price', value: inspectedPlan.monthlyPrice ? `₦${Number(inspectedPlan.monthlyPrice).toLocaleString()}` : '—', mono: true },
                { label: 'Quarterly Price', value: inspectedPlan.quarterlyPrice ? `₦${Number(inspectedPlan.quarterlyPrice).toLocaleString()}` : '—', mono: true },
                { label: 'SSD Storage', value: inspectedPlan.storage },
                { label: 'Bandwidth', value: inspectedPlan.bandwidth },
                { label: 'Websites Allowed', value: inspectedPlan.websites >= 999 ? 'Unlimited' : inspectedPlan.websites, mono: true },
                { label: 'Emails Allowed', value: inspectedPlan.emails >= 999 ? 'Unlimited' : inspectedPlan.emails, mono: true },
                { label: 'Popular Highlight', value: inspectedPlan.isPopular ? 'Yes' : 'No' },
                { label: 'Active Status', value: inspectedPlan.isActive ? 'Active' : 'Inactive' },
              ]
            : undefined
        }
      />
    </div>
  );
}
