import { api } from './client';
import type { User, UserActivityDetail } from '@/types';

export async function getUsersApi(): Promise<User[]> {
  return api<User[]>('/admin/users');
}

export async function getUserActivityApi(
  userId: string,
  page = 1,
  limit = 50,
): Promise<UserActivityDetail> {
  return api<UserActivityDetail>(`/admin/users/${userId}/activity`, {
    method: 'GET',
    params: {
      page: String(page),
      limit: String(limit),
    },
  });
}
