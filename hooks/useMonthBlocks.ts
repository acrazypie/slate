'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { startOfWeek, differenceInCalendarWeeks } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { Block } from '@/lib/types';

/**
 * Slate stores blocks by (week_offset, day_of_week) rather than an absolute date.
 * week_offset 0 always means "whichever real calendar week contains today",
 * recomputed relative to the current date — so to find the week_offset for any
 * arbitrary date, we measure how many Mon-starting weeks it is from this week.
 */
export function weekOffsetForDate(date: Date): number {
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const targetWeekStart = startOfWeek(date, { weekStartsOn: 1 });
  return differenceInCalendarWeeks(targetWeekStart, thisWeekStart, { weekStartsOn: 1 });
}

export function useMonthBlocks(weekOffsets: number[]) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Stable key so the effect only re-runs when the actual set of weeks changes.
  const key = useMemo(() => [...new Set(weekOffsets)].sort((a, b) => a - b).join(','), [weekOffsets]);

  const fetchBlocks = useCallback(async () => {
    const offsets = key ? key.split(',').map(Number) : [];
    if (offsets.length === 0) {
      setBlocks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from('blocks')
      .select('*')
      .in('week_offset', offsets);

    if (!error) {
      setBlocks(data || []);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, supabase]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  return { blocks, loading, refetch: fetchBlocks };
}
