'use client';

import { useCallback, useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { fetchGoogleCalendars } from '@/lib/googleCalendarClient';
import { GoogleCalendar } from '@/lib/types';

// Events on every calendar (read and write), plus the list of calendars.
const SCOPES = [
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/calendar.calendarlist.readonly',
].join(' ');

export function useGoogleCalendarConnection() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [calendars, setCalendars] = useState<GoogleCalendar[]>([]);
  // True for a connection made before two-way sync: it may not list calendars.
  const [needsReconnect, setNeedsReconnect] = useState(false);
  const supabase = createClient();

  const refreshStatus = useCallback(async () => {
    const { data } = await supabase
      .from('google_calendar_tokens')
      .select('user_id')
      .maybeSingle();
    setConnected(!!data);
    if (!data) return;
    const listed = await fetchGoogleCalendars();
    if (listed?.connected) {
      setCalendars(listed.calendars);
      setNeedsReconnect(!!listed.needsReconnect);
    }
  }, [supabase]);

  useEffect(() => {
    refreshStatus();
  }, [refreshStatus]);

  const connect = useCallback(async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        scopes: SCOPES,
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
    setCalendars([]);
  }, [supabase]);

  /** Shows or hides one calendar's events in Slate. */
  const setCalendarVisible = useCallback(
    async (calendarId: string, visible: boolean) => {
      const next = calendars.map((c) => (c.id === calendarId ? { ...c, visible } : c));
      setCalendars(next);
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { error } = await supabase
        .from('google_calendar_tokens')
        .update({ hidden_calendar_ids: next.filter((c) => !c.visible).map((c) => c.id) })
        .eq('user_id', user.id);
      // Not saved: put the switch back where it was.
      if (error) setCalendars(calendars);
    },
    [calendars, supabase]
  );

  return { connected, calendars, needsReconnect, connect, disconnect, refreshStatus, setCalendarVisible };
}
