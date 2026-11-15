'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { format } from 'date-fns';
import { fetchGoogleEvents } from '@/lib/googleCalendarClient';
import { GoogleEvent } from '@/lib/types';

interface Options {
  /** False skips loading, for a view that isn't showing this range. */
  enabled?: boolean;
  /**
   * Called when loading found that events created in Slate were changed in
   * Google Calendar and have been updated, so whoever holds them can reload.
   */
  onBlocksChanged?: () => void;
}

/**
 * The events from the user's Google calendars between two days (inclusive).
 * Empty when Google Calendar isn't connected. Reloads when the tab comes back
 * into view, which is when a change made in Google is most likely waiting.
 */
export function useGoogleEvents(rangeStart: Date, rangeEnd: Date, { enabled = true, onBlocksChanged }: Options = {}) {
  const [events, setEvents] = useState<GoogleEvent[]>([]);
  const fromKey = format(rangeStart, 'yyyy-MM-dd');
  const toKey = format(rangeEnd, 'yyyy-MM-dd');

  const onBlocksChangedRef = useRef(onBlocksChanged);
  useEffect(() => {
    onBlocksChangedRef.current = onBlocksChanged;
  }, [onBlocksChanged]);

  // Only the latest request may set the events: an older one can finish later.
  const latestRequest = useRef(0);

  const refetch = useCallback(async () => {
    if (!enabled) return;
    const request = ++latestRequest.current;
    const result = await fetchGoogleEvents(fromKey, toKey);
    if (request !== latestRequest.current || !result) return;
    setEvents(result.connected ? result.events : []);
    if (result.blocksChanged) onBlocksChangedRef.current?.();
  }, [enabled, fromKey, toKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible') refetch();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, [refetch]);

  return { events, refetch };
}
