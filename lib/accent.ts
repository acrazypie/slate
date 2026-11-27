// App-wide accent colour. Stored per device (localStorage), like the default
// view, and applied by overriding the accent CSS variables on <html>.
//
// These are the ten accents of the Slate app, with the same values. Each one
// has its own icon (public/icons/accent-<icon>.png), and the browser tab icon
// follows the accent. The home-screen icon (apple-icon, PWA) stays the teal one,
// because an installed icon cannot change.

export const ACCENT_STORAGE_KEY = 'slate-accent';

export type AccentName = 'teal' | 'gesso' | 'violet' | 'apricot' | 'amber' | 'sage' | 'pink' | 'coral' | 'periwinkle' | 'chalk';

/** `name` is a key into `t.colors`; `light` is the shade used on the light theme (>= 4.5:1). */
export const ACCENT_OPTIONS: { value: string; light: string; name: AccentName; icon: string }[] = [
  { value: '#6BB6A3', light: '#2E7266', name: 'teal', icon: 'teal' },
  { value: '#D4EE5E', light: '#5A7000', name: 'gesso', icon: 'lime' },
  { value: '#BB86FC', light: '#6A3FB8', name: 'violet', icon: 'violet' },
  { value: '#E49C69', light: '#8F4E22', name: 'apricot', icon: 'apricot' },
  { value: '#E0B84C', light: '#7F5D00', name: 'amber', icon: 'amber' },
  { value: '#8BC48A', light: '#2F7A34', name: 'sage', icon: 'sage' },
  { value: '#E58FB4', light: '#A8346A', name: 'pink', icon: 'pink' },
  { value: '#F0785A', light: '#A34A30', name: 'coral', icon: 'coral' },
  { value: '#8FA8FF', light: '#3F55B8', name: 'periwinkle', icon: 'periwinkle' },
  { value: '#F0EEE8', light: '#5E5B52', name: 'chalk', icon: 'chalk' },
];

export const DEFAULT_ACCENT = '#6BB6A3';

const HEX = /^#[0-9a-fA-F]{6}$/;

const rgb = (hex: string) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

function luminance(hex: string): number {
  const ch = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  const [r, g, b] = rgb(hex).map((v) => ch(v / 255));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Darkens a custom accent until it reaches 4.5:1 on the light background. */
function lightVariant(hex: string): string {
  let [r, g, b] = rgb(hex);
  for (let i = 0; i < 40; i++) {
    const cur = '#' + [r, g, b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
    if ((luminance('#FAFAFA') + 0.05) / (luminance(cur) + 0.05) >= 4.5) return cur.toUpperCase();
    [r, g, b] = [r * 0.92, g * 0.92, b * 0.92];
  }
  return '#333333';
}

/** Dark or light text, whichever reads better on top of the accent. */
function contrastFor(hex: string): string {
  const [r, g, b] = rgb(hex);
  const brightness = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return brightness > 0.55 ? '#0e1320' : '#ffffff';
}

/** The icon for an accent; a custom colour uses the icon of the nearest accent. */
export function iconFor(hex: string): string {
  const [r, g, b] = rgb(hex.toUpperCase());
  let best = ACCENT_OPTIONS[0];
  let bestDistance = Infinity;
  for (const o of ACCENT_OPTIONS) {
    const [or, og, ob] = rgb(o.value);
    const d = (or - r) ** 2 + (og - g) ** 2 + (ob - b) ** 2;
    if (d < bestDistance) {
      bestDistance = d;
      best = o;
    }
  }
  return best.icon;
}

export function getStoredAccent(): string {
  try {
    const stored = localStorage.getItem(ACCENT_STORAGE_KEY);
    return stored && HEX.test(stored) ? stored : DEFAULT_ACCENT;
  } catch {
    return DEFAULT_ACCENT;
  }
}

function setTabIcon(icon: string) {
  const href = `/icons/accent-${icon}.png`;
  const links = document.querySelectorAll<HTMLLinkElement>('link[rel~="icon"]');
  if (links.length === 0) {
    const link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
    link.href = href;
    link.type = 'image/png';
    return;
  }
  links.forEach((link) => {
    link.href = href;
    link.type = 'image/png';
    link.removeAttribute('sizes');
  });
}

/**
 * Applies an accent. On the light theme the deeper shade is used so the accent
 * stays readable on the light background. `light` defaults to the theme on <html>.
 */
export function applyAccent(hex: string, light = document.documentElement.classList.contains('light')) {
  if (!HEX.test(hex)) return;
  const root = document.documentElement;
  const option = ACCENT_OPTIONS.find((o) => o.value.toLowerCase() === hex.toLowerCase());
  const shade = light ? (option?.light ?? lightVariant(hex)) : hex;
  root.style.setProperty('--color-accent', shade);
  root.style.setProperty('--color-accent-text', shade);
  root.style.setProperty('--color-accent-contrast', contrastFor(shade));
  setTabIcon(iconFor(hex));
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
