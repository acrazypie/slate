'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { X } from 'lucide-react';
import { WeekGrid } from '@/components/WeekGrid';
import { Sidebar } from '@/components/Sidebar';
import { SettingsView } from '@/components/SettingsView';
import { ShiftsView } from '@/components/ShiftsView';
import { BottomNav, AppTab } from '@/components/BottomNav';
import { useBlocks } from '@/hooks/useBlocks';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<AppTab>('calendar');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const supabase = createClient();
  const { blocks } = useBlocks(0);

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
        <div className="text-text-secondary">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="flex h-dvh bg-bg text-text-primary">
      {/* Desktop sidebar - always visible */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:border-r md:border-border md:bg-surface">
        <Sidebar 
          user={user ? { email: user.email || '', name: user.user_metadata?.name } : undefined} 
          blocks={blocks}
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
          fixed inset-0 z-50 md:hidden
          bg-surface transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Menu laterale"
      >
        <div className="flex items-center justify-end p-4">
          <button
            onClick={handleCloseSidebar}
            className="p-2 rounded-2xl hover:bg-surface-hover transition-colors"
            aria-label="Chiudi menu"
          >
            <X className="w-6 h-6 text-text-secondary" />
          </button>
        </div>
        <div className="flex-1 -mt-4">
          <Sidebar 
            user={user ? { email: user.email || '', name: user.user_metadata?.name } : undefined} 
            blocks={blocks}
          />
        </div>
      </div>

      <div className="flex flex-1 min-w-0 flex-col">
        <div className="flex flex-1 min-h-0 flex-col">
          {tab === 'calendar' && <WeekGrid user={currentUser} onOpenSidebar={handleOpenSidebar} />}
          {tab === 'shifts' && <ShiftsView />}
          {tab === 'settings' && <SettingsView user={currentUser} />}
        </div>
        <BottomNav active={tab} onChange={setTab} />
      </div>
    </div>
  );
}