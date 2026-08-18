---
name: crash-test
description: Profile a running frontend by using it the way an impatient user does, while Chromium's own instruments record what it costs — slow loads, requests fired over and over, layout thrash, wasted re-renders, leaked nodes and listeners, uncached assets, and timers nobody stops, each with the source line that caused it. Scrolling and zooming get mauled deliberately, since that is where frontends fall over. A fix is proven twice over, the number moved and the screenshots did not. Use when an app feels slow or janky, when you want a frontend performance audit, to find what a real user's impatience breaks, or to verify an optimisation actually optimised something.
---

# Crash test

A crash test is not an accident. It is a wall, a dummy wired with sensors, and a
number at the end. The violence is the cheap part — anyone can drive a car into
a wall. The instrumentation is what makes it an experiment.

An application is never slow on the machine that built it. The cache is warm,
the dataset is twelve rows, the network is localhost, and you click each thing
once, in the order it was designed to be clicked. Nobody uses it that way. They
click twice because nothing happened. They go back and open the same screen
again. They leave the tab open all afternoon. They have four thousand rows.

**The browser is the instrument, not your judgement.** Chromium counts every
layout, every listener, every byte, and will name the line of code that caused
it. An agent watching a page and reporting that it "felt sluggish" has measured
nothing. Three rules follow:

1. **A finding is a number**, produced under a named scenario, with the source line that caused it. No number, no finding.
2. **Rough use, not polite use.** Do it again. Do it fast. Do it four hundred times. Then walk away and leave it running.
3. **A fix counts when the number moved and the pixels did not.**

## 1. Refuse what isn't a frontend

This needs an application a browser can load and a human can click. Find the run
command the way a newcomer would — README, `package.json` scripts, Makefile —
start it, and point the browser at it. Then let the browser decide:

- Nothing serves HTTP → stop.
- What comes back is a JSON body, a `Cannot GET /`, a 404, or a directory listing → stop.
- It loads but there is nothing to interact with → stop.

Say plainly what you found and what it would take to make it runnable. Do not
scaffold a harness page around a component library to give yourself something to
profile: a component rendered inside a page you just wrote measures your page,
not theirs.

## 2. Measure the right build, with enough data

**The dev server is a different application.** Unminified, differently bundled,
source-mapped, uncompressed, HMR socket open, cache headers absent, and
frameworks running their development build — React's is several times slower and
double-invokes effects under StrictMode. Bytes and load times measured there are
fiction.

- Anything about **bytes, load time, caching, LCP** — production build, served the way production serves it (`npm run build && npm run preview`, or this project's equivalent).
- **Behavioural** findings — repeated requests, leaks, layout thrash, timers that never stop — show up in either build. Dev is fine and maps back to source more easily.
- Label every number with the build it came from, and never mix the two in one table.

**Build production with source maps on**, or the best thing here stops working:
every source line this skill reports — the stack that fired a request, the code
that triggered a relayout, the hot function — degrades to `index-4f2a.js:1` in a
minified bundle. Most bundlers take one flag (`build.sourcemap: true`,
`--sourcemap`). If you cannot enable them, run the behavioural scenarios against
dev where the lines are readable, and keep the production run for bytes and
load time only.

Then seed it. Twelve rows tell you nothing about four thousand. Load the largest
realistic dataset you can create; if you cannot, say the volume scenario went
untested rather than passing it on twelve rows.

**Where this may run.** A local instance against a disposable store, only. Rough
use means clicking *Delete* forty times and submitting the same form until it
breaks. Never against staging, production, a shared database, or anything wired
to a real payment, mail, or third-party account. If the store is not disposable,
back it up first or skip the destructive scenarios and say so.

## 3. Check that the instruments still bite

An instrument that has quietly stopped measuring is worse than no instrument:
it reports "no findings" and everyone believes it. Chromium renames trace
categories and CDP fields between versions, and this skill leans on several.

So before trusting a run against real code, run the calibration. It serves a
deliberately awful page — one with a triple fetch, a poller nobody clears, a 1.5s
endpoint, read-after-write layout thrash, a detached-node leak, a long task, an
unsized image, and exactly one cacheable asset — drives the instruments at it,
and asserts each one still reports the fault it is meant to catch:

```bash
node <skill-dir>/fixture.mjs --check     # expect: N/N instruments still bite
```

Anything less than all of them means the instrument is broken, not the fixture.
Fix it, or say in the report which findings you could not have detected.
`node fixture.mjs` on its own just serves the page, on a free port it picks
itself, if you want to look at it by hand.

## 4. Wire up the sensors

Driving the app — opening, clicking, filling, snapshots, console, traces,
screenshots — is the **playwright-cli** skill's job. Use it; don't rebuild it.
This skill adds what it doesn't cover: an in-page collector and Chromium's
profiling domains.

Take a private working directory and a session name derived from it. Both are
global namespaces, and a fixed name means two runs — yours and someone else's —
quietly fighting over one browser:

```bash
WORK=$(mktemp -d) && cd "$WORK" && SESSION="ct$(basename "$WORK" | tail -c 7)"
cp <skill-dir>/profile.js .          # run-code only reads files under its cwd
playwright-cli -s=$SESSION open
playwright-cli -s=$SESSION run-code "async page => {
  await page.addInitScript({ path: '<skill-dir>/probe.js' });
  await page.goto('<app-url>');
}"
```

That session outlives the command that made it. `open` starts a background
daemon holding a Chromium tree and a profile directory; it reparents to init and
survives the shell, the run, and every run after it. Thirteen abandoned sessions
on one laptop came to ~90 processes and 205 MB of profiles, one of them spinning
at 78% CPU for five days. Closing releases all three, and costs nothing:

```bash
playwright-cli -s=$SESSION close     # daemon, browser and profile dir
playwright-cli list                  # what is still alive, from any run, ever
```

Close when the run ends — and go back and close when it aborts, because a run
that died at scenario 3 leaks exactly as much as one that finished. Sweep strays
with `close`. Reach for `kill-all` only when a daemon is unresponsive: it kills
the daemons and orphans their browsers, which then ignore SIGTERM and have to be
cleared by hand — and that sweep takes every session on the machine with it,
including someone else's live run, so read `list` before you fire it.

```bash
pkill -9 -f playwright_chromiumdev_profile && rm -rf $TMPDIR/playwright_chromiumdev_profile-*
```

[`probe.js`](probe.js) wraps `fetch`, `XMLHttpRequest`, `setInterval` and
`requestAnimationFrame`, and observes long tasks, layout shifts, event timing and
LCP. Read it whenever you like, and reset it between scenarios:

```bash
playwright-cli -s=$SESSION --raw eval "JSON.stringify(__probe.report())"
playwright-cli -s=$SESSION --raw eval "__probe.reset()"
```

It reports requests bunched together (`repeated`) separately from requests on a
cadence (`polling`) — a poller is not a duplicate, and the two are told apart per
call site, because one endpoint is commonly both — each **with the stack that
fired it**. Plus the slowest calls, what came from cache versus over the wire,
transferred bytes, long tasks, layout shifts with the nodes that moved,
interactions split into input delay / processing / presentation, intervals still
ticking, DOM churn per second, whether the back-forward cache was used, and the
Web Vitals below with LCP broken into its four parts.

[`profile.js`](profile.js) is a template for one interaction under the heavier
instruments. Copy it into `$WORK`, put the interaction in the marked block, run it:

```bash
playwright-cli -s=$SESSION --raw run-code --filename=profile.js
```

It returns, from Chromium's `Performance`, `Tracing` and `Profiler` domains: how
many layouts and style recalcs that interaction cost, where the main thread went
by trace event, the hottest functions with file and line, and — after a forced
garbage collection — how many nodes, listeners and heap bytes it never gave
back. Its `why` field is the one to read first: every relayout and restyle
grouped by **what triggered it and where**, so a thousand repaints resolve to a
line like `1000× layout · Style changed · DIV.row · app.js:21`. `selectors` ranks
what the style engine actually spent time matching. Knobs at the top cover CPU
throttling (`4` is a mid-range laptop, `6` a cheap phone) and network shaping
(`Network.emulateNetworkConditions`; Playwright has no first-class API for it).

**What the probe costs, and how to check.** It is not free in principle: it
captures a stack on every request and observes every DOM mutation. Measured on
the fixture's five-click scenario — a thousand mutations, four thousand nodes —
the overhead was inside run-to-run noise (median task time 247ms with it, 254ms
without; layout counts identical). That scenario makes no requests, though, and
stack capture is the part that scales with them. If a number looks suspicious,
`__probe.detach()` puts every patched global back and stops the observers, so you
can re-run the same scenario uninstrumented and compare. Note that `profile.js`'s
counters come from CDP and never touch the probe, so layouts, retained nodes and
hot functions are unaffected either way.

Six things will bite you:

- The probe **replaces globals** in the app under test (`fetch`, `XHR.open/send`, `setInterval`, `clearInterval`, `rAF`, `setTimeout`). Harmless almost always; if an app patches the same globals after us, or inspects them, `detach()` and compare.
- `addInitScript` reads the file **when you install it**. Edit `probe.js` and you must reopen the session, or you are re-running the old one.
- `run-code --filename=` refuses to read files **outside its working directory**, which is why `profile.js` gets copied in. `addInitScript`'s path is not restricted — that one can point straight at the skill directory.
- The collector lives in the page. A full navigation wipes it — read the report *before* you navigate away. It survives SPA route changes.
- If the probe throws, `__probe` is undefined and everything downstream is silently empty. Check `playwright-cli -s=$SESSION console` after installing.
- `playwright-cli network` returned nothing in the version tested (0.1.8), despite being documented. The probe is the network source of truth here; don't quietly rely on that command.

For an artifact a human can open in DevTools afterwards, wrap a scenario in
`playwright-cli tracing-start` / `tracing-stop`.

## 5. Drive it into the wall

**Start with Lighthouse.** It is better than anything here at auditing one cold
load, it is maintained by the people who define the metrics, and it costs ten
seconds:

```bash
npx lighthouse <app-url> --output=json --output-path=lh.json \
  --only-categories=performance --chrome-flags="--headless=new" --quiet
```

Then read what it cannot see. Run against this skill's fixture — an app that
leaks four thousand nodes per click, forces a thousand layouts, and polls forever
— Lighthouse returns **0.97 out of 1, 0ms total blocking time, "6 elements"**.
It is not wrong; it loaded the page and never touched it. Everything below this
line exists because nobody's users stop at the cold load.

**The first ten minutes**, if that is all there is: Lighthouse, then scenarios 4
and 7 (impatience and scroll), one run each, no fixes. That combination finds
most of what is worth finding. Escalate to the rest when it pays off, and say in
the report which scenarios you actually ran.

Run these as separate scenarios. Reset the probe between them, name each one, and
read the report at the end of each. The point of a named scenario is that you can
run it again after the fix.

1. **Cold load.** Clear cache, cookies and storage. Load the entry point, wait for idle. → LCP and its four parts, TTFB, blocking time, bytes, request count, requests that wait on other requests with no reason to.
2. **Warm reload.** Reload without clearing, then read `cache`. Every asset lands in one of four buckets: `cached` (free), `revalidated` (a round trip that returned nothing — it has a validator but no freshness lifetime), `network` (paid for again in full), or `opaque`. Hashed build assets in anything but `cached` is a cache-header finding, not a code finding.
3. **The same screen twice.** Open a view, leave it, come back. Five times, including via the back button. → nodes and listeners that never return to baseline; the same data fetched on every visit; `bfcacheRestored: false` after a back, meaning the back button costs a full reload.
4. **Impatience.** Click the primary button ten times fast. Double-click things. Type into search at speed. Hit back mid-load. Submit twice. → duplicate in-flight requests with no debounce or dedupe, handlers that queue up, interactions whose presentation delay grows.
5. **Idle.** Sit on the busiest screen for sixty seconds, touching nothing. Then hide the tab for sixty more. → polling nobody stops, animation frames still running while hidden, requests per minute at rest. A slow leak needs minutes, not seconds; if the heap is climbing at sixty seconds, let it run for ten.
6. **Volume.** The longest list, the widest table, the fullest form. Sort it, filter it, scroll it hard. → layouts per interaction, DOM churn, whether anything is virtualised.
7. **Scroll like a madman.** Its own section below — this is where frontends fall over.
8. **Handicap.** Redo the main flow at 4× CPU and Slow 3G. 20× CPU is not a device model, but it stretches the timeline until ordering and races become visible — use it to see, not to score. Then block or delay the third parties (`playwright-cli route` to kill them, `page.route` with a delayed `continue` to make them slow) and measure the difference: how much of this page's cost belongs to someone else's script?

Between them, keep an eye on `playwright-cli console` — errors thrown on every
render are both a bug and a cost.

### Scenario 7, in full

Scrolling is the most expensive thing a user does and the least tested. It runs
handlers on every frame, triggers lazy loads, moves sticky elements, fires
intersection observers, mounts and unmounts virtualised rows, and on a map or a
canvas it requests tiles. A single polite scroll to the bottom finds none of it.

Do all of this, aimed at the scrolling element (the gesture lands wherever you
point it, so `x`/`y` picks the window, an inner scroller, or the map):

- **Throw it.** All the way to the bottom at speed, then all the way back. Repeatedly.
- **Jitter it.** Dozens of small deltas, some barely a few pixels.
- **Whiplash.** Up up up down down. Reverse mid-fling. Reverse again.
- **Sideways**, and both axes at once, wherever horizontal scrolling exists.
- **Scroll while it is still loading**, and while a request is in flight. Resize the window mid-load while you are at it.
- **Go back to where you have already been.** Anything that re-requests what it already showed you has no cache.
- **Zoom, if there is anything zoomable** — a map, a canvas, an image viewer, a chart, a code editor. In and out, big jumps and small ones, over and over, panning while zoomed in.

Keep going until everything that could render has rendered — every tile, every
lazy image, every virtualised row. Chromium synthesises real gestures with real
velocity, which is not the same as dispatching wheel events. Put this in
`profile.js`'s interaction block so the layouts, the retained nodes and the hot
functions are counted while it happens:

```js
const cdp2 = await page.context().newCDPSession(page);
const fling = (y, x = 0, speed = 5000, reps = 1) => cdp2.send('Input.synthesizeScrollGesture',
  { x: 400, y: 300, xDistance: x, yDistance: y, speed, repeatCount: reps, repeatDelayMs: 30 });
const pinch = s => cdp2.send('Input.synthesizePinchGesture', { x: 400, y: 300, scaleFactor: s, relativeSpeed: 800 });

await fling(-8000, 0, 12000, 3);                                  // throw it to the bottom
await fling(8000, 0, 12000, 3);                                   // and back to the top
for (let i = 0; i < 40; i++) await fling((i * 137 % 600) - 300, 0, 1500);   // jitter
for (const d of [-200, -200, -200, 300, 300, -900, 900]) await fling(d, 0, 8000); // whiplash
await fling(0, -1500, 4000); await fling(0, 1500, 4000);          // sideways
for (const s of [4, 0.25, 1.8, 0.6, 6, 0.15]) await pinch(s);     // zoom surfaces only
```

Deltas come from a counter, not `Math.random()` — a scenario you cannot replay
identically cannot prove a fix. Read `__probe.report()` straight after:
`repeated` and `heaviest` are where a tile or row storm shows up, `cache` says
whether returning to a place you have been costs anything, and `churn` tells you
how hard the DOM worked to keep up.

## 6. What counts as a finding

Web Vitals thresholds, from [web.dev/articles/vitals](https://web.dev/articles/vitals)
— check the current values, they move:

| | good | poor |
|---|---|---|
| LCP | ≤ 2.5s | > 4s |
| INP | ≤ 200ms | > 500ms |
| CLS | ≤ 0.1 | > 0.25 |

Those bars are the **75th percentile of real users' loads**. You are running one
load on a developer machine, so they are a smell test, not a verdict — see the
limits in §8. INP in particular cannot be measured in a lab at all; TBT is its
stand-in, and the probe reports both it and the worst interaction it saw.

Beyond the vitals, a finding is one of these, with its number and its source line:

- The same URL fetched more than once for the same data, in one scenario — `repeated`, which already excludes anything arriving on a cadence.
- A poller in `polling` whose interval is faster than the data changes, or that keeps firing on a screen nobody is looking at.
- Requests that run one after another when they could run together.
- A request over ~500ms, or a payload far larger than what the screen shows.
- Long tasks over 50ms — and what the CPU profile says was on the stack.
- Layouts or style recalcs in the double digits for a single interaction, or one invalidation reason repeating hundreds of times in `why`: something is reading geometry inside a write loop.
- Nodes, listeners, or heap that do not return to baseline after five cycles of scenario 3 — measured **after** the forced GC, or it is noise.
- An interval still ticking at rest, or animation frames running while the tab is hidden.
- Assets re-downloaded or revalidated on a warm reload; a back navigation that was not served from the back-forward cache.
- Unused JavaScript over half the bundle (`page.coverage`, production build only).

**Cross-origin assets are the blind spot.** Without `Timing-Allow-Origin` the
browser hides their timing from the page, so they land in `opaque` and the cache
verdict is unknown — which on a CDN-heavy app is most of the page. Check those
with `curl -sI <url>` and read `cache-control` directly rather than guessing, and
say in the report how many assets you could not see.

**A number without a consequence is a note, not a finding.** Four thousand extra
nodes nobody can perceive ranks below a 300ms input delay on the button everyone
presses. Rank by what a user feels, and say which user action it happens on.

For remediation, look up the current guidance rather than reciting it — web.dev's
`optimize-lcp`, `optimize-inp`, `optimize-cls` and `ttfb` articles, plus whatever
the framework's own docs say about this exact symptom. Cite what you used;
guidance from memory is often a superseded version of itself.

## 7. Prove the fix, twice

One fix at a time. Batch three and you cannot tell which one worked, or which one
changed the rendering.

**The number moved.** Re-run the same scenario, same build, same throttle, same
seed data. Run it three times before and three times after, and compare medians:
a single pair of runs cannot tell a fix from a busy laptop. If the spread across
the three is wider than the gap you are claiming, you have measured noise — say
so instead of banking it. A fix that does not move the number it was aimed at is
not a fix, however plausible it reads.

**The pixels did not.** [`visual.spec.js`](visual.spec.js) is the template:
Playwright's own comparator, walking the same scenario and screenshotting each
stop. Run it in its own temp directory so the project is untouched:

```bash
VIS=$(mktemp -d) && cd "$VIS" && cp <skill-dir>/visual.spec.js .
npm i @playwright/test
APP=<app-url> npx playwright test visual.spec.js   # 1. writes baselines. Before the fix.
APP=<app-url> npx playwright test visual.spec.js   # 2. must pass, against its own baseline
<apply the fix>
APP=<app-url> npx playwright test visual.spec.js   # 3. fails on any visual change
```

Run 2 is not ceremony. If the page cannot match a screenshot it took thirty
seconds ago, it is not deterministic enough to guard — mask what moves before
going near a fix, or every later failure is ambiguous. It also catches the case
where the installed `@playwright/test` renders differently from the browser
`playwright-cli` drives.

**Prove the guard bites.** Change something visible on purpose and confirm it
fails. Measured on the fixture: a colour change on one heading produced 80659
differing pixels and a red test — but the same change under
`maxDiffPixelRatio: 0.01` produced 1029 pixels and *passed*, because that
"cautious" threshold is nine times larger than it sounds. Keep the defaults.
Where content is genuinely dynamic — clocks, ids, random data — `mask:` those
locators instead of raising the threshold. Masking blinds one box; a threshold
blinds the whole page.

When the diff fails *legitimately* — virtualisation now renders twenty rows
instead of four hundred, a lazy image arrives later — that is a behaviour change
bought with the speed, not a free win. Show the user both screenshots and let
them rule on it.

## 8. Report

Ranked by what a user feels, each finding carrying: the scenario that produced
it, the number, the source line, what a user experiences, the remediation and its
citation, the number after, and the visual verdict.

Keep the raw reports, not just the prose. One file per scenario, beside the
write-up, so the next run has something to compare against:

```bash
playwright-cli -s=$SESSION --raw eval "JSON.stringify(__probe.report())" > perf/cold-load.json
```

Without them, "has this got worse since last month" is unanswerable, and every
future run starts from zero.

Then state the reach honestly, because every number here has the same provenance:

- **Lab, not field.** One machine, one viewport, headless Chromium, medians of a handful of runs. Real users are the 75th percentile across devices and networks you do not have. Throttling approximates; it does not substitute.
- **Only the scenarios you ran** were measured. Name them.
- **Only this build**, on this seed data, at this volume — and say whether source maps were on, since that is what makes the source lines trustworthy.
- Whatever the calibration in §3 could not confirm, and how many assets were `opaque`.
- A quiet run means these scenarios found nothing. It is not evidence the application is fast.

Keep the traces and screenshots with the report. The number is the finding, but
the trace is what a developer opens next.
