'use client';

import { GoogleCalendar, GoogleEvent, GoogleEventChanges, GoogleEventScope } from './types';

// Pushes run one after the other. Two quick edits of a new event would
// otherwise both find it without a Google id yet and create it twice.
let pushes: Promise<unknown> = Promise.resolve();

/**
 * Fire-and-forget: pushes to Google Calendar if the user has it connected,
 * silently no-ops otherwise (checked server-side). Never blocks the UI on a
 * slow or failed network call — the local Supabase write already succeeded.
 */
export function syncToGoogleCalendar(
  body: { action: 'upsert'; blockIds: string[] } | { action: 'delete'; eventIds: string[] }
) {
  pushes = pushes
    .then(() =>
      fetch('/api/google-calendar/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
    )
    .catch(() => {});
}

/**
 * Loads the Google side of the calendar for a range of days ('yyyy-MM-dd').
 * Waits for pushes still on their way first: reading Google while an edit made
 * in Slate hasn't arrived there yet would bring the old version back.
 */
export async function fetchGoogleEvents(
  from: string,
  to: string
): Promise<{ connected: boolean; events: GoogleEvent[]; blocksChanged: boolean } | null> {
  await pushes;
  try {
    const res = await fetch(`/api/google-calendar/events?from=${from}&to=${to}`, { cache: 'no-store' });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

export async function fetchGoogleCalendars(): Promise<{
  connected: boolean;
  calendars: GoogleCalendar[];
  needsReconnect?: boolean;
} | null> {
  try {
    const res = await fetch('/api/google-calendar/calendars', { cache: 'no-store' });
    return res.ok ? await res.json() : null;
  } catch {
    return null;
  }
}

async function writeGoogleEvent(method: 'PATCH' | 'DELETE', body: unknown): Promise<boolean> {
  try {
    const res = await fetch('/api/google-calendar/events', {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/** Saves an edit to an event that lives in Google Calendar. False if Google refused it. */
export function updateGoogleEvent(event: GoogleEvent, changes: GoogleEventChanges, scope: GoogleEventScope) {
  return writeGoogleEvent('PATCH', { calendarId: event.calendarId, eventId: event.id, scope, changes });
}

export function deleteGoogleEvent(event: GoogleEvent, scope: GoogleEventScope) {
  return writeGoogleEvent('DELETE', { calendarId: event.calendarId, eventId: event.id, scope });
}
