'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  useSSLPricing,
  useUpdateSSLProductOverride,
  useDeleteSSLProductOverride,
} from '@/lib/hooks/usePricing';
import {
  Shield,
  Settings,
  DollarSign,
  Percent,
  Edit3,
  X,
  RefreshCw,
  Check,
  TrendingUp,
  AlertCircle,
  Trash2,
  Lock,
} from 'lucide-react';

export default function SSLPage() {
  const {
    data: pricingData,
    isLoading,
    refetch,
  } = useSSLPricing();

  const updateOverride = useUpdateSSLProductOverride();
  const deleteOverride = useDeleteSSLProductOverride();

  // Per-product override editing state
  const [selectedProduct, setSelectedProduct] = useState<{
    productId: number;
    name: string;
  } | null>(null);
  const [markupType, setMarkupType] = useState<'PERCENTAGE' | 'FLAT_FEE' | 'CUSTOM_PRICE'>(
    'PERCENTAGE',
  );
  const [markupPercentage, setMarkupPercentage] = useState('');
  const [flatFee, setFlatFee] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  // Notification state
  const [notification, setNotification] = useState<{
    message: string;
    type: 'success' | 'error';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleEditProduct = (item: any) => {
    setSelectedProduct({ productId: item.productId, name: item.name });
    setMarkupType(item.markupType || 'PERCENTAGE');
    setMarkupPercentage(String(item.markupPercentage ?? ''));
    setFlatFee(item.flatFee !== null ? String(item.flatFee) : '');
    setCustomPrice(item.customPrice !== null ? String(item.customPrice) : '');
  };

  const handleSaveOverride = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    try {
      await updateOverride.mutateAsync({
        productId: selectedProduct.productId,
        productName: selectedProduct.name,
        markupType,
        markupPercentage:
          markupType === 'PERCENTAGE' ? parseFloat(markupPercentage) : undefined,
        flatFee: markupType === 'FLAT_FEE' ? parseFloat(flatFee) : null,
        customPrice: markupType === 'CUSTOM_PRICE' ? parseFloat(customPrice) : null,
      });
      setSelectedProduct(null);
      showToast(`Pricing override saved for ${selectedProduct.name}`, 'success');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to save override',
        'error',
      );
    }
  };

  const handleDeleteOverride = async (productId: number, name: string) => {
    if (
      !confirm(
        `Remove override for "${name}" and revert to global defaults?`,
      )
    )
      return;
    try {
      await deleteOverride.mutateAsync(productId);
      showToast(`Override cleared for ${name}`, 'success');
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : 'Failed to remove override',
        'error',
      );
    }
  };

  const globalSettings = pricingData?.globalSettings;
  const products = pricingData?.products ?? [];

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Shield size={22} className="text-primary" />
            SSL Certificates
          </h1>
          <p className="text-sm text-muted-foreground">
            Configure pricing margins for SSL certificate products. Overrides apply
            per-product; all others use the shared global markup.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            refetch();
            showToast('SSL pricing refreshed', 'success');
          }}
          disabled={isLoading}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh
        </Button>
      </div>

      {/* Global Settings Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* USD Rate */}
        <Card className="relative overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                USD Exchange Rate
              </span>
              <div className="p-2 bg-secondary text-primary">
                <DollarSign size={16} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-9 w-24 bg-muted animate-pulse mb-2" />
            ) : (
              <p className="text-3xl font-extrabold text-foreground">
                ₦{globalSettings?.usdToNgn.toLocaleString()}{' '}
                <span className="text-xs font-normal text-muted-foreground">/ USD</span>
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Used to convert USD wholesale SSL costs.
            </p>
          </CardContent>
        </Card>

        {/* EUR Rate */}
        <Card className="relative overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                EUR Exchange Rate
              </span>
              <div className="p-2 bg-secondary text-primary">
                <TrendingUp size={16} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-9 w-24 bg-muted animate-pulse mb-2" />
            ) : (
              <p className="text-3xl font-extrabold text-foreground">
                ₦{globalSettings?.eurToNgn.toLocaleString()}{' '}
                <span className="text-xs font-normal text-muted-foreground">/ EUR</span>
              </p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Used for EUR-denominated SSL products.
            </p>
          </CardContent>
        </Card>

        {/* Global Markup */}
        <Card className="relative overflow-hidden group">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                Global Profit Margin Mode
              </span>
              <div className="p-2 bg-secondary text-primary">
                <Percent size={16} />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="h-9 w-24 bg-muted animate-pulse mb-2" />
            ) : (
              <div>
                <p className="text-3xl font-extrabold text-[#e8900a]">
                  {globalSettings?.globalMarkupType === 'FLAT_FEE'
                    ? `+₦${globalSettings?.globalFlatFee.toLocaleString()}`
                    : `${globalSettings?.globalMarkup}%`}
                </p>
                <span className="text-xs font-semibold text-muted-foreground uppercase">
                  {globalSettings?.globalMarkupType === 'FLAT_FEE'
                    ? 'Flat NGN Fee Added'
                    : 'Percentage Markup'}
                </span>
              </div>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              Shared global markup (configure on Domains page).
            </p>
          </CardContent>
        </Card>
      </div>

      {/* SSL Products Pricing Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock size={16} />
            SSL Product Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 py-8">
              <div className="h-6 bg-muted animate-pulse w-full" />
              <div className="h-10 bg-muted animate-pulse w-full" />
              <div className="h-10 bg-muted animate-pulse w-full" />
              <div className="h-10 bg-muted animate-pulse w-full" />
              <div className="h-10 bg-muted animate-pulse w-full" />
            </div>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-12">
              No SSL products available. Check your OpenProvider connection.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-medium uppercase tracking-wider text-xs">
                    <th className="pb-3 pr-4 font-bold">Product</th>
                    <th className="pb-3 pr-4 font-bold">Category</th>
                    <th className="pb-3 pr-4 font-bold">Wholesale Base</th>
                    <th className="pb-3 pr-4 font-bold">Wholesale (₦)</th>
                    <th className="pb-3 pr-4 font-bold">Pricing Config</th>
                    <th className="pb-3 pr-4 font-bold">Net Margin (P&L)</th>
                    <th className="pb-3 pr-4 font-bold text-right">Retail Price</th>
                    <th className="pb-3 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((item) => (
                    <tr
                      key={item.productId}
                      className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-4 pr-4">
                        <div className="font-bold text-foreground flex items-center gap-1.5">
                          <Shield size={13} className="text-primary shrink-0" />
                          <span className="leading-tight">{item.name}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                          ID: {item.productId}
                        </div>
                      </td>
                      <td className="py-4 pr-4">
                        <span className="text-xs text-muted-foreground capitalize">
                          {item.category ?? '—'}
                        </span>
                        <div className="text-[10px] text-muted-foreground">
                          {item.validationMethod}
                        </div>
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground">
                        {item.wholesalePrice !== null && item.wholesaleCurrency
                          ? `${item.wholesaleCurrency === 'EUR' ? '€' : '$'}${item.wholesalePrice.toFixed(2)} ${item.wholesaleCurrency}`
                          : '—'}
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground font-mono">
                        {item.wholesaleInNgn !== null
                          ? `₦${item.wholesaleInNgn.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
                          : '—'}
                      </td>
                      <td className="py-4 pr-4">
                        {item.markupType === 'CUSTOM_PRICE' ? (
                          <Badge variant="info">
                            ₦{item.customPrice?.toLocaleString()} Fixed
                          </Badge>
                        ) : item.markupType === 'FLAT_FEE' ? (
                          <Badge variant="default">
                            +₦{item.flatFee?.toLocaleString()} Fee
                          </Badge>
                        ) : (
                          <Badge variant={item.isOverridden ? 'info' : 'default'}>
                            +{item.markupPercentage}% Markup
                          </Badge>
                        )}
                      </td>
                      <td className="py-4 pr-4">
                        {item.netProfit !== null && item.profitMarginPercent !== null ? (
                          <span
                            className={`inline-flex items-center px-2 py-0.5 text-xs font-bold font-mono border ${
                              item.isLoss
                                ? 'bg-red-50 text-red-700 border-red-200'
                                : 'bg-green-50 text-green-700 border-green-200'
                            }`}
                          >
                            {item.isLoss ? '' : '+'}₦{item.netProfit.toLocaleString()} (
                            {item.profitMarginPercent.toFixed(1)}%)
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-right font-bold text-primary font-mono text-sm">
                        {item.finalRetailPrice !== null
                          ? `₦${item.finalRetailPrice.toLocaleString()}`
                          : '—'}
                      </td>
                      <td className="py-4 text-right">
                        <div className="flex justify-end items-center gap-1.5">
                          <Button
                            onClick={() => handleEditProduct(item)}
                            variant="outline"
                            size="sm"
                            className="px-2 py-1 h-7 text-xs font-semibold"
                          >
                            <Edit3 size={12} className="mr-1" />
                            Edit
                          </Button>
                          {item.isOverridden && (
                            <button
                              onClick={() =>
                                handleDeleteOverride(item.productId, item.name)
                              }
                              className="p-1 text-destructive hover:bg-destructive/10 transition-colors"
                              title="Revert to global default"
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

      {/* CONFIGURE PRODUCT OVERRIDE MODAL */}
      {selectedProduct && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-[#031033]/40 backdrop-blur-xs z-40 transition-opacity duration-300 opacity-100"
            onClick={() => setSelectedProduct(null)}
          />

          {/* Modal Panel */}
          <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-md bg-card border border-border shadow-2xl z-50 p-6 flex flex-col">
            <div className="flex items-center justify-between border-b border-border pb-3 mb-4">
              <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                <Shield size={16} className="text-primary" />
                Configure Pricing
              </h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="p-1 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
              <span className="font-semibold text-foreground">{selectedProduct.name}</span>
              <span className="block mt-0.5 font-mono text-[10px]">
                Product ID: {selectedProduct.productId}
              </span>
            </p>

            <form onSubmit={handleSaveOverride} className="space-y-4">
              {/* Pricing type selector */}
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-2 uppercase">
                  Pricing Type
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {(['PERCENTAGE', 'FLAT_FEE', 'CUSTOM_PRICE'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setMarkupType(type)}
                      className={`py-2 px-1 text-center text-xs font-semibold border border-border transition-colors cursor-pointer ${
                        markupType === type
                          ? 'bg-[#e8900a] text-white border-[#e8900a]'
                          : 'bg-background text-muted-foreground hover:bg-muted/50'
                      }`}
                    >
                      {type === 'PERCENTAGE'
                        ? 'Markup %'
                        : type === 'FLAT_FEE'
                        ? 'Flat Fee (₦)'
                        : 'Fixed Price (₦)'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input based on type */}
              {markupType === 'PERCENTAGE' && (
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">
                    Markup Percentage (%)
                  </label>
                  <input
                    type="number"
                    required
                    value={markupPercentage}
                    onChange={(e) => setMarkupPercentage(e.target.value)}
                    className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                    placeholder="e.g. 50"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Percentage profit added on top of the converted wholesale cost.
                  </p>
                </div>
              )}

              {markupType === 'FLAT_FEE' && (
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">
                    Flat NGN Fee Added (₦)
                  </label>
                  <input
                    type="number"
                    required
                    value={flatFee}
                    onChange={(e) => setFlatFee(e.target.value)}
                    className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                    placeholder="e.g. 10000"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Fixed Naira fee added to the wholesale cost after FX conversion.
                  </p>
                </div>
              )}

              {markupType === 'CUSTOM_PRICE' && (
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">
                    Fixed Selling Price (₦)
                  </label>
                  <input
                    type="number"
                    required
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                    className="w-full text-sm border border-border p-2 bg-background focus:outline-[#e8900a]"
                    placeholder="e.g. 50000"
                    min="0"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Sets a fixed NGN retail price regardless of wholesale fluctuations.
                  </p>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t border-border mt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  disabled={updateOverride.isPending}
                >
                  {updateOverride.isPending ? 'Saving...' : 'Apply Override'}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setSelectedProduct(null)}
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
