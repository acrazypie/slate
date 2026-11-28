'use client';

// This browser's reminder key: 32 random bytes, kept only in localStorage. The
// server stores a hash of it, never the key, so the key identifies this browser
// to the reminder service without an account.

const KEY = 'slate-device-key';
const FORMAT = /^[0-9a-f]{64}$/;

export function getDeviceKey(): string {
  try {
    const existing = localStorage.getItem(KEY);
    if (existing && FORMAT.test(existing)) return existing;
    const bytes = crypto.getRandomValues(new Uint8Array(32));
    const key = Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
    localStorage.setItem(KEY, key);
    return key;
  } catch {
    throw new Error('storage unavailable');
  }
}
