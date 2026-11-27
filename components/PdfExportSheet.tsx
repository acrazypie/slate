'use client';

// "Export PDF" on the summary: view, range, shifts, what to print, the text in
// the cells, and a four-line header. Options are kept for this visit only.

import { useState } from 'react';
import { Dialog } from './Dialog';
import { useI18n } from './LanguageProvider';
import { useShifts } from '@/hooks/useShifts';
import { buildPdf, type PdfOptions, type PdfText, type PdfView } from '@/lib/pdf';
import type { PeriodData } from '@/lib/summary';
import type { Period } from '@/lib/summaryRange';
import { keyFromDate } from '@/lib/recurrence';
import { formatDayRange } from '@/lib/i18n/format';

type Flags = Pick<PdfOptions, 'events' | 'icon' | 'time' | 'title' | 'notes' | 'breakMinutes' | 'duration' | 'emptyRows' | 'logo' | 'headerDate'>;

const DEFAULT_FLAGS: Flags = {
  events: false,
  icon: true,
  time: true,
  title: true,
  notes: false,
  breakMinutes: false,
  duration: false,
  emptyRows: true,
  logo: true,
  headerDate: false,
};

const chip = (active: boolean) =>
  `px-3 h-9 rounded-xl text-sm transition-colors ${active ? 'bg-accent text-accent-contrast font-medium' : 'bg-surface-hover text-text-primary hover:bg-border'}`;

export function PdfExportSheet({ period, data, onClose }: { period: Period; data: PeriodData; onClose: () => void }) {
  const { t, locale } = useI18n();
  const { shifts } = useShifts();
  const [view, setView] = useState<PdfView>('list');
  /** null = every shift. */
  const [shiftIds, setShiftIds] = useState<string[] | null>(null);
  const [flags, setFlags] = useState<Flags>(DEFAULT_FLAGS);
  const [text, setText] = useState<PdfText>('title');
  const [header, setHeader] = useState<string[]>(['', '', '', '']);
  const [busy, setBusy] = useState(false);
  const [more, setMore] = useState(false);
  const [failed, setFailed] = useState(false);

  const setFlag = (key: keyof Flags, value: boolean) => setFlags((f) => ({ ...f, [key]: value }));
  const included = (id: string) => shiftIds === null || shiftIds.includes(id);
  const toggleShift = (id: string, on: boolean) => {
    const all = shifts.map((s) => s.id);
    const current = shiftIds ?? all;
    const next = on ? [...new Set([...current, id])] : current.filter((x) => x !== id);
    setShiftIds(next.length === all.length && all.every((x) => next.includes(x)) ? null : next);
  };

  const download = async () => {
    setBusy(true);
    setFailed(false);
    try {
      const bytes = await buildPdf(
        { blocksOn: data.blocksOn, assignments: data.assignments },
        period,
        {
          ...flags,
          view,
          shiftIds,
          text,
          header,
          footer: t.pdf.footer,
          headerDateLabel: t.pdf.headerDate,
          locale,
          now: new Date(),
        },
      );
      const url = URL.createObjectURL(new Blob([bytes as BlobPart], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = `slate-${keyFromDate(period.start)}-${keyFromDate(period.end)}.pdf`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  };

  const toggles: { key: keyof Flags; label: string }[] = [
    { key: 'events', label: t.pdf.events },
    { key: 'icon', label: t.pdf.icon },
    { key: 'time', label: t.pdf.time },
    { key: 'title', label: t.pdf.titleOpt },
    { key: 'notes', label: t.pdf.notes },
    { key: 'breakMinutes', label: t.pdf.breakOpt },
    { key: 'duration', label: t.pdf.duration },
    { key: 'emptyRows', label: t.pdf.emptyRows },
    { key: 'logo', label: t.pdf.logo },
  ];
  const views: { value: PdfView; label: string }[] = [
    { value: 'list', label: t.pdf.list },
    { value: 'month', label: t.pdf.month },
    { value: 'year', label: t.pdf.year },
  ];
  const texts: { value: PdfText; label: string }[] = [
    { value: 'title', label: t.pdf.textTitle },
    { value: 'start', label: t.pdf.textStart },
    { value: 'empty', label: t.pdf.textEmpty },
  ];

  return (
    <Dialog label={t.pdf.title} onClose={onClose} size="form">
      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-text-primary">{t.pdf.title}</h2>

        <div>
          <p className="text-sm text-text-secondary mb-2">{t.pdf.view}</p>
          <div className="flex flex-wrap gap-2">
            {views.map((v) => (
              <button key={v.value} type="button" aria-pressed={view === v.value} onClick={() => setView(v.value)} className={chip(view === v.value)}>
                {v.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-sm text-text-secondary mb-1">{t.pdf.range}</p>
          <p className="text-sm text-text-primary">{formatDayRange(locale, period.start, period.end)}</p>
        </div>

        <button type="button" aria-expanded={more} onClick={() => setMore((m) => !m)} className="text-sm text-accent-text hover:underline">
          {more ? t.pdf.lessOptions : t.pdf.moreOptions}
        </button>

        {more && (
          <>
            <div>
              <p className="text-sm text-text-secondary mb-2">{t.pdf.shifts}</p>
              <ul className="space-y-2">
                <li>
                  <label className="flex items-center justify-between gap-3 text-sm text-text-primary">
                    {t.pdf.all}
                    <input type="checkbox" checked={shiftIds === null} onChange={(e) => e.target.checked && setShiftIds(null)} />
                  </label>
                </li>
                {shifts.map((s) => (
                  <li key={s.id}>
                    <label className="flex items-center justify-between gap-3 text-sm text-text-primary">
                      {s.title}
                      <input type="checkbox" checked={included(s.id)} onChange={(e) => toggleShift(s.id, e.target.checked)} />
                    </label>
                  </li>
                ))}
              </ul>
            </div>

            <ul className="space-y-2">
              {toggles.map(({ key, label }) => (
                <li key={key}>
                  <label className="flex items-center justify-between gap-3 text-sm text-text-primary">
                    {label}
                    <input type="checkbox" checked={flags[key] as boolean} onChange={(e) => setFlag(key, e.target.checked)} />
                  </label>
                </li>
              ))}
            </ul>

            <div>
              <p className="text-sm text-text-secondary mb-2">{t.pdf.text}</p>
              <div className="flex flex-wrap gap-2">
                {texts.map((x) => (
                  <button key={x.value} type="button" aria-pressed={text === x.value} onClick={() => setText(x.value)} className={chip(text === x.value)}>
                    {x.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-sm text-text-secondary mb-2">{t.pdf.header}</p>
              <div className="space-y-2">
                {header.map((line, i) => (
                  <input
                    key={i}
                    type="text"
                    value={line}
                    maxLength={80}
                    aria-label={t.pdf.headerLine.replace('{n}', String(i + 1))}
                    placeholder={t.pdf.headerLine.replace('{n}', String(i + 1))}
                    onChange={(e) => setHeader((h) => h.map((x, j) => (j === i ? e.target.value : x)))}
                    className="w-full rounded-lg bg-surface-hover px-3 py-2 text-sm text-text-primary"
                  />
                ))}
              </div>
              <label className="mt-3 flex items-center justify-between gap-3 text-sm text-text-primary">
                {t.pdf.headerDate}
                <input type="checkbox" checked={flags.headerDate} onChange={(e) => setFlag('headerDate', e.target.checked)} />
              </label>
            </div>
          </>
        )}

        {failed && <p className="text-sm text-danger">{t.pdf.failed}</p>}

        <button
          type="button"
          onClick={download}
          disabled={busy}
          className="h-11 rounded-xl bg-accent text-accent-contrast font-medium disabled:opacity-50"
        >
          {busy ? t.pdf.preparing : t.pdf.share}
        </button>
      </div>
    </Dialog>
  );
}
