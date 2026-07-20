'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getDomainPricingApi,
  updateGlobalPricingApi,
  updateExtensionPricingApi,
  deleteExtensionPricingApi,
  getAdminDomainsApi,
} from '@/lib/api/pricing';

const PRICING_KEY = ['domain-pricing'] as const;
const DOMAINS_KEY = ['admin-domains'] as const;

export function useDomainPricing() {
  return useQuery({
    queryKey: PRICING_KEY,
    queryFn: getDomainPricingApi,
  });
}

export function useUpdateGlobalPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateGlobalPricingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEY });
    },
  });
}

export function useUpdateExtensionPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateExtensionPricingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEY });
    },
  });
}

export function useDeleteExtensionPricing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteExtensionPricingApi,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PRICING_KEY });
    },
  });
}

export function useAdminDomains() {
  return useQuery({
    queryKey: DOMAINS_KEY,
    queryFn: getAdminDomainsApi,
  });
}
