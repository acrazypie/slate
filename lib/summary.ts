// The summary's numbers for one period: hours by category and shifts, the
// shifts per week, and the reports the user added. Pure (no UI), so the rules
// are easy to check. Hours count shifts without their unpaid breaks.

import { startOfWeek } from 'date-fns';
import type { Block, BlockCategory, Shift, ShiftAssignment } from './types';
import { CATEGORIES, paidShiftMinutes, shiftDurationMinutes } from './types';
import { dateFromKey, keyFromDate } from './recurrence';
import { computePay, type PayTotals, type WeekMinutes } from './pay';
import type { Period } from './summaryRange';
import { periodDays } from './summaryRange';

export type ReportKind = 'hours' | 'counts' | 'overtime' | 'pay';
export const REPORT_KINDS: ReportKind[] = ['hours', 'counts', 'overtime', 'pay'];

/** A report the user added to the summary. Its numbers are worked out from the period on screen. */
export interface Report {
  id: string;
  kind: ReportKind;
  created_at: string;
}

/** What the period contains: the blocks on each day, and the shifts placed on it. */
export interface PeriodData {
  blocksOn: (day: Date) => Block[];
  assignments: ShiftAssignment[];
}

export interface PaySettings {
  hourlyRate: number | null;
  currency: string;
  overtimeAfterHours: number | null;
  overtimeMultiplier: number;
}

export interface Summary {
  /** Hours counted: blocks plus shifts without their unpaid breaks. */
  total: number;
  byCategory: Record<BlockCategory, number>;
  /** Paid shift minutes (duration minus breaks). */
  shifts: number;
  /** Unpaid break minutes across the shifts in the period. */
  breaks: number;
  /** Paid shift minutes per Monday-to-Sunday week, keyed by that Monday ('yyyy-MM-dd'). */
  shiftsByWeek: Record<string, number>;
}

/** The shifts placed inside the period, by the day they start on. */
function periodAssignments(p: Period, data: PeriodData) {
  const first = keyFromDate(p.start);
  const last = keyFromDate(p.end);
  return data.assignments.filter((a) => a.shift_date >= first && a.shift_date <= last);
}

const weekKey = (dateKey: string) => keyFromDate(startOfWeek(dateFromKey(dateKey), { weekStartsOn: 1 }));

export function summarizePeriod(p: Period, data: PeriodData): Summary {
  const byCategory: Record<BlockCategory, number> = { studio: 0, lavoro: 0, lezione: 0, altro: 0 };
  for (const day of periodDays(p)) {
    for (const b of data.blocksOn(day)) byCategory[b.category] += b.duration_minutes;
  }
  let shifts = 0;
  let breaks = 0;
  const shiftsByWeek: Record<string, number> = {};
  for (const a of periodAssignments(p, data)) {
    const paid = paidShiftMinutes(a.shift);
    shifts += paid;
    breaks += Math.min(a.shift.break_minutes ?? 0, shiftDurationMinutes(a.shift));
    const week = weekKey(a.shift_date);
    shiftsByWeek[week] = (shiftsByWeek[week] ?? 0) + paid;
  }
  const total = CATEGORIES.reduce((sum, c) => sum + byCategory[c], 0) + shifts;
  return { total, byCategory, shifts, breaks, shiftsByWeek };
}

export interface ShiftLine {
  shiftId: string;
  title: string;
  color: string;
  /** Paid minutes (hours report) or days (counts report). */
  value: number;
}

export type ReportResult =
  | { kind: 'hours'; lines: ShiftLine[]; totalMinutes: number }
  | { kind: 'counts'; lines: ShiftLine[]; totalDays: number }
  | { kind: 'overtime'; regularMinutes: number; overtimeMinutes: number; overtimeAmount: number | null }
  | { kind: 'pay'; amount: number | null; regularMinutes: number; overtimeMinutes: number };

function byShift(
  assignments: ShiftAssignment[],
  value: (a: ShiftAssignment) => number,
): ShiftLine[] {
  const lines = new Map<string, ShiftLine>();
  for (const a of assignments) {
    const s: Shift = a.shift;
    const line = lines.get(s.id) ?? { shiftId: s.id, title: s.title, color: s.color, value: 0 };
    line.value += value(a);
    lines.set(s.id, line);
  }
  return [...lines.values()].sort((x, y) => y.value - x.value || x.title.localeCompare(y.title));
}

function weeklyMinutes(assignments: ShiftAssignment[]): WeekMinutes[] {
  const weeks: Record<string, number> = {};
  for (const a of assignments) {
    const key = weekKey(a.shift_date);
    weeks[key] = (weeks[key] ?? 0) + paidShiftMinutes(a.shift);
  }
  return Object.entries(weeks).map(([weekStart, minutes]) => ({ weekStart, minutes }));
}

/** The numbers of one report for the period. Overtime and pay use the device's pay rules. */
export function reportFor(kind: ReportKind, p: Period, data: PeriodData, pay: PaySettings): ReportResult {
  const assignments = periodAssignments(p, data);
  switch (kind) {
    case 'hours': {
      const lines = byShift(assignments, (a) => paidShiftMinutes(a.shift));
      return { kind, lines, totalMinutes: lines.reduce((m, l) => m + l.value, 0) };
    }
    case 'counts': {
      const lines = byShift(assignments, () => 1);
      return { kind, lines, totalDays: lines.reduce((d, l) => d + l.value, 0) };
    }
    case 'overtime': {
      const totals: PayTotals = computePay(weeklyMinutes(assignments), pay);
      const overtimeAmount =
        pay.hourlyRate === null
          ? null
          : Math.round((totals.overtimeMinutes / 60) * pay.hourlyRate * pay.overtimeMultiplier * 100) / 100;
      return { kind, regularMinutes: totals.regularMinutes, overtimeMinutes: totals.overtimeMinutes, overtimeAmount };
    }
    case 'pay': {
      const totals = computePay(weeklyMinutes(assignments), pay);
      return { kind, amount: totals.amount, regularMinutes: totals.regularMinutes, overtimeMinutes: totals.overtimeMinutes };
    }
  }
}

/** "1 234,50 €" style money for the device's locale. */
export function formatMoney(amount: number, currency: string, locale: string): string {
  const number = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  return currency ? `${number} ${currency}` : number;
}
