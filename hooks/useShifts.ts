'use client';

import { useState, useCallback, useEffect } from 'react';
import { format } from 'date-fns';
import { db } from '@/lib/localDb';
import { Shift, ShiftAssignment, ShiftFormData } from '@/lib/types';

const byStart = (a: Shift, b: Shift) =>
  a.start_hour * 60 + a.start_minute - (b.start_hour * 60 + b.start_minute) || a.title.localeCompare(b.title);

/** The user's shift definitions (name + start/end time). */
export function useShifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchShifts = useCallback(async () => {
    const { data, error: fetchError } = await db.from('shifts').select('*');
    if (fetchError) {
      setError(fetchError.message);
      setShifts([]);
    } else {
      setError(null);
      setShifts(((data || []) as Shift[]).sort(byStart));
    }
    setLoading(false);
  }, [db]);

  useEffect(() => {
    fetchShifts();
  }, [fetchShifts]);

  const createShift = async (formData: ShiftFormData): Promise<Shift | null> => {

    const { data, error: insertError } = await db
      .from('shifts')
      .insert([{ ...formData }])
      .select()
      .single();

    if (insertError) {
      setError(insertError.message);
      return null;
    }
    setShifts((prev) => [...prev, data as Shift].sort(byStart));
    return data as Shift;
  };

  const updateShift = async (id: string, formData: ShiftFormData): Promise<Shift | null> => {
    const { data, error: updateError } = await db
      .from('shifts')
      .update(formData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      setError(updateError.message);
      return null;
    }
    setShifts((prev) => prev.map((s) => (s.id === id ? (data as Shift) : s)).sort(byStart));
    return data as Shift;
  };

  /** Deletes the definition; its placements on the calendar go with it (FK cascade). */
  const deleteShift = async (id: string): Promise<boolean> => {
    const { error: deleteError } = await db.from('shifts').delete().eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      return false;
    }
    setShifts((prev) => prev.filter((s) => s.id !== id));
    return true;
  };

  return { shifts, loading, error, createShift, updateShift, deleteShift, refetch: fetchShifts };
}

/** Shifts placed on days within [rangeStart, rangeEnd], each joined with its definition. */
export function useShiftAssignments(rangeStart: Date, rangeEnd: Date) {
  const [assignments, setAssignments] = useState<ShiftAssignment[]>([]);

  const startKey = format(rangeStart, 'yyyy-MM-dd');
  const endKey = format(rangeEnd, 'yyyy-MM-dd');

  const fetchAssignments = useCallback(async () => {
    const { data, error } = await db
      .from('shift_assignments')
      .select('*, shift:shifts(*)')
      .gte('shift_date', startKey)
      .lte('shift_date', endKey);

    if (error) {
      setAssignments([]);
      return;
    }
    const rows = ((data || []) as ShiftAssignment[]).filter((a) => a.shift);
    rows.sort((a, b) => a.shift_date.localeCompare(b.shift_date) || byStart(a.shift, b.shift));
    setAssignments(rows);
  }, [startKey, endKey, db]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  /** Places a shift on a day. Placing the same shift twice on one day is a no-op. */
  const assign = async (shiftId: string, dateKey: string): Promise<boolean> => {

    const { error } = await db
      .from('shift_assignments')
      .insert([{ shift_id: shiftId, shift_date: dateKey }]);

    // 23505 = unique violation: that shift is already on that day.
    if (error && error.code !== '23505') return false;
    await fetchAssignments();
    return true;
  };

  const unassign = async (assignmentId: string): Promise<boolean> => {
    const { error } = await db.from('shift_assignments').delete().eq('id', assignmentId);
    if (error) return false;
    setAssignments((prev) => prev.filter((a) => a.id !== assignmentId));
    return true;
  };

  return { assignments, assign, unassign, refetch: fetchAssignments };
}
