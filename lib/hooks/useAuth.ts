'use client';

import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { loginApi, getMeApi } from '@/lib/api/auth';

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);
  const router = useRouter();

  return useMutation({
    mutationFn: async ({ email, password }: { email: string; password: string }) => {
      const { accessToken } = await loginApi(email, password);
      const user = await getMeApi(accessToken);
      if (user.role !== 'ADMIN') {
        throw new Error('ACCESS_DENIED');
      }
      setAuth(accessToken, user);
      return user;
    },
    onSuccess: () => {
      router.push('/users');
    },
  });
}

export function useVerifyAuth() {
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: async () => {
      if (!token) throw new Error('No token');
      const user = await getMeApi();
      setUser(user);
      return user;
    },
    enabled: !!token,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}
