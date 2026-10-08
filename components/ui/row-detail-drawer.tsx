'use client';

import { useState } from 'react';
import { X, Copy, Check, Code, FileText, ChevronRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface RowDetailDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  entityType: string;
  data: any;
  status?: string;
  statusVariant?: 'success' | 'warning' | 'danger' | 'info' | 'default' | 'green';
  overviewFields?: Array<{ label: string; value: React.ReactNode; mono?: boolean }>;
  actionButton?: React.ReactNode;
}

export function RowDetailDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  entityType,
  data,
  status,
  statusVariant = 'default',
  overviewFields,
  actionButton,
}: RowDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'api'>('overview');
  const [copied, setCopied] = useState(false);

  if (!isOpen || !data) return null;

  const handleCopyJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(data, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Derive flat fields from data if overviewFields not explicitly provided
  const derivedFields =
    overviewFields ??
    Object.entries(data)
      .filter(([k, v]) => typeof v !== 'object' && v !== null && v !== undefined && k !== 'id')
      .slice(0, 12)
      .map(([k, v]) => ({
        label: k.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase()),
        value: String(v),
        mono: typeof v === 'number' || k.toLowerCase().includes('id') || k.toLowerCase().includes('price'),
      }));

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Slide-over Drawer */}
      <aside
        className="fixed inset-y-0 right-0 z-50 w-full max-w-xl bg-white border-l border-[#e2e8f0] shadow-2xl flex flex-col animate-in slide-in-from-right duration-250 select-none"
        aria-modal="true"
        role="dialog"
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] font-mono font-semibold uppercase tracking-wider rounded bg-slate-100 text-slate-700 border border-slate-200">
              {entityType}
            </span>
            <div>
              <h2 className="text-sm font-bold text-[#0f172a] flex items-center gap-2 truncate max-w-[320px]">
                {title}
              </h2>
              {subtitle && <p className="text-[11px] text-[#64748b] truncate max-w-[320px]">{subtitle}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {status && (
              <Badge variant={statusVariant}>
                <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
                {status}
              </Badge>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-slate-200/70 text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
              title="Close drawer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-[#e2e8f0] bg-white px-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 mr-6 transition-colors cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#0f172a] text-[#0f172a]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <FileText size={13} />
            Overview Details
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`flex items-center gap-1.5 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
              activeTab === 'api'
                ? 'border-[#0f172a] text-[#0f172a]'
                : 'border-transparent text-[#64748b] hover:text-[#0f172a]'
            }`}
          >
            <Code size={13} />
            API Response JSON
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white">
          {activeTab === 'overview' ? (
            <div className="space-y-6">
              {/* Primary Key-Value Grid */}
              <div className="rounded-lg border border-[#e2e8f0] bg-[#f8fafc] divide-y divide-[#e2e8f0] overflow-hidden">
                {derivedFields.map((field, idx) => (
                  <div key={idx} className="flex items-center justify-between px-4 py-3 text-xs">
                    <span className="text-[#64748b] font-medium uppercase tracking-wider text-[11px]">
                      {field.label}
                    </span>
                    <span
                      className={`text-[#0f172a] font-medium text-right max-w-[65%] truncate ${
                        field.mono ? 'font-mono' : ''
                      }`}
                    >
                      {field.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* ID and system identifiers */}
              {data.id && (
                <div className="p-3 rounded-lg border border-[#e2e8f0] bg-white flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[10px] text-[#64748b] uppercase tracking-wider block font-semibold">
                      Unique ID
                    </span>
                    <span className="font-mono text-[#0f172a] text-[11px] select-all">{data.id}</span>
                  </div>
                  <button
                    onClick={() => navigator.clipboard.writeText(String(data.id))}
                    className="p-1 text-[#64748b] hover:text-[#0f172a] transition-colors cursor-pointer"
                    title="Copy ID"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-[#64748b] font-mono">
                  Payload size: {new Blob([JSON.stringify(data)]).size} bytes
                </span>
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md bg-white hover:bg-slate-50 text-[#0f172a] border border-[#cbd5e1] transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check size={12} className="text-emerald-600" />
                      <span className="text-emerald-600">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy size={12} />
                      <span>Copy JSON</span>
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="p-4 rounded-lg bg-[#0f172a] border border-[#1e293b] font-mono text-[11px] leading-relaxed text-[#93c5fd] overflow-x-auto max-h-[550px] select-text">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            </div>
          )}
        </div>

        {actionButton && (
          <div className="p-4 border-t border-[#e2e8f0] bg-[#f8fafc]">
            {actionButton}
          </div>
        )}
      </aside>
    </>
  );
}
