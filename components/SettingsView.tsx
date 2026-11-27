'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, ChevronDown, ChevronUp, CalendarCheck, Loader2, LogOut, Check, Smartphone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ViewMode } from '@/hooks/useWeek';
import { ACCENT_OPTIONS, getStoredAccent, setAccent } from '@/lib/accent';
import { applyOled, getOled, setOled } from '@/lib/appearance';
import { SummaryRangeSettings } from './SummaryRangeSettings';
import { BackupSection } from './BackupSection';
import { RemindersSettings } from './RemindersSettings';
import { usePayRules, type PayRules } from '@/lib/pay';
import { LOCALES, LOCALE_NAMES } from '@/lib/i18n/config';
import { useI18n } from './LanguageProvider';

interface SettingsViewProps {
  user?: { email: string; name?: string };
}

const selected = 'bg-accent text-accent-contrast font-medium';
const unselected = 'bg-surface-hover text-text-primary hover:bg-border';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface rounded-3xl p-4 sm:p-5">
      <h2 className="text-sm text-text-secondary mb-3">{title}</h2>
      {children}
    </section>
  );
}

/** Hourly rate, currency and overtime rules. Kept on this device; see lib/pay.ts. */
function PaySection() {
  const { t } = useI18n();
  const [rules, save] = usePayRules();
  const set = (patch: Partial<PayRules>) => save({ ...rules, ...patch });
  const field = 'w-full rounded-lg bg-surface-hover px-3 py-2 text-sm text-text-primary';
  return (
    <Section title={t.pay.title}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-text-secondary">
          {t.pay.rate}
          <input
            type="number"
            min={0}
            step={0.5}
            inputMode="decimal"
            className={`${field} mt-1`}
            value={rules.hourlyRate ?? ''}
            onChange={(e) => set({ hourlyRate: e.target.value === '' ? null : Math.max(0, Number(e.target.value)) })}
          />
        </label>
        <label className="text-sm text-text-secondary">
          {t.pay.currency}
          <input type="text" maxLength={4} className={`${field} mt-1`} value={rules.currency} onChange={(e) => set({ currency: e.target.value })} />
        </label>
        <label className="text-sm text-text-secondary">
          {t.pay.overtimeAfter}
          <select
            className={`${field} mt-1`}
            value={rules.overtimeAfterHours ?? ''}
            onChange={(e) => set({ overtimeAfterHours: e.target.value === '' ? null : Number(e.target.value) })}
          >
            <option value="">{t.pay.overtimeOff}</option>
            {[35, 38, 40, 42, 48].map((h) => (
              <option key={h} value={h}>{h}</option>
            ))}
          </select>
        </label>
        <label className="text-sm text-text-secondary">
          {t.pay.multiplier}
          <select className={`${field} mt-1`} value={rules.overtimeMultiplier} onChange={(e) => set({ overtimeMultiplier: Number(e.target.value) })}>
            {[1.25, 1.5, 2, 2.5].map((m) => (
              <option key={m} value={m}>×{m}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-xs text-text-tertiary mt-3">{t.pay.hint}</p>
    </Section>
  );
}

export function SettingsView({ user }: SettingsViewProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { locale, t, setLocale } = useI18n();
  const [defaultView, setDefaultView] = useState<ViewMode>(
    () => (localStorage.getItem('slate-default-view') as ViewMode) ?? 'day'
  );
  const [accent, setAccentState] = useState<string>(() => getStoredAccent());
  const [oled, setOledState] = useState<boolean>(() => getOled());
  const [openGuide, setOpenGuide] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);

  const handleViewChange = (view: ViewMode) => {
    setDefaultView(view);
    localStorage.setItem('slate-default-view', view);
  };

  const handleAccentChange = (value: string) => {
    setAccentState(value);
    setAccent(value);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await createClient().auth.signOut();
    router.push('/auth/login');
  };

  const installGuides = [
    { id: 'ios', title: t.settings.iosTitle, steps: t.settings.iosSteps },
    { id: 'android', title: t.settings.androidTitle, steps: t.settings.androidSteps },
  ];

  const isPreset = ACCENT_OPTIONS.some((o) => o.value.toLowerCase() === accent.toLowerCase());

  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <h1 className="font-semibold tracking-tight text-2xl sm:text-3xl text-text-primary mb-2">{t.settings.title}</h1>

        <Section title={t.settings.account}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <span className="text-accent-contrast font-medium">{user?.email?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary font-medium truncate">{user?.name || t.common.user}</p>
              <p className="text-xs text-text-secondary truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 px-3 min-h-11 rounded-xl text-sm text-danger hover:bg-danger/10 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              {t.settings.logout}
            </button>
          </div>
        </Section>

        <Section title={t.common.language}>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {LOCALES.map((code) => (
              <button
                key={code}
                lang={code}
                onClick={() => setLocale(code)}
                aria-pressed={locale === code}
                className={`px-3 py-3 rounded-xl text-sm transition-colors ${locale === code ? selected : unselected}`}
              >
                {LOCALE_NAMES[code]}
              </button>
            ))}
          </div>
          <p className="text-xs text-text-tertiary mt-3">{t.settings.languageHint}</p>
        </Section>


        <PaySection />


        <Section title={t.settings.appearance}>
          <div className="grid grid-cols-3 gap-2">
            {([
              ['light', t.settings.themeLight, Sun],
              ['dark', t.settings.themeDark, Moon],
              ['system', t.settings.themeSystem, Monitor],
            ] as const).map(([value, label, Icon]) => (
              <button
                key={value}
                onClick={() => setTheme(value)}
                className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-sm transition-colors ${
                  theme === value ? selected : unselected
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
          </div>
          {theme === 'dark' && (
            <label className="flex items-center justify-between gap-4 mt-4 cursor-pointer">
              <span>
                <span className="block text-sm text-text-primary">{t.settings.oled}</span>
                <span className="block text-xs text-text-tertiary mt-0.5">{t.settings.oledHint}</span>
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={oled}
                aria-label={t.settings.oled}
                onClick={() => {
                  const next = !oled;
                  setOledState(next);
                  setOled(next);
                  applyOled(next);
                }}
                className={`relative w-12 h-7 rounded-full transition-colors flex-shrink-0 ${oled ? 'bg-accent' : 'bg-surface-hover'}`}
              >
                <span className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-text-primary transition-transform ${oled ? 'translate-x-5' : ''}`} />
              </button>
            </label>
          )}
          <div className="mt-5">
            <h3 className="text-sm text-text-secondary mb-3">{t.settings.accent}</h3>
                      <div className="grid grid-cols-5 justify-items-center gap-y-1">
                {ACCENT_OPTIONS.map((option) => {
                  const isSelected = option.value.toLowerCase() === accent.toLowerCase();
                  return (
                    <button
                      key={option.value}
                      onClick={() => handleAccentChange(option.value)}
                      aria-label={t.colors[option.name]}
                      aria-pressed={isSelected}
                      title={t.colors[option.name]}
                      className="flex items-center justify-center w-11 h-11 rounded-full"
                    >
                      <span
                        className={`flex items-center justify-center w-8 h-8 rounded-full transition-transform ${
                          isSelected ? 'scale-110 ring-2 ring-text-primary ring-offset-2 ring-offset-surface' : ''
                        }`}
                        style={{ backgroundColor: option.value }}
                      >
                        {isSelected && <Check className="w-4 h-4 text-accent-contrast" />}
                      </span>
                    </button>
                  );
                })}
                <label
                  className="relative flex items-center justify-center w-11 h-11 rounded-full cursor-pointer focus-within:outline-2 focus-within:outline-accent-text"
                  title={t.settings.customColor}
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full border border-dashed border-border-strong ${
                      !isPreset ? 'ring-2 ring-text-primary ring-offset-2 ring-offset-surface' : ''
                    }`}
                    style={!isPreset ? { backgroundColor: accent } : undefined}
                  >
                    {isPreset && <span className="text-text-secondary text-lg leading-none">+</span>}
                  </span>
                  <input
                    type="color"
                    value={accent}
                    onChange={(e) => handleAccentChange(e.target.value)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    aria-label={t.settings.customColor}
                  />
                </label>
              </div>
              <p className="text-xs text-text-tertiary mt-3">
                {t.settings.accentHint}
              </p>

          </div>
        </Section>

        <Section title={t.settingsSummary.title}>
          <p className="text-xs text-text-tertiary mb-4">{t.settingsSummary.lede}</p>
          <SummaryRangeSettings />
        </Section>

        <Section title={t.settings.defaultView}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {(['day', 'week', 'month', 'agenda'] as const).map((value) => (
              <button
                key={value}
                onClick={() => handleViewChange(value)}
                className={`px-3 py-3 rounded-xl text-sm transition-colors ${
                  defaultView === value ? selected : unselected
                }`}
              >
                {t.views[value]}
              </button>
            ))}
          </div>
        </Section>


        <Section title={t.reminders.title}>
          <p className="text-xs text-text-tertiary mb-4">{t.reminders.lede}</p>
          <RemindersSettings />
        </Section>

        <Section title={t.backup.title}>
          <BackupSection />
        </Section>

        <Section title={t.settings.installTitle}>
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            {t.settings.installIntro}
          </p>
          <div className="space-y-2">
            {installGuides.map((guide) => {
              const isOpen = openGuide === guide.id;
              return (
                <div key={guide.id} className="border border-border rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setOpenGuide(isOpen ? null : guide.id)}
                    aria-expanded={isOpen}
                    className="w-full flex items-center justify-between px-4 py-3 bg-surface-hover hover:bg-border transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Smartphone className="w-4 h-4 text-text-secondary" aria-hidden="true" />
                      <span className="text-sm font-medium text-text-primary">{guide.title}</span>
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-text-secondary" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-text-secondary" />
                    )}
                  </button>
                  {isOpen && (
                    <ol className="p-4 space-y-3 border-t border-border">
                      {guide.steps.map((step, i) => (
                        <li key={i} className="flex gap-3">
                          <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-contrast flex items-center justify-center text-xs font-bold">
                            {i + 1}
                          </span>
                          <span className="text-sm text-text-secondary pt-0.5">{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        <div className="flex gap-4 px-1 pt-2 text-xs text-text-tertiary">
          <Link href="/privacy" className="hover:text-text-secondary transition-colors">
            {t.common.privacy}
          </Link>
          <Link href="/terms" className="hover:text-text-secondary transition-colors">
            {t.common.terms}
          </Link>
        </div>
      </div>
    </div>
  );
}
