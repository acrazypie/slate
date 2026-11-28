'use client';

import { useState, useEffect } from 'react';
import { reminderLabel, reminderText, reminderToForm, formToReminder, getLeadMinutes, REMINDER_OPTIONS } from '@/lib/reminders';
import { Shift, ShiftFormData, COLOR_PALETTE, colorKey, SHIFT_DEFAULT_COLOR, formatTime } from '@/lib/types';
import { SHIFT_ICON_KEYS, SHIFT_ICONS, DEFAULT_SHIFT_ICON, normalizeShiftIcon, type ShiftIconKey } from '@/lib/shiftIcons';
import { fill } from '@/lib/i18n/format';
import { useI18n } from './LanguageProvider';
import { Dialog, DialogClose, ColorSwatch } from './Dialog';

interface ShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ShiftFormData) => Promise<void>;
  /** Deletes the shift itself, everywhere. Only offered when editing. */
  onDelete?: () => Promise<void>;
  /** Takes the shift off one day only. Offered when opened from a day on the calendar. */
  onRemoveFromDay?: () => Promise<void>;
  dayLabel?: string;
  shift?: Shift | null;
}

const inputClass =
  'w-full px-4 py-3 bg-surface-hover text-text-primary rounded-xl border border-border focus:border-accent focus:outline-none';

export function ShiftModal({ isOpen, onClose, onSave, onDelete, onRemoveFromDay, dayLabel, shift }: ShiftModalProps) {
  const { t } = useI18n();
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [color, setColor] = useState(SHIFT_DEFAULT_COLOR);
  const [icon, setIcon] = useState<ShiftIconKey>(DEFAULT_SHIFT_ICON);
  const [breakMinutes, setBreakMinutes] = useState('0');
  const [reminder, setReminder] = useState('default');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  // Deleting a shift takes it off every day, so it asks once more first.
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (shift) {
      setTitle(shift.title);
      setStart(formatTime(shift.start_hour, shift.start_minute));
      setEnd(formatTime(shift.end_hour, shift.end_minute));
      setColor(shift.color);
      setIcon(normalizeShiftIcon(shift.icon));
      setBreakMinutes(String(shift.break_minutes ?? 0));
      setReminder(reminderToForm(shift.reminder_minutes));
    } else {
      setBreakMinutes('0');
      setReminder('default');
      setTitle('');
      setStart('09:00');
      setEnd('17:00');
      setColor(SHIFT_DEFAULT_COLOR);
      setIcon(DEFAULT_SHIFT_ICON);
    }
    setFormError(null);
    setConfirmingDelete(false);
  }, [shift, isOpen]);

  if (!isOpen) return null;

  const overnight = !!start && !!end && end < start;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !start || !end) return;
    if (start === end) {
      setFormError(t.shiftModal.sameTimeError);
      return;
    }
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);

    setLoading(true);
    const breakValue = Math.min(240, Math.max(0, Math.round(Number(breakMinutes) || 0)));
    await onSave({ title: title.trim(), start_hour: sh, start_minute: sm, end_hour: eh, end_minute: em, break_minutes: breakValue, color, icon, reminder_minutes: formToReminder(reminder) });
    setLoading(false);
  };

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    await fn();
    setLoading(false);
  };

  const heading = shift ? t.shiftModal.editTitle : t.shiftModal.newTitle;
  const labelClass = 'block text-sm text-text-secondary mb-2';

  return (
    <Dialog label={heading} onClose={onClose} zClass="z-[60]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-text-primary">{heading}</h2>
        <DialogClose onClose={onClose} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="shift-title" className={labelClass}>{t.shiftModal.name}</label>
          <input
            id="shift-title"
            type="text"
            placeholder={t.shiftModal.namePlaceholder}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`${inputClass} placeholder-text-tertiary`}
            autoFocus={!shift}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="shift-start" className={labelClass}>{t.common.startTime}</label>
            <input id="shift-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="shift-end" className={labelClass}>{t.common.endTime}</label>
            <input id="shift-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
          </div>
        </div>
        {overnight && <p className="text-xs text-text-tertiary">{t.shiftModal.overnight}</p>}

        <div>
          <label htmlFor="shift-break" className={labelClass}>{t.shiftModal.break}</label>
          <input
            id="shift-break"
            type="number"
            min={0}
            max={240}
            step={5}
            value={breakMinutes}
            onChange={(e) => setBreakMinutes(e.target.value)}
            className={inputClass}
          />
          <p className="text-xs text-text-tertiary mt-1">{t.shiftModal.breakHint}</p>
        </div>

        <div>
          <label htmlFor="shift-reminder" className={labelClass}>{t.reminders.label}</label>
          <select id="shift-reminder" value={reminder} onChange={(e) => setReminder(e.target.value)} className={inputClass}>
            <option value="default">{reminderLabel(null, reminderText(t), getLeadMinutes())}</option>
            <option value="off">{t.reminders.off}</option>
            {REMINDER_OPTIONS.map((m) => (
              <option key={m} value={String(m)}>{reminderLabel(m, reminderText(t), 0)}</option>
            ))}
          </select>
        </div>

        <div role="group" aria-labelledby="shift-icon-label">
          <span id="shift-icon-label" className={labelClass}>{t.shiftDisplay.icon}</span>
          <div className="grid grid-cols-5 gap-2 mt-2">
            {SHIFT_ICON_KEYS.map((key) => {
              const Icon = SHIFT_ICONS[key];
              const selected = icon === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setIcon(key)}
                  aria-pressed={selected}
                  className={`flex flex-col items-center gap-1 py-2 rounded-xl text-[11px] transition-colors ${
                    selected ? 'bg-accent text-accent-contrast font-medium' : 'bg-surface-hover text-text-primary hover:bg-border'
                  }`}
                >
                  <Icon className="w-5 h-5" aria-hidden="true" />
                  {t.shiftDisplay[key]}
                </button>
              );
            })}
          </div>
        </div>

        <div role="group" aria-labelledby="shift-color-label">
          <span id="shift-color-label" className={labelClass}>{t.common.color}</span>
          <div className="flex flex-wrap -mx-1.5">
            {COLOR_PALETTE.map((c) => (
              <ColorSwatch key={c} color={c} name={colorKey(c) ? t.colors[colorKey(c)!] : c} selected={color === c} onSelect={() => setColor(c)} />
            ))}
          </div>
        </div>

        {shift && (
          <p className="text-xs text-text-tertiary">
            {t.shiftModal.appliesEverywhere}
          </p>
        )}
        {formError && <p role="alert" className="text-sm text-danger">{formError}</p>}

        {shift && onRemoveFromDay && !confirmingDelete && (
          <button
            type="button"
            disabled={loading}
            onClick={() => run(onRemoveFromDay)}
            className="w-full px-4 py-3 bg-surface-hover text-text-primary rounded-xl text-sm hover:bg-border transition-colors disabled:opacity-50"
          >
            {fill(t.shiftModal.removeFrom, { day: dayLabel || t.shiftModal.thisDay })}
          </button>
        )}

        {confirmingDelete && shift && onDelete ? (
          <div className="pt-2">
            <p className="text-sm text-text-secondary mb-3">
              {fill(t.shiftModal.confirmDelete, { title: shift.title })}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="flex-1 px-4 py-3 bg-surface-hover text-text-primary rounded-xl transition-colors hover:bg-border"
              >
                {t.common.cancel}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => run(onDelete)}
                className="flex-1 px-4 py-3 text-danger bg-danger/10 hover:bg-danger/20 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {loading ? t.common.deleting : t.shiftModal.deleteShift}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 pt-2">
            {shift && onDelete && (
              <button
                type="button"
                disabled={loading}
                onClick={() => setConfirmingDelete(true)}
                className="px-4 py-3 text-danger hover:bg-danger/10 rounded-xl transition-colors disabled:opacity-50"
              >
                {t.shiftModal.deleteShift}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-surface-hover text-text-primary rounded-xl transition-colors hover:bg-border"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
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
