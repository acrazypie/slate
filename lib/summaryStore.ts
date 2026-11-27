'use client';

// The summary's period and the reports the user added. Kept on this device, like
// the pay rules: nothing about them is sent to the database.

import { useCallback, useState } from 'react';
import { DEFAULT_SUMMARY_RANGE, type SummaryRange } from './summaryRange';
import type { Report, ReportKind } from './summary';

export const SUMMARY_RANGE_KEY = 'slate-summary-range';
export const SUMMARY_REPORTS_KEY = 'slate-summary-reports';

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage unavailable: the value applies for this visit only.
  }
}

export function useSummaryRange(): [SummaryRange, (next: SummaryRange) => void] {
  const [range, setRange] = useState<SummaryRange>(() => ({ ...DEFAULT_SUMMARY_RANGE, ...read<Partial<SummaryRange>>(SUMMARY_RANGE_KEY, {}) }));
  const save = useCallback((next: SummaryRange) => {
    setRange(next);
    write(SUMMARY_RANGE_KEY, next);
  }, []);
  return [range, save];
}

export function useReports() {
  const [reports, setReports] = useState<Report[]>(() => read<Report[]>(SUMMARY_REPORTS_KEY, []));
  const add = useCallback((kind: ReportKind) => {
    const report: Report = { id: crypto.randomUUID(), kind, created_at: new Date().toISOString() };
    setReports((prev) => {
      const next = [...prev, report];
      write(SUMMARY_REPORTS_KEY, next);
      return next;
    });
  }, []);
  const remove = useCallback((id: string) => {
    setReports((prev) => {
      const next = prev.filter((r) => r.id !== id);
      write(SUMMARY_REPORTS_KEY, next);
      return next;
    });
  }, []);
  return { reports, add, remove };
}
