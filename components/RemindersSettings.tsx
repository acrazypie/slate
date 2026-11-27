'use client';

// Settings > Reminders: the default lead time, what to remind about, and the
// browser's notification permission.

import { useState } from 'react';
import { useI18n } from './LanguageProvider';
import { getLeadMinutes, setLeadMinutes, getNotifySettings, setNotifySettings, REMINDER_OPTIONS, reminderLabel, reminderText, type NotifySettings } from '@/lib/reminders';

type Permission = 'granted' | 'denied' | 'default' | 'unsupported';

function currentPermission(): Permission {
  if (typeof window === 'undefined' || !('Notification' in window)) return 'unsupported';
  return Notification.permission;
}

export function RemindersSettings() {
  const { t } = useI18n();
  const [lead, setLead] = useState(() => getLeadMinutes());
  const [notify, setNotify] = useState<NotifySettings>(() => getNotifySettings());
  const [permission, setPermission] = useState<Permission>(() => currentPermission());
  const text = reminderText(t);

  const changeNotify = (next: NotifySettings) => {
    setNotify(next);
    setNotifySettings(next);
  };

  const allow = async () => {
    if (permission === 'unsupported') return;
    const result = await Notification.requestPermission();
    setPermission(result === 'granted' ? 'granted' : result === 'denied' ? 'denied' : 'default');
  };

  const status =
    permission === 'granted' ? t.reminders.allowed : permission === 'denied' ? t.reminders.denied : permission === 'unsupported' ? t.reminders.unsupported : t.reminders.notAsked;

  return (
    <div className="space-y-5">
      <label className="block">
        <span className="text-sm text-text-secondary">{t.reminders.leadLabel}</span>
        <select
          className="w-full rounded-lg bg-surface-hover px-3 py-2 mt-1 text-sm text-text-primary"
          value={lead}
          onChange={(e) => {
            const value = Number(e.target.value);
            setLead(value);
            setLeadMinutes(value);
          }}
        >
          {REMINDER_OPTIONS.map((m) => (
            <option key={m} value={m}>{reminderLabel(m, text, 0)}</option>
          ))}
        </select>
      </label>

      <ul className="space-y-2">
        <li>
          <label className="flex items-center justify-between gap-3 text-sm text-text-primary">
            {t.reminders.events}
            <input type="checkbox" checked={notify.events} onChange={(e) => changeNotify({ ...notify, events: e.target.checked })} />
          </label>
        </li>
        <li>
          <label className="flex items-center justify-between gap-3 text-sm text-text-primary">
            {t.reminders.shifts}
            <input type="checkbox" checked={notify.shifts} onChange={(e) => changeNotify({ ...notify, shifts: e.target.checked })} />
          </label>
        </li>
      </ul>

      <div className="flex flex-col gap-2">
        <p className="text-sm text-text-secondary">{status}</p>
        {permission !== 'granted' && permission !== 'unsupported' && permission !== 'denied' && (
          <button type="button" onClick={allow} className="h-11 rounded-xl bg-accent text-accent-contrast font-medium">
            {t.reminders.allow}
          </button>
        )}
      </div>
    </div>
  );
}
