import { api } from './client';
import type { SupportTicket, SupportTicketsResponse } from '@/types';

export async function getAdminTicketsApi(params?: {
  status?: string;
  page?: number;
  limit?: number;
}): Promise<SupportTicketsResponse> {
  const queryParams: Record<string, string> = {};
  if (params?.status) queryParams.status = params.status;
  if (params?.page) queryParams.page = String(params.page);
  if (params?.limit) queryParams.limit = String(params.limit);

  return api<SupportTicketsResponse>('/admin/support/tickets', {
    params: queryParams,
  });
}

export async function getAdminTicketApi(
  ticketId: string | number,
): Promise<{ ticket: SupportTicket }> {
  return api<{ ticket: SupportTicket }>(`/admin/support/tickets/${ticketId}`);
}

export async function adminReplyToTicketApi(
  ticketId: string | number,
  message: string,
): Promise<{ message: string }> {
  return api<{ message: string }>(`/admin/support/tickets/${ticketId}/reply`, {
    method: 'POST',
    body: { message },
  });
}
