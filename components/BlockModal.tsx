'use client';

import { useState, useEffect } from 'react';
import { Block, BlockCategory, BlockFormData, DAY_NAMES, COLOR_PALETTE, DURATION_OPTIONS, CATEGORY_COLORS, RecurrenceType } from '@/lib/types';
import { X } from 'lucide-react';

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
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<BlockCategory>('studio');
  const [color, setColor] = useState(CATEGORY_COLORS.studio);
  const [day_of_week, setDayOfWeek] = useState(0);
  const [start_hour, setStartHour] = useState(9);
  const [start_minute, setStartMinute] = useState(0);
  const [duration_minutes, setDurationMinutes] = useState(60);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [is_recurring, setIsRecurring] = useState(false);
  const [recurrence_type, setRecurrenceType] = useState<RecurrenceType>('weekly');
  const [recurrence_end_date, setRecurrenceEndDate] = useState('');
  const [showDeleteRecurringMenu, setShowDeleteRecurringMenu] = useState(false);

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
  }, [block, initialData]);

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

  const timeOptions = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      timeOptions.push({ hour: h, minute: m });
    }
  }

  const selectedRadio = 'inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-sm font-medium transition-colors';
  const unselectedRadio = 'inline-flex items-center justify-center px-3 py-2.5 rounded-xl text-sm transition-colors bg-surface text-text-primary hover:bg-surface-hover';

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div 
        className="bg-surface rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md mx-0 sm:mx-4 p-6 max-h-[90vh] sm:max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-text-primary">
            {block ? 'Modifica blocco' : 'Nuovo blocco'}
          </h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-hover rounded">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Titolo"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-3 bg-surface-hover text-text-primary rounded-xl placeholder-text-secondary border border-border focus:border-accent focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Categoria</label>
            <div className="grid grid-cols-4 gap-2">
              {(['studio', 'lavoro', 'lezione', 'altro'] as BlockCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => handleCategoryChange(cat)}
                  className={`px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    category === cat
                      ? 'bg-accent text-accent-contrast font-medium'
                      : 'bg-surface-hover text-text-primary hover:bg-border'
                  }`}
                >
                  {cat === 'studio' && '📚'}
                  {cat === 'lavoro' && '💼'}
                  {cat === 'lezione' && '🎓'}
                  {cat === 'altro' && '📌'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Colore</label>
            <div className="flex gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-accent ring-offset-2 ring-offset-surface' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-text-secondary mb-2">Giorno</label>
              <select
                value={day_of_week}
                onChange={(e) => setDayOfWeek(Number(e.target.value))}
                className="w-full px-4 py-3 bg-surface-hover text-text-primary rounded-xl border border-border focus:border-accent focus:outline-none"
              >
                {DAY_NAMES.map((day, i) => (
                  <option key={i} value={i}>{day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">Durata</label>
              <select
                value={duration_minutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-4 py-3 bg-surface-hover text-text-primary rounded-xl border border-border focus:border-accent focus:outline-none"
              >
                {DURATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Ora di inizio</label>
            <select
              value={`${start_hour}:${start_minute.toString().padStart(2, '0')}`}
              onChange={(e) => {
                const [h, m] = e.target.value.split(':').map(Number);
                setStartHour(h);
                setStartMinute(m);
              }}
              className="w-full px-4 py-3 bg-surface-hover text-text-primary rounded-xl border border-border focus:border-accent focus:outline-none"
            >
              {timeOptions.map((opt) => (
                <option key={`${opt.hour}:${opt.minute}`} value={`${opt.hour}:${opt.minute}`}>
                  {opt.hour.toString().padStart(2, '0')}:{opt.minute.toString().padStart(2, '0')}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Note (opzionale)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Aggiungi note..."
              rows={3}
              className="w-full px-4 py-3 bg-surface-hover text-text-primary rounded-xl placeholder-text-secondary border border-border focus:border-accent focus:outline-none resize-none"
            />
          </div>

          <div>
            <label className="block text-sm text-text-secondary mb-2">Ripetizione</label>
            <div className="space-y-2">
              <button
                type="button"
                onClick={() => setIsRecurring(false)}
                className={`w-full ${!is_recurring ? selectedRadio + ' bg-accent text-accent-contrast font-medium' : unselectedRadio}`}
              >
                Nessuna
              </button>
              <button
                type="button"
                onClick={() => { setIsRecurring(true); setRecurrenceType('weekly'); }}
                className={`w-full ${is_recurring && recurrence_type === 'weekly' ? selectedRadio + ' bg-accent text-accent-contrast font-medium' : unselectedRadio}`}
              >
                Settimanale
              </button>
              <button
                type="button"
                onClick={() => { setIsRecurring(true); setRecurrenceType('monthly'); }}
                className={`w-full ${is_recurring && recurrence_type === 'monthly' ? selectedRadio + ' bg-accent text-accent-contrast font-medium' : unselectedRadio}`}
              >
                Mensile
              </button>
            </div>
          </div>

          {is_recurring && (
            <div>
              <label className="block text-sm text-text-secondary mb-2">Fine ripetizione</label>
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setRecurrenceEndDate('')}
                  className={`w-full ${!recurrence_end_date ? selectedRadio + ' bg-accent text-accent-contrast font-medium' : unselectedRadio}`}
                >
                  Mai
                </button>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setRecurrenceEndDate(recurrence_end_date || new Date().toISOString().split('T')[0])}
                    className={`flex-1 ${recurrence_end_date ? selectedRadio + ' bg-accent text-accent-contrast font-medium' : unselectedRadio}`}
                  >
                    Fino al:
                  </button>
                  {recurrence_end_date && (
                    <input
                      type="date"
                      value={recurrence_end_date}
                      onChange={(e) => setRecurrenceEndDate(e.target.value)}
                      className="flex-1 px-3 py-2.5 bg-surface-hover text-text-primary rounded-xl border border-border focus:border-accent focus:outline-none"
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            {block && onDeleteRecurring && block.is_recurring ? (
              <div className="flex-1">
                <button
                  type="button"
                  onClick={() => setShowDeleteRecurringMenu(!showDeleteRecurringMenu)}
                  className="px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors w-full text-left"
                >
                  {showDeleteRecurringMenu ? 'Annulla' : 'Elimina'}
                </button>
                {showDeleteRecurringMenu && (
                  <div className="mt-2 space-y-2 p-3 bg-surface-hover rounded-xl">
                    <button
                      type="button"
                      onClick={() => handleDeleteRecurring('current')}
                      className="w-full px-3 py-2 text-sm text-text-primary hover:bg-border rounded-xl text-left"
                    >
                      Solo questo blocco
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRecurring('this-and-following')}
                      className="w-full px-3 py-2 text-sm text-text-primary hover:bg-border rounded-xl text-left"
                    >
                      Questo e i seguenti
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteRecurring('all')}
                      className="w-full px-3 py-2 text-sm text-text-primary hover:bg-border rounded-xl text-left"
                    >
                      Tutti i blocchi della serie
                    </button>
                  </div>
                )}
              </div>
            ) : block ? (
              <button
                type="button"
                onClick={onDelete}
                className="px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors"
              >
                Elimina
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 bg-surface-hover text-text-primary rounded-xl transition-colors hover:bg-border"
            >
              Annulla
            </button>
            <button
              type="submit"
              disabled={loading || !title.trim()}
              className="flex-1 px-4 py-3 bg-accent text-accent-contrast rounded-xl font-medium transition-colors hover:opacity-90 disabled:opacity-50"
            >
              {loading ? 'Salvataggio...' : 'Salva'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}