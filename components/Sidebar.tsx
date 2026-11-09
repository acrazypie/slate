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
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <h1 className="font-serif text-2xl text-text-primary">Slate</h1>
      </div>

      <div className={`p-6 border-b border-border`}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <span className="text-accent-contrast font-medium">
              {user?.email?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-primary font-medium truncate">
              {user?.name || 'Utente'}
            </p>
            <p className="text-xs text-text-secondary truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      <div className="p-6 flex-1">
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
          <Clock className="w-4 h-4" />
          <span>Questa settimana</span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">Totale</span>
            <span className="text-text-primary font-medium">{totalHours.toFixed(1)}h</span>
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
                  <span className="text-text-secondary">{CATEGORY_LABELS[cat]}</span>
                </div>
                <span className="text-text-primary">{hours.toFixed(1)}h</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-border space-y-1">
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="w-full flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors"
          >
            <SettingsIcon className="w-4 h-4" />
            Impostazioni
          </button>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-4 py-2 text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-xl transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Esci
        </button>
      </div>
    </div>
  );
}