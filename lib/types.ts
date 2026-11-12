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
  created_at: string;
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

export const CATEGORY_LABELS: Record<BlockCategory, string> = {
  studio: 'Studio',
  lavoro: 'Lavoro',
  lezione: 'Lezione',
  altro: 'Altro',
};

export const CATEGORY_ICONS: Record<BlockCategory, string> = {
  studio: '📚',
  lavoro: '💼',
  lezione: '🎓',
  altro: '📌',
};

export const DAY_NAMES = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];

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