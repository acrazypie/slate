'use client';

// First visit on this device: welcome, then reminders. Shown once; Skip on every
// step. The reminders step becomes a real permission request with the reminders feature.

import { useState } from 'react';
import { useI18n } from './LanguageProvider';

const KEY = 'slate-onboarded';

export function isOnboarded(): boolean {
  try {
    return localStorage.getItem(KEY) === '1';
  } catch {
    return true; // storage blocked: do not show it on every visit
  }
}

function markOnboarded() {
  try {
    localStorage.setItem(KEY, '1');
  } catch {
    // Storage unavailable: the step shows again on the next visit.
  }
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const o = t.onboarding;
  const [step, setStep] = useState(0);

  const finish = () => {
    markOnboarded();
    onDone();
  };

  const title = step === 0 ? { before: o.titleBefore, accent: o.titleAccent, lede: o.lede } : { before: o.remTitleBefore, accent: o.remTitleAccent, lede: o.remLede };

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col">
      <div className="flex items-center justify-between px-5 pt-6">
        <div className="flex gap-1.5" aria-label={`${step + 1} / 2`}>
          {[0, 1].map((i) => (
            <span key={i} className={`h-1.5 w-6 rounded-full ${i === step ? 'bg-accent' : 'bg-surface-hover'}`} />
          ))}
        </div>
        <button type="button" onClick={finish} className="px-3 h-10 text-sm text-text-secondary hover:text-text-primary">
          {o.skip}
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-center px-5 sm:px-8 max-w-xl w-full mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-text-primary leading-[1.05]">
          {title.before} <span className="text-accent-text">{title.accent}</span>
        </h1>
        <p className="mt-4 text-lg text-text-secondary">{title.lede}</p>

        {step === 0 && (
          <ul className="mt-8 border-t border-border">
            {o.points.map((p) => (
              <li key={p.name} className="py-4 border-b border-border">
                <span className="block text-base font-medium text-text-primary">{p.name}</span>
                <span className="block text-sm text-text-secondary mt-0.5">{p.text}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="px-5 sm:px-8 pb-8 max-w-xl w-full mx-auto flex flex-col gap-2">
        {step === 0 ? (
          <button
            type="button"
            onClick={() => setStep(1)}
            className="h-12 rounded-2xl bg-accent text-accent-contrast font-semibold"
          >
            {o.continue}
          </button>
        ) : (
          <>
            <button type="button" onClick={finish} className="h-12 rounded-2xl bg-accent text-accent-contrast font-semibold">
              {o.start}
            </button>
            <button type="button" onClick={finish} className="h-11 text-sm text-text-secondary">
              {o.notNow}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
