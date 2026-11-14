import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    await supabase.auth.exchangeCodeForSession(code);
  }

  // `next` lets the password-reset email land on /reset-password. Only a path on
  // this site is accepted, so the link can't be used to redirect somewhere else.
  const next = searchParams.get('next');
  const destination = next && next.startsWith('/') && !next.startsWith('//') && !next.includes('\\') ? next : '/dashboard';

  return NextResponse.redirect(new URL(destination, request.url));
}
