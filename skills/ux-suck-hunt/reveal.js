// ux-suck-hunt reveal: playwright-cli -s=$SESSION --raw run-code --filename=reveal.js
// Opens every menu, disclosure, tab, hover and right-click layer on this screen without activating anything; returns JSON, writes reveal-icon-<slug>-<n>.png. See SKILL.md.
async page => {
  const DEPTH = 3, REVEALERS = 60, HOVERS = 30, PER_KIND = 3, TIPS = 40, BUDGET = 150000, SETTLE = 300;
  const DANGER = '\\b(delete|remove|sign\\s?out|log\\s?out|logout|pay|buy|purchase|checkout|send|submit|unsubscribe|cancel\\s+subscription|archive|destroy|erase|trash|discard|leave)\\b';
  const CTRL = 'a[href],button,input:not([type=hidden]),select,textarea,summary,[contenteditable=""],[contenteditable=true],[tabindex]:not([tabindex="-1"]),' +
    ['button', 'link', 'menuitem', 'menuitemcheckbox', 'menuitemradio', 'tab', 'checkbox', 'radio', 'switch', 'option', 'combobox', 'treeitem', 'slider'].map(r => `[role=${r}]`).join(',');
  const ROW = 'tr,[role=row],li,article,[role=listitem],[role=article],[class*=card],[class*=row],[class*=item]';
  const t0 = Date.now(), base = page.url(), msg = e => e.message.split('\n')[0];
  const slug = (base.replace(/^\w+:\/\/[^/]+/, '').replace(/\?[^#]*/, '').replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home').slice(-40);   // no URL global in run-code
  const out = { url: base, controls: [], revealers: [], iconCrops: [], skipped: [], newTabs: [], dialogs: [], errors: [], capped: [] };
  const ctx = page.context(), wait = ms => page.waitForTimeout(ms), late = () => Date.now() - t0 > BUDGET;
  const onPopup = p => { out.newTabs.push(p.url()); p.close().catch(() => {}); };
  const onDialog = d => { out.dialogs.push(d.message().slice(0, 80)); d.dismiss().catch(() => {}); };
  ctx.on('page', onPopup); page.on('dialog', onDialog);

  const inject = () => page.evaluate(({ CTRL, ROW, DANGER }) => {
    if (window.__rv) return;
    const danger = new RegExp(DANGER, 'i');
    const deep = (root, sel, acc = []) => { for (const el of root.querySelectorAll('*')) { if (el.matches(sel)) acc.push(el); if (el.shadowRoot) deep(el.shadowRoot, sel, acc); } return acc; };
    const clipped = el => {   // collapsed accordions: max-height 0 + overflow hidden keeps the children's boxes
      const r = el.getBoundingClientRect();
      for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
        if (getComputedStyle(a).overflow === 'visible') continue;
        const p = a.getBoundingClientRect();
        if (r.right <= p.left || r.left >= p.right || r.bottom <= p.top || r.top >= p.bottom) return true;
      }
      return false;
    };
    const vis = el => { const r = el.getBoundingClientRect(); return r.width > 1 && r.height > 1 && el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) && !clipped(el); };
    const clean = s => (s || '').trim().replace(/\s+/g, ' ');
    const text = el => clean(el.innerText).slice(0, 60);
    const a11y = el => { const root = el.getRootNode(), field = /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName);
      return [
        (el.getAttribute('aria-labelledby') || '').split(/\s+/).map(id => id && root.getElementById?.(id)?.textContent).join(' '),
        el.getAttribute('aria-label'),
        [...(el.labels || [])].map(l => l.innerText).join(' '),
        el.tagName === 'INPUT' && /^(submit|button|reset|image)$/.test(el.type) ? el.value || el.alt : '',
        field ? '' : el.innerText,
        field ? '' : [...el.querySelectorAll('img[alt],svg[aria-label],svg title')].map(e => e.getAttribute('alt') || e.getAttribute('aria-label') || e.textContent).join(' '),
        el.title, field ? el.placeholder : '',
      ].map(clean).find(Boolean)?.slice(0, 60) || ''; };
    const iconOnly = el => el.tagName === 'INPUT' ? el.type === 'image' : !/^(SELECT|TEXTAREA)$/.test(el.tagName) && !el.isContentEditable && !/[\p{L}\p{N}]/u.test(el.innerText || '');
    const sel = el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + ((el.getAttribute('class') || '').trim() ? '.' + el.getAttribute('class').trim().split(/\s+/).slice(0, 2).join('.') : '');
    const MORE = /\b(menu|more|options?|kebab|overflow|hamburger|burger|dots|ellipsis|actions)\b|[⋮⋯…☰≡]/i;
    const kind = el => {
      const role = el.getAttribute('role'), hp = el.getAttribute('aria-haspopup'), ex = el.getAttribute('aria-expanded');
      if (role === 'tab') return el.getAttribute('aria-selected') === 'true' ? null : 'tab';
      if (el.tagName === 'SUMMARY') return el.parentElement?.open ? null : 'click';
      if (ex === 'true' || el.disabled || el.getAttribute('aria-disabled') === 'true') return null;
      if ((hp && hp !== 'false') || ex === 'false') return 'click';
      if (iconOnly(el) && (/^(BUTTON|A)$/.test(el.tagName) || role === 'button') && MORE.test([a11y(el), el.id, el.getAttribute('class'), el.textContent].join(' '))) return 'click';
      return null;
    };
    const key = el => [el.tagName, el.getAttribute('role') || '', a11y(el) || text(el)].join('|');
    const controls = () => deep(document, CTRL).filter(vis);
    const desc = (el, pool, k = key) => ({ key: k(el), n: pool.filter(x => k(x) === k(el)).indexOf(el) });
    const info = (el, pool) => { const name = a11y(el), t = text(el);
      return { name: name || t || el.title || sel(el), text: t, a11yName: name, iconOnly: iconOnly(el), role: el.getAttribute('role') || el.tagName.toLowerCase(), sel: sel(el),
        revealer: kind(el), popup: !!el.getAttribute('aria-haspopup') && el.getAttribute('aria-haspopup') !== 'false', danger: danger.test(name + ' ' + t) || (el.type === 'submit' && !!el.form), d: desc(el, pool) }; };
    const rowKey = el => el.tagName + '|' + clean(el.innerText).slice(0, 40);
    const rowsAll = () => deep(document, ROW).filter(vis);
    window.__rv = {
      list() { const c = controls(); this.fresh = c; return c.map(el => info(el, c)); },
      snap() { this.before = new Set(controls()); this.counts = {}; for (const el of this.before) this.counts[key(el)] = (this.counts[key(el)] || 0) + 1; },
      diff(trigger) {   // by element and by name, so a re-rendered layer does not count twice
        const now = controls(), groups = {};
        for (const el of now) (groups[key(el)] ||= []).push(el);
        const fresh = new Set();
        for (const [k, els] of Object.entries(groups)) {
          const extra = els.length - (this.counts[k] || 0);
          if (extra > 0) els.filter(e => !this.before.has(e)).concat(els.filter(e => this.before.has(e))).slice(0, extra).forEach(e => fresh.add(e));
        }
        this.fresh = now.filter(e => fresh.has(e) && e !== trigger);
        return this.fresh.map(el => info(el, now));
      },
      find(d) { if (d.row) { const r = rowsAll(); return r.filter(x => rowKey(x) === d.key)[d.n] || null; } return controls().filter(x => key(x) === d.key)[d.n] || null; },
      rows(perKind) {
        const all = rowsAll(), picked = [], seen = {};
        const add = r => { if (!r || picked.includes(r) || r === document.body) return; const b = r.getBoundingClientRect();
          if (b.width * b.height > innerWidth * innerHeight * 0.6) return;
          const k = r.tagName + '.' + (r.getAttribute('class') || ''); if ((seen[k] = (seen[k] || 0) + 1) > perKind) return; picked.push(r); };
        for (const el of deep(document, CTRL)) if (!vis(el)) { const r = el.parentElement?.closest(ROW); if (r && vis(r) && r.getBoundingClientRect().width) add(r); }
        for (const r of all) if (r.matches('tr,[role=row],article,[class*=card]')) add(r);
        return picked.map(r => ({ row: true, ...desc(r, all, rowKey), name: clean(r.innerText).split(/ {2,}|\t/)[0].slice(0, 40) || sel(r) }));
      },
      texts() { const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT), s = new Set();
        for (let n; (n = w.nextNode());) { const p = n.parentElement; if (clean(n.data) && p && !p.closest(CTRL) && p.checkVisibility({ opacityProperty: true, visibilityProperty: true })) s.add(clean(n.data).slice(0, 80)); }
        return [...s]; },
      sig() { return [location.href, controls().map(key).sort().join('~'), deep(document, '[aria-expanded="true"]').length + ' expanded',
        document.querySelectorAll('details[open]').length + ' details open', deep(document, '[role=tab][aria-selected="true"]').map(key).join('~'),
        deep(document, 'dialog[open],[role=dialog],[role=alertdialog],[role=menu],[role=listbox],[role=tooltip]').filter(vis).length + ' layers'].join('\n'); },
      point(d) {   // a spot inside the row that the row itself receives, not a gap or a control
        const el = this.find(d); if (!el) return null;
        el.scrollIntoView({ block: 'nearest' });
        const r = el.getBoundingClientRect();
        for (const fy of [0.5, 0.25, 0.75]) for (const fx of [0.05, 0.2, 0.4, 0.6, 0.8, 0.95]) { const x = r.left + r.width * fx, y = r.top + r.height * fy, e = document.elementFromPoint(x, y);
          if (e && el.contains(e) && !e.closest(CTRL)) return [x, y]; }
        return [r.left + r.width / 2, r.top + r.height / 2]; },
      away() { const W = innerWidth, H = innerHeight;
        return [[W - 2, H - 2], [1, H - 2], [W - 2, 1], [1, 1], [W / 2, H - 2]].find(([x, y]) => { const e = document.elementFromPoint(x, y); return !e || !e.closest(CTRL + ',' + ROW); }) || [W - 2, H - 2]; },
      spot() {   // a right-click point on the main content that is not on a control
        const m = document.querySelector('main,[role=main]') || document.body, r = m.getBoundingClientRect();
        const [x0, y0, x1, y1] = [Math.max(r.left, 0), Math.max(r.top, 0), Math.min(r.right, innerWidth), Math.min(r.bottom, innerHeight)];
        for (let i = 1; i < 5; i++) for (let j = 1; j < 5; j++) { const x = x0 + (x1 - x0) * j / 5, y = y0 + (y1 - y0) * i / 5, e = document.elementFromPoint(x, y);
          if (e && !e.closest(CTRL)) return [x, y]; }
        return null; },
    };
  }, { CTRL, ROW, DANGER });

  const rv = (fn, arg) => page.evaluate(([fn, arg]) => window.__rv[fn](arg), [fn, arg]);
  const handle = async d => (await page.evaluateHandle(d => window.__rv.find(d), d)).asElement();
  const away = async () => { const [x, y] = await rv('away'); await page.mouse.move(x, y); };
  let baseSig, baseTabs;
  const settled = async () => page.url() === base && (await rv('sig')) === baseSig;
  const home = async () => { if (page.url() !== base) { await page.goBack().catch(() => {}); if (page.url() !== base) await page.goto(base); } else await page.reload(); await page.waitForLoadState('load').catch(() => {}); await inject(); };
  const restoreTabs = async () => { for (const d of baseTabs) { const h = await handle(d); if (h && !(await h.evaluate(e => e.getAttribute('aria-selected') === 'true'))) await h.click({ timeout: 2000 }).catch(() => {}); } await wait(SETTLE); };

  // closes whatever is open; says how, and whether focus came back to the revealer
  const close = async (h, how, popup) => {
    await away();
    if (await settled()) return { closedBy: 'nothing to close' };
    if (how === 'tab') { await restoreTabs(); if (await settled()) return { closedBy: 'original tab' }; }
    if (h && !popup && await h.isVisible().catch(() => false)) { await h.click({ timeout: 2000 }).catch(() => {}); await wait(SETTLE); await away(); if (await settled()) return { closedBy: 'click again' }; }
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Escape'); await wait(SETTLE);
      if (await settled()) {
        const focusReturned = h ? await h.evaluate(e => e.isConnected && (document.activeElement === e || e.contains(document.activeElement))).catch(() => false) : null;
        return { closedBy: 'escape', focusReturned };
      }
    }
    if (h && await h.isVisible().catch(() => false)) { await h.click({ timeout: 2000 }).catch(() => {}); await wait(SETTLE); await away(); if (await settled()) return { closedBy: 'click again' }; }
    await restoreTabs(); if (await settled()) return { closedBy: 'original tab' };
    await home(); await away();
    return { closedBy: (await settled()) ? 'reload' : 'stuck' };
  };
  const reset = async () => { await away(); if (!(await settled())) await close(null); await page.evaluate(() => document.activeElement?.blur()); };

  const act = async s => {
    if (s.how === 'contextmenu') { await page.mouse.click(s.x, s.y, { button: 'right' }); await wait(SETTLE); return true; }
    if (s.how === 'hover') { const p = await rv('point', s.d); if (!p) return false; await page.mouse.move(p[0], p[1]); await wait(SETTLE); return true; }
    const h = await handle(s.d);
    if (!h) return false;
    await h.click({ timeout: 2000 });
    await wait(SETTLE);
    return h;
  };

  let crops = 0, tips = 0;
  const inspectIcon = async (c, i) => {   // crop and tooltip for an icon-only control in __rv.fresh[i]
    const h = (await page.evaluateHandle(i => window.__rv.fresh[i], i)).asElement();
    if (!h) return;
    try {
      const b = await h.boundingBox(), vp = page.viewportSize();
      if (b && vp) {
        const x = Math.max(0, b.x - 6), y = Math.max(0, b.y - 6), path = `reveal-icon-${slug}-${++crops}.png`;
        await page.screenshot({ path, clip: { x, y, width: Math.min(b.width + 12, vp.width - x), height: Math.min(b.height + 12, vp.height - y) } });
        c.crop = path; out.iconCrops.push(path);
      }
      if (++tips > TIPS) return;
      const title = await h.evaluate(e => (e.title || e.querySelector('svg title')?.textContent || '').trim() || null);
      const before = new Set(await rv('texts'));
      const shown = async () => (await rv('texts')).filter(t => !before.has(t)).join(' / ').slice(0, 80) || null;
      await h.hover({ timeout: 1000 }); await wait(700);
      const onHover = await shown();
      await h.evaluate(e => e.focus()); await wait(400);
      const onFocus = await shown();
      await h.evaluate(e => e.blur());
      c.tooltip = onHover || onFocus || title ? { text: onHover || onFocus || title, hover: !!onHover, focus: !!onFocus, title: !!title } : null;
    } catch (e) { out.errors.push(`icon ${c.name}: ${msg(e)}`); } finally { await h.dispose(); }
  };

  // records what a step revealed and queues the revealers inside it
  const record = async (found, task, by, queue) => {
    const path = task.path, depth = task.depth + 1, hoverOnly = task.chain.some(s => s.how === 'hover');
    for (const [i, f] of found.entries()) {
      const c = { name: f.name, text: f.text, iconOnly: f.iconOnly, a11yName: f.a11yName, tooltip: null, depth, path, revealedBy: by, hoverOnly, role: f.role, sel: f.sel };
      if (f.iconOnly && depth <= 1) await inspectIcon(c, i);
      out.controls.push(c);
      if (!f.revealer) continue;
      if (f.danger) { out.skipped.push(`${[...path, f.name].join(' > ')} (destructive or leaving)`); continue; }
      if (depth >= DEPTH) { out.capped.push(`depth ${DEPTH}: ${[...path, f.name].join(' > ')} not opened`); continue; }
      queue.push({ chain: [...task.chain, { how: f.revealer, d: f.d }], depth, path: [...path, f.name], name: f.name, popup: f.popup });
    }
  };

  try {
    await inject();
    await page.evaluate(() => { document.activeElement?.blur(); });
    await away(); await wait(SETTLE);
    baseSig = await rv('sig');
    const zero = await rv('list');
    baseTabs = zero.filter(f => f.role === 'tab' && !f.revealer).map(f => f.d);
    const queue = [];
    await record(zero, { chain: [], depth: -1, path: [] }, null, queue);
    for (const c of out.controls) c.revealedBy = null;
    await reset();

    // hover rows and cards: actions that only appear under the mouse
    const rows = await rv('rows', PER_KIND);
    if (rows.length > HOVERS) out.capped.push(`hover: ${rows.length} rows or cards, hovered ${HOVERS}`);
    for (const r of rows.slice(0, HOVERS)) {
      if (late()) break;
      try {
        await reset(); await rv('snap');
        if (!(await act({ how: 'hover', d: r }))) continue;
        const found = await page.evaluate(() => window.__rv.diff(null));
        await record(found, { chain: [{ how: 'hover', d: r }], depth: 0, path: [`hover: ${r.name}`] }, 'hover', queue);
      } catch (e) { out.errors.push(`hover ${r.name}: ${msg(e)}`); }
    }

    // one right-click on the main content
    try {
      await reset();
      const spot = await rv('spot');
      if (spot) {
        await rv('snap');
        await page.mouse.click(spot[0], spot[1], { button: 'right' }); await wait(SETTLE);
        const found = await page.evaluate(() => window.__rv.diff(null));
        await record(found, { chain: [{ how: 'contextmenu', x: spot[0], y: spot[1] }], depth: 0, path: ['right-click'] }, 'contextmenu', queue);
        out.contextMenu = found.length ? `custom menu, ${found.length} items` : 'none (browser menu)';
        await close(null);
      }
    } catch (e) { out.errors.push('right-click: ' + msg(e)); }

    let opened = 0;
    while (queue.length) {
      if (opened >= REVEALERS || late()) { out.capped.push(`revealers: ${queue.length} left unopened (${late() ? 'time budget ' + BUDGET / 1000 + 's' : 'cap ' + REVEALERS})`); break; }
      const task = queue.shift(), last = task.chain.at(-1), entry = { name: task.name, depth: task.depth, path: task.path.slice(0, -1), how: last.how, popup: task.popup };
      opened++;
      let h;
      try {
        await reset();
        for (const s of task.chain.slice(0, -1)) if (!(await act(s))) throw new Error('could not reopen ' + task.path.slice(0, -1).join(' > '));
        await rv('snap');
        h = await handle(last.d);
        if (!h) throw new Error('revealer gone');
        await h.click({ timeout: 2000 }); await wait(SETTLE);
        if (page.url() !== base) {
          entry.navigated = page.url(); opened--;
          const c = out.controls.find(c => c.depth === task.depth && c.name === task.name && !c.navigated);
          if (c) c.navigated = true;
          await home(); out.revealers.push(entry); continue;
        }
        const found = await page.evaluate(t => window.__rv.diff(t), h);
        entry.revealed = found.length;
        await record(found, task, last.how, queue);
        Object.assign(entry, await close(task.chain.length === 1 ? h : null, last.how, task.popup));
      } catch (e) {
        if (page.url() !== base) { entry.navigated = page.url(); opened--; await home().catch(() => {}); }
        else { entry.error = msg(e); out.errors.push(`${task.path.join(' > ')}: ${msg(e)}`); }
      } finally { await h?.dispose().catch(() => {}); }
      out.revealers.push(entry);
    }

    const label = c => [...c.path, c.name].join(' > ');
    const elsewhere = new Set(out.controls.filter(c => c.path[0] !== 'right-click').map(c => c.name.toLowerCase()));
    out.summary = {
      countsByDepth: out.controls.reduce((a, c) => (a[c.depth] = (a[c.depth] || 0) + 1, a), {}),
      revealersOpened: out.revealers.filter(r => !r.navigated).length,
      iconOnly: out.controls.filter(c => c.iconOnly).map(c => ({ control: label(c), a11yName: c.a11yName || null, hasName: /[\p{L}\p{N}]/u.test(c.a11yName), tooltip: c.tooltip?.text || null, tooltipOn: c.tooltip ? ['hover', 'focus', 'title'].filter(k => c.tooltip[k]) : [], crop: c.crop || null })),
      deep: out.controls.filter(c => c.depth >= 2).map(label),
      hoverOnly: [...new Set(out.controls.filter(c => c.hoverOnly).map(label))],
      contextMenuOnly: out.controls.filter(c => c.path[0] === 'right-click' && !elsewhere.has(c.name.toLowerCase())).map(c => c.name),
      navigated: out.revealers.filter(r => r.navigated).map(r => `${[...r.path, r.name].join(' > ')} -> ${r.navigated}`),
      focusNotReturned: out.revealers.filter(r => r.focusReturned === false).map(r => r.name),
      popupNotClosedByEscape: out.revealers.filter(r => r.popup && r.closedBy && r.closedBy !== 'escape').map(r => `${r.name}: ${r.closedBy}`),
    };
    return out;
  } finally {
    try {
      if (baseSig) { await reset(); out.endState = { sameUrl: page.url() === base, layersClosed: await settled() }; }
      await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); delete window.__rv; });
    } catch (e) { out.errors.push('restore: ' + msg(e)); }
    ctx.off('page', onPopup); page.off('dialog', onDialog);
    out.runtimeMs = Date.now() - t0;
  }
}
