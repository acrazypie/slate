'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { X } from 'lucide-react';
import { WeekGrid } from '@/components/WeekGrid';
import { Sidebar } from '@/components/Sidebar';
import { SettingsModal } from '@/components/SettingsModal';
import { useBlocks } from '@/hooks/useBlocks';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
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

  const handleOpenSidebar = () => setSidebarOpen(true);
  const handleCloseSidebar = () => setSidebarOpen(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-[#888888]">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f0f0f]">
      {/* Desktop sidebar - always visible */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <Sidebar 
          user={user ? { email: user.email || '', name: user.user_metadata?.name } : undefined} 
          blocks={blocks}
          onSettingsClick={() => setIsSettingsOpen(true)}
          onClose={handleCloseSidebar}
        />
      </div>

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

      {/* Mobile drawer */}
      <div
        className={`
          fixed top-0 left-0 z-50 h-full w-72 md:hidden
          transform transition-transform duration-300 ease-in-out
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
        aria-label="Menu laterale"
      >
        <button
          onClick={handleCloseSidebar}
          className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Chiudi menu"
        >
          <X className="w-5 h-5 text-[#888888]" />
        </button>
        <Sidebar 
          user={user ? { email: user.email || '', name: user.user_metadata?.name } : undefined} 
          blocks={blocks}
          onSettingsClick={() => { setIsSettingsOpen(true); handleCloseSidebar(); }}
          onClose={handleCloseSidebar}
        />
      </div>

      <WeekGrid 
        user={user ? { email: user.email || '', name: user.user_metadata?.name } : undefined}
        onOpenSidebar={handleOpenSidebar}
      />
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}