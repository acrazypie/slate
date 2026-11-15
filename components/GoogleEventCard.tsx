'use client';

import { CalendarDays, Repeat } from 'lucide-react';
import { GoogleEvent, GoogleEventSegment, OverlapSlot, formatTime, overlapPosition } from '@/lib/types';
import { useI18n } from './LanguageProvider';

interface GoogleEventCardProps {
  /** The part of the event that falls on this day. */
  segment: GoogleEventSegment;
  onClick: (e: React.MouseEvent) => void;
  /** Take only the right half of the column, leaving the left half for a shift. */
  half?: boolean;
  slot?: OverlapSlot;
}

/** An event from Google Calendar on the hour grid. Looks like a Slate event, with a calendar icon. */
export function GoogleEventCard({ segment, onClick, half, slot }: GoogleEventCardProps) {
  const { t } = useI18n();
  const { event } = segment;
  const timeRange = `${formatTime(event.start_hour, event.start_minute)} – ${formatTime(event.end_hour, event.end_minute)}`;

  const top = (segment.start / (24 * 60)) * 100;
  const height = ((segment.end - segment.start) / (24 * 60)) * 100;
  const isCompact = height < 6;

  return (
    <button
      type="button"
      aria-label={[
        event.title || t.googleEvent.untitled,
        `${t.calendar.googleEvent} (${event.calendarName})`,
        timeRange,
        ...(event.recurringEventId ? [t.calendar.recurring] : []),
      ].join(', ')}
      className={`absolute block text-left ${half ? 'left-1/2' : 'left-1'} right-1 rounded-lg pl-2 pr-1.5 py-1 cursor-pointer overflow-hidden transition-all shadow-sm hover:shadow-md hover:brightness-105 pointer-events-auto`}
      style={{
        top: `${top}%`,
        height: `${height}%`,
        minHeight: '22px',
        backgroundColor: `color-mix(in srgb, ${event.color} 22%, var(--color-surface))`,
        borderLeft: `3px solid ${event.color}`,
        ...overlapPosition(slot, half),
      }}
      onClick={onClick}
    >
      <span className="flex flex-col h-full">
        <span className="flex items-start justify-between gap-1">
          <span className="flex items-center gap-1 min-w-0 text-xs font-medium text-text-primary">
            {!isCompact && <CalendarDays className="w-3 h-3 flex-shrink-0" />}
            <span className="truncate">{event.title || t.googleEvent.untitled}</span>
          </span>
          {event.recurringEventId && !isCompact && <Repeat className="w-3 h-3 flex-shrink-0 text-text-secondary" />}
        </span>
        {!isCompact && <span className="text-[10px] text-text-secondary">{timeRange}</span>}
      </span>
    </button>
  );
}

/** An all-day Google event: a one-line chip above the hours. */
export function AllDayChip({ event, onClick }: { event: GoogleEvent; onClick: (e: React.MouseEvent) => void }) {
  const { t } = useI18n();
  const title = event.title || t.googleEvent.untitled;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${title}, ${t.calendar.allDay}, ${t.calendar.googleEvent} (${event.calendarName})`}
      className="block w-full min-w-0 h-5 px-1.5 rounded text-left text-[10px] sm:text-[11px] leading-5 text-text-primary truncate hover:brightness-105 transition-all"
      style={{
        backgroundColor: `color-mix(in srgb, ${event.color} 30%, var(--color-surface))`,
        borderLeft: `2px solid ${event.color}`,
      }}
    >
      {title}
    </button>
  );
}
