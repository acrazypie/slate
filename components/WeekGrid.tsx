'use client';

import { useMemo, useEffect, useState } from 'react';
import { format, isSameDay } from 'date-fns';
import { it } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Menu, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useWeek } from '@/hooks/useWeek';
import { useBlocks } from '@/hooks/useBlocks';
import { Block, BlockFormData } from '@/lib/types';
import { DayHeader } from './DayHeader';
import { BlockCard } from './BlockCard';
import { BlockModal } from './BlockModal';

interface WeekGridProps {
  user?: {
    email: string;
    name?: string;
  };
  onOpenSidebar?: () => void;
}

export function WeekGrid({ user, onOpenSidebar }: WeekGridProps) {
  const { weekOffset, weekDays, today, goToNextWeek, goToPrevWeek, goToCurrentWeek, formatWeekRange } = useWeek();
  const { blocks, createBlock, updateBlock, deleteBlock, refetch: fetchBlocks } = useBlocks(weekOffset);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedBlock, setSelectedBlock] = useState<Block | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalInitialData, setModalInitialData] = useState<{
    day_of_week: number;
    start_hour: number;
    start_minute: number;
  } | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const currentHour = currentTime.getHours();
  const currentMinute = currentTime.getMinutes();
  const isCurrentDay = useMemo(
    () => weekDays.some((day) => isSameDay(day, today)),
    [weekDays, today]
  );

  const hours = useMemo(() => Array.from({ length: 24 }, (_, i) => i), []);

  const getBlocksForDay = (dayIndex: number) => {
    return blocks.filter((b) => b.day_of_week === dayIndex);
  };

  const handleCellClick = (dayOfWeek: number, hour: number, minute: number = 0) => {
    setModalInitialData({ day_of_week: dayOfWeek, start_hour: hour, start_minute: minute });
    setSelectedBlock(null);
    setIsModalOpen(true);
  };

  const handleBlockClick = (block: Block, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedBlock(block);
    setModalInitialData(null);
    setIsModalOpen(true);
  };

  const handleSaveBlock = async (formData: BlockFormData) => {
    if (selectedBlock) {
      await updateBlock(selectedBlock.id, formData);
    } else {
      await createBlock(formData);
    }
    setIsModalOpen(false);
  };

  const handleDeleteBlock = async () => {
    if (selectedBlock) {
      await deleteBlock(selectedBlock.id);
      setIsModalOpen(false);
    }
  };

  const handleDeleteRecurring = async (deleteType: 'current' | 'this-and-following' | 'all') => {
    if (!selectedBlock?.recurrence_group_id) return;
    
    if (deleteType === 'current') {
      await deleteBlock(selectedBlock.id);
    } else if (deleteType === 'this-and-following') {
      await deleteRecurringThisAndFollowing(selectedBlock.id, selectedBlock.recurrence_group_id, selectedBlock.week_offset);
    } else {
      await deleteRecurringAll(selectedBlock.recurrence_group_id);
    }
    setIsModalOpen(false);
  };

  const deleteRecurringThisAndFollowing = async (currentId: string, groupId: string, currentWeekOffset: number) => {
    const supabase = createClient();
    await supabase
      .from('blocks')
      .delete()
      .eq('recurrence_group_id', groupId)
      .gte('week_offset', currentWeekOffset);
    fetchBlocks();
  };

  const deleteRecurringAll = async (groupId: string) => {
    const supabase = createClient();
    await supabase
      .from('blocks')
      .delete()
      .eq('recurrence_group_id', groupId);
    fetchBlocks();
  };

  const currentTimePosition = useMemo(() => {
    if (isCurrentDay) {
      return (currentHour * 60 + currentMinute) / (24 * 60) * 100;
    }
    return null;
  }, [isCurrentDay, currentHour, currentMinute]);

  const selectedDay = weekDays[selectedDayIndex];
  const dayBlocksForSelectedDay = getBlocksForDay(selectedDayIndex);
  const isTodaySelectedDay = isSameDay(selectedDay, today);

  const handleGoToNextDay = () => {
    if (selectedDayIndex < 6) {
      setSelectedDayIndex(selectedDayIndex + 1);
    } else {
      goToNextWeek();
      setSelectedDayIndex(0);
    }
  };

  const handleGoToPrevDay = () => {
    if (selectedDayIndex > 0) {
      setSelectedDayIndex(selectedDayIndex - 1);
    } else {
      goToPrevWeek();
      setSelectedDayIndex(6);
    }
  };

  return (
    <div className="flex flex-1 flex-col overflow-hidden bg-[#0f0f0f]">
      {/* Mobile header with hamburger */}
      <div className="flex sm:hidden items-center justify-between px-4 py-3 bg-[#0f0f0f] border-b border-[#2a2a2a]">
        <div className="flex items-center gap-2">
          <button
            onClick={handleGoToPrevDay}
            className="p-2 rounded-md hover:bg-[#1a1a1a] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#888888]" />
          </button>
          <h2 className="text-base font-medium text-[#f5f5f5]">
            {selectedDay ? format(selectedDay, 'EEEE d MMM', { locale: it }) : ''}
          </h2>
          <button
            onClick={handleGoToNextDay}
            className="p-2 rounded-md hover:bg-[#1a1a1a] transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[#888888]" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenSidebar}
            className="p-2 rounded-md hover:bg-[#1a1a1a] transition-colors"
            aria-label="Apri menu"
          >
            <Menu className="w-5 h-5 text-[#888888]" />
          </button>
        </div>
      </div>

      {/* Desktop header */}
      <div className="hidden sm:flex items-center justify-between px-6 py-4 bg-[#0f0f0f] border-b border-[#2a2a2a]">
        <div className="flex items-center gap-4">
          <button
            onClick={goToPrevWeek}
            className="p-2 rounded-md hover:bg-[#1a1a1a] transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-[#888888]" />
          </button>
          <h2 className="text-lg font-medium text-[#f5f5f5]">{formatWeekRange}</h2>
          <button
            onClick={goToNextWeek}
            className="p-2 rounded-md hover:bg-[#1a1a1a] transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-[#888888]" />
          </button>
        </div>
        <button
          onClick={goToCurrentWeek}
          className="px-4 py-2 text-sm text-[#888888] hover:text-[#f5f5f5] transition-colors"
        >
          Oggi
        </button>
      </div>

      {/* Mobile single day view */}
      <div className="sm:hidden flex-1 flex flex-col overflow-hidden">
        <DayHeader date={selectedDay} isToday={isTodaySelectedDay} />
        <div className="flex flex-1 flex-col relative">
          {hours.map((hour) => (
            <div
              key={hour}
              className="flex-shrink-0 h-14 min-h-[56px] border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors cursor-pointer"
              onClick={() => handleCellClick(selectedDayIndex, hour, 0)}
            >
              <span className="text-xs text-[#888888] ml-2 pt-1 block">{hour.toString().padStart(2, '0')}:00</span>
            </div>
          ))}
          <div className="absolute inset-0 pointer-events-none">
            {dayBlocksForSelectedDay.map((block) => (
              <BlockCard
                key={block.id}
                block={block}
                onClick={(e) => handleBlockClick(block, e)}
              />
            ))}
          </div>
          {isTodaySelectedDay && currentTimePosition !== null && (
            <div
              className="absolute left-0 right-0 h-0.5 bg-[#ef4444] z-10 pointer-events-none"
              style={{ top: `${currentTimePosition}%` }}
            />
          )}
        </div>
      </div>

      {/* Desktop week grid */}
      <div className="hidden sm:flex flex-1 overflow-y-auto">
        <div className="flex flex-1 min-w-0">
          <div className="flex flex-col w-16 flex-shrink-0 border-r border-[#2a2a2a]">
            <DayHeader date={weekDays[0]} isToday={false} />
            <div className="flex flex-1 flex-col relative">
              {hours.map((hour) => (
                <div
                  key={hour}
                  className="flex-shrink-0 h-12 text-xs text-[#888888] text-right pr-3 pt-1"
                >
                  {hour.toString().padStart(2, '0')}:00
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-1">
            {weekDays.map((day, dayIndex) => {
              const isToday = isSameDay(day, today);
              const dayBlocks = getBlocksForDay(dayIndex);
              const showCurrentTimeLine = isToday;

              return (
                <div
                  key={dayIndex}
                  className="flex-1 min-w-0 border-r border-[#2a2a2a] last:border-r-0"
                >
                  <DayHeader date={day} isToday={isToday} />
                  <div className="relative flex-1 cursor-pointer" style={{ height: '288px' }}>
                    {hours.map((hour) => (
                      <div
                        key={hour}
                        className="flex-shrink-0 h-12 border-b border-[#2a2a2a] hover:bg-[#1a1a1a] transition-colors"
                        onClick={() => handleCellClick(dayIndex, hour, 0)}
                      />
                    ))}
                    <div className="absolute inset-0 pointer-events-none">
                      {dayBlocks.map((block) => (
                        <BlockCard
                          key={block.id}
                          block={block}
                          onClick={(e) => handleBlockClick(block, e)}
                        />
                      ))}
                    </div>
                    {showCurrentTimeLine && currentTimePosition !== null && (
                      <div
                        className="absolute left-0 right-0 h-0.5 bg-[#ef4444] z-10 pointer-events-none"
                        style={{ top: `${currentTimePosition}%` }}
                      />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {isModalOpen && (
        <BlockModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveBlock}
          onDelete={handleDeleteBlock}
          onDeleteRecurring={handleDeleteRecurring}
          initialData={modalInitialData}
          block={selectedBlock}
        />
      )}
    </div>
  );
}