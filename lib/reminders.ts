'use client';

// Reminders: how long before an item starts it should notify. Each block and
// shift can have its own; "default" uses the lead time in Settings. The values
// match the Android app: null = default, -1 = no reminder, otherwise minutes.

export const REMINDER_OFF = -1;
export const DEFAULT_LEAD_MINUTES = 10;
export const REMINDER_OPTIONS = [5, 10, 15, 30, 60, 120, 1440];
export const LEAD_STORAGE_KEY = 'slate-reminder-lead';
export const NOTIFY_STORAGE_KEY = 'slate-notifications';

export interface NotifySettings {
  events: boolean;
  shifts: boolean;
}

export const DEFAULT_NOTIFY: NotifySettings = { events: true, shifts: true };

export function getLeadMinutes(): number {
  try {
    const n = Number(localStorage.getItem(LEAD_STORAGE_KEY));
    return REMINDER_OPTIONS.includes(n) ? n : DEFAULT_LEAD_MINUTES;
  } catch {
    return DEFAULT_LEAD_MINUTES;
  }
}

export function setLeadMinutes(minutes: number) {
  try {
    localStorage.setItem(LEAD_STORAGE_KEY, String(minutes));
  } catch {
    // Storage unavailable: the choice applies for this visit only.
  }
}

export function getNotifySettings(): NotifySettings {
  try {
    const raw = localStorage.getItem(NOTIFY_STORAGE_KEY);
    return raw ? { ...DEFAULT_NOTIFY, ...(JSON.parse(raw) as Partial<NotifySettings>) } : DEFAULT_NOTIFY;
  } catch {
    return DEFAULT_NOTIFY;
  }
}

export function setNotifySettings(s: NotifySettings) {
  try {
    localStorage.setItem(NOTIFY_STORAGE_KEY, JSON.stringify(s));
  } catch {
    // Storage unavailable: the choice applies for this visit only.
  }
}

/** The form value for a reminder: 'default', 'off', or minutes as a string. */
export function reminderToForm(value: number | null | undefined): string {
  if (value === null || value === undefined) return 'default';
  if (value === REMINDER_OFF) return 'off';
  return String(value);
}

export function formToReminder(value: string): number | null {
  if (value === 'default') return null;
  if (value === 'off') return REMINDER_OFF;
  return Number(value);
}

/** Label of a reminder, e.g. "10 min before" (the default names its lead time). */
export function reminderLabel(
  value: number | null | undefined,
  text: { off: string; before: string; day: string; defaultLabel: string },
  lead: number,
): string {
  if (value === null || value === undefined) return text.defaultLabel.replace('{n}', String(lead));
  if (value === REMINDER_OFF) return text.off;
  if (value === 1440) return text.day;
  return text.before.replace('{n}', String(value));
}

/** The labels a reminder uses, from the dictionary. */
export function reminderText(t: { reminders: { off: string; before: string; day: string; defaultLabel: string } }) {
  return { off: t.reminders.off, before: t.reminders.before, day: t.reminders.day, defaultLabel: t.reminders.defaultLabel };
}
