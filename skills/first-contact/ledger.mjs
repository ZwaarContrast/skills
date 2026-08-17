#!/usr/bin/env node
// Turn a playwright-cli trace into the observation ledger: what the tester
// actually did, in order, with the labels they saw and the screen they saw it on.
//
//   node ledger.mjs <trace-file> [--notes notes.txt] [--intended intended.md]
//   node ledger.mjs --self-test
//
// The tester writes down what it meant to do. This writes down what it did.
// Only the second is evidence.
//
// Trouble is judged by what changed on screen, never by the URL. A modal, a
// client-side route and a tab are all invisible to a URL, and most products are
// mostly those — a ledger that counted page loads would report a clean run
// while the tester went in circles.
//
// Deliberately no timing marks. Gaps between an agent's actions are model
// latency, not hesitation. This counts moves, not minutes.

const BOOKKEEPING = new Set(['title', 'consoleMessages', 'pageErrors', 'evaluateExpression', 'setViewportSize',
  'startTracing', 'stopTracing', 'waitForEventInfo', 'waitForLoadState', 'waitForTimeout', 'expect']);
const PERCEPTION = new Set(['ariaSnapshot', 'screenshot', 'pdf']);
const GUESSABLE = new Set(['/', '/login', '/signin', '/sign-in', '/home', '/dashboard']);

// refs are renumbered on every render, so they must not be part of what makes
// one screen different from another
const signature = snap => snap.replace(/\s*\[[^\]]*\]/g, '').replace(/\s+/g, ' ').trim();

export function ledger(rows, notes = []) {
  const before = new Map(), after = new Map(), urlByCall = new Map(), htmlByCall = new Map();
  const frames = [];
  for (const r of rows) {
    if (r.type === 'before') before.set(r.callId, r);
    else if (r.type === 'after') after.set(r.callId, r);
    else if (r.type === 'screencast-frame') frames.push({ t: r.timestamp, file: r.sha1 });
    else if (r.type === 'frame-snapshot' && r.snapshot?.isMainFrame !== false) {
      urlByCall.set(r.snapshot.callId, r.snapshot.frameUrl);
      if (r.snapshot.html) htmlByCall.set(r.snapshot.callId, r.snapshot.html);
    }
  }
  frames.sort((a, b) => a.t - b.t);

  const calls = [...before.values()].sort((a, b) => a.startTime - b.startTime);
  const labels = new Map();
  const hrefs = new Set();          // every address the tester could have seen, or already been to
  const steps = [];
  const seenProblem = new Set();
  let url = null, state0 = null;

  for (const c of calls) {
    // the frame snapshot attached to an action shows where it ended up, so the
    // page the tester was actually looking at when they decided is the one from
    // before this call is processed
    const wasAt = url;
    const seen = urlByCall.get(c.callId);
    if (seen && seen !== 'about:blank') { url = seen; hrefs.add(seen); }
    const html = htmlByCall.get(c.callId);
    if (html) for (const m of String(html).matchAll(/href="([^"]*)"/g)) {
      try { hrefs.add(new URL(m[1], url || 'http://localhost').href); } catch {}
    }

    if (c.method === 'ariaSnapshot') {
      const snap = after.get(c.callId)?.result?.snapshot || '';
      for (const m of snap.matchAll(/^\s*-\s*(.+?)\s*\[ref=(e\d+)\]/gm)) labels.set(m[2], m[1].replace(/\s*\[[^\]]*\]/g, '').trim());
      const sig = signature(snap);
      if (steps.length) steps[steps.length - 1].stateAfter = sig;
      else state0 = sig;
      continue;
    }
    if (c.method === 'consoleMessages' || c.method === 'pageErrors') {
      const res = after.get(c.callId)?.result || {};
      for (const m of [...(res.errors || []), ...(res.messages || []).filter(x => x.type === 'error')]) {
        const text = String(m.text || m.message || m.error?.message || m.value || JSON.stringify(m)).replace(/\s+/g, ' ').slice(0, 140);
        if (seenProblem.has(text) || !steps.length || /favicon/i.test(text)) continue;
        seenProblem.add(text);
        (steps[steps.length - 1].problems ||= []).push(text);
      }
      continue;
    }
    if (BOOKKEEPING.has(c.method) || PERCEPTION.has(c.method)) continue;

    const ref = (c.params?.selector || '').match(/aria-ref=(e\d+)/)?.[1];
    steps.push({
      n: steps.length + 1,
      url: c.method === 'goto' ? null : wasAt,
      action: c.method,
      ref,
      target: ref ? (labels.get(ref) || ref) : (c.params?.url || ''),
      value: c.params?.value ?? c.params?.text ?? undefined,
      sawBefore: frames.filter(f => f.t <= c.startTime).pop()?.file,
      sawAfter: frames.find(f => f.t > c.startTime)?.file,
      // a destination the tester could not have seen a link to: either they
      // guessed a common address, or they knew something they should not
      unseen: c.method === 'goto' && steps.length > 0 && !hrefs.has(c.params?.url)
        && !GUESSABLE.has(safePath(c.params?.url)),
    });
  }

  attachIntent(steps, notes);

  const stateBefore = k => (k === 0 ? state0 : steps[k - 1].stateAfter);
  const history = [];
  for (let k = 0; k < steps.length; k++) {
    const s = steps[k], pre = stateBefore(k);
    s.marks = [];
    if (s.action === 'goBack' || s.action === 'goForward') s.marks.push('backtrack');
    if (s.unseen) s.marks.push('unseen URL — how did they know?');
    const moved = j => steps[j] && steps[j].stateAfter && stateBefore(j) && steps[j].stateAfter !== stateBefore(j);
    if (s.stateAfter && pre) {
      if (s.stateAfter === pre) s.marks.push('no visible change');
      else if (history.includes(s.stateAfter)) s.marks.push('returned to an earlier screen');
      else if (steps[k + 1]?.stateAfter === pre) s.marks.push('wrong turn');
      // Arrived here, did nothing, moved on. This is what a dead end looks like
      // from the outside when the tester recovers by going forward rather than
      // back — and going forward is what they usually do.
      const excursion = j => steps[j] && (steps[j].marks || []).includes('returned to an earlier screen');
      if (moved(k) && moved(k - 1) && !excursion(k) && !excursion(k - 1)) s.marks.push('left without doing anything');
    }
    const prior = steps.findIndex(x => x.n < s.n && x.target && x.target === s.target && stateBefore(x.n - 1) === pre);
    if (s.target && prior > -1) s.marks.push(`repeat of move ${steps[prior].n}`);
    if (pre) history.push(pre);
  }

  const has = m => steps.filter(s => s.marks.some(x => x.startsWith(m))).length;
  return {
    steps,
    summary: {
      moves: steps.length,
      screens: new Set(steps.map(s => s.stateAfter).filter(Boolean)).size,
      backtracks: has('backtrack'),
      wrongTurns: has('wrong turn'),
      noVisibleChange: has('no visible change'),
      returns: has('returned'),
      repeats: has('repeat'),
      lookedAndLeft: has('left without'),
      unseenUrls: has('unseen'),
    },
  };
}

const safePath = u => { try { return new URL(u).pathname; } catch { return u; } };

// Notes are matched by what they say they are about, not by position: one
// intention often takes two moves (fill then press), so index alignment drifts
// within a few steps and silently mislabels everything after.
function attachIntent(steps, notes) {
  const parsed = notes.map(l => {
    const i = l.indexOf('::');
    return i > -1 ? { cmd: l.slice(0, i).trim(), text: l.slice(i + 2).trim() } : { cmd: '', text: l.trim() };
  });
  const keyed = parsed.some(p => p.cmd);
  let p = 0;
  for (const s of steps) {
    if (!keyed) { s.intent = parsed[p++]?.text; continue; }
    const at = parsed.findIndex((n, i) => i >= p && n.cmd
      && n.cmd.includes(s.action.replace('goto', 'goto'))
      && (!s.ref || n.cmd.includes(s.ref)));
    if (at > -1) { s.intent = parsed[at].text; p = at + 1; }
  }
  const used = steps.filter(s => s.intent).length;
  if (keyed && used < steps.length) steps.unmatched = steps.length - used;
}

function render(l, traceDir = '.', intended = null) {
  const seen = [];
  const handle = f => f ? 'f' + (seen.includes(f) ? seen.indexOf(f) + 1 : seen.push(f)) : '';
  const rows = l.steps.map(s => {
    const marks = [...s.marks, ...(s.problems || []).map(p => `page error: ${p}`)];
    return `| ${s.n} | ${(s.url || '').replace(/^https?:\/\/[^/]+/, '') || '—'} | ${s.intent || ''} | ${s.action}${s.value ? ` "${s.value}"` : ''} | ${s.target || '—'} | ${handle(s.sawBefore)}→${handle(s.sawAfter)} | ${marks.join(', ')} |`;
  });
  const out = [
    '| # | page | was trying to | did | to | saw | marks |',
    '|---|------|---------------|-----|----|-----|-------|',
    ...rows, '',
    Object.entries(l.summary).map(([k, v]) => `${k}: ${v}`).join('  ·  '),
  ];
  if (intended) {
    out.push('', `intended ${intended.steps} moves (${intended.seal}) · actual ${l.summary.moves}`
      + (l.summary.moves > intended.steps ? ` — ${l.summary.moves - intended.steps} more than the path anyone designed` : ''));
  }
  if (seen.length) out.push('', 'frames:', ...seen.map((f, i) => `  f${i + 1}  ${traceDir}/resources/${f}`));
  return out.join('\n');
}

if (process.argv.includes('--self-test')) {
  let id = 0;
  const call = (method, params = {}) => ({ type: 'before', callId: String(++id), startTime: id, method, params });
  const A = '- button "+ New" [ref=e3]\n- link "Help" [ref=e9]';
  const B = '- dialog "Note added" [ref=e7]';
  const C = '- heading "Cogs" [ref=e5]';
  const D = '- heading "Vault" [ref=e6]';
  const t = [];
  const act = (m, p) => t.push(call(m, p));
  // playwright-cli's automatic snapshot after each command
  const look = (text, url = 'http://x/streams') => {
    const c = call('ariaSnapshot');
    t.push(c,
      { type: 'after', callId: c.callId, result: { snapshot: text } },
      { type: 'frame-snapshot', snapshot: { callId: c.callId, frameUrl: url, isMainFrame: true, html: '<a href="/streams">Streams</a>' } });
  };
  act('goto', { url: 'http://x/streams' }); look(A);
  act('click', { selector: 'aria-ref=e9' }); look(B);   // opens something...
  act('goBack'); look(A);                               // ...immediately undone
  act('click', { selector: 'aria-ref=e3' }); look(A);   // dead control: nothing changed
  act('click', { selector: 'aria-ref=e9' }); look(C);   // on to a new screen...
  act('click', { selector: 'aria-ref=e9' }); look(D);   // ...and straight off it again
  act('goto', { url: 'http://x/secret-admin' });        // never linked, never visited
  t.push({ type: 'screencast-frame', timestamp: 0.5, sha1: 'shot-a.jpeg' },
         { type: 'screencast-frame', timestamp: 4.5, sha1: 'shot-b.jpeg' });
  const err = call('pageErrors'); t.push(err, { type: 'after', callId: err.callId, result: { errors: [{ message: 'TypeError: undefinedFunction' }] } });

  const l = ledger(t, ['goto :: start at the app', 'click e9 :: maybe help explains this', 'goBack :: nope, back', 'click e3 :: try the obvious button', 'click e9 :: look at settings', 'click e9 :: try the archive', 'goto :: guess an address']);
  const a = (c, m) => { if (!c) { console.error('FAIL ' + m); process.exit(1); } console.log('ok  ' + m); };
  a(l.steps[1].target === 'link "Help"', 'resolves a ref to the label the tester saw');
  a(l.steps[1].marks.includes('wrong turn'), 'a move undone by the next one is a wrong turn, by screen not by URL');
  a(l.steps[2].marks.includes('backtrack'), 'goBack is a backtrack');
  a(l.steps[3].marks.includes('no visible change'), 'a click that changes nothing on screen is flagged for judgement');
  a(l.steps[6].marks.some(m => m.startsWith('unseen URL')), 'navigating somewhere never linked or visited is flagged as impossible knowledge');
  a(l.steps[1].intent === 'maybe help explains this', 'matches intent by the command it names, not by position');
  a(l.steps[6].problems?.[0]?.includes('TypeError'), 'a page error lands on the move that caused it');
  a(l.steps[1].sawBefore === 'shot-a.jpeg' && l.steps[1].sawAfter === 'shot-b.jpeg', 'attaches the frames either side of a move');
  a(l.steps[5].marks.includes('left without doing anything'), 'a screen arrived at and left untouched is a dead end, even without a backtrack');
  a(!l.steps[2].marks.includes('left without doing anything'), 'opening something and closing it again is doing something, not passing through');
  a(l.summary.moves === 7 && l.summary.noVisibleChange === 1 && l.summary.wrongTurns === 1, 'counts moves, not bookkeeping');
  console.log('\nself-test passed');
} else {
  const file = process.argv[2];
  if (!file) { console.error('usage: node ledger.mjs <trace> [--notes f] [--intended f] | --self-test'); process.exit(2); }
  const { readFileSync } = await import('node:fs');
  const { dirname } = await import('node:path');
  const { createHash } = await import('node:crypto');
  const arg = n => { const i = process.argv.indexOf(n); return i > -1 ? process.argv[i + 1] : null; };

  const rows = readFileSync(file, 'utf8').split('\n').filter(Boolean).map(l => JSON.parse(l));
  const notesFile = arg('--notes');
  const notes = notesFile ? readFileSync(notesFile, 'utf8').split('\n').map(s => s.replace(/^\s*[-*\d.]+\s*/, '').trim()).filter(Boolean) : [];

  let intended = null;
  const intFile = arg('--intended');
  if (intFile) {
    const text = readFileSync(intFile, 'utf8');
    const hash = createHash('sha256').update(text).digest('hex').slice(0, 12);
    // a prediction is only a prediction if it was written down before the answer
    let seal = 'NEVER SEALED — this was not committed to before the run, so it is a description, not a prediction';
    try {
      const [sealedHash] = readFileSync(intFile + '.sealed', 'utf8').split('\n');
      seal = sealedHash === hash ? `sealed ${hash}` : `EDITED SINCE SEALING (${sealedHash} → ${hash}) — the comparison is void`;
    } catch {}
    intended = { hash, seal, steps: (text.match(/^\s*\d+[.)]\s/gm) || []).length };
  }

  const l = ledger(rows, notes);
  console.log(render(l, dirname(file), intended));
  if (l.steps.unmatched) console.log(`\n! ${l.steps.unmatched} moves have no matching note. The trace is the record; missing intent is the tester's omission, not a gap to fill in by guessing.`);
  if (l.summary.unseenUrls) console.log('\n! The tester went somewhere it was never shown a link to. Either it guessed, or it read something it should not have. Check before trusting this run.');
}
