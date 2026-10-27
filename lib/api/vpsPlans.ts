import { api } from './client';

export interface AdminVpsPlan {
  id: string;
  name: string;
  providerType: string;
  cpu: number;
  ramGb: number;
  diskGb: number;
  priceNgnMonthly: number;
  isActive: boolean;
  createdAt: string;
  serversCount: number;
  orderItemsCount: number;
}

export interface VpsPlansResponse {
  plans: AdminVpsPlan[];
  exchange: {
    usdToNgn: number;
    eurToNgn: number;
  };
}

export interface VpsPlanInput {
  name: string;
  providerType: string;
  cpu: number;
  ramGb: number;
  diskGb: number;
  priceNgnMonthly: number;
  isActive: boolean;
}

export async function getAdminVpsPlansApi(): Promise<VpsPlansResponse> {
  return api<VpsPlansResponse>('/admin/vps-plans');
}

export async function createVpsPlanApi(data: VpsPlanInput): Promise<AdminVpsPlan> {
  return api<AdminVpsPlan>('/admin/vps-plans', {
    method: 'POST',
    body: data,
  });
}

export async function updateVpsPlanApi(
  id: string,
  data: Partial<VpsPlanInput>,
): Promise<AdminVpsPlan> {
  return api<AdminVpsPlan>(`/admin/vps-plans/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function deleteVpsPlanApi(
  id: string,
): Promise<{ id: string } | AdminVpsPlan> {
  return api<{ id: string } | AdminVpsPlan>(`/admin/vps-plans/${id}`, {
    method: 'DELETE',
  });
}
