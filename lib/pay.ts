// Earnings and weekly overtime for the week and month summaries. Pay comes
// from shifts only. The rules are stored on this device (localStorage), like
// the accent and the default view, so they never leave it.

import { useEffect, useState } from 'react';

export const PAY_STORAGE_KEY = 'slate-pay';

export interface PayRules {
  /** null = no earnings shown. */
  hourlyRate: number | null;
  currency: string;
  /** null = no overtime. */
  overtimeAfterHours: number | null;
  overtimeMultiplier: number;
}

export const DEFAULT_PAY: PayRules = { hourlyRate: null, currency: '', overtimeAfterHours: null, overtimeMultiplier: 1.5 };

export function loadPayRules(): PayRules {
  try {
    const raw = localStorage.getItem(PAY_STORAGE_KEY);
    if (!raw) return DEFAULT_PAY;
    const p = JSON.parse(raw) as Partial<PayRules>;
    return {
      hourlyRate: typeof p.hourlyRate === 'number' && p.hourlyRate >= 0 ? p.hourlyRate : null,
      currency: typeof p.currency === 'string' ? p.currency.slice(0, 4) : '',
      overtimeAfterHours: typeof p.overtimeAfterHours === 'number' && p.overtimeAfterHours >= 1 ? p.overtimeAfterHours : null,
      overtimeMultiplier: typeof p.overtimeMultiplier === 'number' && p.overtimeMultiplier >= 1 ? p.overtimeMultiplier : 1.5,
    };
  } catch {
    return DEFAULT_PAY;
  }
}

const CHANGE_EVENT = 'slate-pay-change';

export function savePayRules(rules: PayRules) {
  try {
    localStorage.setItem(PAY_STORAGE_KEY, JSON.stringify(rules));
  } catch {
    // Storage unavailable: the rules last for this visit only.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

/** The stored rules, kept in step across every component that shows them. */
export function usePayRules(): [PayRules, (next: PayRules) => void] {
  const [rules, setRules] = useState<PayRules>(DEFAULT_PAY);
  useEffect(() => {
    const reload = () => setRules(loadPayRules());
    reload();
    window.addEventListener(CHANGE_EVENT, reload);
    return () => window.removeEventListener(CHANGE_EVENT, reload);
  }, []);
  return [rules, savePayRules];
}

export interface WeekMinutes {
  /** Monday of the week, 'yyyy-MM-dd'. */
  weekStart: string;
  minutes: number;
}

/** The Monday of the week that holds a 'yyyy-MM-dd' day. Calendar arithmetic only, no time zones. */
export function mondayOf(dayKey: string): string {
  const [y, m, d] = dayKey.split('-').map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  const back = (date.getUTCDay() + 6) % 7;
  date.setUTCDate(date.getUTCDate() - back);
  return date.toISOString().slice(0, 10);
}

export interface PayTotals {
  regularMinutes: number;
  overtimeMinutes: number;
  /** null when no hourly rate is set. Rounded to cents. */
  amount: number | null;
}

export function computePay(weeks: WeekMinutes[], rules: PayRules): PayTotals {
  const limit = rules.overtimeAfterHours === null ? Infinity : rules.overtimeAfterHours * 60;
  let regularMinutes = 0;
  let overtimeMinutes = 0;
  let amount = 0;
  for (const week of weeks) {
    const regular = Math.min(week.minutes, limit);
    const overtime = week.minutes - regular;
    regularMinutes += regular;
    overtimeMinutes += overtime;
    if (rules.hourlyRate !== null) {
      amount += (regular / 60) * rules.hourlyRate + (overtime / 60) * rules.hourlyRate * rules.overtimeMultiplier;
    }
  }
  return { regularMinutes, overtimeMinutes, amount: rules.hourlyRate === null ? null : Math.round(amount * 100) / 100 };
}

/** Groups shift minutes by their Monday. */
export function weeksOf(shifts: { shift_date: string; minutes: number }[]): WeekMinutes[] {
  const byWeek = new Map<string, number>();
  for (const s of shifts) {
    const w = mondayOf(s.shift_date);
    byWeek.set(w, (byWeek.get(w) ?? 0) + s.minutes);
  }
  return [...byWeek].map(([weekStart, minutes]) => ({ weekStart, minutes }));
}

/** "1 234,50 €" in the page's language; the currency is optional. */
export function formatMoney(amount: number, currency: string, locale: string): string {
  const number = new Intl.NumberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
  return currency ? `${number} ${currency}` : number;
}
