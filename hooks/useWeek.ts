'use client';

import { useState, useCallback, useMemo } from 'react';
import { startOfWeek, addWeeks, addDays, eachDayOfInterval } from 'date-fns';
import { useI18n } from '@/components/LanguageProvider';
import { formatDayRange } from '@/lib/i18n/format';
import { weekOffsetForDate, viewOffsetFromStored } from '@/lib/recurrence';

export type ViewMode = 'day' | 'week' | 'month';

export function useWeek() {
  const { locale } = useI18n();
  // Navigation state: 0 is the week containing today. Stored events use a
  // different, fixed numbering - see `storedWeekOffset` below.
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState<ViewMode>(
    () => (localStorage.getItem('slate-default-view') as ViewMode) ?? 'week'
  );

  const currentWeekStart = useMemo(() => {
    return startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  }, [weekOffset]);

  // The week on screen in the numbering the database uses (`blocks.week_offset`).
  const storedWeekOffset = useMemo(() => weekOffsetForDate(currentWeekStart), [currentWeekStart]);

  const weekDays = useMemo(() => {
    return eachDayOfInterval({
      start: currentWeekStart,
      end: addDays(currentWeekStart, 6),
    });
  }, [currentWeekStart]);

  const today = new Date();

  const setViewMode = useCallback((newView: ViewMode) => {
    setView(newView);
    localStorage.setItem('slate-default-view', newView);
  }, []);

  const goToNextWeek = useCallback(() => {
    setWeekOffset((prev) => prev + 1);
  }, []);

  const goToPrevWeek = useCallback(() => {
    setWeekOffset((prev) => prev - 1);
  }, []);

  const goToCurrentWeek = useCallback(() => {
    setWeekOffset(0);
  }, []);

  const goToWeek = useCallback((offset: number) => {
    setWeekOffset(offset);
  }, []);

  const goToDate = useCallback((date: Date) => {
    setWeekOffset(viewOffsetFromStored(weekOffsetForDate(date)));
  }, []);

  const formatWeekRange = useMemo(() => {
    return formatDayRange(locale, currentWeekStart, addDays(currentWeekStart, 6));
  }, [currentWeekStart, locale]);

  const isCurrentWeek = weekOffset === 0;

  return {
    weekOffset,
    storedWeekOffset,
    currentWeekStart,
    weekDays,
    today,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
    goToWeek,
    goToDate,
    formatWeekRange,
    isCurrentWeek,
    view,
    setViewMode,
  };
}