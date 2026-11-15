// Languages the app is translated into. Italian is the source language: the
// other dictionaries are typed against it, so a missing key fails the build.

export const LOCALES = ['it', 'en', 'es', 'nl', 'fr', 'ja'] as const;
export type Locale = (typeof LOCALES)[number];

/** Used when neither the saved choice nor the browser's languages match. */
export const DEFAULT_LOCALE: Locale = 'en';

/** The saved choice. A cookie rather than localStorage so the server renders the right language. */
export const LOCALE_COOKIE = 'slate-lang';

/** Each language in its own words, for the picker. */
export const LOCALE_NAMES: Record<Locale, string> = {
  it: 'Italiano',
  en: 'English',
  es: 'Español',
  nl: 'Nederlands',
  fr: 'Français',
  ja: '日本語',
};

// Tags handed to Intl for dates. en-GB because the app is day-first, 24-hour
// and starts the week on Monday.
export const INTL_TAGS: Record<Locale, string> = {
  it: 'it-IT',
  en: 'en-GB',
  es: 'es-ES',
  nl: 'nl-NL',
  fr: 'fr-FR',
  ja: 'ja-JP',
};

export function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && (LOCALES as readonly string[]).includes(value);
}

/** Picks the first supported language out of an Accept-Language header. */
export function matchLocale(acceptLanguage: string | null | undefined): Locale {
  if (!acceptLanguage) return DEFAULT_LOCALE;
  const wanted = acceptLanguage
    .split(',')
    .map((part) => {
      const [tag, q] = part.trim().split(';q=');
      return { lang: tag.toLowerCase().split('-')[0], q: q === undefined ? 1 : Number(q) || 0 };
    })
    .sort((a, b) => b.q - a.q);
  for (const { lang } of wanted) {
    if (isLocale(lang)) return lang;
  }
  return DEFAULT_LOCALE;
}
