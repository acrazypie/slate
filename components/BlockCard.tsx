'use client';

import { Block, CATEGORY_ICONS, BlockCategory } from '@/lib/types';
import { Repeat } from 'lucide-react';

interface BlockCardProps {
  block: Block;
  onClick: (e: React.MouseEvent) => void;
}

export function BlockCard({ block, onClick }: BlockCardProps) {
  const startTime = `${block.start_hour.toString().padStart(2, '0')}:${block.start_minute.toString().padStart(2, '0')}`;
  const endHour = block.start_hour + Math.floor((block.start_minute + block.duration_minutes) / 60);
  const endMinute = (block.start_minute + block.duration_minutes) % 60;
  const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;

  const top = ((block.start_hour * 60 + block.start_minute) / (24 * 60)) * 100;
  const height = (block.duration_minutes / (24 * 60)) * 100;
  const isCompact = height < 6;

  return (
    <div
      className="absolute left-1 right-1 rounded-lg pl-2 pr-1.5 py-1 cursor-pointer overflow-hidden transition-all shadow-sm hover:shadow-md hover:brightness-105"
      style={{
        top: `${top}%`,
        height: `${height}%`,
        minHeight: '22px',
        backgroundColor: `color-mix(in srgb, ${block.color} 22%, var(--color-surface))`,
        borderLeft: `3px solid ${block.color}`,
      }}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-1">
          <span className="text-xs font-medium truncate text-text-primary">
            {!isCompact && (
              <span className="mr-1">{CATEGORY_ICONS[block.category as BlockCategory]}</span>
            )}
            {block.title}
          </span>
          {block.is_recurring && !isCompact && (
            <Repeat className="w-3 h-3 flex-shrink-0 text-text-secondary" />
          )}
        </div>
        {!isCompact && (
          <span className="text-[10px] text-text-secondary">{startTime} – {endTime}</span>
        )}
      </div>
    </div>
  );
}