# Recurrence

A recurring event is stored as **one row** in `blocks`, the series. The row
holds the template (title, time, category, colour) and the rule; individual
occurrences are computed when a view loads and are never written to the
database. All of the date math lives in `lib/recurrence.ts`, which has no
browser dependencies and is shared by the client hooks and the Google Calendar
sync route.

## The rule

| Field | Meaning |
|---|---|
| `is_recurring` | `true` marks the row as a series |
| `recurrence_type` | `weekly` or `monthly` |
| `week_offset` + `day_of_week` | Date of the first occurrence. `week_offset` counts weeks from Monday 2024-01-01, see below |
| `recurrence_end_date` | Last day an occurrence may fall on; null for no end |

**Weekly** repeats every 7 days from the first occurrence.

**Monthly** means "the same weekday position every month". A series that
starts on the second Wednesday of a month repeats on the second Wednesday of
every month. If it starts on a *fifth* occurrence (not every month has one),
it is treated as "the last such weekday of the month", which is also how
Google Calendar reads that rule.

A series is expanded to at most **104 occurrences** (`MAX_OCCURRENCES`), about
two years of weekly events. A series with no end date stops appearing after
that.

## Week numbers

Every week has a fixed number: whole weeks since Monday 2024-01-01
(`EPOCH_WEEK_START`). That number is what `blocks.week_offset` and
`block_exceptions.occurrence_week_offset` hold, and what every function in
`lib/recurrence.ts` takes and returns, so a stored event names the same real
date whenever it is read. `weekOffsetForDate(date)` and
`dateForWeekOffset(week, day)` convert between the two; neither looks at the
clock, and both give the same answer in any time zone (the server runs in
UTC, the user is in `Europe/Rome`).

The calendar's navigation is the one thing that is relative to today:
`useWeek().weekOffset` is 0 for the current week. `useWeek` also returns
`storedWeekOffset`, the fixed number of the week on screen, which is what gets
passed to `useBlocks`; `goToDate(date)` goes the other way. Outside the hook,
`storedOffsetFromView` and `viewOffsetFromStored` do the same conversion, and
`currentWeekOffset(timeZone?)` gives the current week's number (pass a time
zone on the server).

## Loading a week

`useBlocks(storedWeekOffset)` runs two queries in parallel:

1. Plain events with `week_offset` equal to the requested week.
2. Candidate series: `is_recurring`, started on or before this week, and not
   ended before it. This is only a cheap database-side prefilter.

Each candidate is then checked with `isWeekOffsetInSeries`, which is what
actually decides membership (it matters for monthly series). For the series
that match, the hook loads `block_exceptions` for that week and drops the
skipped ones. Every surviving series is returned as a copy of the series row
with `week_offset` overwritten to the requested week.

So an occurrence in the UI is a synthesized object: **its `id` is the series
id, and its `week_offset` is the week you are looking at**, not the series
start. `useMonthBlocks` does the same for several weeks at once, fetching each
series a single time.

## Editing

Saving an edit on any occurrence updates the series row, so the change applies
to **every** occurrence, past and future. There is no "edit only this one".

## Deleting

The delete dialog offers three choices, handled in `components/WeekGrid.tsx`:

| Choice | What happens |
|---|---|
| Only this one | If it is the first occurrence, the series start moves to the next occurrence (or the series is deleted if none remain). Otherwise a `block_exceptions` row is inserted for that week |
| This and following | `recurrence_end_date` is set to the day before this occurrence, and exceptions from that week on are removed. Chosen on the first occurrence, it deletes the series |
| All | The series row is deleted; its exceptions go with it by cascade |

After each of these the series is re-pushed to Google Calendar (or deleted
there), so the mirrored event's `RRULE` and `EXDATE` lines stay in step. See
[google-calendar.md](google-calendar.md).

## Checking the math

```bash
npx tsx scripts/test-recurrence.ts
```

Checks weekly and monthly series, end dates and skipped weeks, and then
moves a fake system clock forward (past the next Monday, and by months) to
show that stored events, series and exceptions stay on the same dates. Run it
under another zone (`TZ=America/Los_Angeles npx tsx ...`) to see that the
results don't depend on it. Exits non-zero if a check fails.
