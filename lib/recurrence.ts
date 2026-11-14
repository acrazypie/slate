import {
  startOfWeek,
  addWeeks,
  addDays,
  addMonths,
  startOfMonth,
  endOfMonth,
  differenceInCalendarWeeks,
  isAfter,
} from 'date-fns';

/**
 * Slate stores a recurring block as ONE row (a "series root") carrying a
 * template (title, time, category...) plus a recurrence rule, instead of one
 * row per occurrence. Everything in this file is pure date math shared by the
 * client hooks, the month view, and the Google Calendar sync route - no
 * 'use client' directive, safe to import from server code too.
 */

export interface SeriesLike {
  week_offset: number;
  day_of_week: number; // 0 = Monday ... 6 = Sunday, matching the rest of the app
  is_recurring?: boolean;
  recurrence_type?: 'weekly' | 'monthly' | null;
  recurrence_end_date?: string | null;
}

// Safety cap so an indefinite series can't be enumerated forever - about 2
// years of weekly occurrences, more than enough for any practical use here.
const MAX_OCCURRENCES = 104;

/** week_offset 0 always means "whichever real week contains today", recomputed fresh. */
export function weekOffsetForDate(date: Date): number {
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const targetWeekStart = startOfWeek(date, { weekStartsOn: 1 });
  return differenceInCalendarWeeks(targetWeekStart, thisWeekStart, { weekStartsOn: 1 });
}

/** The real calendar date a (week_offset, day_of_week) pair refers to right now. */
export function dateForWeekOffset(weekOffset: number, dayOfWeek: number): Date {
  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  return addDays(weekStart, dayOfWeek);
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

  const endDate = series.recurrence_end_date ? new Date(series.recurrence_end_date) : null;
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
