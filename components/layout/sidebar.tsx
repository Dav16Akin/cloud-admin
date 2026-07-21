'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { useSidebarStore } from '@/store/sidebar';
import {
  Users,
  ShoppingCart,
  LayoutDashboard,
  Globe,
  Server,
  RefreshCw,
  TrendingUp,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const navItems = [
  { href: '/users', label: 'Users', icon: Users },
  { href: '/orders', label: 'Orders', icon: ShoppingCart },
  { href: '/plans', label: 'Plans', icon: LayoutDashboard },
  { href: '/domains', label: 'Domains', icon: Globe },
  { href: '/profit-loss', label: 'Profit & Loss', icon: TrendingUp },
  { href: '/hosting', label: 'Hosting', icon: Server },
  { href: '/whmcs-sync', label: 'WHMCS Sync', icon: RefreshCw },
];

export function Sidebar() {
  const pathname = usePathname();
  const collapsed = useSidebarStore((s) => s.collapsed);
  const toggle = useSidebarStore((s) => s.toggle);

  return (
    <aside
      className={cn(
        'flex flex-col border-r border-border bg-sidebar transition-all duration-200',
        collapsed ? 'w-16' : 'w-60',
      )}
    >
      <div className="flex h-16 items-center border-b border-border px-4">
        {!collapsed && (
          <Link href="/users" className="text-lg font-bold text-foreground">
            NupatCloud<span className="text-accent">Admin</span>
          </Link>
        )}
        <button
          onClick={toggle}
          className={cn(
            'ml-auto flex h-8 w-8 items-center justify-center text-muted-foreground hover:text-foreground',
            collapsed && 'mx-auto',
          )}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-none px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                  : 'text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground',
                collapsed && 'justify-center px-2',
              )}
              title={collapsed ? item.label : undefined}
            >
              <item.icon size={18} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
