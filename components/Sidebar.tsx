'use client';

import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Block, CATEGORY_LABELS, CATEGORY_COLORS, BlockCategory } from '@/lib/types';
import { LogOut, Clock, Settings as SettingsIcon } from 'lucide-react';

interface SidebarProps {
  user?: {
    email: string;
    name?: string;
  };
  blocks: Block[];
  onSettingsClick?: () => void;
  onClose?: () => void;
}

export function Sidebar({ user, blocks, onSettingsClick, onClose }: SidebarProps) {
  const router = useRouter();
  const supabase = createClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/auth/login');
    onClose?.();
  };

  const categoryHours = blocks.reduce((acc, block) => {
    const category = block.category as BlockCategory;
    if (!acc[category]) {
      acc[category] = 0;
    }
    acc[category] += block.duration_minutes;
    return acc;
  }, {} as Record<BlockCategory, number>);

  const totalHours = Object.values(categoryHours).reduce((a, b) => a + b, 0) / 60;

  const categories: BlockCategory[] = ['studio', 'lavoro', 'lezione', 'altro'];

  return (
    <div className="w-64 bg-[#1a1a1a] border-r border-[#2a2a2a] flex flex-col">
      <div className="p-6 border-b border-[#2a2a2a]">
        <h1 className="font-serif text-2xl text-[#f5f5f5]">Slate</h1>
      </div>

      <div className="p-6 border-b border-[#2a2a2a]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#e8e0d0] flex items-center justify-center">
            <span className="text-[#0f0f0f] font-medium">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-[#f5f5f5] font-medium truncate">
              {user?.name || 'Utente'}
            </p>
            <p className="text-xs text-[#888888] truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1">
        <div className="flex items-center gap-2 text-sm text-[#888888] mb-4">
          <Clock className="w-4 h-4" />
          <span>Questa settimana</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[#888888]">Totale</span>
            <span className="text-[#f5f5f5] font-medium">{totalHours.toFixed(1)}h</span>
          </div>

          {categories.map((cat) => {
            const hours = (categoryHours[cat] || 0) / 60;
            if (hours === 0) return null;
            return (
              <div key={cat} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: CATEGORY_COLORS[cat] }}
                  />
                  <span className="text-[#888888]">{CATEGORY_LABELS[cat]}</span>
                </div>
                <span className="text-[#f5f5f5]">{hours.toFixed(1)}h</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-[#2a2a2a] space-y-1">
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="w-full flex items-center gap-2 px-4 py-2 text-[#888888] hover:text-[#f5f5f5] hover:bg-[#222222] rounded-md transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
            Impostazioni
          </button>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-[#888888] hover:text-[#f5f5f5] hover:bg-[#222222] rounded-md transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Esci
        </button>
      </div>
    </div>
  );
}