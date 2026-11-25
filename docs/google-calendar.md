# Google Calendar

Google Calendar is no longer connected to the website. This page explains what happens instead, and
where Google sync now lives.

## Where Google sync lives now

Google sync is part of the **Slate app** (Android now, iOS later). It runs on the user's device:

- Sign-in uses Google's SDK on the phone. The access token is kept in the phone's preferences and
  is sent only to Google. No Slate server holds it.
- Slate's own blocks and shifts are copied to a calendar named **Slate** in the user's Google
  account, when the user turns on copying.
- Events from the user's Google calendars are read in real time while the app is open (refreshed
  every 30 seconds and when the app comes back to the foreground). They are shown with a
  **Google** tag and are read-only in Slate.
- Settings › Account has one master switch for all Google features.

The app's setup steps (Google Cloud project, OAuth clients, SHA-1 fingerprints, the
`VITE_GOOGLE_WEB_CLIENT_ID` build variable) are in the app repository: `docs/google-setup.md`.

## What the website does now

- **No Google sign-in or calendar access.** The login page offers email and password. The
  `/auth/google-calendar/callback` route and the `/api/google-calendar/*` routes were removed.
- **No Google tokens are stored.** The `google_calendar_tokens` table was dropped from the
  database; it held no rows when it was dropped.
- **No push or pull.** Blocks and shifts created on the website are not copied to Google. The
  `blocks.google_event_id` and `blocks.google_updated_at` columns still exist but are unused.
- **Existing Google events are not shown.** Events in Google calendars do not appear on the
  website any more.

## Cleaning up Google Cloud

These are the website's old settings. They can be removed once the app is set up:

1. In the Google Cloud console, **Credentials → the Web client → Authorized redirect URIs**, remove
   `https://<project-ref>.supabase.co/auth/v1/callback` if the Google provider is no longer used by
   the website. Keep it if you still sign in to the website with Google.
2. **Authentication → Providers → Google** in Supabase can be disabled if Google sign-in is not
   needed on the website.
3. Remove `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET` from the website's hosting
   environment. They are no longer read by the code.
4. Remove `/auth/google-calendar/callback` from the Supabase **Redirect URLs** list.

## Removing a user's Google access

A user who connected Google through the old website flow still has access granted in their Google
account. To revoke it, the user can go to **Google Account → Security → Third-party access** and
remove Slate. The stored token has already been deleted from the database.
