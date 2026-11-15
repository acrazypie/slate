import { addDays, format } from 'date-fns';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Block, GoogleCalendar, GoogleEvent, GoogleEventChanges, GoogleEventScope } from './types';
import { dateForWeekOffset, weekdayPositionInMonth } from './recurrence';

// Slate's working timezone. Blocks don't currently carry a per-user timezone,
// so every synced event is written in this one, and every event read from
// Google is shown at its wall-clock time here.
export const APP_TIME_ZONE = 'Europe/Rome';

const API = 'https://www.googleapis.com/calendar/v3';

// 0 = Monday ... 6 = Sunday, matching the rest of the app.
export const ISO_WEEKDAY_CODES = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'];

// Google's event colours, by `colorId`. An event without one takes its calendar's colour.
const EVENT_COLORS: Record<string, string> = {
  '1': '#7986cb',
  '2': '#33b679',
  '3': '#8e24aa',
  '4': '#e67c73',
  '5': '#f6c026',
  '6': '#f5511d',
  '7': '#039be5',
  '8': '#616161',
  '9': '#3f51b5',
  '10': '#0b8043',
  '11': '#d60000',
};
const FALLBACK_COLOR = '#7AA7D9';

export interface GoogleAuth {
  accessToken: string;
  /** The calendar Slate's own events are written to. */
  calendarId: string;
  /** Calendars the user switched off in Settings. */
  hiddenCalendarIds: string[];
  /** When changes made in Google were last pulled into Slate's events. */
  lastPulledAt: string | null;
}

interface RawTime {
  date?: string;
  dateTime?: string;
  timeZone?: string;
}

/** The fields of a Google Calendar event that Slate reads. */
export interface RawEvent {
  id: string;
  status?: string;
  summary?: string;
  description?: string;
  location?: string;
  colorId?: string;
  htmlLink?: string;
  updated?: string;
  start?: RawTime;
  end?: RawTime;
  recurrence?: string[];
  recurringEventId?: string;
  originalStartTime?: RawTime;
  eventType?: string;
  organizer?: { self?: boolean };
  attendees?: { self?: boolean; responseStatus?: string }[];
  guestsCanModify?: boolean;
}

interface GoogleTokenRow {
  access_token: string;
  refresh_token: string;
  expires_at: string;
  calendar_id: string;
  // Added with two-way sync; absent until the migration in docs/database.md has run.
  hidden_calendar_ids?: string[] | null;
  last_pulled_at?: string | null;
}

/**
 * Returns a valid Google access token for this user, refreshing and persisting
 * it first if it has expired, along with their sync settings. Returns null if
 * the user hasn't connected Google Calendar, or if the refresh itself fails
 * (e.g. they revoked access on Google's side) — callers should treat null as
 * "nothing to sync", not an error.
 */
export async function getValidAccessToken(
  supabase: SupabaseClient,
  userId: string
): Promise<GoogleAuth | null> {
  const { data, error } = await supabase
    .from('google_calendar_tokens')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle<GoogleTokenRow>();

  if (error || !data) return null;

  const settings = {
    calendarId: data.calendar_id,
    hiddenCalendarIds: data.hidden_calendar_ids ?? [],
    lastPulledAt: data.last_pulled_at ?? null,
  };

  const expiresAt = new Date(data.expires_at).getTime();
  if (expiresAt > Date.now() + 60_000) {
    return { accessToken: data.access_token, ...settings };
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

  return { accessToken: newAccessToken, ...settings };
}

function googleFetch(accessToken: string, path: string, init: { method?: string; body?: unknown } = {}) {
  return fetch(`${API}${path}`, {
    method: init.method ?? 'GET',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...(init.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
    },
    body: init.body !== undefined ? JSON.stringify(init.body) : undefined,
    cache: 'no-store',
  });
}

function eventsPath(calendarId: string, eventId?: string): string {
  const base = `/calendars/${encodeURIComponent(calendarId)}/events`;
  return eventId ? `${base}/${encodeURIComponent(eventId)}` : base;
}

// ---------------------------------------------------------------------------
// Time: Google speaks in instants, Slate in wall-clock dates and hours
// ---------------------------------------------------------------------------

const wallFormatters = new Map<string, Intl.DateTimeFormat>();

/** The date ('yyyy-MM-dd') and time an instant shows on a clock in `timeZone`. */
export function wallTime(instant: Date, timeZone: string = APP_TIME_ZONE): { date: string; hour: number; minute: number } {
  let formatter = wallFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    });
    wallFormatters.set(timeZone, formatter);
  }
  const parts: Record<string, string> = {};
  for (const part of formatter.formatToParts(instant)) parts[part.type] = part.value;
  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    hour: Number(parts.hour) % 24,
    minute: Number(parts.minute),
  };
}

/** The instant at which a clock in `timeZone` shows this date and time. */
export function instantFromWall(date: string, hour: number, minute: number, timeZone: string = APP_TIME_ZONE): Date {
  const [y, m, d] = date.split('-').map(Number);
  const asIfUtc = Date.UTC(y, m - 1, d, hour, minute);
  const shown = wallTime(new Date(asIfUtc), timeZone);
  const [sy, sm, sd] = shown.date.split('-').map(Number);
  const offset = Date.UTC(sy, sm - 1, sd, shown.hour, shown.minute) - asIfUtc;
  return new Date(asIfUtc - offset);
}

/** 'yyyy-MM-dd' moved by a number of days. */
export function addDaysToKey(date: string, days: number): string {
  const [y, m, d] = date.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d + days)).toISOString().slice(0, 10);
}

function daysBetweenKeys(from: string, to: string): number {
  const [fy, fm, fd] = from.split('-').map(Number);
  const [ty, tm, td] = to.split('-').map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000);
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
    // UNTIL is an instant: the last minute of the end date, on Slate's clock.
    const until = instantFromWall(block.recurrence_end_date, 23, 59).toISOString();
    rule += `;UNTIL=${until.slice(0, 19).replace(/[-:]/g, '')}Z`;
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
  // An event running past midnight ends on the following day.
  const endDatePart = format(addDays(day, Math.floor(endMinutesTotal / (24 * 60))), 'yyyy-MM-dd');

  return {
    summary: block.title,
    // An empty string, not undefined: a PATCH has to be able to clear the description.
    description: block.notes || '',
    start: { dateTime: `${datePart}T${startTime}`, timeZone: APP_TIME_ZONE },
    end: { dateTime: `${endDatePart}T${endTime}`, timeZone: APP_TIME_ZONE },
    ...(block.is_recurring ? { recurrence: buildRecurrenceLines(block, exceptionDates) } : {}),
  };
}

/**
 * Creates or updates (if the block already has a google_event_id) the matching
 * Calendar event — a single recurring event (RRULE, with EXDATE for any
 * skipped occurrences) if the block is recurring, otherwise a single instance.
 * Returns the event's id and Google's `updated` stamp for it.
 */
export async function upsertGoogleEvent(
  accessToken: string,
  calendarId: string,
  block: Block,
  exceptionDates: Date[] = []
): Promise<{ id: string; updated: string | null } | null> {
  const event = toGoogleEvent(block, exceptionDates);

  let res = block.google_event_id
    ? await googleFetch(accessToken, eventsPath(calendarId, block.google_event_id), { method: 'PATCH', body: event })
    : await googleFetch(accessToken, eventsPath(calendarId), { method: 'POST', body: event });

  // The linked event may have been deleted on Google's side — fall back to creating a new one.
  if (block.google_event_id && (res.status === 404 || res.status === 410)) {
    res = await googleFetch(accessToken, eventsPath(calendarId), { method: 'POST', body: event });
  }
  if (!res.ok) return null;

  let data: RawEvent = await res.json();
  // Repeat was switched off in Slate: a PATCH without a rule leaves the old one in place.
  if (!block.is_recurring && data.recurrence?.length) {
    const cleared = await googleFetch(accessToken, eventsPath(calendarId, data.id), {
      method: 'PATCH',
      body: { recurrence: [] },
    });
    if (cleared.ok) data = await cleared.json();
  }
  return { id: data.id, updated: data.updated ?? null };
}

export async function deleteGoogleEvent(
  accessToken: string,
  calendarId: string,
  eventId: string
): Promise<boolean> {
  const res = await googleFetch(accessToken, eventsPath(calendarId, eventId), { method: 'DELETE' });
  // 410 Gone means it was already deleted on Google's side — treat as success.
  return res.ok || res.status === 410 || res.status === 404;
}

// ---------------------------------------------------------------------------
// Reading: the user's calendars and the events in them
// ---------------------------------------------------------------------------

interface RawCalendar {
  id: string;
  summary?: string;
  summaryOverride?: string;
  backgroundColor?: string;
  primary?: boolean;
  accessRole?: string;
  hidden?: boolean;
  deleted?: boolean;
}

/**
 * The user's calendars. A connection made before two-way sync has no
 * permission to list them: it gets just the calendar Slate writes to, and
 * `needsReconnect` so Settings can say why the others are missing.
 */
export async function listCalendars(
  auth: GoogleAuth
): Promise<{ calendars: GoogleCalendar[]; needsReconnect: boolean } | null> {
  const res = await googleFetch(auth.accessToken, '/users/me/calendarList?minAccessRole=reader&maxResults=250');

  if (res.status === 403) {
    return {
      needsReconnect: true,
      calendars: [
        {
          id: auth.calendarId,
          name: 'Google Calendar',
          color: FALLBACK_COLOR,
          primary: true,
          canEdit: true,
          visible: !auth.hiddenCalendarIds.includes(auth.calendarId),
        },
      ],
    };
  }
  if (!res.ok) return null;

  const data: { items?: RawCalendar[] } = await res.json();
  const calendars = (data.items || [])
    .filter((c) => !c.deleted && !c.hidden)
    .map((c) => ({
      id: c.id,
      name: c.summaryOverride || c.summary || c.id,
      color: c.backgroundColor || FALLBACK_COLOR,
      primary: !!c.primary,
      canEdit: c.accessRole === 'owner' || c.accessRole === 'writer',
      // The stored "primary" alias and the primary calendar's real id are the same calendar.
      visible: !auth.hiddenCalendarIds.includes(c.id) && !(c.primary && auth.hiddenCalendarIds.includes('primary')),
    }))
    .sort((a, b) => Number(b.primary) - Number(a.primary) || a.name.localeCompare(b.name));

  return { calendars, needsReconnect: false };
}

/** When an event starts and ends, as Slate shows it. */
function eventTimes(event: RawEvent): Pick<
  GoogleEvent,
  'allDay' | 'startDate' | 'endDate' | 'start_hour' | 'start_minute' | 'end_hour' | 'end_minute'
> | null {
  if (event.start?.date && event.end?.date) {
    // Google's end date is exclusive: a one-day event ends "tomorrow".
    const endDate = addDaysToKey(event.end.date, -1);
    return {
      allDay: true,
      startDate: event.start.date,
      endDate: endDate < event.start.date ? event.start.date : endDate,
      start_hour: 0,
      start_minute: 0,
      end_hour: 0,
      end_minute: 0,
    };
  }
  if (event.start?.dateTime && event.end?.dateTime) {
    const start = wallTime(new Date(event.start.dateTime));
    const end = wallTime(new Date(event.end.dateTime));
    return {
      allDay: false,
      startDate: start.date,
      endDate: end.date,
      start_hour: start.hour,
      start_minute: start.minute,
      end_hour: end.hour,
      end_minute: end.minute,
    };
  }
  return null;
}

function toSlateEvent(event: RawEvent, calendar: GoogleCalendar): GoogleEvent | null {
  const times = eventTimes(event);
  if (!times) return null;

  // Only ordinary events the user owns can be changed. Invitations from
  // someone else, birthdays, working locations and the like are read-only.
  const ownEvent = !event.organizer || event.organizer.self === true || event.guestsCanModify === true;
  const ordinary = !event.eventType || event.eventType === 'default';

  return {
    id: event.id,
    calendarId: calendar.id,
    calendarName: calendar.name,
    title: event.summary || '',
    notes: event.description || '',
    location: event.location || null,
    color: (event.colorId && EVENT_COLORS[event.colorId]) || calendar.color,
    ...times,
    recurringEventId: event.recurringEventId || null,
    canEdit: calendar.canEdit && ownEvent && ordinary,
    htmlLink: event.htmlLink || null,
  };
}

/**
 * Every event between two days (inclusive) in the given calendars, recurring
 * events expanded into their occurrences. `linkedEventIds` are the Google
 * events that mirror Slate's own events: those are left out, because Slate
 * already shows the original.
 */
export async function listRangeEvents(
  auth: GoogleAuth,
  calendars: GoogleCalendar[],
  from: string,
  to: string,
  linkedEventIds: Set<string>
): Promise<GoogleEvent[]> {
  const timeMin = instantFromWall(from, 0, 0).toISOString();
  const timeMax = instantFromWall(addDaysToKey(to, 1), 0, 0).toISOString();

  const perCalendar = await Promise.all(
    calendars.map(async (calendar) => {
      const events: GoogleEvent[] = [];
      let pageToken: string | undefined;
      // A page holds up to 2500 events; a few pages is far more than a month needs.
      for (let page = 0; page < 4; page++) {
        const params = new URLSearchParams({
          timeMin,
          timeMax,
          singleEvents: 'true',
          orderBy: 'startTime',
          maxResults: '2500',
        });
        if (pageToken) params.set('pageToken', pageToken);
        const res = await googleFetch(auth.accessToken, `${eventsPath(calendar.id)}?${params}`);
        if (!res.ok) break;
        const data: { items?: RawEvent[]; nextPageToken?: string } = await res.json();

        for (const raw of data.items || []) {
          if (raw.status === 'cancelled') continue;
          if (raw.eventType === 'workingLocation') continue;
          if (linkedEventIds.has(raw.id) || (raw.recurringEventId && linkedEventIds.has(raw.recurringEventId))) continue;
          if (raw.attendees?.some((a) => a.self && a.responseStatus === 'declined')) continue;
          const event = toSlateEvent(raw, calendar);
          if (event) events.push(event);
        }

        pageToken = data.nextPageToken;
        if (!pageToken) break;
      }
      return events;
    })
  );

  return perCalendar.flat();
}

// ---------------------------------------------------------------------------
// Writing: edits made in Slate to events that live in Google
// ---------------------------------------------------------------------------

export async function getGoogleEvent(auth: GoogleAuth, calendarId: string, eventId: string): Promise<RawEvent | null> {
  const res = await googleFetch(auth.accessToken, eventsPath(calendarId, eventId));
  return res.ok ? res.json() : null;
}

function sameTimes(a: NonNullable<ReturnType<typeof eventTimes>>, b: GoogleEventChanges): boolean {
  if (a.allDay !== b.allDay || a.startDate !== b.startDate || a.endDate !== b.endDate) return false;
  if (a.allDay) return true;
  return (
    a.start_hour === b.start_hour &&
    a.start_minute === b.start_minute &&
    a.end_hour === b.end_hour &&
    a.end_minute === b.end_minute
  );
}

/** The start/end part of a PATCH. The unused one of date/dateTime has to be cleared explicitly. */
function timesPatch(changes: GoogleEventChanges) {
  if (changes.allDay) {
    return {
      start: { date: changes.startDate, dateTime: null, timeZone: null },
      end: { date: addDaysToKey(changes.endDate, 1), dateTime: null, timeZone: null },
    };
  }
  const stamp = (date: string, hour: number, minute: number) => `${date}T${pad(hour)}:${pad(minute)}:00`;
  return {
    start: {
      dateTime: stamp(changes.startDate, changes.start_hour, changes.start_minute),
      timeZone: APP_TIME_ZONE,
      date: null,
    },
    end: {
      dateTime: stamp(changes.endDate, changes.end_hour, changes.end_minute),
      timeZone: APP_TIME_ZONE,
      date: null,
    },
  };
}

export type GoogleWriteResult = 'ok' | 'not-found' | 'unsupported' | 'failed';

/**
 * Saves an edit to a Google event. With scope 'all' on an occurrence of a
 * recurring event the series itself is changed: title and notes always, and
 * the time of day if it moved. Moving a whole series to another date is not
 * supported (its repeat rule would have to change with it): 'unsupported'.
 */
export async function updateExternalEvent(
  auth: GoogleAuth,
  calendarId: string,
  eventId: string,
  changes: GoogleEventChanges,
  scope: GoogleEventScope
): Promise<GoogleWriteResult> {
  const current = await getGoogleEvent(auth, calendarId, eventId);
  if (!current || current.status === 'cancelled') return 'not-found';
  const currentTimes = eventTimes(current);
  if (!currentTimes) return 'failed';

  const body: Record<string, unknown> = { summary: changes.title, description: changes.notes };
  const timesChanged = !sameTimes(currentTimes, changes);
  let targetId = eventId;

  if (scope === 'all' && current.recurringEventId) {
    targetId = current.recurringEventId;
    if (timesChanged) {
      if (changes.allDay || currentTimes.allDay || changes.startDate !== currentTimes.startDate) return 'unsupported';
      const series = await getGoogleEvent(auth, calendarId, targetId);
      if (!series?.start?.dateTime) return 'failed';

      // Shift the series' first occurrence by as much as this one moved, and give it the new length.
      const startShift =
        changes.start_hour * 60 + changes.start_minute - (currentTimes.start_hour * 60 + currentTimes.start_minute);
      const duration =
        daysBetweenKeys(changes.startDate, changes.endDate) * 24 * 60 +
        (changes.end_hour * 60 + changes.end_minute) -
        (changes.start_hour * 60 + changes.start_minute);
      const start = new Date(new Date(series.start.dateTime).getTime() + startShift * 60_000);
      const end = new Date(start.getTime() + duration * 60_000);
      const timeZone = series.start.timeZone || APP_TIME_ZONE;
      body.start = { dateTime: start.toISOString(), timeZone };
      body.end = { dateTime: end.toISOString(), timeZone: series.end?.timeZone || timeZone };
    }
  } else if (timesChanged) {
    Object.assign(body, timesPatch(changes));
  }

  const res = await googleFetch(auth.accessToken, eventsPath(calendarId, targetId), { method: 'PATCH', body });
  if (res.status === 404 || res.status === 410) return 'not-found';
  return res.ok ? 'ok' : 'failed';
}

/** Deletes a Google event: one occurrence, or with scope 'all' the whole series it belongs to. */
export async function deleteExternalEvent(
  auth: GoogleAuth,
  calendarId: string,
  eventId: string,
  scope: GoogleEventScope
): Promise<GoogleWriteResult> {
  let targetId = eventId;
  if (scope === 'all') {
    const current = await getGoogleEvent(auth, calendarId, eventId);
    if (current?.recurringEventId) targetId = current.recurringEventId;
  }
  return (await deleteGoogleEvent(auth.accessToken, calendarId, targetId)) ? 'ok' : 'failed';
}
