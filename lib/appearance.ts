// Appearance options that are not colours: the OLED setting (pure black
// background in the dark theme). Stored per device, like the accent.

import { applyGround, getStoredAccent } from './accent';

export const OLED_STORAGE_KEY = 'slate-oled';

export function getOled(): boolean {
  try {
    return localStorage.getItem(OLED_STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setOled(on: boolean) {
  try {
    localStorage.setItem(OLED_STORAGE_KEY, on ? 'true' : 'false');
  } catch {
    // Storage unavailable: the choice applies for this visit only.
  }
}

/** Sets the OLED background; only the dark theme uses it (see globals.css). */
export function applyOled(on: boolean) {
  document.documentElement.dataset.oled = on ? 'true' : 'false';
  // The tinted background must step aside for pure black, and come back when OLED is off.
  applyGround(getStoredAccent());
}
