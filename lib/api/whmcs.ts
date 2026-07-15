import { api } from './client';
import type { WhmcsSyncGaps } from '@/types';

export async function getWhmcsSyncGapsApi(): Promise<WhmcsSyncGaps> {
  return api<WhmcsSyncGaps>('/admin/whmcs-sync-gaps');
}

export async function syncWhmcsUserApi(userId: string): Promise<void> {
  return api(`/admin/sync-whmcs-user/${userId}`, { method: 'POST' });
}
