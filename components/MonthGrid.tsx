'use client';

import { useMemo } from 'react';
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
import { it } from 'date-fns/locale';
import { useMonthBlocks, weekOffsetForDate } from '@/hooks/useMonthBlocks';

interface MonthGridProps {
  monthDate: Date;
  today: Date;
  onSelectDay: (date: Date) => void;
}

const WEEKDAY_LABELS = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
const MAX_VISIBLE_CHIPS = 3;

export function MonthGrid({ monthDate, today, onSelectDay }: MonthGridProps) {
  const gridStart = useMemo(() => startOfWeek(startOfMonth(monthDate), { weekStartsOn: 1 }), [monthDate]);
  const gridEnd = useMemo(() => endOfWeek(endOfMonth(monthDate), { weekStartsOn: 1 }), [monthDate]);

  const days = useMemo(
    () => eachDayOfInterval({ start: gridStart, end: gridEnd }),
    [gridStart, gridEnd]
  );

  const weekOffsets = useMemo(
    () => days.map((d) => weekOffsetForDate(d)),
    [days]
  );

  const { blocks } = useMonthBlocks(weekOffsets);

  const blocksByKey = useMemo(() => {
    const map = new Map<string, typeof blocks>();
    for (const block of blocks) {
      const key = `${block.week_offset}:${block.day_of_week}`;
      const existing = map.get(key);
      if (existing) {
        existing.push(block);
      } else {
        map.set(key, [block]);
      }
    }
    return map;
  }, [blocks]);

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
        {WEEKDAY_LABELS.map((label) => (
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
          <div key={weekIdx} className="flex-1 grid grid-cols-7 min-h-[88px] sm:min-h-[120px]">
            {week.map((day) => {
              const inMonth = isSameMonth(day, monthDate);
              const isToday = isSameDay(day, today);
              const dayOfWeek = (day.getDay() + 6) % 7;
              const key = `${weekOffsetForDate(day)}:${dayOfWeek}`;
              const dayBlocks = (blocksByKey.get(key) || [])
                .slice()
                .sort((a, b) => a.start_hour - b.start_hour || a.start_minute - b.start_minute);
              const visible = dayBlocks.slice(0, MAX_VISIBLE_CHIPS);
              const hiddenCount = dayBlocks.length - visible.length;

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => onSelectDay(day)}
                  className={`flex flex-col items-stretch text-left p-1.5 sm:p-2 border-r border-b border-border last:border-r-0 hover:bg-surface-hover/50 transition-colors ${
                    inMonth ? '' : 'opacity-40'
                  }`}
                >
                  <span
                    className={`self-start flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium mb-1 ${
                      isToday ? 'bg-accent text-accent-contrast' : 'text-text-primary'
                    }`}
                  >
                    {format(day, 'd', { locale: it })}
                  </span>
                  <div className="flex flex-col gap-0.5 min-w-0">
                    {visible.map((block) => (
                      <div
                        key={block.id}
                        className="truncate text-[10px] sm:text-[11px] leading-tight rounded px-1 py-0.5"
                        style={{
                          backgroundColor: `color-mix(in srgb, ${block.color} 22%, var(--color-surface))`,
                          borderLeft: `2px solid ${block.color}`,
                        }}
                      >
                        {block.title}
                      </div>
                    ))}
                    {hiddenCount > 0 && (
                      <div className="text-[10px] text-text-tertiary px-1">+{hiddenCount} altri</div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
