'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/auth';
import { LogOut, Search, Bell, ChevronRight, RefreshCw } from 'lucide-react';

const routeTitleMap: Record<string, { category: string; title: string }> = {
  '/users': { category: 'Operations', title: 'Users' },
  '/orders': { category: 'Operations', title: 'Orders' },
  '/whmcs-sync': { category: 'Operations', title: 'WHMCS Sync' },
  '/hosting': { category: 'Infrastructure', title: 'Hosting' },
  '/domains': { category: 'Infrastructure', title: 'Domains' },
  '/ssl': { category: 'Infrastructure', title: 'SSL Certificates' },
  '/plans': { category: 'Infrastructure', title: 'Plans' },
  '/profit-loss': { category: 'Analytics', title: 'Profit & Loss' },
  '/support': { category: 'Support', title: 'Support Tickets' },
};

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  const currentRoute =
    Object.entries(routeTitleMap).find(([path]) => pathname.startsWith(path))?.[1] ?? {
      category: 'Console',
      title: 'Overview',
    };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-[#e2e8f0] bg-white px-6 z-20">
      {/* Route Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs">
        <span className="text-[#64748b] font-medium">{currentRoute.category}</span>
        <ChevronRight size={13} className="text-[#94a3b8]" />
        <span className="text-[#0f172a] font-semibold">{currentRoute.title}</span>
      </div>

      {/* Right Controls - Only fully implemented actions */}
      <div className="flex items-center gap-3">
        {/* User Profile Info */}
        <div className="hidden sm:flex flex-col text-right">
          <span className="text-xs font-semibold text-[#0f172a] max-w-[200px] truncate">
            {user?.email ?? 'Administrator'}
          </span>
          <span className="text-[10px] text-[#64748b] font-mono uppercase tracking-wider">
            {user?.role ?? 'SUPERADMIN'}
          </span>
        </div>

        {/* User Avatar Pill */}
        <div
          title={user?.email ?? 'Admin'}
          className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 border border-slate-200 text-xs font-bold font-mono text-[#0f172a]"
        >
          {user?.email?.slice(0, 2).toUpperCase() ?? 'AD'}
        </div>

        {/* Sign Out Action */}
        <button
          onClick={handleLogout}
          title="Sign out"
          className="flex h-8 items-center gap-1.5 px-2.5 rounded-lg border border-[#e2e8f0] bg-white text-xs font-medium text-[#64748b] hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors cursor-pointer"
        >
          <LogOut size={13} />
          <span className="hidden md:inline">Sign out</span>
        </button>
      </div>
    </header>
  );
}
