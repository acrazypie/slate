/**
 * Checks the date math in lib/recurrence.ts, including that stored events keep
 * their real date as time passes. Run with:
 *
 *   npx tsx scripts/test-recurrence.ts
 *   TZ=America/Los_Angeles npx tsx scripts/test-recurrence.ts   (any zone gives the same result)
 */
import { mock } from 'node:test';
import { format, startOfWeek, addWeeks } from 'date-fns';
import {
  EPOCH_WEEK_START,
  currentWeekOffset,
  dateForWeekOffset,
  dateFromKey,
  getSeriesOccurrenceDates,
  getSeriesOccurrenceWeekOffsets,
  isWeekOffsetInSeries,
  keyFromDate,
  storedOffsetFromView,
  viewOffsetFromStored,
  weekOffsetForDate,
} from '../lib/recurrence';
import { eventToBlockFields } from '../lib/googleCalendarPull';

let failures = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures++;
  console.log(`${ok ? 'ok  ' : 'FAIL'} ${label}: ${JSON.stringify(actual)}${ok ? '' : ` (expected ${JSON.stringify(expected)})`}`);
}
const day = (d: Date) => format(d, 'yyyy-MM-dd EEE');

/** Sets the system clock (what `new Date()` returns) to noon, local time, on the given day. */
function setClock(key: string) {
  mock.timers.reset();
  mock.timers.enable({ apis: ['Date'], now: new Date(`${key}T12:00:00`) });
  console.log(`\n--- system clock: ${day(new Date())} (TZ ${process.env.TZ || 'system'}) ---`);
}

/** What the old code did: resolve an offset against the current week. Kept here to show the bug. */
function oldDateForWeekOffset(weekOffset: number, dayOfWeek: number): Date {
  const weekStart = startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  return new Date(weekStart.getFullYear(), weekStart.getMonth(), weekStart.getDate() + dayOfWeek);
}

// ---------------------------------------------------------------------------
console.log('=== Fixed week numbers ===');
check('epoch is a Monday', dateFromKey(EPOCH_WEEK_START).getDay(), 1);
check('week of the epoch', weekOffsetForDate(dateFromKey('2024-01-01')), 0);
check('Sunday of the epoch week', weekOffsetForDate(dateFromKey('2024-01-07')), 0);
check('Sunday before the epoch', weekOffsetForDate(dateFromKey('2023-12-31')), -1);
check('Sun 2026-11-15', weekOffsetForDate(dateFromKey('2026-11-15')), 149);
check('Mon 2026-11-16', weekOffsetForDate(dateFromKey('2026-11-16')), 150);
check('week 149, Wednesday', keyFromDate(dateForWeekOffset(149, 2)), '2026-11-11');
// Round trip across ten years, which crosses every daylight-saving change.
let roundTrip = true;
for (let i = -800; i < 3000; i++) {
  const d = new Date(2024, 0, 1 + i);
  const back = dateForWeekOffset(weekOffsetForDate(d), (d.getDay() + 6) % 7);
  if (keyFromDate(back) !== keyFromDate(d) || back.getHours() !== 0) roundTrip = false;
}
check('date -> (week, day) -> date for 3800 consecutive days', roundTrip, true);

// ---------------------------------------------------------------------------
console.log('\n=== An event, a series and a skipped week, created "today" ===');
setClock('2026-11-15'); // a Sunday: tomorrow is the next Monday

// What the app writes when you create an event on Wed 11 Nov in the week on screen.
const stored = { week_offset: storedOffsetFromView(0), day_of_week: 2 };
const oldStored = { week_offset: 0, day_of_week: 2 }; // what the old code wrote
check('stored week_offset', stored.week_offset, 149);
check('event date', day(dateForWeekOffset(stored.week_offset, stored.day_of_week)), '2026-11-11 Wed');
check('old code, same day', day(oldDateForWeekOffset(oldStored.week_offset, oldStored.day_of_week)), '2026-11-11 Wed');

const weekly = { ...stored, is_recurring: true, recurrence_type: 'weekly' as const, recurrence_end_date: '2026-12-09' };
const monthly = { ...stored, is_recurring: true, recurrence_type: 'monthly' as const, recurrence_end_date: null };
const skippedWeek = weekOffsetForDate(dateFromKey('2026-11-25')); // "only this one" deleted on 25 Nov

const snapshot = () => ({
  event: day(dateForWeekOffset(stored.week_offset, stored.day_of_week)),
  weekly: getSeriesOccurrenceDates(weekly).map(day),
  monthly: getSeriesOccurrenceDates(monthly).slice(0, 4).map(day),
  skipped: day(dateForWeekOffset(skippedWeek, weekly.day_of_week)),
  shownWeekly: getSeriesOccurrenceWeekOffsets(weekly)
    .filter((w) => w !== skippedWeek)
    .map((w) => day(dateForWeekOffset(w, weekly.day_of_week))),
});
const before = snapshot();
check('weekly series (ends 9 Dec)', before.weekly, [
  '2026-11-11 Wed', '2026-11-18 Wed', '2026-11-25 Wed', '2026-12-02 Wed', '2026-12-09 Wed',
]);
check('monthly series (2nd Wednesday)', before.monthly, [
  '2026-11-11 Wed', '2026-12-09 Wed', '2027-01-13 Wed', '2027-02-10 Wed',
]);
check('skipped occurrence', before.skipped, '2026-11-25 Wed');
check('weekly series as shown', before.shownWeekly, [
  '2026-11-11 Wed', '2026-11-18 Wed', '2026-12-02 Wed', '2026-12-09 Wed',
]);
check('series is in week 152 (2 Dec)', isWeekOffsetInSeries(weekly, 152), true);
check('series is not in week 154 (ended)', isWeekOffsetInSeries(weekly, 154), false);
check('a plain event has one occurrence', getSeriesOccurrenceDates({ week_offset: 149, day_of_week: 1 }).length, 1);

for (const [clock, viewOffset] of [['2026-11-16', -1], ['2026-11-23', -2], ['2027-03-29', -20]] as const) {
  setClock(clock);
  check('event, series and skipped week unchanged', snapshot(), before);
  check('week to navigate to (0 = this week)', viewOffsetFromStored(stored.week_offset), viewOffset);
  check('...and back', storedOffsetFromView(viewOffset), stored.week_offset);
  const drifted = day(oldDateForWeekOffset(oldStored.week_offset, oldStored.day_of_week));
  console.log(`     (the old code would now show the event on ${drifted})`);
}

// ---------------------------------------------------------------------------
console.log('\n=== Which week is it? The server clock is not the user\'s ===');
mock.timers.reset();
// 23:30 UTC on Sunday 15 Nov is 00:30 on Monday 16 Nov in Rome.
const sundayNightUtc = new Date('2026-11-15T23:30:00Z');
check('current week in Europe/Rome', currentWeekOffset('Europe/Rome', sundayNightUtc), 150);
check('current week in UTC', currentWeekOffset('UTC', sundayNightUtc), 149);

// ---------------------------------------------------------------------------
console.log('\n=== Pulling from Google gives the same week whatever the clock says ===');
const googleEvent = {
  id: 'x',
  summary: 'Lezione',
  start: { dateTime: '2026-11-11T09:00:00+01:00' },
  end: { dateTime: '2026-11-11T10:00:00+01:00' },
  recurrence: ['RRULE:FREQ=WEEKLY;UNTIL=20261209T225900Z', 'EXDATE;TZID=Europe/Rome:20261125T090000'],
};
for (const clock of ['2026-11-15', '2026-11-16', '2027-03-29']) {
  setClock(clock);
  const pulled = eventToBlockFields(googleEvent as never);
  check('week_offset, day, end date, skipped weeks', [
    pulled?.fields.week_offset, pulled?.fields.day_of_week, pulled?.fields.recurrence_end_date, pulled?.skippedWeeks,
  ], [149, 2, '2026-12-09', [151]]);
}

mock.timers.reset();
console.log(failures === 0 ? '\nAll checks passed.' : `\n${failures} check(s) FAILED.`);
process.exit(failures === 0 ? 0 : 1);
