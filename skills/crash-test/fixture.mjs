#!/usr/bin/env node
// A deliberately awful page, and a calibration run against it.
//
//   node fixture.mjs           serve it on a free port, to look at by hand
//   node fixture.mjs --check   serve it, run probe.js and profile.js against it,
//                              and assert every instrument still reports the
//                              fault it is supposed to catch
//
// This exists because a measuring instrument that quietly stops measuring is
// worse than no instrument: the agent reports "no findings" and everyone
// believes it. Chromium renames trace categories and CDP fields between
// versions. Run --check before trusting a run against real code.
//
// Nothing here takes a fixed port, temp dir or browser session: two runs at
// once must not fight over a name, and a busy port must never be mistaken for
// the fixture.
//
// The faults planted below, and who should catch each one:
//   3 identical fetches per click ......... report.repeated
//   2 identical GraphQL ops + 1 different . report.repeated (by operation, not URL)
//   a 1s poller nobody clears ............. report.polling + report.liveIntervals
//   a 1.5s endpoint ....................... report.slowest
//   read-after-write layout thrash ........ profile.work.layouts, .why, .hot
//   detached nodes + listeners kept ....... profile.retained (post-GC)
//   a 250ms long task on load ............. report.blocking, vitals.tbtMs
//   an unsized image dropped in late ...... vitals.cls
//   one asset with max-age, rest without .. report.cache
import { createServer } from 'node:http';
import { execFileSync, spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';
import { mkdtempSync, copyFileSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const PAGE = `<!doctype html><meta charset=utf-8><title>Crash test fixture</title>
<style>body{font:14px system-ui;padding:2rem}.row{padding:4px;border-bottom:1px solid #ddd}</style>
<h1>Crash test fixture</h1>
<button id=add>Add rows</button>
<button id=search>Search</button>
<div id=list></div>
<script>
const leaked = [];
document.getElementById('add').addEventListener('click', () => {
  for (let i = 0; i < 200; i++) {
    const d = document.createElement('div');
    d.className = 'row';
    d.textContent = 'row ' + i + ' ' + 'x'.repeat(200);
    d.addEventListener('click', () => console.log(leaked.length));
    leaked.push(d);                                    // detached, never freed
    document.getElementById('list').appendChild(d.cloneNode(true));
  }
  document.querySelectorAll('.row').forEach(el => {    // read-after-write: forced layout
    el.style.paddingLeft = (el.offsetHeight % 5) + 'px';
  });
});
document.getElementById('search').addEventListener('click', () => {
  fetch('/api/user'); fetch('/api/user'); fetch('/api/user');   // same thing, three times
  fetch('/api/slow');
  const gql = b => fetch('/graphql', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b) });
  gql({ operationName: 'GetUser', query: 'query GetUser { me { id } }' });
  gql({ operationName: 'GetUser', query: 'query GetUser { me { id } }' });
  gql({ operationName: 'GetPosts', query: 'query GetPosts { posts { id } }' });
});
setInterval(() => fetch('/api/user'), 1000);                    // nobody clears this
const t0 = performance.now(); while (performance.now() - t0 < 250) {}  // long task
setTimeout(() => { const i = document.createElement('img'); i.src = '/img'; i.width = 400; document.body.prepend(i); }, 800);
</script>`;

const serve = () => createServer(async (req, res) => {
  const url = (req.url || '').split('?')[0];
  if (url === '/api/slow') { await new Promise(r => setTimeout(r, 1500)); res.end('{"slow":true}'); return; }
  if (url === '/api/user') { res.setHeader('content-type', 'application/json'); res.end(JSON.stringify({ id: 1, pad: 'y'.repeat(5000) })); return; }
  if (url === '/graphql') { res.setHeader('content-type', 'application/json'); res.end('{"data":{}}'); return; }
  if (url === '/img') {
    res.setHeader('content-type', 'image/svg+xml');
    res.setHeader('cache-control', 'max-age=3600');   // the one cacheable asset
    res.end('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="200"><rect width="400" height="200" fill="tomato"/></svg>');
    return;
  }
  res.setHeader('content-type', 'text/html'); res.end(PAGE);
  // port 0 unless asked otherwise: a fixed port would either collide with
  // whatever else is running or, worse, quietly measure it instead
}).listen(Number(process.env.PORT || 0));

if (!process.argv.includes('--check')) {
  const s = serve();
  s.on('listening', () => console.log(`fixture on http://localhost:${s.address().port}`));
} else {
  // The server runs in its own process: execFileSync below blocks this event
  // loop, so an in-process server would never answer the browser. It picks its
  // own free port and tells us which — never assume a port is ours to take.
  const server = spawn(process.execPath, [fileURLToPath(import.meta.url)], { stdio: ['ignore', 'pipe', 'inherit'] });
  const APP = await new Promise((resolve, reject) => {
    let buf = '';
    const t = setTimeout(() => reject(new Error('fixture did not start')), 15000);
    server.stdout.on('data', d => {
      buf += d;
      const m = buf.match(/http:\/\/localhost:\d+/);
      if (m) { clearTimeout(t); resolve(m[0]); }
    });
  });

  const here = new URL('.', import.meta.url).pathname;
  // Work from a private scratch dir: playwright-cli drops .playwright-cli/ in
  // its cwd, and `run-code --filename=` refuses to read anything outside that
  // cwd — so profile.js has to be copied in. (addInitScript's path is not
  // restricted.) mkdtemp, not a fixed name: concurrent runs must not share it.
  const work = mkdtempSync(join(tmpdir(), 'crash-test-'));
  const session = 'ct' + work.slice(-6);
  copyFileSync(here + 'profile.js', join(work, 'profile.js'));
  const cli = (...a) => execFileSync('playwright-cli', [`-s=${session}`, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'], cwd: work });
  const json = s => { const v = JSON.parse(s.trim()); return typeof v === 'string' ? JSON.parse(v) : v; };

  const checks = [];
  const ok = (name, pass, saw) => { checks.push({ name, pass, saw }); };

  try { execFileSync('playwright-cli', ['--version'], { stdio: 'ignore' }); }
  catch { console.error('playwright-cli not found — install it with: npm i -g @playwright/cli'); process.exit(2); }

  try {
    try { cli('close'); } catch {}
    cli('open');
    cli('run-code', `async page => {
      await page.addInitScript({ path: ${JSON.stringify(here + 'probe.js')} });
      await page.goto(${JSON.stringify(APP)});
      await page.waitForTimeout(1200);
      await page.reload();            // second load: the cacheable asset should now hit cache
      await page.waitForTimeout(1200);
      await page.click('#search');
      await page.waitForTimeout(2600);
    }`);

    // make sure we are measuring the fixture and not whatever else answered
    const title = json(cli('--raw', 'eval', 'JSON.stringify(document.title)'));
    ok('the fixture is what answered', title === 'Crash test fixture', title);

    const con = cli('console');
    ok('probe installs without throwing', /Errors: 0/.test(con), con.match(/Total messages.*/)?.[0]);

    const r = json(cli('--raw', 'eval', 'JSON.stringify(__probe.report())'));
    const user = r.repeated.find(x => x.key.includes('/api/user'));
    ok('repeated catches the triple fetch', !!user && user.burst >= 3, user && `${user.burst}× ${user.key}`);
    ok('repeated names the calling line', !!user && user.from.some(f => /:\d+/.test(f)), user && user.from[0]);
    const gql = r.repeated.find(x => x.key.includes('GetUser'));
    ok('repeated splits GraphQL ops', !!gql && gql.burst === 2 && !r.repeated.some(x => x.key.includes('GetPosts')), gql && `${gql.burst}× GetUser`);
    const poll = r.polling.find(x => x.everyMs > 700 && x.everyMs < 1400);
    ok('polling is told apart from duplicates', !!poll, poll && `every ${poll.everyMs}ms`);
    ok('liveIntervals sees the uncleared timer', r.liveIntervals.length >= 1, JSON.stringify(r.liveIntervals[0]));
    ok('slowest finds the 1.5s endpoint', r.slowest[0]?.key.includes('/api/slow') && r.slowest[0].maxMs > 1000, r.slowest[0] && `${r.slowest[0].maxMs}ms`);
    ok('blocking sees the 250ms long task', r.blocking.totalMs > 150, `${r.blocking.totalMs}ms`);
    ok('TBT is computed', r.vitals.tbtMs > 100, `${r.vitals.tbtMs}ms`);
    ok('LCP splits into parts', r.vitals.lcpParts && r.vitals.lcpMs > 0, JSON.stringify(r.vitals.lcpParts));
    ok('CLS catches the unsized image', r.vitals.cls > 0, `${r.vitals.cls}`);
    ok('cache separates cached from network', r.cache.cached >= 1 && r.cache.network >= 1, JSON.stringify({ cached: r.cache.cached, network: r.cache.network }));

    const p = json(cli('--raw', 'run-code', '--filename=profile.js'));
    ok('layout thrash shows up', p.work.layouts > 100, `${p.work.layouts} layouts for 5 clicks`);
    ok('why names the trigger and the line', !!p.why?.length && /·/.test(p.why[0]), p.why?.[0]);
    // either attribution is fine — a named function, or a real source line.
    // What must never happen is the top frame being V8 bookkeeping.
    const h = p.hot?.[0] || '';
    ok('CPU profile attributes cost to real code', !!h && (!h.startsWith('(anon)') || (/:\d+ /.test(h) && !/:-1 /.test(h))), h);
    ok('retained nodes survive GC', p.retained.nodes > 1000, `+${p.retained.nodes} nodes`);
    ok('retained listeners survive GC', p.retained.listeners > 500, `+${p.retained.listeners} listeners`);
    ok('detach puts the globals back', json(cli('--raw', 'eval', 'JSON.stringify(__probe.detach())')) === 'detached', 'detached');
  } finally {
    try { cli('close'); } catch {}
    server.kill();
    rmSync(work, { recursive: true, force: true });
  }

  const failed = checks.filter(c => !c.pass);
  for (const c of checks) console.log(`${c.pass ? 'ok  ' : 'FAIL'}  ${c.name}${c.saw ? `  — ${c.saw}` : ''}`);
  console.log(`\n${checks.length - failed.length}/${checks.length} instruments still bite`);
  if (failed.length) {
    console.log('\nA failure here means the instrument is broken, not the fixture.');
    console.log('Do not trust a run against real code until these pass.');
  }
  process.exit(failed.length ? 1 : 0);
}
