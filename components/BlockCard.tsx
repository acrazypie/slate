'use client';

import { Block, BlockCategory, CATEGORY_LABELS } from '@/lib/types';
import { CategoryIcon } from './CategoryIcon';
import { Repeat } from 'lucide-react';

interface BlockCardProps {
  block: Block;
  onClick: (e: React.MouseEvent) => void;
  /** Take only the right half of the column, leaving the left half for a shift. */
  half?: boolean;
}

export function BlockCard({ block, onClick, half }: BlockCardProps) {
  const startTime = `${block.start_hour.toString().padStart(2, '0')}:${block.start_minute.toString().padStart(2, '0')}`;
  const endHour = block.start_hour + Math.floor((block.start_minute + block.duration_minutes) / 60);
  const endMinute = (block.start_minute + block.duration_minutes) % 60;
  const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

  const top = ((block.start_hour * 60 + block.start_minute) / (24 * 60)) * 100;
  const height = (block.duration_minutes / (24 * 60)) * 100;
  const isCompact = height < 6;

  return (
    <button
      type="button"
      aria-label={`${block.title}, ${CATEGORY_LABELS[block.category as BlockCategory] ?? 'Evento'}, ${startTime}–${endTime}${block.is_recurring ? ', ricorrente' : ''}`}
      className={`absolute block text-left ${half ? 'left-1/2' : 'left-1'} right-1 rounded-lg pl-2 pr-1.5 py-1 cursor-pointer overflow-hidden transition-all shadow-sm hover:shadow-md hover:brightness-105 pointer-events-auto`}
      style={{
        top: `${top}%`,
        height: `${height}%`,
        minHeight: '22px',
        backgroundColor: `color-mix(in srgb, ${block.color} 22%, var(--color-surface))`,
        borderLeft: `3px solid ${block.color}`,
      }}
      onClick={onClick}
    >
      <span className="flex flex-col h-full">
        <span className="flex items-start justify-between gap-1">
          <span className="flex items-center gap-1 min-w-0 text-xs font-medium text-text-primary">
            {!isCompact && (
              <CategoryIcon category={block.category as BlockCategory} className="w-3 h-3 flex-shrink-0" />
            )}
            <span className="truncate">{block.title}</span>
          </span>
          {block.is_recurring && !isCompact && (
            <Repeat className="w-3 h-3 flex-shrink-0 text-text-secondary" />
          )}
        </span>
        {!isCompact && (
          <span className="text-[10px] text-text-secondary">{startTime} – {endTime}</span>
        )}
      </span>
    </button>
  );
}