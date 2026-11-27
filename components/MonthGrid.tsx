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
import { Block, ShiftAssignment, blockEndTime, formatCompactRange } from '@/lib/types';
import { DaySheet } from './DaySheet';
import { capitalize, fill, formatDate, weekdayNames } from '@/lib/i18n/format';
import { getMonthStyle } from '@/lib/monthStyle';
import { Plus } from 'lucide-react';
import { useI18n } from './LanguageProvider';

interface MonthGridProps {
  monthDate: Date;
  today: Date;
  /** Bumped by the parent after any create/edit/delete so the grid reloads. */
  refreshKey: number;
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
  onAddEvent,
  onAddShift,
  onEditBlock,
  onEditAssignment,
  onOpenDay,
}: MonthGridProps) {
  const { locale, t } = useI18n();
  const weekdayLabels = useMemo(() => weekdayNames(locale), [locale]);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  // 'compact' shows coloured squares and lists the chosen day below; 'detailed' opens a sheet.
  const [style] = useState(() => getMonthStyle());
  const [chosenDay, setChosenDay] = useState<Date>(() => (isSameMonth(today, monthDate) ? today : startOfMonth(monthDate)));
  const activeDay = isSameMonth(chosenDay, monthDate) ? chosenDay : startOfMonth(monthDate);

  const gridStart = useMemo(() => startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 }), [monthDate]);
  const gridEnd = useMemo(() => endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 }), [monthDate]);

  const days = useMemo(() => eachDayOfInterval({ start: gridStart, end: gridEnd }), [gridStart, gridEnd]);
  const weekOffsets = useMemo(() => days.map((d) => weekOffsetForDate(d)), [days]);

  const { blocks, refetch: refetchBlocks } = useMonthBlocks(weekOffsets);
  const { assignments, refetch: refetchAssignments } = useShiftAssignments(gridStart, gridEnd);

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

  const weeks = useMemo(() => {
    const result: Date[][] = [];
    for (let i = 0; i < days.length; i += 7) {
      result.push(days.slice(i, i + 7));
    }
    return result;
  }, [days]);

  const compactItems: { key: string; title: string; time: string; color: string; start: number; assignment?: ShiftAssignment; block?: Block }[] =
    style === 'compact'
      ? [
          ...assignmentsFor(activeDay).map((a) => ({
            key: `s-${a.id}`,
            title: a.shift.title,
            time: formatCompactRange(a.shift.start_hour, a.shift.start_minute, a.shift.end_hour, a.shift.end_minute),
            color: a.shift.color,
            start: a.shift.start_hour * 60 + a.shift.start_minute,
            assignment: a,
          })),
          ...blocksFor(activeDay).map((b) => {
            const end = blockEndTime(b);
            return {
              key: `b-${b.id}`,
              title: b.title,
              time: formatCompactRange(b.start_hour, b.start_minute, end.hour, end.minute),
              color: b.color,
              start: b.start_hour * 60 + b.start_minute,
              block: b,
            };
          }),
        ].sort((a, b) => a.start - b.start)
      : [];

  return (
    <div className="flex-1 flex flex-col overflow-y-auto">
      <div className="grid grid-cols-7 border-b border-border">
        {weekdayLabels.map((label) => (
          <div
            key={label}
            className="py-2 text-center text-[11px] font-medium text-text-secondary"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="flex-1 flex flex-col">
        {weeks.map((week, weekIdx) => (
          <div
            key={weekIdx}
            className={
              style === 'compact'
                ? 'grid grid-cols-7 min-h-[56px]'
                : 'flex-1 grid grid-cols-7 min-h-[104px] sm:min-h-[132px]'
            }
          >
            {week.map((day) => {
              const inMonth = isSameMonth(day, monthDate);
              const isToday = isSameDay(day, today);

              const chips: Chip[] = [
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
                  onClick={() => (style === 'compact' ? setChosenDay(day) : setSelectedDate(day))}
                  className={`flex flex-col min-w-0 border-r border-b border-border [&:nth-child(7n)]:border-r-0 hover:bg-surface-hover/50 transition-colors ${
                    style === 'compact' ? 'items-center text-center py-1 px-0.5' : 'items-stretch text-left p-1 sm:p-2'
                  } ${inMonth ? '' : 'opacity-40'}`}
                >
                  <span
                    className={`${style === 'compact' ? 'self-center' : 'self-start'} flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1 ${
                      isToday
                        ? 'bg-accent text-accent-contrast'
                        : style === 'compact' && isSameDay(day, activeDay)
                          ? 'border-2 border-accent text-text-primary'
                          : 'text-text-primary'
                    }`}
                  >
                    {format(day, 'd')}
                  </span>
                  {style === 'compact' ? (
                    <div className="flex flex-wrap justify-center gap-0.5 mt-auto">
                      {chips.slice(0, 4).map((chip) => (
                        <span key={chip.key} className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: chip.color }} />
                      ))}
                    </div>
                  ) : (
                  <div className="flex flex-col gap-0.5 min-w-0">
                    {chips.slice(0, MAX_CHIPS_DESKTOP).map((chip, i) => (
                      <div
                        key={chip.key}
                        className={`rounded-md px-1 py-0.5 min-w-0 ${i >= MAX_CHIPS_MOBILE ? 'hidden sm:block' : ''}`}
                        // Timeline: each chip is a tint of its colour; no stripe or dashes.
                        style={{
                          backgroundColor: `color-mix(in srgb, ${chip.color} 22%, var(--color-surface))`,
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
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>

      {style === 'compact' && (
        <section className="px-4 sm:px-6 py-5 border-t border-border">
          <div className="flex items-center justify-between gap-3 mb-3">
            <h2 className="text-lg font-semibold text-text-primary">{capitalize(formatDate(locale, activeDay, 'fullDay'))}</h2>
            <button
              type="button"
              onClick={() => onAddEvent(activeDay)}
              aria-label={t.blockModal.newTitle}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-accent text-accent-contrast flex-shrink-0"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          {compactItems.length === 0 ? (
            <p className="text-sm text-text-tertiary">{t.agenda.empty}</p>
          ) : (
            <ul className="space-y-2">
              {compactItems.map((item) => (
                <li key={item.key}>
                  <button
                    type="button"
                    onClick={() => (item.assignment ? onEditAssignment(item.assignment) : item.block && onEditBlock(item.block))}
                    className="w-full flex items-stretch gap-3 rounded-2xl bg-surface px-4 py-3 text-left hover:bg-surface-hover transition-colors"
                  >
                    <span className="w-1 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                    <span className="flex-1 min-w-0">
                      <span className="block text-sm font-medium text-text-primary truncate">{item.title}</span>
                      <span className="block text-xs text-text-secondary tabular-nums mt-0.5">{item.time}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}

      <DaySheet
        date={selectedDate}
        blocks={selectedDate ? blocksFor(selectedDate) : []}
        assignments={selectedDate ? assignmentsFor(selectedDate) : []}
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
