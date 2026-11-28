'use client';

import { useState, useCallback, useEffect } from 'react';
import { db } from '@/lib/localDb';
import { Block, BlockFormData } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { dateForWeekOffset, isWeekOffsetInSeries, keyFromDate, SeriesLike } from '@/lib/recurrence';

/**
 * `weekOffset` is a stored week offset (weeks since the epoch week in
 * lib/recurrence.ts), not the 0-is-this-week offset `useWeek` navigates by:
 * pass `useWeek().storedWeekOffset` or `currentWeekOffset()`.
 */
export function useBlocks(weekOffset: number) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    setError(null);

    // Plain, non-recurring blocks that actually live in this week.
    const plainPromise = db
      .from('blocks')
      .select('*')
      .eq('week_offset', weekOffset)
      .eq('is_recurring', false);

    // Candidate recurring series that could plausibly reach this week (started
    // on/before it, and not already ended before it). Exact membership for
    // monthly series still needs the real recurrence math below - this is
    // just a cheap DB-side prefilter.
    const weekDate = keyFromDate(dateForWeekOffset(weekOffset, 0));
    const seriesPromise = db
      .from('blocks')
      .select('*')
      .eq('is_recurring', true)
      .lte('week_offset', weekOffset)
      .or(`recurrence_end_date.is.null,recurrence_end_date.gte.${weekDate}`);

    const [{ data: plain, error: plainError }, { data: series, error: seriesError }] = await Promise.all([
      plainPromise,
      seriesPromise,
    ]);

    if (plainError || seriesError) {
      setError((plainError || seriesError)?.message || 'Errore nel caricamento');
      setBlocks([]);
      setLoading(false);
      return;
    }

    const matchingSeries = (series || []).filter((s: Block) => isWeekOffsetInSeries(s as SeriesLike, weekOffset));

    let occurrences: Block[] = [];
    if (matchingSeries.length > 0) {
      const { data: exceptions } = await db
        .from('block_exceptions')
        .select('block_id')
        .in(
          'block_id',
          matchingSeries.map((s: Block) => s.id)
        )
        .eq('occurrence_week_offset', weekOffset);

      const skipped = new Set((exceptions || []).map((e: { block_id: string }) => e.block_id));
      occurrences = matchingSeries
        .filter((s: Block) => !skipped.has(s.id))
        .map((s: Block) => ({ ...s, week_offset: weekOffset }));
    }

    const combined = [...(plain || []), ...occurrences].sort((a, b) => {
      if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
      if (a.start_hour !== b.start_hour) return a.start_hour - b.start_hour;
      return a.start_minute - b.start_minute;
    });

    setBlocks(combined);
    setLoading(false);
  }, [weekOffset, db]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  // `weekOffsetOverride` lets a caller (the month view) create a block in a
  // week other than the one this hook is currently showing.
  const createBlock = async (formData: BlockFormData, weekOffsetOverride?: number): Promise<Block | null> => {
    const targetWeekOffset = weekOffsetOverride ?? weekOffset;
    const id = uuidv4();
    const isRecurring = !!(formData.is_recurring && formData.recurrence_type);

    const newBlock = {
      ...formData,
      id,
      week_offset: targetWeekOffset,
      notes: formData.notes || null,
      is_recurring: isRecurring,
      recurrence_type: isRecurring ? formData.recurrence_type : undefined,
      recurrence_end_date: isRecurring ? formData.recurrence_end_date : undefined,
      // One row IS the whole series now - this is just a stable "is this a
      // series root" marker (recurrence_group_id === id), kept for
      // compatibility with existing checks like `block.recurrence_group_id`.
      recurrence_group_id: isRecurring ? id : undefined,
    };

    const { data, error } = await db
      .from('blocks')
      .insert([newBlock])
      .select()
      .single();

    if (error) {
      setError(error.message);
      return null;
    }

    if (targetWeekOffset === weekOffset) {
      setBlocks((prev) => [...prev, data].sort((a, b) => {
        if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
        if (a.start_hour !== b.start_hour) return a.start_hour - b.start_hour;
        return a.start_minute - b.start_minute;
      }));
    }

    return data;
  };

  const updateBlock = async (id: string, formData: Partial<BlockFormData>): Promise<Block | null> => {
    // NOTE: for a recurring series, `id` is the series root - this edits the
    // template, so the change applies to every future occurrence at once,
    // not just the one that was clicked.
    const { data, error } = await db
      .from('blocks')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      setError(error.message);
      return null;
    }

    setBlocks((prev) =>
      prev.map((b) => (b.id === id ? { ...data, week_offset: b.week_offset } : b)).sort((a, b) => {
        if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
        if (a.start_hour !== b.start_hour) return a.start_hour - b.start_hour;
        return a.start_minute - b.start_minute;
      })
    );

    return data;
  };

  const deleteBlock = async (id: string): Promise<boolean> => {
    // For a non-recurring block only - deleting one occurrence or a whole
    // recurring series goes through the dedicated recurrence-aware handlers
    // in WeekGrid (deleteOccurrence / truncateSeriesBefore / deleteEntireSeries),
    // since those need exception rows and start-date bookkeeping this
    // single-row delete doesn't know about.
    const { error } = await db
      .from('blocks')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
      return false;
    }

    setBlocks((prev) => prev.filter((b) => b.id !== id));

    return true;
  };

  return {
    blocks,
    loading,
    error,
    createBlock,
    updateBlock,
    deleteBlock,
    refetch: fetchBlocks,
  };
}
