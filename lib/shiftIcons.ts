// The icons a shift can have. Each shift has one; a shift without one (made before
// icons existed) shows the default, the day icon.

import { Sun, Sunrise, Sunset, Moon, Clock, type LucideIcon } from 'lucide-react';

export const SHIFT_ICON_KEYS = ['day', 'early', 'afternoon', 'night', 'flexible'] as const;
export type ShiftIconKey = (typeof SHIFT_ICON_KEYS)[number];
export const DEFAULT_SHIFT_ICON: ShiftIconKey = 'day';

export const SHIFT_ICONS: Record<ShiftIconKey, LucideIcon> = {
  day: Sun,
  early: Sunrise,
  afternoon: Sunset,
  night: Moon,
  flexible: Clock,
};

export function normalizeShiftIcon(value: unknown): ShiftIconKey {
  return (SHIFT_ICON_KEYS as readonly string[]).includes(value as string) ? (value as ShiftIconKey) : DEFAULT_SHIFT_ICON;
}

export function shiftIconOf(value: unknown): LucideIcon {
  return SHIFT_ICONS[normalizeShiftIcon(value)];
}
