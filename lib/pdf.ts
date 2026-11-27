// Builds the summary's PDF: a list of days, a month grid per month, or a year
// overview. A direct port of the Android app's builder. Built-in PDF fonts cover
// Latin text only, so Japanese titles may not print.

import type { Block, ShiftAssignment } from './types';
import { formatTime, shiftDurationMinutes } from './types';
import { keyFromDate } from './recurrence';
import { periodDays, type Period } from './summaryRange';

export type PdfView = 'list' | 'month' | 'year';
export type PdfText = 'title' | 'start' | 'empty';

export interface PdfOptions {
  view: PdfView;
  /** Shift ids to include; null = all shifts. */
  shiftIds: string[] | null;
  events: boolean;
  icon: boolean;
  time: boolean;
  title: boolean;
  notes: boolean;
  breakMinutes: boolean;
  duration: boolean;
  emptyRows: boolean;
  logo: boolean;
  text: PdfText;
  /** Four header lines (empty ones are skipped). */
  header: string[];
  headerDate: boolean;
  /** Text printed at the bottom when `logo` is on. */
  footer: string;
  /** "Date", the label of the header date. */
  headerDateLabel: string;
  /** BCP 47 tag, e.g. 'en', 'it'. */
  locale: string;
  now: Date;
}

export interface PdfInput {
  blocksOn: (day: Date) => Block[];
  assignments: ShiftAssignment[];
}

/** Colour as [r, g, b] from '#rrggbb'. */
function rgb(hex: string): [number, number, number] {
  const n = parseInt(hex.replace('#', ''), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

interface Item {
  kind: 'shift' | 'event';
  title: string;
  color: string;
  start: number;
  end: number;
  notes?: string;
  breakMinutes: number;
}

const fmtMinutes = (m: number) => {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return r === 0 ? `${h}h` : `${h}h ${r}m`;
};

/** What each day shows, after the options. */
function itemsByDay(input: PdfInput, days: Date[], options: PdfOptions): Map<string, Item[]> {
  const out = new Map<string, Item[]>();
  for (const day of days) {
    const key = keyFromDate(day);
    const items: Item[] = [];
    if (options.events) {
      for (const b of input.blocksOn(day)) {
        const start = b.start_hour * 60 + b.start_minute;
        items.push({ kind: 'event', title: b.title, color: b.color, start, end: start + b.duration_minutes, notes: b.notes ?? undefined, breakMinutes: 0 });
      }
    }
    for (const a of input.assignments) {
      if (a.shift_date !== key) continue;
      const shift = a.shift;
      if (options.shiftIds && !options.shiftIds.includes(shift.id)) continue;
      const start = shift.start_hour * 60 + shift.start_minute;
      items.push({
        kind: 'shift',
        title: shift.title,
        color: shift.color,
        start,
        end: start + shiftDurationMinutes(shift),
        breakMinutes: shift.break_minutes ?? 0,
      });
    }
    items.sort((x, y) => x.start - y.start);
    out.set(key, items);
  }
  return out;
}

function itemLine(item: Item, options: PdfOptions): string {
  const parts: string[] = [];
  if (options.time) {
    parts.push(`${formatTime(Math.floor(item.start / 60) % 24, item.start % 60)}–${formatTime(Math.floor(item.end / 60) % 24, item.end % 60)}`);
  }
  if (options.title) parts.push(item.title);
  if (options.duration) parts.push(fmtMinutes(item.end - item.start));
  if (options.breakMinutes && item.breakMinutes > 0) parts.push(`(-${item.breakMinutes} min)`);
  return parts.join('  ');
}

/** Builds the PDF and returns its bytes. */
export async function buildPdf(input: PdfInput, period: Period, options: PdfOptions): Promise<Uint8Array> {
  const { jsPDF } = await import('jspdf');
  const days = periodDays(period);
  const items = itemsByDay(input, days, options);
  const tag = options.locale;
  const dayName = (d: Date) => d.toLocaleDateString(tag, { weekday: 'short', day: 'numeric', month: 'short' });
  const landscape = options.view !== 'list';
  const doc = new jsPDF({ orientation: landscape ? 'landscape' : 'portrait', unit: 'mm', format: 'a4' });
  const W = landscape ? 297 : 210;
  const H = landscape ? 210 : 297;
  const M = 12;

  let y = M;
  const footer = () => {
    if (!options.logo) return;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120);
    doc.text(options.footer, W - M, H - 6, { align: 'right' });
    doc.setTextColor(0);
  };

  const header = () => {
    y = M;
    const lines = options.header.filter((l) => l.trim() !== '');
    lines.forEach((line, i) => {
      doc.setFont('helvetica', i === 0 ? 'bold' : 'normal');
      doc.setFontSize(i === 0 ? 15 : 10);
      doc.text(line, M, y + 5);
      y += i === 0 ? 8 : 5;
    });
    if (options.headerDate) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(90);
      doc.text(`${options.headerDateLabel}: ${options.now.toLocaleDateString(tag)}`, M, y + 4);
      doc.setTextColor(0);
      y += 7;
    }
    y += 3;
  };

  const newPage = (orientation?: 'portrait' | 'landscape') => {
    footer();
    doc.addPage('a4', orientation ?? (landscape ? 'landscape' : 'portrait'));
    header();
  };

  if (options.view === 'list') {
    header();
    for (const day of days) {
      const key = keyFromDate(day);
      const dayItems = items.get(key) ?? [];
      if (dayItems.length === 0 && !options.emptyRows) continue;
      const rowHeight = Math.max(1, dayItems.length) * 6 + 4 + (dayItems.some((i) => i.notes) && options.notes ? 4 : 0);
      if (y + rowHeight > H - 14) newPage('portrait');
      doc.setDrawColor(210);
      doc.line(M, y, W - M, y);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(0);
      doc.text(dayName(day), M, y + 5);
      if (dayItems.length === 0) {
        y += 8;
        continue;
      }
      dayItems.forEach((item, i) => {
        const [r, g, b] = rgb(item.color);
        const row = y + 4 + i * 6;
        if (options.icon) {
          doc.setFillColor(r, g, b);
          doc.rect(M + 40, row - 2.5, 2.5, 2.5, 'F');
        }
        doc.setFont('helvetica', item.kind === 'shift' ? 'bold' : 'normal');
        doc.setFontSize(9);
        doc.text(itemLine(item, options), M + 45, row);
      });
      y += 4 + dayItems.length * 6;
      if (options.notes) {
        const note = dayItems.find((i) => i.notes)?.notes;
        if (note) {
          doc.setFont('helvetica', 'italic');
          doc.setFontSize(8);
          doc.setTextColor(90);
          doc.text(note.slice(0, 140), M + 45, y);
          doc.setTextColor(0);
          y += 4;
        }
      }
      y += 3;
    }
    footer();
    return new Uint8Array(doc.output('arraybuffer'));
  }

  // Each month in the period, once, in order.
  const months: { year: number; month: number }[] = [];
  for (const day of days) {
    const m = { year: day.getFullYear(), month: day.getMonth() };
    if (!months.some((x) => x.year === m.year && x.month === m.month)) months.push(m);
  }

  const cellText = (item: Item): string => {
    if (options.text === 'empty') return '';
    if (options.text === 'start') return formatTime(Math.floor(item.start / 60) % 24, item.start % 60);
    return item.title;
  };

  if (options.view === 'month') {
    header();
    // One month per page: the first uses the page the header is on.
    months.forEach(({ year, month }, index) => {
      if (index > 0) newPage('landscape');
      const first = new Date(year, month, 1);
      const offset = (first.getDay() + 6) % 7;
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      const cols = 7;
      const rows = Math.ceil((offset + daysInMonth) / cols);
      const cw = (W - 2 * M) / cols;
      const ch = Math.min(28, (H - y - 22) / rows);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.text(first.toLocaleDateString(tag, { month: 'long', year: 'numeric' }), M, y + 4);
      y += 8;
      for (let d = 1; d <= daysInMonth; d++) {
        const idx = offset + d - 1;
        const x = M + (idx % cols) * cw;
        const top = y + Math.floor(idx / cols) * ch;
        doc.setDrawColor(200);
        doc.rect(x, top, cw, ch);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7);
        doc.setTextColor(0);
        doc.text(String(d), x + 1.5, top + 3.5);
        const dayItems = items.get(keyFromDate(new Date(year, month, d))) ?? [];
        dayItems.slice(0, Math.max(0, Math.floor((ch - 6) / 3.6))).forEach((item, i) => {
          const yy = top + 6.5 + i * 3.6;
          if (options.icon) {
            const [r, g, b] = rgb(item.color);
            doc.setFillColor(r, g, b);
            doc.rect(x + 1.2, yy - 2, 1.6, 1.6, 'F');
          }
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(6.5);
          const txt = cellText(item);
          if (txt) doc.text(txt.slice(0, 22), x + (options.icon ? 3.6 : 1.5), yy);
        });
      }
      y += rows * ch + 8;
    });
    footer();
    return new Uint8Array(doc.output('arraybuffer'));
  }

  // Year: the twelve months of the period's year, four across and three down.
  header();
  const year = period.start.getFullYear();
  const colsY = 4;
  const cellW = (W - 2 * M) / colsY;
  const cellH = (H - y - 14) / 3;
  for (let month = 0; month < 12; month++) {
    const ox = M + (month % colsY) * cellW;
    const oy = y + Math.floor(month / colsY) * cellH;
    const first = new Date(year, month, 1);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(0);
    doc.text(first.toLocaleDateString(tag, { month: 'short' }), ox + 1, oy + 3);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const cw = (cellW - 3) / 7;
    const rh = (cellH - 6) / 6;
    for (let d = 1; d <= daysInMonth; d++) {
      const idx = offset + d - 1;
      const x = ox + 1 + (idx % 7) * cw;
      const top = oy + 5 + Math.floor(idx / 7) * rh;
      const dayItems = items.get(keyFromDate(new Date(year, month, d))) ?? [];
      if (dayItems.length > 0 && options.icon) {
        const [r, g, b] = rgb(dayItems[0].color);
        doc.setFillColor(r, g, b);
      } else {
        doc.setFillColor(238, 238, 238);
      }
      doc.rect(x, top, cw - 0.4, rh - 0.4, 'F');
    }
  }
  footer();
  return new Uint8Array(doc.output('arraybuffer'));
}
