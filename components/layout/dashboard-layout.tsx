'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';
import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

export function DashboardLayout({ children }: { children: ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();

  useEffect(() => {
    if (!token) {
      router.replace('/login');
    } else if (user && user.role !== 'ADMIN') {
      router.replace('/unauthorized');
    }
  }, [token, user, router]);

  if (!token) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="flex items-center gap-3 text-sm font-medium text-[#64748b]">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-200 border-t-sky-600" />
          <span>Authenticating session...</span>
        </div>
      </div>
    );
  }

  if (user && user.role !== 'ADMIN') {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f8fafc]">
        <div className="text-sm font-medium text-[#64748b]">Checking access permissions...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-[#f8fafc]">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="mx-auto max-w-7xl w-full">{children}</div>
        </main>
      </div>
    </div>
  );
}
