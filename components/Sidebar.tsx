'use client';

import { Block, ShiftAssignment, CATEGORIES, CATEGORY_COLORS, BlockCategory, shiftDurationMinutes } from '@/lib/types';
import { Clock } from 'lucide-react';
import { AppTab, TABS } from './BottomNav';
import { useI18n } from './LanguageProvider';
import { computePay, formatMoney, usePayRules, weeksOf } from '@/lib/pay';

interface SidebarProps {
  user?: {
    email: string;
    name?: string;
  };
  blocks: Block[];
  /** Shifts placed on days of the current week. */
  assignments?: ShiftAssignment[];
  /** Events falling in the current calendar month, one entry per occurrence. */
  monthBlocks?: Block[];
  /** Shifts placed on days of the current calendar month. */
  monthAssignments?: ShiftAssignment[];
  /** Desktop only: the sidebar carries the main navigation there. */
  nav?: { active: AppTab; onChange: (tab: AppTab) => void };
}

function formatHours(minutes: number) {
  return `${(minutes / 60).toFixed(1)}h`;
}

/** One period's hours: the total, then a line per category and one for shifts. */
function Summary({
  label,
  blocks,
  assignments,
  emptyText,
}: {
  label: string;
  blocks: Block[];
  assignments: ShiftAssignment[];
  /** Shown instead of the figures when the period has nothing in it. */
  emptyText?: string;
}) {
  const { t, locale } = useI18n();
  const [rules] = usePayRules();
  const categoryMinutes = blocks.reduce((acc, block) => {
    const category = block.category as BlockCategory;
    acc[category] = (acc[category] || 0) + block.duration_minutes;
    return acc;
  }, {} as Record<BlockCategory, number>);

  const shiftMinutes = assignments.reduce((sum, a) => sum + shiftDurationMinutes(a.shift), 0);
  const totalMinutes = Object.values(categoryMinutes).reduce((a, b) => a + b, 0) + shiftMinutes;
  const pay = computePay(
    weeksOf(assignments.map((a) => ({ shift_date: a.shift_date, minutes: shiftDurationMinutes(a.shift) }))),
    rules,
  );

  return (
    <section>
      <h2 className="flex items-center gap-2 text-sm text-text-secondary mb-4">
        <Clock className="w-4 h-4" />
        <span>{label}</span>
      </h2>

      {totalMinutes === 0 && emptyText ? (
        <p className="text-sm text-text-secondary">{emptyText}</p>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-text-secondary">{t.summary.total}</span>
            <span className="text-text-primary font-medium">{formatHours(totalMinutes)}</span>
          </div>

          {CATEGORIES.map((cat) => {
            const minutes = categoryMinutes[cat] || 0;
            if (minutes === 0) return null;
            return (
              <div key={cat} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: CATEGORY_COLORS[cat] }} />
                  <span className="text-text-secondary">{t.categories[cat]}</span>
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
                <span className="text-text-secondary">{t.common.shifts}</span>
              </div>
              <span className="text-text-primary">{formatHours(shiftMinutes)}</span>
            </div>
          )}

          {rules.hourlyRate !== null && shiftMinutes > 0 && (
            <div className="pt-3 mt-3 border-t border-border space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">{t.pay.earnings}</span>
                <span className="text-accent-text font-medium">{formatMoney(pay.amount ?? 0, rules.currency, locale)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-secondary">{t.pay.overtime}</span>
                <span className="text-text-primary">{formatHours(pay.overtimeMinutes)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

export function Sidebar({ user, blocks, assignments = [], monthBlocks = [], monthAssignments = [], nav }: SidebarProps) {
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

      <div className="p-6 flex-1 min-h-0 overflow-y-auto space-y-6">
        <Summary label={t.summary.thisWeek} blocks={blocks} assignments={assignments} emptyText={t.summary.empty} />
        <div className="border-t border-border" />
        <Summary label={t.summary.thisMonth} blocks={monthBlocks} assignments={monthAssignments} />
      </div>
    </div>
  );
}
