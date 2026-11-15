'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  format,
} from 'date-fns';
import { useMonthBlocks, weekOffsetForDate } from '@/hooks/useMonthBlocks';
import { useShiftAssignments } from '@/hooks/useShifts';
import { useGoogleEvents } from '@/hooks/useGoogleEvents';
import { Block, GoogleEvent, ShiftAssignment, blockEndTime, formatCompactRange, googleEventsForDay } from '@/lib/types';
import { DaySheet } from './DaySheet';
import { fill, weekdayNames } from '@/lib/i18n/format';
import { useI18n } from './LanguageProvider';

interface MonthGridProps {
  monthDate: Date;
  today: Date;
  /** Bumped by the parent after any create/edit/delete so the grid reloads. */
  refreshKey: number;
  /** Bumped after a Google event is edited, so those reload too. */
  googleRefreshKey: number;
  /** Loading found events changed in Google Calendar: the parent's copies are stale. */
  onBlocksPulled: () => void;
  onEditGoogleEvent: (event: GoogleEvent) => void;
  onAddEvent: (date: Date) => void;
  onAddShift: (date: Date) => void;
  onEditBlock: (block: Block) => void;
  onEditAssignment: (assignment: ShiftAssignment) => void;
  onOpenDay: (date: Date) => void;
}

const MAX_CHIPS_MOBILE = 2;
const MAX_CHIPS_DESKTOP = 3;

interface Chip {
  key: string;
  title: string;
  time: string;
  color: string;
  isShift: boolean;
  startMinutes: number;
}

export function MonthGrid({
  monthDate,
  today,
  refreshKey,
  googleRefreshKey,
  onBlocksPulled,
  onEditGoogleEvent,
  onAddEvent,
  onAddShift,
  onEditBlock,
  onEditAssignment,
  onOpenDay,
}: MonthGridProps) {
  const { locale, t } = useI18n();
  const weekdayLabels = useMemo(() => weekdayNames(locale), [locale]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const gridStart = useMemo(() => startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 }), [monthDate]);
  const gridEnd = useMemo(() => endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 }), [monthDate]);

  const days = useMemo(() => eachDayOfInterval({ start: gridStart, end: gridEnd }), [gridStart, gridEnd]);
  const weekOffsets = useMemo(() => days.map((d) => weekOffsetForDate(d)), [days]);

  const { blocks, refetch: refetchBlocks } = useMonthBlocks(weekOffsets);
  const { assignments, refetch: refetchAssignments } = useShiftAssignments(gridStart, gridEnd);

  const { events: googleEvents, refetch: refetchGoogleEvents } = useGoogleEvents(gridStart, gridEnd, {
    onBlocksChanged: () => {
      refetchBlocks();
      onBlocksPulled();
    },
  });

  useEffect(() => {
    if (googleRefreshKey === 0) return;
    refetchGoogleEvents();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [googleRefreshKey]);

  useEffect(() => {
    if (refreshKey === 0) return;
    refetchBlocks();
    refetchAssignments();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshKey]);

  const blocksByKey = useMemo(() => {
    const map = new Map<string, Block[]>();
    for (const block of blocks) {
      const key = `${block.week_offset}:${block.day_of_week}`;
      map.set(key, [...(map.get(key) || []), block]);
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.start_hour - b.start_hour || a.start_minute - b.start_minute);
    }
    return map;
  }, [blocks]);

  const assignmentsByDate = useMemo(() => {
    const map = new Map<string, ShiftAssignment[]>();
    for (const a of assignments) {
      map.set(a.shift_date, [...(map.get(a.shift_date) || []), a]);
    }
    return map;
  }, [assignments]);

  const blocksFor = (day: Date) => blocksByKey.get(`${weekOffsetForDate(day)}:${(day.getDay() + 6) % 7}`) || [];
  const assignmentsFor = (day: Date) => assignmentsByDate.get(format(day, 'yyyy-MM-dd')) || [];
  const googleFor = (day: Date) => googleEventsForDay(googleEvents, format(day, 'yyyy-MM-dd'));

  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="grid grid-cols-7 border-b border-border">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="py-2 text-center text-[11px] font-medium uppercase tracking-wide text-text-secondary"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {weeks.map((week, weekIdx) => (
          <div key={weekIdx} className="flex-1 grid grid-cols-7 min-h-[104px] sm:min-h-[132px]">
            {week.map((day) => {
              const inMonth = isSameMonth(day, monthDate);
              const isToday = isSameDay(day, today);

              const google = googleFor(day);
              const chips: Chip[] = [
                ...google.allDay.map((g) => ({
                  key: `ga-${g.id}`,
                  title: g.title || t.googleEvent.untitled,
                  time: t.calendar.allDay,
                  color: g.color,
                  isShift: false,
                  // Ahead of anything with a time.
                  startMinutes: -1,
                })),
                ...google.timed.map(({ event: g, start, end }) => ({
                  key: `g-${g.id}`,
                  title: g.title || t.googleEvent.untitled,
                  time: formatCompactRange(Math.floor(start / 60), start % 60, Math.floor(end / 60) % 24, end % 60),
                  color: g.color,
                  isShift: false,
                  startMinutes: start,
                })),
                ...assignmentsFor(day).map((a) => ({
                  key: `s-${a.id}`,
                  title: a.shift.title,
                  time: formatCompactRange(a.shift.start_hour, a.shift.start_minute, a.shift.end_hour, a.shift.end_minute),
                  color: a.shift.color,
                  isShift: true,
                  startMinutes: a.shift.start_hour * 60 + a.shift.start_minute,
                })),
                ...blocksFor(day).map((b) => {
                  const end = blockEndTime(b);
                  return {
                    key: `b-${b.id}`,
                    title: b.title,
                    time: formatCompactRange(b.start_hour, b.start_minute, end.hour, end.minute),
                    color: b.color,
                    isShift: false,
                    startMinutes: b.start_hour * 60 + b.start_minute,
                  };
                }),
              ].sort((a, b) => a.startMinutes - b.startMinutes);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`flex flex-col items-stretch text-left p-1 sm:p-2 min-w-0 border-r border-b border-border [&:nth-child(7n)]:border-r-0 hover:bg-surface-hover/50 transition-colors ${
                    inMonth ? '' : 'opacity-40'
                  }`}
                >
                  <span
                    className={`self-start flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1 ${
                      isToday ? 'bg-accent text-accent-contrast' : 'text-text-primary'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    {chips.slice(0, MAX_CHIPS_DESKTOP).map((chip, i) => (
                      <div
                        key={chip.key}
                        className={`rounded px-1 py-0.5 min-w-0 ${i >= MAX_CHIPS_MOBILE ? 'hidden sm:block' : ''} ${
                          chip.isShift ? 'border border-dashed' : ''
                        }`}
                        style={{
                          backgroundColor: `color-mix(in srgb, ${chip.color} 22%, var(--color-surface))`,
                          ...(chip.isShift ? { borderColor: chip.color } : { borderLeft: `2px solid ${chip.color}` }),
                        }}
                      >
                        <div className="truncate text-[10px] sm:text-[11px] leading-tight text-text-primary">
                          {chip.title}
                        </div>
                        <div className="truncate text-[9px] sm:text-[10px] leading-tight text-text-secondary">
                          {chip.time}
                        </div>
                      </div>
                    ))}
                    {chips.length > MAX_CHIPS_MOBILE && (
                      <div className="sm:hidden text-[10px] text-text-tertiary px-1">
                        +{chips.length - MAX_CHIPS_MOBILE}
                      </div>
                    )}
                    {chips.length > MAX_CHIPS_DESKTOP && (
                      <div className="hidden sm:block text-[10px] text-text-tertiary px-1">
                        {fill(t.calendar.more, { count: chips.length - MAX_CHIPS_DESKTOP })}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>

      <DaySheet
        date={selectedDate}
        blocks={selectedDate ? blocksFor(selectedDate) : []}
        assignments={selectedDate ? assignmentsFor(selectedDate) : []}
        googleEvents={
          selectedDate
            ? [...googleFor(selectedDate).allDay, ...googleFor(selectedDate).timed.map((segment) => segment.event)]
            : []
        }
        onEditGoogleEvent={onEditGoogleEvent}
        onClose={() => setSelectedDate(null)}
        onAddEvent={() => selectedDate && onAddEvent(selectedDate)}
        onAddShift={() => selectedDate && onAddShift(selectedDate)}
        onEditBlock={onEditBlock}
        onEditAssignment={onEditAssignment}
        onOpenDay={() => {
          if (!selectedDate) return;
          const date = selectedDate;
          setSelectedDate(null);
          onOpenDay(date);
        }}
      />
    </div>
  );
}
