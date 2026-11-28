-- Web reminders without accounts. Each browser has a random key; the server keeps
-- only a SHA-256 hash of it. The browser uploads the reminder items it needs
-- (its next two weeks of blocks and shifts) and a Web Push subscription. Nothing
-- here is readable from the app: only the Edge Functions (service role) touch these
-- tables, so row level security is on with no policies.

create table public.devices (
  id uuid primary key default gen_random_uuid(),
  key_hash text not null unique,
  created_at timestamptz not null default now()
);

create table public.push_subscriptions (
  device_id uuid primary key references public.devices(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  locale text not null default 'en',
  updated_at timestamptz not null default now()
);

create table public.reminder_items (
  device_id uuid not null references public.devices(id) on delete cascade,
  item_key text not null,
  kind text not null check (kind in ('event', 'shift')),
  title text not null check (char_length(title) <= 200),
  time_label text not null check (char_length(time_label) <= 40),
  starts_at timestamptz not null,
  lead_minutes integer not null check (lead_minutes between 0 and 10080),
  primary key (device_id, item_key)
);
create index reminder_items_starts_at_idx on public.reminder_items (starts_at);

create table public.reminder_log (
  device_id uuid not null references public.devices(id) on delete cascade,
  item_key text not null,
  starts_at timestamptz not null,
  sent_at timestamptz not null default now(),
  primary key (device_id, item_key, starts_at)
);

alter table public.devices enable row level security;
alter table public.push_subscriptions enable row level security;
alter table public.reminder_items enable row level security;
alter table public.reminder_log enable row level security;
