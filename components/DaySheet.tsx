'use client';

import { Plus, Briefcase, ArrowUpRight, CalendarDays } from 'lucide-react';
import { Block, ShiftAssignment, BlockCategory, formatTime, blockEndTime } from '@/lib/types';
import { Dialog, DialogClose } from './Dialog';
import { CategoryIcon } from './CategoryIcon';
import { formatDate } from '@/lib/i18n/format';
import { useI18n } from './LanguageProvider';

interface DaySheetProps {
  date: Date | null;
  blocks: Block[];
  assignments: ShiftAssignment[];
  onClose: () => void;
  onAddEvent: () => void;
  onAddShift: () => void;
  onEditBlock: (block: Block) => void;
  onEditAssignment: (assignment: ShiftAssignment) => void;
  onOpenDay: () => void;
}

/** The small menu shown when a day is tapped in the month view. */
export function DaySheet({
  date,
  blocks,
  assignments,
  onClose,
  onAddEvent,
  onAddShift,
  onEditBlock,
  onEditAssignment,
  onOpenDay,
}: DaySheetProps) {
  const { locale, t } = useI18n();
  if (!date) return null;

  const dayLabel = formatDate(locale, date, 'fullDay');
  const isEmpty = blocks.length === 0 && assignments.length === 0;
  const rowClass =
    'w-full flex items-center gap-3 px-3 py-2.5 bg-surface-hover rounded-xl hover:bg-border transition-colors text-left';

  return (
    <Dialog label={dayLabel} onClose={onClose} size="sheet">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-text-primary capitalize">{dayLabel}</h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenDay}
              className="flex items-center gap-1 px-3 min-h-11 -my-2 text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors"
            >
              {t.calendar.openDay}
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <DialogClose onClose={onClose} />
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {isEmpty && <p className="text-sm text-text-secondary py-1">{t.calendar.emptyDay}</p>}

          {assignments.map((a) => (
            <button key={a.id} onClick={() => onEditAssignment(a)} className={rowClass}>
              <span
                className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0"
                style={{ backgroundColor: `color-mix(in srgb, ${a.shift.color} 25%, var(--color-surface))` }}
              >
                <Briefcase className="w-4 h-4" style={{ color: a.shift.color }} />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-medium text-text-primary truncate">{a.shift.title}</span>
                <span className="block text-xs text-text-secondary">
                  {formatTime(a.shift.start_hour, a.shift.start_minute)} – {formatTime(a.shift.end_hour, a.shift.end_minute)}
                </span>
              </span>
              <span className="text-[10px] text-text-tertiary">{t.common.shift}</span>
            </button>
          ))}

          {blocks.map((block) => {
            const end = blockEndTime(block);
            return (
              <button key={`${block.id}-${block.week_offset}`} onClick={() => onEditBlock(block)} className={rowClass}>
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 text-text-primary"
                  style={{ backgroundColor: `color-mix(in srgb, ${block.color} 25%, var(--color-surface))` }}
                >
                  <CategoryIcon category={block.category as BlockCategory} className="w-4 h-4" />
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-text-primary truncate">{block.title}</span>
                  <span className="block text-xs text-text-secondary">
                    {formatTime(block.start_hour, block.start_minute)} – {formatTime(end.hour, end.minute)}
                  </span>
                </span>
                <span className="text-[10px] text-text-tertiary">{t.common.event}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={onAddShift}
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-surface-hover text-sm text-text-primary hover:bg-border transition-colors"
          >
            <Plus className="w-4 h-4" />
            {t.common.shift}
          </button>
          <button
            onClick={onAddEvent}
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-accent text-accent-contrast text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            {t.common.event}
          </button>
        </div>
    </Dialog>
  );
}
