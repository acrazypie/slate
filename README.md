# Slate

*La tua settimana, a blocchi.*

Slate is a time-block planner for students and young workers. You lay out your
week as coloured blocks (study, work, classes, anything else), keep a set of
reusable work shifts, and optionally copy everything you plan into Google
Calendar.

The interface is in Italian. Live at [slate.egenesio.com](https://slate.egenesio.com).

## Features

- **Day, week and month views** of the same calendar, with swipe and day-strip
  navigation on phones.
- **Events (blocks)** with a title, category, colour, start time, duration and
  notes.
- **Recurring events**, weekly or monthly ("every second Wednesday"), with an
  optional end date. One occurrence, this-and-following, or the whole series
  can be deleted.
- **Shifts**: define a shift once ("Mattina 09:00–13:00") and drop it on any
  day. Overnight shifts are supported.
- **Weekly summary** of hours per category, shifts included.
- **Google Calendar sync**, one way (Slate → Google), for events.
- **Accounts** with email and password or Google sign-in, plus password reset.
- **Light, dark and system themes**, a configurable accent colour and a
  default view, stored per device.
- Installable on a phone's home screen.

## Tech stack

| | |
|---|---|
| Framework | Next.js 16 (App Router), React 19, TypeScript |
| Data and auth | Supabase (Postgres with row-level security, Supabase Auth) |
| Styling | Tailwind CSS 4, `next-themes` |
| Dates | `date-fns` |
| Icons | `lucide-react` |
| Hosting | Vercel |

## Quick start

You need Node.js 20.9 or newer and a Supabase project.

```bash
npm install
```

Create `.env.local` in the project root:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>

# Only for Google Calendar sync
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
```

Create the database tables by running the SQL in
[docs/database.md](docs/database.md#full-schema) in the Supabase SQL editor,
then start the app:

```bash
npm run dev
```

Open <http://localhost:3000>. The full walkthrough, including auth providers
and redirect URLs, is in [docs/setup.md](docs/setup.md).

## Documentation

| Doc | What it covers |
|---|---|
| [Setup](docs/setup.md) | Local environment, Supabase project, auth providers, environment variables |
| [Architecture](docs/architecture.md) | Project layout, routes, data flow, auth, theming, known limitations |
| [Database](docs/database.md) | Tables, row-level security, the full schema SQL |
| [Recurrence](docs/recurrence.md) | How recurring events are stored, expanded and deleted |
| [Google Calendar sync](docs/google-calendar.md) | Google Cloud setup, the connect flow, how events are pushed |
| [Deployment](docs/deployment.md) | Deploying to Vercel and the production checklist |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |
| `npx tsx scripts/test-recurrence.ts` | Print a sanity check of the recurrence date math |
