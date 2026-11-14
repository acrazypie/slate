import { format } from 'date-fns';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Block } from './types';
import { dateForWeekOffset, weekdayPositionInMonth } from './recurrence';

// Slate's working timezone. Blocks don't currently carry a per-user timezone,
// so every synced event is created in this one.
const APP_TIME_ZONE = 'Europe/Rome';

// 0 = Monday ... 6 = Sunday, matching the rest of the app.
const ISO_WEEKDAY_CODES = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

interface GoogleTokenRow {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  calendar_id: string;
}

/**
 * Returns a valid Google access token for this user, refreshing and persisting
 * it first if it has expired. Returns null if the user hasn't connected Google
 * Calendar, or if the refresh itself fails (e.g. they revoked access on Google's
 * side) — callers should treat null as "nothing to sync", not an error.
 */
export async function getValidAccessToken(
  supabase: SupabaseClient,
  userId: string
): Promise<{ accessToken: string; calendarId: string } | null> {
  const { data, error } = await supabase
    .from('google_calendar_tokens')
    .select('access_token, refresh_token, expires_at, calendar_id')
    .eq('user_id', userId)
    .maybeSingle<GoogleTokenRow>();

  if (error || !data) return null;

  const expiresAt = new Date(data.expires_at).getTime();
  if (expiresAt > Date.now() + 60_000) {
    return { accessToken: data.access_token, calendarId: data.calendar_id };
  }

  // Expired (or about to) — refresh it.
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  if (!clientId || !clientSecret) return null;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: data.refresh_token,
      grant_type: 'refresh_token',
    }),
  });

  if (!res.ok) return null;
  const refreshed = await res.json();
  const newAccessToken: string = refreshed.access_token;
  const expiresIn: number = refreshed.expires_in ?? 3600;
  const newExpiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

  await supabase
    .from('google_calendar_tokens')
    .update({ access_token: newAccessToken, expires_at: newExpiresAt, updated_at: new Date().toISOString() })
    .eq('user_id', userId);

  return { accessToken: newAccessToken, calendarId: data.calendar_id };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

/** RFC5545 local-time stamp (no offset - paired with a TZID param instead), e.g. 20261125T090000 */
function toLocalStamp(date: Date, hour: number, minute: number): string {
  return `${format(date, 'yyyyMMdd')}T${pad(hour)}${pad(minute)}00`;
}

/** Builds the RRULE (+ EXDATE per skipped occurrence) for a recurring block. */
function buildRecurrenceLines(block: Block, exceptionDates: Date[]): string[] {
  const startDate = dateForWeekOffset(block.week_offset, block.day_of_week);

  let rule: string;
  if (block.recurrence_type === 'monthly') {
    const position = weekdayPositionInMonth(startDate);
    const isLast = position === 5;
    const byday = `${isLast ? '-1' : position}${ISO_WEEKDAY_CODES[block.day_of_week]}`;
    rule = `RRULE:FREQ=MONTHLY;BYDAY=${byday}`;
  } else {
    rule = 'RRULE:FREQ=WEEKLY';
  }

  if (block.recurrence_end_date) {
    const until = format(new Date(block.recurrence_end_date), "yyyyMMdd'T'235959'Z'");
    rule += `;UNTIL=${until}`;
  }

  const lines = [rule];
  for (const exDate of exceptionDates) {
    lines.push(`EXDATE;TZID=${APP_TIME_ZONE}:${toLocalStamp(exDate, block.start_hour, block.start_minute)}`);
  }
  return lines;
}

function toGoogleEvent(block: Block, exceptionDates: Date[]) {
  const day = dateForWeekOffset(block.week_offset, block.day_of_week);
  const datePart = format(day, 'yyyy-MM-dd');

  const startMinutesTotal = block.start_hour * 60 + block.start_minute;
  const endMinutesTotal = startMinutesTotal + block.duration_minutes;
  const startTime = `${pad(block.start_hour)}:${pad(block.start_minute)}:00`;
  const endTime = `${pad(Math.floor(endMinutesTotal / 60) % 24)}:${pad(endMinutesTotal % 60)}:00`;

  return {
    summary: block.title,
    description: block.notes || undefined,
    start: { dateTime: `${datePart}T${startTime}`, timeZone: APP_TIME_ZONE },
    end: { dateTime: `${datePart}T${endTime}`, timeZone: APP_TIME_ZONE },
    ...(block.is_recurring ? { recurrence: buildRecurrenceLines(block, exceptionDates) } : {}),
  };
}

/**
 * Creates or updates (if the block already has a google_event_id) the matching
 * Calendar event — a single recurring event (RRULE, with EXDATE for any
 * skipped occurrences) if the block is recurring, otherwise a single instance.
 */
export async function upsertGoogleEvent(
  accessToken: string,
  calendarId: string,
  block: Block,
  exceptionDates: Date[] = []
): Promise<string | null> {
  const event = toGoogleEvent(block, exceptionDates);
  const base = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`;
  const url = block.google_event_id ? `${base}/${block.google_event_id}` : base;
  const method = block.google_event_id ? 'PATCH' : 'POST';

  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(event),
  });

  if (!res.ok) {
    // The linked event may have been deleted on Google's side — fall back to creating a new one.
    if (res.status === 404 && method === 'PATCH') {
      const createRes = await fetch(base, {
        method: 'POST',
        headers: { Authorization: `Bearer ${accessToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (!createRes.ok) return null;
      const created = await createRes.json();
      return created.id as string;
    }
    return null;
  }

  const data = await res.json();
  return data.id as string;
}

export async function deleteGoogleEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<boolean> {
  const url = `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`;
  const res = await fetch(url, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  // 410 Gone means it was already deleted on Google's side — treat as success.
  return res.ok || res.status === 410 || res.status === 404;
}
