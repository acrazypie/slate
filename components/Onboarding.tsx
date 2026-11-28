'use client';

// First visit on this device. On a phone that is not installed yet, a first step
// shows how to add Slate to the home screen (and how to get to the right browser).
// Then welcome and reminders. Shown once; Skip on every step.

import { useState } from 'react';
import { useI18n } from './LanguageProvider';
import { installGuide, copyText, type InstallGuide } from '@/lib/install';

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

type StepKind = 'install' | 'welcome' | 'reminders';

function InstallStep({ guide }: { guide: InstallGuide }) {
  const { t } = useI18n();
  const o = t.onboarding;
  const [copied, setCopied] = useState(false);
  const steps = guide.platform === 'ios' ? o.iosSteps : o.androidSteps;
  const wrong = guide.platform === 'ios' ? o.wrongIos : o.wrongAndroid;

  const copy = async () => {
    const ok = await copyText(window.location.href);
    setCopied(ok);
  };

  return (
    <div className="space-y-5">
      {!guide.rightBrowser && (
        <div className="rounded-2xl bg-surface p-4">
          <p className="text-sm text-text-primary">{wrong}</p>
          <button
            type="button"
            onClick={copy}
            className="mt-3 h-11 w-full rounded-xl bg-accent text-accent-contrast font-medium"
          >
            {copied ? o.copied : o.copyLink}
          </button>
        </div>
      )}
      <ol className="space-y-3">
        {steps.map((text, i) => (
          <li key={i} className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full bg-accent text-accent-contrast flex items-center justify-center text-xs font-bold">
              {i + 1}
            </span>
            <span className="text-sm text-text-secondary pt-0.5">{text}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function Onboarding({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const o = t.onboarding;
  const [steps] = useState<{ kind: StepKind; guide: InstallGuide | null }[]>(() => {
    const guide = installGuide();
    const rest: { kind: StepKind; guide: InstallGuide | null }[] = [
      { kind: 'welcome', guide: null },
      { kind: 'reminders', guide: null },
    ];
    return guide ? [{ kind: 'install', guide }, ...rest] : rest;
  });
  const [step, setStep] = useState(0);
  const current = steps[step];
  const last = step === steps.length - 1;

  const finish = () => {
    markOnboarded();
    onDone();
  };

  const title =
    current.kind === 'install'
      ? { before: o.installTitleBefore, accent: o.installTitleAccent, lede: o.installLede }
      : current.kind === 'welcome'
        ? { before: o.titleBefore, accent: o.titleAccent, lede: o.lede }
        : { before: o.remTitleBefore, accent: o.remTitleAccent, lede: o.remLede };

  return (
    <div className="fixed inset-0 z-50 bg-bg flex flex-col">
      <div className="flex items-center justify-between px-5 pt-6">
        <div className="flex gap-1.5" aria-label={`${step + 1} / ${steps.length}`}>
          {steps.map((_, i) => (
            <span key={i} className={`h-1.5 w-6 rounded-full ${i === step ? 'bg-accent' : 'bg-surface-hover'}`} />
          ))}
        </div>
        <button type="button" onClick={finish} className="px-3 h-10 text-sm text-text-secondary hover:text-text-primary">
          {o.skip}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto flex flex-col justify-center px-5 sm:px-8 max-w-xl w-full mx-auto py-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-text-primary leading-[1.05]">
          {title.before} <span className="text-accent-text">{title.accent}</span>
        </h1>
        <p className="mt-4 text-lg text-text-secondary">{title.lede}</p>

        {current.kind === 'install' && current.guide && (
          <div className="mt-8">
            <InstallStep guide={current.guide} />
          </div>
        )}

        {current.kind === 'welcome' && (
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
        {!last ? (
          <button type="button" onClick={() => setStep(step + 1)} className="h-12 rounded-2xl bg-accent text-accent-contrast font-semibold">
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
