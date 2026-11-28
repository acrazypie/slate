'use client';

// The web app's database, kept in this browser. Each table is a JSON array in
// localStorage (`slate-db:<table>`). It offers the subset of the query builder
// the app used when it talked to Supabase, so the data hooks read and write the
// same way: `await db.from('blocks').select('*').eq('id', id).single()`.
//
// Nothing here leaves the device. There are no accounts; the data belongs to
// the browser it was created in (Settings > Backup exports it as a file).

type Row = Record<string, any>;
export type DbResult = { data: any; error: { message: string; code?: string } | null };
type Filter = (row: Row) => boolean;
type Mode = 'select' | 'insert' | 'upsert' | 'update' | 'delete';
type Order = { col: string; ascending: boolean };

const PREFIX = 'slate-db:';
export const CHANGED_EVENT = 'slate-db-changed';

function readTable(name: string): Row[] {
  try {
    const raw = localStorage.getItem(PREFIX + name);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeTable(name: string, rows: Row[]) {
  localStorage.setItem(PREFIX + name, JSON.stringify(rows));
  // Lets the reminder sync (dashboard) upload the new items after any change.
  if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGED_EVENT));
}

function newId(): string {
  return typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** One clause of an `or()` expression, e.g. `recurrence_end_date.is.null` or `x.gte.2026-01-01`. */
function parseClause(clause: string): Filter {
  const [col, op, ...rest] = clause.split('.');
  const value = rest.join('.');
  switch (op) {
    case 'is':
      return (r) => (value === 'null' ? r[col] == null : String(r[col]) === value);
    case 'eq':
      return (r) => String(r[col]) === value;
    case 'gte':
      return (r) => r[col] != null && r[col] >= value;
    case 'lte':
      return (r) => r[col] != null && r[col] <= value;
    default:
      throw new Error(`Unsupported filter: ${clause}`);
  }
}

class Query implements PromiseLike<DbResult> {
  private mode: Mode = 'select';
  private filters: Filter[] = [];
  private payload: Row | Row[] | null = null;
  private conflictKey = 'id';
  private orderBy: Order | null = null;
  private wantSingle = false;
  private columns = '*';

  constructor(private readonly table: string) {}

  /** On a read this is the query itself; after a write it asks for the rows back. */
  select(columns?: string): this {
    if (columns) this.columns = columns;
    return this;
  }

  /**
   * Embeds related rows named in the select, e.g. `*, shift:shifts(*)`: the row's
   * `shift_id` picks the shift, which is attached as `shift`.
   */
  private embed(row: Row): Row {
    const embeds = [...this.columns.matchAll(/([a-z_]+):([a-z_]+)\(\*\)/g)];
    if (embeds.length === 0) return row;
    const out: Row = { ...row };
    for (const [, alias, table] of embeds) {
      out[alias] = readTable(table).find((t) => t.id === row[`${alias}_id`]) ?? null;
    }
    return out;
  }

  eq(col: string, value: unknown): this {
    this.filters.push((r) => r[col] === value);
    return this;
  }

  in(col: string, values: unknown[]): this {
    this.filters.push((r) => values.includes(r[col]));
    return this;
  }

  gte(col: string, value: string | number): this {
    this.filters.push((r) => r[col] != null && r[col] >= value);
    return this;
  }

  lte(col: string, value: string | number): this {
    this.filters.push((r) => r[col] != null && r[col] <= value);
    return this;
  }

  or(expression: string): this {
    const clauses = expression.split(',').map((c) => parseClause(c.trim()));
    this.filters.push((r) => clauses.some((f) => f(r)));
    return this;
  }

  order(col: string, opts?: { ascending?: boolean }): this {
    this.orderBy = { col, ascending: opts?.ascending !== false };
    return this;
  }

  insert(rows: Row | Row[]): this {
    this.mode = 'insert';
    this.payload = rows;
    return this;
  }

  upsert(rows: Row | Row[], opts?: { onConflict?: string }): this {
    this.mode = 'upsert';
    this.payload = rows;
    this.conflictKey = opts?.onConflict ?? 'id';
    return this;
  }

  update(patch: Row): this {
    this.mode = 'update';
    this.payload = patch;
    return this;
  }

  delete(): this {
    this.mode = 'delete';
    return this;
  }

  single(): this {
    this.wantSingle = true;
    return this;
  }

  then<T1 = DbResult, T2 = never>(
    onfulfilled?: ((value: DbResult) => T1 | PromiseLike<T1>) | null,
    onrejected?: ((reason: unknown) => T2 | PromiseLike<T2>) | null
  ): Promise<T1 | T2> {
    return Promise.resolve(this.execute()).then(onfulfilled, onrejected);
  }

  private execute(): DbResult {
    try {
      const rows = readTable(this.table);
      const matches = (r: Row) => this.filters.every((f) => f(r));
      const now = new Date().toISOString();
      let data: Row[];

      if (this.mode === 'select') {
        let out = rows.filter(matches);
        if (this.orderBy) {
          const { col, ascending } = this.orderBy;
          const dir = ascending ? 1 : -1;
          out = [...out].sort((a, b) => (a[col] > b[col] ? 1 : a[col] < b[col] ? -1 : 0) * dir);
        }
        data = out.map((r) => this.embed(r));
      } else if (this.mode === 'insert') {
        const incoming = (Array.isArray(this.payload) ? this.payload : [this.payload]) as Row[];
        const inserted = incoming.map((r) => ({ id: newId(), created_at: now, ...r }));
        writeTable(this.table, [...rows, ...inserted]);
        data = inserted;
      } else if (this.mode === 'upsert') {
        const incoming = (Array.isArray(this.payload) ? this.payload : [this.payload]) as Row[];
        const next = [...rows];
        const written: Row[] = [];
        for (const r of incoming) {
          const row: Row = { id: newId(), created_at: now, ...r };
          const at = next.findIndex((x) => x[this.conflictKey] === row[this.conflictKey]);
          if (at >= 0) next[at] = { ...next[at], ...row };
          else next.push(row);
          written.push(row);
        }
        writeTable(this.table, next);
        data = written;
      } else if (this.mode === 'update') {
        const patch = this.payload as Row;
        const changed: Row[] = [];
        const next = rows.map((r) => {
          if (!matches(r)) return r;
          const updated = { ...r, ...patch };
          changed.push(updated);
          return updated;
        });
        writeTable(this.table, next);
        data = changed;
      } else {
        data = rows.filter(matches);
        writeTable(this.table, rows.filter((r) => !matches(r)));
      }

      if (this.wantSingle) {
        const first = data[0];
        if (!first) return { data: null, error: { message: 'No rows found', code: 'PGRST116' } };
        return { data: first, error: null };
      }
      return { data, error: null };
    } catch (e) {
      return { data: null, error: { message: e instanceof Error ? e.message : 'Storage unavailable' } };
    }
  }
}

/** The on-device database. Use `db.from(table)` like the Supabase client it replaces. */
export const db = {
  from(table: string): Query {
    return new Query(table);
  },
};
