'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import {
  getErrorLogsApi,
  getRequestLogsApi,
  getRequestTraceApi,
  type ErrorLogFilters,
  type RequestLogFilters,
} from '@/lib/api/logs';

export function useRequestLogs(filters: RequestLogFilters) {
  return useQuery({
    queryKey: ['logs', 'requests', filters],
    queryFn: () => getRequestLogsApi(filters),
    placeholderData: keepPreviousData,
  });
}

export function useErrorLogs(filters: ErrorLogFilters) {
  return useQuery({
    queryKey: ['logs', 'errors', filters],
    queryFn: () => getErrorLogsApi(filters),
    placeholderData: keepPreviousData,
  });
}

export function useRequestTrace(requestId: string | null) {
  return useQuery({
    queryKey: ['logs', 'trace', requestId],
    queryFn: () => getRequestTraceApi(requestId!),
    enabled: !!requestId,
    retry: false,
  });
}
