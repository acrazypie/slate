'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { X, Sun, Moon, Monitor, Smartphone, ChevronDown, ChevronUp, CalendarCheck, Loader2 } from 'lucide-react';
import { ViewMode } from '@/hooks/useWeek';
import { useGoogleCalendarConnection } from '@/hooks/useGoogleCalendarConnection';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'general' | 'homescreen';

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { theme, setTheme } = useTheme();
  const [defaultView, setDefaultView] = useState<ViewMode>(
    () => (localStorage.getItem('slate-default-view') as ViewMode) ?? 'week'
  );
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [iosExpanded, setIosExpanded] = useState(false);
  const [androidExpanded, setAndroidExpanded] = useState(false);
  const { connected, connect, disconnect } = useGoogleCalendarConnection();
  const [calendarActionLoading, setCalendarActionLoading] = useState(false);

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

  const handleViewChange = (view: ViewMode) => {
    setDefaultView(view);
    localStorage.setItem('slate-default-view', view);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-surface rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md mx-0 sm:mx-4 p-6 max-h-[90vh] sm:max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-medium text-text-primary">
            Impostazioni
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-hover rounded">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        {/* Tab bar */}
        <div className="flex gap-1 mb-5 bg-surface-hover rounded-2xl p-1">
          <button
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'general'
                ? 'bg-accent text-accent-contrast'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            Generale
          </button>
          <button
            onClick={() => setActiveTab('homescreen')}
            className={`flex-1 py-2 px-3 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'homescreen'
                ? 'bg-accent text-accent-contrast'
                : 'text-text-secondary hover:text-text-primary'
            }`}
          >
            <Smartphone className="w-4 h-4 inline-block mr-1 -mt-0.5" />
            App
          </button>
        </div>

        {activeTab === 'general' && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm text-text-secondary mb-3">Tema</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-sm transition-colors ${
                    theme === 'light'
                      ? 'bg-accent text-accent-contrast font-medium'
                      : 'bg-surface-hover text-text-primary hover:bg-border'
                  }`}
                >
                  <Sun className="w-4 h-4" />
                  Chiaro
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-sm transition-colors ${
                    theme === 'dark'
                      ? 'bg-accent text-accent-contrast font-medium'
                      : 'bg-surface-hover text-text-primary hover:bg-border'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Scuro
                </button>
                <button
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center gap-1 px-3 py-3 rounded-xl text-sm transition-colors ${
                    theme === 'system'
                      ? 'bg-accent text-accent-contrast font-medium'
                      : 'bg-surface-hover text-text-primary hover:bg-border'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  Sistema
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-3">Vista predefinita</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleViewChange('day')}
                  className={`px-3 py-3 rounded-xl text-sm transition-colors ${
                    defaultView === 'day'
                      ? 'bg-accent text-accent-contrast font-medium'
                      : 'bg-surface-hover text-text-primary hover:bg-border'
                  }`}
                >
                  Giorno
                </button>
                <button
                  onClick={() => handleViewChange('week')}
                  className={`px-3 py-3 rounded-xl text-sm transition-colors ${
                    defaultView === 'week'
                      ? 'bg-accent text-accent-contrast font-medium'
                      : 'bg-surface-hover text-text-primary hover:bg-border'
                  }`}
                >
                  Settimana
                </button>
                <button
                  onClick={() => handleViewChange('month')}
                  className={`px-3 py-3 rounded-xl text-sm transition-colors ${
                    defaultView === 'month'
                      ? 'bg-accent text-accent-contrast font-medium'
                      : 'bg-surface-hover text-text-primary hover:bg-border'
                  }`}
                >
                  Mese
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm text-text-secondary mb-3">Google Calendar</label>
              {connected === null ? (
                <div className="flex items-center gap-2 px-3 py-3 rounded-xl bg-surface-hover text-sm text-text-secondary">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifica collegamento...
                </div>
              ) : connected ? (
                <div className="flex items-center justify-between gap-2 px-3 py-3 rounded-xl bg-surface-hover">
                  <div className="flex items-center gap-2 text-sm text-text-primary">
                    <CalendarCheck className="w-4 h-4 text-accent" />
                    Collegato
                  </div>
                  <button
                    onClick={handleDisconnectCalendar}
                    disabled={calendarActionLoading}
                    className="text-sm text-text-secondary hover:text-text-primary transition-colors disabled:opacity-50"
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
                  {calendarActionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CalendarCheck className="w-4 h-4" />
                  )}
                  Connetti Google Calendar
                </button>
              )}
              <p className="text-xs text-text-tertiary mt-2">
                I blocchi che crei verranno copiati nel tuo Google Calendar (sincronizzazione a senso unico).
              </p>
            </div>
          </div>
        )}

        {activeTab === 'homescreen' && (
          <div className="space-y-4">
            <div className="text-sm text-text-secondary leading-relaxed">
              Aggiungi Slate alla schermata home per usarla come app a schermo intero.
            </div>

            {/* iOS section */}
            <div className="border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setIosExpanded(!iosExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-surface-hover hover:bg-border transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🍎</span>
                  <span className="text-sm font-medium text-text-primary">iPhone / iPad (Safari)</span>
                </div>
                {iosExpanded ? (
                  <ChevronUp className="w-4 h-4 text-text-secondary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-secondary" />
                )}
              </button>
              {iosExpanded && (
                <div className="p-4 space-y-3 border-t border-border">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-contrast flex items-center justify-center text-xs font-bold">1</span>
                    <p className="text-sm text-text-secondary pt-0.5">Apri <strong className="text-text-primary">Safari</strong> e vai alla pagina di Slate</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-contrast flex items-center justify-center text-xs font-bold">2</span>
                    <p className="text-sm text-text-secondary pt-0.5">Tocca il pulsante <strong className="text-text-primary">Condividi</strong> <span className="inline-block text-text-primary">⎋</span> in basso al centro della pagina</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-contrast flex items-center justify-center text-xs font-bold">3</span>
                    <p className="text-sm text-text-secondary pt-0.5">Scorri verso il basso e tocca <strong className="text-text-primary">Aggiungi alla schermata home</strong></p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-contrast flex items-center justify-center text-xs font-bold">4</span>
                    <p className="text-sm text-text-secondary pt-0.5">Conferma toccando <strong className="text-text-primary">Aggiungi</strong> in alto a destra</p>
                  </div>
                  <div className="mt-3 p-3 bg-surface-hover rounded-xl text-xs text-text-secondary">
                    L&apos;app si aprirà a schermo intero senza la barra di Safari, come un&apos;app nativa.
                  </div>
                </div>
              )}
            </div>

            {/* Android section */}
            <div className="border border-border rounded-2xl overflow-hidden">
              <button
                onClick={() => setAndroidExpanded(!androidExpanded)}
                className="w-full flex items-center justify-between px-4 py-3 bg-surface-hover hover:bg-border transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🤖</span>
                  <span className="text-sm font-medium text-text-primary">Android (Chrome)</span>
                </div>
                {androidExpanded ? (
                  <ChevronUp className="w-4 h-4 text-text-secondary" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-text-secondary" />
                )}
              </button>
              {androidExpanded && (
                <div className="p-4 space-y-3 border-t border-border">
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-contrast flex items-center justify-center text-xs font-bold">1</span>
                    <p className="text-sm text-text-secondary pt-0.5">Apri <strong className="text-text-primary">Chrome</strong> e vai alla pagina di Slate</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-contrast flex items-center justify-center text-xs font-bold">2</span>
                    <p className="text-sm text-text-secondary pt-0.5">Tocca il menu <strong className="text-text-primary">⋮</strong> in alto a destra</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-contrast flex items-center justify-center text-xs font-bold">3</span>
                    <p className="text-sm text-text-secondary pt-0.5">Tocca <strong className="text-text-primary">Aggiungi a schermata Home</strong> (o &ldquo;Installa app&rdquo;)</p>
                  </div>
                  <div className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-contrast flex items-center justify-center text-xs font-bold">4</span>
                    <p className="text-sm text-text-secondary pt-0.5">Conferma toccando <strong className="text-text-primary">Aggiungi</strong></p>
                  </div>
                  <div className="mt-3 p-3 bg-surface-hover rounded-xl text-xs text-text-secondary">
                    L&apos;app apparirà come un&apos;icona sulla tua home screen e si aprirà a schermo intero.
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <div className="mt-6 pt-4 border-t border-border flex gap-4 text-xs text-text-tertiary">
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