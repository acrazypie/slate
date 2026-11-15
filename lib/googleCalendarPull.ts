import type { SupabaseClient } from '@supabase/supabase-js';
import { Block } from './types';
import { dateFromKey, getSeriesOccurrenceDates, keyFromDate, weekOffsetForDate, weekdayPositionInMonth } from './recurrence';
import { GoogleAuth, ISO_WEEKDAY_CODES, RawEvent, wallTime } from './googleCalendar';

/**
 * The other half of the sync: brings changes made in Google Calendar to
 * events that Slate created back into Slate's `blocks`.
 *
 * Slate's events keep their category and colour, which Google knows nothing
 * about, so they stay in `blocks` and are linked to their Google copy by
 * `google_event_id`. This asks Google for everything in Slate's calendar that
 * changed since the last pull and applies it to the linked blocks.
 */

const API = 'https://www.googleapis.com/calendar/v3';

type BlockFields = Pick<
  Block,
  'title' | 'notes' | 'day_of_week' | 'week_offset' | 'start_hour' | 'start_minute' | 'duration_minutes' | 'is_recurring'
> & {
  recurrence_type: 'weekly' | 'monthly' | null;
  recurrence_end_date: string | null;
};

/** The calendar day of an iCalendar stamp: 20261125, 20261125T090000 or 20261125T080000Z. */
function dayOfStamp(stamp: string): string | null {
  const match = stamp.trim().match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})(Z)?)?$/);
  if (!match) return null;
  const [, y, m, d, hh, mm, ss, utc] = match;
  // Slate used to write UNTIL as "23:59:59Z" on the end date itself; read that back as written.
  if (utc && !(hh === '23' && mm === '59' && ss === '59')) {
    return wallTime(new Date(Date.UTC(+y, +m - 1, +d, +hh, +mm, +ss))).date;
  }
  return `${y}-${m}-${d}`;
}

/**
 * Translates a Google event into the columns of a block, plus the weeks its
 * rule skips. Returns null for anything a block cannot hold: all-day events
 * and repeat rules other than "every week" or "every month on the nth weekday".
 */
export function eventToBlockFields(event: RawEvent): { fields: BlockFields; skippedWeeks: number[] } | null {
  if (!event.start?.dateTime || !event.end?.dateTime) return null;

  const startInstant = new Date(event.start.dateTime);
  const duration = Math.round((new Date(event.end.dateTime).getTime() - startInstant.getTime()) / 60_000);
  if (!(duration > 0) || duration > 24 * 60) return null;

  const start = wallTime(startInstant);
  const startDate = dateFromKey(start.date);
  const dayOfWeek = (startDate.getDay() + 6) % 7;

  const fields: BlockFields = {
    title: event.summary || '',
    notes: event.description || null,
    day_of_week: dayOfWeek,
    week_offset: weekOffsetForDate(startDate),
    start_hour: start.hour,
    start_minute: start.minute,
    duration_minutes: duration,
    is_recurring: false,
    recurrence_type: null,
    recurrence_end_date: null,
  };

  const lines = event.recurrence || [];
  if (lines.length === 0) return { fields, skippedWeeks: [] };

  const rules = lines.filter((line) => line.startsWith('RRULE:'));
  if (rules.length !== 1 || lines.some((line) => /^(RDATE|EXRULE)/.test(line))) return null;

  const rule: Record<string, string> = {};
  for (const part of rules[0].slice('RRULE:'.length).split(';')) {
    const [name, value] = part.split('=');
    if (name && value) rule[name.toUpperCase()] = value.toUpperCase();
  }

  const known = ['FREQ', 'INTERVAL', 'BYDAY', 'UNTIL', 'COUNT', 'WKST'];
  if (Object.keys(rule).some((name) => !known.includes(name))) return null;
  if (rule.INTERVAL && rule.INTERVAL !== '1') return null;

  const weekday = ISO_WEEKDAY_CODES[dayOfWeek];
  if (rule.FREQ === 'WEEKLY') {
    if (rule.BYDAY && rule.BYDAY !== weekday) return null;
    fields.recurrence_type = 'weekly';
  } else if (rule.FREQ === 'MONTHLY') {
    // Slate's monthly rule is "the same nth weekday", with a 5th one meaning "the last".
    const position = weekdayPositionInMonth(startDate);
    const expected = position === 5 ? `-1${weekday}` : `${position}${weekday}`;
    if (rule.BYDAY !== expected) return null;
    fields.recurrence_type = 'monthly';
  } else {
    return null;
  }
  fields.is_recurring = true;

  if (rule.UNTIL) {
    const until = dayOfStamp(rule.UNTIL);
    if (!until) return null;
    fields.recurrence_end_date = until;
  } else if (rule.COUNT) {
    // Slate only knows an end date: use the day of the last counted occurrence.
    const count = Number(rule.COUNT);
    const dates = getSeriesOccurrenceDates({ ...fields, recurrence_end_date: null });
    if (!(count >= 1) || count > dates.length) return null;
    fields.recurrence_end_date = keyFromDate(dates[count - 1]);
  }

  const skippedWeeks: number[] = [];
  for (const line of lines) {
    if (!line.startsWith('EXDATE')) continue;
    for (const stamp of line.slice(line.indexOf(':') + 1).split(',')) {
      const day = dayOfStamp(stamp);
      if (day) skippedWeeks.push(weekOffsetForDate(dateFromKey(day)));
    }
  }

  return { fields, skippedWeeks };
}

function differs(block: Block, fields: BlockFields): boolean {
  return (
    block.title !== fields.title ||
    (block.notes || null) !== fields.notes ||
    block.day_of_week !== fields.day_of_week ||
    block.week_offset !== fields.week_offset ||
    block.start_hour !== fields.start_hour ||
    block.start_minute !== fields.start_minute ||
    block.duration_minutes !== fields.duration_minutes ||
    !!block.is_recurring !== fields.is_recurring ||
    (block.recurrence_type || null) !== fields.recurrence_type ||
    (block.recurrence_end_date || null) !== fields.recurrence_end_date
  );
}

/** Whether Google's copy changed after the version Slate last wrote or read. */
function isNewer(event: RawEvent, block: Block): boolean {
  if (!block.google_updated_at || !event.updated) return true;
  return new Date(event.updated).getTime() > new Date(block.google_updated_at).getTime();
}

async function fetchChangedEvents(auth: GoogleAuth, since: Date): Promise<RawEvent[] | 'expired' | null> {
  const events: RawEvent[] = [];
  let pageToken: string | undefined;
  for (let page = 0; page < 10; page++) {
    const params = new URLSearchParams({
      updatedMin: since.toISOString(),
      showDeleted: 'true',
      singleEvents: 'false',
      maxResults: '250',
    });
    if (pageToken) params.set('pageToken', pageToken);
    const res = await fetch(`${API}/calendars/${encodeURIComponent(auth.calendarId)}/events?${params}`, {
      headers: { Authorization: `Bearer ${auth.accessToken}` },
      cache: 'no-store',
    });
    // Google only keeps deletions for a while; an older `updatedMin` is refused.
    if (res.status === 410) return 'expired';
    if (!res.ok) return null;
    const data: { items?: RawEvent[]; nextPageToken?: string } = await res.json();
    events.push(...(data.items || []));
    pageToken = data.nextPageToken;
    if (!pageToken) break;
  }
  return events;
}

/**
 * Applies what changed in Google since the last pull to the linked blocks.
 * Returns true if any block was changed, so the caller can tell the UI to reload.
 *
 * - An edited event updates its block (title, notes, day, time, repeat rule).
 * - A deleted event deletes its block.
 * - One occurrence of a series deleted in Google becomes a skipped week.
 * - One occurrence edited in Google becomes a skipped week plus a separate,
 *   one-off block linked to that occurrence.
 * - An event changed into something a block cannot hold (all-day, a repeat
 *   rule Slate lacks) stops being a Slate event: its block is removed and it
 *   shows as a plain Google event from then on.
 */
export async function pullGoogleChanges(supabase: SupabaseClient, userId: string, auth: GoogleAuth): Promise<boolean> {
  const startedAt = new Date();
  const markPulled = () =>
    supabase.from('google_calendar_tokens').update({ last_pulled_at: startedAt.toISOString() }).eq('user_id', userId);

  // First pull after connecting: nothing to catch up on, just start the clock.
  if (!auth.lastPulledAt) {
    await markPulled();
    return false;
  }

  // A minute of overlap covers clock differences; re-reading a change is harmless.
  const events = await fetchChangedEvents(auth, new Date(new Date(auth.lastPulledAt).getTime() - 60_000));
  if (events === null) return false;
  if (events === 'expired' || events.length === 0) {
    await markPulled();
    return false;
  }

  const candidateIds = new Set<string>();
  for (const event of events) {
    candidateIds.add(event.id);
    if (event.recurringEventId) candidateIds.add(event.recurringEventId);
  }
  const { data: linked, error } = await supabase
    .from('blocks')
    .select('*')
    .eq('user_id', userId)
    .in('google_event_id', [...candidateIds]);
  if (error) return false;

  const blockByEventId = new Map<string, Block>();
  for (const block of (linked || []) as Block[]) {
    if (block.google_event_id) blockByEventId.set(block.google_event_id, block);
  }
  if (blockByEventId.size === 0) {
    await markPulled();
    return false;
  }

  let changed = false;
  const skipWeek = async (seriesId: string, weekOffset: number) => {
    const { error: skipError } = await supabase
      .from('block_exceptions')
      .upsert(
        { block_id: seriesId, occurrence_week_offset: weekOffset },
        { onConflict: 'block_id,occurrence_week_offset', ignoreDuplicates: true }
      );
    if (!skipError) changed = true;
  };

  // Series before their occurrences, so an occurrence is compared with the series as it is now.
  events.sort((a, b) => Number(!!a.recurringEventId) - Number(!!b.recurringEventId));

  for (const event of events) {
    const block = blockByEventId.get(event.id);

    // --- The event a block mirrors ---------------------------------------
    if (block) {
      if (!isNewer(event, block)) continue;

      const converted = event.status === 'cancelled' ? null : eventToBlockFields(event);
      if (!converted) {
        // Deleted in Google, or no longer something a block can hold.
        await supabase.from('blocks').delete().eq('id', block.id);
        blockByEventId.delete(event.id);
        changed = true;
        continue;
      }

      const { fields, skippedWeeks } = converted;
      if (differs(block, fields)) changed = true;
      await supabase
        .from('blocks')
        .update({
          ...fields,
          recurrence_group_id: fields.is_recurring ? block.id : null,
          google_updated_at: event.updated ?? null,
        })
        .eq('id', block.id);
      Object.assign(block, fields);

      if (skippedWeeks.length > 0) {
        const { data: existing } = await supabase
          .from('block_exceptions')
          .select('occurrence_week_offset')
          .eq('block_id', block.id);
        const known = new Set((existing || []).map((e) => e.occurrence_week_offset));
        for (const week of skippedWeeks) {
          if (!known.has(week)) await skipWeek(block.id, week);
        }
      }
      continue;
    }

    // --- One occurrence of a series a block mirrors ------------------------
    const series = event.recurringEventId ? blockByEventId.get(event.recurringEventId) : undefined;
    const original = event.originalStartTime?.dateTime;
    if (!series || !series.is_recurring || !original) continue;

    const originalDay = wallTime(new Date(original)).date;
    const occurrenceWeek = weekOffsetForDate(dateFromKey(originalDay));

    if (event.status === 'cancelled') {
      await skipWeek(series.id, occurrenceWeek);
      continue;
    }

    const converted = eventToBlockFields({ ...event, recurrence: undefined });
    if (!converted) continue;
    const { fields } = converted;

    // Google also makes an exception for changes Slate doesn't show (a
    // reminder, a colour). Only split the occurrence off if it really differs.
    const unchanged =
      fields.title === series.title &&
      fields.notes === (series.notes || null) &&
      fields.week_offset === occurrenceWeek &&
      fields.day_of_week === series.day_of_week &&
      fields.start_hour === series.start_hour &&
      fields.start_minute === series.start_minute &&
      fields.duration_minutes === series.duration_minutes;
    if (unchanged) continue;

    const { error: insertError } = await supabase.from('blocks').insert({
      ...fields,
      id: crypto.randomUUID(),
      user_id: userId,
      category: series.category,
      color: series.color,
      google_event_id: event.id,
      google_updated_at: event.updated ?? null,
    });
    if (!insertError) {
      await skipWeek(series.id, occurrenceWeek);
      changed = true;
    }
  }

  await markPulled();
  return changed;
}
