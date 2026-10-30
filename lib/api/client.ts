import { useAuthStore } from '@/store/auth';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export class ApiRequestError extends Error {
  success: false;
  status: number;
  error: string;
  /** Stable machine-readable code from the backend, e.g. ROUTE_NOT_FOUND. */
  code?: string;
  /** Identifies the request in the backend logs (Logs page). */
  requestId?: string;
  fieldErrors?: Record<string, string[]>;

  constructor(
    status: number,
    message: string,
    error: string,
    body?: { requestId?: unknown; code?: unknown; fieldErrors?: unknown },
  ) {
    const requestId = typeof body?.requestId === 'string' ? body.requestId : undefined;
    // Server errors carry their request ID so it can be looked up on the Logs page.
    super(status >= 500 && requestId ? `${message} (Request ID: ${requestId})` : message);
    this.name = 'ApiRequestError';
    this.success = false;
    this.status = status;
    this.error = error;
    this.code = typeof body?.code === 'string' ? body.code : undefined;
    this.requestId = requestId;
    this.fieldErrors =
      body?.fieldErrors && typeof body.fieldErrors === 'object'
        ? (body.fieldErrors as Record<string, string[]>)
        : undefined;
  }
}

interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
  params?: Record<string, string>;
  token?: string;
}

interface QueueItem {
  resolve: (token: string) => void;
  reject: (err: Error) => void;
}

let isRefreshing = false;
const failedQueue: QueueItem[] = [];

function processQueue(err: Error | null, newToken: string | null): void {
  failedQueue.forEach(({ resolve, reject }) => {
    if (err) {
      reject(err);
    } else if (newToken) {
      resolve(newToken);
    }
  });
  failedQueue.length = 0;
}

async function fetchWithRefresh(url: string, options: RequestInit, allowRefresh: boolean): Promise<Response> {
  // The API is on another origin, so without this the browser drops the
  // refresh-token cookie set at login and every session ends after 15 minutes.
  options = { ...options, credentials: 'include' };
  let res = await fetch(url, options);

  if (res.status === 401 && allowRefresh) {
    if (isRefreshing) {
      return new Promise<Response>((resolve, reject) => {
        failedQueue.push({
          resolve: (newToken) => {
            const retryOptions: RequestInit = {
              ...options,
              headers: {
                ...options.headers,
                Authorization: `Bearer ${newToken}`,
              },
            };
            resolve(fetch(url, retryOptions));
          },
          reject,
        });
      });
    }

    isRefreshing = true;

    try {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshRes.ok) {
        const body = await refreshRes.json();
        const newToken: string =
          body?.accessToken ??
          body?.data?.accessToken ??
          body?.token ??
          body?.data?.token;

        useAuthStore.getState().setToken(newToken);
        processQueue(null, newToken);

        res = await fetch(url, {
          ...options,
          headers: {
            ...options.headers,
            Authorization: `Bearer ${newToken}`,
          },
        });
      } else {
        processQueue(new Error('Session expired'), null);
        useAuthStore.getState().logout();
        if (typeof window !== 'undefined') {
          window.location.href = '/login';
        }
      }
    } catch (err) {
      processQueue(err instanceof Error ? err : new Error('Refresh failed'), null);
      useAuthStore.getState().logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    } finally {
      isRefreshing = false;
    }
  }

  return res;
}

export async function api<T = unknown>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, params, token: explicitToken, ...fetchOptions } = options;
  const token = explicitToken ?? useAuthStore.getState().token;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(fetchOptions.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const url = new URL(`${BASE_URL}${path}`);
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));
  }

  const res = await fetchWithRefresh(
    url.toString(),
    { ...fetchOptions, headers, body: body ? JSON.stringify(body) : undefined },
    // Only attempt refresh when using the store's token (not explicitly passed)
    !explicitToken && !!useAuthStore.getState().token,
  );
  // Proxies and Vercel can answer with an HTML error page instead of JSON.
  const isJson = res.headers.get('content-type')?.includes('application/json');
  const json = isJson
    ? await res.json().catch(() => ({}))
    : { message: res.ok ? undefined : `Request failed with status ${res.status}` };

  if (!res.ok) {
    if (!json.requestId) json.requestId = res.headers.get('x-request-id') ?? undefined;
    throw new ApiRequestError(
      res.status,
      json.message || 'Request failed',
      json.error || json.message || 'Unknown error',
      json,
    );
  }

  return json.data ?? json;
}
