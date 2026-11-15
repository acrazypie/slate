export type BlockCategory = 'studio' | 'lavoro' | 'lezione' | 'altro';

export type RecurrenceType = 'weekly' | 'monthly';

export interface Block {
  id: string;
  user_id: string;
  title: string;
  category: BlockCategory;
  color: string;
  day_of_week: number;
  start_hour: number;
  start_minute: number;
  duration_minutes: number;
  week_offset: number;
  notes: string | null;
  is_recurring: boolean;
  recurrence_type?: RecurrenceType;
  recurrence_end_date?: string;
  recurrence_group_id?: string;
  google_event_id?: string | null;
  /** Google's `updated` stamp of the mirrored event when Slate last pushed or pulled it. */
  google_updated_at?: string | null;
  created_at: string;
}

/** One of the user's Google calendars, as listed in Settings. */
export interface GoogleCalendar {
  id: string;
  name: string;
  color: string;
  primary: boolean;
  /** False for calendars the user can only read (holidays, shared read-only). */
  canEdit: boolean;
  /** Whether its events are shown in Slate. */
  visible: boolean;
}

/**
 * An event that lives only in Google Calendar, shown next to Slate's own
 * events. Dates and times are wall-clock values in Slate's time zone. A
 * recurring event arrives already expanded: one entry per occurrence.
 */
export interface GoogleEvent {
  id: string;
  calendarId: string;
  calendarName: string;
  title: string;
  notes: string;
  location: string | null;
  color: string;
  allDay: boolean;
  /** First day, 'yyyy-MM-dd'. */
  startDate: string;
  /** Last day, inclusive. Differs from `startDate` for multi-day events. */
  endDate: string;
  /** Start and end times. Both 0 for an all-day event. */
  start_hour: number;
  start_minute: number;
  end_hour: number;
  end_minute: number;
  /** Set on an occurrence of a recurring event: the id of the series. */
  recurringEventId: string | null;
  canEdit: boolean;
  htmlLink: string | null;
}

/** What the edit form sends back for a Google event. */
export interface GoogleEventChanges {
  title: string;
  notes: string;
  allDay: boolean;
  startDate: string;
  endDate: string;
  start_hour: number;
  start_minute: number;
  end_hour: number;
  end_minute: number;
}

/** For a recurring Google event: change just this occurrence, or the whole series. */
export type GoogleEventScope = 'this' | 'all';

/** The part of a Google event that falls on one day, in minutes from midnight. */
export interface GoogleEventSegment {
  event: GoogleEvent;
  start: number;
  end: number;
}

/**
 * Splits events into what each day shows: all-day events as a list, timed
 * events as the slice of them that falls on that day (an event running past
 * midnight gives one slice per day).
 */
export function googleEventsForDay(
  events: GoogleEvent[],
  dateKey: string
): { allDay: GoogleEvent[]; timed: GoogleEventSegment[] } {
  const allDay: GoogleEvent[] = [];
  const timed: GoogleEventSegment[] = [];
  for (const event of events) {
    if (dateKey < event.startDate || dateKey > event.endDate) continue;
    if (event.allDay) {
      allDay.push(event);
      continue;
    }
    const start = dateKey === event.startDate ? event.start_hour * 60 + event.start_minute : 0;
    const end = dateKey === event.endDate ? event.end_hour * 60 + event.end_minute : 24 * 60;
    // An event ending at midnight exactly has nothing on its last day.
    if (end > start) timed.push({ event, start, end });
  }
  timed.sort((a, b) => a.start - b.start || a.end - b.end);
  return { allDay, timed };
}

/** Where a card sits when several overlap: column `col` of `cols` side by side. */
export interface OverlapSlot {
  col: number;
  cols: number;
}

/**
 * Lays overlapping items out side by side. Items that overlap, directly or
 * through a chain of others, share a cluster and split the width evenly.
 */
export function layoutOverlaps<K>(items: { key: K; start: number; end: number }[]): Map<K, OverlapSlot> {
  const result = new Map<K, OverlapSlot>();
  const sorted = [...items].sort((a, b) => a.start - b.start || b.end - a.end);
  let cluster: { key: K; col: number }[] = [];
  let columnEnds: number[] = [];
  let clusterEnd = -1;

  const flush = () => {
    for (const entry of cluster) result.set(entry.key, { col: entry.col, cols: columnEnds.length });
    cluster = [];
    columnEnds = [];
  };

  for (const item of sorted) {
    if (cluster.length > 0 && item.start >= clusterEnd) flush();
    let col = columnEnds.findIndex((end) => end <= item.start);
    if (col === -1) {
      col = columnEnds.length;
      columnEnds.push(item.end);
    } else {
      columnEnds[col] = item.end;
    }
    cluster.push({ key: item.key, col });
    clusterEnd = Math.max(clusterEnd, item.end);
  }
  flush();
  return result;
}

/** A reusable shift definition (e.g. "Mattina 09:00-13:00"). Never recurring. */
export interface Shift {
  id: string;
  user_id: string;
  title: string;
  start_hour: number;
  start_minute: number;
  end_hour: number;
  end_minute: number;
  color: string;
  created_at: string;
}

export interface ShiftFormData {
  title: string;
  start_hour: number;
  start_minute: number;
  end_hour: number;
  end_minute: number;
  color: string;
}

/** A shift placed on one specific calendar day. */
export interface ShiftAssignment {
  id: string;
  user_id: string;
  shift_id: string;
  shift_date: string; // 'yyyy-MM-dd'
  shift: Shift;
}

export const SHIFT_DEFAULT_COLOR = '#6BB6A3';

export function formatTime(hour: number, minute: number): string {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
}

/** Short form for tight spaces: "9–13", "9:30–13". */
export function formatCompactRange(sh: number, sm: number, eh: number, em: number): string {
  const part = (h: number, m: number) => (m === 0 ? `${h}` : `${h}:${m.toString().padStart(2, '0')}`);
  return `${part(sh, sm)}–${part(eh, em)}`;
}

export function blockEndTime(block: Pick<Block, 'start_hour' | 'start_minute' | 'duration_minutes'>) {
  const total = block.start_hour * 60 + block.start_minute + block.duration_minutes;
  return { hour: Math.floor(total / 60) % 24, minute: total % 60 };
}

/** A shift whose end is at or before its start runs past midnight. */
export function isOvernightShift(shift: Pick<Shift, 'start_hour' | 'start_minute' | 'end_hour' | 'end_minute'>): boolean {
  return shift.end_hour * 60 + shift.end_minute <= shift.start_hour * 60 + shift.start_minute;
}

export function shiftDurationMinutes(shift: Pick<Shift, 'start_hour' | 'start_minute' | 'end_hour' | 'end_minute'>): number {
  const start = shift.start_hour * 60 + shift.start_minute;
  const end = shift.end_hour * 60 + shift.end_minute;
  return end > start ? end - start : end + 24 * 60 - start;
}

export function getContrastColor(hexColor: string): string {
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.5 ? '#1a1a1a' : '#ffffff';
}

export interface BlockFormData {
  title: string;
  category: BlockCategory;
  color: string;
  day_of_week: number;
  start_hour: number;
  start_minute: number;
  duration_minutes: number;
  notes: string;
  is_recurring?: boolean;
  recurrence_type?: RecurrenceType;
  recurrence_end_date?: string;
}

export const CATEGORY_COLORS: Record<BlockCategory, string> = {
  studio: '#BB86FC',
  lavoro: '#E49C69',
  lezione: '#FFD9A0',
  altro: '#CF6679',
};

// Category and weekday names are translated: see `t.categories` and
// `weekdayNames()` in lib/i18n. The category keys themselves are stored in the
// database, so they stay as they are.
export const CATEGORIES: BlockCategory[] = ['studio', 'lavoro', 'lezione', 'altro'];

export const COLOR_PALETTE = [
  '#E49C69', // apricot dust
  '#FFD9A0', // sand nougat
  '#F2C299', // dune beach
  '#5C3B2E', // cacao husk
  '#BB86FC', // violet
  '#CF6679', // rose
  '#6BB6A3', // teal
  '#7AA7D9', // sky blue
];

/**
 * Keys into `t.colors` for the palette, so colour swatches are announced by a
 * translated name and not as hex codes.
 */
export const COLOR_KEYS = {
  '#E49C69': 'apricot',
  '#FFD9A0': 'sand',
  '#F2C299': 'dune',
  '#5C3B2E': 'cacao',
  '#BB86FC': 'violet',
  '#CF6679': 'raspberry',
  '#6BB6A3': 'teal',
  '#7AA7D9': 'skyBlue',
} as const satisfies Record<string, ColorKey>;

export type ColorKey =
  | 'apricot' | 'sand' | 'dune' | 'cacao' | 'violet' | 'raspberry' | 'teal' | 'skyBlue' | 'amber' | 'sage' | 'pink';

export function colorKey(hex: string): ColorKey | undefined {
  return (COLOR_KEYS as Record<string, ColorKey>)[hex];
}

export const DURATION_OPTIONS = [
  { value: 30, label: '30 min' },
  { value: 60, label: '1h' },
  { value: 90, label: '1h 30' },
  { value: 120, label: '2h' },
  { value: 150, label: '2h 30' },
  { value: 180, label: '3h' },
  { value: 240, label: '4h' },
  { value: 480, label: '8h' },
];
/**
 * Inline `left`/`right` for a card that shares its hour with others. Events sit
 * in the right half of the column when the day also has shifts (`half`).
 * Undefined when the card is alone, so it keeps its normal full width.
 */
export function overlapPosition(slot: OverlapSlot | undefined, half?: boolean): { left: string; right: string } | undefined {
  if (!slot || slot.cols <= 1) return undefined;
  const areaStart = half ? 50 : 0;
  const areaWidth = half ? 50 : 100;
  const left = areaStart + (slot.col / slot.cols) * areaWidth;
  const right = 100 - (areaStart + ((slot.col + 1) / slot.cols) * areaWidth);
  return { left: `calc(${left}% + 2px)`, right: `calc(${right}% + 2px)` };
}
