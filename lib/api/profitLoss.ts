import { api } from './client';

export interface ProfitLossResponse {
  rates: {
    usdToNgn: number;
    eurToNgn: number;
  };
  summary: {
    totalDomainRevenue: number;
    totalWholesaleCost: number;
    netProfit: number;
    profitMarginPercent: number;
    profitableSalesCount: number;
    lossSalesCount: number;
    overallIsLoss: boolean;
  };
  liveMargins: Array<{
    extension: string;
    wholesalePrice: number;
    wholesaleCurrency: string;
    exchangeRate: number;
    wholesaleInNgn: number;
    markupType: 'PERCENTAGE' | 'FLAT_FEE' | 'CUSTOM_PRICE';
    markupPercentage: number;
    flatFee: number | null;
    customPrice: number | null;
    finalRetailPrice: number;
    netProfit: number;
    profitMarginPercent: number;
    isLoss: boolean;
  }>;
  historicalSales: Array<{
    id: string;
    orderId: string;
    orderRef: string;
    domainName: string;
    type: string;
    retailPrice: number;
    wholesalePrice: number | null;
    wholesaleCurrency: string | null;
    exchangeRate: number | null;
    estimatedWholesaleCost: number | null;
    netProfit: number | null;
    profitMarginPercent: number | null;
    isLoss: boolean | null;
    hasSnapshot: boolean;
    createdAt: string;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    };
  }>;
}

export async function getProfitLossApi(): Promise<ProfitLossResponse> {
  return api<ProfitLossResponse>('/admin/profit-loss');
}
