'use client';

// Settings > Summary period: which days the summary covers.

import { useI18n } from './LanguageProvider';
import { useSummaryRange } from '@/lib/summaryStore';
import type { RangeKind, SummaryRange } from '@/lib/summaryRange';
import { weekdayNames } from '@/lib/i18n/format';
import { keyFromDate } from '@/lib/recurrence';

const KINDS: RangeKind[] = ['week', 'twoWeeks', 'month', 'year', 'custom'];
const field = 'w-full rounded-lg bg-surface-hover px-3 py-2 text-sm text-text-primary';
const chip = (active: boolean) =>
  `px-3 h-9 rounded-xl text-sm transition-colors ${active ? 'bg-accent text-accent-contrast font-medium' : 'bg-surface-hover text-text-primary hover:bg-border'}`;

export function SummaryRangeSettings() {
  const { t, locale } = useI18n();
  const [range, setRange] = useSummaryRange();
  const set = (patch: Partial<SummaryRange>) => setRange({ ...range, ...patch });
  const weekdays = weekdayNames(locale);
  const months = Array.from({ length: 12 }, (_, i) => new Intl.DateTimeFormat(locale, { month: 'long' }).format(new Date(2024, i, 1)));
  const labels: Record<RangeKind, string> = {
    week: t.settingsSummary.rangeWeek,
    twoWeeks: t.settingsSummary.rangeTwoWeeks,
    month: t.settingsSummary.rangeMonth,
    year: t.settingsSummary.rangeYear,
    custom: t.settingsSummary.rangeCustom,
  };
  const today = keyFromDate(new Date());

  return (
    <div className="space-y-4">
      <div role="group" aria-label={t.settingsSummary.kind} className="flex flex-wrap gap-2">
        {KINDS.map((kind) => (
          <button key={kind} type="button" aria-pressed={range.kind === kind} onClick={() => set({ kind })} className={chip(range.kind === kind)}>
            {labels[kind]}
          </button>
        ))}
      </div>

      {(range.kind === 'week' || range.kind === 'twoWeeks') && (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-text-secondary">{t.settingsSummary.startsOn}</span>
            <select className={`${field} mt-1`} value={range.weekday} onChange={(e) => set({ weekday: Number(e.target.value) })}>
              {weekdays.map((name, i) => (
                <option key={name} value={i}>{name}</option>
              ))}
            </select>
          </label>
          {range.kind === 'twoWeeks' && (
            <label className="block">
              <span className="text-sm text-text-secondary">{t.settingsSummary.fortnightWeek}</span>
              <select className={`${field} mt-1`} value={range.fortnightWeek} onChange={(e) => set({ fortnightWeek: Number(e.target.value) as 1 | 2 })}>
                <option value={1}>{t.settingsSummary.weekOne}</option>
                <option value={2}>{t.settingsSummary.weekTwo}</option>
              </select>
            </label>
          )}
        </div>
      )}

      {range.kind === 'month' && (
        <label className="block">
          <span className="text-sm text-text-secondary">{t.settingsSummary.startDay}</span>
          <select className={`${field} mt-1`} value={range.monthDay} onChange={(e) => set({ monthDay: Number(e.target.value) })}>
            {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </label>
      )}

      {range.kind === 'year' && (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-text-secondary">{t.settingsSummary.startMonth}</span>
            <select className={`${field} mt-1`} value={range.yearMonth} onChange={(e) => set({ yearMonth: Number(e.target.value) })}>
              {months.map((name, i) => (
                <option key={name} value={i + 1}>{name}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-sm text-text-secondary">{t.settingsSummary.startDay}</span>
            <select className={`${field} mt-1`} value={range.yearDay} onChange={(e) => set({ yearDay: Number(e.target.value) })}>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </label>
        </div>
      )}

      {range.kind === 'custom' && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-sm text-text-secondary">{t.settingsSummary.from}</span>
              <input type="date" className={`${field} mt-1`} value={range.customStart ?? today} onChange={(e) => set({ customStart: e.target.value || null })} />
            </label>
            <label className="block">
              <span className="text-sm text-text-secondary">{t.settingsSummary.to}</span>
              <input type="date" className={`${field} mt-1`} value={range.customEnd ?? range.customStart ?? today} onChange={(e) => set({ customEnd: e.target.value || null })} />
            </label>
          </div>
          <p className="text-xs text-text-tertiary">{t.settingsSummary.customHint}</p>
        </div>
      )}
    </div>
  );
}
