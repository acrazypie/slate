import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error && data.session?.provider_token && data.session.user) {
      const expiresAt = new Date(Date.now() + 3600 * 1000).toISOString();

      await supabase.from('google_calendar_tokens').upsert(
        {
          user_id: data.session.user.id,
          access_token: data.session.provider_token,
          // Google only issues a refresh token the first time a user consents
          // with prompt=consent; if we already had one, keep it rather than
          // overwrite with null on a later reconnect.
          ...(data.session.provider_refresh_token
            ? { refresh_token: data.session.provider_refresh_token }
            : {}),
          expires_at: expiresAt,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      );

      return NextResponse.redirect(`${origin}/dashboard?calendar=connected`);
    }
  }

  return NextResponse.redirect(`${origin}/dashboard?calendar=error`);
}
