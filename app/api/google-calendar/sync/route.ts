import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getValidAccessToken, upsertGoogleEvent, deleteGoogleEvent } from '@/lib/googleCalendar';
import { dateForWeekOffset } from '@/lib/recurrence';
import { Block } from '@/lib/types';

/**
 * Pushes Slate blocks to the user's connected Google Calendar. One-way
 * (Slate -> Google) only. Silently no-ops if the user hasn't connected
 * Google Calendar — this endpoint is fired on every block mutation
 * regardless, so callers don't need to check connection status themselves.
 */
export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const body = await request.json();
  const action: 'upsert' | 'delete' = body.action;

  const auth = await getValidAccessToken(supabase, user.id);
  if (!auth) {
    // Not connected (or refresh failed) - nothing to do.
    return NextResponse.json({ skipped: true });
  }

  if (action === 'delete') {
    const eventIds: string[] = body.eventIds || [];
    const results = await Promise.all(
      eventIds.map((id) => deleteGoogleEvent(auth.accessToken, auth.calendarId, id))
    );
    return NextResponse.json({ ok: true, deleted: results.filter(Boolean).length });
  }

  if (action === 'upsert') {
    const blockIds: string[] = body.blockIds || [];
    if (blockIds.length === 0) return NextResponse.json({ ok: true, synced: 0 });

    const { data: blocks, error } = await supabase
      .from('blocks')
      .select('*')
      .in('id', blockIds)
      .eq('user_id', user.id);

    if (error || !blocks) {
      return NextResponse.json({ error: 'Could not load blocks' }, { status: 400 });
    }

    let synced = 0;
    for (const block of blocks as Block[]) {
      let exceptionDates: Date[] = [];
      if (block.is_recurring) {
        const { data: exceptions } = await supabase
          .from('block_exceptions')
          .select('occurrence_week_offset')
          .eq('block_id', block.id);
        exceptionDates = (exceptions || []).map((e) =>
          dateForWeekOffset(e.occurrence_week_offset, block.day_of_week)
        );
      }

      const eventId = await upsertGoogleEvent(auth.accessToken, auth.calendarId, block, exceptionDates);
      if (eventId && eventId !== block.google_event_id) {
        await supabase.from('blocks').update({ google_event_id: eventId }).eq('id', block.id);
      }
      if (eventId) synced++;
    }

    return NextResponse.json({ ok: true, synced });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
