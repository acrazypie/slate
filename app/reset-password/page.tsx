'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { authErrorMessage } from '@/lib/authErrors';

// Reached from the link in the password-reset email, which signs the person in
// through /auth/callback first. It sits outside /auth because signed-in visitors
// are redirected away from those routes.
export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) setError(authErrorMessage(error.message));
      else router.push('/dashboard');
    } catch (err) {
      setError(authErrorMessage(err instanceof Error ? err.message : ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-8">
      <div className="max-w-md w-full">
        <p className="font-serif text-4xl text-text-primary text-center mb-8">Slate</p>

        <div className="bg-surface rounded-2xl p-6 space-y-6">
          <h1 className="text-lg font-medium text-text-primary">Scegli una nuova password</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm text-text-secondary mb-2">Nuova password</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                aria-describedby="new-password-hint"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-hover text-text-primary rounded-xl border border-border focus:border-accent focus:outline-none transition-colors"
                required
              />
              <p id="new-password-hint" className="text-xs text-text-tertiary mt-2">Almeno 6 caratteri.</p>
            </div>

            {error && <p role="alert" className="text-danger text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-accent text-accent-contrast rounded-xl font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Salvataggio...' : 'Salva la password'}
            </button>
          </form>

          <p className="text-center text-sm">
            <Link href="/auth/login" className="text-accent-text hover:underline">
              Torna all&apos;accesso
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
