'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { startOfWeek, addDays } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { X } from 'lucide-react';
import { WeekGrid } from '@/components/WeekGrid';
import { Sidebar } from '@/components/Sidebar';
import { SettingsView } from '@/components/SettingsView';
import { ShiftsView } from '@/components/ShiftsView';
import { BottomNav, AppTab } from '@/components/BottomNav';
import { useBlocks } from '@/hooks/useBlocks';
import { useShiftAssignments } from '@/hooks/useShifts';
import { useI18n } from '@/components/LanguageProvider';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AppTab>('calendar');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createClient();
  const { t } = useI18n();
  const { blocks, refetch: refetchBlocks } = useBlocks(0);
  // The summary counts this week's shifts too, not only events.
  const weekStart = useMemo(() => startOfWeek(new Date(), { weekStartsOn: 1 }), []);
  const weekEnd = useMemo(() => addDays(weekStart, 6), [weekStart]);
  const { assignments, refetch: refetchAssignments } = useShiftAssignments(weekStart, weekEnd);
  // The calendar and the shifts tab keep their own copies of the data, so they
  // say when something changed and the summary reloads.
  const refreshSummary = useCallback(() => {
    refetchBlocks();
    refetchAssignments();
  }, [refetchBlocks, refetchAssignments]);

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
        <div className="flex-1 -mt-4">
          <Sidebar user={currentUser} blocks={blocks} assignments={assignments} />
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