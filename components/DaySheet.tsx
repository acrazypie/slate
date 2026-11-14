'use client';

import { format } from 'date-fns';
import { it } from 'date-fns/locale';
import { Plus, X, Briefcase, ArrowUpRight } from 'lucide-react';
import { Block, ShiftAssignment, CATEGORY_ICONS, BlockCategory, formatTime, blockEndTime } from '@/lib/types';

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
  if (!date) return null;

  const isEmpty = blocks.length === 0 && assignments.length === 0;
  const rowClass =
    'w-full flex items-center gap-3 px-3 py-2.5 bg-surface-hover rounded-xl hover:bg-border transition-colors text-left';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-surface rounded-t-2xl sm:rounded-2xl w-full sm:max-w-sm mx-0 sm:mx-4 p-5 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-medium text-text-primary capitalize">
            {format(date, 'EEEE d MMMM', { locale: it })}
          </h2>
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenDay}
              className="flex items-center gap-1 px-2 py-1 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
            >
              Apri giorno
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button onClick={onClose} className="p-1 hover:bg-surface-hover rounded" aria-label="Chiudi">
              <X className="w-4 h-4 text-text-secondary" />
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-2 mb-4">
          {isEmpty && <p className="text-sm text-text-secondary py-1">Nessun turno o evento in questo giorno.</p>}

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
              <span className="text-[10px] uppercase tracking-wide text-text-tertiary">Turno</span>
            </button>
          ))}

          {blocks.map((block) => {
            const end = blockEndTime(block);
            return (
              <button key={`${block.id}-${block.week_offset}`} onClick={() => onEditBlock(block)} className={rowClass}>
                <span
                  className="flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 text-sm"
                  style={{ backgroundColor: `color-mix(in srgb, ${block.color} 25%, var(--color-surface))` }}
                >
                  {CATEGORY_ICONS[block.category as BlockCategory]}
                </span>
                <span className="flex-1 min-w-0">
                  <span className="block text-sm font-medium text-text-primary truncate">{block.title}</span>
                  <span className="block text-xs text-text-secondary">
                    {formatTime(block.start_hour, block.start_minute)} – {formatTime(end.hour, end.minute)}
                  </span>
                </span>
                <span className="text-[10px] uppercase tracking-wide text-text-tertiary">Evento</span>
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
            Turno
          </button>
          <button
            onClick={onAddEvent}
            className="flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-accent text-accent-contrast text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Evento
          </button>
        </div>
      </div>
    </div>
  );
}
