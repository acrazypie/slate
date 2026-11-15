# Architecture

Slate is a Next.js App Router application with almost no server code of its
own. The browser reads and writes Supabase directly; Postgres row-level
security enforces who can see what. The server is involved in only three
places: refreshing the auth session on each request, handling OAuth callbacks,
and talking to Google Calendar (pushing Slate's events, pulling changes back,
and reading and editing the user's Google events).

```
Browser (React client components)
  │
  ├── Supabase JS client ──────────────►  Supabase Postgres (RLS) + Auth
  │
  └── /api/google-calendar/* ──────────►  Next.js routes ──►  Google Calendar API
```

## Project layout

```
app/
  page.tsx                          Landing page
  layout.tsx                        Root layout: fonts, <Providers>
  globals.css                       Tailwind theme and colour tokens
  auth/login/page.tsx               Sign in, sign up, request password reset
  auth/callback/route.ts            OAuth / email-link code exchange
  auth/google-calendar/callback/    Stores Google Calendar tokens
  reset-password/page.tsx           Choose a new password
  dashboard/page.tsx                The app: calendar, shifts, settings tabs
  api/google-calendar/sync/route.ts Push events to Google Calendar
  api/google-calendar/events/       Pull changes back; list, edit, delete Google events
  api/google-calendar/calendars/    List the user's Google calendars
  privacy/, terms/                  Legal pages
components/                         UI (all client components)
hooks/                              Data hooks, one per concern
lib/
  supabase/client.ts                Shared browser Supabase client
  supabase/server.ts                Server Supabase client (cookies)
  supabase/middleware.ts            Session refresh and route guards
  recurrence.ts                     Recurring-series date math
  googleCalendar.ts                 Server-side Google Calendar calls
  googleCalendarPull.ts             Applies changes made in Google to blocks
  googleCalendarClient.ts           Browser side: push trigger, events and calendars fetches
  types.ts                          Shared types, palettes, formatters
  accent.ts                         Accent colour storage
  authErrors.ts                     Italian messages for Supabase auth errors
middleware.ts                       Runs lib/supabase/middleware.ts
scripts/test-recurrence.ts          Manual check of the recurrence math
```

## Routes

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Landing page |
| `/auth/login` | Signed-out only | Sign in, sign up, request a reset link |
| `/auth/callback` | Public | Exchanges an auth code for a session, then redirects to `next` (same-site paths only) or `/dashboard` |
| `/auth/google-calendar/callback` | Public | Saves Google tokens after the calendar consent |
| `/reset-password` | Signed in via the email link | Set a new password |
| `/dashboard` | Signed-in only | The application |
| `/api/google-calendar/sync` | Signed-in only (401 otherwise) | Push or delete Google Calendar events |
| `/api/google-calendar/events` | Signed-in only | Pull changes from Google; list, edit and delete Google events |
| `/api/google-calendar/calendars` | Signed-in only | The user's Google calendars |
| `/privacy`, `/terms` | Public | Legal pages |

## Authentication

Supabase Auth with cookies, via `@supabase/ssr`.

- `middleware.ts` runs on every request except static assets. It refreshes the
  session cookie, redirects signed-out visitors from `/dashboard` to
  `/auth/login`, and redirects signed-in visitors from `/auth/*` to
  `/dashboard`. The two callback routes are exempt, so a signed-in person can
  still follow a password-reset link or finish connecting Google Calendar.
- Sign-in methods: email and password, and Google OAuth.
- **Password reset**: the login page asks Supabase to email a link to
  `/auth/callback?next=/reset-password`. The callback signs the person in and
  forwards them to `/reset-password`, which lives outside `/auth` precisely
  because signed-in users are redirected away from `/auth/*`.
- Supabase's English error messages are mapped to Italian in
  `lib/authErrors.ts`; anything unrecognised becomes a generic message.

The browser client in `lib/supabase/client.ts` is a singleton on purpose.
Supabase coordinates token refresh with the Web Locks API, and two instances
fight over the same lock.

## The dashboard

`app/dashboard/page.tsx` is one client page with three tabs held in React
state (not separate routes):

| Tab | Component | Contents |
|---|---|---|
| Calendario | `WeekGrid` | Day, week and month views; creating and editing events; placing shifts |
| Turni | `ShiftsView` | Managing shift definitions |
| Impostazioni | `SettingsView` | Account, theme, accent colour, default view, Google Calendar, install guide |

Navigation is a bottom bar below the `md` breakpoint (`BottomNav`) and the
left sidebar from `md` up (`Sidebar`). The sidebar also shows the hour
summaries for the current week and the current month; on phones it opens as a
full-screen drawer.

`WeekGrid` is the largest component. It owns the view mode, the selected day,
swipe handling, the current-time line, and the recurring-delete logic. Month
view is `MonthGrid`; tapping a day there opens `DaySheet`. Tapping an empty
slot opens `CreateChoiceSheet` (event or shift), then `BlockModal` or
`ShiftModal`. Events from Google Calendar are drawn by `GoogleEventCard` and
open in `GoogleEventModal`. Every overlay is built on `Dialog`, which gives a bottom sheet
on phones and a centred card on larger screens, with focus trapping, Escape
and click-outside to close.

## Data hooks

| Hook | Reads | Writes |
|---|---|---|
| `useWeek` | — | The week on screen, both as a navigation offset (`weekOffset`, 0 = this week) and as the stored week number (`storedWeekOffset`), and the view mode (persisted to `localStorage`) |
| `useBlocks(storedWeekOffset)` | Events and expanded series for one week | Create, update, delete events; triggers Google sync |
| `useMonthBlocks(weekOffsets)` | The same, across several weeks | — |
| `useShifts` | Shift definitions | Create, update, delete |
| `useShiftAssignments(start, end)` | Shifts placed in a date range | Assign, unassign |
| `useGoogleCalendarConnection` | Whether a token row exists; the user's calendars | Connect, disconnect, show or hide a calendar |
| `useGoogleEvents(start, end)` | Google events in a date range; also triggers the pull of changes made in Google | — |

Each hook keeps its own local state and there is no shared cache. When the
calendar or shifts tab changes something, it calls `onDataChange`, and the
dashboard refetches the data behind the weekly and monthly summaries.

Week numbering is Monday-first throughout: `day_of_week` 0 is Monday, and
weeks start on Monday in every `date-fns` call.

How recurring events are expanded is described in
[recurrence.md](recurrence.md).

## Theming

Colours are CSS custom properties defined in `app/globals.css` and exposed to
Tailwind through `@theme`, so classes like `bg-surface` and `text-accent-text`
follow the active theme. `next-themes` toggles a class on `<html>`; the
default is dark.

Two preferences are stored per device in `localStorage`, not in the account:

| Key | Value |
|---|---|
| `slate-accent` | Accent colour as a hex string. Applied by `Providers` on load by overriding `--color-accent` and `--color-accent-contrast` |
| `slate-default-view` | `day`, `week` or `month` |

Fonts are DM Sans for the interface and DM Serif Display for headings, loaded
with `next/font`.

## Known limitations

These are properties of the code as it stands, found while documenting it.
(Events used to drift forward a week every Monday; that is fixed, see the
`week_offset` note in [database.md](database.md#blocks).)

1. **Editing a recurring event changes the whole series.** There is no way to
   edit a single occurrence.
2. **Series are capped at 104 occurrences**, so an open-ended weekly series
   disappears after about two years.
3. **Google Calendar sync** uses a fixed `Europe/Rome` timezone, skips
   shifts, and its pushes fail silently. Details in
   [google-calendar.md](google-calendar.md#limitations).
4. **The summaries always cover the current week and month**, whichever
   period the calendar is showing. Google events are not counted.
5. **`middleware.ts` uses a deprecated convention.** Next.js 16 renamed it to
   `proxy.ts`; the old name still works for now.
6. **No automated tests and no migration files.** The schema exists only in
   the Supabase project and in [database.md](database.md).
7. **`@dnd-kit/*` is installed but unused**; there is no drag and drop.
8. **`AGENTS.md` and `CLAUDE.md` are listed in `.gitignore` but tracked**, so
   the ignore rule has no effect on them.
10. **The repository has no licence file.**
