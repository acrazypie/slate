'use client';

import { useCallback, useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { Rotation, RotationFormData } from '@/lib/types';

/** The user's rotations, and placing them on the calendar as shift assignments. */
export function useRotations() {
  const [rotations, setRotations] = useState<Rotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const fetchRotations = useCallback(async () => {
    const { data, error: fetchError } = await supabase
      .from('rotations')
      .select('*')
      .order('created_at', { ascending: true });
    if (fetchError) {
      setError(fetchError.message);
      setRotations([]);
    } else {
      setError(null);
      setRotations((data || []) as Rotation[]);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchRotations();
  }, [fetchRotations]);

  const createRotation = async (formData: RotationFormData): Promise<Rotation | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error: insertError } = await supabase
      .from('rotations')
      .insert([{ ...formData, user_id: user.id }])
      .select()
      .single();
    if (insertError) {
      setError(insertError.message);
      return null;
    }
    setRotations((prev) => [...prev, data as Rotation]);
    return data as Rotation;
  };

  const updateRotation = async (id: string, formData: RotationFormData): Promise<Rotation | null> => {
    const { data, error: updateError } = await supabase
      .from('rotations')
      .update(formData)
      .eq('id', id)
      .select()
      .single();
    if (updateError) {
      setError(updateError.message);
      return null;
    }
    setRotations((prev) => prev.map((r) => (r.id === id ? (data as Rotation) : r)));
    return data as Rotation;
  };

  const deleteRotation = async (id: string): Promise<boolean> => {
    const { error: deleteError } = await supabase.from('rotations').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      return false;
    }
    setRotations((prev) => prev.filter((r) => r.id !== id));
    return true;
  };

  /**
   * Places the rotation from `from` for `days` days. Shifts already on the
   * calendar stay, and days that already hold the same shift are skipped.
   * Returns how many shifts were placed.
   */
  const placeRotation = async (rotation: Rotation, from: Date, days: number): Promise<number> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return 0;
    const last = addDays(from, days - 1);
    const { data: existing, error: readError } = await supabase
      .from('shift_assignments')
      .select('shift_id, shift_date')
      .gte('shift_date', format(from, 'yyyy-MM-dd'))
      .lte('shift_date', format(last, 'yyyy-MM-dd'));
    if (readError) {
      setError(readError.message);
      return 0;
    }
    const taken = new Set((existing || []).map((a) => `${a.shift_date}|${a.shift_id}`));
    const rows: { user_id: string; shift_id: string; shift_date: string }[] = [];
    for (let i = 0; i < days; i++) {
      const shiftId = rotation.pattern[i % rotation.pattern.length];
      if (!shiftId) continue;
      const shiftDate = format(addDays(from, i), 'yyyy-MM-dd');
      if (taken.has(`${shiftDate}|${shiftId}`)) continue;
      rows.push({ user_id: user.id, shift_id: shiftId, shift_date: shiftDate });
    }
    if (rows.length === 0) return 0;
    const { error: insertError } = await supabase.from('shift_assignments').insert(rows);
    if (insertError) {
      setError(insertError.message);
      return 0;
    }
    return rows.length;
  };

  return {
    rotations,
    loading,
    error,
    createRotation,
    updateRotation,
    deleteRotation,
    placeRotation,
  };
}
