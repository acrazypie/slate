'use client';

// The settings a backup carries: the ones kept on this device.

import { ACCENT_STORAGE_KEY } from './accent';
import { OLED_STORAGE_KEY } from './appearance';
import { PAY_STORAGE_KEY } from './pay';
import { SUMMARY_RANGE_KEY } from './summaryStore';

export const KEYS_FOR_BACKUP = {
  accent: ACCENT_STORAGE_KEY,
  oled: OLED_STORAGE_KEY,
  pay: PAY_STORAGE_KEY,
  summaryRange: SUMMARY_RANGE_KEY,
  defaultView: 'slate-default-view',
};

export function readPortableSettings(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  try {
    const accent = localStorage.getItem(KEYS_FOR_BACKUP.accent);
    if (accent) out.accent = accent;
    out.oled = localStorage.getItem(KEYS_FOR_BACKUP.oled) === 'true';
    const pay = localStorage.getItem(KEYS_FOR_BACKUP.pay);
    if (pay) out.pay = JSON.parse(pay);
    const range = localStorage.getItem(KEYS_FOR_BACKUP.summaryRange);
    if (range) out.summaryRange = JSON.parse(range);
    const view = localStorage.getItem(KEYS_FOR_BACKUP.defaultView);
    if (view) out.defaultView = view;
  } catch {
    // Storage unavailable: the backup carries no device settings.
  }
  return out;
}

/** Writes the device settings from a backup. Only known keys with the right types are used. */
export function applyPortableSettings(s: Record<string, unknown>) {
  try {
    if (typeof s.accent === 'string' && /^#[0-9a-fA-F]{6}$/.test(s.accent)) localStorage.setItem(KEYS_FOR_BACKUP.accent, s.accent);
    if (typeof s.oled === 'boolean') localStorage.setItem(KEYS_FOR_BACKUP.oled, s.oled ? 'true' : 'false');
    if (s.pay && typeof s.pay === 'object') localStorage.setItem(KEYS_FOR_BACKUP.pay, JSON.stringify(s.pay));
    if (s.summaryRange && typeof s.summaryRange === 'object') localStorage.setItem(KEYS_FOR_BACKUP.summaryRange, JSON.stringify(s.summaryRange));
    if (s.defaultView === 'day' || s.defaultView === 'week' || s.defaultView === 'month' || s.defaultView === 'agenda') {
      localStorage.setItem(KEYS_FOR_BACKUP.defaultView, s.defaultView);
    }
  } catch {
    // Storage unavailable: the device settings stay as they are.
  }
}
