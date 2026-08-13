// In-page collector for the crash-test skill. Installed with page.addInitScript,
// so it runs before the app's own code on every navigation. Read it back with
//   playwright-cli --raw eval "JSON.stringify(__probe.report())"
// State lives in the page: a full navigation resets it. Read before you navigate.
(() => {
  if (globalThis.__probe) return;
  let t0 = performance.now();
  const calls = [];      // fetch/XHR the app made, with the stack that made it
  const longtasks = [];
  const shifts = [];
  const slowEvents = []; // interactions whose handling blew past a frame
  const intervals = new Map();
  let rafs = 0, timeouts = 0, mutations = 0;

  const where = () => (new Error().stack || '').split('\n').slice(3, 6)
    .map(s => s.trim().replace(/^at\s+/, '')).join(' < ');

  // One URL serves every GraphQL operation, so the URL alone would report a
  // normal app as firing the same request fifty times. The head of the body
  // separates the operations; identical bodies still group, which is the finding.
  const tag = b => (typeof b === 'string' ? ' ' + b.slice(0, 60).replace(/\s+/g, ' ') : '');

  // --- what the app asks the network for, and who asked ---
  const _fetch = globalThis.fetch;
  globalThis.fetch = function (input, init) {
    const start = performance.now();
    const url = typeof input === 'string' ? input : input?.url;
    const method = init?.method || input?.method || 'GET';
    const from = where(), body = tag(init?.body);
    return _fetch.apply(this, arguments).then(
      r => (calls.push({ method, url: String(url).replace(location.origin, ''), body, status: r.status, ms: Math.round(performance.now() - start), at: Math.round(start), from }), r),
      e => { calls.push({ method, url: String(url).replace(location.origin, ''), body, err: String(e), ms: Math.round(performance.now() - start), at: Math.round(start), from }); throw e; });
  };
  const _open = XMLHttpRequest.prototype.open, _send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (m, u) { this.__p = { m, u, from: where() }; return _open.apply(this, arguments); };
  XMLHttpRequest.prototype.send = function (b) {
    const p = this.__p, start = performance.now(), body = tag(b);
    if (p) this.addEventListener('loadend', () => calls.push({
      method: p.m, url: String(p.u).replace(location.origin, ''), body, status: this.status,
      ms: Math.round(performance.now() - start), at: Math.round(start), from: p.from,
    }));
    return _send.apply(this, arguments);
  };

  // --- what the app leaves running ---
  const _si = globalThis.setInterval, _ci = globalThis.clearInterval;
  globalThis.setInterval = function (fn, ms) {
    const id = _si.apply(this, arguments);
    intervals.set(id, { ms, from: where() });
    return id;
  };
  globalThis.clearInterval = function (id) { intervals.delete(id); return _ci.apply(this, arguments); };
  const _raf = globalThis.requestAnimationFrame;
  globalThis.requestAnimationFrame = function () { rafs++; return _raf.apply(this, arguments); };
  const _st = globalThis.setTimeout;
  globalThis.setTimeout = function () { timeouts++; return _st.apply(this, arguments); };

  // --- what the browser says it cost ---
  const watchers = [];
  const obs = (type, fn, extra) => {
    try {
      const o = new PerformanceObserver(l => l.getEntries().forEach(fn));
      o.observe({ type, buffered: true, ...extra });
      watchers.push(o);
    } catch {}
  };
  obs('longtask', e => longtasks.push({ ms: Math.round(e.duration), at: Math.round(e.startTime) }));
  obs('layout-shift', e => { if (!e.hadRecentInput) shifts.push({ value: e.value, at: Math.round(e.startTime), sources: (e.sources || []).map(s => desc(s.node)).filter(Boolean) }); });
  // split every slow interaction the way web.dev/articles/optimize-inp does:
  // waiting to start, running handlers, waiting for the next frame
  obs('event', e => slowEvents.push({
    name: e.name, ms: Math.round(e.duration), target: desc(e.target),
    inputDelay: Math.round(e.processingStart - e.startTime),
    processing: Math.round(e.processingEnd - e.processingStart),
    presentation: Math.round(e.duration - (e.processingEnd - e.startTime)),
  }), { durationThreshold: 40 });
  let lcp = null;
  obs('largest-contentful-paint', e => { lcp = { ms: Math.round(e.startTime), el: desc(e.element), url: e.url || null }; });

  // false here after a back/forward means the back button cost a full reload:
  // this document was rebuilt rather than restored from the back-forward cache
  let restored = null;
  addEventListener('pageshow', e => { restored = e.persisted; });

  function desc(n) {
    if (!n || n.nodeType !== 1) return null;
    return n.tagName.toLowerCase() + (n.id ? '#' + n.id : '') + (typeof n.className === 'string' && n.className ? '.' + n.className.trim().split(/\s+/).slice(0, 2).join('.') : '');
  }

  // --- how hard the DOM is churning ---
  // `document`, not documentElement: this script runs before the <html> element exists.
  let mo = null;
  try {
    mo = new MutationObserver(rs => { mutations += rs.length; });
    mo.observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
  } catch {}

  const group = () => {
    const by = new Map();
    for (const c of calls) {
      const k = c.method + ' ' + c.url + (c.body || '');
      const g = by.get(k) || { key: k, count: 0, totalMs: 0, maxMs: 0, calls: [] };
      g.count++; g.totalMs += c.ms; g.maxMs = Math.max(g.maxMs, c.ms); g.calls.push(c);
      by.set(k, g);
    }
    // A poll is not a duplicate. Judge cadence per call site, not per URL: one
    // endpoint is commonly both polled by a timer and fetched again on click,
    // and merging the two hides the timer inside an irregular-looking burst.
    const cadence = ts => {
      const at = ts.slice().sort((a, b) => a - b);
      const gaps = at.slice(1).map((t, i) => t - at[i]);
      if (gaps.length < 2) return null;
      const mean = gaps.reduce((a, b) => a + b, 0) / gaps.length;
      return mean > 0 && gaps.every(d => Math.abs(d - mean) <= 0.35 * mean) ? Math.round(mean) : null;
    };
    return [...by.values()].map(g => {
      const sites = new Map();
      for (const c of g.calls) {
        if (!sites.has(c.from)) sites.set(c.from, []);
        sites.get(c.from).push(c.at);
      }
      const polls = [];
      let burst = 0;
      for (const [from, ts] of sites) {
        const everyMs = cadence(ts);
        if (everyMs) polls.push({ from, everyMs, count: ts.length });
        else burst += ts.length;
      }
      return { key: g.key, count: g.count, burst, totalMs: g.totalMs, maxMs: g.maxMs, from: [...sites.keys()], polls };
    });
  };

  globalThis.__probe = {
    reset() { calls.length = longtasks.length = shifts.length = slowEvents.length = 0; rafs = timeouts = mutations = 0; t0 = performance.now(); },
    // Put every patched global back and stop observing, so a scenario can be
    // re-run uninstrumented to measure what the probe itself was costing.
    // The report keeps whatever was already collected.
    detach() {
      globalThis.fetch = _fetch;
      XMLHttpRequest.prototype.open = _open; XMLHttpRequest.prototype.send = _send;
      globalThis.setInterval = _si; globalThis.clearInterval = _ci;
      globalThis.requestAnimationFrame = _raf; globalThis.setTimeout = _st;
      watchers.forEach(o => { try { o.disconnect(); } catch {} });
      if (mo) mo.disconnect();
      return 'detached';
    },
    raw: () => ({ calls, longtasks, shifts, slowEvents }),
    report() {
      const res = performance.getEntriesByType('resource');
      const grouped = group();
      const secs = (performance.now() - t0) / 1000;
      const nav = performance.getEntriesByType('navigation')[0];
      const fcp = performance.getEntriesByType('paint').find(p => p.name === 'first-contentful-paint');

      // the four LCP sub-parts from web.dev/articles/optimize-lcp — which one is
      // fat tells you what to fix. Ideal split is roughly 40/<10/40/<10.
      let lcpParts = null;
      if (lcp && nav) {
        const r = lcp.url ? res.find(x => x.name === lcp.url) : null;
        const ttfb = nav.responseStart;
        const reqStart = Math.max(ttfb, r ? r.requestStart : 0);
        const resEnd = Math.max(reqStart, r ? r.responseEnd : 0);
        lcpParts = {
          ttfb: Math.round(ttfb),
          resourceLoadDelay: Math.round(reqStart - ttfb),
          resourceLoadDuration: Math.round(resEnd - reqStart),
          elementRenderDelay: Math.round(Math.max(resEnd, lcp.ms) - resEnd),
        };
      }
      return {
        window: { seconds: +secs.toFixed(1), url: location.href },
        // the same thing asked for twice in a bunch — a missing dedupe or cache
        repeated: grouped.filter(g => g.burst > 1).sort((a, b) => b.burst - a.burst).slice(0, 15),
        // evenly spaced instead: a timer. Judge it by its interval, not its count
        polling: grouped.flatMap(g => g.polls.map(p => ({ key: g.key, ...p })))
          .sort((a, b) => b.count - a.count).slice(0, 10),
        slowest: grouped.sort((a, b) => b.maxMs - a.maxMs).slice(0, 10),
        requests: { app: calls.length, allResources: res.length },
        // bytes actually over the wire; 0 for cross-origin without Timing-Allow-Origin
        bytes: res.reduce((n, r) => n + (r.transferSize || 0), 0),
        heaviest: [...res.reduce((m, r) => {
          const u = r.name.replace(location.origin, '');
          const e = m.get(u) || { url: u, kb: 0, times: 0, maxMs: 0 };
          e.kb += (r.transferSize || 0) / 1024; e.times++; e.maxMs = Math.max(e.maxMs, Math.round(r.duration));
          return m.set(u, e);
        }, new Map()).values()].map(e => ({ ...e, kb: Math.round(e.kb) })).sort((a, b) => b.kb - a.kb).slice(0, 8),
        // lab readings, not field data: one run on one machine, never a 75th percentile
        vitals: {
          ttfbMs: nav ? Math.round(nav.responseStart) : null,
          fcpMs: fcp ? Math.round(fcp.startTime) : null,
          lcpMs: lcp ? lcp.ms : null, lcpEl: lcp ? lcp.el : null, lcpParts,
          cls: +shifts.reduce((n, s) => n + s.value, 0).toFixed(4),
          // TBT is the lab stand-in for INP, which only field data can really give you
          tbtMs: longtasks.reduce((n, t) => n + Math.max(0, t.ms - 50), 0),
          worstInteractionMs: slowEvents.length ? Math.max(...slowEvents.map(e => e.ms)) : null,
        },
        // reload and read this again: what actually came back over the wire.
        // `revalidated` is the expensive-looking one — a round trip that returned
        // nothing, meaning the asset has a validator but no freshness lifetime.
        cache: (() => {
          const bucket = r => {
            if (r.transferSize === 0 && r.decodedBodySize > 0) return 'cached';
            if (r.transferSize > 0 && r.encodedBodySize === 0) return 'revalidated';
            if (r.transferSize === 0 && r.decodedBodySize === 0) return 'opaque';  // cross-origin, no Timing-Allow-Origin
            return 'network';
          };
          const out = { cached: 0, revalidated: 0, network: 0, opaque: 0, overTheWire: [] };
          for (const r of res) {
            const b = bucket(r);
            out[b]++;
            if (b !== 'cached') out.overTheWire.push({ url: r.name.replace(location.origin, ''), as: b, kb: Math.round((r.transferSize || 0) / 1024), status: r.responseStatus, via: r.deliveryType || null });
          }
          out.overTheWire = out.overTheWire.slice(0, 20);
          return out;
        })(),
        blocking: { count: longtasks.length, totalMs: longtasks.reduce((n, t) => n + t.ms, 0), worst: longtasks.slice().sort((a, b) => b.ms - a.ms).slice(0, 5) },
        shifted: shifts.slice().sort((a, b) => b.value - a.value).slice(0, 3),
        // one row per slow frame: no target means frame noise, and every event in
        // the same frame reports the same duration
        slowInteractions: [...slowEvents.filter(e => e.target)
          .reduce((m, e) => m.set(e.target + '|' + e.ms, m.get(e.target + '|' + e.ms) || e), new Map()).values()]
          .sort((a, b) => b.ms - a.ms).slice(0, 5),
        // still ticking right now — the ones with no clearInterval are the suspects
        liveIntervals: [...intervals.values()],
        churn: { mutations, mutationsPerSec: Math.round(mutations / secs), rafPerSec: Math.round(rafs / secs), timeouts },
        bfcacheRestored: restored,
        heapMB: performance.memory ? Math.round(performance.memory.usedJSHeapSize / 1048576) : null,
      };
    },
  };
})();
