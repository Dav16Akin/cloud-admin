'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useProfitLoss } from '@/lib/hooks/useProfitLoss';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Search,
  RefreshCw,
  Globe,
  ShoppingCart,
  Info,
} from 'lucide-react';

export default function ProfitLossPage() {
  const { data: pnlData, isLoading, refetch } = useProfitLoss();
  const [searchQuery, setSearchQuery] = useState('');

  // Filtering historical sales ledger
  const filteredSales =
    pnlData?.historicalSales.filter(
      (sale) =>
        sale.domainName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.orderRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.user?.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.user?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sale.user?.lastName.toLowerCase().includes(searchQuery.toLowerCase())
    ) || [];

  return (
    <div className="relative min-h-screen pb-12 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Profit & Loss Analytics</h1>
          <p className="text-sm text-muted-foreground">
            Financial breakdown of FX exchange rate conversions, live margin performance, and historical domain order profitability.
          </p>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          disabled={isLoading}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          Refresh P&L Data
        </Button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Recorded Sales Revenue
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-foreground font-mono">
              {isLoading ? (
                <span className="text-muted-foreground">...</span>
              ) : (
                `₦${pnlData?.summary.totalDomainRevenue.toLocaleString()}`
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Gross sales from tracked domain orders
            </p>
          </CardContent>
        </Card>

        {/* Total Wholesale Cost */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Recorded Wholesale Cost
            </span>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-extrabold text-muted-foreground font-mono">
              {isLoading ? (
                <span className="text-muted-foreground">...</span>
              ) : (
                `₦${pnlData?.summary.totalWholesaleCost.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              )}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Cost paid to registry at purchase time
            </p>
          </CardContent>
        </Card>

        {/* Net Profit / Loss */}
        <Card
          className={`border-l-4 ${
            pnlData?.summary.overallIsLoss ? 'border-l-red-600 bg-red-50/20' : 'border-l-green-600 bg-green-50/20'
          }`}
        >
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Recorded Net Profit / Loss
              </span>
              {pnlData?.summary.overallIsLoss ? (
                <TrendingDown size={18} className="text-red-600" />
              ) : (
                <TrendingUp size={18} className="text-green-600" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p
              className={`text-3xl font-extrabold font-mono ${
                pnlData?.summary.overallIsLoss ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {isLoading ? (
                <span className="text-muted-foreground">...</span>
              ) : (
                `${pnlData?.summary.overallIsLoss ? '' : '+'}₦${pnlData?.summary.netProfit.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
              )}
            </p>
            <p className="text-xs font-semibold mt-1">
              {pnlData?.summary.overallIsLoss ? (
                <span className="text-red-600">Net Loss Encountered</span>
              ) : (
                <span className="text-green-600">Net Profit Generated</span>
              )}
            </p>
          </CardContent>
        </Card>

        {/* Margin % and Sales Health */}
        <Card>
          <CardHeader className="pb-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
              Tracked Margin %
            </span>
          </CardHeader>
          <CardContent>
            <p
              className={`text-3xl font-extrabold font-mono ${
                pnlData?.summary.overallIsLoss ? 'text-red-600' : 'text-green-600'
              }`}
            >
              {isLoading ? (
                <span className="text-muted-foreground">...</span>
              ) : (
                `${pnlData?.summary.profitMarginPercent.toFixed(1)}%`
              )}
            </p>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className="text-green-600 font-semibold">
                {pnlData?.summary.profitableSalesCount ?? 0} Profits
              </span>
              <span>•</span>
              <span className="text-red-600 font-semibold">
                {pnlData?.summary.lossSalesCount ?? 0} Losses
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exchange Rates Reference Banner */}
      <Card className="bg-secondary/40 border border-border">
        <CardContent className="py-3 px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <DollarSign size={16} className="text-[#e8900a]" />
            <span>Active Exchange Rates Used for Live Conversion:</span>
          </div>
          <div className="flex items-center gap-6 font-mono font-bold text-sm">
            <div>
              <span className="text-muted-foreground text-xs font-normal">USD Rate: </span>
              ₦{pnlData?.rates.usdToNgn.toLocaleString()} / USD
            </div>
            <div>
              <span className="text-muted-foreground text-xs font-normal">EUR Rate: </span>
              ₦{pnlData?.rates.eurToNgn.toLocaleString()} / EUR
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 1. Historical Domain Sales Ledger (PLACED FIRST) */}
      <Card>
        <CardHeader className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart size={18} />
                Historical Domain Orders Profit & Loss Ledger
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Calculates exact P&L using recorded purchase-time FX rates and registry wholesale costs. Legacy orders without stored snapshot rates are omitted from totals.
              </p>
            </div>
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search domain, ref, or customer email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full text-sm border border-border pl-9 pr-4 py-2 bg-background focus:outline-[#e8900a]"
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
          ) : filteredSales.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center py-12">
              No historical paid domain orders recorded yet.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-medium uppercase tracking-wider text-xs">
                    <th className="pb-3 pr-4 font-bold">Domain Item</th>
                    <th className="pb-3 pr-4 font-bold">Order Ref</th>
                    <th className="pb-3 pr-4 font-bold">Customer Owner</th>
                    <th className="pb-3 pr-4 font-bold">Selling Price Paid</th>
                    <th className="pb-3 pr-4 font-bold">Wholesale Cost at Purchase</th>
                    <th className="pb-3 pr-4 font-bold">Purchase Date</th>
                    <th className="pb-3 font-bold text-right">Net Profit / Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSales.map((sale) => (
                    <tr
                      key={sale.id}
                      className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${
                        sale.hasSnapshot && sale.isLoss ? 'bg-red-50/15' : ''
                      }`}
                    >
                      <td className="py-4 pr-4 font-bold text-foreground">
                        {sale.domainName}
                        <span className="block text-[10px] text-muted-foreground font-normal uppercase">
                          {sale.type}
                        </span>
                      </td>
                      <td className="py-4 pr-4 font-mono text-xs text-muted-foreground">
                        {sale.orderRef}
                      </td>
                      <td className="py-4 pr-4">
                        <div className="text-foreground font-semibold">
                          {sale.user?.firstName} {sale.user?.lastName}
                        </div>
                        <div className="text-muted-foreground text-xs">{sale.user?.email}</div>
                      </td>
                      <td className="py-4 pr-4 font-mono font-bold text-primary">
                        ₦{sale.retailPrice.toLocaleString()}
                      </td>
                      <td className="py-4 pr-4 font-mono text-xs text-muted-foreground">
                        {sale.hasSnapshot ? (
                          <div>
                            <span className="font-bold text-foreground block">
                              ₦{sale.estimatedWholesaleCost?.toLocaleString()}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              ({sale.wholesaleCurrency === 'EUR' ? '€' : '$'}{sale.wholesalePrice?.toFixed(2)} @ ₦{sale.exchangeRate?.toLocaleString()})
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-xs flex items-center gap-1">
                            <Info size={12} />
                            Legacy Purchase (Unrecorded Rate)
                          </span>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground text-xs">
                        {new Date(sale.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-4 text-right font-mono font-bold">
                        {sale.hasSnapshot && sale.netProfit !== null && sale.profitMarginPercent !== null ? (
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold border ${
                              sale.isLoss
                                ? 'bg-red-100 text-red-700 border-red-300'
                                : 'bg-green-100 text-green-800 border-green-300'
                            }`}
                          >
                            {sale.isLoss ? (
                              <TrendingDown size={13} className="text-red-600" />
                            ) : (
                              <TrendingUp size={13} className="text-green-600" />
                            )}
                            {sale.isLoss ? '' : '+'}₦{sale.netProfit.toLocaleString()} ({sale.profitMarginPercent.toFixed(1)}%)
                          </span>
                        ) : (
                          <Badge variant="default" className="text-muted-foreground font-normal text-[11px] border border-border">
                            Omitted from P&L
                          </Badge>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Live TLD Pricing Profit & Loss Matrix (PLACED SECOND) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe size={18} />
            Live TLD Pricing Profit & Loss Matrix
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4 py-8">
              <div className="h-6 bg-muted animate-pulse w-full" />
              <div className="h-10 bg-muted animate-pulse w-full" />
              <div className="h-10 bg-muted animate-pulse w-full" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border text-muted-foreground font-medium uppercase tracking-wider text-xs">
                    <th className="pb-3 pr-4 font-bold">Extension</th>
                    <th className="pb-3 pr-4 font-bold">Base Wholesale Price</th>
                    <th className="pb-3 pr-4 font-bold">FX Rate</th>
                    <th className="pb-3 pr-4 font-bold">Converted Cost (NGN)</th>
                    <th className="pb-3 pr-4 font-bold">Configured Markup</th>
                    <th className="pb-3 pr-4 font-bold text-right">Retail Selling Price</th>
                    <th className="pb-3 font-bold text-right">Net Profit / Loss</th>
                  </tr>
                </thead>
                <tbody>
                  {pnlData?.liveMargins.map((item) => (
                    <tr
                      key={item.extension}
                      className={`border-b border-border last:border-0 hover:bg-muted/30 transition-colors ${
                        item.isLoss ? 'bg-red-50/15' : ''
                      }`}
                    >
                      <td className="py-4 pr-4 font-bold text-foreground">
                        .{item.extension}
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground">
                        {item.wholesaleCurrency === 'EUR' ? '€' : '$'}
                        {item.wholesalePrice.toFixed(2)} {item.wholesaleCurrency}
                      </td>
                      <td className="py-4 pr-4 text-muted-foreground font-mono">
                        ₦{item.exchangeRate.toLocaleString()}
                      </td>
                      <td className="py-4 pr-4 font-mono text-muted-foreground">
                        ₦{item.wholesaleInNgn.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 pr-4">
                        {item.markupType === 'CUSTOM_PRICE' ? (
                          <Badge variant="info">Fixed Retail Price</Badge>
                        ) : item.markupType === 'FLAT_FEE' ? (
                          <Badge variant="default">+₦{item.flatFee?.toLocaleString()} Flat Fee</Badge>
                        ) : (
                          <Badge variant="default">+{item.markupPercentage}% Markup</Badge>
                        )}
                      </td>
                      <td className="py-4 pr-4 text-right font-bold text-primary font-mono text-base">
                        ₦{item.finalRetailPrice.toLocaleString()}
                      </td>
                      <td className="py-4 text-right font-mono font-bold">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold border ${
                            item.isLoss
                              ? 'bg-red-100 text-red-700 border-red-300'
                              : 'bg-green-100 text-green-800 border-green-300'
                          }`}
                        >
                          {item.isLoss ? (
                            <TrendingDown size={13} className="text-red-600" />
                          ) : (
                            <TrendingUp size={13} className="text-green-600" />
                          )}
                          {item.isLoss ? '' : '+'}₦{item.netProfit.toLocaleString()} ({item.profitMarginPercent.toFixed(1)}%)
                        </span>
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
  );
}
