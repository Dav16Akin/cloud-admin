'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAdminTickets } from '@/lib/hooks/useSupport';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare, Search, LifeBuoy, ArrowRight, Clock, User as UserIcon } from 'lucide-react';
import type { SupportTicket } from '@/types';

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
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <LifeBuoy className="h-6 w-6 text-[#e8900a]" />
            Support Tickets
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage customer support inquiries and reply as staff
          </p>
        </div>

        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 text-xs font-medium border border-border bg-card hover:bg-accent text-foreground transition-colors self-start sm:self-auto"
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
            <p className="text-3xl font-bold text-[#16a34a]">
              {isLoading ? '...' : customerReplyCount}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Answered</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-[#1a2a5a]">
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
                  className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                    selectedStatus === status
                      ? 'bg-foreground text-background font-semibold'
                      : 'bg-card text-muted-foreground hover:text-foreground border border-border'
                  }`}
                >
                  {status === 'ALL' ? 'All Tickets' : status}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search ticket #, subject..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-background border border-border text-foreground focus:outline-none focus:ring-1 focus:ring-[#e8900a]"
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
                  <tr className="border-b border-border text-left text-muted-foreground bg-muted/20">
                    <th className="py-3 px-4 font-medium">Ticket #</th>
                    <th className="py-3 px-4 font-medium">Subject</th>
                    <th className="py-3 px-4 font-medium">Client</th>
                    <th className="py-3 px-4 font-medium">Priority</th>
                    <th className="py-3 px-4 font-medium">Status</th>
                    <th className="py-3 px-4 font-medium">Last Updated</th>
                    <th className="py-3 px-4 font-medium text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredTickets.map((ticket) => {
                    const ticketId = ticket.id || ticket.tid;
                    const displayNum = ticket.tid || ticket.ticketNumber || ticket.id;
                    const clientName =
                      ticket.name ||
                      ticket.clientName ||
                      ticket.email ||
                      (ticket.userid ? `Client #${ticket.userid}` : 'Unknown Client');

                    return (
                      <tr key={ticketId} className="hover:bg-muted/10 transition-colors">
                        <td className="py-3 px-4 font-mono text-xs text-foreground font-semibold">
                          #{displayNum}
                        </td>
                        <td className="py-3 px-4 font-medium text-foreground">
                          <Link
                            href={`/support/${ticketId}`}
                            className="hover:text-[#e8900a] transition-colors"
                          >
                            {ticket.subject}
                          </Link>
                          {ticket.deptname && (
                            <div className="text-xs text-muted-foreground font-normal">
                              {ticket.deptname}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1.5 text-foreground font-medium">
                            <UserIcon className="h-3.5 w-3.5 text-muted-foreground" />
                            {clientName}
                          </div>
                          {ticket.email && <div className="text-xs text-muted-foreground">{ticket.email}</div>}
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
                        <td className="py-3 px-4 text-xs text-muted-foreground whitespace-nowrap">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {ticket.lastreply || ticket.lastReply || ticket.date}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/support/${ticketId}`}
                            className="inline-flex items-center gap-1 text-xs font-medium px-3 py-1 bg-foreground text-background hover:bg-[#e8900a] hover:text-white transition-colors"
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
    </div>
  );
}
