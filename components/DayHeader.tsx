import { format, isSameDay } from 'date-fns';
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
    <div className={`flex flex-col items-center py-3 ${isToday ? 'bg-[#1a1a1a]' : ''}`}>
      <span className={`text-xs uppercase ${isToday ? 'text-[#e8e0d0]' : 'text-[#888888]'}`}>
        {dayName}
      </span>
      <span className={`text-lg font-medium ${isToday ? 'text-[#e8e0d0]' : 'text-[#f5f5f5]'}`}>
        {dayNum}
      </span>
      <span className="text-xs text-[#888888]">{month}</span>
    </div>
  );
}