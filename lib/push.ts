'use client';

// Web Push reminders without an account. This browser subscribes for push, then
// uploads its push subscription and its reminder items (see reminderItems.ts) to
// the reminders-sync function, keyed by the random device key (deviceKey.ts).
// Turning reminders off asks the server to forget this browser.

import { getDeviceKey } from './deviceKey';
import { buildReminderItems } from './reminderItems';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';
const SYNC_URL = 'https://iafdpjvgwrdwzhdkebkk.supabase.co/functions/v1/reminders-sync';
export const REMINDERS_ON_KEY = 'slate-reminders-on';

export function pushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && VAPID_PUBLIC_KEY !== '';
}

export function remindersOn(): boolean {
  try {
    return localStorage.getItem(REMINDERS_ON_KEY) === 'true';
  } catch {
    return false;
  }
}

function setRemindersOn(on: boolean) {
  try {
    localStorage.setItem(REMINDERS_ON_KEY, on ? 'true' : 'false');
  } catch {
    // Storage unavailable: the choice lasts for this visit.
  }
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function post(body: Record<string, unknown>): Promise<void> {
  const res = await fetch(SYNC_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ key: getDeviceKey(), ...body }),
  });
  if (!res.ok) throw new Error(`reminders sync failed: ${res.status}`);
}

async function currentSubscription(): Promise<PushSubscription | null> {
  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  return (await registration?.pushManager.getSubscription()) ?? null;
}

/** Subscribes this browser for reminders and uploads the subscription and the next two weeks of items. */
export async function subscribeForReminders(locale: string): Promise<void> {
  if (!pushSupported()) throw new Error('push not supported');
  const registration = await navigator.serviceWorker.register('/sw.js');
  await navigator.serviceWorker.ready;
  let subscription = await registration.pushManager.getSubscription();
  if (!subscription) {
    subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: base64UrlToBytes(VAPID_PUBLIC_KEY),
    });
  }
  const json = subscription.toJSON();
  await post({
    action: 'sync',
    locale,
    subscription: { endpoint: subscription.endpoint, keys: { p256dh: json.keys?.p256dh ?? '', auth: json.keys?.auth ?? '' } },
    items: await buildReminderItems(),
  });
  setRemindersOn(true);
}

/** Uploads the current reminder items, if this browser has reminders on. */
export async function syncReminders(locale: string): Promise<void> {
  if (!pushSupported() || !remindersOn()) return;
  if (!(await currentSubscription())) return;
  await post({ action: 'sync', locale, items: await buildReminderItems() });
}

/** Unsubscribes this browser and asks the server to delete everything it stored for it. */
export async function turnOffReminders(): Promise<void> {
  const subscription = await currentSubscription();
  await subscription?.unsubscribe();
  await post({ action: 'forget' });
  setRemindersOn(false);
}
