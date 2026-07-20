import { api } from './client';

export interface GlobalPricingSettings {
  usdToNgn: number;
  eurToNgn: number;
  globalMarkup: number;
}

export interface DomainPricingItem {
  extension: string;
  wholesalePrice: number;
  wholesaleCurrency: string;
  wholesaleInNgn: number;
  markupPercentage: number;
  customPrice: number | null;
  finalRetailPrice: number;
  isOverridden: boolean;
}

export interface DomainPricingResponse {
  globalSettings: GlobalPricingSettings;
  extensions: DomainPricingItem[];
}

export interface AdminDomain {
  id: string;
  name: string;
  extension: string;
  status: string;
  autoRenew: boolean;
  nameservers: string[];
  registeredAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
}

export async function getDomainPricingApi(): Promise<DomainPricingResponse> {
  return api<DomainPricingResponse>('/admin/domain-pricing');
}

export async function updateGlobalPricingApi(data: {
  usdToNgn?: number;
  eurToNgn?: number;
  globalMarkup?: number;
}): Promise<void> {
  return api<void>('/admin/domain-pricing/settings', {
    method: 'POST',
    body: data,
  });
}

export async function updateExtensionPricingApi(data: {
  extension: string;
  markupPercentage?: number;
  customPrice?: number | null;
}): Promise<void> {
  return api<void>('/admin/domain-pricing/extensions', {
    method: 'POST',
    body: data,
  });
}

export async function deleteExtensionPricingApi(extension: string): Promise<void> {
  return api<void>(`/admin/domain-pricing/extensions/${extension}`, {
    method: 'DELETE',
  });
}

export async function getAdminDomainsApi(): Promise<AdminDomain[]> {
  return api<AdminDomain[]>('/admin/domains');
}
