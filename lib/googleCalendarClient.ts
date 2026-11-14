'use client';

/**
 * Fire-and-forget: pushes to Google Calendar if the user has it connected,
 * silently no-ops otherwise (checked server-side). Never blocks the UI on a
 * slow or failed network call — the local Supabase write already succeeded.
 */
export function syncToGoogleCalendar(
  body: { action: 'upsert'; blockIds: string[] } | { action: 'delete'; eventIds: string[] }
) {
  fetch('/api/google-calendar/sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  }).catch(() => {});
}
