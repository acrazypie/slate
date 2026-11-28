'use client';

import { useCallback, useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import { db } from '@/lib/localDb';
import { Rotation, RotationFormData } from '@/lib/types';

/** The user's rotations, and placing them on the calendar as shift assignments. */
export function useRotations() {
  const [rotations, setRotations] = useState<Rotation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRotations = useCallback(async () => {
    const { data, error: fetchError } = await db
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
  }, [db]);

  useEffect(() => {
    fetchRotations();
  }, [fetchRotations]);

  const createRotation = async (formData: RotationFormData): Promise<Rotation | null> => {
    const { data, error: insertError } = await db
      .from('rotations')
      .insert([{ ...formData }])
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
    const { data, error: updateError } = await db
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
    const { error: deleteError } = await db.from('rotations').delete().eq('id', id);
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
    const last = addDays(from, days - 1);
    const { data: existing, error: readError } = await db
      .from('shift_assignments')
      .select('shift_id, shift_date')
      .gte('shift_date', format(from, 'yyyy-MM-dd'))
      .lte('shift_date', format(last, 'yyyy-MM-dd'));
    if (readError) {
      setError(readError.message);
      return 0;
    }
    const taken = new Set((existing || []).map((a: { shift_date: string; shift_id: string }) => `${a.shift_date}|${a.shift_id}`));
    const rows: { shift_id: string; shift_date: string }[] = [];
    for (let i = 0; i < days; i++) {
      const shiftId = rotation.pattern[i % rotation.pattern.length];
      if (!shiftId) continue;
      const shiftDate = format(addDays(from, i), 'yyyy-MM-dd');
      if (taken.has(`${shiftDate}|${shiftId}`)) continue;
      rows.push({ shift_id: shiftId, shift_date: shiftDate });
    }
    if (rows.length === 0) return 0;
    const { error: insertError } = await db.from('shift_assignments').insert(rows);
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
