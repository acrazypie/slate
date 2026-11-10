'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

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
      setError(error.message);
      setLoading(false);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      if (isSignUp) {
        setMessage('Check your email to confirm your account');
      } else {
        router.push('/dashboard');
      }
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg px-4">
      <div className="max-w-md w-full">
        <h1 className="font-serif text-4xl text-text-primary text-center mb-8">
          Slate
        </h1>

        <div className="bg-surface rounded-2xl p-6 space-y-6">
          <button
            onClick={() => handleOAuthSignIn('google')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-surface-hover text-text-primary rounded-xl font-medium transition-colors hover:bg-border disabled:opacity-50"
          >
            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
            Continua con Google
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-surface text-text-secondary">oppure</span>
            </div>
          </div>

          <form onSubmit={handleEmailSignIn} className="space-y-4">
            <div>
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-surface-hover text-text-primary rounded-xl placeholder-text-secondary border border-border focus:border-accent focus:outline-none transition-colors"
                required
              />
            </div>
            <div>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 bg-surface-hover text-text-primary rounded-xl placeholder-text-secondary border border-border focus:border-accent focus:outline-none transition-colors"
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm">{error}</p>
            )}
            {message && (
              <p className="text-green-500 text-sm">{message}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-3 bg-accent text-accent-contrast rounded-xl font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Caricamento...' : isSignUp ? 'Registrati' : 'Accedi'}
            </button>
          </form>

          <p className="text-center text-text-secondary text-sm">
            {isSignUp ? 'Hai già un account?' : 'Non hai un account?'}{' '}
            <button
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError(null);
                setMessage(null);
              }}
              className="text-accent hover:underline"
            >
              {isSignUp ? 'Accedi' : 'Registrati'}
            </button>
          </p>
        </div>

        <p className="mt-6 text-center text-xs text-text-tertiary">
          Continuando accetti i{' '}
          <Link href="/terms" className="underline hover:text-text-secondary">
            Termini di Servizio
          </Link>{' '}
          e l&apos;
          <Link href="/privacy" className="underline hover:text-text-secondary">
            Informativa sulla Privacy
          </Link>
          .
        </p>
      </div>
    </div>
  );
}