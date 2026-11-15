import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import {
  GoogleAuth,
  deleteExternalEvent,
  getValidAccessToken,
  listCalendars,
  listRangeEvents,
  updateExternalEvent,
} from '@/lib/googleCalendar';
import { pullGoogleChanges } from '@/lib/googleCalendarPull';
import { GoogleEventChanges, GoogleEventScope } from '@/lib/types';

const DATE_KEY = /^\d{4}-\d{2}-\d{2}$/;

async function authenticate(): Promise<
  { supabase: SupabaseClient; userId: string; auth: GoogleAuth | null } | NextResponse
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  return { supabase, userId: user.id, auth: await getValidAccessToken(supabase, user.id) };
}

/**
 * GET ?from=yyyy-MM-dd&to=yyyy-MM-dd
 *
 * The Google side of the calendar for a range of days. Does two things:
 * pulls changes made in Google to Slate's own events back into `blocks`
 * (`blocksChanged` says whether anything moved, so the client reloads them),
 * then returns every other event in the calendars the user has switched on.
 */
export async function GET(request: Request) {
  const session = await authenticate();
  if (session instanceof NextResponse) return session;
  const { supabase, userId, auth } = session;
  if (!auth) return NextResponse.json({ connected: false, events: [], blocksChanged: false });

  const { searchParams } = new URL(request.url);
  const from = searchParams.get('from') || '';
  const to = searchParams.get('to') || '';
  if (!DATE_KEY.test(from) || !DATE_KEY.test(to) || to < from) {
    return NextResponse.json({ error: 'Invalid range' }, { status: 400 });
  }

  const blocksChanged = await pullGoogleChanges(supabase, userId, auth);

  const [listed, { data: linked }] = await Promise.all([
    listCalendars(auth),
    supabase.from('blocks').select('google_event_id').eq('user_id', userId).not('google_event_id', 'is', null),
  ]);
  if (!listed) return NextResponse.json({ error: 'Could not load calendars' }, { status: 502 });

  const linkedEventIds = new Set((linked || []).map((row) => row.google_event_id as string));
  const events = await listRangeEvents(
    auth,
    listed.calendars.filter((calendar) => calendar.visible),
    from,
    to,
    linkedEventIds
  );

  return NextResponse.json({ connected: true, events, blocksChanged });
}

function validChanges(value: unknown): value is GoogleEventChanges {
  if (!value || typeof value !== 'object') return false;
  const c = value as Record<string, unknown>;
  const inRange = (n: unknown, max: number) => Number.isInteger(n) && (n as number) >= 0 && (n as number) <= max;
  if (typeof c.title !== 'string' || typeof c.notes !== 'string' || typeof c.allDay !== 'boolean') return false;
  if (typeof c.startDate !== 'string' || typeof c.endDate !== 'string') return false;
  if (!DATE_KEY.test(c.startDate) || !DATE_KEY.test(c.endDate) || c.endDate < c.startDate) return false;
  if (c.allDay) return true;
  if (!inRange(c.start_hour, 23) || !inRange(c.start_minute, 59)) return false;
  if (!inRange(c.end_hour, 23) || !inRange(c.end_minute, 59)) return false;
  const start = (c.start_hour as number) * 60 + (c.start_minute as number);
  const end = (c.end_hour as number) * 60 + (c.end_minute as number);
  return c.endDate > c.startDate || end > start;
}

const STATUS = { ok: 200, 'not-found': 404, unsupported: 400, failed: 502 } as const;

/** PATCH { calendarId, eventId, scope, changes }: saves an edit to a Google event. */
export async function PATCH(request: Request) {
  const session = await authenticate();
  if (session instanceof NextResponse) return session;
  if (!session.auth) return NextResponse.json({ error: 'Not connected' }, { status: 409 });

  const body = await request.json().catch(() => null);
  const scope: GoogleEventScope = body?.scope === 'all' ? 'all' : 'this';
  if (typeof body?.calendarId !== 'string' || typeof body?.eventId !== 'string' || !validChanges(body?.changes)) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const result = await updateExternalEvent(session.auth, body.calendarId, body.eventId, body.changes, scope);
  return NextResponse.json({ result }, { status: STATUS[result] });
}

/** DELETE { calendarId, eventId, scope }: deletes a Google event, or the series it belongs to. */
export async function DELETE(request: Request) {
  const session = await authenticate();
  if (session instanceof NextResponse) return session;
  if (!session.auth) return NextResponse.json({ error: 'Not connected' }, { status: 409 });

  const body = await request.json().catch(() => null);
  const scope: GoogleEventScope = body?.scope === 'all' ? 'all' : 'this';
  if (typeof body?.calendarId !== 'string' || typeof body?.eventId !== 'string') {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const result = await deleteExternalEvent(session.auth, body.calendarId, body.eventId, scope);
  return NextResponse.json({ result }, { status: STATUS[result] });
}
