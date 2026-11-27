'use client';

import { useEffect } from 'react';
import { ThemeProvider, useTheme } from 'next-themes';
import { applyAccent, getStoredAccent } from '@/lib/accent';
import { applyOled, getOled } from '@/lib/appearance';
import type { Locale } from '@/lib/i18n/config';
import { LanguageProvider } from './LanguageProvider';

/** Applies the stored accent and OLED setting on load, and again when the theme changes. */
function AppearanceSync() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    applyAccent(getStoredAccent(), resolvedTheme === 'light');
    applyOled(getOled() && resolvedTheme === 'dark');
  }, [resolvedTheme]);
  return null;
}

export function Providers({ locale, children }: { locale: Locale; children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <AppearanceSync />
      <LanguageProvider initialLocale={locale}>{children}</LanguageProvider>
    </ThemeProvider>
  );
}
