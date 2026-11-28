'use client';

import { useEffect, useState } from 'react';
import { Onboarding, isOnboarded } from '@/components/Onboarding';
import { SummaryView } from '@/components/SummaryView';
import { WeekGrid } from '@/components/WeekGrid';
import { Sidebar } from '@/components/Sidebar';
import { SettingsView } from '@/components/SettingsView';
import { useI18n } from '@/components/LanguageProvider';
import { CHANGED_EVENT } from '@/lib/localDb';
import { syncReminders } from '@/lib/push';
import { ShiftsView } from '@/components/ShiftsView';
import { BottomNav, AppTab } from '@/components/BottomNav';

/** The dashboard, with the first-visit onboarding on top until it is done on this device. */
export default function DashboardPage() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  useEffect(() => {
    setShowOnboarding(!isOnboarded());
  }, []);
  return (
    <>
      <DashboardContent />
      {showOnboarding && <Onboarding onDone={() => setShowOnboarding(false)} />}
    </>
  );
}

function DashboardContent() {
  const [tab, setTab] = useState<AppTab>('calendar');
  const { locale } = useI18n();
  // Reminders: upload this browser's items now, and again shortly after each change.
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const run = () => {
      void syncReminders(locale).catch(() => {});
    };
    const onChange = () => {
      clearTimeout(timer);
      timer = setTimeout(run, 1500);
    };
    run();
    window.addEventListener(CHANGED_EVENT, onChange);
    return () => {
      clearTimeout(timer);
      window.removeEventListener(CHANGED_EVENT, onChange);
    };
  }, [locale]);
  // The data and settings live in this browser, so nothing is drawn on the server.
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  // Deep link: /dashboard?tab=settings (or calendar, shifts, summary) opens that tab.
  // Read after mount so the server and the first client render match.
  useEffect(() => {
    const requested = new URLSearchParams(window.location.search).get('tab');
    if (requested === 'calendar' || requested === 'shifts' || requested === 'summary' || requested === 'settings') {
      setTab(requested);
    }
  }, []);


  if (!mounted) return <div className="fixed inset-0 bg-bg" />;

  return (
    <div className="fixed inset-0 flex bg-bg text-text-primary">
      {/* Desktop sidebar - always visible */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-surface">
        <Sidebar nav={{ active: tab, onChange: setTab }} />
      </aside>

      <div className="flex flex-1 min-w-0 min-h-0 flex-col">
        <div className="flex flex-1 min-h-0 flex-col">
          {tab === 'calendar' && <WeekGrid />}
          {tab === 'summary' && <SummaryView onOpenSettings={() => setTab('settings')} />}
          {tab === 'shifts' && <ShiftsView />}
          {tab === 'settings' && <SettingsView />}
        </div>
        <BottomNav active={tab} onChange={setTab} />
      </div>
    </div>
  );
}