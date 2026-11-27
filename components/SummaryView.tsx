'use client';

// The Summary tab: the period from Settings (this week or month, or the other
// period kinds), its hours and earnings, and the reports the user added.

import { useMemo, useState } from 'react';
import { Download, Plus, X } from 'lucide-react';
import { PdfExportSheet } from './PdfExportSheet';
import { useI18n } from './LanguageProvider';
import { Dialog } from './Dialog';
import { usePeriodData } from '@/hooks/usePeriodData';
import { useReports, useSummaryRange } from '@/lib/summaryStore';
import { periodFor, type RangeKind } from '@/lib/summaryRange';
import { summarizePeriod, reportFor, formatMoney, REPORT_KINDS, type ReportKind, type ReportResult, type Report } from '@/lib/summary';
import { computePay, usePayRules, type WeekMinutes } from '@/lib/pay';
import { CATEGORIES, CATEGORY_COLORS, SHIFT_DEFAULT_COLOR } from '@/lib/types';
import { formatDayRange } from '@/lib/i18n/format';

const hours = (minutes: number) => `${Math.round((minutes / 60) * 10) / 10}`;
export const duration = (minutes: number) => {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
};

const REPORT_TEXT: Record<ReportKind, 'reportHours' | 'reportCounts' | 'reportOvertime' | 'reportPay'> = {
  hours: 'reportHours',
  counts: 'reportCounts',
  overtime: 'reportOvertime',
  pay: 'reportPay',
};

export function SummaryView({ onOpenSettings }: { onOpenSettings: () => void }) {
  const { t, locale } = useI18n();
  const [range, setRange] = useSummaryRange();
  const { reports, add, remove } = useReports();
  const [pay] = usePayRules();
  const [adding, setAdding] = useState(false);
  const [exporting, setExporting] = useState(false);

  const period = useMemo(() => periodFor(range, new Date()), [range]);
  const { data } = usePeriodData(period);
  const s = useMemo(() => summarizePeriod(period, data), [period, data]);
  const label = formatDayRange(locale, period.start, period.end);

  const chipLabel: Record<RangeKind, string> = {
    week: t.summary.thisWeek,
    month: t.summary.thisMonth,
    twoWeeks: t.settingsSummary.rangeTwoWeeks,
    year: t.settingsSummary.rangeYear,
    custom: t.settingsSummary.rangeCustom,
  };

  const segments = [
    ...CATEGORIES.map((c) => ({ key: c, name: t.categories[c], color: CATEGORY_COLORS[c], minutes: s.byCategory[c] })),
    { key: 'shifts', name: t.common.shifts, color: SHIFT_DEFAULT_COLOR, minutes: s.shifts },
  ].filter((seg) => seg.minutes > 0);

  const earnings =
    pay.hourlyRate !== null && s.shifts > 0
      ? computePay(
          Object.entries(s.shiftsByWeek).map(([weekStart, minutes]): WeekMinutes => ({ weekStart, minutes })),
          pay,
        ).amount
      : null;

  const chip = (active: boolean) =>
    `px-3 h-9 rounded-xl text-sm transition-colors ${active ? 'bg-accent text-accent-contrast font-medium' : 'bg-surface-hover text-text-primary hover:bg-border'}`;

  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-8">
        <h1 className="font-semibold tracking-tight text-2xl sm:text-3xl text-text-primary">{t.summary.title}</h1>

        <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t.summaryUi.range}>
          {(['week', 'month'] as const).map((kind) => (
            <button
              key={kind}
              type="button"
              aria-pressed={range.kind === kind}
              onClick={() => setRange({ ...range, kind })}
              className={chip(range.kind === kind)}
            >
              {kind === 'week' ? t.summary.thisWeek : t.summary.thisMonth}
            </button>
          ))}
          {range.kind !== 'week' && range.kind !== 'month' && <span className={chip(true)}>{chipLabel[range.kind]}</span>}
        </div>

        <div className="flex items-center justify-between gap-3">
          <span className="text-sm text-text-secondary">{label}</span>
          <button type="button" onClick={onOpenSettings} className="text-sm text-accent-text hover:underline">
            {t.summaryUi.change}
          </button>
        </div>

        <section className="rounded-3xl bg-surface p-5">
          <p className="text-sm text-text-secondary">{t.summaryUi.total}</p>
          <p className="mt-1 text-4xl font-semibold tabular-nums text-text-primary">
            {hours(s.total)}
            <span className="text-lg text-text-secondary ml-1">h</span>
          </p>

          {s.total === 0 ? (
            <p className="mt-4 text-sm text-text-secondary">{t.summary.empty}</p>
          ) : (
            <div className="mt-5">
              <div className="flex h-3 rounded-full overflow-hidden bg-surface-hover" role="img" aria-label={segments.map((seg) => `${seg.name} ${duration(seg.minutes)}`).join(', ')}>
                {segments.map((seg) => (
                  <span key={seg.key} style={{ backgroundColor: seg.color, flexGrow: seg.minutes }} />
                ))}
              </div>
              <ul className="mt-4 space-y-2">
                {segments.map((seg) => (
                  <li key={seg.key} className="flex items-center gap-3 text-sm">
                    <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: seg.color }} />
                    <span className="flex-1 text-text-primary">{seg.name}</span>
                    <span className="tabular-nums text-text-secondary">{duration(seg.minutes)}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {earnings !== null && (
            <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-3">
              <div>
                <p className="text-sm text-text-primary">{t.pay.earnings}</p>
                <p className="text-xs text-text-tertiary">{t.summaryUi.earningsHint}</p>
              </div>
              <span className="text-lg font-semibold tabular-nums text-text-primary">{formatMoney(earnings, pay.currency, locale)}</span>
            </div>
          )}
          {pay.hourlyRate === null && s.shifts > 0 && (
            <p className="mt-4 text-xs text-text-tertiary">{t.summaryUi.noRate}</p>
          )}
        </section>

        <section>
          <h2 className="text-sm text-text-secondary mb-3">{t.summaryUi.reports}</h2>
          {reports.length === 0 ? (
            <p className="text-sm text-text-tertiary">{t.summaryUi.noReports}</p>
          ) : (
            <div className="space-y-3">
              {reports.map((r) => (
                <ReportCard
                  key={r.id}
                  report={r}
                  result={reportFor(r.kind, period, data, pay)}
                  onRemove={() => remove(r.id)}
                />
              ))}
            </div>
          )}
          <button
            type="button"
            onClick={() => setAdding(true)}
            className="mt-4 flex items-center gap-2 h-11 px-4 rounded-xl bg-surface-hover text-text-primary text-sm font-medium hover:bg-border transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.summaryUi.addReport}
          </button>
          <button
            type="button"
            onClick={() => setExporting(true)}
            className="mt-3 ml-0 sm:ml-3 flex items-center gap-2 h-11 px-4 rounded-xl text-accent-text text-sm font-medium hover:bg-surface-hover transition-colors"
          >
            <Download className="w-4 h-4" />
            {t.summaryUi.exportPdf}
          </button>
        </section>
      </div>

      {exporting && <PdfExportSheet period={period} data={data} onClose={() => setExporting(false)} />}

      {adding && (
        <Dialog label={t.summaryUi.pickReport} onClose={() => setAdding(false)} size="sheet">
          <h2 className="text-lg font-semibold text-text-primary mb-4">{t.summaryUi.pickReport}</h2>
          <ul className="space-y-2">
            {REPORT_KINDS.map((kind) => (
              <li key={kind}>
                <button
                  type="button"
                  onClick={() => {
                    add(kind);
                    setAdding(false);
                  }}
                  className="w-full text-left rounded-xl bg-surface-hover px-4 py-3 hover:bg-border transition-colors"
                >
                  <span className="block text-sm font-medium text-text-primary">{t.summaryUi[REPORT_TEXT[kind]]}</span>
                  <span className="block text-xs text-text-secondary mt-0.5">{t.summaryUi[`${REPORT_TEXT[kind]}Hint` as 'reportHoursHint']}</span>
                </button>
              </li>
            ))}
          </ul>
        </Dialog>
      )}
    </div>
  );
}

function ReportCard({ report, result, onRemove }: { report: Report; result: ReportResult; onRemove: () => void }) {
  const { t, locale } = useI18n();
  const title = t.summaryUi[REPORT_TEXT[report.kind]];
  return (
    <article className="rounded-2xl bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium text-text-primary">{title}</h3>
          <p className="text-xs text-text-tertiary">{t.summaryUi[`${REPORT_TEXT[report.kind]}Hint` as 'reportHoursHint']}</p>
        </div>
        <button type="button" onClick={onRemove} aria-label={t.summaryUi.removeReport} className="w-8 h-8 flex items-center justify-center rounded-lg text-text-secondary hover:bg-surface-hover">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3">
        {result.kind === 'hours' && (
          <ul className="space-y-2">
            {result.lines.map((line) => (
              <li key={line.shiftId} className="flex items-center gap-3 text-sm">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: line.color }} />
                <span className="flex-1 text-text-primary">{line.title}</span>
                <span className="tabular-nums text-text-secondary">{duration(line.value)}</span>
              </li>
            ))}
            <li className="flex items-center gap-3 text-sm border-t border-border pt-2">
              <span className="flex-1 text-text-secondary">{t.summaryUi.total}</span>
              <span className="tabular-nums text-text-primary">{duration(result.totalMinutes)}</span>
            </li>
          </ul>
        )}
        {result.kind === 'counts' && (
          <ul className="space-y-2">
            {result.lines.map((line) => (
              <li key={line.shiftId} className="flex items-center gap-3 text-sm">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: line.color }} />
                <span className="flex-1 text-text-primary">{line.title}</span>
                <span className="tabular-nums text-text-secondary">{line.value} {t.summaryUi.days}</span>
              </li>
            ))}
            <li className="flex items-center gap-3 text-sm border-t border-border pt-2">
              <span className="flex-1 text-text-secondary">{t.summaryUi.total}</span>
              <span className="tabular-nums text-text-primary">{result.totalDays} {t.summaryUi.days}</span>
            </li>
          </ul>
        )}
        {result.kind === 'overtime' && (
          <div className="space-y-2 text-sm">
            <p className="flex justify-between"><span className="text-text-secondary">{t.summaryUi.regular}</span><span className="tabular-nums">{duration(result.regularMinutes)}</span></p>
            <p className="flex justify-between"><span className="text-text-secondary">{t.summaryUi.overtimeLabel}</span><span className="tabular-nums">{duration(result.overtimeMinutes)}</span></p>
            {result.overtimeAmount !== null && (
              <p className="flex justify-between"><span className="text-text-secondary">{t.pay.earnings}</span><span className="tabular-nums">{formatMoney(result.overtimeAmount, '', locale)}</span></p>
            )}
          </div>
        )}
        {result.kind === 'pay' && (
          <div className="space-y-2 text-sm">
            {result.amount !== null ? (
              <p className="text-2xl font-semibold tabular-nums text-text-primary">{formatMoney(result.amount, '', locale)}</p>
            ) : (
              <p className="text-text-secondary">{t.summaryUi.noRate}</p>
            )}
            <p className="flex justify-between"><span className="text-text-secondary">{t.summaryUi.regular}</span><span className="tabular-nums">{duration(result.regularMinutes)}</span></p>
            <p className="flex justify-between"><span className="text-text-secondary">{t.summaryUi.overtimeLabel}</span><span className="tabular-nums">{duration(result.overtimeMinutes)}</span></p>
          </div>
        )}
      </div>
    </article>
  );
}

