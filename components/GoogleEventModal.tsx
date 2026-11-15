'use client';

import { useState } from 'react';
import { CalendarDays, ExternalLink, MapPin } from 'lucide-react';
import { GoogleEvent, GoogleEventChanges, GoogleEventScope, formatTime } from '@/lib/types';
import { formatDate } from '@/lib/i18n/format';
import { useI18n } from './LanguageProvider';
import { Dialog, DialogClose } from './Dialog';

interface GoogleEventModalProps {
  event: GoogleEvent;
  onClose: () => void;
  /** Resolve false if Google refused the change: the dialog stays open and says so. */
  onSave: (changes: GoogleEventChanges, scope: GoogleEventScope) => Promise<boolean>;
  onDelete: (scope: GoogleEventScope) => Promise<boolean>;
}

const dateFromKey = (key: string) => new Date(`${key}T00:00:00`);

function shiftKey(key: string, days: number): string {
  const date = dateFromKey(key);
  date.setDate(date.getDate() + days);
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

const daysBetween = (from: string, to: string) =>
  Math.round((dateFromKey(to).getTime() - dateFromKey(from).getTime()) / 86_400_000);

/**
 * Views and edits an event that lives in Google Calendar. Saving writes
 * straight to Google. Events the user cannot change there (invitations,
 * read-only calendars, birthdays) open as details only.
 */
export function GoogleEventModal({ event, onClose, onSave, onDelete }: GoogleEventModalProps) {
  const { locale, t } = useI18n();
  const [title, setTitle] = useState(event.title);
  const [notes, setNotes] = useState(event.notes);
  const [allDay, setAllDay] = useState(event.allDay);
  const [startDate, setStartDate] = useState(event.startDate);
  const [endDate, setEndDate] = useState(event.endDate);
  // An all-day event has no times: these are what it gets if "all day" is switched off.
  const [startTime, setStartTime] = useState(event.allDay ? '09:00' : formatTime(event.start_hour, event.start_minute));
  const [endTime, setEndTime] = useState(event.allDay ? '10:00' : formatTime(event.end_hour, event.end_minute));
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  // Which follow-up question is showing under the form, if any.
  const [asking, setAsking] = useState<'save-scope' | 'delete-scope' | 'delete-confirm' | null>(null);

  const isRecurring = !!event.recurringEventId;
  const heading = event.canEdit ? t.googleEvent.editTitle : t.googleEvent.viewTitle;

  const fieldClass =
    'w-full px-4 py-3 bg-surface-hover text-text-primary rounded-xl border border-border focus:border-accent focus:outline-none';
  const labelClass = 'block text-sm text-text-secondary mb-2';

  const header = (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-xl font-medium text-text-primary">{heading}</h2>
      <DialogClose onClose={onClose} />
    </div>
  );

  const calendarLine = (
    <p className="flex items-center gap-2 text-sm text-text-secondary">
      <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: event.color }} />
      <span className="truncate">{event.calendarName}</span>
    </p>
  );

  const openInGoogle = event.htmlLink && (
    <a
      href={event.htmlLink}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 min-h-11 text-sm text-accent-text hover:underline"
    >
      {t.googleEvent.openInGoogle}
      <ExternalLink className="w-3.5 h-3.5" />
    </a>
  );

  if (!event.canEdit) {
    const day = (key: string) => formatDate(locale, dateFromKey(key), 'fullDay');
    const sameDay = event.startDate === event.endDate;
    const when = event.allDay
      ? sameDay
        ? `${day(event.startDate)}, ${t.calendar.allDay}`
        : `${day(event.startDate)} – ${day(event.endDate)}`
      : sameDay
        ? `${day(event.startDate)}, ${formatTime(event.start_hour, event.start_minute)} – ${formatTime(event.end_hour, event.end_minute)}`
        : `${day(event.startDate)} ${formatTime(event.start_hour, event.start_minute)} – ${day(event.endDate)} ${formatTime(event.end_hour, event.end_minute)}`;

    return (
      <Dialog label={heading} onClose={onClose}>
        {header}
        <div className="space-y-3">
          <p className="text-lg font-medium text-text-primary break-words">{event.title || t.googleEvent.untitled}</p>
          <p className="flex items-start gap-2 text-sm text-text-primary">
            <CalendarDays className="w-4 h-4 mt-0.5 flex-shrink-0 text-text-secondary" />
            <span>{when}</span>
          </p>
          {event.location && (
            <p className="flex items-start gap-2 text-sm text-text-primary">
              <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-text-secondary" />
              <span className="break-words min-w-0">{event.location}</span>
            </p>
          )}
          {calendarLine}
          {event.notes && (
            <p className="text-sm text-text-secondary whitespace-pre-wrap break-words">{event.notes}</p>
          )}
          <p className="text-xs text-text-tertiary">{t.googleEvent.readOnly}</p>
          {openInGoogle}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="w-full mt-4 px-4 py-3 bg-surface-hover text-text-primary rounded-xl transition-colors hover:bg-border"
        >
          {t.common.close}
        </button>
      </Dialog>
    );
  }

  const endsAfterStart = allDay
    ? endDate >= startDate
    : endDate > startDate || (endDate === startDate && endTime > startTime);
  const valid = !!startDate && !!endDate && (allDay || (!!startTime && !!endTime)) && endsAfterStart;

  // A whole series can take a new title, notes or time of day, but not a new
  // date: once the day moves (or "all day" flips), only this occurrence changes.
  const movedDay = startDate !== event.startDate || endDate !== event.endDate || allDay !== event.allDay;

  const buildChanges = (): GoogleEventChanges => {
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);
    return {
      title: title.trim(),
      notes,
      allDay,
      startDate,
      endDate,
      start_hour: allDay ? 0 : startHour,
      start_minute: allDay ? 0 : startMinute,
      end_hour: allDay ? 0 : endHour,
      end_minute: allDay ? 0 : endMinute,
    };
  };

  const run = async (action: () => Promise<boolean>) => {
    setLoading(true);
    setFailed(false);
    const ok = await action();
    setLoading(false);
    // On success the parent closes the dialog.
    if (!ok) setFailed(true);
  };

  const save = (scope: GoogleEventScope) => run(() => onSave(buildChanges(), scope));
  const remove = (scope: GoogleEventScope) => run(() => onDelete(scope));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid || loading) return;
    if (isRecurring && !movedDay) setAsking('save-scope');
    else save('this');
  };

  // Moving the start keeps the event as long as it was.
  const handleStartDateChange = (value: string) => {
    if (value && startDate && endDate) setEndDate(shiftKey(value, Math.max(0, daysBetween(startDate, endDate))));
    setStartDate(value);
  };

  const scopeChoice = (prompt: string, act: (scope: GoogleEventScope) => void, danger: boolean) => (
    <div className="space-y-1 p-3 bg-surface-hover rounded-xl">
      <p className="px-3 pb-1 text-sm text-text-secondary">{prompt}</p>
      {([
        ['this', t.blockModal.deleteCurrent],
        ['all', t.blockModal.deleteAll],
      ] as const).map(([scope, text]) => (
        <button
          key={scope}
          type="button"
          disabled={loading}
          onClick={() => act(scope)}
          className={`w-full px-3 min-h-11 text-sm rounded-xl text-left disabled:opacity-50 ${
            danger ? 'text-danger hover:bg-danger/10' : 'text-text-primary hover:bg-border'
          }`}
        >
          {text}
        </button>
      ))}
    </div>
  );

  return (
    <Dialog label={heading} onClose={onClose}>
      {header}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="gevent-title" className={labelClass}>{t.blockModal.title}</label>
          <input
            id="gevent-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          {calendarLine}
          <label className="flex items-center gap-2 min-h-11 text-sm text-text-primary cursor-pointer flex-shrink-0">
            <input
              type="checkbox"
              checked={allDay}
              onChange={(e) => setAllDay(e.target.checked)}
              className="w-4 h-4 accent-[var(--color-accent)]"
            />
            {t.calendar.allDay}
          </label>
        </div>

        <div className={`grid gap-4 ${allDay ? 'grid-cols-2' : 'grid-cols-[3fr_2fr]'}`}>
          <div>
            <label htmlFor="gevent-start-date" className={labelClass}>{t.googleEvent.startDate}</label>
            <input
              id="gevent-start-date"
              type="date"
              required
              value={startDate}
              onChange={(e) => handleStartDateChange(e.target.value)}
              className={fieldClass}
            />
          </div>
          {!allDay && (
            <div>
              <label htmlFor="gevent-start-time" className={labelClass}>{t.common.startTime}</label>
              <input
                id="gevent-start-time"
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={fieldClass}
              />
            </div>
          )}
          <div>
            <label htmlFor="gevent-end-date" className={labelClass}>{t.googleEvent.endDate}</label>
            <input
              id="gevent-end-date"
              type="date"
              required
              min={startDate}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={fieldClass}
            />
          </div>
          {!allDay && (
            <div>
              <label htmlFor="gevent-end-time" className={labelClass}>{t.common.endTime}</label>
              <input
                id="gevent-end-time"
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={fieldClass}
              />
            </div>
          )}
        </div>

        {!endsAfterStart && <p role="alert" className="text-sm text-danger">{t.googleEvent.endBeforeStart}</p>}
        {isRecurring && movedDay && endsAfterStart && (
          <p className="text-xs text-text-tertiary">{t.googleEvent.dateOnlyThis}</p>
        )}

        {event.location && (
          <p className="flex items-start gap-2 text-sm text-text-secondary">
            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="break-words min-w-0">{event.location}</span>
          </p>
        )}

        <div>
          <label htmlFor="gevent-notes" className={labelClass}>{t.blockModal.notes}</label>
          <textarea
            id="gevent-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={`${fieldClass} resize-none`}
          />
        </div>

        {openInGoogle}

        {failed && <p role="alert" className="text-sm text-danger">{t.googleEvent.saveError}</p>}

        {asking === 'save-scope' && scopeChoice(t.googleEvent.applyTo, save, false)}
        {asking === 'delete-scope' && scopeChoice(t.blockModal.deleteWhat, remove, true)}

        {asking === 'delete-confirm' ? (
          <div className="pt-2">
            <p className="text-sm text-text-secondary mb-3">{t.googleEvent.confirmDelete}</p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setAsking(null)}
                className="flex-1 px-4 py-3 bg-surface-hover text-text-primary rounded-xl transition-colors hover:bg-border"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => remove('this')}
                className="flex-1 px-4 py-3 text-danger bg-danger/10 hover:bg-danger/20 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {loading ? t.common.deleting : t.blockModal.deleteEvent}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              aria-expanded={isRecurring ? asking === 'delete-scope' : undefined}
              onClick={() =>
                setAsking(isRecurring ? (asking === 'delete-scope' ? null : 'delete-scope') : 'delete-confirm')
              }
              className="px-4 py-3 text-danger hover:bg-danger/10 rounded-xl transition-colors"
            >
              {t.common.delete}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-surface-hover text-text-primary rounded-xl transition-colors hover:bg-border"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={loading || !valid}
              className="flex-1 px-4 py-3 bg-accent text-accent-contrast rounded-xl font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {loading ? t.common.saving : t.common.save}
            </button>
          </div>
        )}
      </form>
    </Dialog>
  );
}
