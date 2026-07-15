import { api } from './client';
import type { LoginResponse, User } from '@/types';

export async function loginApi(email: string, password: string): Promise<LoginResponse> {
  return api<LoginResponse>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
}

export async function getMeApi(token?: string): Promise<User> {
  return api<User>('/auth/me', token ? { token } : {});
}

export async function refreshApi(): Promise<LoginResponse> {
  return api<LoginResponse>('/auth/refresh', {
    method: 'POST',
  });
}
