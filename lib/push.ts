'use client';

// Web Push for reminders: subscribe this browser and keep the server's copy of
// the reminder settings in step with Settings.

import { createClient } from './supabase/client';
import { getLeadMinutes, getNotifySettings } from './reminders';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? '';

export function pushSupported(): boolean {
  return typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && VAPID_PUBLIC_KEY !== '';
}

function base64UrlToBytes(value: string): Uint8Array<ArrayBuffer> {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=');
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function currentRow(locale: string) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('not signed in');
  return {
    supabase,
    userId: user.id,
    prefs: {
      time_zone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC',
      lead_minutes: getLeadMinutes(),
      notify_events: getNotifySettings().events,
      notify_shifts: getNotifySettings().shifts,
      locale,
    },
  };
}

/** Subscribes this browser for reminders and saves the subscription and its settings. */
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
  const { supabase, userId, prefs } = await currentRow(locale);
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: userId,
      endpoint: subscription.endpoint,
      p256dh: json.keys?.p256dh ?? '',
      auth: json.keys?.auth ?? '',
      ...prefs,
    },
    { onConflict: 'endpoint' },
  );
  if (error) throw new Error(error.message);
}

/** Pushes the current reminder settings of this browser to the server, if it is subscribed. */
export async function syncReminderSettings(locale: string): Promise<void> {
  if (!pushSupported()) return;
  const registration = await navigator.serviceWorker.getRegistration('/sw.js');
  const subscription = await registration?.pushManager.getSubscription();
  if (!subscription) return;
  const { supabase, prefs } = await currentRow(locale);
  await supabase.from('push_subscriptions').update(prefs).eq('endpoint', subscription.endpoint);
}
