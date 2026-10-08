'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAdminTicket, useAdminReplyTicket } from '@/lib/hooks/useSupport';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ArrowLeft,
  Send,
  User,
  ShieldCheck,
  Clock,
  CheckCircle2,
  AlertCircle,
  LifeBuoy,
} from 'lucide-react';
import type { TicketReply } from '@/types';

const statusVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'green'> = {
  Open: 'danger',
  'Customer-Reply': 'green',
  Answered: 'info',
  Closed: 'default',
  'In Progress': 'warning',
};

const priorityVariants: Record<string, 'default' | 'success' | 'warning' | 'danger' | 'info' | 'green'> = {
  High: 'danger',
  Medium: 'warning',
  Low: 'info',
};

export default function TicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.ticketId as string;

  const { data, isLoading, error, refetch } = useAdminTicket(ticketId);
  const replyMutation = useAdminReplyTicket(ticketId);

  const [message, setMessage] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const ticket = data?.ticket;

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setErrorMsg('Reply message cannot be empty');
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');

    replyMutation.mutate(message, {
      onSuccess: () => {
        setSuccessMsg('Reply sent successfully as Staff');
        setMessage('');
        refetch();
        setTimeout(() => setSuccessMsg(''), 5000);
      },
      onError: (err) => {
        setErrorMsg(err instanceof Error ? err.message : 'Failed to send reply');
      },
    });
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-muted-foreground">
        Loading ticket details...
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="space-y-4">
        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Tickets
        </Link>
        <Card className="p-8 text-center text-destructive">
          Failed to load ticket details or ticket not found.
        </Card>
      </div>
    );
  }

  const replies: TicketReply[] = ticket.replies || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Link
          href="/support"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Support Tickets
        </Link>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 text-xs border border-border bg-card hover:bg-accent text-foreground transition-colors"
        >
          Refresh Thread
        </button>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-sm font-bold text-[#0f172a]">
                  #{ticket.ticketNumber || ticket.id}
                </span>
                <Badge variant={statusVariants[ticket.status] || 'default'}>
                  {ticket.status}
                </Badge>
                <Badge variant={priorityVariants[ticket.priority] || 'default'}>
                  {ticket.priority || 'Medium'}
                </Badge>
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[#0f172a]">{ticket.subject}</h1>
              {ticket.departmentName && (
                <p className="text-xs text-[#64748b]">
                  Department: <span className="font-medium text-[#0f172a]">{ticket.departmentName}</span>
                </p>
              )}
            </div>

            <div className="text-left md:text-right border-t md:border-t-0 pt-2 md:pt-0 border-border">
              <p className="text-xs text-[#64748b]">Client Details</p>
              <p className="text-sm font-semibold text-[#0f172a]">
                {ticket.clientName || `Client #${ticket.id}`}
              </p>
              {ticket.clientEmail && (
                <p className="text-xs text-[#64748b]">{ticket.clientEmail}</p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <h2 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider flex items-center gap-2">
              <LifeBuoy className="h-4 w-4 text-sky-600" />
              Conversation Thread
            </h2>

            {replies.length === 0 ? (
              <p className="text-xs text-[#64748b]">No replies found in thread.</p>
            ) : (
              <div className="space-y-4">
                {replies.map((r, idx) => {
                  const isStaff = Boolean(r.admin || r.name?.includes('Staff') || r.contactid === undefined && r.userid === undefined && r.admin);
                  
                  return (
                    <div
                      key={r.replyid || idx}
                      className={`p-4 border text-sm transition-all rounded-xl ${
                        isStaff
                          ? 'border-sky-200 bg-sky-50/50 ml-4 md:ml-8'
                          : 'border-[#e2e8f0] bg-white mr-4 md:mr-8'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          {isStaff ? (
                            <div className="flex items-center gap-1.5 font-bold text-sky-700 text-xs">
                              <ShieldCheck className="h-4 w-4" />
                              <span>{r.admin || r.name || 'Staff Reply'}</span>
                              <Badge variant="success" className="text-[10px] px-1.5 py-0">
                                Staff
                              </Badge>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1.5 font-bold text-[#0f172a] text-xs">
                              <User className="h-4 w-4 text-[#64748b]" />
                              <span>{r.name || ticket.clientName || 'Customer'}</span>
                            </div>
                          )}
                        </div>

                        {r.date && (
                          <div className="flex items-center gap-1 text-xs text-[#64748b]">
                            <Clock className="h-3 w-3" />
                            {r.date}
                          </div>
                        )}
                      </div>

                      <div className="text-[#0f172a] whitespace-pre-wrap leading-relaxed text-xs sm:text-sm">
                        {r.message}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="border-t border-border pt-6 mt-8">
            <h3 className="text-xs font-bold text-[#0f172a] uppercase tracking-wider mb-3 flex items-center gap-2">
              <Send className="h-4 w-4 text-sky-600" />
              Staff Reply
            </h3>

            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-lg flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                {successMsg}
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-lg flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleReplySubmit} className="space-y-4">
              <div>
                <textarea
                  rows={5}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type your response to the customer... (This will send as Staff and notify the customer by email)"
                  className="w-full p-3 bg-white border border-[#cbd5e1] rounded-lg text-[#0f172a] text-sm focus:outline-none focus:ring-1 focus:ring-slate-400 leading-relaxed resize-y"
                  disabled={replyMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <p className="text-xs text-[#64748b]">
                  Status will automatically set to <span className="font-semibold text-[#0f172a]">Customer-Reply</span> to keep ticket open waiting for customer response.
                </p>

                <button
                  type="submit"
                  disabled={replyMutation.isPending || !message.trim()}
                  className="px-5 py-2.5 bg-[#0f172a] text-white font-semibold text-xs rounded-lg hover:bg-[#1e293b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 cursor-pointer"
                >
                  {replyMutation.isPending ? 'Sending Reply...' : 'Send Staff Reply'}
                  <Send className="h-3.5 w-3.5" />
                </button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
