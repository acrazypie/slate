'use client';

// Settings > Backup: export the data as a file, import a file (after a check and
// a confirmation), and erase everything.

import { useState } from 'react';
import { Dialog } from './Dialog';
import { useI18n } from './LanguageProvider';
import { exportBackup, eraseAll, importBackup, parseBackup, type BackupCounts } from '@/lib/backup';

type Pending = { counts: BackupCounts; text: string };

const btn = 'h-11 rounded-xl px-4 text-sm font-medium transition-colors disabled:opacity-50';

export function BackupSection() {
  const { t } = useI18n();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ text: string; kind: 'ok' | 'error' } | null>(null);
  const [pending, setPending] = useState<Pending | null>(null);
  const [erasing, setErasing] = useState(false);

  const download = async () => {
    setBusy(true);
    setMessage(null);
    try {
      const { name, text } = await exportBackup();
      const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMessage({ text: t.backup.exported, kind: 'ok' });
    } catch {
      setMessage({ text: t.backup.failed, kind: 'error' });
    } finally {
      setBusy(false);
    }
  };

  const pick = async (file: File) => {
    setMessage(null);
    if (file.size > 20 * 1024 * 1024) {
      setMessage({ text: t.backup.tooLarge, kind: 'error' });
      return;
    }
    const text = await file.text();
    const parsed = parseBackup(text);
    if (!parsed.ok) {
      const reason = parsed.error === 'notJson' ? t.backup.notJson : parsed.error === 'notSlate' ? t.backup.notSlate : t.backup.invalid;
      setMessage({ text: reason, kind: 'error' });
      return;
    }
    setPending({ counts: parsed.counts, text });
  };

  const confirmImport = async () => {
    if (!pending) return;
    setBusy(true);
    try {
      const parsed = parseBackup(pending.text);
      if (!parsed.ok) throw new Error('invalid');
      await importBackup(parsed);
      setPending(null);
      window.location.reload();
    } catch {
      setPending(null);
      setMessage({ text: t.backup.failed, kind: 'error' });
      setBusy(false);
    }
  };

  const confirmErase = async () => {
    setErasing(false);
    setBusy(true);
    try {
      await eraseAll();
      window.location.reload();
    } catch {
      setMessage({ text: t.backup.failed, kind: 'error' });
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-xs text-text-tertiary">{t.backup.lede}</p>

      <div className="flex flex-wrap gap-2">
        <button type="button" onClick={download} disabled={busy} className={`${btn} bg-accent text-accent-contrast`}>
          {t.backup.export}
        </button>
        <label className={`${btn} bg-surface-hover text-text-primary inline-flex items-center cursor-pointer hover:bg-border`}>
          {t.backup.import}
          <input
            type="file"
            accept="application/json,.json"
            className="sr-only"
            disabled={busy}
            onChange={(e) => {
              const file = e.target.files?.[0];
              e.target.value = '';
              if (file) void pick(file);
            }}
          />
        </label>
      </div>

      <div>
        <button type="button" onClick={() => setErasing(true)} disabled={busy} className={`${btn} text-danger hover:bg-danger/10`}>
          {t.backup.erase}
        </button>
      </div>

      {message && (
        <p className={`text-sm ${message.kind === 'ok' ? 'text-text-secondary' : 'text-danger'}`}>{message.text}</p>
      )}

      {pending && (
        <Dialog label={t.backup.importTitle} onClose={() => setPending(null)} size="sheet">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">{t.backup.importTitle}</h2>
            <p className="text-sm text-text-secondary">
              {t.backup.importBody
                .replace('{blocks}', String(pending.counts.blocks))
                .replace('{shifts}', String(pending.counts.shifts))
                .replace('{assignments}', String(pending.counts.assignments))
                .replace('{rotations}', String(pending.counts.rotations))}
            </p>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={confirmImport} disabled={busy} className={`${btn} bg-danger text-white`}>
                {t.backup.replace}
              </button>
              <button type="button" onClick={() => setPending(null)} className={`${btn} bg-surface-hover text-text-primary`}>
                {t.common.cancel}
              </button>
            </div>
          </div>
        </Dialog>
      )}

      {erasing && (
        <Dialog label={t.backup.eraseTitle} onClose={() => setErasing(false)} size="sheet">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">{t.backup.eraseTitle}</h2>
            <p className="text-sm text-text-secondary">{t.backup.eraseBody}</p>
            <div className="flex flex-col gap-2">
              <button type="button" onClick={confirmErase} disabled={busy} className={`${btn} bg-danger text-white`}>
                {t.backup.eraseConfirm}
              </button>
              <button type="button" onClick={() => setErasing(false)} className={`${btn} bg-surface-hover text-text-primary`}>
                {t.common.cancel}
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
