'use client';

import { Block, ShiftAssignment, CATEGORY_LABELS, CATEGORY_COLORS, BlockCategory, shiftDurationMinutes } from '@/lib/types';
import { Clock } from 'lucide-react';
import { AppTab, TABS } from './BottomNav';

interface SidebarProps {
  user?: {
    email: string;
    name?: string;
  };
  blocks: Block[];
  /** Shifts placed on days of the current week. */
  assignments?: ShiftAssignment[];
  /** Desktop only: the sidebar carries the main navigation there. */
  nav?: { active: AppTab; onChange: (tab: AppTab) => void };
}

function formatHours(minutes: number) {
  return `${(minutes / 60).toFixed(1)}h`;
}

export function Sidebar({ user, blocks, assignments = [], nav }: SidebarProps) {
  const categoryMinutes = blocks.reduce((acc, block) => {
    const category = block.category as BlockCategory;
    acc[category] = (acc[category] || 0) + block.duration_minutes;
    return acc;
  }, {} as Record<BlockCategory, number>);

  const shiftMinutes = assignments.reduce((sum, a) => sum + shiftDurationMinutes(a.shift), 0);
  const totalMinutes = Object.values(categoryMinutes).reduce((a, b) => a + b, 0) + shiftMinutes;

  const categories: BlockCategory[] = ['studio', 'lavoro', 'lezione', 'altro'];

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <p className="font-serif text-2xl text-text-primary">Slate</p>
      </div>

      <div className="p-6 border-b border-border">
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

      {nav && (
        <nav className="p-3 border-b border-border" aria-label="Navigazione principale">
          <ul className="flex flex-col gap-1">
            {TABS.map(({ id, label, Icon }) => {
              const isActive = nav.active === id;
              return (
                <li key={id}>
                  <button
                    onClick={() => nav.onChange(id)}
                    aria-current={isActive ? 'page' : undefined}
                    className={`w-full flex items-center gap-3 px-3 min-h-11 rounded-xl text-sm transition-colors ${
                      isActive
                        ? 'text-accent-text bg-surface-hover font-medium'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

      <div className="p-6 flex-1">
        <div className="flex items-center gap-2 text-sm text-text-secondary mb-4">
          <Clock className="w-4 h-4" />
          <span>Questa settimana</span>
        </div>

        {totalMinutes === 0 ? (
          <p className="text-sm text-text-secondary">
            Ancora niente in programma. Tocca un&apos;ora nel calendario per aggiungere un evento o un turno.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Totale</span>
              <span className="text-text-primary font-medium">{formatHours(totalMinutes)}</span>
            </div>

            {categories.map((cat) => {
              const minutes = categoryMinutes[cat] || 0;
              if (minutes === 0) return null;
              return (
                <div key={cat} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                    <span className="text-text-secondary">{CATEGORY_LABELS[cat]}</span>
                  </div>
                  <span className="text-text-primary">{formatHours(minutes)}</span>
                </div>
              );
            })}

            {shiftMinutes > 0 && (
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  {/* Dashed ring, like shifts on the grid. */}
                  <div className="w-3 h-3 rounded-full border border-dashed border-text-secondary" />
                  <span className="text-text-secondary">Turni</span>
                </div>
                <span className="text-text-primary">{formatHours(shiftMinutes)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
