'use client';

import { useState, useEffect } from 'react';
import { reminderLabel, reminderText, reminderToForm, formToReminder, getLeadMinutes, REMINDER_OPTIONS } from '@/lib/reminders';
import { Block, BlockCategory, BlockFormData, CATEGORIES, COLOR_PALETTE, colorKey, DURATION_OPTIONS, CATEGORY_COLORS, RecurrenceType } from '@/lib/types';
import { weekdayNames } from '@/lib/i18n/format';
import { useI18n } from './LanguageProvider';
import { Dialog, DialogClose, ColorSwatch } from './Dialog';
import { CategoryIcon } from './CategoryIcon';

interface BlockModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BlockFormData) => Promise<void>;
  onDelete: () => Promise<void>;
  onDeleteRecurring?: (deleteType: 'current' | 'this-and-following' | 'all') => Promise<void>;
  initialData?: {
    day_of_week: number;
    start_hour: number;
    start_minute: number;
  } | null;
  block?: Block | null;
}

export function BlockModal({ isOpen, onClose, onSave, onDelete, onDeleteRecurring, initialData, block }: BlockModalProps) {
  const { locale, t } = useI18n();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BlockCategory>('studio');
  const [color, setColor] = useState(CATEGORY_COLORS.studio);
  const [day_of_week, setDayOfWeek] = useState(0);
  const [start_hour, setStartHour] = useState(9);
  const [start_minute, setStartMinute] = useState(0);
  const [duration_minutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState('');
  const [reminder, setReminder] = useState('default');
  const [loading, setLoading] = useState(false);
  
  const [is_recurring, setIsRecurring] = useState(false);
  const [recurrence_type, setRecurrenceType] = useState<RecurrenceType>('weekly');
  const [recurrence_end_date, setRecurrenceEndDate] = useState('');
  const [showDeleteRecurringMenu, setShowDeleteRecurringMenu] = useState(false);
  // Deleting a single event asks once more before it happens.
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  useEffect(() => {
    if (block) {
      setTitle(block.title);
      setCategory(block.category);
      setColor(block.color);
      setDayOfWeek(block.day_of_week);
      setStartHour(block.start_hour);
      setStartMinute(block.start_minute);
      setDurationMinutes(block.duration_minutes);
      setNotes(block.notes || '');
      setReminder(reminderToForm(block.reminder_minutes));
      setIsRecurring(block.is_recurring || false);
      setRecurrenceType(block.recurrence_type || 'weekly');
      setRecurrenceEndDate(block.recurrence_end_date || '');
    } else if (initialData) {
      setTitle('');
      setCategory('studio');
      setColor(CATEGORY_COLORS.studio);
      setDayOfWeek(initialData.day_of_week);
      setStartHour(initialData.start_hour);
      setStartMinute(initialData.start_minute);
      setDurationMinutes(60);
      setNotes('');
      setIsRecurring(false);
      setRecurrenceType('weekly');
      setRecurrenceEndDate('');
    }
    // The modal stays mounted between uses, so a delete prompt left open on one
    // event must not still be showing when another one is opened.
    setConfirmingDelete(false);
    setShowDeleteRecurringMenu(false);
  }, [block, initialData, isOpen]);

  const handleCategoryChange = (cat: BlockCategory) => {
    setCategory(cat);
    setColor(CATEGORY_COLORS[cat]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    
    setLoading(true);
    await onSave({
      title: title.trim(),
      category,
      color,
      day_of_week,
      start_hour,
      start_minute,
      duration_minutes,
      notes,
      reminder_minutes: formToReminder(reminder),
      is_recurring,
      recurrence_type: is_recurring ? recurrence_type : undefined,
      recurrence_end_date: is_recurring && recurrence_end_date ? recurrence_end_date : undefined,
    });
    setLoading(false);
  };

  const handleDeleteRecurring = async (deleteType: 'current' | 'this-and-following' | 'all') => {
    if (onDeleteRecurring) {
      setLoading(true);
      await onDeleteRecurring(deleteType);
      setLoading(false);
      onClose();
    }
  };

  if (!isOpen) return null;

  const handleDelete = async () => {
    setLoading(true);
    await onDelete();
    setLoading(false);
  };

  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      timeOptions.push({ hour: h, minute: m });
    }
  }

  const heading = block ? t.blockModal.editTitle : t.blockModal.newTitle;
  const fieldClass =
    'w-full px-4 py-3 bg-surface-hover text-text-primary rounded-xl border border-border focus:border-accent focus:outline-none';
  const labelClass = 'block text-sm text-text-secondary mb-2';
  const segment = (active: boolean) =>
    `flex items-center justify-center px-2 min-h-11 rounded-xl text-sm transition-colors ${
      active ? 'bg-accent text-accent-contrast font-medium' : 'bg-surface-hover text-text-primary hover:bg-border'
    }`;
  const isSeries = !!(block && onDeleteRecurring && block.is_recurring);

  return (
    <Dialog label={heading} onClose={onClose}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-text-primary">{heading}</h2>
        <DialogClose onClose={onClose} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="block-title" className={labelClass}>{t.blockModal.title}</label>
          <input
            id="block-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={fieldClass}
            autoFocus
          />
        </div>

        <div role="group" aria-labelledby="block-category-label">
          <span id="block-category-label" className={labelClass}>{t.blockModal.category}</span>
          <div className="grid grid-cols-4 gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategoryChange(cat)}
                aria-pressed={category === cat}
                className={`flex flex-col items-center gap-1 px-1 py-2.5 rounded-xl text-xs transition-colors ${
                  category === cat
                    ? 'bg-accent text-accent-contrast font-medium'
                    : 'bg-surface-hover text-text-primary hover:bg-border'
                }`}
              >
                <CategoryIcon category={cat} className="w-5 h-5" />
                {t.categories[cat]}
              </button>
            ))}
          </div>
        </div>

        <div role="group" aria-labelledby="block-color-label">
          <span id="block-color-label" className={labelClass}>{t.common.color}</span>
          <div className="flex flex-wrap -mx-1.5">
            {COLOR_PALETTE.map((c) => (
              <ColorSwatch key={c} color={c} name={colorKey(c) ? t.colors[colorKey(c)!] : c} selected={color === c} onSelect={() => setColor(c)} />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="block-day" className={labelClass}>{t.blockModal.day}</label>
            <select
              id="block-day"
              value={day_of_week}
              onChange={(e) => setDayOfWeek(Number(e.target.value))}
              className={fieldClass}
            >
              {weekdayNames(locale).map((day, i) => (
                <option key={i} value={i}>{day}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="block-duration" className={labelClass}>{t.blockModal.duration}</label>
            <select
              id="block-duration"
              value={duration_minutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
              className={fieldClass}
            >
              {DURATION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="block-start" className={labelClass}>{t.common.startTime}</label>
          <select
            id="block-start"
            value={`${start_hour}:${start_minute.toString().padStart(2, '0')}`}
            onChange={(e) => {
              const [h, m] = e.target.value.split(':').map(Number);
              setStartHour(h);
              setStartMinute(m);
            }}
            className={fieldClass}
          >
            {timeOptions.map((opt) => (
              <option key={`${opt.hour}:${opt.minute}`} value={`${opt.hour}:${opt.minute.toString().padStart(2, '0')}`}>
                {opt.hour.toString().padStart(2, '0')}:{opt.minute.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="block-reminder" className={labelClass}>{t.reminders.label}</label>
          <select id="block-reminder" value={reminder} onChange={(e) => setReminder(e.target.value)} className={fieldClass}>
            <option value="default">{reminderLabel(null, reminderText(t), getLeadMinutes())}</option>
            <option value="off">{t.reminders.off}</option>
            {REMINDER_OPTIONS.map((m) => (
              <option key={m} value={String(m)}>{reminderLabel(m, reminderText(t), 0)}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="block-notes" className={labelClass}>{t.blockModal.notes}</label>
          <textarea
            id="block-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className={`${fieldClass} resize-none`}
          />
        </div>

        <div role="group" aria-labelledby="block-repeat-label">
          <span id="block-repeat-label" className={labelClass}>{t.blockModal.repeat}</span>
          <div className="grid grid-cols-3 gap-2">
            <button type="button" aria-pressed={!is_recurring} onClick={() => setIsRecurring(false)} className={segment(!is_recurring)}>
              {t.blockModal.repeatNone}
            </button>
            <button
              type="button"
              aria-pressed={is_recurring && recurrence_type === 'weekly'}
              onClick={() => { setIsRecurring(true); setRecurrenceType('weekly'); }}
              className={segment(is_recurring && recurrence_type === 'weekly')}
            >
              {t.blockModal.weekly}
            </button>
            <button
              type="button"
              aria-pressed={is_recurring && recurrence_type === 'monthly'}
              onClick={() => { setIsRecurring(true); setRecurrenceType('monthly'); }}
              className={segment(is_recurring && recurrence_type === 'monthly')}
            >
              {t.blockModal.monthly}
            </button>
          </div>
        </div>

        {is_recurring && (
          <div role="group" aria-labelledby="block-repeat-end-label">
            <span id="block-repeat-end-label" className={labelClass}>{t.blockModal.repeatEnd}</span>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" aria-pressed={!recurrence_end_date} onClick={() => setRecurrenceEndDate('')} className={segment(!recurrence_end_date)}>
                {t.blockModal.never}
              </button>
              <button
                type="button"
                aria-pressed={!!recurrence_end_date}
                onClick={() => setRecurrenceEndDate(recurrence_end_date || new Date().toISOString().split('T')[0])}
                className={segment(!!recurrence_end_date)}
              >
                {t.blockModal.until}
              </button>
            </div>
            {recurrence_end_date && (
              <input
                type="date"
                aria-label={t.blockModal.repeatEndDate}
                value={recurrence_end_date}
                onChange={(e) => setRecurrenceEndDate(e.target.value)}
                className={`${fieldClass} mt-2`}
              />
            )}
          </div>
        )}

        {isSeries && showDeleteRecurringMenu && (
          <div className="space-y-1 p-3 bg-surface-hover rounded-xl">
            <p className="px-3 pb-1 text-sm text-text-secondary">{t.blockModal.deleteWhat}</p>
            {([
              ['current', t.blockModal.deleteCurrent],
              ['this-and-following', t.blockModal.deleteFollowing],
              ['all', t.blockModal.deleteAll],
            ] as const).map(([type, text]) => (
              <button
                key={type}
                type="button"
                disabled={loading}
                onClick={() => handleDeleteRecurring(type)}
                className="w-full px-3 min-h-11 text-sm text-danger hover:bg-danger/10 rounded-xl text-left disabled:opacity-50"
              >
                {text}
              </button>
            ))}
          </div>
        )}

        {confirmingDelete ? (
          <div className="pt-2">
            <p className="text-sm text-text-secondary mb-3">{t.blockModal.confirmDelete}</p>
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
                onClick={handleDelete}
                className="flex-1 px-4 py-3 text-danger bg-danger/10 hover:bg-danger/20 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {loading ? t.common.deleting : t.blockModal.deleteEvent}
              </button>
            </div>
          </div>
        ) : (
          <div className="flex gap-3 pt-2">
            {isSeries ? (
              <button
                type="button"
                aria-expanded={showDeleteRecurringMenu}
                onClick={() => setShowDeleteRecurringMenu(!showDeleteRecurringMenu)}
                className="px-4 py-3 text-danger hover:bg-danger/10 rounded-xl transition-colors"
              >
                {t.common.delete}
              </button>
            ) : block ? (
              <button
                type="button"
                onClick={() => setConfirmingDelete(true)}
                className="px-4 py-3 text-danger hover:bg-danger/10 rounded-xl transition-colors"
              >
                {t.common.delete}
              </button>
            ) : null}
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
