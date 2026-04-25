'use client';

import { useState, useCallback, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Block, BlockFormData } from '@/lib/types';

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
    
    return data;
  };

  const deleteBlock = async (id: string): Promise<boolean> => {
    const { error } = await supabase
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