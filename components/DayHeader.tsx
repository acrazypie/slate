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
    <div className={`flex flex-col items-center py-3 ${isToday ? 'bg-surface' : ''}`}>
      <span className={`text-xs uppercase ${isToday ? 'text-accent' : 'text-text-secondary'}`}>
        {dayName}
      </span>
      <span className={`text-lg font-medium ${isToday ? 'text-accent' : 'text-text-primary'}`}>
        {dayNum}
      </span>
      <span className="text-xs text-text-secondary">{month}</span>
    </div>
  );
}