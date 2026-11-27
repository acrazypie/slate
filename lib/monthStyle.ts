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
