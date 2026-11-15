'use client';

import { Briefcase } from 'lucide-react';
import { ShiftAssignment, formatTime, isOvernightShift } from '@/lib/types';
import { fill } from '@/lib/i18n/format';
import { useI18n } from './LanguageProvider';

interface ShiftCardProps {
  assignment: ShiftAssignment;
  onClick: (e: React.MouseEvent) => void;
  /** Take only the left half of the column, leaving the right half for events. */
  half?: boolean;
}

export function ShiftCard({ assignment, onClick, half }: ShiftCardProps) {
  const { t } = useI18n();
  const { shift } = assignment;
  const startMinutes = shift.start_hour * 60 + shift.start_minute;
  // An overnight shift is drawn up to midnight on the day it starts.
  const endMinutes = isOvernightShift(shift) ? 24 * 60 : shift.end_hour * 60 + shift.end_minute;
  const top = (startMinutes / (24 * 60)) * 100;
  const height = ((endMinutes - startMinutes) / (24 * 60)) * 100;
  const isCompact = height < 6;

  return (
    <button
      type="button"
      aria-label={`${fill(t.calendar.shiftLabel, { title: shift.title })}, ${formatTime(shift.start_hour, shift.start_minute)}–${formatTime(shift.end_hour, shift.end_minute)}`}
      className={`absolute block text-left left-1 ${half ? 'right-1/2' : 'right-1'} rounded-lg px-2 py-1 cursor-pointer overflow-hidden transition-all hover:brightness-105 pointer-events-auto border border-dashed`}
      style={{
        top: `${top}%`,
        height: `${height}%`,
        minHeight: '22px',
        backgroundColor: `color-mix(in srgb, ${shift.color} 16%, var(--color-surface))`,
        borderColor: shift.color,
      }}
      onClick={onClick}
    >
      <span className="flex items-center gap-1 min-w-0">
        {!isCompact && <Briefcase className="w-3 h-3 flex-shrink-0" style={{ color: shift.color }} />}
        <span className="text-xs font-medium truncate text-text-primary">{shift.title}</span>
      </span>
      {!isCompact && (
        <span className="block text-[10px] text-text-secondary truncate">
          {formatTime(shift.start_hour, shift.start_minute)} – {formatTime(shift.end_hour, shift.end_minute)}
        </span>
      )}
    </button>
  );
}
