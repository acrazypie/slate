'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export function useGoogleCalendarConnection() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const supabase = createClient();

  const refreshStatus = useCallback(async () => {
    const { data } = await supabase
      .from('google_calendar_tokens')
      .select('user_id')
      .maybeSingle();
    setConnected(!!data);
  }, [supabase]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const connect = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: 'https://www.googleapis.com/auth/calendar.events',
        queryParams: { access_type: 'offline', prompt: 'consent' },
        redirectTo: `${window.location.origin}/auth/google-calendar/callback`,
      },
    });
  }, [supabase]);

  const disconnect = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return;
    await supabase.from('google_calendar_tokens').delete().eq('user_id', user.id);
    setConnected(false);
  }, [supabase]);

  return { connected, connect, disconnect, refreshStatus };
}
