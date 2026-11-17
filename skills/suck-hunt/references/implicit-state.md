# Tracing implicit state

Read this when you work an implicit-state lead (SKILL.md step 3). A trace
turns a pile of state into a table, and the table into defects. Two hunters
following it should draw the same table.

## Schema

A schema dump in the repository (`structure.sql`, `schema.rb`,
`schema.prisma`) is the schema: `state-schema.txt` already covers it. A
schema that exists only as SQL migrations reads best from the engine
itself — real defaults, every `CHECK`, enums, partial indexes — replayed
into a database the run creates and then removes. Nothing leaves the
machine and nothing is installed:

- **SQLite**: `sqlite3 "$H/schema.db"` reading the migrations in order,
  then `.schema` grepped for status, flag and timestamp columns.
- **Postgres**: only with the project's own image already local (`docker
  image inspect <image>` from its compose file succeeds); never pull one
  without asking. Run it with `--rm`, replay the migrations in order with
  `psql -q -f`, then `psql -AtF "<tab>" -f <skill-dir>/state-schema.pg.sql
  > "$H/state-schema-db.txt"`, and stop it. Replay errors go in the
  report: a failed statement means the schema is partial.

Otherwise the grep lead is what there is.

## Budget

Work the top three leads by count, holders and stores before schema and
fields; the report's coverage line names the leads left unworked. A lead
names a component, file or table, which can hold several machines.

## 1. Pieces

List the lead's pieces: state, refs and module variables; for a record, a
CRDT value or a table, one per field — and of a table only the columns
something reads to decide (a status, a `deleted_at`, an `is_active`), not
`label` or `nav_date`. `updated_at` is a piece only where something decides
on it (a lease, a timeout). A derived value is traced through its source.
One piece kept in two stores (a row, its cache, a browser copy, an outbox
row and its queue message) counts as two.

## 2. Scope

Start from the piece the most conditions decide on. Add a piece when one
event sets both (resetting to the row-0 value does not count) or one
condition decides on both whether something exists or runs. Stop at the
smallest set that shows a defect, eight pieces at most, then start again
from the next piece not yet in a machine. A piece that joins nothing is
closed without a table.

## 3. Writes

Grep each piece's name, its setter with and without `(`, and every alias or
prop it is passed on as. State with one shared writer (`this.setState`, a
store, a CRDT map's `set`) is traced by field name; a dispatch is a write.
In storage the writes are `INSERT`, `UPDATE`, `DELETE` and upserts (`ON
CONFLICT`), a soft delete, an ORM save, update or delete, and bulk updates
(`QuerySet.update`, `update_all`, raw SQL) — which skip model-level guards
such as django-fsm or AASM; `setItem` and `removeItem`; `document.cookie`
and `Set-Cookie`; Redis `SET`, `SETNX`, `HSET`, `HDEL`, `INCR`, `DEL` and
`EXPIRE`. A row's absence can be a state: a job done by `DELETE` is a
transition. SQL built at runtime (`SET ${updates}`) is read, not grepped.

## 4. Table

With lines: `event → fires in → checks → writes`.

- **Row 0** is initialisation: URL, storage, props, defaults.
- **Fires in** is the states the trigger is reachable in, a request still
  in flight counting as a state, plus other clients, other tabs (the
  `storage` event; not for `sessionStorage`, which is per tab), jobs and
  queue workers, and keys that expire. Servers and workers run as more than
  one process unless the deploy config pins one; the same code on another
  process or client is another writer. Migrations and hand edits are not
  events: they only decide where a guard has to live (step 7).
- **Checks** is what is true when the write runs, the render gate included.
- **Splits**: a handler splits at every `await`, `yield*`, callback,
  request and setter call. A setter's new value shows only after the next
  render, and setting the same value again re-runs no effect. Inside a
  transaction that locks the rows it reads (`SELECT … FOR UPDATE`,
  serializable) there is no split. After a split nothing is checked unless
  it is checked again.

## 5. Defects

Read off the table:

- **unguarded** — a write before any split whose *fires in* holds a state
  its *checks* do not exclude, and it is wrong there;
- **stale** — a write after a split relies on something that can change in
  the window, across requests and processes too;
- **left behind** — an event changes one piece and leaves another its gate
  reads, or a piece is read and never cleared;
- **lost write** — a write replaces a whole record other writers also
  change;
- **stuck** — a state with no way out the user or caller needs.

None counts where a test asserts the behaviour or a comment says why it is
harmless; a bad state you reproduced is never excused. An effect that
writes one piece from another is a lead, and a defect only when something
else writes that piece too.

## 6. Verdict

The exact events that reach a bad state are an exact input: the finding is
**broken**, banded by step 5 like any bug, with "implicit state" in the
write-up. Run them where step 1 allows — a test or script in `$H/copy`
(dependencies installed there with `--ignore-scripts`; a component test
renders with testing-library added there), or `ux-suck-hunt`'s browser —
never against a database the run did not create. Move what you keep into
`$H` before the copy goes, and say whether you ran it.

A machine with no defect in any of its pieces is **implicit state**, slow,
only when the state is read to decide something and `git log -G'<a write
of it>'` (`SET status`, `.status =`, the setter's name) shows one commit
changing two or more of its write sites; name the commit. Otherwise drop
it.

## 7. Fix

Use what the manifest already has (XState, django-fsm, AASM, transitions)
before writing one. Otherwise:

- one type for the state — a union, an enum with `match`, a Go typed
  constant that `exhaustive` checks — and one transition function that
  rejects a move the table does not allow, with the table beside it; in Go,
  behind a mutex or one goroutine;
- **values are guarded in the store**, where a second service or a hand
  edit cannot skip it: an enum type or `CHECK` for allowed values, a `CHECK`
  across columns for combinations (`status <> 'shipped' OR shipped_at IS
  NOT NULL`, the fix for a *left behind* row), a partial unique index for
  one-per-owner rules;
- **moves are guarded by the write**: `UPDATE … WHERE status = ?` with the
  affected rows checked; a trigger comparing `OLD` and `NEW` only as a last
  resort, fix risk high, since it is a machine the app cannot see. In
  Redis, `WATCH`/`MULTI` or one Lua script for check-then-set;
- a whole-record write becomes an update of the changed fields, or checks a
  version; a browser copy carries a version and is validated at row 0;
- synced (CRDT) state stores the facts and derives the status from them,
  repairing an illegal merged state in one function.

A library only past about eight states, or nested or parallel ones. A
`string` status with no transitions spread around is **typing**.
