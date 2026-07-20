import { api } from './client';

export interface AdminPlan {
  id: string;
  name: string;
  price: number;
  monthlyPrice: number | null;
  quarterlyPrice: number | null;
  billingCycle: string;
  storage: string;
  bandwidth: string;
  websites: number;
  emails: number;
  features: string[];
  isPopular: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export async function getAdminPlansApi(): Promise<AdminPlan[]> {
  return api<AdminPlan[]>('/admin/plans');
}

export async function createPlanApi(data: Omit<AdminPlan, 'id' | 'createdAt' | 'updatedAt'>): Promise<AdminPlan> {
  return api<AdminPlan>('/admin/plans', {
    method: 'POST',
    body: data,
  });
}

export async function updatePlanApi(
  id: string,
  data: Partial<Omit<AdminPlan, 'id' | 'createdAt' | 'updatedAt'>>,
): Promise<AdminPlan> {
  return api<AdminPlan>(`/admin/plans/${id}`, {
    method: 'PUT',
    body: data,
  });
}

export async function deletePlanApi(id: string): Promise<void> {
  return api<void>(`/admin/plans/${id}`, {
    method: 'DELETE',
  });
}
