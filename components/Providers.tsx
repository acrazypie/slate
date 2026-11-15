'use client';

import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { applyAccent, getStoredAccent } from '@/lib/accent';
import type { Locale } from '@/lib/i18n/config';
import { LanguageProvider } from './LanguageProvider';

export function Providers({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  // Re-apply the accent colour the user picked in Settings on every load.
  useEffect(() => {
    applyAccent(getStoredAccent());
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <LanguageProvider initialLocale={locale}>{children}</LanguageProvider>
    </ThemeProvider>
  );
}
