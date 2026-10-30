import { api } from './client';

export interface RequestLog {
  id: string;
  requestId: string;
  method: string;
  path: string;
  route: string | null;
  status: number;
  durationMs: number;
  userId: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
}

export type LogLevel = 'error' | 'warn' | 'alert';

export interface ErrorLog {
  id: string;
  requestId: string | null;
  level: LogLevel;
  source: string | null;
  message: string;
  details: unknown;
  userId: string | null;
  fingerprint: string | null;
  createdAt: string;
}

export interface Paginated<T> {
  logs: T[];
  pagination: { total: number; page: number; limit: number; pages: number };
}

export interface RequestTrace {
  request: RequestLog | null;
  errors: ErrorLog[];
}

export interface RequestLogFilters {
  page?: number;
  path?: string;
  method?: string;
  status?: number;
  minStatus?: number;
  userId?: string;
}

export interface ErrorLogFilters {
  page?: number;
  level?: LogLevel;
  search?: string;
  requestId?: string;
  userId?: string;
}

// Drops empty filters so they aren't sent as `?path=`.
const toParams = (filters: object) =>
  Object.fromEntries(
    Object.entries(filters)
      .filter(([, value]) => value !== undefined && value !== '')
      .map(([key, value]) => [key, String(value)]),
  );

export function getRequestLogsApi(filters: RequestLogFilters): Promise<Paginated<RequestLog>> {
  return api<Paginated<RequestLog>>('/admin/logs/requests', { params: toParams(filters) });
}

export function getErrorLogsApi(filters: ErrorLogFilters): Promise<Paginated<ErrorLog>> {
  return api<Paginated<ErrorLog>>('/admin/logs/errors', { params: toParams(filters) });
}

export function getRequestTraceApi(requestId: string): Promise<RequestTrace> {
  return api<RequestTrace>(`/admin/logs/requests/${encodeURIComponent(requestId)}`);
}
