'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAdminTicketsApi,
  getAdminTicketApi,
  adminReplyToTicketApi,
} from '@/lib/api/support';

export function useAdminTickets(status?: string, page: number = 1, limit: number = 50) {
  return useQuery({
    queryKey: ['admin-tickets', status, page, limit] as const,
    queryFn: () => getAdminTicketsApi({ status, page, limit }),
    refetchInterval: 30000,
  });
}

export function useAdminTicket(ticketId?: string | number) {
  return useQuery({
    queryKey: ['admin-ticket', ticketId] as const,
    queryFn: () => getAdminTicketApi(ticketId!),
    enabled: !!ticketId,
  });
}

export function useAdminReplyTicket(ticketId: string | number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (message: string) => adminReplyToTicketApi(ticketId, message),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['admin-ticket', ticketId] });
    },
  });
}
