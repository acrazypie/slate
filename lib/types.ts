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
  studio: '#6366f1',
  lavoro: '#10b981',
  lezione: '#f59e0b',
  altro: '#8b5cf6',
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
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ef4444', // red
  '#06b6d4', // cyan
  '#ec4899', // pink
  '#14b8a6', // teal
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