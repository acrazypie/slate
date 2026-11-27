'use client';

import { useEffect } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import { applyAccent, getStoredAccent } from '@/lib/accent';
import type { Locale } from '@/lib/i18n/config';
import { LanguageProvider } from './LanguageProvider';

/** Applies the stored accent on load and again when the light or dark theme changes. */
function AccentSync() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    applyAccent(getStoredAccent(), resolvedTheme === 'light');
  }, [resolvedTheme]);
  return null;
}

export function Providers({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AccentSync />
      <LanguageProvider initialLocale={locale}>{children}</LanguageProvider>
    </ThemeProvider>
  );
}
