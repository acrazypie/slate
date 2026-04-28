'use client';

import { useState, useCallback, useMemo } from 'react';
import { startOfWeek, addWeeks, format, eachDayOfInterval, isSameDay } from 'date-fns';

export type ViewMode = 'day' | 'week' | 'month';

export function useWeek() {
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
      end: addWeeks(currentWeekStart, 0),
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

  const formatWeekRange = useMemo(() => {
    const start = currentWeekStart;
    const end = addWeeks(currentWeekStart, 0);
    if (isSameDay(start, end)) {
      return format(start, 'd MMM');
    }
    if (start.getMonth() === end.getMonth()) {
      return `${format(start, 'd')} – ${format(end, 'd MMM')}`;
    }
    return `${format(start, 'd MMM')} – ${format(end, 'd MMM')}`;
  }, [currentWeekStart]);

  const isCurrentWeek = weekOffset === 0;

  return {
    weekOffset,
    currentWeekStart,
    weekDays,
    today,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
    formatWeekRange,
    isCurrentWeek,
    view,
    setViewMode,
  };
}