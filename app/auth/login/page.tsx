'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { authErrorMessage } from '@/lib/authErrors';
import { GoogleLogo } from '@/components/GoogleLogo';
import { LanguageSelect } from '@/components/LanguageSelect';
import { useI18n } from '@/components/LanguageProvider';

type Mode = 'signin' | 'signup' | 'reset';

const fieldClass =
  'w-full px-4 py-3 bg-surface-hover text-text-primary rounded-xl border border-border focus:border-accent focus:outline-none transition-colors';
const labelClass = 'block text-sm text-text-secondary mb-2';
const linkClass = 'text-accent-text hover:underline';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<Mode>('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();
  const { t } = useI18n();

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
    setMessage(null);
  };

  const handleOAuthSignIn = async (provider: 'google') => {
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(authErrorMessage(error.message, t));
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/auth/callback?next=/reset-password`,
        });
        if (error) setError(authErrorMessage(error.message, t));
        else setMessage(t.auth.resetSent);
        return;
      }

      const { error } =
        mode === 'signup'
          ? await supabase.auth.signUp({ email, password })
          : await supabase.auth.signInWithPassword({ email, password });

      if (error) setError(authErrorMessage(error.message, t));
      else if (mode === 'signup') setMessage(t.auth.signupSent);
      else router.push('/dashboard');
    } catch (err) {
      setError(authErrorMessage(err instanceof Error ? err.message : '', t));
    } finally {
      setLoading(false);
    }
  };

  const submitLabel = mode === 'signup' ? t.auth.signUp : mode === 'reset' ? t.auth.sendLink : t.auth.signIn;

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4 py-8">
      <div className="max-w-md w-full">
        <h1 className="font-serif text-4xl text-text-primary text-center mb-8">
          Slate
        </h1>

        <div className="bg-surface rounded-2xl p-6 space-y-6">
          {mode === 'reset' ? (
            <div>
              <h2 className="text-lg font-medium text-text-primary mb-1">{t.auth.resetTitle}</h2>
              <p className="text-sm text-text-secondary">
                {t.auth.resetHint}
              </p>
            </div>
          ) : (
            <>
              <button
                onClick={() => handleOAuthSignIn('google')}
                disabled={loading}
                className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-surface-hover text-text-primary rounded-xl font-medium transition-colors hover:bg-border disabled:opacity-50"
              >
                <GoogleLogo className="w-5 h-5" />
                {t.auth.continueWithGoogle}
              </button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-surface text-text-secondary">{t.auth.or}</span>
                </div>
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="email" className={labelClass}>{t.auth.email}</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={fieldClass}
                required
              />
            </div>

            {mode !== 'reset' && (
              <div>
                <div className="flex items-baseline justify-between mb-2">
                  <label htmlFor="password" className="block text-sm text-text-secondary">{t.auth.password}</label>
                  {mode === 'signin' && (
                    <button type="button" onClick={() => switchMode('reset')} className={`text-sm ${linkClass}`}>
                      {t.auth.forgotPassword}
                    </button>
                  )}
                </div>
                <input
                  id="password"
                  type="password"
                  autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
                  minLength={mode === 'signup' ? 6 : undefined}
                  aria-describedby={mode === 'signup' ? 'password-hint' : undefined}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={fieldClass}
                  required
                />
                {mode === 'signup' && (
                  <p id="password-hint" className="text-xs text-text-tertiary mt-2">{t.auth.passwordHint}</p>
                )}
              </div>
            )}

            {error && (
              <p role="alert" className="text-danger text-sm">{error}</p>
            )}
            {message && (
              <p role="status" className="text-text-primary text-sm">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-accent text-accent-contrast rounded-xl font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {loading ? t.common.loading : submitLabel}
            </button>
          </form>

          <p className="text-center text-text-secondary text-sm">
            {mode === 'reset' ? (
              <button onClick={() => switchMode('signin')} className={linkClass}>
                {t.auth.backToSignIn}
              </button>
            ) : (
              <>
                {mode === 'signup' ? t.auth.haveAccount : t.auth.noAccount}{' '}
                <button onClick={() => switchMode(mode === 'signup' ? 'signin' : 'signup')} className={linkClass}>
                  {mode === 'signup' ? t.auth.signIn : t.auth.signUp}
                </button>
              </>
            )}
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-text-tertiary">
          {t.auth.legalBefore}
          <Link href="/terms" className="underline hover:text-text-secondary">
            {t.common.terms}
          </Link>
          {t.auth.legalBetween}
          <Link href="/privacy" className="underline hover:text-text-secondary">
            {t.common.privacyPolicy}
          </Link>
          {t.auth.legalAfter}
        </p>

        <div className="mt-2 flex justify-center">
          <LanguageSelect />
        </div>
      </div>
    </div>
  );
}
