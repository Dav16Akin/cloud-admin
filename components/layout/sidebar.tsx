'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebar';
import { useWhmcsSyncGaps } from '@/lib/hooks/useWhmcsSyncGaps';
import { useOrders } from '@/lib/hooks/useOrders';
import {
  Users,
  ShoppingCart,
  Layers,
  Globe,
  Server,
  RefreshCw,
  TrendingUp,
  LifeBuoy,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
} from 'lucide-react';

interface NavItem {
  href: string;
  label: string;
  icon: typeof Users;
  badge?: number | string | null;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggle = useSidebarStore((s) => s.toggle);

  const { data: syncGaps } = useWhmcsSyncGaps();
  const { data: orders } = useOrders();

  const totalGaps = (syncGaps?.users?.length ?? 0) + (syncGaps?.orders?.length ?? 0);
  const pendingOrdersCount = orders?.filter((o) => o.status === 'PENDING').length ?? 0;

  const navSections: NavSection[] = [
    {
      title: 'OPERATIONS',
      items: [
        { href: '/users', label: 'Users', icon: Users },
        {
          href: '/orders',
          label: 'Orders',
          icon: ShoppingCart,
          badge: pendingOrdersCount > 0 ? pendingOrdersCount : null,
        },
        {
          href: '/whmcs-sync',
          label: 'WHMCS Sync',
          icon: RefreshCw,
          badge: totalGaps > 0 ? totalGaps : null,
        },
      ],
    },
    {
      title: 'INFRASTRUCTURE',
      items: [
        { href: '/hosting', label: 'Hosting', icon: Server },
        { href: '/domains', label: 'Domains', icon: Globe },
        { href: '/ssl', label: 'SSL Certificates', icon: Shield },
        { href: '/plans', label: 'Plans', icon: Layers },
      ],
    },
    {
      title: 'ANALYTICS & SUPPORT',
      items: [
        { href: '/profit-loss', label: 'Profit & Loss', icon: TrendingUp },
        { href: '/support', label: 'Support Tickets', icon: LifeBuoy },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'relative flex flex-col border-r border-[#e2e8f0] bg-white transition-all duration-200 select-none z-30',
        collapsed ? 'w-16' : 'w-56',
      )}
    >
      {/* Brand Header */}
      <div className="flex h-16 items-center justify-between border-b border-[#e2e8f0] px-4">
        {!collapsed ? (
          <Link href="/users" className="flex items-center gap-2 overflow-hidden py-1">
            <img
              src="/logo-dark-text.png"
              alt="Nupat Cloud"
              className="h-7 w-auto max-w-[148px] object-contain"
            />
          </Link>
        ) : (
          <div className="mx-auto flex items-center justify-center py-1">
            <img
              src="/logo-mark.png"
              alt="Nupat Cloud"
              className="h-7 w-auto object-contain"
            />
          </div>
        )}

        <button
          onClick={toggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded text-[#64748b] hover:text-[#0f172a] hover:bg-slate-100 transition-colors cursor-pointer',
            collapsed && 'hidden',
          )}
        >
          <ChevronLeft size={16} />
        </button>
      </div>

      {/* Navigation Sections */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section) => (
          <div key={section.title} className="space-y-1">
            {!collapsed && (
              <p className="px-3 text-[10px] font-semibold tracking-wider text-[#94a3b8] uppercase mb-2">
                {section.title}
              </p>
            )}

            {section.items.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors',
                    isActive
                      ? 'bg-[#0f172a] text-white font-medium shadow-sm'
                      : 'text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]',
                    collapsed && 'justify-center px-2',
                  )}
                >
                  <item.icon
                    size={16}
                    className={cn(
                      'shrink-0 transition-colors',
                      isActive ? 'text-white' : 'text-[#64748b] group-hover:text-[#0f172a]',
                    )}
                  />

                  {!collapsed && <span className="truncate flex-1">{item.label}</span>}

                  {!collapsed && item.badge !== null && item.badge !== undefined && (
                    <span className="px-1.5 py-0.2 text-[10px] font-mono font-semibold rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Toggle button when collapsed */}
      {collapsed && (
        <div className="border-t border-[#e2e8f0] p-3 flex justify-center">
          <button
            onClick={toggle}
            aria-label="Expand sidebar"
            className="text-[#64748b] hover:text-[#0f172a] cursor-pointer"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      )}
    </aside>
  );
}
