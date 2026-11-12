'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Block, BlockFormData } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';

// Fire-and-forget: pushes to Google Calendar if the user has it connected,
// silently no-ops otherwise. Never blocks the UI on a slow/failed network call.
function syncToGoogleCalendar(body: { action: 'upsert'; blockIds: string[] } | { action: 'delete'; eventIds: string[] }) {
  fetch('/api/google-calendar/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {
    // Best-effort only; the local save already succeeded.
  });
}

export function useBlocks(weekOffset: number = 0) {
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchBlocks = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    const { data, error: fetchError } = await supabase
      .from('blocks')
      .select('*')
      .eq('week_offset', weekOffset)
      .order('start_hour', { ascending: true })
      .order('start_minute', { ascending: true });

    if (fetchError) {
      setError(fetchError.message);
      setBlocks([]);
    } else {
      setBlocks(data || []);
    }
    setLoading(false);
  }, [weekOffset, supabase]);

  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  const createBlock = async (formData: BlockFormData): Promise<Block | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    if (formData.is_recurring && formData.recurrence_type) {
      const groupId = uuidv4();
      const blocks: Partial<Block>[] = [];
      const maxOccurrences = 52;
      
      const baseDate = new Date();
      
      for (let i = 0; i < maxOccurrences; i++) {
        const weekOffsetInc = formData.recurrence_type === 'weekly' ? i : Math.floor((i * 30) / 7);
        
        if (formData.recurrence_end_date) {
          const occurrenceDate = new Date(baseDate);
          occurrenceDate.setDate(occurrenceDate.getDate() + (weekOffsetInc * 7));
          if (occurrenceDate > new Date(formData.recurrence_end_date)) {
            break;
          }
        }
        
        blocks.push({
          ...formData,
          user_id: user.id,
          week_offset: weekOffset + weekOffsetInc,
          notes: formData.notes || null,
          is_recurring: true,
          recurrence_type: formData.recurrence_type,
          recurrence_end_date: formData.recurrence_end_date,
          recurrence_group_id: groupId,
          id: uuidv4(),
        });
      }

      const { data, error } = await supabase
        .from('blocks')
        .insert(blocks as any)
        .select();

      if (error) {
        setError(error.message);
        return null;
      }

      setBlocks((prev) => [...prev, ...(data || [])].sort((a, b) => {
        if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
        if (a.start_hour !== b.start_hour) return a.start_hour - b.start_hour;
        return a.start_minute - b.start_minute;
      }));

      if (data && data.length > 0) {
        syncToGoogleCalendar({ action: 'upsert', blockIds: data.map((b) => b.id) });
      }

      return data?.[0] || null;
    }

    const newBlock = {
      ...formData,
      user_id: user.id,
      week_offset: weekOffset,
      notes: formData.notes || null,
    };

    const { data, error } = await supabase
      .from('blocks')
      .insert([newBlock])
      .select()
      .single();

    if (error) {
      setError(error.message);
      return null;
    }

    setBlocks((prev) => [...prev, data].sort((a, b) => {
      if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
      if (a.start_hour !== b.start_hour) return a.start_hour - b.start_hour;
      return a.start_minute - b.start_minute;
    }));

    syncToGoogleCalendar({ action: 'upsert', blockIds: [data.id] });

    return data;
  };

  const updateBlock = async (id: string, formData: Partial<BlockFormData>): Promise<Block | null> => {
    const { data, error } = await supabase
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
      prev.map((b) => (b.id === id ? data : b)).sort((a, b) => {
        if (a.day_of_week !== b.day_of_week) return a.day_of_week - b.day_of_week;
        if (a.start_hour !== b.start_hour) return a.start_hour - b.start_hour;
        return a.start_minute - b.start_minute;
      })
    );

    syncToGoogleCalendar({ action: 'upsert', blockIds: [id] });

    return data;
  };

  const deleteBlock = async (id: string): Promise<boolean> => {
    const existing = blocks.find((b) => b.id === id);

    const { error } = await supabase
      .from('blocks')
      .delete()
      .eq('id', id);

    if (error) {
      setError(error.message);
      return false;
    }

    setBlocks((prev) => prev.filter((b) => b.id !== id));

    if (existing?.google_event_id) {
      syncToGoogleCalendar({ action: 'delete', eventIds: [existing.google_event_id] });
    }

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