# Setup

How to get Slate running on your machine against your own Supabase project.

## Prerequisites

- Node.js 20.9 or newer (required by Next.js 16) and npm
- A [Supabase](https://supabase.com) account
- A Google Cloud project, only if you want Google sign-in or Google Calendar
  sync

## 1. Install dependencies

```bash
npm install
```

## 2. Create the Supabase project

1. Create a new project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** and run the schema from
   [database.md](database.md#full-schema). It creates the five tables and
   their row-level security policies.
3. Open **Project Settings → API** and copy the project URL and the `anon`
   public key.

## 3. Environment variables

Create `.env.local` in the project root. It is ignored by git.

| Variable | Required | Used for |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase `anon` public key |
| `GOOGLE_OAUTH_CLIENT_ID` | Calendar sync only | Refreshing Google access tokens on the server |
| `GOOGLE_OAUTH_CLIENT_SECRET` | Calendar sync only | Same |

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>

GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=
```

If the two Supabase variables are missing the app still builds, because the
clients fall back to placeholder values, but every sign-in and data request
fails. The Google variables are server-only and must never get a
`NEXT_PUBLIC_` prefix.

## 4. Configure authentication

In the Supabase dashboard, under **Authentication**:

**Providers**

- **Email**: enabled. With email confirmation on, new users must click the
  link in the confirmation email before they can sign in. The app's password
  fields require at least 6 characters, so keep Supabase's minimum at 6 or
  update the forms to match.
- **Google** (optional): enable it and paste the client ID and secret of a
  Google OAuth client. See [google-calendar.md](google-calendar.md) for how to
  create one; the same client serves sign-in and calendar sync.

**URL Configuration**

- **Site URL**: `http://localhost:3000` for local work, your domain in
  production.
- **Redirect URLs**: add every origin you use, for both callback routes.

  ```
  http://localhost:3000/auth/callback**
  http://localhost:3000/auth/google-calendar/callback
  https://<your-domain>/auth/callback**
  https://<your-domain>/auth/google-calendar/callback
  ```

  The `**` matters: the password-reset email links to
  `/auth/callback?next=/reset-password`, and the query string has to match.

## 5. Run

```bash
npm run dev
```

Open <http://localhost:3000>, choose **Inizia gratis** and create an account.

## Checks

```bash
npm run lint
```

```bash
npx tsx scripts/test-recurrence.ts
```

The second command prints the recurrence date math for a few sample series
next to the expected values. It is a manual sanity check, not an automated
test suite; the project has none yet. `tsx` is not a dependency, so `npx`
downloads it on first use.

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| Sign-in always fails with a generic error | Supabase URL or anon key missing or wrong in `.env.local`; restart `npm run dev` after editing it |
| Google sign-in returns to the login page | The callback URL is not in Supabase's Redirect URLs, or the Google provider is not enabled |
| Password-reset link does not open the reset form | The redirect URL entry is missing the `**` suffix, so Supabase ignored the requested URL and fell back to the Site URL |
| Data loads as empty with no error | Row-level security policies were not created; re-run the schema |
| `Acquiring an exclusive Navigator LockManager lock ... failed` in the console | More than one Supabase browser client was created. Always use `createClient()` from `lib/supabase/client.ts`, which returns a shared instance |
