// Sends the reminders for blocks and shifts that are about to start. Runs once a
// minute (pg_cron calls it with the shared secret). For each user with a push
// subscription it works out which items start soon, in the user's own time zone,
// and sends one push per item and device. Each item is sent once: reminder_log
// remembers what went out.

import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { dateForWeekOffset, isWeekOffsetInSeries, keyFromDate, weekOffsetForDate } from './recurrence.ts';
import { reminderText } from './messages.ts';

type Row = Record<string, any>;

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')!, Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);

const DAY = 86_400_000;
const REMINDER_OFF = -1;

/** The wall-clock parts of an instant in a time zone. */
function partsIn(instant: Date, tz: string) {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: tz, hourCycle: 'h23', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
  const p: Record<string, number> = {};
  for (const x of f.formatToParts(instant)) if (x.type !== 'literal') p[x.type] = Number(x.value);
  return p;
}

/** The instant of a calendar day at a wall-clock time in a time zone. */
function localToInstant(day: Date, hour: number, minute: number, tz: string): Date {
  const y = day.getFullYear();
  const m = day.getMonth();
  const d = day.getDate();
  let guess = Date.UTC(y, m, d, hour, minute);
  for (let i = 0; i < 2; i++) {
    const p = partsIn(new Date(guess), tz);
    const asUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
    guess = Date.UTC(y, m, d, hour, minute) - (asUtc - guess);
  }
  return new Date(guess);
}

/** The calendar days around now in the user's time zone (yesterday to tomorrow). */
function daysAround(now: Date, tz: string): Date[] {
  const p = partsIn(now, tz);
  const today = new Date(p.year, p.month - 1, p.day);
  return [-1, 0, 1].map((i) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + i));
}

const pad = (n: number) => n.toString().padStart(2, '0');

Deno.serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) {
    return new Response('forbidden', { status: 403 });
  }
  const now = new Date();
  const { data: subs, error } = await supabase.from('push_subscriptions').select('*');
  if (error) return new Response(error.message, { status: 500 });

  const byUser = new Map<string, Row[]>();
  for (const s of subs ?? []) byUser.set(s.user_id, [...(byUser.get(s.user_id) ?? []), s]);

  let sent = 0;
  for (const [userId, userSubs] of byUser) {
    const prefs = userSubs[0];
    const tz: string = prefs.time_zone || 'UTC';
    const days = daysAround(now, tz);
    const minDate = keyFromDate(days[0]);
    const maxDate = keyFromDate(days[days.length - 1]);
    const minWeek = weekOffsetForDate(days[0]);
    const maxWeek = weekOffsetForDate(days[days.length - 1]);

    // Blocks: plain ones in these weeks, and recurring series that reach them.
    const [plain, series, exceptions, assignments] = await Promise.all([
      supabase.from('blocks').select('*').eq('user_id', userId).eq('is_recurring', false).gte('week_offset', minWeek).lte('week_offset', maxWeek),
      supabase.from('blocks').select('*').eq('user_id', userId).eq('is_recurring', true).lte('week_offset', maxWeek).or(`recurrence_end_date.is.null,recurrence_end_date.gte.${minDate}`),
      supabase.from('block_exceptions').select('block_id, occurrence_week_offset').eq('user_id', userId).then(
        (r) => r,
        () => ({ data: [] as Row[] }),
      ),
      supabase.from('shift_assignments').select('id, shift_id, shift_date, shift:shifts(*)').eq('user_id', userId).gte('shift_date', minDate).lte('shift_date', maxDate),
    ]);
    const skipped = new Set<string>();
    for (const ex of exceptions.data ?? []) skipped.add(`${ex.block_id}:${ex.occurrence_week_offset}`);

    type Item = { key: string; startsAt: Date; title: string; reminder: number | null; kind: 'event' | 'shift' };
    const items: Item[] = [];
    for (const day of days) {
      const week = weekOffsetForDate(day);
      const dow = (day.getDay() + 6) % 7;
      for (const b of plain.data ?? []) {
        if (b.week_offset !== week || b.day_of_week !== dow) continue;
        items.push({ key: `b:${b.id}:${keyFromDate(day)}`, startsAt: localToInstant(day, b.start_hour, b.start_minute, tz), title: b.title, reminder: b.reminder_minutes, kind: 'event' });
      }
      for (const b of series.data ?? []) {
        if (b.day_of_week !== dow || skipped.has(`${b.id}:${week}`)) continue;
        if (!isWeekOffsetInSeries(b, week)) continue;
        items.push({ key: `b:${b.id}:${keyFromDate(day)}`, startsAt: localToInstant(day, b.start_hour, b.start_minute, tz), title: b.title, reminder: b.reminder_minutes, kind: 'event' });
      }
    }
    for (const a of assignments.data ?? []) {
      const shift = a.shift as Row;
      if (!shift) continue;
      const [y, m, d] = String(a.shift_date).split('-').map(Number);
      items.push({ key: `s:${a.id}`, startsAt: localToInstant(new Date(y, m - 1, d), shift.start_hour, shift.start_minute, tz), title: shift.title, reminder: shift.reminder_minutes, kind: 'shift' });
    }

    // Only what is due now and not sent yet.
    const since = new Date(now.getTime() - 2 * DAY).toISOString();
    const { data: logged } = await supabase.from('reminder_log').select('item_key, starts_at').eq('user_id', userId).gte('starts_at', since);
    const done = new Set((logged ?? []).map((r) => `${r.item_key}|${r.starts_at}`));

    for (const item of items) {
      if (item.reminder === REMINDER_OFF) continue;
      if (item.kind === 'event' && !prefs.notify_events) continue;
      if (item.kind === 'shift' && !prefs.notify_shifts) continue;
      const leadMinutes = item.reminder ?? prefs.lead_minutes ?? 10;
      const dueFrom = item.startsAt.getTime() - leadMinutes * 60_000;
      if (now.getTime() < dueFrom || now.getTime() >= item.startsAt.getTime()) continue;
      const startsIso = item.startsAt.toISOString();
      if (done.has(`${item.key}|${startsIso}`)) continue;

      const time = `${pad(partsIn(item.startsAt, tz).hour)}:${pad(partsIn(item.startsAt, tz).minute)}`;
      const payload = JSON.stringify({ title: item.title, body: reminderText(prefs.locale ?? 'en', time), tag: item.key, url: '/dashboard' });

      for (const sub of userSubs) {
        try {
          await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload, { TTL: 3600 });
          sent++;
        } catch (err) {
          const status = (err as { statusCode?: number }).statusCode;
          // The browser dropped this subscription: forget it.
          if (status === 404 || status === 410) await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
        }
      }
      await supabase.from('reminder_log').upsert({ user_id: userId, item_key: item.key, starts_at: startsIso }, { onConflict: 'user_id,item_key,starts_at', ignoreDuplicates: true });
    }
  }
  return Response.json({ sent, users: byUser.size });
});
