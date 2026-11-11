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
    // ponytail: a field named "mutation" is blocked too; erring towards blocking is the point
    return ops.length > 0 && ops.every(o => o && typeof o.query === 'string' &&
      !/\b(mutation|subscription)\b/.test(o.query.replace(/#[^\n]*/g, '').replace(/"""[\s\S]*?"""|"(?:\\.|[^"\\])*"/g, '""')));
  };

  await ctx.route('**/*', route => {
    const req = route.request(), m = req.method();
    if (['GET', 'HEAD', 'OPTIONS'].includes(m) || (m === 'POST' && readOnlyGraphQL(req))) return route.continue();
    log(`${m} ${req.url()} ${(req.postData() || '').slice(0, 80)}`);
    return route.fulfill({ status: 503, contentType: 'application/json', body: '{"error":"blocked by ux-suck-hunt write guard"}' });
  });

  await ctx.routeWebSocket(/.*/, ws => {
    ws.connectToServer();   // server -> page still flows; page -> server is dropped
    ws.onMessage(m => log(`WS ${ws.url()} ${String(m).slice(0, 80)}`));
  });

  return 'write guard on: GET, HEAD, OPTIONS and read-only GraphQL reach the server; other requests and WebSocket sends are blocked';
}
