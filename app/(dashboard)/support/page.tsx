'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminTickets } from '@/lib/hooks/useSupport';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Search, LifeBuoy, ArrowRight, Clock, User as UserIcon } from 'lucide-react';
import type { SupportTicket } from '@/types';
import { RowDetailDrawer } from '@/components/ui/row-detail-drawer';

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

export default function AdminSupportPage() {
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [inspectedTicket, setInspectedTicket] = useState<SupportTicket | null>(null);

  const { data, isLoading, error, refetch } = useAdminTickets(
    selectedStatus === 'ALL' ? undefined : selectedStatus
  );

  const tickets = data?.tickets ?? [];

  const filteredTickets = tickets.filter((ticket: SupportTicket) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const id = String(ticket.id || ticket.tid || '').toLowerCase();
    const tid = String(ticket.tid || ticket.ticketNumber || '').toLowerCase();
    const subject = String(ticket.subject || '').toLowerCase();
    const name = String(ticket.name || ticket.clientName || ticket.email || '').toLowerCase();
    return id.includes(q) || tid.includes(q) || subject.includes(q) || name.includes(q);
  });

  const openCount = tickets.filter((t) => t.status === 'Open').length;
  const customerReplyCount = tickets.filter((t) => t.status === 'Customer-Reply').length;
  const answeredCount = tickets.filter((t) => t.status === 'Answered').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#0f172a] flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-sky-600" />
            Support Tickets
          </h1>
          <p className="text-sm text-[#64748b] mt-1">
            Manage customer support inquiries and reply as staff
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-[#cbd5e1] bg-white hover:bg-slate-50 text-[#0f172a] transition-colors self-start sm:self-auto cursor-pointer"
        >
          Refresh Tickets
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-foreground">
              {isLoading ? '...' : tickets.length}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-destructive">
              {isLoading ? '...' : openCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Customer Replies</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-emerald-600">
              {isLoading ? '...' : customerReplyCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-sky-700">
              {isLoading ? '...' : answeredCount}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-border pb-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-2">
              {['ALL', 'Open', 'Customer-Reply', 'Answered', 'Closed'].map((status) => (
                <button
                  key={status}
                  onClick={() => setSelectedStatus(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    selectedStatus === status
                      ? 'bg-[#0f172a] text-white font-semibold'
                      : 'bg-white text-[#64748b] hover:text-[#0f172a] hover:bg-slate-50 border border-[#cbd5e1]'
                  }`}
                >
                  {status === 'ALL' ? 'All Tickets' : status}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94a3b8]" />
              <input
                type="text"
                placeholder="Search ticket #, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-white border border-[#cbd5e1] rounded-lg text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {isLoading && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              Loading support tickets...
            </div>
          )}

          {error && (
            <div className="p-8 text-center text-destructive text-sm">
              Failed to load support tickets. Please check backend connection.
            </div>
          )}

          {!isLoading && !error && filteredTickets.length === 0 && (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No support tickets found matching your criteria.
            </div>
          )}

          {!isLoading && !error && filteredTickets.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#e2e8f0] text-left text-[#64748b] bg-slate-50/70">
                    <th className="py-3 px-4 font-semibold text-xs">Ticket #</th>
                    <th className="py-3 px-4 font-semibold text-xs">Subject</th>
                    <th className="py-3 px-4 font-semibold text-xs">Client</th>
                    <th className="py-3 px-4 font-semibold text-xs">Priority</th>
                    <th className="py-3 px-4 font-semibold text-xs">Status</th>
                    <th className="py-3 px-4 font-semibold text-xs">Last Updated</th>
                    <th className="py-3 px-4 font-semibold text-xs text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#e2e8f0]">
                  {filteredTickets.map((ticket) => {
                    const ticketId = ticket.id || ticket.tid;
                    const displayNum = ticket.tid || ticket.ticketNumber || ticket.id;
                    const clientName =
                      ticket.name ||
                      ticket.clientName ||
                      ticket.email ||
                      (ticket.userid ? `Client #${ticket.userid}` : 'Unknown Client');

                    return (
                      <tr
                        key={ticketId}
                        onClick={() => setInspectedTicket(ticket)}
                        className="hover:bg-[#f8fafc] transition-colors cursor-pointer group"
                      >
                        <td className="py-3 px-4 font-mono text-xs text-[#0f172a] font-semibold">
                          #{displayNum}
                        </td>
                        <td className="py-3 px-4 font-medium text-[#0f172a]">
                          <span className="group-hover:text-sky-600 transition-colors">
                            {ticket.subject}
                          </span>
                          {ticket.deptname && (
                            <div className="text-xs text-[#64748b] font-normal">
                              {ticket.deptname}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-[#64748b]">
                          <div className="flex items-center gap-1.5 text-[#0f172a] font-medium">
                            <UserIcon className="h-3.5 w-3.5 text-[#64748b]" />
                            {clientName}
                          </div>
                          {ticket.email && <div className="text-xs text-[#64748b]">{ticket.email}</div>}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={priorityVariants[ticket.priority] || 'default'}>
                            {ticket.priority || 'Normal'}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant={statusVariants[ticket.status] || 'default'}>
                            {ticket.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-[#64748b] whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {ticket.lastreply || ticket.lastReply || ticket.date}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/support/${ticketId}`}
                            onClick={(e) => e.stopPropagation()}
                            className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-md bg-[#0f172a] text-white hover:bg-[#1e293b] transition-colors cursor-pointer"
                          >
                            View & Reply
                            <ArrowRight className="h-3 w-3" />
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Row Detail Drawer & API Inspector */}
      {inspectedTicket && (
        <RowDetailDrawer
          isOpen={!!inspectedTicket}
          onClose={() => setInspectedTicket(null)}
          entityType="Support Ticket"
          title={`Ticket #${inspectedTicket.tid || inspectedTicket.ticketNumber || inspectedTicket.id}`}
          subtitle={inspectedTicket.subject}
          data={inspectedTicket}
          status={inspectedTicket.status}
          statusVariant={
            inspectedTicket.status === 'Open'
              ? 'danger'
              : inspectedTicket.status === 'Customer-Reply'
              ? 'green'
              : inspectedTicket.status === 'In Progress'
              ? 'warning'
              : 'default'
          }
          overviewFields={[
            { label: 'Ticket ID', value: String(inspectedTicket.id || inspectedTicket.tid), mono: true },
            { label: 'Ticket Number', value: String(inspectedTicket.tid || inspectedTicket.ticketNumber || 'N/A'), mono: true },
            { label: 'Department', value: inspectedTicket.deptname || 'Support' },
            { label: 'Priority', value: inspectedTicket.priority || 'Normal' },
            { label: 'Status', value: inspectedTicket.status },
            {
              label: 'Client Name',
              value:
                inspectedTicket.name ||
                inspectedTicket.clientName ||
                (inspectedTicket.userid ? `Client #${inspectedTicket.userid}` : 'N/A'),
            },
            { label: 'Client Email', value: inspectedTicket.email || 'N/A' },
            { label: 'Created / Date', value: inspectedTicket.date || 'N/A' },
            { label: 'Last Reply', value: inspectedTicket.lastreply || inspectedTicket.lastReply || 'N/A' },
            { label: 'Subject', value: inspectedTicket.subject },
          ]}
          actionButton={
            <Link
              href={`/support/${inspectedTicket.id || inspectedTicket.tid}`}
              className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 rounded bg-[#f59e0b] hover:bg-[#d97706] text-black font-semibold text-xs transition-colors"
            >
              Open Ticket Conversation & Reply
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          }
        />
      )}
    </div>
  );
}
