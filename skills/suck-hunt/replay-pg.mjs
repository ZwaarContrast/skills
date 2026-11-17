// Replays Postgres migrations into an in-memory PGlite and prints the state-like schema as TSV.
// Copy next to node_modules/@electric-sql/pglite, then: node replay-pg.mjs <migration.sql>...
import { readFileSync } from 'node:fs';
import { PGlite } from '@electric-sql/pglite';

const db = new PGlite();
const say = (...a) => console.error('#', ...a);
const EXISTS = new Set(['42P06', '42P07', '42710', '42723']); // already applied by the whole-file pass

// Splits on ; outside quotes, comments and $tag$ bodies.
function statements(sql) {
  const out = []; let start = 0, i = 0;
  while (i < sql.length) {
    const c = sql[i], rest = sql.slice(i);
    if (c === "'" && /[eE]$/.test(sql.slice(0, i))) { const m = /^'(?:\\.|[^'\\])*'/.exec(rest); i += m ? m[0].length : rest.length; continue; } // E'..\'..'
    if (c === "'" || c === '"') { i = sql.indexOf(c, i + 1) + 1 || sql.length; continue; }
    if (rest.startsWith('--')) { i = sql.indexOf('\n', i) + 1 || sql.length; continue; }
    if (rest.startsWith('/*')) { i = sql.indexOf('*/', i) + 2 || sql.length; continue; }
    const tag = /^\$(?:[A-Za-z_][A-Za-z0-9_]*)?\$/.exec(rest);
    if (tag) { const end = sql.indexOf(tag[0], i + tag[0].length); i = end < 0 ? sql.length : end + tag[0].length; continue; }
    if (c === ';') { out.push(sql.slice(start, i)); start = i + 1; }
    i++;
  }
  out.push(sql.slice(start));
  return out;
}

const bare = s => s.replace(/^(\s*(--[^\n]*\n|\/\*[\s\S]*?\*\/))*\s*/, '').trim();

for (const f of process.argv.slice(2)) {
  const sql = readFileSync(f, 'utf8')
    .split(/^--\s*(?:migrate:down|\+goose\s+down|down migration)/im)[0] // up section only
    .replace(/^copy\b[^;]*\bfrom\s+stdin;[\s\S]*?^\\\.[ \t]*$/gim, '')   // pg_dump data blocks
    .replace(/^copy\b[^;]*\bprogram\b[^;]*;/gim, '');
  try { await db.exec(sql); continue; } catch { await db.exec('ROLLBACK').catch(() => {}); }
  for (const stmt of statements(sql)) {
    const s = bare(stmt);
    if (!s || /^(begin|commit|start transaction|end)\b[^;]*$/i.test(s)) continue;
    try { await db.exec(stmt); } catch (e) {
      await db.exec('ROLLBACK').catch(() => {});
      if (EXISTS.has(e.code)) continue;
      // an extension's type (PostGIS geometry) becomes text, so its table still exists
      const type = /type "(?:\w+\.)?(\w+)" does not exist/.exec(e.message)?.[1];
      const retry = type && stmt.replace(new RegExp(`\\b(\\w+\\.)?${type}\\b(\\s*\\([^)]*\\))?`, 'g'), 'text');
      if (retry && await db.exec(retry).then(() => true, () => db.exec('ROLLBACK').catch(() => {}))) { say(`${f}: ${type} read as text`); continue; }
      say(`${f}: ${String(e.message).split('\n')[0]}`);
    }
  }
}

const SYS = "('pg_catalog','information_schema','pg_toast')";
const query = `
SELECT CASE WHEN c.table_schema='public' THEN c.table_name ELSE c.table_schema||'.'||c.table_name END, c.column_name, c.data_type, coalesce(c.column_default,'')
FROM information_schema.columns c JOIN information_schema.tables t USING (table_schema, table_name)
WHERE c.table_schema NOT IN ${SYS} AND t.table_type='BASE TABLE' AND c.table_name <> 'spatial_ref_sys'
  AND (c.column_name ~* '(status|state|phase|stage|step|mode)$|^(is|has|can)_|_at$' AND c.column_name NOT IN ('created_at','updated_at') OR c.data_type='boolean' OR c.udt_name IN (SELECT typname FROM pg_type WHERE typtype='e'))
UNION ALL
SELECT conrelid::regclass::text, '(check)', '', pg_get_constraintdef(oid) FROM pg_constraint
WHERE contype='c' AND conrelid <> 0 AND connamespace NOT IN (SELECT oid FROM pg_namespace WHERE nspname IN ${SYS}) AND conrelid::regclass::text <> 'spatial_ref_sys'
UNION ALL
SELECT t.typname, '(enum)', '', string_agg(e.enumlabel, ',' ORDER BY e.enumsortorder) FROM pg_type t JOIN pg_enum e ON e.enumtypid=t.oid GROUP BY t.typname
UNION ALL
SELECT CASE WHEN schemaname='public' THEN tablename ELSE schemaname||'.'||tablename END, '(partial index)', '', indexdef FROM pg_indexes WHERE schemaname NOT IN ${SYS} AND indexdef ~* ' where '
ORDER BY 1,2`;
for (const r of (await db.query(query)).rows) console.log(Object.values(r).join('\t'));
