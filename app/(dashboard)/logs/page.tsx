'use client';

import { useState } from 'react';
import { AlertCircle, ChevronLeft, ChevronRight, RefreshCw, Search, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useErrorLogs, useRequestLogs, useRequestTrace } from '@/lib/hooks/useLogs';
import type { ErrorLog, LogLevel, RequestLog } from '@/lib/api/logs';

type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'default' | 'green';

const statusVariant = (status: number): BadgeVariant =>
  status >= 500 ? 'danger' : status >= 400 ? 'warning' : status >= 300 ? 'info' : 'success';

const levelVariant: Record<LogLevel, BadgeVariant> = {
  alert: 'danger',
  error: 'warning',
  warn: 'info',
};

const formatTime = (iso: string) =>
  new Date(iso).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });

function Pills<T extends string>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: Array<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <div className="flex items-center rounded-lg border border-[#e2e8f0] bg-slate-100 p-1 text-xs">
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`rounded-md px-3 py-1 transition-colors ${
            value === option.value
              ? 'bg-white font-medium text-[#0f172a] shadow-xs'
              : 'text-[#64748b] hover:text-[#0f172a]'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function SearchBox({
  placeholder,
  onSearch,
  initial = '',
}: {
  placeholder: string;
  onSearch: (value: string) => void;
  initial?: string;
}) {
  const [value, setValue] = useState(initial);
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSearch(value.trim());
      }}
      className="flex items-center gap-2 rounded-lg border border-[#e2e8f0] bg-white px-3 py-1.5 text-xs"
    >
      <Search size={13} className="text-[#94a3b8]" />
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        className="w-48 bg-transparent outline-none placeholder:text-[#94a3b8]"
      />
    </form>
  );
}

function Pager({
  page,
  pages,
  total,
  onPage,
}: {
  page: number;
  pages: number;
  total: number;
  onPage: (page: number) => void;
}) {
  return (
    <div className="mt-4 flex items-center justify-between text-xs text-[#64748b]">
      <span>
        {total.toLocaleString()} entries · page {page} of {Math.max(pages, 1)}
      </span>
      <div className="flex gap-2">
        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => onPage(page - 1)}>
          <ChevronLeft size={13} />
          <span>Newer</span>
        </Button>
        <Button variant="outline" size="sm" disabled={page >= pages} onClick={() => onPage(page + 1)}>
          <span>Older</span>
          <ChevronRight size={13} />
        </Button>
      </div>
    </div>
  );
}

function TracePanel({ requestId, onClose }: { requestId: string; onClose: () => void }) {
  const { data, isLoading, error } = useRequestTrace(requestId);
  const request = data?.request;

  return (
    <>
      <div className="fixed inset-0 z-40 bg-slate-900/20" onClick={onClose} />
      <aside className="fixed top-0 right-0 z-50 flex h-full w-full max-w-2xl flex-col border-l border-[#e2e8f0] bg-white shadow-xl">
        <div className="flex items-start justify-between border-b border-[#e2e8f0] p-5">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold tracking-wider text-[#64748b] uppercase">Request trace</p>
            <p className="mt-1 font-mono text-xs break-all text-[#0f172a]">{requestId}</p>
          </div>
          <button onClick={onClose} className="text-[#94a3b8] hover:text-[#0f172a]" aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto p-5 text-xs">
          {isLoading && <p className="text-[#64748b]">Loading trace...</p>}
          {error && (
            <p className="text-rose-600">
              {error instanceof Error ? error.message : 'Could not load this request.'}
            </p>
          )}

          {request && (
            <div className="grid grid-cols-2 gap-3 rounded-lg border border-[#e2e8f0] p-4">
              <Field label="Endpoint" value={`${request.method} ${request.path}`} mono />
              <Field label="Status" value={<Badge variant={statusVariant(request.status)}>{request.status}</Badge>} />
              <Field label="Route" value={request.route ?? '—'} mono />
              <Field label="Duration" value={`${request.durationMs} ms`} mono />
              <Field label="User" value={request.userId ?? 'anonymous'} mono />
              <Field label="IP" value={request.ipAddress ?? '—'} mono />
              <Field label="Time" value={formatTime(request.createdAt)} />
              <Field label="User agent" value={request.userAgent ?? '—'} />
            </div>
          )}
          {data && !request && (
            <p className="text-[#64748b]">
              No request row was saved for this ID (it may come from a background job), but these entries reference it.
            </p>
          )}

          {data && (
            <div>
              <h4 className="mb-2 font-semibold text-[#0f172a]">
                Errors, warnings and alerts ({data.errors.length})
              </h4>
              {data.errors.length === 0 && <p className="text-[#64748b]">Nothing was logged during this request.</p>}
              <div className="space-y-3">
                {data.errors.map((entry) => (
                  <ErrorEntry key={entry.id} entry={entry} />
                ))}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}

function Field({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[10px] font-semibold tracking-wider text-[#94a3b8] uppercase">{label}</p>
      <div className={`mt-0.5 break-all text-[#0f172a] ${mono ? 'font-mono text-[11px]' : ''}`}>{value}</div>
    </div>
  );
}

function ErrorEntry({ entry }: { entry: ErrorLog }) {
  return (
    <div className="rounded-lg border border-[#e2e8f0] p-3">
      <div className="flex items-center gap-2">
        <Badge variant={levelVariant[entry.level]}>{entry.level}</Badge>
        <span className="text-[#64748b]">{formatTime(entry.createdAt)}</span>
        {entry.source && <span className="truncate font-mono text-[11px] text-[#64748b]">{entry.source}</span>}
      </div>
      <p className="mt-2 font-medium break-words text-[#0f172a]">{entry.message}</p>
      {entry.details != null && (
        // Rendered as text, never HTML: details can contain third-party responses.
        <pre className="mt-2 max-h-80 overflow-auto rounded bg-slate-50 p-3 font-mono text-[11px] whitespace-pre-wrap text-[#334155]">
          {JSON.stringify(entry.details, null, 2)}
        </pre>
      )}
    </div>
  );
}

function RequestsTab({ onInspect }: { onInspect: (requestId: string) => void }) {
  const [page, setPage] = useState(1);
  const [statusClass, setStatusClass] = useState<'all' | '4xx' | '5xx'>('all');
  const [path, setPath] = useState('');
  const [userId, setUserId] = useState('');

  const { data, isLoading, error, refetch, isFetching } = useRequestLogs({
    page,
    path,
    userId,
    minStatus: statusClass === '5xx' ? 500 : statusClass === '4xx' ? 400 : undefined,
  });

  const reset = <T,>(setter: (value: T) => void) => (value: T) => {
    setter(value);
    setPage(1);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <Pills
            value={statusClass}
            onChange={reset(setStatusClass)}
            options={[
              { value: 'all', label: 'All' },
              { value: '4xx', label: 'Failed (4xx+)' },
              { value: '5xx', label: 'Server errors (5xx)' },
            ]}
          />
          <div className="flex flex-wrap items-center gap-2">
            <SearchBox placeholder="Path contains, e.g. /orders" onSearch={reset(setPath)} />
            <SearchBox placeholder="User ID" onSearch={reset(setUserId)} />
            <Button variant="navy" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="py-6 text-xs text-[#64748b]">Loading requests...</p>}
        {error && <p className="py-6 text-xs text-rose-600">{error.message}</p>}
        {data && data.logs.length === 0 && <p className="py-6 text-xs text-[#64748b]">No requests match these filters.</p>}
        {data && data.logs.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#e2e8f0] font-semibold tracking-wider text-[#64748b] uppercase">
                    <th className="pr-4 pb-3">Time</th>
                    <th className="pr-4 pb-3">Endpoint</th>
                    <th className="pr-4 pb-3">Status</th>
                    <th className="pr-4 pb-3">Duration</th>
                    <th className="pr-4 pb-3">User</th>
                    <th className="pb-3">Request ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#f1f5f9]">
                  {data.logs.map((log: RequestLog) => (
                    <tr
                      key={log.id}
                      onClick={() => onInspect(log.requestId)}
                      className="group cursor-pointer transition-colors hover:bg-[#f8fafc]"
                    >
                      <td className="py-3 pr-4 whitespace-nowrap text-[#64748b]">{formatTime(log.createdAt)}</td>
                      <td className="py-3 pr-4 font-mono text-[11px] text-[#0f172a]">
                        <span className="font-semibold">{log.method}</span> {log.path}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge variant={statusVariant(log.status)}>{log.status}</Badge>
                      </td>
                      <td className="py-3 pr-4 font-mono text-[11px] text-[#64748b]">{log.durationMs} ms</td>
                      <td className="py-3 pr-4 font-mono text-[11px] text-[#64748b]">
                        {log.userId ? `${log.userId.slice(0, 10)}…` : '—'}
                      </td>
                      <td className="py-3 font-mono text-[11px] text-[#94a3b8] group-hover:text-[#0f172a]">
                        {log.requestId.slice(0, 8)}…
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pager {...data.pagination} onPage={setPage} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

function ErrorsTab({ onInspect }: { onInspect: (requestId: string) => void }) {
  const [page, setPage] = useState(1);
  const [level, setLevel] = useState<'all' | LogLevel>('all');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data, isLoading, error, refetch, isFetching } = useErrorLogs({
    page,
    search,
    level: level === 'all' ? undefined : level,
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <Pills
            value={level}
            onChange={(value) => {
              setLevel(value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All' },
              { value: 'alert', label: 'Alerts' },
              { value: 'error', label: 'Errors' },
              { value: 'warn', label: 'Warnings' },
            ]}
          />
          <div className="flex items-center gap-2">
            <SearchBox
              placeholder="Message contains..."
              onSearch={(value) => {
                setSearch(value);
                setPage(1);
              }}
            />
            <Button variant="navy" size="sm" onClick={() => refetch()} disabled={isFetching}>
              <RefreshCw size={13} className={isFetching ? 'animate-spin' : ''} />
              <span>Refresh</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="py-6 text-xs text-[#64748b]">Loading errors...</p>}
        {error && <p className="py-6 text-xs text-rose-600">{error.message}</p>}
        {data && data.logs.length === 0 && <p className="py-6 text-xs text-[#64748b]">Nothing logged for these filters.</p>}
        {data && data.logs.length > 0 && (
          <>
            <div className="divide-y divide-[#f1f5f9] text-xs">
              {data.logs.map((entry) => (
                <div key={entry.id} className="py-3">
                  <button
                    onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                    className="flex w-full items-start gap-3 text-left"
                  >
                    <Badge variant={levelVariant[entry.level]}>{entry.level}</Badge>
                    <span className="w-36 shrink-0 whitespace-nowrap text-[#64748b]">{formatTime(entry.createdAt)}</span>
                    <span className="min-w-0 flex-1 break-words text-[#0f172a]">{entry.message}</span>
                    {entry.source && (
                      <span className="hidden max-w-[220px] truncate font-mono text-[11px] text-[#94a3b8] md:inline">
                        {entry.source}
                      </span>
                    )}
                  </button>
                  {expanded === entry.id && (
                    <div className="mt-3 ml-1 space-y-2">
                      {entry.requestId && (
                        <button
                          onClick={() => onInspect(entry.requestId!)}
                          className="font-mono text-[11px] text-blue-600 hover:underline"
                        >
                          View full request {entry.requestId}
                        </button>
                      )}
                      <ErrorEntry entry={entry} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <Pager {...data.pagination} onPage={setPage} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function LogsPage() {
  const [tab, setTab] = useState<'requests' | 'errors'>('requests');
  const [traceId, setTraceId] = useState<string | null>(null);

  return (
    <div className="relative space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a]">Logs</h1>
          <p className="mt-1 text-xs text-[#64748b]">
            Every API request and every error from the last 30 days. Paste a request ID from an error message to see
            exactly what happened.
          </p>
        </div>
        <SearchBox placeholder="Look up a request ID" onSearch={(value) => value && setTraceId(value)} />
      </div>

      <div className="flex items-center gap-2">
        <Pills
          value={tab}
          onChange={setTab}
          options={[
            { value: 'requests', label: 'Requests' },
            { value: 'errors', label: 'Errors & alerts' },
          ]}
        />
        {tab === 'errors' && (
          <span className="flex items-center gap-1 text-[11px] text-[#64748b]">
            <AlertCircle size={12} /> Alerts are also emailed to admins, at most once an hour per issue.
          </span>
        )}
      </div>

      {tab === 'requests' ? <RequestsTab onInspect={setTraceId} /> : <ErrorsTab onInspect={setTraceId} />}

      {traceId && <TracePanel requestId={traceId} onClose={() => setTraceId(null)} />}
    </div>
  );
}
