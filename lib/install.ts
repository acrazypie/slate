'use client';

// Home-screen install help for phones. An iPhone installs the web app only from
// Safari, and an Android phone from Chrome; other browsers, and in-app browsers
// (links opened inside a mail or social app), cannot. Tablets and desktops are
// not offered the step at all.

export type InstallGuide = { platform: 'ios' | 'android'; rightBrowser: boolean };

/** The install guide for this visitor, or null when the step does not apply. */
export function installGuide(): InstallGuide | null {
  if (typeof navigator === 'undefined' || typeof window === 'undefined') return null;
  const ua = navigator.userAgent;
  const standalone =
    window.matchMedia('(display-mode: standalone)').matches || (navigator as Navigator & { standalone?: boolean }).standalone === true;
  if (standalone) return null;
  if (/iPad/.test(ua)) return null;
  if (/iPhone|iPod/.test(ua)) {
    const rightBrowser = /Safari\//.test(ua) && !/CriOS|FxiOS|EdgiOS|OPiOS|FBAN|FBAV|Instagram|Line\/|GSA\/|Snapchat|LinkedInApp|Twitter/.test(ua);
    return { platform: 'ios', rightBrowser };
  }
  if (/Android/.test(ua) && /Mobile/.test(ua)) {
    const rightBrowser =
      (/Chrome\//.test(ua) && !/; wv\)/.test(ua) && !/EdgA|OPR|Firefox/.test(ua)) || /SamsungBrowser\//.test(ua);
    return { platform: 'android', rightBrowser };
  }
  return null;
}

/** Copies text to the clipboard; falls back for browsers without the Clipboard API. */
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = text;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const ok = document.execCommand('copy');
      area.remove();
      return ok;
    } catch {
      return false;
    }
  }
}
