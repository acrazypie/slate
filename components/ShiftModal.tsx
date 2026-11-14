'use client';

import { useState, useEffect } from 'react';
import { Shift, ShiftFormData, COLOR_PALETTE, COLOR_NAMES, SHIFT_DEFAULT_COLOR, formatTime } from '@/lib/types';
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
  const [title, setTitle] = useState('');
  const [start, setStart] = useState('09:00');
  const [end, setEnd] = useState('17:00');
  const [color, setColor] = useState(SHIFT_DEFAULT_COLOR);
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
    } else {
      setTitle('');
      setStart('09:00');
      setEnd('17:00');
      setColor(SHIFT_DEFAULT_COLOR);
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

  const heading = shift ? 'Modifica turno' : 'Nuovo turno';
  const labelClass = 'block text-sm text-text-secondary mb-2';

  return (
    <Dialog label={heading} onClose={onClose} zClass="z-[60]">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-medium text-text-primary">{heading}</h2>
        <DialogClose onClose={onClose} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="shift-title" className={labelClass}>Nome del turno</label>
          <input
            id="shift-title"
            type="text"
            placeholder="es. Mattina"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={`${inputClass} placeholder-text-tertiary`}
            autoFocus={!shift}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="shift-start" className={labelClass}>Ora di inizio</label>
            <input id="shift-start" type="time" value={start} onChange={(e) => setStart(e.target.value)} className={inputClass} />
          </div>
          <div>
            <label htmlFor="shift-end" className={labelClass}>Ora di fine</label>
            <input id="shift-end" type="time" value={end} onChange={(e) => setEnd(e.target.value)} className={inputClass} />
          </div>
        </div>
        {overnight && <p className="text-xs text-text-tertiary">Il turno termina il giorno successivo.</p>}

        <div role="group" aria-labelledby="shift-color-label">
          <span id="shift-color-label" className={labelClass}>Colore</span>
          <div className="flex flex-wrap -mx-1.5">
            {COLOR_PALETTE.map((c) => (
              <ColorSwatch key={c} color={c} name={COLOR_NAMES[c] ?? c} selected={color === c} onSelect={() => setColor(c)} />
            ))}
          </div>
        </div>

        {shift && (
          <p className="text-xs text-text-tertiary">
            Le modifiche valgono per tutti i giorni in cui questo turno è inserito.
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
            Rimuovi da {dayLabel || 'questo giorno'}
          </button>
        )}

        {confirmingDelete && shift && onDelete ? (
          <div className="pt-2">
            <p className="text-sm text-text-secondary mb-3">
              Eliminare il turno &ldquo;{shift.title}&rdquo;? Verrà tolto da tutti i giorni in cui è inserito e non si può
              annullare.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmingDelete(false)}
                className="flex-1 px-4 py-3 bg-surface-hover text-text-primary rounded-xl transition-colors hover:bg-border"
              >
                Annulla
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => run(onDelete)}
                className="flex-1 px-4 py-3 text-danger bg-danger/10 hover:bg-danger/20 rounded-xl font-medium transition-colors disabled:opacity-50"
              >
                {loading ? 'Eliminazione...' : 'Elimina turno'}
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
        )}
      </form>
    </Dialog>
  );
}
