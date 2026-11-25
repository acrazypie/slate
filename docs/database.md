# Database

Slate stores everything in Supabase Postgres, in the `public` schema. The
browser talks to the database directly with the `anon` key, so **row-level
security (RLS) is the only thing separating one user's data from another's**.
Every table has RLS enabled and every policy is scoped to `auth.uid()`.

There are no database functions, triggers or migration files. The schema below
was reconstructed from the live project; when you change the schema, update
this page in the same change.

## Tables at a glance

| Table | One row is | Owner column |
|---|---|---|
| `blocks` | An event, or a whole recurring series | `user_id` |
| `block_exceptions` | One skipped occurrence of a recurring series | via `blocks.user_id` |
| `shifts` | A reusable shift definition | `user_id` |
| `shift_assignments` | A shift placed on one calendar day | `user_id` |

Deleting a user cascades to all of their rows. Deleting a block cascades to
its exceptions; deleting a shift cascades to its assignments.

## `blocks`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key. Generated in the browser on insert |
| `user_id` | `uuid` | References `auth.users`, cascade delete |
| `title` | `text` | |
| `category` | `text` | `studio`, `lavoro`, `lezione` or `altro`. Default `altro`. Not enforced by a constraint |
| `color` | `text` | Hex colour, e.g. `#E49C69` |
| `day_of_week` | `integer` | `0` = Monday … `6` = Sunday |
| `start_hour` | `integer` | 0–23 |
| `start_minute` | `integer` | Default `0` |
| `duration_minutes` | `integer` | Default `60` |
| `week_offset` | `integer` | The week the event is in, counted in whole weeks from Monday 2024-01-01 (`0` is the week of 2024-01-01, `149` the week of 2026-11-09). See the note below |
| `notes` | `text` | Nullable |
| `is_recurring` | `boolean` | Default `false`. When `true`, this row is a series, not a single event |
| `recurrence_type` | `text` | `weekly` or `monthly` (check constraint). Null when not recurring |
| `recurrence_end_date` | `date` | Last day the series may occur. Null means no end |
| `recurrence_group_id` | `uuid` | Equals `id` for a series. Left over from the old one-row-per-occurrence model; the code still uses it as an "is a series" marker |
| `google_event_id` | `text` | ID of the mirrored Google Calendar event, once synced |
| `google_updated_at` | `timestamptz` | Google's `updated` stamp of that event when Slate last pushed or pulled it. Lets the pull tell an edit made in Google from the echo of Slate's own push |
| `created_at` | `timestamptz` | Default `now()` |

For a series, `week_offset` and `day_of_week` together give the date of the
**first** occurrence. Later occurrences are computed, never stored. See
[recurrence.md](recurrence.md).

> **`week_offset` is a fixed week number, not "weeks from now".** Together
> with `day_of_week` it names one real calendar date, the same one for ever:
> `date '2024-01-01' + week_offset * 7 + day_of_week`. The epoch is
> `EPOCH_WEEK_START` in `lib/recurrence.ts`, and `weekOffsetForDate` /
> `dateForWeekOffset` convert in both directions. The same numbering is used
> by `block_exceptions.occurrence_week_offset`. Before the
> [epoch migration](#migrations) both columns were relative to the current
> week, which made every event slide forward a week each Monday.

## `block_exceptions`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `block_id` | `uuid` | The series, references `blocks`, cascade delete |
| `occurrence_week_offset` | `integer` | The week whose occurrence is skipped, numbered like `blocks.week_offset` |
| `created_at` | `timestamptz` | |

Unique on `(block_id, occurrence_week_offset)`. Rows can be inserted, read and
deleted but not updated; there is no update policy.

## `shifts`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | References `auth.users`, cascade delete |
| `title` | `text` | |
| `start_hour`, `end_hour` | `integer` | 0–23 (check constraints) |
| `start_minute`, `end_minute` | `integer` | 0–59 (check constraints). Default `0` |
| `color` | `text` | Default `#6BB6A3` |
| `created_at` | `timestamptz` | |

A shift whose end is at or before its start runs past midnight.

## `shift_assignments`

| Column | Type | Notes |
|---|---|---|
| `id` | `uuid` | Primary key |
| `user_id` | `uuid` | References `auth.users`, cascade delete |
| `shift_id` | `uuid` | References `shifts`, cascade delete |
| `shift_date` | `date` | The calendar day |
| `created_at` | `timestamptz` | |

Unique on `(shift_id, shift_date)`: the same shift cannot be placed twice on
one day. The app treats that unique violation (`23505`) as a no-op. The insert
policy also checks that the shift belongs to the user. Assignments cannot be
updated, only inserted and deleted.

> The `google_calendar_tokens` table was dropped. The website no longer connects to Google;
> see [google-calendar.md](google-calendar.md).

## Migrations

There are still no migration files; changes to an existing project are listed
here, newest last. The full schema below already includes them.

**Two-way Google Calendar sync.** Run once on a project created before it.
Until it has run, pushing to Google keeps working, but changes made in Google
are not pulled back and calendars cannot be hidden.

```sql
alter table public.blocks
  add column if not exists google_updated_at timestamptz;

alter table public.google_calendar_tokens
  add column if not exists hidden_calendar_ids text[] not null default '{}',
  add column if not exists last_pulled_at timestamptz;
```

**Fixed week numbers (events no longer drift).** Run **once**, in the same
moment the code that reads the new numbering is deployed: old code with
migrated rows shows every event about three years ahead, new code with
unmigrated rows shows them in January 2024.

Stored offsets used to mean "weeks from the current week", so the only way to
read the existing rows is "relative to the week this migration runs in", which
is exactly where the app shows them at that moment. Events that had already
drifted stay on the date they drifted to; this stops the drift, it cannot undo
it. The week is worked out in `Europe/Rome`. A second run is refused, because
it would move everything again.

```sql
begin;

do $$
begin
  if coalesce(col_description('public.blocks'::regclass,
       (select attnum from pg_attribute
         where attrelid = 'public.blocks'::regclass and attname = 'week_offset')), '')
     like 'Weeks since%' then
    raise exception 'week_offset is already anchored to the epoch week: not running twice';
  end if;
end $$;

-- Weeks between the epoch Monday and the Monday of the current week in Rome.
create temporary table _slate_week_shift on commit drop as
  select (date_trunc('week', now() at time zone 'Europe/Rome')::date - date '2024-01-01') / 7 as weeks;

update public.blocks
   set week_offset = week_offset + (select weeks from _slate_week_shift);

update public.block_exceptions
   set occurrence_week_offset = occurrence_week_offset + (select weeks from _slate_week_shift);

-- 0 no longer means "this week", so it is not a safe default any more.
alter table public.blocks alter column week_offset drop default;

comment on column public.blocks.week_offset is
  'Weeks since Monday 2024-01-01 (EPOCH_WEEK_START in lib/recurrence.ts). With day_of_week: date ''2024-01-01'' + week_offset * 7 + day_of_week.';
comment on column public.block_exceptions.occurrence_week_offset is
  'Weeks since Monday 2024-01-01, the same numbering as blocks.week_offset.';

commit;
```

To check before committing (or afterwards), this lists every event with the
date it now has:

```sql
select title, is_recurring, date '2024-01-01' + week_offset * 7 + day_of_week as starts_on
  from public.blocks order by starts_on;
```

## Full schema

Run this once in the Supabase SQL editor on a new project.

```sql
-- ---------------------------------------------------------------------------
-- blocks: events and recurring series
-- ---------------------------------------------------------------------------
create table public.blocks (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid not null references auth.users(id) on delete cascade,
  title               text not null,
  category            text not null default 'altro',
  color               text not null default '#6366f1',
  day_of_week         integer not null,
  start_hour          integer not null,
  start_minute        integer not null default 0,
  duration_minutes    integer not null default 60,
  week_offset         integer not null, -- weeks since Monday 2024-01-01
  notes               text,
  created_at          timestamptz default now(),
  is_recurring        boolean not null default false,
  recurrence_type     text check (recurrence_type in ('weekly', 'monthly')),
  recurrence_end_date date,
  recurrence_group_id uuid,
  google_event_id     text,
  google_updated_at   timestamptz
);

create index idx_blocks_recurrence_group
  on public.blocks (recurrence_group_id)
  where recurrence_group_id is not null;

alter table public.blocks enable row level security;

create policy "Users can manage their own blocks"
  on public.blocks for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- block_exceptions: skipped occurrences of a series
-- ---------------------------------------------------------------------------
create table public.block_exceptions (
  id                     uuid primary key default gen_random_uuid(),
  block_id               uuid not null references public.blocks(id) on delete cascade,
  occurrence_week_offset integer not null, -- weeks since Monday 2024-01-01
  created_at             timestamptz not null default now(),
  unique (block_id, occurrence_week_offset)
);

alter table public.block_exceptions enable row level security;

create policy "Users can view exceptions on their own blocks"
  on public.block_exceptions for select
  using (exists (
    select 1 from public.blocks
    where blocks.id = block_exceptions.block_id and blocks.user_id = auth.uid()
  ));

create policy "Users can insert exceptions on their own blocks"
  on public.block_exceptions for insert
  with check (exists (
    select 1 from public.blocks
    where blocks.id = block_exceptions.block_id and blocks.user_id = auth.uid()
  ));

create policy "Users can delete exceptions on their own blocks"
  on public.block_exceptions for delete
  using (exists (
    select 1 from public.blocks
    where blocks.id = block_exceptions.block_id and blocks.user_id = auth.uid()
  ));

-- ---------------------------------------------------------------------------
-- shifts: reusable shift definitions
-- ---------------------------------------------------------------------------
create table public.shifts (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  title        text not null,
  start_hour   integer not null check (start_hour between 0 and 23),
  start_minute integer not null default 0 check (start_minute between 0 and 59),
  end_hour     integer not null check (end_hour between 0 and 23),
  end_minute   integer not null default 0 check (end_minute between 0 and 59),
  color        text not null default '#6BB6A3',
  created_at   timestamptz not null default now()
);

alter table public.shifts enable row level security;

create policy "Users can view their own shifts"
  on public.shifts for select using (auth.uid() = user_id);
create policy "Users can insert their own shifts"
  on public.shifts for insert with check (auth.uid() = user_id);
create policy "Users can update their own shifts"
  on public.shifts for update using (auth.uid() = user_id);
create policy "Users can delete their own shifts"
  on public.shifts for delete using (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- shift_assignments: a shift placed on a day
-- ---------------------------------------------------------------------------
create table public.shift_assignments (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  shift_id   uuid not null references public.shifts(id) on delete cascade,
  shift_date date not null,
  created_at timestamptz not null default now(),
  unique (shift_id, shift_date)
);

create index shift_assignments_user_date_idx
  on public.shift_assignments (user_id, shift_date);
create index shift_assignments_shift_idx
  on public.shift_assignments (shift_id);

alter table public.shift_assignments enable row level security;

create policy "Users can view their own shift assignments"
  on public.shift_assignments for select
  using ((select auth.uid()) = user_id);

create policy "Users can insert their own shift assignments"
  on public.shift_assignments for insert
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.shifts s
      where s.id = shift_assignments.shift_id and s.user_id = (select auth.uid())
    )
  );

create policy "Users can delete their own shift assignments"
  on public.shift_assignments for delete
  using ((select auth.uid()) = user_id);

-- ---------------------------------------------------------------------------
-- google_calendar_tokens: one row per connected user
-- ---------------------------------------------------------------------------
create table public.google_calendar_tokens (
  user_id       uuid primary key references auth.users(id) on delete cascade,
  access_token  text not null,
  refresh_token text not null,
  expires_at    timestamptz not null,
  calendar_id   text not null default 'primary',
  hidden_calendar_ids text[] not null default '{}',
  last_pulled_at timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

alter table public.google_calendar_tokens enable row level security;

create policy "Users can view their own Google Calendar tokens"
  on public.google_calendar_tokens for select using (auth.uid() = user_id);
create policy "Users can insert their own Google Calendar tokens"
  on public.google_calendar_tokens for insert with check (auth.uid() = user_id);
create policy "Users can update their own Google Calendar tokens"
  on public.google_calendar_tokens for update using (auth.uid() = user_id);
create policy "Users can delete their own Google Calendar tokens"
  on public.google_calendar_tokens for delete using (auth.uid() = user_id);
```
