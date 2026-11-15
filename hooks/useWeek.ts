'use client';

import { useState, useCallback, useMemo } from 'react';
import { startOfWeek, addWeeks, addDays, eachDayOfInterval } from 'date-fns';
import { useI18n } from '@/components/LanguageProvider';
import { formatDayRange } from '@/lib/i18n/format';

export type ViewMode = 'day' | 'week' | 'month';

export function useWeek() {
  const { locale } = useI18n();
  const [weekOffset, setWeekOffset] = useState(0);
  const [view, setView] = useState<ViewMode>(
    () => (localStorage.getItem('slate-default-view') as ViewMode) ?? 'week'
  );

  const currentWeekStart = useMemo(() => {
    return startOfWeek(addWeeks(new Date(), weekOffset), { weekStartsOn: 1 });
  }, [weekOffset]);

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

  const formatWeekRange = useMemo(() => {
    return formatDayRange(locale, currentWeekStart, addDays(currentWeekStart, 6));
  }, [currentWeekStart, locale]);

  const isCurrentWeek = weekOffset === 0;

  return {
    weekOffset,
    currentWeekStart,
    weekDays,
    today,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
    goToWeek,
    formatWeekRange,
    isCurrentWeek,
    view,
    setViewMode,
  };
}