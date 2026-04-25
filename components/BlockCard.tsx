'use client';

import { format } from 'date-fns';
import { Block, CATEGORY_LABELS } from '@/lib/types';
import { X } from 'lucide-react';

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

  const colorHex = block.color;
  const bgColor = `${colorHex}33`;
  const borderColor = colorHex;

  return (
    <div
      className="absolute left-1 right-1 rounded-md border px-2 py-1 cursor-pointer overflow-hidden hover:brightness-110 transition-all"
      style={{
        top: `${top}%`,
        height: `${height}%`,
        minHeight: '24px',
        backgroundColor: bgColor,
        borderColor: borderColor,
      }}
      onClick={onClick}
    >
      <div className="flex flex-col h-full">
        <div className="flex items-start justify-between gap-1">
          <span className="text-xs font-medium text-[#f5f5f5] truncate">{block.title}</span>
        </div>
        <span className="text-[10px] text-[#888888]">{startTime} – {endTime}</span>
      </div>
    </div>
  );
}