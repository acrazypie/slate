// App-wide accent colour. Stored per device (localStorage), like the default
// view, and applied by overriding the two accent CSS variables on <html>.

export const ACCENT_STORAGE_KEY = 'slate-accent';
import type { ColorKey } from './types';

export const DEFAULT_ACCENT = '#6BB6A3';

/** `name` is a key into `t.colors`. */
export const ACCENT_OPTIONS: { value: string; name: ColorKey }[] = [
  // Presets that equal a block colour are left out, so the accent never reads as a block.
  { value: '#6BB6A3', name: 'teal' },
  { value: '#D4EE5E', name: 'gesso' },
  { value: '#E0B84C', name: 'amber' },
  { value: '#8BC48A', name: 'sage' },
  { value: '#E58FB4', name: 'pink' },
];

const HEX = /^#[0-9a-fA-F]{6}$/;

/** Dark or light text, whichever reads better on top of the accent. */
function contrastFor(hex: string): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.55 ? '#201a17' : '#ffffff';
}

export function getStoredAccent(): string {
  try {
    const stored = localStorage.getItem(ACCENT_STORAGE_KEY);
    return stored && HEX.test(stored) ? stored : DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}

export function applyAccent(hex: string) {
  if (!HEX.test(hex)) return;
  const root = document.documentElement;
  root.style.setProperty('--color-accent', hex);
  root.style.setProperty('--color-accent-contrast', contrastFor(hex));
}

export function setAccent(hex: string) {
  if (!HEX.test(hex)) return;
  applyAccent(hex);
  try {
    localStorage.setItem(ACCENT_STORAGE_KEY, hex);
  } catch {
    // Storage unavailable (private mode): the colour still applies for this visit.
  }
}
