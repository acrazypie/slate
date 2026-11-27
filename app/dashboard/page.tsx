'use client';

import { useEffect, useState } from 'react';
import { Onboarding, isOnboarded } from '@/components/Onboarding';
import { SummaryView } from '@/components/SummaryView';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { WeekGrid } from '@/components/WeekGrid';
import { Sidebar } from '@/components/Sidebar';
import { SettingsView } from '@/components/SettingsView';
import { ShiftsView } from '@/components/ShiftsView';
import { BottomNav, AppTab } from '@/components/BottomNav';
import { useI18n } from '@/components/LanguageProvider';

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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AppTab>('calendar');
  const supabase = createClient();
  const { t } = useI18n();
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    getUser();
  }, [supabase]);


  const currentUser = user ? { email: user.email || '', name: user.user_metadata?.name } : undefined;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-text-secondary">{t.common.loading}</div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex bg-bg text-text-primary">
      {/* Desktop sidebar - always visible */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-surface">
        <Sidebar user={currentUser} nav={{ active: tab, onChange: setTab }} />
      </aside>

      <div className="flex flex-1 min-w-0 min-h-0 flex-col">
        <div className="flex flex-1 min-h-0 flex-col">
          {tab === 'calendar' && <WeekGrid user={currentUser} />}
          {tab === 'summary' && <SummaryView onOpenSettings={() => setTab('settings')} />}
          {tab === 'shifts' && <ShiftsView />}
          {tab === 'settings' && <SettingsView user={currentUser} />}
        </div>
        <BottomNav active={tab} onChange={setTab} />
      </div>
    </div>
  );
}