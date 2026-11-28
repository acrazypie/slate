// Keeps one browser's reminders on the server, without an account. The browser
// sends its key (random, kept only on that device; the server stores a SHA-256
// hash of it), its Web Push subscription, and the reminder items it needs for the
// next two weeks. "forget" deletes everything for that key.

import { createClient } from 'npm:@supabase/supabase-js@2';

const supabase = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
const MAX_ITEMS = 400;

type Item = { key: string; kind: 'event' | 'shift'; title: string; timeLabel: string; startsAt: string; lead: number };

const json = (body: unknown, status = 200) => Response.json(body, { status });

async function hashKey(key: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(key));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function parseItems(raw: unknown): Item[] | null {
  if (!Array.isArray(raw) || raw.length > MAX_ITEMS) return null;
  const out: Item[] = [];
  for (const r of raw) {
    if (!r || typeof r !== 'object') return null;
    const { key, kind, title, timeLabel, startsAt, lead } = r as Record<string, unknown>;
    if (typeof key !== 'string' || key.length > 120) return null;
    if (kind !== 'event' && kind !== 'shift') return null;
    if (typeof title !== 'string' || title.length > 200) return null;
    if (typeof timeLabel !== 'string' || timeLabel.length > 40) return null;
    if (typeof startsAt !== 'string' || Number.isNaN(Date.parse(startsAt))) return null;
    if (typeof lead !== 'number' || !Number.isInteger(lead) || lead < 0 || lead > 10080) return null;
    out.push({ key, kind, title, timeLabel, startsAt: new Date(startsAt).toISOString(), lead });
  }
  return out;
}

function parseSubscription(raw: unknown): { endpoint: string; p256dh: string; auth: string } | null {
  if (!raw || typeof raw !== 'object') return null;
  const { endpoint, keys } = raw as { endpoint?: unknown; keys?: { p256dh?: unknown; auth?: unknown } };
  if (typeof endpoint !== 'string' || !endpoint.startsWith('https://') || endpoint.length > 2000) return null;
  if (typeof keys?.p256dh !== 'string' || keys.p256dh.length > 200) return null;
  if (typeof keys?.auth !== 'string' || keys.auth.length > 100) return null;
  return { endpoint, p256dh: keys.p256dh, auth: keys.auth };
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method' }, 405);
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'bad json' }, 400);
  }
  const key = body.key;
  if (typeof key !== 'string' || !/^[0-9a-f]{64}$/.test(key)) return json({ error: 'bad key' }, 400);
  const keyHash = await hashKey(key);

  if (body.action === 'forget') {
    const { error } = await supabase.from('devices').delete().eq('key_hash', keyHash);
    return error ? json({ error: 'failed' }, 500) : json({ ok: true });
  }

  if (body.action !== 'sync') return json({ error: 'action' }, 400);
  const items = parseItems(body.items);
  if (!items) return json({ error: 'items' }, 400);
  const locale = typeof body.locale === 'string' && /^[a-z]{2}$/.test(body.locale) ? body.locale : 'en';
  const subscription = body.subscription == null ? null : parseSubscription(body.subscription);
  if (body.subscription != null && !subscription) return json({ error: 'subscription' }, 400);

  const { data: device, error: deviceError } = await supabase
    .from('devices')
    .upsert({ key_hash: keyHash }, { onConflict: 'key_hash' })
    .select('id')
    .single();
  if (deviceError || !device) return json({ error: 'failed' }, 500);

  if (subscription) {
    const { error } = await supabase.from('push_subscriptions').upsert(
      { device_id: device.id, ...subscription, locale, updated_at: new Date().toISOString() },
      { onConflict: 'device_id' },
    );
    if (error) return json({ error: 'failed' }, 500);
  } else {
    await supabase.from('push_subscriptions').update({ locale }).eq('device_id', device.id);
  }

  const { error: clearError } = await supabase.from('reminder_items').delete().eq('device_id', device.id);
  if (clearError) return json({ error: 'failed' }, 500);
  if (items.length > 0) {
    const rows = items.map((i) => ({
      device_id: device.id,
      item_key: i.key,
      kind: i.kind,
      title: i.title,
      time_label: i.timeLabel,
      starts_at: i.startsAt,
      lead_minutes: i.lead,
    }));
    const { error } = await supabase.from('reminder_items').insert(rows);
    if (error) return json({ error: 'failed' }, 500);
  }
  return json({ ok: true, items: items.length });
});
