import { format } from 'date-fns';
import {
  getSeriesOccurrenceDates,
  getSeriesOccurrenceWeekOffsets,
  weekOffsetForDate,
  dateForWeekOffset,
  isWeekOffsetInSeries,
} from '../lib/recurrence';

const today = new Date();
console.log('Today:', format(today, 'yyyy-MM-dd EEEE'));
console.log('weekOffsetForDate(today):', weekOffsetForDate(today), '(should be 0)');

// Weekly series starting this week, every week, 6 occurrences then ending.
const weekly = {
  week_offset: 0,
  day_of_week: 2, // Wednesday
  is_recurring: true,
  recurrence_type: 'weekly' as const,
  recurrence_end_date: null,
};
const weeklyDates = getSeriesOccurrenceDates(weekly).slice(0, 5);
console.log('\nWeekly series (Wed, every week), first 5 occurrences:');
weeklyDates.forEach((d) => console.log(' ', format(d, 'yyyy-MM-dd EEEE')));
const gapsOk = weeklyDates.every((d, i) => i === 0 || (d.getTime() - weeklyDates[i - 1].getTime()) / 86400000 === 7);
console.log('All gaps exactly 7 days:', gapsOk);

// Monthly series: same weekday-position every month.
const monthly = {
  week_offset: 0,
  day_of_week: 2,
  is_recurring: true,
  recurrence_type: 'monthly' as const,
  recurrence_end_date: null,
};
const startDate = dateForWeekOffset(monthly.week_offset, monthly.day_of_week);
console.log('\nMonthly series start date:', format(startDate, 'yyyy-MM-dd EEEE'));
const monthlyDates = getSeriesOccurrenceDates(monthly).slice(0, 6);
console.log('First 6 occurrences:');
monthlyDates.forEach((d) => console.log(' ', format(d, 'yyyy-MM-dd EEEE')));
const sameWeekdayAllMonths = monthlyDates.every((d) => d.getDay() === startDate.getDay());
const allDifferentMonths = new Set(monthlyDates.map((d) => `${d.getFullYear()}-${d.getMonth()}`)).size === monthlyDates.length;
console.log('All same weekday:', sameWeekdayAllMonths, '| all in different months:', allDifferentMonths);

// recurrence_end_date truncation
const ended = { ...weekly, recurrence_end_date: format(weeklyDates[2], 'yyyy-MM-dd') };
const endedOffsets = getSeriesOccurrenceWeekOffsets(ended);
console.log('\nWeekly series ended right after 3rd occurrence -> offsets:', endedOffsets, '(should have length 3: [0,1,2])');

// isWeekOffsetInSeries membership check
console.log('\nisWeekOffsetInSeries(weekly, 3):', isWeekOffsetInSeries(weekly, 3), '(should be true)');
console.log('isWeekOffsetInSeries(ended, 3):', isWeekOffsetInSeries(ended, 3), '(should be false - series ended)');

// Non-recurring block
const single = { week_offset: 5, day_of_week: 1, is_recurring: false };
console.log('\nNon-recurring occurrence count:', getSeriesOccurrenceDates(single).length, '(should be 1)');
