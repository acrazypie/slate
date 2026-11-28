'use client';

// Month view style: 'compact' (coloured squares, the selected day listed below)
// or 'detailed' (a title and time in each day cell). Kept on this device.
// Compact is the default, as on Android.

export type MonthStyle = 'compact' | 'detailed';
export const MONTH_STYLE_KEY = 'slate-month-style';

export function getMonthStyle(): MonthStyle {
  try {
    return localStorage.getItem(MONTH_STYLE_KEY) === 'detailed' ? 'detailed' : 'compact';
  } catch {
    return 'compact';
  }
}

export function setMonthStyle(style: MonthStyle) {
  try {
    localStorage.setItem(MONTH_STYLE_KEY, style);
  } catch {
    // Storage unavailable: the choice applies for this visit only.
  }
}

// How a shift shows in the month view. Detailed view: 'compact' (title and hours)
// or 'full' (the whole day in the shift's colour, its icon, events hidden). Compact
// view: 'dot' (a square per item) or 'line' (a thick bar in the shift's colour).

export type DetailedShiftStyle = 'compact' | 'full';
export type CompactShiftStyle = 'dot' | 'line';
export const DETAILED_SHIFT_KEY = 'slate-month-shift-detailed';
export const COMPACT_SHIFT_KEY = 'slate-month-shift-compact';

export function getDetailedShiftStyle(): DetailedShiftStyle {
  try {
    return localStorage.getItem(DETAILED_SHIFT_KEY) === 'full' ? 'full' : 'compact';
  } catch {
    return 'compact';
  }
}

export function setDetailedShiftStyle(style: DetailedShiftStyle) {
  try {
    localStorage.setItem(DETAILED_SHIFT_KEY, style);
  } catch {
    // Storage unavailable: the choice applies for this visit only.
  }
}

export function getCompactShiftStyle(): CompactShiftStyle {
  try {
    return localStorage.getItem(COMPACT_SHIFT_KEY) === 'line' ? 'line' : 'dot';
  } catch {
    return 'dot';
  }
}

export function setCompactShiftStyle(style: CompactShiftStyle) {
  try {
    localStorage.setItem(COMPACT_SHIFT_KEY, style);
  } catch {
    // Storage unavailable: the choice applies for this visit only.
  }
}

/** Dark or white text, whichever reads better on a #rrggbb background. */
export function textOn(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return '#ffffff';
  const n = parseInt(m[1], 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255 > 0.6 ? '#0e1320' : '#ffffff';
}
