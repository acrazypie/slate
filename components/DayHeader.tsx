'use client';

import { format } from 'date-fns';
import { formatDate } from '@/lib/i18n/format';
import { useI18n } from './LanguageProvider';

interface DayHeaderProps {
  date: Date;
  isToday: boolean;
}

export function DayHeader({ date, isToday }: DayHeaderProps) {
  const { locale } = useI18n();
  if (!date || isNaN(date.getTime())) return null;

  const dayName = formatDate(locale, date, 'weekdayShort');
  const dayNum = format(date, 'd');
  const month = formatDate(locale, date, 'monthShort');

  return (
    <span className="flex flex-col items-center py-3 gap-1">
      <span className={`text-[11px] font-medium ${isToday ? 'text-accent-text' : 'text-text-secondary'}`}>
        {dayName}
      </span>
      <span
        className={`flex items-center justify-center w-7 h-7 rounded-full text-sm font-semibold transition-colors ${
          isToday ? 'bg-accent text-accent-contrast' : 'text-text-primary'
        }`}
      >
        {dayNum}
      </span>
      <span className="text-[10px] text-text-tertiary">{month}</span>
    </span>
  );
}