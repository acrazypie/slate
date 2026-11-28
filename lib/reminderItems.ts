'use client';

// The reminder items this browser uploads: its blocks and shifts that start in
// the next two weeks, with the lead time and kind the reminder settings choose.
// Times are this device's local time, so the server never needs a time zone.

import { db } from './localDb';
import { getSeriesOccurrenceDates, weekOffsetForDate, keyFromDate } from './recurrence';
import { getLeadMinutes, getNotifySettings, REMINDER_OFF } from './reminders';

export type ReminderItem = {
  key: string;
  kind: 'event' | 'shift';
  title: string;
  timeLabel: string;
  startsAt: string;
  lead: number;
};

const DAYS_AHEAD = 14;
const pad = (n: number) => n.toString().padStart(2, '0');

export async function buildReminderItems(now: Date = new Date()): Promise<ReminderItem[]> {
  const notify = getNotifySettings();
  const defaultLead = getLeadMinutes();
  const horizon = now.getTime() + DAYS_AHEAD * 86_400_000;
  const items: ReminderItem[] = [];

  if (notify.events) {
    const [{ data: blocks }, { data: exceptions }] = await Promise.all([db.from('blocks').select('*'), db.from('block_exceptions').select('*')]);
    const skipped = new Set((exceptions ?? []).map((e: Record<string, any>) => `${e.block_id}:${e.occurrence_week_offset}`));
    for (const block of blocks ?? []) {
      if (block.reminder_minutes === REMINDER_OFF) continue;
      for (const day of getSeriesOccurrenceDates(block)) {
        const startsAt = new Date(day.getFullYear(), day.getMonth(), day.getDate(), block.start_hour, block.start_minute);
        if (startsAt.getTime() <= now.getTime() || startsAt.getTime() > horizon) continue;
        if (skipped.has(`${block.id}:${weekOffsetForDate(day)}`)) continue;
        items.push({
          key: `b:${block.id}:${keyFromDate(day)}`,
          kind: 'event',
          title: block.title,
          timeLabel: `${pad(block.start_hour)}:${pad(block.start_minute)}`,
          startsAt: startsAt.toISOString(),
          lead: block.reminder_minutes ?? defaultLead,
        });
      }
    }
  }

  if (notify.shifts) {
    const [{ data: shifts }, { data: assignments }] = await Promise.all([db.from('shifts').select('*'), db.from('shift_assignments').select('*')]);
    const byId = new Map<string, Record<string, any>>((shifts ?? []).map((s: Record<string, any>) => [s.id, s]));
    for (const a of assignments ?? []) {
      const shift = byId.get(a.shift_id);
      if (!shift || shift.reminder_minutes === REMINDER_OFF) continue;
      const [y, m, d] = String(a.shift_date).split('-').map(Number);
      const startsAt = new Date(y, m - 1, d, shift.start_hour, shift.start_minute);
      if (startsAt.getTime() <= now.getTime() || startsAt.getTime() > horizon) continue;
      items.push({
        key: `s:${a.id}`,
        kind: 'shift',
        title: shift.title,
        timeLabel: `${pad(shift.start_hour)}:${pad(shift.start_minute)}`,
        startsAt: startsAt.toISOString(),
        lead: shift.reminder_minutes ?? defaultLead,
      });
    }
  }

  return items;
}
