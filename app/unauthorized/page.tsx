'use client';

import Link from 'next/link';
import { useAuthStore } from '@/store/auth';

export default function UnauthorizedPage() {
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center border-2 border-destructive bg-destructive/5">
            <span className="text-2xl font-bold text-destructive">!</span>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-foreground">Access denied</h1>
        <p className="mt-2 text-muted-foreground">
          Your account does not have administrator privileges. Please contact your administrator if
          you believe this is a mistake.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <Link href="/login" onClick={logout} className="btn-navy">
            Sign out
          </Link>
        </div>
      </div>
    </div>
  );
}
