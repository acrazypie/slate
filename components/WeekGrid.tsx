'use client';

import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { format, isSameDay, addDays, addMonths, subMonths } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useWeek, ViewMode } from '@/hooks/useWeek';
import { useBlocks } from '@/hooks/useBlocks';
import { weekOffsetForDate } from '@/hooks/useMonthBlocks';
import { dateForWeekOffset, getSeriesOccurrenceWeekOffsets, SeriesLike } from '@/lib/recurrence';
import { syncToGoogleCalendar } from '@/lib/googleCalendarClient';
import { Block, BlockFormData } from '@/lib/types';
import { DayHeader } from './DayHeader';
import { BlockCard } from './BlockCard';
import { BlockModal } from './BlockModal';
import { MonthGrid } from './MonthGrid';

interface WeekGridProps {
  user?: {
    email: string;
    name?: string;
  };
  onOpenSidebar?: () => void;
}

const WEEK_HOUR_HEIGHT = 48; // px, matches h-12
const DAY_HOUR_HEIGHT = 56; // px, matches h-14
const STRIP_OFFSETS = [-2, -1, 0, 1, 2];

export function WeekGrid({ user, onOpenSidebar }: WeekGridProps) {
  const {
    weekOffset,
    weekDays,
    today,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
    goToWeek,
    formatWeekRange,
    view,
    setViewMode,
  } = useWeek();
  const { blocks, createBlock, updateBlock, deleteBlock, refetch: fetchBlocks } = useBlocks(weekOffset);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<{
    day_of_week: number;
    start_hour: number;
    start_minute: number;
  } | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const todayIndex = (new Date().getDay() + 6) % 7;
    return todayIndex;
  });
  const [slideDirection, setSlideDirection] = useState<1 | -1>(1);
  const [monthCursor, setMonthCursor] = useState(() => new Date());
  const touchStartRef = useRef<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const todayIndex = (new Date().getDay() + 6) % 7;
    setSelectedDayIndex(todayIndex);
  }, [weekOffset]);

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const isCurrentDay = useMemo(
    () => weekDays.some((day) => isSameDay(day, today)),
    [weekDays, today]
  );

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const getBlocksForDay = (dayIndex: number) => {
    return blocks.filter((b) => b.day_of_week === dayIndex);
  };

  const handleCellClick = (dayOfWeek: number, hour: number, minute: number = 0) => {
    setModalInitialData({ day_of_week: dayOfWeek, start_hour: hour, start_minute: minute });
    setSelectedBlock(null);
    setIsModalOpen(true);
  };

  const handleBlockClick = (block: Block, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBlock(block);
    setModalInitialData(null);
    setIsModalOpen(true);
  };

  const handleSaveBlock = async (formData: BlockFormData) => {
    if (selectedBlock) {
      await updateBlock(selectedBlock.id, formData);
    } else {
      await createBlock(formData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteBlock = async () => {
    if (selectedBlock) {
      await deleteBlock(selectedBlock.id);
      setIsModalOpen(false);
    }
  };

  const handleDeleteRecurring = async (deleteType: 'current' | 'this-and-following' | 'all') => {
    if (!selectedBlock?.recurrence_group_id) return;

    // A recurring block is one row (the series root): selectedBlock.id is
    // always that root, and selectedBlock.week_offset is the specific
    // occurrence that was clicked (synthesized per-occurrence at fetch time).
    const seriesId = selectedBlock.recurrence_group_id;
    const occurrenceWeekOffset = selectedBlock.week_offset;

    if (deleteType === 'current') {
      await deleteOccurrence(seriesId, occurrenceWeekOffset);
    } else if (deleteType === 'this-and-following') {
      await truncateSeriesBefore(seriesId, occurrenceWeekOffset);
    } else {
      await deleteEntireSeries(seriesId);
    }
    setIsModalOpen(false);
  };

  /** Skips just one occurrence of a series, without touching the others. */
  const deleteOccurrence = async (seriesId: string, occurrenceWeekOffset: number) => {
    const supabase = createClient();
    const { data: root } = await supabase.from('blocks').select('*').eq('id', seriesId).single();
    if (!root) return;

    if (root.week_offset === occurrenceWeekOffset) {
      // This IS the series' own start - advance the start to the next
      // occurrence instead of leaving a dangling exception before it.
      const remaining = getSeriesOccurrenceWeekOffsets(root as SeriesLike).filter((o) => o > occurrenceWeekOffset);
      if (remaining.length === 0) {
        await deleteEntireSeries(seriesId);
        return;
      }
      await supabase.from('blocks').update({ week_offset: remaining[0] }).eq('id', seriesId);
    } else {
      await supabase
        .from('block_exceptions')
        .insert({ block_id: seriesId, occurrence_week_offset: occurrenceWeekOffset });
    }

    syncToGoogleCalendar({ action: 'upsert', blockIds: [seriesId] });
    fetchBlocks();
  };

  /** Ends the series the day before this occurrence, dropping it and every later one. */
  const truncateSeriesBefore = async (seriesId: string, occurrenceWeekOffset: number) => {
    const supabase = createClient();
    const { data: root } = await supabase.from('blocks').select('*').eq('id', seriesId).single();
    if (!root) return;

    if (root.week_offset === occurrenceWeekOffset) {
      // Truncating from the very first occurrence removes the whole series.
      await deleteEntireSeries(seriesId);
      return;
    }

    const occurrenceDate = dateForWeekOffset(occurrenceWeekOffset, root.day_of_week);
    const newEndDate = format(addDays(occurrenceDate, -1), 'yyyy-MM-dd');

    await supabase.from('blocks').update({ recurrence_end_date: newEndDate }).eq('id', seriesId);
    // Exceptions at/after the new cutoff are moot now, but tidy them up anyway.
    await supabase
      .from('block_exceptions')
      .delete()
      .eq('block_id', seriesId)
      .gte('occurrence_week_offset', occurrenceWeekOffset);

    syncToGoogleCalendar({ action: 'upsert', blockIds: [seriesId] });
    fetchBlocks();
  };

  /** Removes the whole series (and, via cascade, its exceptions). */
  const deleteEntireSeries = async (seriesId: string) => {
    const supabase = createClient();
    const { data: root } = await supabase.from('blocks').select('google_event_id').eq('id', seriesId).single();

    await supabase.from('blocks').delete().eq('id', seriesId);

    if (root?.google_event_id) {
      syncToGoogleCalendar({ action: 'delete', eventIds: [root.google_event_id] });
    }

    fetchBlocks();
  };

  const currentTimePosition = useMemo(() => {
    if (isCurrentDay) {
      return (currentHour * 60 + currentMinute) / (24 * 60) * 100;
    }
    return null;
  }, [isCurrentDay, currentHour, currentMinute]);

  const selectedDay = weekDays[selectedDayIndex];
  const dayBlocksForSelectedDay = getBlocksForDay(selectedDayIndex);
  const isTodaySelectedDay = selectedDay ? isSameDay(selectedDay, today) : false;

  // Moves the selected day by `delta` days, crossing week boundaries (and
  // fetching the right week) as needed. Used by the day strip, arrows and swipe.
  const goToDayOffset = useCallback(
    (delta: number) => {
      if (delta === 0) return;
      setSlideDirection(delta > 0 ? 1 : -1);
      const total = selectedDayIndex + delta;
      const weeksMoved = Math.floor(total / 7);
      const newIndex = ((total % 7) + 7) % 7;
      if (weeksMoved !== 0) {
        goToWeek(weekOffset + weeksMoved);
      }
      setSelectedDayIndex(newIndex);
    },
    [selectedDayIndex, weekOffset, goToWeek]
  );

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartRef.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      if (touchStartRef.current === null) return;
      const diff = e.changedTouches[0].clientX - touchStartRef.current;
      if (Math.abs(diff) > 50) {
        goToDayOffset(diff > 0 ? -1 : 1);
      }
      touchStartRef.current = null;
    },
    [goToDayOffset]
  );

  const selectedDayName = selectedDay
    ? `${format(selectedDay, 'EEEE', { locale: it })} ${format(selectedDay, 'd MMM', { locale: it })}`
    : '';

  const monthTitle = useMemo(() => {
    const label = format(monthCursor, 'MMMM yyyy', { locale: it });
    return label.charAt(0).toUpperCase() + label.slice(1);
  }, [monthCursor]);

  const handleSelectDayFromMonth = (date: Date) => {
    goToWeek(weekOffsetForDate(date));
    setSelectedDayIndex((date.getDay() + 6) % 7);
    setViewMode('day');
  };

  const handleViewChange = (newView: ViewMode) => {
    if (newView === 'month') {
      setMonthCursor(weekDays[0] || new Date());
    }
    setViewMode(newView);
  };

  const handlePrev = () => {
    if (view === 'day') goToDayOffset(-1);
    else if (view === 'week') goToPrevWeek();
    else setMonthCursor((prev) => subMonths(prev, 1));
  };

  const handleNext = () => {
    if (view === 'day') goToDayOffset(1);
    else if (view === 'week') goToNextWeek();
    else setMonthCursor((prev) => addMonths(prev, 1));
  };

  const handleToday = () => {
    if (view === 'month') {
      setMonthCursor(new Date());
    } else {
      goToCurrentWeek();
    }
  };

  const headerTitle = view === 'day' ? selectedDayName : view === 'week' ? formatWeekRange : monthTitle;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-bg">
      {/* Unified header */}
      <div className="flex items-center justify-between gap-2 px-3 sm:px-6 py-2.5 sm:py-4 bg-bg border-b border-border">
        <div className="flex items-center gap-1 sm:gap-4 min-w-0">
          <button
            onClick={handlePrev}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-surface-hover transition-colors flex-shrink-0"
            aria-label="Precedente"
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h2 className="text-sm sm:text-lg font-medium text-text-primary truncate">{headerTitle}</h2>
          <button
            onClick={handleNext}
            className="p-1.5 sm:p-2 rounded-xl hover:bg-surface-hover transition-colors flex-shrink-0"
            aria-label="Successivo"
          >
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-3 flex-shrink-0">
          <div className="flex items-center bg-surface rounded-xl p-0.5">
            {(['day', 'week', 'month'] as const).map((v) => (
              <button
                key={v}
                onClick={() => handleViewChange(v)}
                className={`px-2 sm:px-3 py-1 rounded-lg text-xs sm:text-sm transition-colors ${
                  view === v ? 'bg-accent text-accent-contrast' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {v === 'day' ? 'Giorno' : v === 'week' ? 'Settimana' : 'Mese'}
              </button>
            ))}
          </div>
          <button
            onClick={handleToday}
            className="hidden sm:block px-4 py-2 text-sm text-text-secondary hover:text-text-primary transition-colors"
          >
            Oggi
          </button>
          <button
            onClick={onOpenSidebar}
            className="sm:hidden p-1.5 rounded-xl hover:bg-surface-hover transition-colors"
            aria-label="Apri impostazioni"
          >
            <Settings className="w-5 h-5 text-text-secondary" />
          </button>
        </div>
      </div>

      {/* Day view */}
      {view === 'day' && (
        <div
          className="flex-1 flex flex-col overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Day strip: current day +/- 2 neighbours */}
          <div className="flex items-center justify-center gap-1.5 sm:gap-3 py-2.5 border-b border-border">
            {STRIP_OFFSETS.map((n) => {
              const date = addDays(selectedDay || today, n);
              const isSelected = n === 0;
              const isToday = isSameDay(date, today);
              return (
                <button
                  key={n}
                  onClick={() => goToDayOffset(n)}
                  className="flex flex-col items-center gap-1 px-1.5 py-1 rounded-xl transition-colors"
                >
                  <span className="text-[10px] uppercase tracking-wide text-text-secondary">
                    {format(date, 'EEE', { locale: it })}
                  </span>
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-accent text-accent-contrast'
                        : isToday
                          ? 'border border-accent text-accent'
                          : 'text-text-primary'
                    }`}
                  >
                    {format(date, 'd')}
                  </span>
                </button>
              );
            })}
          </div>

          <div
            key={`${weekOffset}-${selectedDayIndex}`}
            className={`flex flex-1 overflow-y-auto ${slideDirection > 0 ? 'animate-day-in-right' : 'animate-day-in-left'}`}
          >
            <div className="flex flex-col w-12 flex-shrink-0 border-r border-border">
              <div className="flex-1 flex flex-col relative">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="flex-shrink-0 h-14 text-[10px] text-text-secondary text-right pr-1.5 pt-1"
                  >
                    {hour.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex-1 relative" style={{ height: `${24 * DAY_HOUR_HEIGHT}px`, minHeight: `${24 * DAY_HOUR_HEIGHT}px` }}>
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="absolute w-full h-14 border-b border-border cursor-pointer"
                  style={{ top: `${hour * DAY_HOUR_HEIGHT}px` }}
                  onClick={() => handleCellClick(selectedDayIndex, hour, 0)}
                />
              ))}
              <div className="absolute inset-0 pointer-events-none">
                {dayBlocksForSelectedDay.map((block) => (
                  <BlockCard
                    key={block.id}
                    block={block}
                    onClick={(e) => handleBlockClick(block, e)}
                  />
                ))}
              </div>
              {isTodaySelectedDay && currentTimePosition !== null && (
                <div
                  className="absolute left-0 right-0 h-0.5 bg-[#ef4444] z-10 pointer-events-none"
                  style={{ top: `${currentTimePosition}%` }}
                />
              )}
            </div>
          </div>
        </div>
      )}

      {/* Week view — horizontally scrollable on narrow screens, full-width on larger ones */}
      {view === 'week' && (
        <div className="flex-1 overflow-auto">
          <div className="flex min-w-[720px] sm:min-w-0 h-full">
            <div className="flex flex-col w-12 sm:w-16 flex-shrink-0 border-r border-border sticky left-0 bg-bg z-10">
              <div className="invisible">
                <DayHeader date={today} isToday={false} />
              </div>
              <div className="flex flex-1 flex-col relative">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="flex-shrink-0 text-[10px] sm:text-xs text-text-secondary text-right pr-2 sm:pr-3 pt-1"
                    style={{ height: `${WEEK_HOUR_HEIGHT}px` }}
                  >
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-1">
              {weekDays.map((day, dayIndex) => {
                const isToday = isSameDay(day, today);
                const dayBlocks = getBlocksForDay(dayIndex);
                const showCurrentTimeLine = isToday;

                return (
                  <div
                    key={dayIndex}
                    className="flex-1 min-w-[90px] sm:min-w-0 border-r border-border last:border-r-0"
                  >
                    <DayHeader date={day} isToday={isToday} />
                    <div
                      className="relative cursor-pointer"
                      style={{ height: `${24 * WEEK_HOUR_HEIGHT}px` }}
                    >
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="border-b border-border hover:bg-surface-hover/50 transition-colors"
                          style={{ height: `${WEEK_HOUR_HEIGHT}px` }}
                          onClick={() => handleCellClick(dayIndex, hour, 0)}
                        />
                      ))}
                      <div className="absolute inset-0 pointer-events-none">
                        {dayBlocks.map((block) => (
                          <BlockCard
                            key={block.id}
                            block={block}
                            onClick={(e) => handleBlockClick(block, e)}
                          />
                        ))}
                      </div>
                      {showCurrentTimeLine && currentTimePosition !== null && (
                        <div
                          className="absolute left-0 right-0 h-0.5 bg-[#ef4444] z-10 pointer-events-none"
                          style={{ top: `${currentTimePosition}%` }}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Month view */}
      {view === 'month' && (
        <MonthGrid monthDate={monthCursor} today={today} onSelectDay={handleSelectDayFromMonth} />
      )}

      {isModalOpen && (
        <BlockModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveBlock}
          onDelete={handleDeleteBlock}
          onDeleteRecurring={handleDeleteRecurring}
          initialData={modalInitialData}
          block={selectedBlock}
        />
      )}
    </div>
  );
}
