'use client';

import { useQuery } from '@tanstack/react-query';
import { getProfitLossApi } from '@/lib/api/profitLoss';

const PNL_KEY = ['profit-loss'] as const;

export function useProfitLoss() {
  return useQuery({
    queryKey: PNL_KEY,
    queryFn: getProfitLossApi,
  });
}
