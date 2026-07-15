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
    <div className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-foreground">
            NupatCloud<span className="text-accent">Admin</span>
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign in to your admin account</p>
        </div>

        <form onSubmit={handleSubmit} className="dashboard-card space-y-5 p-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-foreground mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-foreground mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring"
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
