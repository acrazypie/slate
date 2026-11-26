'use client';

import { Block, BlockCategory, OverlapSlot, overlapPosition } from '@/lib/types';
import { useI18n } from './LanguageProvider';
import { CategoryIcon } from './CategoryIcon';
import { Repeat } from 'lucide-react';

interface BlockCardProps {
  block: Block;
  onClick: (e: React.MouseEvent) => void;
  /** Take only the right half of the column, leaving the left half for a shift. */
  half?: boolean;
  /** Set when other events share this one's time: which column of how many it takes. */
  slot?: OverlapSlot;
}

export function BlockCard({ block, onClick, half, slot }: BlockCardProps) {
  const { t } = useI18n();
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
      aria-label={[
        block.title,
        t.categories[block.category as BlockCategory] ?? t.common.event,
        `${startTime}–${endTime}`,
        ...(block.is_recurring ? [t.calendar.recurring] : []),
      ].join(', ')}
      className={`absolute block text-left ${half ? 'left-1/2' : 'left-1'} right-1 rounded-xl px-2 py-1 cursor-pointer overflow-hidden transition-[filter] hover:brightness-110 pointer-events-auto`}
      style={{
        top: `${top}%`,
        height: `${height}%`,
        minHeight: '22px',
        // Timeline: a tint of the category colour, no stripe. The name carries the category.
        backgroundColor: `color-mix(in srgb, ${block.color} 22%, var(--color-surface))`,
        ...overlapPosition(slot, half),
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