'use client';

import { AppTab, TABS } from './BottomNav';
import { useI18n } from './LanguageProvider';

interface SidebarProps {
  user?: {
    email: string;
    name?: string;
  };
  nav?: { active: AppTab; onChange: (tab: AppTab) => void };
}

export function Sidebar({ user, nav }: SidebarProps) {
  const { t } = useI18n();

  return (
    <div className="flex flex-col h-full">
      <div className="p-6 border-b border-border">
        <p className="font-semibold tracking-tight text-2xl text-text-primary">Slate</p>
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
              {user?.name || t.common.user}
            </p>
            <p className="text-xs text-text-secondary truncate">{user?.email}</p>
          </div>
        </div>
      </div>

      {nav && (
        <nav className="p-3 border-b border-border" aria-label={t.nav.main}>
          <ul className="flex flex-col gap-1">
            {TABS.map(({ id, Icon }) => {
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
                    {t.nav[id]}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>
      )}

    </div>
  );
}
