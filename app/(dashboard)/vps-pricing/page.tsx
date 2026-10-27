'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useAdminVpsPlans,
  useCreateVpsPlan,
  useUpdateVpsPlan,
  useDeleteVpsPlan,
} from '@/lib/hooks/useVpsPlans';
import type { AdminVpsPlan } from '@/lib/api/vpsPlans';
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  Cpu,
  DollarSign,
  HardDrive,
  MemoryStick,
  Pencil,
  Plus,
  Power,
  RefreshCw,
  Server,
  Trash2,
  X,
} from 'lucide-react';

const formatNaira = (amount: number) => `₦${amount.toLocaleString('en-NG')}`;

const formatUsd = (amount: number) =>
  `$${amount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

const roundUpToHundred = (amount: number) => Math.ceil(amount / 100) * 100;

const wholeNumber = (value: string) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && Number.isInteger(parsed) ? parsed : NaN;
};

type Notification = { message: string; type: 'success' | 'error' } | null;

export default function VpsPricingPage() {
  const { data, isLoading, isError, refetch } = useAdminVpsPlans();
  const createPlan = useCreateVpsPlan();
  const updatePlan = useUpdateVpsPlan();
  const deletePlan = useDeleteVpsPlan();

  const plans = data?.plans ?? [];
  const usdToNgn = data?.exchange.usdToNgn ?? 0;

  const [notification, setNotification] = useState<Notification>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<AdminVpsPlan | null>(null);

  const [name, setName] = useState('');
  const [providerType, setProviderType] = useState('');
  const [cpu, setCpu] = useState('');
  const [ramGb, setRamGb] = useState('');
  const [diskGb, setDiskGb] = useState('');
  const [price, setPrice] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [usdAmount, setUsdAmount] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  const parsedUsd = Number(usdAmount);
  const convertedNgn =
    usdToNgn > 0 && Number.isFinite(parsedUsd) && parsedUsd > 0
      ? roundUpToHundred(parsedUsd * usdToNgn)
      : null;

  const resetForm = () => {
    setName('');
    setProviderType('');
    setCpu('');
    setRamGb('');
    setDiskGb('');
    setPrice('');
    setIsActive(true);
    setUsdAmount('');
    setFormError(null);
  };

  const openCreateModal = () => {
    setIsEditing(false);
    setSelectedPlan(null);
    resetForm();
    setIsModalOpen(true);
  };

  const openEditModal = (plan: AdminVpsPlan) => {
    setIsEditing(true);
    setSelectedPlan(plan);
    setName(plan.name);
    setProviderType(plan.providerType);
    setCpu(String(plan.cpu));
    setRamGb(String(plan.ramGb));
    setDiskGb(String(plan.diskGb));
    setPrice(String(plan.priceNgnMonthly));
    setIsActive(plan.isActive);
    setUsdAmount('');
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError(null);

    const vcpu = wholeNumber(cpu);
    const ram = wholeNumber(ramGb);
    const disk = wholeNumber(diskGb);
    const monthlyPrice = wholeNumber(price);
    const cleanName = name.trim();
    const cleanProviderType = providerType.trim().toLowerCase();

    if (cleanName.length < 2) {
      setFormError('Enter a plan name with at least 2 characters.');
      return;
    }

    if (!/^[a-z0-9][a-z0-9-]*$/.test(cleanProviderType)) {
      setFormError('Enter a valid Hetzner server type, e.g. cx22 or cpx11.');
      return;
    }

    if (!Number.isInteger(vcpu) || vcpu < 1) {
      setFormError('vCPU must be a whole number of at least 1.');
      return;
    }

    if (!Number.isInteger(ram) || ram < 1) {
      setFormError('RAM must be a whole number of at least 1 GB.');
      return;
    }

    if (!Number.isInteger(disk) || disk < 1) {
      setFormError('Disk must be a whole number of at least 1 GB.');
      return;
    }

    if (!Number.isInteger(monthlyPrice) || monthlyPrice < 100) {
      setFormError('Monthly price must be a whole naira amount of at least ₦100.');
      return;
    }

    const payload = {
      name: cleanName,
      providerType: cleanProviderType,
      cpu: vcpu,
      ramGb: ram,
      diskGb: disk,
      priceNgnMonthly: monthlyPrice,
      isActive,
    };

    try {
      if (isEditing && selectedPlan) {
        await updatePlan.mutateAsync({ id: selectedPlan.id, data: payload });
        showToast(
          `"${cleanName}" now sells for ${formatNaira(monthlyPrice)}/month.`,
          'success',
        );
      } else {
        await createPlan.mutateAsync(payload);
        showToast(
          `"${cleanName}" created at ${formatNaira(monthlyPrice)}/month.`,
          'success',
        );
      }
      setIsModalOpen(false);
    } catch (error) {
      setFormError(
        error instanceof Error ? error.message : 'Could not save the VPS plan.',
      );
    }
  };

  const handleToggleActive = async (plan: AdminVpsPlan) => {
    try {
      await updatePlan.mutateAsync({
        id: plan.id,
        data: { isActive: !plan.isActive },
      });
      showToast(
        plan.isActive
          ? `"${plan.name}" is now hidden from customers.`
          : `"${plan.name}" is live again.`,
        'success',
      );
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Could not update visibility.',
        'error',
      );
    }
  };

  const handleDelete = async (plan: AdminVpsPlan) => {
    const confirmed = confirm(
      `Delete "${plan.name}"?\n\nIf this plan has servers or order history it will be deactivated instead, so existing customers keep their service.`,
    );
    if (!confirmed) return;

    try {
      await deletePlan.mutateAsync(plan.id);
      showToast(`"${plan.name}" deleted or deactivated.`, 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'Could not delete the plan.',
        'error',
      );
    }
  };

  const saving = createPlan.isPending || updatePlan.isPending;
  const specsLocked =
    isEditing &&
    !!selectedPlan &&
    (selectedPlan.serversCount > 0 || selectedPlan.orderItemsCount > 0);

  return (
    <div className="relative min-h-screen pb-12">
      {notification && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-center gap-3 border px-4 py-3 shadow-lg ${
            notification.type === 'success'
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800'
              : 'border-rose-200 bg-rose-50 text-rose-700'
          }`}
        >
          {notification.type === 'success' ? (
            <Check size={18} />
          ) : (
            <AlertCircle size={18} />
          )}
          <span className="text-sm font-medium">{notification.message}</span>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#0f172a]">
            VPS Plans &amp; Pricing
          </h1>
          <p className="text-sm text-[#64748b]">
            Set the Naira price customers see on the public VPS page and pay at
            checkout. Checkout always reads the price saved here.
          </p>
        </div>

        <Button onClick={openCreateModal} variant="primary" size="sm" className="h-9">
          <Plus size={16} className="mr-1.5" />
          Create VPS Plan
        </Button>
      </div>

      <div className="mb-6 flex flex-col gap-3 rounded-xl border border-sky-200 bg-sky-50/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-sky-200 bg-white text-sky-600">
            <DollarSign size={16} />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-[#0f172a]">
              USD pricing helper
            </p>
            <p className="text-[11.5px] leading-relaxed text-[#64748b]">
              {usdToNgn > 0
                ? `1 USD = ${formatNaira(usdToNgn)}. Convert a dollar amount into Naira, then review and save it.`
                : 'The shared USD rate is unavailable right now.'}{' '}
              Saving always stores a Naira price.
            </p>
          </div>
        </div>

        <Link
          href="/domains"
          className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-sky-700 hover:text-sky-900"
        >
          Update USD rate
          <ArrowUpRight size={13} />
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 py-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-80 animate-pulse rounded-xl bg-slate-100" />
          ))}
        </div>
      ) : isError ? (
        <div className="rounded-xl border border-rose-200 bg-white py-16 text-center">
          <AlertCircle size={40} className="mx-auto text-rose-400" />
          <p className="mt-3 text-base font-bold text-[#0f172a]">
            Could not load VPS plans
          </p>
          <p className="mt-1 text-sm text-[#64748b]">
            Check the API connection and try again.
          </p>
          <Button onClick={() => refetch()} variant="outline" size="sm" className="mt-4">
            <RefreshCw size={14} className="mr-1.5" />
            Retry
          </Button>
        </div>
      ) : plans.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[#cbd5e1] bg-white py-16 text-center">
          <Server size={44} className="mx-auto text-slate-400" />
          <p className="mt-3 text-base font-bold text-[#0f172a]">
            No VPS plans configured
          </p>
          <p className="mt-1 text-sm text-[#64748b]">
            Create a plan to make it available for purchase.
          </p>
          <Button onClick={openCreateModal} variant="primary" size="sm" className="mt-4">
            <Plus size={15} className="mr-1.5" />
            Create VPS Plan
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-xl border border-[#e2e8f0] bg-white shadow-xs transition-all duration-200 hover:border-[#cbd5e1] hover:shadow-md ${
                plan.isActive ? 'border-t-2 border-t-sky-500' : 'border-t-2 border-t-slate-300 opacity-70'
              }`}
            >
              <div className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-bold text-[#0f172a]">
                      {plan.name}
                    </h3>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <Badge variant={plan.isActive ? 'success' : 'danger'}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                        {plan.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge variant="info">{plan.providerType}</Badge>
                    </div>
                  </div>

                  <div className="shrink-0 text-right">
                    <span className="block font-mono text-2xl font-black text-[#0f172a]">
                      {formatNaira(plan.priceNgnMonthly)}
                    </span>
                    <span className="block text-[11px] font-mono text-[#64748b]">
                      per month
                    </span>
                    {usdToNgn > 0 && (
                      <span className="mt-0.5 block text-[10.5px] font-mono text-[#94a3b8]">
                        ≈ {formatUsd(plan.priceNgnMonthly / usdToNgn)}/mo
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-1 flex-col border-t border-[#e2e8f0] p-5 pt-4">
                <div className="grid grid-cols-3 gap-2 rounded-lg border border-[#e2e8f0] bg-[#f8fafc] p-3 text-center">
                  <div>
                    <Cpu size={14} className="mx-auto text-sky-600" />
                    <p className="mt-1 font-mono text-sm font-bold text-[#0f172a]">
                      {plan.cpu}
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">
                      vCPU
                    </p>
                  </div>
                  <div className="border-x border-[#e2e8f0]">
                    <MemoryStick size={14} className="mx-auto text-sky-600" />
                    <p className="mt-1 font-mono text-sm font-bold text-[#0f172a]">
                      {plan.ramGb} GB
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">
                      RAM
                    </p>
                  </div>
                  <div>
                    <HardDrive size={14} className="mx-auto text-sky-600" />
                    <p className="mt-1 font-mono text-sm font-bold text-[#0f172a]">
                      {plan.diskGb} GB
                    </p>
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#64748b]">
                      NVMe
                    </p>
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1.5 text-[11px] text-[#64748b]">
                  <Server size={12} className="shrink-0" />
                  <span>
                    {plan.serversCount} server{plan.serversCount === 1 ? '' : 's'}
                  </span>
                  <span className="text-[#cbd5e1]">·</span>
                  <span>
                    {plan.orderItemsCount} order{plan.orderItemsCount === 1 ? '' : 's'}
                  </span>
                </div>

                <div className="mt-auto flex items-center gap-2 border-t border-[#e2e8f0] pt-4">
                  <button
                    type="button"
                    onClick={() => openEditModal(plan)}
                    className="flex h-8 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-lg border border-[#0f172a] bg-[#0f172a] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#1e293b]"
                  >
                    <Pencil size={12} className="text-sky-400" />
                    Edit price
                  </button>

                  <button
                    type="button"
                    onClick={() => handleToggleActive(plan)}
                    disabled={updatePlan.isPending}
                    title={plan.isActive ? 'Hide plan' : 'Make plan live'}
                    className={`flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      plan.isActive
                        ? 'border-[#e2e8f0] bg-white text-[#64748b] hover:border-amber-200 hover:bg-amber-50 hover:text-amber-700'
                        : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                    }`}
                  >
                    <Power size={13} />
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDelete(plan)}
                    disabled={deletePlan.isPending}
                    title="Delete or deactivate plan"
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg border border-[#e2e8f0] bg-white text-[#64748b] transition-colors hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-[2px]"
            onClick={() => setIsModalOpen(false)}
          />

          <div className="fixed top-1/2 left-1/2 z-50 flex max-h-[92vh] w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-y-auto rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between border-b border-[#e2e8f0] pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0f172a]">
                  {isEditing ? 'Edit VPS plan' : 'Create VPS plan'}
                </h3>
                <p className="mt-0.5 text-[11.5px] text-[#64748b]">
                  {isEditing
                    ? 'Price changes apply to new purchases immediately.'
                    : 'The plan appears on the public VPS page as soon as it is active.'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="cursor-pointer rounded-md p-1 text-[#64748b] transition-colors hover:bg-slate-100 hover:text-[#0f172a]"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {formError && (
                <div className="flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-[12px] text-rose-700">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {specsLocked && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-[12px] text-amber-800">
                  <AlertCircle size={15} className="mt-0.5 shrink-0" />
                  <span>
                    This plan has already been sold. Price, name and visibility
                    can change, but hardware specs are locked so existing
                    servers stay accurate. Create a new plan for different
                    specs.
                  </span>
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748b]">
                    Plan name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full border border-[#cbd5e1] bg-white p-2 text-sm text-[#0f172a] focus:border-sky-500 focus:outline-none"
                    placeholder="e.g. VPS Business"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748b]">
                    Hetzner server type
                  </label>
                  <input
                    type="text"
                    required
                    value={providerType}
                    onChange={(event) => setProviderType(event.target.value)}
                    disabled={specsLocked}
                    className="w-full border border-[#cbd5e1] bg-white p-2 font-mono text-sm text-[#0f172a] focus:border-sky-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="e.g. cx22"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748b]">
                    vCPU
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={cpu}
                    onChange={(event) => setCpu(event.target.value)}
                    disabled={specsLocked}
                    className="w-full border border-[#cbd5e1] bg-white p-2 text-sm text-[#0f172a] focus:border-sky-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="2"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748b]">
                    RAM (GB)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={ramGb}
                    onChange={(event) => setRamGb(event.target.value)}
                    disabled={specsLocked}
                    className="w-full border border-[#cbd5e1] bg-white p-2 text-sm text-[#0f172a] focus:border-sky-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="4"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748b]">
                    Disk (GB)
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={diskGb}
                    onChange={(event) => setDiskGb(event.target.value)}
                    disabled={specsLocked}
                    className="w-full border border-[#cbd5e1] bg-white p-2 text-sm text-[#0f172a] focus:border-sky-500 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
                    placeholder="40"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-bold uppercase text-[#64748b]">
                  Monthly price (₦)
                </label>
                <input
                  type="number"
                  required
                  min="100"
                  step="1"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className="w-full border border-[#cbd5e1] bg-white p-2 font-mono text-sm text-[#0f172a] focus:border-sky-500 focus:outline-none"
                  placeholder="e.g. 15000"
                />
                <p className="mt-1 text-[11px] text-[#64748b]">
                  Whole Naira amount. This exact price is charged at checkout.
                </p>
              </div>

              <div className="rounded-lg border border-sky-200 bg-sky-50/70 p-3">
                <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-sky-800">
                  <DollarSign size={13} />
                  Convert from USD
                </div>

                <div className="mt-2 flex flex-col gap-2 sm:flex-row sm:items-center">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={usdAmount}
                    onChange={(event) => setUsdAmount(event.target.value)}
                    disabled={usdToNgn <= 0}
                    className="w-full border border-sky-200 bg-white p-2 font-mono text-sm text-[#0f172a] focus:border-sky-500 focus:outline-none disabled:bg-slate-100 sm:max-w-[180px]"
                    placeholder="USD amount, e.g. 10.00"
                  />

                  <div className="flex flex-1 items-center justify-between gap-2">
                    <span className="text-[11.5px] text-[#475569]">
                      {convertedNgn !== null
                        ? `${formatUsd(parsedUsd)} × ${formatNaira(usdToNgn)} = ${formatNaira(
                            parsedUsd * usdToNgn,
                          )} → ${formatNaira(convertedNgn)}`
                        : usdToNgn > 0
                          ? 'Enter a USD amount to see the Naira price.'
                          : 'USD rate unavailable.'}
                    </span>

                    {convertedNgn !== null && (
                      <button
                        type="button"
                        onClick={() => setPrice(String(convertedNgn))}
                        className="shrink-0 cursor-pointer rounded-md border border-sky-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-sky-700 transition-colors hover:bg-sky-100"
                      >
                        Use this price
                      </button>
                    )}
                  </div>
                </div>

                <p className="mt-2 text-[10.5px] leading-relaxed text-[#64748b]">
                  The converted amount is rounded up to the nearest ₦100. Review
                  it against your Hetzner cost before saving.
                </p>
              </div>

              <label className="flex cursor-pointer items-center gap-2 border border-[#e2e8f0] bg-[#f8fafc] p-3 text-xs font-bold uppercase text-[#0f172a]">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(event) => setIsActive(event.target.checked)}
                  className="h-4 w-4 rounded-none border-[#cbd5e1] text-sky-600 focus:ring-0"
                />
                Active — show this plan to customers
              </label>

              <div className="mt-6 flex gap-2 border-t border-[#e2e8f0] pt-4">
                <Button type="submit" variant="primary" className="flex-1" disabled={saving}>
                  {saving ? 'Saving…' : isEditing ? 'Save price' : 'Create plan'}
                </Button>
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="cursor-pointer rounded-lg border border-[#cbd5e1] bg-white px-4 py-2 text-xs font-semibold text-[#0f172a] transition-colors hover:bg-slate-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
