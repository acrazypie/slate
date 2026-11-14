'use client';

import { useEffect, useState } from 'react';
import { CalendarDays, Briefcase, Plus, ChevronLeft } from 'lucide-react';
import { Shift, formatTime } from '@/lib/types';
import { Dialog, DialogClose } from './Dialog';

interface CreateChoiceSheetProps {
  isOpen: boolean;
  /** 'choice' asks event-or-shift first; 'shift' goes straight to the shift list. */
  initialStep?: 'choice' | 'shift';
  dateLabel: string;
  shifts: Shift[];
  onClose: () => void;
  onChooseEvent: () => void;
  onPickShift: (shift: Shift) => void;
  onCreateShift: () => void;
}

export function CreateChoiceSheet({
  isOpen,
  initialStep = 'choice',
  dateLabel,
  shifts,
  onClose,
  onChooseEvent,
  onPickShift,
  onCreateShift,
}: CreateChoiceSheetProps) {
  const [step, setStep] = useState<'choice' | 'shift'>(initialStep);

  useEffect(() => {
    if (isOpen) setStep(initialStep);
  }, [isOpen, initialStep]);

  if (!isOpen) return null;

  const rowClass =
    'w-full flex items-center gap-3 px-4 py-3 bg-surface-hover rounded-xl hover:bg-border transition-colors text-left';

  const heading = step === 'choice' ? 'Cosa vuoi aggiungere?' : 'Aggiungi un turno';

  return (
    <Dialog label={heading} onClose={onClose} size="sheet" zClass="z-[55]">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2 min-w-0">
            {step === 'shift' && initialStep === 'choice' && (
              <button
                onClick={() => setStep('choice')}
                className="flex items-center justify-center w-11 h-11 -my-2 -ml-2 flex-shrink-0 rounded-xl hover:bg-surface-hover transition-colors"
                aria-label="Indietro"
              >
                <ChevronLeft className="w-5 h-5 text-text-secondary" />
              </button>
            )}
            <div className="min-w-0">
              <h2 className="text-base font-medium text-text-primary">{heading}</h2>
              <p className="text-xs text-text-secondary capitalize truncate">{dateLabel}</p>
            </div>
          </div>
          <DialogClose onClose={onClose} />
        </div>

        {step === 'choice' ? (
          <div className="flex flex-col gap-2">
            <button onClick={onChooseEvent} className={rowClass}>
              <CalendarDays className="w-5 h-5 text-accent-text flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-text-primary">Evento</div>
                <div className="text-xs text-text-secondary">Studio, lavoro, lezione o altro</div>
              </div>
            </button>
            <button onClick={() => setStep('shift')} className={rowClass}>
              <Briefcase className="w-5 h-5 text-accent-text flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-text-primary">Turno</div>
                <div className="text-xs text-text-secondary">Inserisci uno dei tuoi turni in questo giorno</div>
              </div>
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {shifts.length === 0 && (
              <p className="text-sm text-text-secondary py-2">
                Non hai ancora creato nessun turno. Creane uno per inserirlo in questo giorno.
              </p>
            )}
            {shifts.map((shift) => (
              <button key={shift.id} onClick={() => onPickShift(shift)} className={rowClass}>
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: shift.color }} />
                <span className="flex-1 min-w-0 text-sm font-medium text-text-primary truncate">{shift.title}</span>
                <span className="text-xs text-text-secondary flex-shrink-0">
                  {formatTime(shift.start_hour, shift.start_minute)} – {formatTime(shift.end_hour, shift.end_minute)}
                </span>
              </button>
            ))}
            <button
              onClick={onCreateShift}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-dashed border-border-strong text-sm text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <Plus className="w-4 h-4" />
              Nuovo turno
            </button>
          </div>
        )}
    </Dialog>
  );
}
