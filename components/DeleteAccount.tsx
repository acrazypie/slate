'use client';

// Settings > Delete account. A confirmation dialog asks the user to type their
// email address before the account and all its data are deleted.

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from './Dialog';
import { useI18n } from './LanguageProvider';
import { deleteAccount } from '@/lib/account';

const btn = 'w-full px-4 h-11 rounded-xl text-sm font-medium transition-colors disabled:opacity-50';

export function DeleteAccount({ email }: { email: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);
  const matches = email !== '' && typed.trim().toLowerCase() === email.trim().toLowerCase();

  const close = () => {
    if (busy) return;
    setOpen(false);
    setTyped('');
    setFailed(false);
  };

  const confirm = async () => {
    if (!matches || busy) return;
    setBusy(true);
    setFailed(false);
    try {
      await deleteAccount();
      router.replace('/auth/login');
    } catch {
      setBusy(false);
      setFailed(true);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full px-4 py-3 rounded-xl text-sm text-danger hover:bg-danger/10 transition-colors"
      >
        {t.deleteAccount.button}
      </button>

      {open && (
        <Dialog label={t.deleteAccount.title} onClose={close} size="sheet">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-text-primary">{t.deleteAccount.title}</h2>
            <p className="text-sm text-text-secondary">{t.deleteAccount.body}</p>
            <label className="block text-sm text-text-secondary">
              {t.deleteAccount.label}
              <input
                type="email"
                autoComplete="off"
                value={typed}
                onChange={(e) => setTyped(e.target.value)}
                disabled={busy}
                className="mt-1 w-full rounded-lg bg-surface-hover px-3 py-2 text-sm text-text-primary"
              />
            </label>
            {failed && <p className="text-sm text-danger">{t.deleteAccount.failed}</p>}
            <div className="flex flex-col gap-2">
              <button type="button" onClick={confirm} disabled={!matches || busy} className={`${btn} bg-danger text-white`}>
                {t.deleteAccount.confirm}
              </button>
              <button type="button" onClick={close} disabled={busy} className={`${btn} bg-surface-hover text-text-primary`}>
                {t.common.cancel}
              </button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}
