'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Shift, ShiftFormData, COLOR_PALETTE, SHIFT_DEFAULT_COLOR, formatTime } from '@/lib/types';

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
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [color, setColor] = useState(SHIFT_DEFAULT_COLOR);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (shift) {
      setTitle(shift.title);
      setStart(formatTime(shift.start_hour, shift.start_minute));
      setEnd(formatTime(shift.end_hour, shift.end_minute));
      setColor(shift.color);
    } else {
      setTitle('');
      setStart('09:00');
      setEnd('17:00');
      setColor(SHIFT_DEFAULT_COLOR);
    }
    setFormError(null);
  }, [shift, isOpen]);

  if (!isOpen) return null;

  const overnight = !!start && !!end && end < start;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !start || !end) return;
    if (start === end) {
      setFormError("L'ora di fine deve essere diversa da quella di inizio.");
      return;
    }
    const [sh, sm] = start.split(':').map(Number);
    const [eh, em] = end.split(':').map(Number);

    setLoading(true);
    await onSave({ title: title.trim(), start_hour: sh, start_minute: sm, end_hour: eh, end_minute: em, color });
    setLoading(false);
  };

  const run = async (fn: () => Promise<void>) => {
    setLoading(true);
    await fn();
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-surface rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md mx-0 sm:mx-4 p-6 max-h-[90vh] sm:max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-medium text-text-primary">{shift ? 'Modifica turno' : 'Nuovo turno'}</h2>
          <button onClick={onClose} className="p-1 hover:bg-surface-hover rounded" aria-label="Chiudi">
            <X className="w-5 h-5 text-text-secondary" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Nome del turno (es. Mattina)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`${inputClass} placeholder-text-secondary`}
            autoFocus={!shift}
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-text-secondary mb-2">Ora di inizio</label>
              <input type="time" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-2">Ora di fine</label>
              <input type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
            </div>
          </div>
          {overnight && <p className="text-xs text-text-tertiary">Il turno termina il giorno successivo.</p>}

          <div>
            <label className="block text-sm text-text-secondary mb-2">Colore</label>
            <div className="flex flex-wrap gap-2">
              {COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  aria-label={`Colore ${c}`}
                  className={`w-8 h-8 rounded-full transition-transform ${
                    color === c ? 'scale-110 ring-2 ring-accent ring-offset-2 ring-offset-surface' : ''
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {shift && (
            <p className="text-xs text-text-tertiary">
              Le modifiche valgono per tutti i giorni in cui questo turno è inserito.
            </p>
          )}
          {formError && <p className="text-sm text-red-500">{formError}</p>}

          {shift && onRemoveFromDay && (
            <button
              type="button"
              disabled={loading}
              onClick={() => run(onRemoveFromDay)}
              className="w-full px-4 py-3 bg-surface-hover text-text-primary rounded-xl text-sm hover:bg-border transition-colors disabled:opacity-50"
            >
              Rimuovi da {dayLabel || 'questo giorno'}
            </button>
          )}

          <div className="flex gap-3 pt-2">
            {shift && onDelete && (
              <button
                type="button"
                disabled={loading}
                onClick={() => run(onDelete)}
                className="px-4 py-3 text-red-500 hover:bg-red-500/10 rounded-xl transition-colors disabled:opacity-50"
              >
                Elimina turno
              </button>
            )}
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
