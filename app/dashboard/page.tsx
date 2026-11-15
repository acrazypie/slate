'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { startOfWeek, addDays, startOfMonth, endOfMonth, eachWeekOfInterval, isSameMonth } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { X } from 'lucide-react';
import { WeekGrid } from '@/components/WeekGrid';
import { Sidebar } from '@/components/Sidebar';
import { SettingsView } from '@/components/SettingsView';
import { ShiftsView } from '@/components/ShiftsView';
import { BottomNav, AppTab } from '@/components/BottomNav';
import { useBlocks } from '@/hooks/useBlocks';
import { useMonthBlocks } from '@/hooks/useMonthBlocks';
import { dateForWeekOffset, weekOffsetForDate } from '@/lib/recurrence';
import { useShiftAssignments } from '@/hooks/useShifts';
import { useI18n } from '@/components/LanguageProvider';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AppTab>('calendar');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createClient();
  const { t } = useI18n();
  // The summary counts this week's shifts too, not only events.
  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const { blocks, refetch: refetchBlocks } = useBlocks(useMemo(() => weekOffsetForDate(weekStart), [weekStart]));
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const { assignments, refetch: refetchAssignments } = useShiftAssignments(weekStart, weekEnd);
  // The same again for the current calendar month. Events are loaded by week,
  // so the weeks at either end bring in a few days of the neighbouring months:
  // those are dropped below.
  const monthStart = useMemo(() => startOfMonth(new Date()), []);
  const monthEnd = useMemo(() => endOfMonth(monthStart), [monthStart]);
  const monthWeekOffsets = useMemo(
    () => eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 }).map(weekOffsetForDate),
    [monthStart, monthEnd]
  );
  const { blocks: monthWeeksBlocks, refetch: refetchMonthBlocks } = useMonthBlocks(monthWeekOffsets);
  const monthBlocks = useMemo(
    () => monthWeeksBlocks.filter((b) => isSameMonth(dateForWeekOffset(b.week_offset, b.day_of_week), monthStart)),
    [monthWeeksBlocks, monthStart]
  );
  const { assignments: monthAssignments, refetch: refetchMonthAssignments } = useShiftAssignments(monthStart, monthEnd);
  // The calendar and the shifts tab keep their own copies of the data, so they
  // say when something changed and the summary reloads.
  const refreshSummary = useCallback(() => {
    refetchBlocks();
    refetchAssignments();
    refetchMonthBlocks();
    refetchMonthAssignments();
  }, [refetchBlocks, refetchAssignments, refetchMonthBlocks, refetchMonthAssignments]);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    if (sidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSidebarOpen(false);
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const currentUser = user ? { email: user.email || '', name: user.user_metadata?.name } : undefined;

  const handleOpenSidebar = () => setSidebarOpen(true);
  const handleCloseSidebar = () => setSidebarOpen(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-text-secondary">{t.common.loading}</div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh bg-bg text-text-primary">
      {/* Desktop sidebar - always visible */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-surface">
        <Sidebar
          user={currentUser}
          blocks={blocks}
          assignments={assignments}
          monthBlocks={monthBlocks}
          monthAssignments={monthAssignments}
          nav={{ active: tab, onChange: setTab }}
        />
      </aside>

      {/* Mobile scrim */}
      <div
        className={`
          fixed inset-0 z-40 bg-black/60 backdrop-blur-sm
          transition-opacity duration-300 md:hidden
          ${sidebarOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}
        `}
        onClick={handleCloseSidebar}
        aria-hidden="true"
      />

      {/* Mobile full-screen drawer */}
      <div
        className={`
          fixed inset-0 z-50 md:hidden flex flex-col
          bg-surface transition-[transform,visibility] duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full invisible'}
        `}
        role="dialog"
        aria-label={t.summary.title}
      >
        <div className="flex items-center justify-end p-4">
          <button
            onClick={handleCloseSidebar}
            className="flex items-center justify-center w-11 h-11 rounded-xl hover:bg-surface-hover transition-colors"
            aria-label={t.summary.close}
          >
            <X className="w-6 h-6 text-text-secondary" />
          </button>
        </div>
        <div className="flex-1 min-h-0 -mt-4">
          <Sidebar
            user={currentUser}
            blocks={blocks}
            assignments={assignments}
            monthBlocks={monthBlocks}
            monthAssignments={monthAssignments}
          />
        </div>
      </div>

      <div className="flex flex-1 min-w-0 flex-col">
        <div className="flex flex-1 min-h-0 flex-col">
          {tab === 'calendar' && <WeekGrid user={currentUser} onOpenSidebar={handleOpenSidebar} onDataChange={refreshSummary} />}
          {tab === 'shifts' && <ShiftsView onDataChange={refreshSummary} />}
          {tab === 'settings' && <SettingsView user={currentUser} />}
        </div>
        <BottomNav active={tab} onChange={setTab} />
      </div>
    </div>
  );
}