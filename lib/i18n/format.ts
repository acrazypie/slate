import { INTL_TAGS, type Locale } from './config';

/** Replaces {name} placeholders in a dictionary string. */
export function fill(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => (key in values ? String(values[key]) : match));
}

// Dates go through Intl rather than fixed patterns, so word order follows the
// language ("lunedì 3 novembre", "Monday 3 November", "11月3日月曜日").
const DATE_STYLES = {
  /** "lun" */
  weekdayShort: { weekday: 'short' },
  /** "nov" */
  monthShort: { month: 'short' },
  /** "lunedì 3 novembre" */
  fullDay: { weekday: 'long', day: 'numeric', month: 'long' },
  /** "lunedì 3 nov" */
  dayShortMonth: { weekday: 'long', day: 'numeric', month: 'short' },
  /** "novembre 2026" */
  monthYear: { month: 'long', year: 'numeric' },
  /** "3 nov" */
  dayMonth: { day: 'numeric', month: 'short' },
} satisfies Record<string, Intl.DateTimeFormatOptions>;

export type DateStyle = keyof typeof DATE_STYLES;

const formatters = new Map<string, Intl.DateTimeFormat>();

function formatter(locale: Locale, style: DateStyle): Intl.DateTimeFormat {
  const key = `${locale}:${style}`;
  let found = formatters.get(key);
  if (!found) {
    found = new Intl.DateTimeFormat(INTL_TAGS[locale], DATE_STYLES[style]);
    formatters.set(key, found);
  }
  return found;
}

export function formatDate(locale: Locale, date: Date, style: DateStyle): string {
  return formatter(locale, style).format(date);
}

/** "3–9 nov", "30 nov – 6 dic", "11月3日～9日". */
export function formatDayRange(locale: Locale, start: Date, end: Date): string {
  return formatter(locale, 'dayMonth').formatRange(start, end);
}

export function capitalize(text: string): string {
  return text.charAt(0).toLocaleUpperCase() + text.slice(1);
}

/** Short weekday names, Monday first: the order `day_of_week` uses. */
export function weekdayNames(locale: Locale): string[] {
  // 1 January 2024 was a Monday.
  return Array.from({ length: 7 }, (_, i) => capitalize(formatDate(locale, new Date(2024, 0, 1 + i), 'weekdayShort')));
}
