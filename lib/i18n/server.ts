import { cache } from 'react';
import { cookies, headers } from 'next/headers';
import { LOCALE_COOKIE, isLocale, matchLocale, type Locale } from './config';
import { dictionaries } from './dictionaries';

/** The language for this request: the saved choice, else the browser's preference. */
export const getLocale = cache(async (): Promise<Locale> => {
  const saved = (await cookies()).get(LOCALE_COOKIE)?.value;
  if (isLocale(saved)) return saved;
  return matchLocale((await headers()).get('accept-language'));
});

/** For Server Components. Client Components use `useI18n()` instead. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, t: dictionaries[locale] };
}
