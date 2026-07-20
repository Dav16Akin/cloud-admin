import { api } from './client';

export interface AdminHostingAccount {
  id: string;
  userId: string;
  planId: string;
  cpanelUsername: string;
  domain: string;
  serverIp: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'PENDING';
  expiresAt: string;
  createdAt: string;
  updatedAt: string;
  user: {
    firstName: string;
    lastName: string;
    email: string;
  };
  plan: {
    name: string;
    storage: string;
  };
}

export async function getAdminHostingApi(): Promise<AdminHostingAccount[]> {
  return api<AdminHostingAccount[]>('/admin/hosting');
}

export async function updateHostingApi(
  id: string,
  data: {
    status?: 'ACTIVE' | 'SUSPENDED' | 'TERMINATED' | 'PENDING';
    expiresAt?: string;
    serverIp?: string;
    cpanelUsername?: string;
  },
): Promise<AdminHostingAccount> {
  return api<AdminHostingAccount>(`/admin/hosting/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function deleteHostingApi(id: string): Promise<void> {
  return api<void>(`/admin/hosting/${id}`, {
    method: 'DELETE',
  });
}
