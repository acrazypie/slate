'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Block } from '@/lib/types';
import { dateForWeekOffset, isWeekOffsetInSeries, SeriesLike } from '@/lib/recurrence';

export { weekOffsetForDate } from '@/lib/recurrence';

/**
 * Fetches every block visible across a set of weeks (for the month view),
 * expanding recurring series into one synthesized occurrence per matching
 * week. A series is stored as a single root row, so it's fetched once and
 * then checked against every requested week rather than queried per-week.
 */
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

    const minOffset = Math.min(...offsets);
    const maxOffset = Math.max(...offsets);
    const minDate = dateForWeekOffset(minOffset, 0).toISOString().slice(0, 10);

    const plainPromise = supabase
      .from('blocks')
      .select('*')
      .in('week_offset', offsets)
      .eq('is_recurring', false);

    const seriesPromise = supabase
      .from('blocks')
      .select('*')
      .eq('is_recurring', true)
      .lte('week_offset', maxOffset)
      .or(`recurrence_end_date.is.null,recurrence_end_date.gte.${minDate}`);

    const [{ data: plain, error: plainError }, { data: series, error: seriesError }] = await Promise.all([
      plainPromise,
      seriesPromise,
    ]);

    if (plainError || seriesError) {
      setBlocks([]);
      setLoading(false);
      return;
    }

    const seriesList = (series || []) as Block[];
    let exceptionsBySeriesId = new Map<string, Set<number>>();
    if (seriesList.length > 0) {
      const { data: exceptions } = await supabase
        .from('block_exceptions')
        .select('block_id, occurrence_week_offset')
        .in('block_id', seriesList.map((s) => s.id));

      exceptionsBySeriesId = new Map();
      for (const ex of exceptions || []) {
        const set = exceptionsBySeriesId.get(ex.block_id) || new Set<number>();
        set.add(ex.occurrence_week_offset);
        exceptionsBySeriesId.set(ex.block_id, set);
      }
    }

    const occurrences: Block[] = [];
    for (const series of seriesList) {
      const skipped = exceptionsBySeriesId.get(series.id);
      for (const offset of offsets) {
        if (skipped?.has(offset)) continue;
        if (isWeekOffsetInSeries(series as SeriesLike, offset)) {
          occurrences.push({ ...series, week_offset: offset });
        }
      }
    }

    setBlocks([...(plain || []), ...occurrences]);
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, supabase]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  return { blocks, loading, refetch: fetchBlocks };
}
