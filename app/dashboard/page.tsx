'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { WeekGrid } from '@/components/WeekGrid';
import { Sidebar } from '@/components/Sidebar';
import { useBlocks } from '@/hooks/useBlocks';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f]">
        <div className="text-[#888888]">Caricamento...</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#0f0f0f]">
      <Sidebar 
        user={user ? { email: user.email || '', name: user.user_metadata?.name } : undefined} 
        blocks={blocks}
      />
      <WeekGrid 
        user={user ? { email: user.email || '', name: user.user_metadata?.name } : undefined} 
      />
    </div>
  );
}