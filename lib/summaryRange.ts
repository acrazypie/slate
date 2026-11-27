// Which days the summary covers. Pure (no UI), so scripts/test-summary.ts can
// check the rules. The summary always shows the period that contains today,
// except "custom", which is a fixed start and end chosen by the user.
//
// Weekdays are counted from Monday = 0 (the app's convention) to Sunday = 6.

import { addDays, differenceInCalendarDays, getDaysInMonth } from 'date-fns';
import { dateFromKey } from '@/lib/recurrence';

export type RangeKind = 'week' | 'twoWeeks' | 'month' | 'year' | 'custom';

export interface SummaryRange {
  kind: RangeKind;
  /** Week and two-week ranges: the first day, 0 = Monday … 6 = Sunday. */
  weekday: number;
  /** Two-week ranges: whether a period starts on the first or the second week of each fortnight. */
  fortnightWeek: 1 | 2;
  /** Month ranges: the first day of the month, 1–31 (shorter months use their last day). */
  monthDay: number;
  /** Year ranges: the first month, 1–12, and day, 1–31. */
  yearMonth: number;
  yearDay: number;
  /** Custom ranges: 'yyyy-MM-dd' for the first and last day, both inclusive. */
  customStart: string | null;
  customEnd: string | null;
}

export const DEFAULT_SUMMARY_RANGE: SummaryRange = {
  kind: 'month',
  weekday: 0,
  fortnightWeek: 1,
  monthDay: 1,
  yearMonth: 1,
  yearDay: 1,
  customStart: null,
  customEnd: null,
};

export interface Period {
  /** First day, at local midnight. */
  start: Date;
  /** Last day, inclusive, at local midnight. */
  end: Date;
  /** Number of days from start to end, inclusive. */
  days: number;
}

/** A fixed date in the past that fortnights are counted from. A Monday. */
const EPOCH = new Date(2024, 0, 1);

const mondayIndex = (d: Date) => (d.getDay() + 6) % 7;

function startOfWeekday(d: Date, weekday: number): Date {
  return addDays(d, -((mondayIndex(d) - weekday + 7) % 7));
}

/** The date for a day of month, clamped to the month's length (31 in February gives 28 or 29). */
function clampedDate(year: number, month: number, day: number): Date {
  return new Date(year, month, Math.min(day, getDaysInMonth(new Date(year, month, 1))));
}

function period(start: Date, end: Date): Period {
  return { start, end, days: differenceInCalendarDays(end, start) + 1 };
}

export function periodFor(range: SummaryRange, now: Date = new Date()): Period {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  switch (range.kind) {
    case 'week': {
      const start = startOfWeekday(today, range.weekday);
      return period(start, addDays(start, 6));
    }
    case 'twoWeeks': {
      const thisStart = startOfWeekday(today, range.weekday);
      // Weeks since the epoch, of the week that contains today.
      const n = Math.floor(differenceInCalendarDays(thisStart, EPOCH) / 7);
      // Start on the week whose parity matches the choice (0 = first week, 1 = second).
      const wanted = range.fortnightWeek - 1;
      const k = ((n % 2) + 2) % 2 === wanted ? n : n - 1;
      const start = addDays(thisStart, (k - n) * 7);
      return period(start, addDays(start, 13));
    }
    case 'month': {
      const thisMonth = clampedDate(today.getFullYear(), today.getMonth(), range.monthDay);
      const start = today >= thisMonth ? thisMonth : clampedDate(today.getFullYear(), today.getMonth() - 1, range.monthDay);
      const next = clampedDate(start.getFullYear(), start.getMonth() + 1, range.monthDay);
      return period(start, addDays(next, -1));
    }
    case 'year': {
      const thisYear = clampedDate(today.getFullYear(), range.yearMonth - 1, range.yearDay);
      const start = today >= thisYear ? thisYear : clampedDate(today.getFullYear() - 1, range.yearMonth - 1, range.yearDay);
      const next = clampedDate(start.getFullYear() + 1, range.yearMonth - 1, range.yearDay);
      return period(start, addDays(next, -1));
    }
    case 'custom': {
      const a = range.customStart ? dateFromKey(range.customStart) : today;
      const b = range.customEnd ? dateFromKey(range.customEnd) : a;
      return a <= b ? period(a, b) : period(b, a);
    }
  }
}

/** The days in a period, in order. */
export function periodDays(p: Period): Date[] {
  return Array.from({ length: p.days }, (_, i) => addDays(p.start, i));
}

