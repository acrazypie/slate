'use client';

import { useEffect } from 'react';
import { ThemeProvider } from 'next-themes';
import { applyAccent, getStoredAccent } from '@/lib/accent';

export function Providers({ children }: { children: React.ReactNode }) {
  // Re-apply the accent colour the user picked in Settings on every load.
  useEffect(() => {
    applyAccent(getStoredAccent());
  }, []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  );
}
