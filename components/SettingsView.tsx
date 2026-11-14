'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Sun, Moon, Monitor, ChevronDown, ChevronUp, CalendarCheck, Loader2, LogOut, Check, Smartphone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { ViewMode } from '@/hooks/useWeek';
import { useGoogleCalendarConnection } from '@/hooks/useGoogleCalendarConnection';
import { ACCENT_OPTIONS, getStoredAccent, setAccent } from '@/lib/accent';

interface SettingsViewProps {
  user?: { email: string; name?: string };
}

const INSTALL_GUIDES = [
  {
    id: 'ios',
    title: 'iPhone / iPad (Safari)',
    steps: [
      'Apri Safari e vai alla pagina di Slate',
      'Tocca il pulsante Condividi in basso al centro della pagina',
      'Scorri verso il basso e tocca "Aggiungi alla schermata Home"',
      'Conferma toccando "Aggiungi" in alto a destra',
    ],
  },
  {
    id: 'android',
    title: 'Android (Chrome)',
    steps: [
      'Apri Chrome e vai alla pagina di Slate',
      'Tocca il menu ⋮ in alto a destra',
      'Tocca "Aggiungi a schermata Home" (o "Installa app")',
      'Conferma toccando "Aggiungi"',
    ],
  },
];

const selected = 'bg-accent text-accent-contrast font-medium';
const unselected = 'bg-surface-hover text-text-primary hover:bg-border';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="bg-surface rounded-2xl p-4 sm:p-5">
      <h2 className="text-sm text-text-secondary mb-3">{title}</h2>
      {children}
    </section>
  );
}

export function SettingsView({ user }: SettingsViewProps) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [defaultView, setDefaultView] = useState<ViewMode>(
    () => (localStorage.getItem('slate-default-view') as ViewMode) ?? 'week'
  );
  const [accent, setAccentState] = useState<string>(() => getStoredAccent());
  const [openGuide, setOpenGuide] = useState<string | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const { connected, connect, disconnect } = useGoogleCalendarConnection();
  const [calendarActionLoading, setCalendarActionLoading] = useState(false);

  const handleViewChange = (view: ViewMode) => {
    setDefaultView(view);
    localStorage.setItem('slate-default-view', view);
  };

  const handleAccentChange = (value: string) => {
    setAccentState(value);
    setAccent(value);
  };

  const handleConnectCalendar = async () => {
    setCalendarActionLoading(true);
    await connect();
    // connect() redirects the browser away, so loading state just covers the gap.
  };

  const handleDisconnectCalendar = async () => {
    setCalendarActionLoading(true);
    await disconnect();
    setCalendarActionLoading(false);
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    await createClient().auth.signOut();
    router.push('/auth/login');
  };

  const isPreset = ACCENT_OPTIONS.some((o) => o.value.toLowerCase() === accent.toLowerCase());

  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6 space-y-4">
        <h1 className="font-serif text-2xl sm:text-3xl text-text-primary mb-2">Impostazioni</h1>

        <Section title="Account">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
              <span className="text-accent-contrast font-medium">{user?.email?.[0]?.toUpperCase() || 'U'}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary font-medium truncate">{user?.name || 'Utente'}</p>
              <p className="text-xs text-text-secondary truncate">{user?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 px-3 min-h-11 rounded-xl text-sm text-danger hover:bg-danger/10 transition-colors disabled:opacity-50 flex-shrink-0"
            >
              {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              Esci
            </button>
          </div>
        </Section>

        <Section title="Tema">
          <div className="grid grid-cols-3 gap-2">
            {([
              ['light', 'Chiaro', Sun],
              ['dark', 'Scuro', Moon],
              ['system', 'Sistema', Monitor],
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
        </Section>

        <Section title="Colore principale">
          <div className="flex flex-wrap items-center -mx-1.5">
            {ACCENT_OPTIONS.map((option) => {
              const isSelected = option.value.toLowerCase() === accent.toLowerCase();
              return (
                <button
                  key={option.value}
                  onClick={() => handleAccentChange(option.value)}
                  aria-label={option.label}
                  aria-pressed={isSelected}
                  title={option.label}
                  className="flex items-center justify-center w-11 h-11 rounded-full"
                >
                  <span
                    className={`flex items-center justify-center w-8 h-8 rounded-full transition-transform ${
                      isSelected ? 'scale-110 ring-2 ring-text-primary ring-offset-2 ring-offset-surface' : ''
                    }`}
                    style={{ backgroundColor: option.value }}
                  >
                    {isSelected && <Check className="w-4 h-4 text-black/70" />}
                  </span>
                </button>
              );
            })}
            <label
              className="relative flex items-center justify-center w-11 h-11 rounded-full cursor-pointer focus-within:outline-2 focus-within:outline-accent-text"
              title="Colore personalizzato"
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
                aria-label="Colore personalizzato"
              />
            </label>
          </div>
          <p className="text-xs text-text-tertiary mt-3">
            Vale per pulsanti, selezioni e il giorno di oggi in tutta l&apos;app, su questo dispositivo.
          </p>
        </Section>

        <Section title="Vista predefinita">
          <div className="grid grid-cols-3 gap-2">
            {([
              ['day', 'Giorno'],
              ['week', 'Settimana'],
              ['month', 'Mese'],
            ] as const).map(([value, label]) => (
              <button
                key={value}
                onClick={() => handleViewChange(value)}
                className={`px-3 py-3 rounded-xl text-sm transition-colors ${
                  defaultView === value ? selected : unselected
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </Section>

        <Section title="Google Calendar">
          {connected === null ? (
            <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-surface-hover text-sm text-text-secondary">
              <Loader2 className="w-4 h-4 animate-spin" />
              Verifica collegamento...
            </div>
          ) : connected ? (
            <div className="flex items-center justify-between gap-2 px-3 py-3 rounded-xl bg-surface-hover">
              <div className="flex items-center gap-2 text-sm text-text-primary">
                <CalendarCheck className="w-4 h-4 text-accent-text" />
                Collegato
              </div>
              <button
                onClick={handleDisconnectCalendar}
                disabled={calendarActionLoading}
                className="px-3 min-h-11 -my-2 -mr-2 rounded-xl text-sm text-text-secondary hover:text-text-primary hover:bg-border transition-colors disabled:opacity-50"
              >
                Disconnetti
              </button>
            </div>
          ) : (
            <button
              onClick={handleConnectCalendar}
              disabled={calendarActionLoading}
              className="w-full flex items-center justify-center gap-2 px-3 py-3 rounded-xl bg-surface-hover text-text-primary hover:bg-border transition-colors text-sm disabled:opacity-50"
            >
              {calendarActionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarCheck className="w-4 h-4" />}
              Connetti Google Calendar
            </button>
          )}
          <p className="text-xs text-text-tertiary mt-2">
            Gli eventi che crei vengono copiati nel tuo Google Calendar (sincronizzazione a senso unico). I turni
            non vengono ancora sincronizzati.
          </p>
        </Section>

        <Section title="Installa come app">
          <p className="text-sm text-text-secondary leading-relaxed mb-3">
            Aggiungi Slate alla schermata Home per usarla a schermo intero.
          </p>
          <div className="space-y-2">
            {INSTALL_GUIDES.map((guide) => {
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
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-text-secondary transition-colors">
            Termini di Servizio
          </Link>
        </div>
      </div>
    </div>
  );
}
