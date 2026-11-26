'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { authErrorMessage } from '@/lib/authErrors';
import { useI18n } from '@/components/LanguageProvider';

// Reached from the link in the password-reset email, which signs the person in
// through /auth/callback first. It sits outside /auth because signed-in visitors
// are redirected away from those routes.
export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const { t } = useI18n();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error } = await createClient().auth.updateUser({ password });
      if (error) setError(authErrorMessage(error.message, t));
      else router.push('/dashboard');
    } catch (err) {
      setError(authErrorMessage(err instanceof Error ? err.message : '', t));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-5 py-8">
      <div className="max-w-md w-full">
        <p className="font-semibold tracking-tight text-4xl text-text-primary text-center mb-8">Slate</p>

        <div className="bg-surface rounded-3xl p-6 space-y-6">
          <h1 className="text-lg font-semibold text-text-primary">{t.auth.chooseNewPassword}</h1>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="new-password" className="block text-sm text-text-secondary mb-2">{t.auth.newPassword}</label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                minLength={6}
                aria-describedby="new-password-hint"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-hover text-text-primary rounded-xl border border-transparent focus:border-accent focus:outline-none transition-colors"
                required
              />
              <p id="new-password-hint" className="text-xs text-text-tertiary mt-2">{t.auth.passwordHint}</p>
            </div>

            {error && <p role="alert" className="text-danger text-sm">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-accent text-accent-contrast rounded-2xl font-semibold transition-opacity hover:opacity-90 disabled:opacity-50"
            >
              {loading ? t.common.saving : t.auth.savePassword}
            </button>
          </form>

          <p className="text-center text-sm">
            <Link href="/auth/login" className="text-accent-text hover:underline">
              {t.auth.backToSignIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
