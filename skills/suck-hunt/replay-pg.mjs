// Replays Postgres migrations into an in-memory PGlite and prints the state-like schema as TSV.
// Usage: node replay-pg.mjs <dir holding node_modules/@electric-sql/pglite> <migration.sql>...
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const [prefix, ...files] = process.argv.slice(2);
const { PGlite } = await import(pathToFileURL(join(prefix, 'node_modules/@electric-sql/pglite/dist/index.js')).href);
const db = new PGlite();
const say = (...a) => console.error('#', ...a);

// Splits on ; outside quotes, comments and $tag$ bodies.
function statements(sql) {
  const out = []; let start = 0, i = 0;
  while (i < sql.length) {
    const c = sql[i], rest = sql.slice(i);
    if (c === "'" && /[eE]$/.test(sql.slice(0, i))) { const m = /^'(?:\\.|[^'\\])*'/.exec(rest); i += m ? m[0].length : rest.length; continue; } // E'..\'..'
    if (c === "'" || c === '"') { i = sql.indexOf(c, i + 1) + 1 || sql.length; continue; }
    if (rest.startsWith('--')) { i = sql.indexOf('\n', i) + 1 || sql.length; continue; }
    if (rest.startsWith('/*')) { i = sql.indexOf('*/', i) + 2 || sql.length; continue; }
    const tag = /^\$[A-Za-z_]*\$/.exec(rest);
    if (tag) { i = sql.indexOf(tag[0], i + tag[0].length) + tag[0].length; if (i < tag[0].length) i = sql.length; continue; }
    if (c === ';') { out.push(sql.slice(start, i)); start = i + 1; }
    i++;
  }
  out.push(sql.slice(start));
  return out;
}

for (const f of files) {
  const sql = readFileSync(f, 'utf8').split(/^--\s*(migrate:down|\+goose\s+down|down migration)/im)[0]; // up section only
  try { await db.exec(sql); continue; } catch { await db.exec('ROLLBACK').catch(() => {}); }
  for (const stmt of statements(sql)) {
    if (!stmt.trim() || /^\s*(begin|commit|start transaction)\s*$/i.test(stmt)) continue;
    try { await db.exec(stmt); } catch (e) {
      await db.exec('ROLLBACK').catch(() => {});
      // an extension's type (PostGIS geometry) becomes text, so its table still exists
      const type = /type "(?:\w+\.)?(\w+)" does not exist/.exec(e.message)?.[1];
      const retry = type && stmt.replace(new RegExp(`\\b(\\w+\\.)?${type}\\b(\\s*\\([^)]*\\))?`, 'g'), 'text');
      if (retry && await db.exec(retry).then(() => true, () => db.exec('ROLLBACK').catch(() => {}))) { say(`${f}: ${type} read as text`); continue; }
      say(`${f}: ${String(e.message).split('\n')[0]}`);
    }
  }
}

const query = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'state-schema.pg.sql'), 'utf8');
for (const r of (await db.query(query)).rows) console.log(Object.values(r).join('\t'));
