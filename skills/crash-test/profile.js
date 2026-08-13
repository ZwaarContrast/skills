// Template for the crash-test skill. Copy it, put your interaction in the marked
// block, run it with:  playwright-cli --raw run-code --filename=<copy>.js
// Returns what the browser counted while that interaction ran. Nothing here is
// an opinion: every number comes from Chromium's own instrumentation.
async page => {
  const CPU = 1;        // 4 = a mid-range laptop, 6 = a cheap phone
  const NET = null;     // { latency: 400, downloadThroughput: 51200, uploadThroughput: 51200 } = slow 3G
  const TRACE = true;   // false to skip the trace + CPU profile (much cheaper)
  const WHY = true;     // why each relayout/restyle happened, and what CSS cost.
                        // Fat categories: turn off if the trace gets unwieldy.

  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Performance.enable');
  if (CPU > 1) await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU });
  if (NET) { await cdp.send('Network.enable'); await cdp.send('Network.emulateNetworkConditions', { offline: false, ...NET }); }

  const metrics = async () => {
    // heap and node counts are noise until the garbage is actually collected
    await cdp.send('HeapProfiler.collectGarbage');
    return Object.fromEntries((await cdp.send('Performance.getMetrics')).metrics.map(x => [x.name, x.value]));
  };
  const before = await metrics();
  await page.evaluate(() => globalThis.__probe?.reset());

  if (TRACE) {
    await cdp.send('Tracing.start', {
      traceConfig: {
        includedCategories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink.user_timing',
          ...(WHY ? ['disabled-by-default-devtools.timeline.invalidationTracking', 'disabled-by-default-blink.debug'] : [])],
      },
      transferMode: 'ReturnAsStream',
    });
    await cdp.send('Profiler.enable');
    // 100µs: the default is too coarse to attribute a forced-layout getter
    await cdp.send('Profiler.setSamplingInterval', { interval: 100 });
    await cdp.send('Profiler.start');
  }

  // ---------------- the interaction under test ----------------
  for (let i = 0; i < 5; i++) await page.click('#add');
  await page.waitForTimeout(300);
  // ------------------------------------------------------------

  let trace = null, hot = null, cpuMs = null, why = null, selectors = null;
  if (TRACE) {
    const prof = (await cdp.send('Profiler.stop')).profile;
    const done = new Promise(r => cdp.once('Tracing.tracingComplete', r));
    await cdp.send('Tracing.end');
    const { stream } = await done;
    let raw = '', chunk;
    do { chunk = await cdp.send('IO.read', { handle: stream, size: 1 << 22 }); raw += chunk.data; } while (!chunk.eof);
    await cdp.send('IO.close', { handle: stream });

    const events = JSON.parse(raw).traceEvents;

    // where the main thread went, by trace event
    const ms = {};
    for (const e of events) if (e.dur) ms[e.name] = (ms[e.name] || 0) + e.dur / 1000;
    trace = Object.entries(ms).sort((a, b) => b[1] - a[1]).slice(0, 12)
      .map(([n, t]) => `${n} ${Math.round(t)}ms`);

    if (WHY) {
      // every layout and style recalc, grouped by what triggered it and where.
      // A reason repeating hundreds of times for one interaction is the finding.
      const reasons = {};
      for (const e of events) {
        if (!/InvalidationTracking/.test(e.name)) continue;
        const d = (e.args && e.args.data) || {};
        const f = d.stackTrace && d.stackTrace[0];
        const k = `${/Layout/.test(e.name) ? 'layout' : 'style'} · ${d.reason || '?'} · ${d.nodeName || '?'}`
          + (f ? ` · ${(f.url || '').split('/').pop()}:${f.lineNumber}` : '');
        reasons[k] = (reasons[k] || 0) + 1;
      }
      why = Object.entries(reasons).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, n]) => `${n}× ${k}`);

      // the CSS the style engine actually spent time on
      const sel = {};
      for (const e of events) {
        const t = e.args && e.args.selector_stats && e.args.selector_stats.selector_timings;
        if (t) for (const s of t) sel[s.selector] = (sel[s.selector] || 0) + s['elapsed (us)'];
      }
      selectors = Object.entries(sel).filter(([, us]) => us > 0).sort((a, b) => b[1] - a[1]).slice(0, 8)
        .map(([s, us]) => `${Math.round(us)}µs ${s}`);
    }

    // and which function was actually on the stack for it
    const self = new Map();
    prof.samples.forEach((id, i) => self.set(id, (self.get(id) || 0) + (prof.timeDeltas[i] || 0)));
    const frames = new Map(prof.nodes.map(n => [n.id, n.callFrame]));
    cpuMs = Math.round(prof.timeDeltas.reduce((a, b) => a + b, 0) / 1000);
    // (idle) and (program) are V8 bookkeeping, not code anyone can fix.
    // (garbage collector) stays: GC pressure is a finding.
    hot = [...self.entries()].sort((a, b) => b[1] - a[1])
      .filter(([id]) => !['(idle)', '(program)', '(root)'].includes((frames.get(id) || {}).functionName))
      .slice(0, 8).map(([id, us]) => {
        const f = frames.get(id) || {};
        return `${f.functionName || '(anon)'} ${(f.url || '').split('/').pop()}:${f.lineNumber} ${Math.round(us / 1000)}ms`;
      });
  }

  const after = await metrics();
  const d = k => +(after[k] - before[k]).toFixed(3);
  return {
    // relayout / restyle counts are the "it repaints for no reason" finding
    work: { layouts: d('LayoutCount'), restyles: d('RecalcStyleCount'), layoutMs: Math.round(d('LayoutDuration') * 1000), restyleMs: Math.round(d('RecalcStyleDuration') * 1000), scriptMs: Math.round(d('ScriptDuration') * 1000), taskMs: Math.round(d('TaskDuration') * 1000) },
    // post-GC and still growing is the "it leaks" finding
    retained: { nodes: d('Nodes'), listeners: d('JSEventListeners'), heapKB: Math.round(d('JSHeapUsedSize') / 1024), docs: d('Documents') },
    absolute: { nodes: after.Nodes, listeners: after.JSEventListeners, heapMB: Math.round(after.JSHeapUsedSize / 1048576) },
    cpuMs, trace, hot, why, selectors,
    page: await page.evaluate(() => globalThis.__probe?.report() ?? 'probe not installed'),
  };
}
