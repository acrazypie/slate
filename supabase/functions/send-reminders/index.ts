// Sends the reminders that are due. Runs every minute (pg_cron calls it with the
// shared secret). An item is due from its lead time before its start until the
// start. Each item is sent once per device: reminder_log remembers what went out.
// The items come from the browsers (see reminders-sync), already in their local time.

import webpush from 'npm:web-push@3.6.7';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { reminderText } from './messages.ts';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT')!, Deno.env.get('VAPID_PUBLIC_KEY')!, Deno.env.get('VAPID_PRIVATE_KEY')!);

const MINUTE = 60_000;
const DAY = 24 * 60 * MINUTE;

type Sub = { device_id: string; endpoint: string; p256dh: string; auth: string; locale: string };

Deno.serve(async (req) => {
  if (req.headers.get('x-cron-secret') !== Deno.env.get('CRON_SECRET')) {
    return new Response('forbidden', { status: 403 });
  }
  const now = Date.now();

  // Items that started more than a day ago are no longer needed.
  await supabase.from('reminder_items').delete().lt('starts_at', new Date(now - DAY).toISOString());

  // The longest lead is a week, so look that far ahead for items that may be due.
  const { data: items, error } = await supabase
    .from('reminder_items')
    .select('device_id,item_key,title,time_label,starts_at,lead_minutes')
    .gte('starts_at', new Date(now).toISOString())
    .lte('starts_at', new Date(now + 8 * DAY).toISOString());
  if (error) return new Response(error.message, { status: 500 });

  const due = (items ?? []).filter((i) => {
    const start = Date.parse(i.starts_at);
    return now >= start - i.lead_minutes * MINUTE && now < start;
  });
  if (due.length === 0) return Response.json({ sent: 0 });

  const deviceIds = [...new Set(due.map((i) => i.device_id))];
  const { data: subRows } = await supabase
    .from('push_subscriptions')
    .select('device_id,endpoint,p256dh,auth,locale')
    .in('device_id', deviceIds);
  const subsByDevice = new Map<string, Sub[]>();
  for (const s of (subRows ?? []) as Sub[]) subsByDevice.set(s.device_id, [...(subsByDevice.get(s.device_id) ?? []), s]);

  const { data: logged } = await supabase
    .from('reminder_log')
    .select('device_id,item_key,starts_at')
    .in('device_id', deviceIds)
    .gte('starts_at', new Date(now - DAY).toISOString());
  const done = new Set((logged ?? []).map((r) => `${r.device_id}|${r.item_key}|${new Date(r.starts_at).toISOString()}`));

  let sent = 0;
  for (const item of due) {
    const startsIso = new Date(item.starts_at).toISOString();
    if (done.has(`${item.device_id}|${item.item_key}|${startsIso}`)) continue;
    const subs = subsByDevice.get(item.device_id) ?? [];
    if (subs.length === 0) continue;

    for (const sub of subs) {
      const payload = JSON.stringify({
        title: item.title,
        body: reminderText(sub.locale ?? 'en', item.time_label),
        tag: item.item_key,
        url: '/dashboard',
      });
      try {
        await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload, { TTL: 3600 });
        sent++;
      } catch (err) {
        const status = (err as { statusCode?: number }).statusCode;
        // The browser dropped this subscription: forget it.
        if (status === 404 || status === 410) await supabase.from('push_subscriptions').delete().eq('endpoint', sub.endpoint);
      }
    }
    await supabase.from('reminder_log').upsert(
      { device_id: item.device_id, item_key: item.item_key, starts_at: startsIso },
      { onConflict: 'device_id,item_key,starts_at', ignoreDuplicates: true },
    );
  }
  return Response.json({ sent });
});
