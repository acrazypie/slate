import { format } from 'date-fns';
import { it } from 'date-fns/locale';

interface DayHeaderProps {
  date: Date;
  isToday: boolean;
}

export function DayHeader({ date, isToday }: DayHeaderProps) {
  const dayName = format(date, 'EEE', { locale: it });
  const dayNum = format(date, 'd');
  const month = format(date, 'MMM');

  return (
    <div className="flex flex-col items-center py-3 gap-1">
      <span className={`text-[11px] font-medium uppercase tracking-wide ${isToday ? 'text-accent' : 'text-text-secondary'}`}>
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
    </div>
  );
}