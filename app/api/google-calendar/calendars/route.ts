import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidAccessToken, listCalendars } from '@/lib/googleCalendar';

/** The user's Google calendars and whether each one is shown in Slate. */
export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });

  const auth = await getValidAccessToken(supabase, user.id);
  if (!auth) return NextResponse.json({ connected: false, calendars: [] });

  const result = await listCalendars(auth);
  if (!result) return NextResponse.json({ error: 'Could not load calendars' }, { status: 502 });

  return NextResponse.json({ connected: true, ...result });
}
