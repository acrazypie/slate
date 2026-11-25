'use client';

import { useMemo, useEffect, useState, useRef, useCallback } from 'react';
import { format, isSameDay, addDays, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, ChartNoAxesColumn } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useWeek, ViewMode } from '@/hooks/useWeek';
import { useBlocks } from '@/hooks/useBlocks';
import { useShifts, useShiftAssignments } from '@/hooks/useShifts';
import { weekOffsetForDate } from '@/hooks/useMonthBlocks';
import { dateForWeekOffset, getSeriesOccurrenceWeekOffsets, SeriesLike } from '@/lib/recurrence';
import {
  Block,
  BlockFormData,
  OverlapSlot,
  Shift,
  ShiftAssignment,
  ShiftFormData,
  layoutOverlaps,
} from '@/lib/types';
import { DayHeader } from './DayHeader';
import { BlockCard } from './BlockCard';
import { BlockModal } from './BlockModal';
import { ShiftCard } from './ShiftCard';
import { ShiftModal } from './ShiftModal';
import { CreateChoiceSheet } from './CreateChoiceSheet';
import { MonthGrid } from './MonthGrid';
import { capitalize, fill, formatDate } from '@/lib/i18n/format';
import { useI18n } from './LanguageProvider';

interface WeekGridProps {
  user?: {
    email: string;
    name?: string;
  };
  onOpenSidebar?: () => void;
  /** Called after anything is created, edited or deleted, so the weekly summary can reload. */
  onDataChange?: () => void;
}

const WEEK_HOUR_HEIGHT = 48; // px, matches h-12
const DAY_HOUR_HEIGHT = 56; // px, matches h-14
const STRIP_OFFSETS = [-2, -1, 0, 1, 2];
// All-day events sit in a row under the day headers, every column the same
// height. Past this many, the last line turns into "+n".

export function WeekGrid({ user, onOpenSidebar, onDataChange }: WeekGridProps) {
  const { locale, t } = useI18n();
  const {
    weekOffset,
    storedWeekOffset,
    weekDays,
    today,
    goToNextWeek,
    goToPrevWeek,
    goToCurrentWeek,
    goToWeek,
    goToDate,
    formatWeekRange,
    view,
    setViewMode,
  } = useWeek();
  const { blocks, createBlock, updateBlock, deleteBlock, refetch: fetchBlocks } = useBlocks(storedWeekOffset);
  const { shifts, createShift, updateShift, deleteShift } = useShifts();
  const {
    assignments,
    assign,
    unassign,
    refetch: fetchAssignments,
  } = useShiftAssignments(weekDays[0], weekDays[6]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<{
    day_of_week: number;
    start_hour: number;
    start_minute: number;
  } | null>(null);
  // Week a new event is created in. Usually the visible week, but the month
  // view can create one in any week.
  const [blockTargetWeekOffset, setBlockTargetWeekOffset] = useState<number | null>(null);

  // Tapping an empty slot first asks "event or shift?".
  const [createContext, setCreateContext] = useState<{ date: Date; hour: number } | null>(null);
  const [createStep, setCreateStep] = useState<'choice' | 'shift'>('choice');

  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  // Set when the shift modal was opened from a shift placed on a day.
  const [editingAssignment, setEditingAssignment] = useState<ShiftAssignment | null>(null);
  // Set when a new shift is being created from a day: it gets placed there once saved.
  const [assignAfterCreate, setAssignAfterCreate] = useState<string | null>(null);

  // Tells the month view to reload after anything changes.
  const [refreshKey, setRefreshKey] = useState(0);
  const bumpRefresh = () => {
    setRefreshKey((k) => k + 1);
    onDataChange?.();
  };

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

  const getAssignmentsForDay = (dayIndex: number) => {
    const day = weekDays[dayIndex];
    if (!day) return [];
    const dateKey = format(day, 'yyyy-MM-dd');
    return assignments.filter((a) => a.shift_date === dateKey);
  };

  // Everything one day's column draws: Slate events, and how the ones that
  // overlap share the width.
  const getDayContent = (dayIndex: number) => {
    const dayBlocks = getBlocksForDay(dayIndex);
    // Short events are drawn at least half an hour tall, so they overlap as if they were.
    const slots: Map<string, OverlapSlot> = layoutOverlaps(
      dayBlocks.map((b) => {
        const start = b.start_hour * 60 + b.start_minute;
        return { key: `b:${b.id}`, start, end: start + Math.max(b.duration_minutes, 30) };
      }),
    );
    return { dayBlocks, slots };
  };

  // ---- Creating: slot click -> "event or shift?" ----

  const handleCellClick = (dayOfWeek: number, hour: number) => {
    const date = weekDays[dayOfWeek];
    if (!date) return;
    setCreateStep('choice');
    setCreateContext({ date, hour });
  };

  const openEventCreate = (date: Date, hour: number) => {
    setModalInitialData({ day_of_week: (date.getDay() + 6) % 7, start_hour: hour, start_minute: 0 });
    setBlockTargetWeekOffset(weekOffsetForDate(date));
    setSelectedBlock(null);
    setCreateContext(null);
    setIsModalOpen(true);
  };

  const openShiftPicker = (date: Date) => {
    setCreateStep('shift');
    setCreateContext({ date, hour: 9 });
  };

  const handlePickShift = async (shift: Shift) => {
    if (!createContext) return;
    await assign(shift.id, format(createContext.date, 'yyyy-MM-dd'));
    setCreateContext(null);
    bumpRefresh();
  };

  const handleCreateShiftFromDay = () => {
    if (!createContext) return;
    setAssignAfterCreate(format(createContext.date, 'yyyy-MM-dd'));
    setEditingShift(null);
    setEditingAssignment(null);
    setCreateContext(null);
    setIsShiftModalOpen(true);
  };

  // ---- Events (blocks) ----

  const openBlockEdit = (block: Block) => {
    setSelectedBlock(block);
    setModalInitialData(null);
    setIsModalOpen(true);
  };

  const handleBlockClick = (block: Block, e: React.MouseEvent) => {
    e.stopPropagation();
    openBlockEdit(block);
  };

  const handleSaveBlock = async (formData: BlockFormData) => {
    if (selectedBlock) {
      await updateBlock(selectedBlock.id, formData);
    } else {
      await createBlock(formData, blockTargetWeekOffset ?? undefined);
    }
    setIsModalOpen(false);
    bumpRefresh();
  };

  const handleDeleteBlock = async () => {
    if (selectedBlock) {
      await deleteBlock(selectedBlock.id);
      setIsModalOpen(false);
      bumpRefresh();
    }
  };

  // ---- Shifts ----

  const openAssignmentEdit = (assignment: ShiftAssignment) => {
    setEditingShift(assignment.shift);
    setEditingAssignment(assignment);
    setAssignAfterCreate(null);
    setIsShiftModalOpen(true);
  };

  const handleSaveShift = async (data: ShiftFormData) => {
    if (editingShift) {
      await updateShift(editingShift.id, data);
    } else {
      const created = await createShift(data);
      if (created && assignAfterCreate) {
        await assign(created.id, assignAfterCreate);
      }
    }
    setIsShiftModalOpen(false);
    await fetchAssignments();
    bumpRefresh();
  };

  const handleDeleteShift = async () => {
    if (!editingShift) return;
    await deleteShift(editingShift.id);
    setIsShiftModalOpen(false);
    await fetchAssignments();
    bumpRefresh();
  };

  const handleRemoveShiftFromDay = async () => {
    if (!editingAssignment) return;
    await unassign(editingAssignment.id);
    setIsShiftModalOpen(false);
    bumpRefresh();
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
    bumpRefresh();
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

    fetchBlocks();
  };

  /** Removes the whole series (and, via cascade, its exceptions). */
  const deleteEntireSeries = async (seriesId: string) => {
    const supabase = createClient();
    await supabase.from('blocks').delete().eq('id', seriesId);

    fetchBlocks();
  };

  const currentTimePosition = useMemo(() => {
    if (isCurrentDay) {
      return (currentHour * 60 + currentMinute) / (24 * 60) * 100;
    }
    return null;
  }, [isCurrentDay, currentHour, currentMinute]);

  const selectedDay = weekDays[selectedDayIndex];
  const { dayBlocks: dayBlocksForSelectedDay, slots: slotsForSelectedDay } = getDayContent(selectedDayIndex);
  const dayAssignmentsForSelectedDay = getAssignmentsForDay(selectedDayIndex);
  const splitSelectedDay = dayBlocksForSelectedDay.length > 0 && dayAssignmentsForSelectedDay.length > 0;

  // The week's columns share one height for their all-day rows: the busiest day's.
  const weekContent = weekDays.map((_, dayIndex) => getDayContent(dayIndex));
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

  const selectedDayName = selectedDay ? formatDate(locale, selectedDay, 'dayShortMonth') : '';

  const monthTitle = useMemo(() => capitalize(formatDate(locale, monthCursor, 'monthYear')), [monthCursor, locale]);

  const handleSelectDayFromMonth = (date: Date) => {
    goToDate(date);
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
      // Already on this week the offset doesn't change, so pick the day here too.
      setSelectedDayIndex((new Date().getDay() + 6) % 7);
    }
  };

  // The grids start at midnight; open them an hour before now instead. These are
  // stable callback refs, so they run when a grid mounts and not on every render.
  const scrollWeekToNow = useCallback((el: HTMLDivElement | null) => {
    if (el) el.scrollTop = Math.max(0, new Date().getHours() - 1) * WEEK_HOUR_HEIGHT;
  }, []);
  const scrollDayToNow = useCallback((el: HTMLDivElement | null) => {
    if (el) el.scrollTop = Math.max(0, new Date().getHours() - 1) * DAY_HOUR_HEIGHT;
  }, []);

  const headerTitle = view === 'day' ? selectedDayName : view === 'week' ? formatWeekRange : monthTitle;

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-bg">
      {/* Unified header. On phones the view switch drops to its own row so
          "Oggi" and 44px targets fit; from `sm` up it is a single row. */}
      <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-2 px-2 sm:px-6 py-2 sm:py-3 bg-bg border-b border-border">
        <div className="flex items-center gap-0 sm:gap-2 min-w-0 flex-1 sm:flex-none">
          <button
            onClick={handlePrev}
            className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-surface-hover transition-colors flex-shrink-0"
            aria-label={t.calendar.previous}
          >
            <ChevronLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <h2 className="text-sm sm:text-lg font-medium text-text-primary truncate text-center flex-1 sm:flex-none">{headerTitle}</h2>
          <button
            onClick={handleNext}
            className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-surface-hover transition-colors flex-shrink-0"
            aria-label={t.calendar.next}
          >
            <ChevronRight className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <div
          role="group"
          aria-label={t.calendar.view}
          className="order-last sm:order-none w-full sm:w-auto flex items-center bg-surface rounded-xl p-0.5"
        >
          {(['day', 'week', 'month'] as const).map((v) => (
            <button
              key={v}
              onClick={() => handleViewChange(v)}
              aria-pressed={view === v}
              className={`flex-1 sm:flex-none px-3 h-10 sm:h-9 rounded-lg text-sm transition-colors ${
                view === v ? 'bg-accent text-accent-contrast font-medium' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {t.views[v]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-0 sm:gap-1 flex-shrink-0">
          <button
            onClick={handleToday}
            className="px-3 h-11 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            {t.calendar.today}
          </button>
          <button
            onClick={onOpenSidebar}
            className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl hover:bg-surface-hover transition-colors"
            aria-label={t.summary.title}
          >
            <ChartNoAxesColumn className="w-5 h-5 text-text-secondary" />
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
                  aria-current={isSelected ? 'date' : undefined}
                  aria-label={formatDate(locale, date, 'fullDay')}
                  className="flex flex-col items-center gap-1 min-w-11 px-1.5 py-1 rounded-xl transition-colors"
                >
                  <span className="text-[10px] uppercase tracking-wide text-text-secondary">
                    {formatDate(locale, date, 'weekdayShort')}
                  </span>
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors ${
                      isSelected
                        ? 'bg-accent text-accent-contrast'
                        : isToday
                          ? 'border border-accent text-accent-text'
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
            ref={scrollDayToNow}
            className={`flex-1 overflow-y-auto ${slideDirection > 0 ? 'animate-day-in-right' : 'animate-day-in-left'}`}
          >
            {/* Inner row sized by its content, so the hour column's border runs all 24 hours. */}
            <div className="flex">
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
                <button
                  key={hour}
                  type="button"
                  aria-label={fill(t.calendar.addAt, { time: `${hour.toString().padStart(2, '0')}:00` })}
                  className="absolute block w-full h-14 border-b border-border cursor-pointer hover:bg-surface-hover/50 transition-colors focus-visible:-outline-offset-2"
                  style={{ top: `${hour * DAY_HOUR_HEIGHT}px` }}
                  onClick={() => handleCellClick(selectedDayIndex, hour)}
                />
              ))}
              <div className="absolute inset-0 pointer-events-none">
                {dayAssignmentsForSelectedDay.map((assignment) => (
                  <ShiftCard
                    key={assignment.id}
                    assignment={assignment}
                    half={splitSelectedDay}
                    onClick={(e) => {
                      e.stopPropagation();
                      openAssignmentEdit(assignment);
                    }}
                  />
                ))}
                {dayBlocksForSelectedDay.map((block) => (
                  <BlockCard
                    key={block.id}
                    block={block}
                    half={splitSelectedDay}
                    slot={slotsForSelectedDay.get(`b:${block.id}`)}
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
        </div>
      )}

      {/* Week view — horizontally scrollable on narrow screens, full-width on larger ones */}
      {view === 'week' && (
        <div ref={scrollWeekToNow} className="flex-1 overflow-auto">
          {/* No fixed height here: with h-full the columns were clamped to the
              visible area, so their vertical borders stopped where the screen
              ended instead of running the full 24 hours. */}
          <div className="flex min-w-[720px] sm:min-w-0">
            <div className="flex flex-col w-12 sm:w-16 flex-shrink-0 border-r border-border sticky left-0 bg-bg z-30">
              {/* Corner cell: stays put in both directions, above the day headers. */}
              <div className="sticky top-0 z-30 bg-bg border-b border-border" aria-hidden="true">
                <div className="invisible">
                  <DayHeader date={today} isToday={false} />
                </div>
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
                const { dayBlocks, slots } = weekContent[dayIndex];
                const dayAssignments = getAssignmentsForDay(dayIndex);
                const splitDay = dayBlocks.length > 0 && dayAssignments.length > 0;
                const showCurrentTimeLine = isToday;

                return (
                  <div
                    key={dayIndex}
                    className="flex-1 min-w-[90px] sm:min-w-0 border-r border-border last:border-r-0"
                  >
                    {/* Stays visible while the hours scroll. The header opens that day. */}
                    <div className="sticky top-0 z-20 bg-bg border-b border-border">
                      <button
                        type="button"
                        onClick={() => handleSelectDayFromMonth(day)}
                        aria-label={fill(t.calendar.openDate, { date: formatDate(locale, day, 'fullDay') })}
                        className="block w-full hover:bg-surface-hover transition-colors focus-visible:-outline-offset-2"
                      >
                        <DayHeader date={day} isToday={isToday} />
                      </button>
                    </div>
                    <div
                      className="relative cursor-pointer"
                      style={{ height: `${24 * WEEK_HOUR_HEIGHT}px` }}
                    >
                      {hours.map((hour) => (
                        <div
                          key={hour}
                          className="border-b border-border hover:bg-surface-hover/50 transition-colors"
                          style={{ height: `${WEEK_HOUR_HEIGHT}px` }}
                          onClick={() => handleCellClick(dayIndex, hour)}
                        />
                      ))}
                      <div className="absolute inset-0 pointer-events-none">
                        {dayAssignments.map((assignment) => (
                          <ShiftCard
                            key={assignment.id}
                            assignment={assignment}
                            half={splitDay}
                            onClick={(e) => {
                              e.stopPropagation();
                              openAssignmentEdit(assignment);
                            }}
                          />
                        ))}
                        {dayBlocks.map((block) => (
                          <BlockCard
                            key={block.id}
                            block={block}
                            half={splitDay}
                            slot={slots.get(`b:${block.id}`)}
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
        <MonthGrid
          monthDate={monthCursor}
          today={today}
          refreshKey={refreshKey}
          onAddEvent={(date) => openEventCreate(date, 9)}
          onAddShift={openShiftPicker}
          onEditBlock={openBlockEdit}
          onEditAssignment={openAssignmentEdit}
          onOpenDay={handleSelectDayFromMonth}
        />
      )}

      <CreateChoiceSheet
        isOpen={createContext !== null}
        initialStep={createStep}
        dateLabel={createContext ? formatDate(locale, createContext.date, 'fullDay') : ''}
        shifts={shifts}
        onClose={() => setCreateContext(null)}
        onChooseEvent={() => createContext && openEventCreate(createContext.date, createContext.hour)}
        onPickShift={handlePickShift}
        onCreateShift={handleCreateShiftFromDay}
      />

      <ShiftModal
        isOpen={isShiftModalOpen}
        onClose={() => setIsShiftModalOpen(false)}
        onSave={handleSaveShift}
        onDelete={editingShift ? handleDeleteShift : undefined}
        onRemoveFromDay={editingAssignment ? handleRemoveShiftFromDay : undefined}
        dayLabel={
          editingAssignment
            ? formatDate(locale, new Date(`${editingAssignment.shift_date}T00:00:00`), 'fullDay')
            : undefined
        }
        shift={editingShift}
      />

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
