'use client';

import { Languages } from 'lucide-react';
import { LOCALES, LOCALE_NAMES, isLocale } from '@/lib/i18n/config';
import { useI18n } from './LanguageProvider';

/** Compact language picker for the signed-out pages. Settings has the full one. */
export function LanguageSelect({ className = '' }: { className?: string }) {
  const { locale, t, setLocale } = useI18n();

  return (
    <label className={`inline-flex items-center gap-1.5 text-xs text-text-tertiary hover:text-text-secondary transition-colors ${className}`}>
      <Languages className="w-3.5 h-3.5" aria-hidden="true" />
      <select
        value={locale}
        onChange={(e) => isLocale(e.target.value) && setLocale(e.target.value)}
        aria-label={t.common.language}
        className="bg-transparent py-3 cursor-pointer focus:outline-none focus-visible:underline"
      >
        {LOCALES.map((code) => (
          <option key={code} value={code} lang={code} className="bg-surface text-text-primary">
            {LOCALE_NAMES[code]}
          </option>
        ))}
      </select>
    </label>
  );
}
