'use client';

import { useState, type FormEvent } from 'react';
import { useLogin } from '@/lib/hooks/useAuth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const login = useLogin();

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    login.mutate({ email, password });
  }

  const isAccessDenied = login.error?.message === 'ACCESS_DENIED';

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#f8fafc] px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center flex flex-col items-center">
          <img
            src="/logo-dark-text.png"
            alt="Nupat Cloud"
            className="h-10 w-auto max-w-[200px] mb-3 object-contain"
          />
          <p className="text-sm text-[#64748b]">Sign in to your admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="dashboard-card space-y-5 p-6 rounded-xl border-[#e2e8f0] shadow-sm">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#0f172a] mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-[#cbd5e1] rounded-lg bg-white px-3 py-2.5 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-slate-400"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#0f172a] mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-[#cbd5e1] rounded-lg bg-white px-3 py-2.5 text-sm text-[#0f172a] placeholder:text-[#94a3b8] focus:outline-none focus:ring-1 focus:ring-slate-400"
              placeholder="••••••••"
            />
          </div>

          {login.isError && (
            <div className="rounded-none border border-border bg-destructive/5 px-4 py-3 text-sm">
              {isAccessDenied ? (
                <>
                  <p className="font-medium text-destructive">Access denied</p>
                  <p className="mt-1 text-muted-foreground">
                    Only administrators can access this panel.
                  </p>
                </>
              ) : (
                <p className="text-destructive">
                  {login.error?.message || 'Invalid credentials'}
                </p>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={login.isPending}
            className="btn-primary w-full disabled:opacity-50"
          >
            {login.isPending ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </div>
    </div>
  );
}
