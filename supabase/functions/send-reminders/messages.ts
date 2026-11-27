// The text of a reminder, per language. The server does not know the app's
// language, so each push subscription carries the locale it was made in.

const TEXT: Record<string, { at: (time: string) => string }> = {
  en: { at: (t) => `Starts at ${t}` },
  es: { at: (t) => `Empieza a las ${t}` },
  fr: { at: (t) => `Commence à ${t}` },
  it: { at: (t) => `Inizia alle ${t}` },
  ja: { at: (t) => `${t} に開始` },
  nl: { at: (t) => `Begint om ${t}` },
};

export function reminderText(locale: string, time: string): string {
  return (TEXT[locale] ?? TEXT.en).at(time);
}
