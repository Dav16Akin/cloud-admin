'use client';

import { useQuery } from '@tanstack/react-query';
import { getUsersApi, getUserActivityApi } from '@/lib/api/users';

export function useUsers() {
  return useQuery({
    queryKey: ['users'],
    queryFn: getUsersApi,
  });
}

export function useUserActivity(userId: string | null, page = 1, limit = 50) {
  return useQuery({
    queryKey: ['user-activity', userId, page, limit],
    queryFn: () => {
      if (!userId) return null;
      return getUserActivityApi(userId, page, limit);
    },
    enabled: !!userId,
  });
}
