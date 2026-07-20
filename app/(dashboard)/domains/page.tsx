'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useDomainPricing,
  useUpdateGlobalPricing,
  useUpdateExtensionPricing,
  useDeleteExtensionPricing,
  useAdminDomains,
} from '@/lib/hooks/usePricing';
import {
  Globe,
  Settings,
  DollarSign,
  Percent,
  Edit3,
  X,
  RefreshCw,
  Search,
  Check,
  TrendingUp,
  AlertCircle,
  Trash2,
} from 'lucide-react';

export default function DomainsPage() {
  const { data: pricingData, isLoading: isPricingLoading, refetch: refetchPricing } = useDomainPricing();
  const { data: domainsData, isLoading: isDomainsLoading, refetch: refetchDomains } = useAdminDomains();

  const updateGlobalPricing = useUpdateGlobalPricing();
  const updateExtensionPricing = useUpdateExtensionPricing();
  const deleteExtensionPricing = useDeleteExtensionPricing();

  // Navigation
  const [activeTab, setActiveTab] = useState<'pricing' | 'list'>('pricing');

  // Search filter for domains
  const [domainSearch, setDomainSearch] = useState('');

  // Global settings editing state
  const [isEditingGlobals, setIsEditingGlobals] = useState(false);
  const [usdRate, setUsdRate] = useState('');
  const [eurRate, setEurRate] = useState('');
  const [globalMarkup, setGlobalMarkup] = useState('');

  // Extension override editing state
  const [selectedExtension, setSelectedExtension] = useState<string | null>(null);
  const [tldMarkup, setTldMarkup] = useState('');
  const [tldCustomPrice, setTldCustomPrice] = useState('');
  const [useFlatPrice, setUseFlatPrice] = useState(false);

  // Simple Notification banner state
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handleEditGlobals = () => {
    if (pricingData?.globalSettings) {
      setUsdRate(String(pricingData.globalSettings.usdToNgn));
      setEurRate(String(pricingData.globalSettings.eurToNgn));
      setGlobalMarkup(String(pricingData.globalSettings.globalMarkup));
    }
    setIsEditingGlobals(true);
  };

  const handleSaveGlobals = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateGlobalPricing.mutateAsync({
        usdToNgn: parseFloat(usdRate),
        eurToNgn: parseFloat(eurRate),
        globalMarkup: parseFloat(globalMarkup),
      });
      setIsEditingGlobals(false);
      showToast('Global pricing settings updated successfully', 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update globals', 'error');
    }
  };

  const handleEditExtension = (extItem: any) => {
    setSelectedExtension(extItem.extension);
    setTldMarkup(String(extItem.markupPercentage));
    setTldCustomPrice(extItem.customPrice !== null ? String(extItem.customPrice) : '');
    setUseFlatPrice(extItem.customPrice !== null);
  };

  const handleSaveExtension = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedExtension) return;

    try {
      await updateExtensionPricing.mutateAsync({
        extension: selectedExtension,
        markupPercentage: useFlatPrice ? undefined : parseFloat(tldMarkup),
        customPrice: useFlatPrice ? parseFloat(tldCustomPrice) : null,
      });
      setSelectedExtension(null);
      showToast(`Pricing override updated for .${selectedExtension}`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to save extension override', 'error');
    }
  };

  const handleDeleteOverride = async (extension: string) => {
    if (!confirm(`Are you sure you want to delete the override for .${extension} and revert to global defaults?`)) {
      return;
    }
    try {
      await deleteExtensionPricing.mutateAsync(extension);
      showToast(`Pricing override cleared for .${extension}`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to delete override', 'error');
    }
  };

  // Filter domains
  const filteredDomains = domainsData?.filter(
    (d) =>
      d.name.toLowerCase().includes(domainSearch.toLowerCase()) ||
      d.user?.email.toLowerCase().includes(domainSearch.toLowerCase()) ||
      d.user?.firstName.toLowerCase().includes(domainSearch.toLowerCase()) ||
      d.user?.lastName.toLowerCase().includes(domainSearch.toLowerCase())
  ) || [];

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

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Domains</h1>
          <p className="text-sm text-muted-foreground">
            Configure pricing margins, exchange rates, and manage registered domain names.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchPricing();
              refetchDomains();
              showToast('Pricing and domains refreshed', 'success');
            }}
            disabled={isPricingLoading || isDomainsLoading}
          >
            <RefreshCw size={14} className={isPricingLoading || isDomainsLoading ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-border mb-6">
        <button
          onClick={() => setActiveTab('pricing')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'pricing'
              ? 'border-primary text-primary bg-background'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          Pricing & Profit Margins
        </button>
        <button
          onClick={() => setActiveTab('list')}
          className={`px-6 py-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'list'
              ? 'border-primary text-primary bg-background'
              : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/30'
          }`}
        >
          Registered Domains ({domainsData?.length ?? 0})
        </button>
      </div>

      {/* PRICING TAB CONTENT */}
      {activeTab === 'pricing' && (
        <div className="space-y-6">
          {/* Global Settings Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* USD Rate Card */}
            <Card className="relative overflow-hidden group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">USD Exchange Rate</span>
                  <div className="p-2 bg-secondary text-primary">
                    <DollarSign size={16} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isPricingLoading ? (
                  <div className="h-9 w-24 bg-muted animate-pulse mb-2" />
                ) : (
                  <p className="text-3xl font-extrabold text-foreground">
                    ₦{pricingData?.globalSettings.usdToNgn.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-muted-foreground">/ USD</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Used to convert USD wholesale domain costs.</p>
              </CardContent>
            </Card>

            {/* EUR Rate Card */}
            <Card className="relative overflow-hidden group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">EUR Exchange Rate</span>
                  <div className="p-2 bg-secondary text-primary">
                    <TrendingUp size={16} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isPricingLoading ? (
                  <div className="h-9 w-24 bg-muted animate-pulse mb-2" />
                ) : (
                  <p className="text-3xl font-extrabold text-foreground">
                    ₦{pricingData?.globalSettings.eurToNgn.toLocaleString()}{' '}
                    <span className="text-xs font-normal text-muted-foreground">/ EUR</span>
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Used for European Registry TLDs (EUR base).</p>
              </CardContent>
            </Card>

            {/* Global Markup Card */}
            <Card className="relative overflow-hidden group">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Global Profit Margin</span>
                  <div className="p-2 bg-secondary text-primary">
                    <Percent size={16} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {isPricingLoading ? (
                  <div className="h-9 w-24 bg-muted animate-pulse mb-2" />
                ) : (
                  <p className="text-3xl font-extrabold text-[#e8900a]">
                    {pricingData?.globalSettings.globalMarkup}%
                  </p>
                )}
                <p className="text-xs text-muted-foreground mt-1">Default percentage markup added above cost.</p>
              </CardContent>
            </Card>
          </div>

          {/* Inline Edit Globals Form */}
          {isEditingGlobals ? (
            <Card className="border-[#e8900a]/20 bg-[#fff8ee]/25">
              <CardHeader>
                <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary">Update Global Pricing Settings</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveGlobals} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">USD Rate (₦)</label>
                    <input
                      type="number"
                      required
                      value={usdRate}
                      onChange={(e) => setUsdRate(e.target.value)}
                      className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                      placeholder="e.g. 1400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">EUR Rate (₦)</label>
                    <input
                      type="number"
                      required
                      value={eurRate}
                      onChange={(e) => setEurRate(e.target.value)}
                      className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                      placeholder="e.g. 1640"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Global Markup (%)</label>
                    <input
                      type="number"
                      required
                      value={globalMarkup}
                      onChange={(e) => setGlobalMarkup(e.target.value)}
                      className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                      placeholder="e.g. 50"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" variant="primary" size="sm" className="flex-1" disabled={updateGlobalPricing.isPending}>
                      {updateGlobalPricing.isPending ? 'Saving...' : 'Save Settings'}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setIsEditingGlobals(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          ) : (
            <div className="flex justify-end">
              <Button onClick={handleEditGlobals} variant="outline-navy" size="sm">
                <Settings size={14} className="mr-1.5" />
                Configure Global Rates & Markups
              </Button>
            </div>
          )}

          {/* pricing list table */}
          <Card>
            <CardHeader>
              <CardTitle>Supported TLDs & Domain Cost Breakdown</CardTitle>
            </CardHeader>
            <CardContent>
              {isPricingLoading ? (
                <div className="space-y-4 py-8">
                  <div className="h-6 bg-muted animate-pulse w-full" />
                  <div className="h-10 bg-muted animate-pulse w-full" />
                  <div className="h-10 bg-muted animate-pulse w-full" />
                  <div className="h-10 bg-muted animate-pulse w-full" />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead>
                      <tr className="border-b border-border text-muted-foreground font-medium uppercase tracking-wider text-xs">
                        <th className="pb-3 pr-4 font-bold">Extension</th>
                        <th className="pb-3 pr-4 font-bold">Wholesale Price (Base)</th>
                        <th className="pb-3 pr-4 font-bold">Wholesale Cost (Naira)</th>
                        <th className="pb-3 pr-4 font-bold">Markup Margin</th>
                        <th className="pb-3 pr-4 font-bold">Override Pricing</th>
                        <th className="pb-3 pr-4 font-bold text-right">Final Price (Naira)</th>
                        <th className="pb-3 font-bold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pricingData?.extensions.map((extItem) => (
                        <tr
                          key={extItem.extension}
                          className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                        >
                          <td className="py-4 pr-4 font-bold text-foreground">
                            .{extItem.extension}
                          </td>
                          <td className="py-4 pr-4 text-muted-foreground">
                            {extItem.wholesaleCurrency === 'EUR' ? '€' : '$'}
                            {extItem.wholesalePrice.toFixed(2)} {extItem.wholesaleCurrency}
                          </td>
                          <td className="py-4 pr-4 text-muted-foreground font-mono">
                            ₦{extItem.wholesaleInNgn.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 pr-4 text-foreground">
                            {extItem.customPrice !== null ? (
                              <span className="text-muted-foreground italic">Overridden</span>
                            ) : (
                              <Badge variant={extItem.isOverridden ? 'info' : 'default'}>
                                {extItem.markupPercentage}% {extItem.isOverridden && 'Override'}
                              </Badge>
                            )}
                          </td>
                          <td className="py-4 pr-4">
                            {extItem.customPrice !== null ? (
                              <Badge variant="success">
                                ₦{extItem.customPrice.toLocaleString()} Fixed
                              </Badge>
                            ) : (
                              <span className="text-muted-foreground text-xs">—</span>
                            )}
                          </td>
                          <td className="py-4 pr-4 text-right font-bold text-primary font-mono text-base">
                            ₦{extItem.finalRetailPrice.toLocaleString()}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex justify-end items-center gap-1.5">
                              <Button
                                onClick={() => handleEditExtension(extItem)}
                                variant="outline"
                                size="sm"
                                className="px-2 py-1 h-7 text-xs font-semibold"
                              >
                                <Edit3 size={12} className="mr-1" />
                                Edit
                              </Button>

                              {extItem.isOverridden && (
                                <button
                                  onClick={() => handleDeleteOverride(extItem.extension)}
                                  className="p-1 text-destructive hover:bg-destructive/10 transition-colors"
                                  title="Revert to default"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
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
        </div>
      )}

      {/* REGISTERED DOMAINS LIST TAB CONTENT */}
      {activeTab === 'list' && (
        <Card>
          <CardHeader className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <CardTitle>All User Registered Domains</CardTitle>
              <div className="relative w-full max-w-sm">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search domains or users..."
                  value={domainSearch}
                  onChange={(e) => setDomainSearch(e.target.value)}
                  className="w-full text-sm border border-border pl-9 pr-4 py-2 bg-background focus:outline-[#e8900a]"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isDomainsLoading ? (
              <div className="space-y-4 py-8">
                <div className="h-6 bg-muted animate-pulse w-full" />
                <div className="h-10 bg-muted animate-pulse w-full" />
                <div className="h-10 bg-muted animate-pulse w-full" />
              </div>
            ) : filteredDomains.length === 0 ? (
              <p className="text-muted-foreground text-sm text-center py-12">
                No registered domains found.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead>
                    <tr className="border-b border-border text-muted-foreground font-medium uppercase tracking-wider text-xs">
                      <th className="pb-3 pr-4 font-bold">Domain Name</th>
                      <th className="pb-3 pr-4 font-bold">Registered Owner</th>
                      <th className="pb-3 pr-4 font-bold">Status</th>
                      <th className="pb-3 pr-4 font-bold">Auto Renew</th>
                      <th className="pb-3 pr-4 font-bold">Registration Date</th>
                      <th className="pb-3 font-bold text-right">Expiration Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDomains.map((dom) => (
                      <tr
                        key={dom.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                      >
                        <td className="py-4 pr-4 font-bold text-foreground flex items-center gap-2">
                          <Globe size={14} className="text-muted-foreground" />
                          {dom.name}
                        </td>
                        <td className="py-4 pr-4">
                          <div className="text-foreground font-semibold">
                            {dom.user?.firstName} {dom.user?.lastName}
                          </div>
                          <div className="text-muted-foreground text-xs">{dom.user?.email}</div>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge
                            variant={
                              dom.status === 'ACTIVE'
                                ? 'success'
                                : dom.status === 'PENDING'
                                  ? 'warning'
                                  : 'danger'
                            }
                          >
                            {dom.status}
                          </Badge>
                        </td>
                        <td className="py-4 pr-4">
                          <Badge variant={dom.autoRenew ? 'info' : 'default'}>
                            {dom.autoRenew ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </td>
                        <td className="py-4 pr-4 text-muted-foreground">
                          {dom.registeredAt ? new Date(dom.registeredAt).toLocaleDateString() : 'Pending'}
                        </td>
                        <td className="py-4 text-right font-semibold text-foreground">
                          {dom.expiresAt ? new Date(dom.expiresAt).toLocaleDateString() : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* CONFIGURE EXTENSION OVERRIDE DRAWER/MODAL */}
      {selectedExtension && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#031033]/40 backdrop-blur-xs z-40 transition-opacity duration-300 opacity-100"
            onClick={() => setSelectedExtension(null)}
          />

          {/* Modal Centered Panel */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-2xl z-50 p-6 flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-lg font-bold text-foreground">Configure Pricing: .{selectedExtension}</h3>
              <button
                onClick={() => setSelectedExtension(null)}
                className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveExtension} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase">Configuration Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setUseFlatPrice(false)}
                    className={`py-2 px-3 text-xs font-semibold border border-border transition-colors cursor-pointer ${
                      !useFlatPrice
                        ? 'bg-[#e8900a] text-white border-[#e8900a]'
                        : 'bg-background text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    Custom Markup %
                  </button>
                  <button
                    type="button"
                    onClick={() => setUseFlatPrice(true)}
                    className={`py-2 px-3 text-xs font-semibold border border-border transition-colors cursor-pointer ${
                      useFlatPrice
                        ? 'bg-[#e8900a] text-white border-[#e8900a]'
                        : 'bg-background text-muted-foreground hover:bg-muted/50'
                    }`}
                  >
                    Custom Flat Naira Price
                  </button>
                </div>
              </div>

              {!useFlatPrice ? (
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Markup Percentage (%)</label>
                  <input
                    type="number"
                    required
                    value={tldMarkup}
                    onChange={(e) => setTldMarkup(e.target.value)}
                    className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                    placeholder="e.g. 40"
                    min="0"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Adds this percentage profit on top of the live converted exchange rate price.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Fixed Naira Price (₦)</label>
                  <input
                    type="number"
                    required
                    value={tldCustomPrice}
                    onChange={(e) => setTldCustomPrice(e.target.value)}
                    className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                    placeholder="e.g. 25000"
                    min="0"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Sets a fixed final NGN retail price for this extension, ignoring live cost fluctuations.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-border mt-6">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={updateExtensionPricing.isPending}
                >
                  {updateExtensionPricing.isPending ? 'Saving...' : 'Apply Override'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedExtension(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
