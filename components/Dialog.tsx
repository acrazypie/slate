'use client';

import { useEffect, useRef } from 'react';
import { X } from 'lucide-react';

interface DialogProps {
  /** Accessible name, normally the same text as the visible heading. */
  label: string;
  onClose: () => void;
  /** 'form' for the editing modals, 'sheet' for the smaller pick-one menus. */
  size?: 'form' | 'sheet';
  /** Stacking order, for a dialog opened on top of another one. */
  zClass?: string;
  children: React.ReactNode;
}

const PANEL = {
  form: 'sm:max-w-md p-6 max-h-[90vh] sm:max-h-[80vh]',
  sheet: 'sm:max-w-sm p-5 max-h-[80vh]',
};

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The overlay shared by every modal and bottom sheet: a bottom sheet on phones,
 * a centred card from `sm` up. Closes on Escape or a click outside, keeps Tab
 * inside while open, and hands focus back to whatever opened it.
 */
export function Dialog({ label, onClose, size = 'form', zClass = 'z-50', children }: DialogProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const opener = document.activeElement as HTMLElement | null;
    const panel = panelRef.current;
    // An autoFocus field inside has already taken focus by now; otherwise take it.
    if (panel && !panel.contains(document.activeElement)) panel.focus();
    return () => {
      if (opener && document.contains(opener)) opener.focus();
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== 'Tab' || !panelRef.current) return;
    const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
    if (items.length === 0) {
      e.preventDefault();
      return;
    }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (e.shiftKey && (active === first || active === panelRef.current)) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  };

  return (
    <div
      className={`fixed inset-0 ${zClass} flex items-end sm:items-center justify-center bg-black/50`}
      onClick={onClose}
      onKeyDown={handleKeyDown}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        tabIndex={-1}
        className={`bg-surface rounded-t-2xl sm:rounded-2xl w-full mx-0 sm:mx-4 overflow-y-auto focus:outline-none ${PANEL[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/** The 44px close button every dialog header uses. */
export function DialogClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Chiudi"
      className="flex items-center justify-center w-11 h-11 -my-2 -mr-2 flex-shrink-0 rounded-xl hover:bg-surface-hover transition-colors"
    >
      <X className="w-5 h-5 text-text-secondary" />
    </button>
  );
}

/** A palette swatch with a 44px hit area around the 32px dot. */
export function ColorSwatch({
  color,
  name,
  selected,
  onSelect,
}: {
  color: string;
  name: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-label={name}
      aria-pressed={selected}
      title={name}
      className="flex items-center justify-center w-11 h-11 rounded-full"
    >
      <span
        className={`w-8 h-8 rounded-full transition-transform ${
          selected ? 'scale-110 ring-2 ring-text-primary ring-offset-2 ring-offset-surface' : ''
        }`}
        style={{ backgroundColor: color }}
      />
    </button>
  );
}
