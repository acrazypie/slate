export type BlockCategory = 'studio' | 'lavoro' | 'lezione' | 'altro';

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
  created_at: string;
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