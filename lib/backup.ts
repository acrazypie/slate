'use client';

// Backup: export the account's blocks, shifts, placements and rotations as one
// JSON file (the same envelope as the Android app), and import one back. Import
// replaces the current data after the user confirms, and is checked before
// anything is deleted.

import { db } from './localDb';
import { KEYS_FOR_BACKUP, readPortableSettings, applyPortableSettings } from './backupSettings';

export const BACKUP_FORMAT = 1;
const SCHEMA_VERSION = 4;
const CATEGORIES = ['studio', 'lavoro', 'lezione', 'altro'];
const CHUNK = 500;

export interface BackupCounts {
  blocks: number;
  shifts: number;
  assignments: number;
  rotations: number;
}

type Row = Record<string, unknown>;

export async function exportBackup(): Promise<{ name: string; text: string; counts: BackupCounts }> {
  const [blocksRes, exceptionsRes, shiftsRes, assignmentsRes, rotationsRes] = await Promise.all([
    db.from('blocks').select('*'),
    db.from('block_exceptions').select('block_id, occurrence_week_offset'),
    db.from('shifts').select('*'),
    db.from('shift_assignments').select('id, shift_id, shift_date'),
    db.from('rotations').select('*'),
  ]);
  for (const res of [blocksRes, exceptionsRes, shiftsRes, assignmentsRes, rotationsRes]) {
    if (res.error) throw new Error(res.error.message);
  }

  const skipped = new Map<string, number[]>();
  for (const ex of (exceptionsRes.data ?? []) as Row[]) {
    const id = String(ex.block_id);
    skipped.set(id, [...(skipped.get(id) ?? []), Number(ex.occurrence_week_offset)]);
  }

  const blocks = ((blocksRes.data ?? []) as Row[]).map((b) => {
    const { user_id: _user, google_event_id: _g, google_updated_at: _u, ...rest } = b;
    void _user; void _g; void _u;
    const out: Row = { ...rest };
    if (skipped.has(String(b.id))) out.skipped_weeks = skipped.get(String(b.id));
    return out;
  });
  const shifts = ((shiftsRes.data ?? []) as Row[]).map(({ user_id: _user, ...rest }) => {
    void _user;
    return rest;
  });
  const rotations = ((rotationsRes.data ?? []) as Row[]).map(({ user_id: _user, ...rest }) => {
    void _user;
    return { ...rest, updated_at: rest.created_at };
  });

  const file = {
    app: 'slate',
    format: BACKUP_FORMAT,
    exportedAt: new Date().toISOString(),
    data: {
      schemaVersion: SCHEMA_VERSION,
      blocks,
      shifts,
      assignments: assignmentsRes.data ?? [],
      rotations,
      settings: readPortableSettings(),
    },
  };
  const day = new Date().toISOString().slice(0, 10);
  return {
    name: `slate-backup-${day}.json`,
    text: JSON.stringify(file, null, 2),
    counts: { blocks: blocks.length, shifts: shifts.length, assignments: (assignmentsRes.data ?? []).length, rotations: rotations.length },
  };
}

export type ParsedBackup =
  | { ok: true; counts: BackupCounts; blocks: Row[]; exceptions: { block_id: string; occurrence_week_offset: number }[]; shifts: Row[]; assignments: Row[]; rotations: Row[]; settings: Row | null }
  | { ok: false; error: 'notJson' | 'notSlate' | 'invalid' };

const isObj = (v: unknown): v is Row => typeof v === 'object' && v !== null && !Array.isArray(v);
const int = (v: unknown, min: number, max: number) => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;
const str = (v: unknown) => typeof v === 'string' && v.length > 0;

/** Checks the file before anything is changed. Returns the rows the import would write. */
export function parseBackup(text: string): ParsedBackup {
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return { ok: false, error: 'notJson' };
  }
  if (!isObj(json) || json.app !== 'slate' || !isObj(json.data)) return { ok: false, error: 'notSlate' };
  const d = json.data;
  if (!Array.isArray(d.blocks) || !Array.isArray(d.shifts) || !Array.isArray(d.assignments)) return { ok: false, error: 'invalid' };
  const rotationsIn = Array.isArray(d.rotations) ? d.rotations : [];

  const shiftIds = new Set<string>();
  const shifts: Row[] = [];
  for (const s of d.shifts) {
    if (!isObj(s) || !str(s.id) || !str(s.title) || !int(s.start_hour, 0, 23) || !int(s.start_minute, 0, 59) || !int(s.end_hour, 0, 23) || !int(s.end_minute, 0, 59)) {
      return { ok: false, error: 'invalid' };
    }
    shiftIds.add(s.id as string);
    shifts.push({
      id: s.id,
      title: s.title,
      start_hour: s.start_hour,
      start_minute: s.start_minute,
      end_hour: s.end_hour,
      end_minute: s.end_minute,
      break_minutes: int(s.break_minutes, 0, 240) ? s.break_minutes : 0,
      color: str(s.color) ? s.color : '#6BB6A3',
    });
  }

  const blocks: Row[] = [];
  const exceptions: { block_id: string; occurrence_week_offset: number }[] = [];
  for (const b of d.blocks) {
    if (!isObj(b) || !str(b.id) || !str(b.title) || !CATEGORIES.includes(String(b.category)) || !int(b.day_of_week, 0, 6) || !int(b.start_hour, 0, 23) || !int(b.start_minute, 0, 59) || !int(b.duration_minutes, 1, 1440) || !int(b.week_offset, -100000, 100000)) {
      return { ok: false, error: 'invalid' };
    }
    blocks.push({
      id: b.id,
      title: b.title,
      category: b.category,
      color: str(b.color) ? b.color : '#6366f1',
      day_of_week: b.day_of_week,
      start_hour: b.start_hour,
      start_minute: b.start_minute,
      duration_minutes: b.duration_minutes,
      week_offset: b.week_offset,
      notes: typeof b.notes === 'string' ? b.notes : null,
      is_recurring: b.is_recurring === true,
      recurrence_type: b.recurrence_type === 'weekly' || b.recurrence_type === 'monthly' ? b.recurrence_type : null,
      recurrence_end_date: typeof b.recurrence_end_date === 'string' ? b.recurrence_end_date : null,
      recurrence_group_id: typeof b.recurrence_group_id === 'string' ? b.recurrence_group_id : null,
    });
    if (Array.isArray(b.skipped_weeks)) {
      for (const w of b.skipped_weeks) {
        if (int(w, -100000, 100000)) exceptions.push({ block_id: b.id as string, occurrence_week_offset: w as number });
      }
    }
  }

  const assignments: Row[] = [];
  for (const a of d.assignments) {
    if (!isObj(a) || !str(a.id) || !str(a.shift_id) || !shiftIds.has(a.shift_id as string) || typeof a.shift_date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(a.shift_date)) {
      return { ok: false, error: 'invalid' };
    }
    assignments.push({ id: a.id, shift_id: a.shift_id, shift_date: a.shift_date });
  }

  const rotations: Row[] = [];
  for (const r of rotationsIn) {
    if (!isObj(r) || !str(r.id) || !str(r.title) || !Array.isArray(r.pattern)) return { ok: false, error: 'invalid' };
    const pattern = r.pattern as unknown[];
    const patternOk =
      pattern.length >= 2 &&
      pattern.length <= 28 &&
      pattern.every((p) => p === null || (typeof p === 'string' && shiftIds.has(p)));
    if (!patternOk) return { ok: false, error: 'invalid' };
    rotations.push({ id: r.id, title: String(r.title).slice(0, 100), pattern });
  }

  return {
    ok: true,
    counts: { blocks: blocks.length, shifts: shifts.length, assignments: assignments.length, rotations: rotations.length },
    blocks,
    exceptions,
    shifts,
    assignments,
    rotations,
    settings: isObj(d.settings) ? d.settings : null,
  };
}

async function insertChunks(table: string, rows: Row[]) {
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await db.from(table).insert(rows.slice(i, i + CHUNK));
    if (error) throw new Error(error.message);
  }
}

async function deleteAllOwn() {
  // Blocks cascade to their exceptions, and shifts to their placements.
  for (const table of ['shift_assignments', 'block_exceptions', 'blocks', 'rotations', 'shifts']) {
    const { error } = await db.from(table).delete();
    if (error) throw new Error(error.message);
  }
}

/** Replaces the account's blocks, shifts, placements and rotations with the file's. */
export async function importBackup(parsed: Extract<ParsedBackup, { ok: true }>) {
  await deleteAllOwn();
  const own = (rows: Row[]) => rows;
  await insertChunks('shifts', own(parsed.shifts));
  await insertChunks('blocks', own(parsed.blocks));
  await insertChunks('block_exceptions', parsed.exceptions);
  await insertChunks('shift_assignments', own(parsed.assignments));
  await insertChunks('rotations', own(parsed.rotations));
  if (parsed.settings) applyPortableSettings(parsed.settings);
}

/** Deletes every block, shift, placement and rotation; keeps the device settings. */
export async function eraseAll() {
  await deleteAllOwn();
}

export { KEYS_FOR_BACKUP };
