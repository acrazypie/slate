# Google Calendar sync

Slate and Google Calendar are synced **in both directions**:

- **Slate's own events** are copied to the user's Google Calendar, and changes
  made to those copies in Google come back into Slate.
- **Events that live in Google** (any of the user's calendars) are shown in
  Slate's day, week and month views and can be edited or deleted from there.

Shifts are not synced.

## Google Cloud setup

1. In the [Google Cloud console](https://console.cloud.google.com), create a
   project and enable the **Google Calendar API**.
2. Configure the **OAuth consent screen** and add both scopes:

   | Scope | Used for |
   |---|---|
   | `https://www.googleapis.com/auth/calendar.events` | Reading and writing events on every calendar the user can access |
   | `https://www.googleapis.com/auth/calendar.calendarlist.readonly` | Listing the user's calendars (names, colours, access level) |

   `calendar.events` is a sensitive scope: while the app is in testing only
   listed test users can connect, and publishing it to everyone requires
   Google's verification. Verification also expects the privacy policy to say
   that calendar data is read; the current policy text does not mention it.
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
7. Run the two-way sync migration from [database.md](database.md#migrations)
   if the project was created before it.

## Connecting

The user starts from **Settings → Google Calendar → Connect Google Calendar**.

1. `useGoogleCalendarConnection.connect()` calls Supabase's Google OAuth with
   the two scopes above, `access_type=offline` and `prompt=consent`, so Google
   returns a refresh token.
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

**Connections made before two-way sync** only hold `calendar.events`. They keep
working, but cannot list calendars: Slate then shows just the primary calendar
and Settings offers a **Reconnect** button to grant the second scope.

### Choosing calendars

Once connected, Settings lists the user's calendars with a checkbox each.
Unticking one adds its id to `google_calendar_tokens.hidden_calendar_ids`
(written straight from the browser); its events are then left out. New
calendars are shown by default. Calendars the user can only read are marked
read-only.

## The two kinds of event

| | Slate event | Google event |
|---|---|---|
| Stored in | `blocks`, linked to its Google copy by `google_event_id` | Google only; fetched live, never stored |
| Has a category and colour | Yes | No: it takes the calendar's or the event's Google colour |
| Counted in the hour summaries | Yes | No |
| Edited with | The event dialog (`BlockModal`) | `GoogleEventModal` |

A Google event that is the copy of a Slate event is never shown twice: the
events endpoint drops everything whose id (or series id) is some block's
`google_event_id`.

## Slate → Google: pushing

Every create, update and delete of a Slate event calls
`syncToGoogleCalendar()` (`lib/googleCalendarClient.ts`), which POSTs to
`/api/google-calendar/sync` and ignores the result. The Supabase write has
already succeeded by then, so the UI never waits on Google and a failed push
is silent. Pushes run one at a time, in order.

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
patches the existing one. If the event was deleted in Google, a new one is
created. The event id and Google's `updated` stamp are written back to
`blocks.google_event_id` and `blocks.google_updated_at`.

### How a block becomes an event

| Slate | Google event |
|---|---|
| `title` | `summary` |
| `notes` | `description` |
| start time and `duration_minutes` | `start` / `end` with `timeZone: Europe/Rome`; the end moves to the next day when the event runs past midnight |
| A recurring series | A single recurring event with an `RRULE` |
| `recurrence_type = weekly` | `RRULE:FREQ=WEEKLY` |
| `recurrence_type = monthly` | `RRULE:FREQ=MONTHLY;BYDAY=2WE` (position and weekday of the first occurrence; `-1` for "last") |
| `recurrence_end_date` | `;UNTIL=` 23:59 on that date in `Europe/Rome`, written in UTC |
| Each `block_exceptions` row | An `EXDATE` line |
| Repeat switched off | The rule is cleared with a second PATCH |

Category and colour are not sent.

## Google → Slate

Both halves happen in one request, made by `useGoogleEvents` whenever a view
loads a range of days, and again when the browser tab becomes visible.

### `GET /api/google-calendar/events?from=yyyy-MM-dd&to=yyyy-MM-dd`

| Response | Meaning |
|---|---|
| `401` | No session |
| `400` | Missing or malformed range |
| `200 { "connected": false, "events": [], "blocksChanged": false }` | Google Calendar is not connected |
| `200 { "connected": true, "events": [...], "blocksChanged": bool }` | See below |
| `502` | Google could not be reached |

**Step 1, pull** (`pullGoogleChanges` in `lib/googleCalendarPull.ts`). Asks
Google for every event in Slate's calendar updated since
`google_calendar_tokens.last_pulled_at` (deleted ones included) and applies
the ones linked to a block:

| Change in Google | Effect in Slate |
|---|---|
| Title, notes, day, time, length or repeat rule edited | The block is updated to match |
| Event deleted | The block is deleted |
| One occurrence of a series deleted | A `block_exceptions` row (that week is skipped) |
| One occurrence of a series edited | That week is skipped and a separate one-off block is created, linked to the occurrence |
| Event made all-day, or given a repeat rule Slate lacks (daily, every two weeks, several weekdays, by day of month) | The block is deleted; the event stays in Google and shows as a Google event |

A change is only applied if Google's `updated` stamp is later than the
block's `google_updated_at`, which is how Slate tells an edit made in Google
from the echo of its own push. `blocksChanged` tells the client to reload its
blocks. The very first pull after connecting applies nothing and only records
the time.

**Step 2, list.** Returns the events of every calendar that is not hidden,
with recurring events expanded into occurrences. Left out: copies of Slate
events, cancelled events, events the user declined, and working-location
entries. Each event carries `canEdit`, false when the calendar is read-only,
the event was organised by someone else (and guests may not modify it), or it
is a special type such as a birthday.

Times are converted to wall-clock dates and hours in `Europe/Rome` on the
server. An event that runs past midnight is drawn as one piece per day;
all-day events appear in a row above the hours (week and day views) and as
chips in the month view.

### `PATCH /api/google-calendar/events`

```json
{
  "calendarId": "<calendar id>",
  "eventId": "<event or occurrence id>",
  "scope": "this",
  "changes": {
    "title": "...", "notes": "...", "allDay": false,
    "startDate": "2026-11-18", "endDate": "2026-11-18",
    "start_hour": 9, "start_minute": 0, "end_hour": 10, "end_minute": 30
  }
}
```

Writes the edit to Google. Start and end are only sent if they changed, so
renaming an event leaves its time zone alone. For an occurrence of a recurring
event, `scope: "all"` changes the series instead: title and notes, and the
time of day if it moved. Moving a whole series to another date is refused
(`400 { "result": "unsupported" }`), since its repeat rule would have to change
too; the dialog applies a date change to the single occurrence.

### `DELETE /api/google-calendar/events`

`{ "calendarId", "eventId", "scope" }`. Deletes the event, or with
`scope: "all"` the series it belongs to.

Both return `{ "result": "ok" | "not-found" | "unsupported" | "failed" }` with
status 200, 404, 400 or 502, and `409` if Google Calendar is not connected.

### `GET /api/google-calendar/calendars`

`{ "connected", "calendars": [{ id, name, color, primary, canEdit, visible }], "needsReconnect" }`.

## Tokens

`getValidAccessToken()` returns the stored access token if it has more than a
minute left. Otherwise it exchanges the refresh token at Google's token
endpoint, saves the new access token and expiry, and returns it. If the user
revoked access in their Google account the refresh fails, the function returns
null, and sync quietly stops until they reconnect.

## Limitations

- Everything is read and written in `Europe/Rome`; blocks carry no per-user
  timezone, so in another timezone events appear at Rome's clock time.
- Events that drifted before the [fixed week numbers](database.md#migrations)
  migration keep the date they had drifted to in Slate, while their Google
  copy kept the original one. Nothing reconciles the two: the next edit of
  such an event in Slate moves the Google copy to Slate's date.
- New Google events cannot be created from Slate in a chosen calendar: a new
  event is always a Slate event, copied to the primary calendar.
- Google events cannot be given a repeat rule or have it changed from Slate,
  and there is no "this and following" for them.
- Overlapping events are drawn side by side; shifts are not part of that
  layout.
- The access-token lifetime is assumed to be one hour when first stored.
- Push failures are not surfaced to the user or retried. A failed edit of a
  Google event is reported in its dialog.
