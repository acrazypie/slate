# Google Calendar sync

Slate can copy a user's events into their Google Calendar. The sync is **one
way, Slate → Google**: changes made in Google Calendar never come back, and
shifts are not synced.

## Google Cloud setup

1. In the [Google Cloud console](https://console.cloud.google.com), create a
   project and enable the **Google Calendar API**.
2. Configure the **OAuth consent screen**. Add the scope
   `https://www.googleapis.com/auth/calendar.events`. It is a sensitive scope:
   while the app is in testing only listed test users can connect, and
   publishing it to everyone requires Google's verification.
3. Create an **OAuth client ID** of type *Web application*. Set its authorized
   redirect URI to your Supabase callback:

   ```
   https://<project-ref>.supabase.co/auth/v1/callback
   ```

4. In Supabase, under **Authentication → Providers → Google**, paste the
   client ID and secret.
5. Put the **same** client ID and secret in the app's environment as
   `GOOGLE_OAUTH_CLIENT_ID` and `GOOGLE_OAUTH_CLIENT_SECRET`. The server uses
   them to refresh access tokens, and a refresh token only works with the
   client that issued it.
6. Add `<origin>/auth/google-calendar/callback` to Supabase's Redirect URLs
   for every origin you use.

## Connecting

The user starts from **Impostazioni → Google Calendar → Connetti Google
Calendar**.

1. `useGoogleCalendarConnection.connect()` calls Supabase's Google OAuth with
   the `calendar.events` scope, `access_type=offline` and `prompt=consent`, so
   Google returns a refresh token.
2. Google redirects through Supabase to `/auth/google-calendar/callback`.
3. That route exchanges the code for a session, reads `provider_token` and
   `provider_refresh_token` from it, and upserts a row in
   `google_calendar_tokens`. If Google sends no refresh token on a reconnect,
   the stored one is kept.
4. The user is sent to `/dashboard?calendar=connected`, or
   `/dashboard?calendar=error` on failure. Nothing reads that query parameter
   yet, so there is no confirmation message.

**Disconnect** deletes the token row. It does not revoke the grant on Google's
side and does not remove events already copied.

## Pushing events

Every create, update and delete of an event calls `syncToGoogleCalendar()`
(`lib/googleCalendarClient.ts`), which POSTs to `/api/google-calendar/sync`
and ignores the result. The Supabase write has already succeeded by then, so
the UI never waits on Google and a failed sync is silent.

### `POST /api/google-calendar/sync`

Requires a signed-in session (cookie). Body is one of:

```json
{ "action": "upsert", "blockIds": ["<block id>"] }
```

```json
{ "action": "delete", "eventIds": ["<google event id>"] }
```

| Response | Meaning |
|---|---|
| `401 { "error": "Not authenticated" }` | No session |
| `200 { "skipped": true }` | User has not connected Google Calendar, or the token refresh failed |
| `200 { "ok": true, "synced": n }` | `n` events created or updated |
| `200 { "ok": true, "deleted": n }` | `n` events deleted |
| `400` | Blocks could not be loaded, or unknown action |

For an upsert the route loads the blocks (restricted to the caller's own),
and for each one creates a Google event or, if `google_event_id` is set,
patches the existing one. If the patch returns 404 because the event was
deleted in Google, a new event is created. The resulting event ID is written
back to `blocks.google_event_id`.

### How a block becomes an event

| Slate | Google event |
|---|---|
| `title` | `summary` |
| `notes` | `description` |
| start time and `duration_minutes` | `start` / `end` with `timeZone: Europe/Rome` |
| A recurring series | A single recurring event with an `RRULE` |
| `recurrence_type = weekly` | `RRULE:FREQ=WEEKLY` |
| `recurrence_type = monthly` | `RRULE:FREQ=MONTHLY;BYDAY=2WE` (position and weekday of the first occurrence; `-1` for "last") |
| `recurrence_end_date` | `;UNTIL=<date>T235959Z` |
| Each `block_exceptions` row | An `EXDATE` line |

Category and colour are not sent.

### Tokens

`getValidAccessToken()` returns the stored access token if it has more than a
minute left. Otherwise it exchanges the refresh token at Google's token
endpoint, saves the new access token and expiry, and returns it. If the user
revoked access in their Google account the refresh fails, the function returns
null, and sync quietly stops until they reconnect.

## Limitations

- All events are created in `Europe/Rome`; blocks carry no per-user timezone.
- An event that ends after midnight has its end time wrapped to the same day.
- The access-token lifetime is assumed to be one hour when first stored.
- Sync failures are not surfaced to the user or retried.
