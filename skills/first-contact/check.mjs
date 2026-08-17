#!/usr/bin/env node
// Pre-flight, before any tester is dispatched.
//
//   node check.mjs --harvest <url> [<url>...]    # collect the product's own words
//   node check.mjs goals.md vocab.txt            # do the goals leak the answer?
//   node check.mjs goals.md vocab.txt --seal intended.md
//   node check.mjs --self-test
//
// Two things go wrong before the run starts, and both are silent.
//
// A goal that names the product's own word, or names a mechanism, has told the
// tester where to click. The run still produces a tidy ledger; it just measures
// nothing. vocab.txt is the product's coined nouns and nav labels, collected
// while reading the code — the words a first-time visitor could not know.
//
// And an intended path written after seeing the result is not a prediction.
// --seal hashes it and writes a copy beside it, so an edit made once the answer
// was known is visible afterwards rather than invisible. One agent holding both
// ends cannot do better than that, and should not claim to.

// telling them the how rather than the what
const MECHANISM = ['click', 'button', 'menu', 'tab', 'link', 'navigate', 'page', 'screen', 'sidebar',
  'dropdown', 'toolbar', 'settings', 'preferences', 'dialog', 'modal', 'form field', 'icon',
  'export', 'import', 'submit', 'toggle', 'checkbox', 'press'];

// words every product uses, so their presence tells a visitor nothing and their
// absence from a goal proves nothing either
const ORDINARY = new Set(('home save cancel close ok yes no search find next back previous continue submit send ' +
  'login log in signin sign out signup register account profile user users name email password settings ' +
  'preferences help support about contact terms privacy new add create edit update delete remove open ' +
  'download upload export import filter sort view show hide more less all none today date time title ' +
  'description notes note file files folder list item items page menu dashboard overview welcome loading ' +
  'trusted teams ship the a an and or of to for in on with your you my me is are it this that').split(/\s+/));

// Every label the product puts in front of a visitor, taken from the running app
// rather than from memory. The orchestrator supplies the routes — it has read
// the code — and this reads the words off the screen, which is the part nobody
// should be trusted to recall accurately.
export function harvest(snapshots) {
  const found = new Map();
  for (const { url, text } of snapshots) {
    for (const m of text.matchAll(/^\s*-\s*(\w[\w-]*)\s+"([^"]+)"/gm)) {
      for (const w of m[2].split(/[^A-Za-z']+/)) {
        const word = w.trim();
        if (word.length < 3 || ORDINARY.has(word.toLowerCase())) continue;
        if (!found.has(word)) found.set(word, new Set());
        found.get(word).add(`${url} (${m[1]})`);
      }
    }
  }
  return [...found.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

export function check(goals, vocab) {
  const terms = vocab.map(v => v.trim()).filter(Boolean);
  return goals.map(goal => {
    const hits = [];
    for (const t of terms) {
      if (new RegExp(`\\b${t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}s?\\b`, 'i').test(goal)) hits.push({ word: t, why: "the product's own word" });
    }
    for (const m of MECHANISM) {
      if (new RegExp(`\\b${m}s?\\b`, 'i').test(goal)) hits.push({ word: m, why: 'names a mechanism' });
    }
    return { goal, hits };
  });
}

if (process.argv.includes('--self-test')) {
  const r = check([
    'Get last month invoice as a spreadsheet',
    'Use the Export button on the Billing page',
    'Set up somewhere to track the website redesign',
    'Create a new Stream',
  ], ['Stream', 'Cog', 'Vault']);
  const a = (c, m) => { if (!c) { console.error('FAIL ' + m); process.exit(1); } console.log('ok  ' + m); };
  a(r[0].hits.length === 0, 'an outcome in a user\'s words passes');
  a(r[1].hits.some(h => h.word === 'export') && r[1].hits.some(h => h.word === 'button'), 'a goal naming the mechanism is caught');
  a(r[2].hits.length === 0, 'plain language about the outcome passes');
  a(r[3].hits.some(h => h.word === 'Stream'), "the product's coined word is caught");
  const h = harvest([{ url: '/streams', text: '- heading "Streams" [ref=e1]\n- button "Kindle a stream" [ref=e2]\n- link "Save" [ref=e3]' }]);
  const words = h.map(([w]) => w);
  a(words.includes('Streams') && words.includes('Kindle'), 'harvest picks the coined words off the running screen');
  a(!words.includes('Save'), 'harvest drops ordinary UI words nobody has to learn');
  console.log('\nself-test passed');
} else {
  const { readFileSync, writeFileSync } = await import('node:fs');
  const { createHash } = await import('node:crypto');
  const { execFileSync } = await import('node:child_process');
  const rest = process.argv.slice(2).filter(a => !a.startsWith('--'));

  if (process.argv.includes('--harvest')) {
    const urls = rest;
    if (!urls.length) { console.error('usage: check.mjs --harvest <url> [<url>...]'); process.exit(2); }
    const s = 'ctharvest' + process.pid;
    const cli = (...a) => execFileSync('playwright-cli', [`-s=${s}`, ...a], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    const snaps = [];
    try {
      cli('open');
      for (const u of urls) { cli('goto', u); snaps.push({ url: u, text: cli('--raw', 'snapshot') }); }
    } finally { try { cli('close'); } catch {} }
    const words = harvest(snaps);
    console.log(words.map(([w]) => w).join('\n'));
    console.error(`\n${words.length} candidate terms. Keep the ones a first-time visitor could not know — they are vocab.txt. Drop the ones that are ordinary English doing an ordinary job.`);
    for (const [w, where] of words) console.error(`  ${w.padEnd(18)} ${[...where].slice(0, 3).join(', ')}`);
    process.exit(0);
  }

  const [goalsFile, vocabFile] = rest;
  const sealIdx = process.argv.indexOf('--seal');

  // Sealing writes a copy beside the file. It cannot stop anyone editing the
  // prediction after the fact, but it makes the edit visible, which is the most
  // a single agent holding both ends can honestly claim.
  if (sealIdx > -1 && process.argv[sealIdx + 1]) {
    const f = process.argv[sealIdx + 1];
    const text = readFileSync(f, 'utf8');
    const hash = createHash('sha256').update(text).digest('hex').slice(0, 12);
    const steps = (text.match(/^\s*\d+[.)]\s/gm) || []).length;
    writeFileSync(f + '.sealed', `${hash}\n${steps}\n${text}`);
    console.log(`sealed ${hash} · ${steps} intended moves · wrote ${f}.sealed`);
    console.log('Put that line in the report now, before dispatching. Afterwards it is a retrofit.\n');
  }
  if (!goalsFile) process.exit(0);

  const lines = f => readFileSync(f, 'utf8').split('\n').map(s => s.replace(/^\s*[-*\d.)]+\s*/, '').trim()).filter(Boolean);
  const results = check(lines(goalsFile), vocabFile ? lines(vocabFile) : []);
  let bad = 0;
  for (const r of results) {
    if (!r.hits.length) { console.log(`ok    ${r.goal}`); continue; }
    bad++;
    console.log(`LEAK  ${r.goal}`);
    for (const h of r.hits) console.log(`        "${h.word}" — ${h.why}`);
  }
  if (bad) console.log(`\n${bad} goal(s) tell the tester where to look. Rewrite them as the outcome someone wanted, in words they would have used before they ever saw this product.`);
  process.exit(bad ? 1 : 0);
}
