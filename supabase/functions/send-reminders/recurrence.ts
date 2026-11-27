import { addWeeks, addDays, addMonths, startOfMonth, endOfMonth, isAfter } from 'npm:date-fns@4';

/**
 * Slate stores a recurring block as ONE row (a "series root") carrying a
 * template (title, time, category...) plus a recurrence rule, instead of one
 * row per occurrence. Everything in this file is pure date math shared by the
 * client hooks, the month view, and the Google Calendar sync route - no
 * 'use client' directive, safe to import from server code too.
 */

export interface SeriesLike {
  week_offset: number; // weeks since EPOCH_WEEK_START, not relative to today
  day_of_week: number; // 0 = Monday ... 6 = Sunday, matching the rest of the app
  is_recurring?: boolean;
  recurrence_type?: 'weekly' | 'monthly' | null;
  recurrence_end_date?: string | null;
}

// Safety cap so an indefinite series can't be enumerated forever - about 2
// years of weekly occurrences, more than enough for any practical use here.
const MAX_OCCURRENCES = 104;

/**
 * Stored week offsets (`blocks.week_offset`, `block_exceptions.occurrence_week_offset`)
 * count whole weeks from this fixed Monday, so a stored value names the same
 * real week for ever. They used to be relative to "the current week", which
 * made every stored event slide forward a week each Monday.
 *
 * Changing this constant moves every stored event: don't.
 */
export const EPOCH_WEEK_START = '2024-01-01'; // a Monday

const MS_PER_DAY = 86_400_000;
const EPOCH_DAY = Date.UTC(2024, 0, 1) / MS_PER_DAY;

/**
 * Dates in this file are "calendar days": a Date at local midnight, read back
 * only through its local year/month/day. Counting days through UTC keeps the
 * arithmetic exact across daylight-saving changes and gives the same answer
 * whatever time zone the code runs in.
 */
function dayNumber(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / MS_PER_DAY;
}

function dateFromDayNumber(day: number): Date {
  const utc = new Date(day * MS_PER_DAY);
  return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
}

/** A calendar day from 'yyyy-MM-dd' (`new Date('yyyy-MM-dd')` would be UTC midnight instead). */
export function dateFromKey(key: string): Date {
  const [y, m, d] = key.slice(0, 10).split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 'yyyy-MM-dd' of a calendar day (`toISOString()` would shift it by the zone offset). */
export function keyFromDate(date: Date): string {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The stored week offset of the (Monday-first) week containing this calendar day. */
export function weekOffsetForDate(date: Date): number {
  return Math.floor((dayNumber(date) - EPOCH_DAY) / 7);
}

/** The calendar day a stored (week_offset, day_of_week) pair names. Does not depend on today's date. */
export function dateForWeekOffset(weekOffset: number, dayOfWeek: number): Date {
  return dateFromDayNumber(EPOCH_DAY + weekOffset * 7 + dayOfWeek);
}

/**
 * Today as a calendar day. Pass a time zone on the server, whose own clock
 * zone (UTC on Vercel) is not the user's: around midnight the two disagree
 * about which day, and on a Sunday night about which week, it is.
 */
export function today(timeZone?: string, now: Date = new Date()): Date {
  if (!timeZone) return new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(now)
    .reduce<Record<string, string>>((acc, part) => ({ ...acc, [part.type]: part.value }), {});
  return new Date(Number(parts.year), Number(parts.month) - 1, Number(parts.day));
}

/** The stored week offset of the week containing today. */
export function currentWeekOffset(timeZone?: string, now: Date = new Date()): number {
  return weekOffsetForDate(today(timeZone, now));
}

/** From the navigation offset of `useWeek` (0 = the week containing today) to a stored offset. */
export function storedOffsetFromView(viewOffset: number, now: Date = new Date()): number {
  return currentWeekOffset(undefined, now) + viewOffset;
}

/** From a stored offset to the navigation offset of `useWeek` (0 = the week containing today). */
export function viewOffsetFromStored(storedOffset: number, now: Date = new Date()): number {
  return storedOffset - currentWeekOffset(undefined, now);
}

/** 1-5: which occurrence of its weekday this date is within its month (e.g. 2nd Tuesday = 2). */
export function weekdayPositionInMonth(date: Date): number {
  return Math.ceil(date.getDate() / 7);
}

/** The Nth (1-4) occurrence of `isoWeekday` (0=Mon..6=Sun) in the given month, or the last if `last`. */
export function nthWeekdayOfMonth(
  year: number,
  monthIndex0: number,
  isoWeekday: number,
  position: number,
  last: boolean
): Date {
  if (last) {
    const end = endOfMonth(new Date(year, monthIndex0, 1));
    const endIso = (end.getDay() + 6) % 7;
    const diff = (endIso - isoWeekday + 7) % 7;
    return addDays(end, -diff);
  }
  const first = startOfMonth(new Date(year, monthIndex0, 1));
  const firstIso = (first.getDay() + 6) % 7;
  const offsetToFirstTarget = (isoWeekday - firstIso + 7) % 7;
  return addDays(first, offsetToFirstTarget + (position - 1) * 7);
}

/**
 * Every occurrence date of a series, including the first. For a non-recurring
 * block this is just its own single date.
 *
 * Monthly recurrence means "the same weekday-position every month" (e.g. the
 * 2nd Wednesday) - if the series started on a 5th-occurrence date (not every
 * month has one), it's treated as "the last such weekday" each month after,
 * which is the standard interpretation (matches how Google Calendar itself
 * handles a 5th-occurrence monthly rule).
 */
export function getSeriesOccurrenceDates(series: SeriesLike): Date[] {
  const startDate = dateForWeekOffset(series.week_offset, series.day_of_week);
  if (!series.is_recurring) return [startDate];

  const endDate = series.recurrence_end_date ? dateFromKey(series.recurrence_end_date) : null;
  const dates: Date[] = [];

  if (series.recurrence_type === 'monthly') {
    const position = weekdayPositionInMonth(startDate);
    const last = position === 5;
    for (let i = 0; i < MAX_OCCURRENCES; i++) {
      const monthAnchor = addMonths(startDate, i);
      const occ = nthWeekdayOfMonth(monthAnchor.getFullYear(), monthAnchor.getMonth(), series.day_of_week, position, last);
      if (endDate && isAfter(occ, endDate)) break;
      dates.push(occ);
    }
  } else {
    // weekly (default)
    for (let i = 0; i < MAX_OCCURRENCES; i++) {
      const occ = addWeeks(startDate, i);
      if (endDate && isAfter(occ, endDate)) break;
      dates.push(occ);
    }
  }

  return dates;
}

export function getSeriesOccurrenceWeekOffsets(series: SeriesLike): number[] {
  return getSeriesOccurrenceDates(series).map(weekOffsetForDate);
}

export function isWeekOffsetInSeries(series: SeriesLike, weekOffset: number): boolean {
  return getSeriesOccurrenceWeekOffsets(series).includes(weekOffset);
}
