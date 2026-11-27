'use client';

// Create or edit a rotation: a repeating cycle of shifts (or days off), placed on
// the calendar from a chosen day. Same as the Android app's rotation sheet.

import { useState } from 'react';
import { format } from 'date-fns';
import { Dialog } from './Dialog';
import { useI18n } from './LanguageProvider';
import { useShifts } from '@/hooks/useShifts';
import type { useRotations } from '@/hooks/useRotations';
import { Rotation, ROTATION_MAX_DAYS, ROTATION_MIN_DAYS } from '@/lib/types';
import { fill } from '@/lib/i18n/format';

const LENGTHS = [2, 3, 4, 5, 6, 7, 10, 14, 21, 28].filter((n) => n >= ROTATION_MIN_DAYS && n <= ROTATION_MAX_DAYS);
const WEEKS = [1, 2, 4, 8, 12, 26];
const field = 'w-full rounded-lg bg-surface-hover px-3 py-2 text-sm text-text-primary';

export function RotationModal({
  rotation,
  api,
  onClose,
}: {
  rotation: Rotation | null;
  api: ReturnType<typeof useRotations>;
  onClose: () => void;
}) {
  const { t } = useI18n();
  const { shifts } = useShifts();
  const [title, setTitle] = useState(rotation?.title ?? '');
  const [pattern, setPattern] = useState<(string | null)[]>(rotation ? [...rotation.pattern] : [null, null, null, null]);
  const [from, setFrom] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [weeks, setWeeks] = useState(1);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [message, setMessage] = useState('');

  const changeLength = (n: number) =>
    setPattern((prev) => Array.from({ length: n }, (_, i) => prev[i] ?? null));
  const setDay = (i: number, shiftId: string | null) =>
    setPattern((prev) => prev.map((v, j) => (j === i ? shiftId : v)));

  /** Checks the form and saves. Returns the saved rotation, or null if the form is not valid. */
  const save = async (): Promise<Rotation | null> => {
    if (!title.trim()) {
      setError(t.rotation.titleRequired);
      return null;
    }
    if (pattern.every((v) => v === null)) {
      setError(t.rotation.needShift);
      return null;
    }
    const data = { title: title.trim(), pattern };
    return rotation ? api.updateRotation(rotation.id, data) : api.createRotation(data);
  };

  const handleSave = async () => {
    if (await save()) onClose();
  };

  const handlePlace = async () => {
    const saved = await save();
    if (!saved) return;
    const [y, m, d] = from.split('-').map(Number);
    const placed = await api.placeRotation(saved, new Date(y, m - 1, d), weeks * 7);
    setMessage(placed > 0 ? fill(t.rotation.applied, { count: placed }) : t.rotation.appliedNone);
    if (placed > 0) onClose();
  };

  const handleDelete = async () => {
    if (rotation && (await api.deleteRotation(rotation.id))) onClose();
  };

  return (
    <Dialog label={rotation ? t.rotation.editTitle : t.rotation.newTitle} onClose={onClose} size="form">
      <div className="space-y-5">
        <h2 className="text-xl font-semibold text-text-primary">{rotation ? t.rotation.editTitle : t.rotation.newTitle}</h2>

        <label className="block">
          <span className="text-sm text-text-secondary">{t.rotation.name}</span>
          <input
            className={`${field} mt-1`}
            value={title}
            maxLength={100}
            placeholder={t.rotation.namePlaceholder}
            onChange={(e) => {
              setTitle(e.target.value);
              setError('');
            }}
          />
        </label>

        <label className="block">
          <span className="text-sm text-text-secondary">{t.rotation.cycle}</span>
          <select className={`${field} mt-1`} value={pattern.length} onChange={(e) => changeLength(Number(e.target.value))}>
            {LENGTHS.map((n) => (
              <option key={n} value={n}>{fill(t.rotation.days, { n })}</option>
            ))}
          </select>
        </label>

        <div>
          <span className="text-sm text-text-secondary">{t.rotation.pattern}</span>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {pattern.map((shiftId, i) => (
              <label key={i} className="block">
                <span className="block text-xs text-text-tertiary mb-1">{fill(t.rotation.day, { n: i + 1 })}</span>
                <select
                  className={field}
                  value={shiftId ?? ''}
                  onChange={(e) => {
                    setDay(i, e.target.value || null);
                    setError('');
                  }}
                >
                  <option value="">{t.rotation.off}</option>
                  {shifts.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </label>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-text-secondary">{t.rotation.applyFrom}</span>
            <input type="date" className={`${field} mt-1`} value={from} onChange={(e) => e.target.value && setFrom(e.target.value)} />
          </label>
          <label className="block">
            <span className="text-sm text-text-secondary">{t.rotation.applyFor}</span>
            <select className={`${field} mt-1`} value={weeks} onChange={(e) => setWeeks(Number(e.target.value))}>
              {WEEKS.map((w) => (
                <option key={w} value={w}>{w === 1 ? t.rotation.week : fill(t.rotation.weeks, { n: w })}</option>
              ))}
            </select>
          </label>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {message && <p className="text-sm text-text-secondary">{message}</p>}

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handlePlace}
            disabled={pattern.every((v) => v === null)}
            className="h-11 rounded-xl bg-accent text-accent-contrast font-medium disabled:opacity-50"
          >
            {t.rotation.apply}
          </button>
          <button type="button" onClick={handleSave} className="h-11 rounded-xl bg-surface-hover text-text-primary">
            {t.common.save}
          </button>
          {rotation && !confirmDelete && (
            <button type="button" onClick={() => setConfirmDelete(true)} className="h-11 text-danger">
              {t.rotation.delete}
            </button>
          )}
          {rotation && confirmDelete && (
            <div className="rounded-xl bg-surface-hover p-3">
              <p className="text-sm text-text-secondary mb-3">
                {fill(t.rotation.confirmDelete, { title: rotation.title })}
              </p>
              <button type="button" onClick={handleDelete} className="h-10 w-full rounded-lg text-danger font-medium">
                {t.common.delete}
              </button>
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
