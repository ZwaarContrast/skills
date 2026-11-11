// Blocks writes for the whole session; usage and limits: SKILL.md, "Is it safe to touch?".
async page => {
  const ctx = page.context();
  if (ctx.__uxBlocked) return 'write guard on (already)';
  ctx.__uxBlocked = [];
  const log = note => ctx.__uxBlocked.push(note);

  const readOnlyGraphQL = req => {
    if (!/json/i.test(req.headers()['content-type'] || '')) return false;
    let ops;
    try { ops = JSON.parse(req.postData() || ''); } catch { return false; }
    ops = Array.isArray(ops) ? ops : [ops];
    // only a real GraphQL read passes: a document starting with {, query or fragment, and no mutation/subscription
    // ponytail: a field named "mutation" is blocked too; erring towards blocking is the point
    const doc = q => q.replace(/#[^\n]*/g, '').replace(/"""[\s\S]*?"""|"(?:\\.|[^"\\])*"/g, '""').trim();
    const gqlKeys = ['query', 'variables', 'operationName', 'extensions'];
    return ops.length > 0 && ops.every(o => o && typeof o.query === 'string' &&
      Object.keys(o).every(k => gqlKeys.includes(k)) &&
      /^(\{|query\b|fragment\b)/.test(doc(o.query)) && !/\b(mutation|subscription)\b/.test(doc(o.query)));
  };

  await ctx.route('**/*', route => {
    const req = route.request(), m = req.method();
    if (['GET', 'HEAD', 'OPTIONS'].includes(m) || (m === 'POST' && readOnlyGraphQL(req))) return route.continue();
    log(`${m} ${req.url()} ${(req.postData() || '').slice(0, 80)}`);
    return route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"blocked by ux-suck-hunt write guard"}' });
  });

  await ctx.routeWebSocket(/.*/, ws => {
    ws.connectToServer();   // server -> page still flows; page -> server is dropped
    ws.onMessage(m => log(`WS ${ws.url()} ${typeof m === 'string' ? m.slice(0, 80) : 'hex ' + m.toString('hex').slice(0, 80)}`));
  });

  // routeWebSocket cannot see inside workers: mute their sends and log every worker
  const muteWorker = w => {
    log(`WORKER ${w.url()}`);
    w.evaluate(() => { if (self.WebSocket) WebSocket.prototype.send = function () {}; }).catch(() => {});
  };
  const watch = p => p.on('worker', muteWorker);
  ctx.pages().forEach(watch);
  ctx.on('page', watch);
  await ctx.exposeBinding('__uxSharedWorker', (_, url) => log(`SHAREDWORKER ${url} (unguarded)`));
  await ctx.addInitScript(() => {
    const S = window.SharedWorker;
    if (S) window.SharedWorker = function (url, o) { window.__uxSharedWorker(String(url)); return new S(url, o); };
  });

  return 'write guard on: GET, HEAD, OPTIONS and read-only GraphQL reach the server; other requests, WebSocket sends and worker WebSocket sends are blocked; workers are logged';
}
