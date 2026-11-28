'use client';

import { CalendarDays, Briefcase, ChartNoAxesColumn, Settings } from 'lucide-react';
import { useI18n } from './LanguageProvider';

export type AppTab = 'calendar' | 'shifts' | 'summary' | 'settings';

/** Tab ids double as keys into `t.nav` for the labels. */
export const TABS: { id: AppTab; Icon: typeof CalendarDays }[] = [
  { id: 'calendar', Icon: CalendarDays },
  { id: 'shifts', Icon: Briefcase },
  { id: 'summary', Icon: ChartNoAxesColumn },
  { id: 'settings', Icon: Settings },
];

/** Phone and tablet navigation. From `md` up the same tabs live in the sidebar. */
export function BottomNav({ active, onChange }: { active: AppTab; onChange: (tab: AppTab) => void }) {
  const { t } = useI18n();

  return (
    <nav
      className="md:hidden flex-shrink-0 border-t border-border bg-surface pb-[calc(env(safe-area-inset-bottom)+0.75rem)]"
      aria-label={t.nav.main}
    >
      <div className="flex justify-center gap-1 px-2 py-1.5 max-w-md mx-auto">
        {TABS.map(({ id, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => onChange(id)}
              aria-current={isActive ? 'page' : undefined}
              className={`flex-1 flex flex-col items-center gap-1 py-1.5 text-[11px] transition-colors ${
                isActive ? 'text-accent-text font-semibold' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              {/* Timeline: the active tab sits on a soft accent pill. */}
              <span
                className={`flex items-center justify-center w-14 h-7 rounded-full transition-colors ${
                  isActive ? 'bg-[color-mix(in_srgb,var(--color-accent)_18%,transparent)]' : ''
                }`}
              >
                <Icon className="w-5 h-5" />
              </span>
              {t.nav[id]}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
