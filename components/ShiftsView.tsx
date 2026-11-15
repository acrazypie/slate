'use client';

import { useState } from 'react';
import { Plus, Briefcase, ChevronRight } from 'lucide-react';
import { useShifts } from '@/hooks/useShifts';
import { Shift, ShiftFormData, formatTime, isOvernightShift, shiftDurationMinutes } from '@/lib/types';
import { ShiftModal } from './ShiftModal';
import { fill } from '@/lib/i18n/format';
import { useI18n } from './LanguageProvider';

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}

/** `onDataChange` fires after a shift is saved or deleted, so the weekly summary can reload. */
export function ShiftsView({ onDataChange }: { onDataChange?: () => void }) {
  const { shifts, loading, error, createShift, updateShift, deleteShift } = useShifts();
  const { t } = useI18n();
  const [editing, setEditing] = useState<Shift | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openCreate = () => {
    setEditing(null);
    setIsModalOpen(true);
  };

  const openEdit = (shift: Shift) => {
    setEditing(shift);
    setIsModalOpen(true);
  };

  const handleSave = async (data: ShiftFormData) => {
    const saved = editing ? await updateShift(editing.id, data) : await createShift(data);
    if (saved) {
      setIsModalOpen(false);
      onDataChange?.();
    }
  };

  const handleDelete = async () => {
    if (editing && (await deleteShift(editing.id))) {
      setIsModalOpen(false);
      onDataChange?.();
    }
  };

  return (
    <div className="flex-1 overflow-y-auto bg-bg">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex items-center justify-between gap-3 mb-2">
          <h1 className="font-serif text-2xl sm:text-3xl text-text-primary">{t.common.shifts}</h1>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2.5 bg-accent text-accent-contrast rounded-xl text-sm font-medium hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            {t.create.newShift}
          </button>
        </div>
        <p className="text-sm text-text-secondary mb-6">
          {t.shiftsView.intro}
        </p>

        {error && <p className="text-sm text-danger mb-4">{fill(t.shiftsView.loadError, { error })}</p>}

        {loading ? (
          <p className="text-sm text-text-secondary">{t.common.loading}</p>
        ) : shifts.length === 0 ? (
          <div className="flex flex-col items-center text-center gap-3 px-6 py-12 border border-dashed border-border-strong rounded-2xl">
            <Briefcase className="w-8 h-8 text-text-tertiary" />
            <p className="text-sm text-text-secondary">{t.shiftsView.empty}</p>
            <button onClick={openCreate} className="text-sm text-accent-text hover:underline">
              {t.shiftsView.createFirst}
            </button>
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {shifts.map((shift) => (
              <li key={shift.id}>
                <button
                  onClick={() => openEdit(shift)}
                  className="w-full flex items-center gap-3 px-4 py-3.5 bg-surface rounded-2xl hover:bg-surface-hover transition-colors text-left"
                  style={{ borderLeft: `4px solid ${shift.color}` }}
                >
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-text-primary truncate">{shift.title}</span>
                    <span className="block text-xs text-text-secondary">
                      {formatTime(shift.start_hour, shift.start_minute)} – {formatTime(shift.end_hour, shift.end_minute)}
                      {isOvernightShift(shift) && ` ${t.shiftsView.nextDay}`}
                    </span>
                  </span>
                  <span className="text-xs text-text-tertiary flex-shrink-0">
                    {formatDuration(shiftDurationMinutes(shift))}
                  </span>
                  <ChevronRight className="w-4 h-4 text-text-tertiary flex-shrink-0" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ShiftModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        onDelete={editing ? handleDelete : undefined}
        shift={editing}
      />
    </div>
  );
}
