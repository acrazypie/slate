'use client';

// Agenda: the seven days from `start` as a list, each day under its own heading.
// Read-only overview, as on Android; to place something, use the day or week view.

import { useMemo } from 'react';
import { addDays, isSameDay } from 'date-fns';
import { useBlocks } from '@/hooks/useBlocks';
import { useShiftAssignments } from '@/hooks/useShifts';
import { weekOffsetForDate } from '@/lib/recurrence';
import { capitalize, formatDate } from '@/lib/i18n/format';
import type { Block, ShiftAssignment } from '@/lib/types';
import { useI18n } from './LanguageProvider';

const pad = (n: number) => n.toString().padStart(2, '0');

interface AgendaItem {
  key: string;
  start: number; // minutes from midnight
  time: string;
  title: string;
  color: string;
}

export function AgendaView({ start }: { start: Date }) {
  const { locale, t } = useI18n();
  const end = addDays(start, 6);
  const today = new Date();

  // The seven days can cross a week boundary: load both stored weeks.
  const firstOffset = weekOffsetForDate(start);
  const secondOffset = weekOffsetForDate(end);
  const { blocks: firstBlocks } = useBlocks(firstOffset);
  const { blocks: secondBlocks } = useBlocks(secondOffset);
  const { assignments } = useShiftAssignments(start, end);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(start, i)), [start]);

  return (
    <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6">
      <div className="max-w-2xl mx-auto">
        {days.map((date) => {
          const dayOfWeek = (date.getDay() + 6) % 7;
          const dateKey = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
          const offset = weekOffsetForDate(date);
          const pool: Block[] = offset === firstOffset ? firstBlocks : secondBlocks;
          const items: AgendaItem[] = [
            ...pool
              .filter((b) => b.day_of_week === dayOfWeek)
              .map((b) => {
                const start = b.start_hour * 60 + b.start_minute;
                const endMin = start + b.duration_minutes;
                return {
                  key: `b:${b.id}`,
                  start,
                  time: `${pad(b.start_hour)}:${pad(b.start_minute)}–${pad(Math.floor(endMin / 60) % 24)}:${pad(endMin % 60)}`,
                  title: b.title,
                  color: b.color,
                };
              }),
            ...assignments
              .filter((a: ShiftAssignment) => a.shift_date === dateKey)
              .map((a: ShiftAssignment) => {
                const s = a.shift;
                const start = s.start_hour * 60 + s.start_minute;
                return {
                  key: `s:${a.id}`,
                  start,
                  time: `${pad(s.start_hour)}:${pad(s.start_minute)}–${pad(s.end_hour)}:${pad(s.end_minute)}`,
                  title: s.title,
                  color: s.color,
                };
              }),
          ].sort((x, y) => x.start - y.start);

          const isToday = isSameDay(date, today);
          return (
            <section key={dateKey} className="py-4 border-t border-border first:border-t-0">
              <h2 className={`text-sm font-medium mb-2 ${isToday ? 'text-accent-text' : 'text-text-secondary'}`}>
                {capitalize(formatDate(locale, date, 'fullDay'))}
              </h2>
              {items.length === 0 ? (
                <p className="text-sm text-text-tertiary py-2">{t.agenda.empty}</p>
              ) : (
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li
                      key={item.key}
                      className="flex items-stretch gap-3 rounded-2xl bg-surface px-4 py-3"
                    >
                      <span className="w-1 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium text-text-primary truncate">{item.title}</span>
                        <span className="block text-xs text-text-secondary tabular-nums mt-0.5">{item.time}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
