'use client';

import { useCallback, useMemo } from 'react';
import { eachWeekOfInterval } from 'date-fns';
import { useMonthBlocks, weekOffsetForDate } from './useMonthBlocks';
import { useShiftAssignments } from './useShifts';
import type { Period } from '@/lib/summaryRange';
import type { PeriodData } from '@/lib/summary';

/** Blocks and placed shifts for every day of a period, for the summary. */
export function usePeriodData(period: Period) {
  const { start, end } = period;
  const weekOffsets = useMemo(
    () => eachWeekOfInterval({ start, end }, { weekStartsOn: 1 }).map(weekOffsetForDate),
    [start, end],
  );
  const { blocks, loading: blocksLoading } = useMonthBlocks(weekOffsets);
  const { assignments } = useShiftAssignments(start, end);

  // An occurrence belongs to the day whose week and weekday it was made for.
  const blocksOn = useCallback(
    (day: Date) => {
      const week = weekOffsetForDate(day);
      const dayOfWeek = (day.getDay() + 6) % 7;
      return blocks.filter((b) => b.week_offset === week && b.day_of_week === dayOfWeek);
    },
    [blocks],
  );

  const data: PeriodData = useMemo(() => ({ blocksOn, assignments }), [blocksOn, assignments]);
  return { data, loading: blocksLoading };
}
