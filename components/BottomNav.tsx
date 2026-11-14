'use client';

import { CalendarDays, Briefcase, Settings } from 'lucide-react';

export type AppTab = 'calendar' | 'shifts' | 'settings';

export const TABS: { id: AppTab; label: string; Icon: typeof CalendarDays }[] = [
  { id: 'calendar', label: 'Calendario', Icon: CalendarDays },
  { id: 'shifts', label: 'Turni', Icon: Briefcase },
  { id: 'settings', label: 'Impostazioni', Icon: Settings },
];

/** Phone and tablet navigation. From `md` up the same tabs live in the sidebar. */
export function BottomNav({ active, onChange }: { active: AppTab; onChange: (tab: AppTab) => void }) {
  return (
    <nav
      className="md:hidden flex-shrink-0 border-t border-border bg-surface pb-[env(safe-area-inset-bottom)]"
      aria-label="Navigazione principale"
    >
      <div className="flex justify-center gap-1 px-2 py-1.5 max-w-md mx-auto">
        {TABS.map(({ id, label, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center gap-0.5 py-1.5 rounded-xl text-[11px] transition-colors ${
                isActive ? 'text-accent-text bg-surface-hover font-medium' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              <Icon className="w-5 h-5" />
              {label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
