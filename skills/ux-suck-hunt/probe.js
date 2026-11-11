// ux-suck-hunt measuring probe: playwright-cli -s=$SESSION --raw run-code --filename=probe.js
// Needs axe.min.js beside it; returns JSON and writes ux-<slug>-<stamp>-<width>.png. See SKILL.md.
async page => {
  const AXE = 'axe.min.js', TABS = 80, AXE_PX = 25, IMG_TEXT = 20, IMG_LOOK = 60, HOVERS = 40, STATES = 15;
  const msg = e => e.message.split('\n')[0];
  const slug = (page.url().replace(/^\w+:\/\/[^/]+/, '').replace(/\?[^#]*/, '').replace(/\W+/g, '-').replace(/^-|-$/g, '') || 'home').slice(-40);   // no URL global in run-code
  const stamp = Date.now().toString(36);
  const out = { url: page.url(), errors: [], screenshots: [], viewports: {}, pixelContrast: [],
    limits: `text on images: ${IMG_TEXT} measured of the first ${IMG_LOOK} found per width; axe-undecided text: ${AXE_PX}; hover: ${HOVERS} distinct styles; selected states: ${STATES} groups; keyboard: ${TABS} tabs`, capped: [] };
  const before = page.viewportSize();
  let reloaded = false;
  // hide the text, screenshot its box, compare its colour (transparency blended in) with every pixel behind it; shadows and scrims stay in
  const pixel = async (h, base) => {
    try {
      const meta = await h.evaluate(e => {
        const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); let o = e;
        for (let n; (n = w.nextNode());) if (n.data.trim()) { o = n.parentElement; break; }
        const cs = getComputedStyle(o), size = parseFloat(cs.fontSize), all = [e, ...e.querySelectorAll('*')];
        let opacity = 1; for (let a = o; a; a = a.parentElement || a.getRootNode().host) opacity *= +getComputedStyle(a).opacity;
        e.scrollIntoView({ block: 'nearest' });
        const g = document.createRange(); g.selectNodeContents(e);
        const t = g.getBoundingClientRect(), b = e.getBoundingClientRect();
        const m = { color: cs.color, opacity, large: size >= 24 || (parseInt(cs.fontWeight) >= 700 && size >= 18.66), text: e.innerText.trim().slice(0, 40),
          shadow: all.some(x => getComputedStyle(x).textShadow !== 'none'), crop: [t.left - b.left, t.top - b.top, t.width, t.height, b.width] };
        e.__uxUndo = all.map(x => [x, x.hasAttribute('style'), ['color', '-webkit-text-fill-color'].map(p => [p, x.style.getPropertyValue(p), x.style.getPropertyPriority(p)])]);
        for (const x of all) for (const p of ['color', '-webkit-text-fill-color']) x.style.setProperty(p, 'transparent', 'important');
        return m;
      });
      let png;
      try { png = (await h.screenshot({ animations: 'disabled', timeout: 3000 })).toString('base64'); }
      catch (e) { throw new Error(/Timeout/.test(e.message) ? 'moving or covered, check by eye' : msg(e)); }
      finally {
        await h.evaluate(e => {
          for (const [x, had, ps] of e.__uxUndo || []) { for (const [p, v, pr] of ps) v ? x.style.setProperty(p, v, pr) : x.style.removeProperty(p); if (!had && !x.style.length) x.removeAttribute('style'); }
          delete e.__uxUndo;
        }).catch(() => {});
      }
      const r = await page.evaluate(async ({ png, color, opacity, crop }) => {
        const c = document.createElement('canvas'), x = c.getContext('2d', { willReadFrequently: true });
        c.width = c.height = 1; x.fillStyle = color; x.fillRect(0, 0, 1, 1);   // any CSS colour syntax -> sRGB + alpha
        const [tr, tg, tb, ta] = x.getImageData(0, 0, 1, 1).data, a = ta / 255 * opacity;
        const img = new Image(); img.src = 'data:image/png;base64,' + png; await img.decode();
        c.width = img.width; c.height = img.height; x.drawImage(img, 0, 0);
        const d = x.getImageData(0, 0, c.width, c.height).data, k = img.width / (crop[4] || img.width);
        const [x0, y0] = [Math.max(0, Math.floor(crop[0] * k)), Math.max(0, Math.floor(crop[1] * k))], [x1, y1] = [Math.min(c.width, Math.ceil((crop[0] + crop[2]) * k)), Math.min(c.height, Math.ceil((crop[1] + crop[3]) * k))];
        const lum = (r, g, b) => [r, g, b].map(v => (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
        const ratios = [], m = x1 - x0 > 2 && y1 - y0 > 2 ? 1 : 0;   // edge pixels can belong to the surroundings
        for (let y = y0 + m; y < y1 - m; y++) for (let x = x0 + m; x < x1 - m; x += 4) {
          const i = (y * c.width + x) * 4, bg = [d[i], d[i + 1], d[i + 2]], l = lum(...bg), L = lum(...[tr, tg, tb].map((t, j) => a * t + (1 - a) * bg[j]));
          ratios.push((Math.max(L, l) + 0.05) / (Math.min(L, l) + 0.05));
        }
        ratios.sort((a, b) => a - b);
        return ratios.length ? { p5: +ratios[Math.floor(ratios.length * 0.05)].toFixed(2), median: +ratios[Math.floor(ratios.length / 2)].toFixed(2) } : null;
      }, { png, color: meta.color, opacity: meta.opacity, crop: meta.crop });
      if (!r) throw new Error('text box is empty');
      return { ...base, text: meta.text, large: meta.large, ...r, fails: r.p5 < (meta.large ? 3 : 4.5), ...(meta.shadow && { hasTextShadow: true }) };
    } catch (e) { return { ...base, error: msg(e) }; }
  };
  const imageText = async w => {   // text over an image, video, canvas or gradient: it sits on a different part of it at every width
    const n = await page.evaluate(() => window.__ux.findImageText());
    let i = 0;
    for (let measured = 0; i < Math.min(n, IMG_LOOK) && measured < IMG_TEXT; i++) {
      const pre = await page.evaluate(i => window.__ux.prep(i), i);
      if (pre.skip) continue;
      measured++;
      if (pre.error) { out.pixelContrast.push({ width: w, node: pre.sel, on: pre.on, error: pre.error }); continue; }
      const h = (await page.evaluateHandle(i => window.__ux.found[i].el, i)).asElement();
      out.pixelContrast.push(await pixel(h, { width: w, node: pre.sel, on: pre.on }));
      if (w === 1280) await h.evaluate(e => (window.__uxMeasured ||= new Set()).add(e));
      await h.dispose();
    }
    if (n > i) out.capped.push(`text on images at ${w}px: ${n} found, ${i} looked at`);
    await page.evaluate(() => scrollTo(0, 0));
  };
  try {
    await page.evaluate(() => { window.__ux = {
      vis: el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el);
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; },
      hidden: el => { const r = el.getBoundingClientRect(), s = getComputedStyle(el);   // sr-only / visually hidden
        return (r.width <= 1 && r.height <= 1) || /rect\(0px,? 0px,? 0px,? 0px\)/.test(s.clip) || /inset\((50|100)%\)/.test(s.clipPath) || s.opacity === '0'; },
      name: el => { const root = el.getRootNode(), field = /^(INPUT|SELECT|TEXTAREA)$/.test(el.tagName);   // accessible-name order
        return [
          (el.getAttribute('aria-labelledby') || '').split(/\s+/).map(id => id && root.getElementById?.(id)?.textContent).join(' '),
          el.getAttribute('aria-label'),
          [...(el.labels || [])].map(l => l.innerText).join(' '),
          el.tagName === 'INPUT' && /^(submit|button|reset)$/.test(el.type) ? el.value : '',
          field ? el.placeholder : el.innerText,
          field ? '' : [...el.querySelectorAll('img[alt],svg[aria-label]')].map(e => e.getAttribute('alt') || e.getAttribute('aria-label')).join(' '),
          el.title, el.getAttribute('alt'),
        ].map(s => (s || '').trim().replace(/\s+/g, ' ')).find(Boolean)?.slice(0, 40) || ''; },
      sel: el => el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (typeof el.className === 'string' && el.className.trim() ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : ''),
      settle: (el, ms) => Promise.race([Promise.all(el.getAnimations({ subtree: true }).filter(a => a.transitionProperty).map(a => a.finished)), new Promise(r => setTimeout(r, ms))]).catch(() => {}),
      look: async el => {   // what focus may change, after focus transitions end
        await window.__ux.settle(el, 600);
        const v = el.ownerDocument.defaultView;
        return [null, '::before', '::after'].map(p => { const c = v.getComputedStyle(el, p);
          return [c.outlineStyle, c.outlineWidth, c.outlineColor, c.outlineOffset, c.boxShadow, c.borderColor, c.borderWidth, c.backgroundColor, c.color, c.textDecorationLine, c.opacity, c.content].join('|'); }).join('/'); },
    }; });
    await page.evaluate(() => {
      const U = window.__ux, { vis, hidden, sel } = U, x = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
      const rgba = U.rgba = c => { x.clearRect(0, 0, 1, 1); x.fillStyle = '#0000'; x.fillStyle = c; x.fillRect(0, 0, 1, 1); const d = x.getImageData(0, 0, 1, 1).data; return [d[0], d[1], d[2], d[3] / 255]; };
      const lum = c => c.slice(0, 3).map(v => (v /= 255) <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((s, v, i) => s + v * [0.2126, 0.7152, 0.0722][i], 0);
      const ratio = (a, b) => { const [p, q] = [lum(a), lum(b)]; return +((Math.max(p, q) + 0.05) / (Math.min(p, q) + 0.05)).toFixed(2); };
      const over = (c, bg) => [0, 1, 2].map(i => c[3] * c[i] + (1 - c[3]) * bg[i]);
      const up = e => e.parentElement || e.getRootNode().host;
      const owner = e => { const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT); for (let n; (n = w.nextNode());) if (n.data.trim() && vis(n.parentElement)) return n.parentElement; return e; };
      const ink = e => { let o = 1; for (let a = e; a; a = up(a)) o *= +getComputedStyle(a).opacity; const c = rgba(getComputedStyle(e).color); c[3] *= o; return c; };
      const large = e => { const cs = getComputedStyle(e), z = parseFloat(cs.fontSize); return z >= 24 || (parseInt(cs.fontWeight) >= 700 && z >= 18.66); };
      const fill = e => {   // solid colour behind e from its ancestors, null over an image or gradient
        const layers = [];
        for (let a = e; a; a = up(a)) { const cs = getComputedStyle(a);
          if (cs.backgroundImage !== 'none' || /^(IMG|VIDEO|CANVAS)$/.test(a.tagName)) return null;
          const c = rgba(cs.backgroundColor); if (c[3]) layers.push(c); if (c[3] === 1) break; }
        return layers.reduceRight((bg, c) => over(c, bg), [255, 255, 255]);
      };
      const box = (e, text) => { const r = e === document.body || e === document.documentElement ? null : text ? (() => { const g = document.createRange(); g.selectNodeContents(e); return g.getBoundingClientRect(); })() : e.getBoundingClientRect();
        return r ? { left: r.left + scrollX, top: r.top + scrollY, right: r.right + scrollX, bottom: r.bottom + scrollY, area: r.width * r.height } : { left: -1e9, top: -1e9, right: 1e9, bottom: 1e9, area: 1e18 }; };
      const overlap = (a, b) => Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left)) * Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top));
      const imgs = () => [...document.querySelectorAll('html,body,body *')].map(e => {
        const b = e.getBoundingClientRect(); if (b.width < 16 || b.height < 16 || !vis(e)) return null;
        const bg = [null, '::before', '::after'].map(p => getComputedStyle(e, p).backgroundImage).find(v => v !== 'none'), t = e.tagName;
        const kind = /^(IMG|VIDEO|CANVAS)$/.test(t) ? t.toLowerCase() : t === 'svg' && b.width >= 48 && b.height >= 48 ? 'svg' : bg ? (/url\(/.test(bg) ? 'background-image' : 'gradient') : null;
        return kind && { e, r: box(e), kind, bg };
      }).filter(Boolean);
      const onImage = (e, ims) => { const t = box(e, true); return ims.some(i => !(i.e !== e && e.contains(i.e)) && overlap(t, i.r) > 0.25 * t.area); };
      const state = e => { const o = owner(e), bg = onImage(o, U.ims) ? null : fill(o), fg = ink(o), cs = getComputedStyle(o), ce = getComputedStyle(e);
        return { sel: sel(e), text: e.innerText.trim().slice(0, 30), large: large(o), color: cs.color, bg: bg && `rgb(${bg.map(Math.round)})`, ratio: bg && ratio(over(fg, bg), bg),
          sig: [cs, ce].map(c => [c.color, c.backgroundColor, c.backgroundImage, c.textDecorationLine, c.borderColor, c.boxShadow, c.opacity, c.fontWeight, c.transform].join('|')).join('/') }; };
      Object.assign(U, { state,
        findImageText: () => {
          const ims = imgs(), own = new Set([...document.querySelectorAll('body *')].filter(e => !/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|OPTION)$/.test(e.tagName)
            && [...e.childNodes].some(n => n.nodeType === 3 && n.data.trim()) && vis(e) && !hidden(e) && e.getElementsByTagName('*').length <= 50));
          U.found = [];
          for (const e of own) {
            if (getComputedStyle(e).display === 'inline' && own.has(e.parentElement)) continue;
            const t = box(e, true); if (!t.area) continue;
            const under = ims.filter(i => !(i.e !== e && e.contains(i.e)) && overlap(t, i.r) > 0.25 * t.area);
            if (under.length) U.found.push({ el: e, under });
          }
          return U.found.length;
        },
        prep: async i => {   // scroll to it, wait until what is under it has loaded, skip text that sits on a solid layer above the image
          const { el, under } = U.found[i], wait = (p, ms) => Promise.race([p, new Promise(r => setTimeout(r, ms))]).catch(() => {});
          el.scrollIntoView({ block: 'center' });
          const res = { sel: sel(el), on: [...new Set(under.map(u => u.kind))].join('+') };
          for (const { e, bg } of under) {
            if (e.tagName === 'IMG') {
              const lazy = () => (e.dataset.src && e.getAttribute('src') !== e.dataset.src) || (e.dataset.srcset && e.getAttribute('srcset') !== e.dataset.srcset);   // JS lazy loaders swap these in on scroll
              for (let t = 0; lazy() && t < 20; t++) await new Promise(r => setTimeout(r, 100));
              await wait(e.decode(), 3000);
              if (!e.complete || !e.naturalWidth || lazy()) return { ...res, error: 'image under it did not load, check by eye' };
            } else if (e.tagName === 'VIDEO') {
              if (e.readyState < 2) await wait(new Promise(r => e.addEventListener('loadeddata', r, { once: true })), 3000);
              if (e.readyState < 2 && !e.poster) return { ...res, error: 'video under it did not load, check by eye' };
            } else for (const [, u] of (bg || '').matchAll(/url\("?(.*?)"?\)/g)) { const im = new Image(); im.src = u; await wait(im.decode(), 3000); }
          }
          await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
          const r = el.getBoundingClientRect(), es = document.elementsFromPoint(r.left + r.width / 2, r.top + r.height / 2);
          for (const e of es.slice(es.indexOf(el) + 1)) {
            if (under.some(u => u.e === e)) break;
            const cs = getComputedStyle(e);
            if (!el.contains(e) && rgba(cs.backgroundColor)[3] === 1 && cs.backgroundImage === 'none') return { skip: true };
          }
          return res;
        },
        hoverables: n => {
          U.ims = imgs();
          const seen = new Set(), all = [...document.querySelectorAll('a[href],button,[role=button],[role=link],[role=tab],[role=menuitem],[role=option],summary')].filter(e => vis(e) && !hidden(e) && e.innerText?.trim());
          U.picked = all.filter(e => { const c = getComputedStyle(owner(e)), k = [e.tagName, e.className, c.color, c.fontSize, getComputedStyle(e).backgroundColor].join('|'); return !seen.has(k) && seen.add(k); });
          return [all.length, U.picked.length];
        },
        away: e => { const r = e.getBoundingClientRect();
          return [[0, 0], [innerWidth - 1, innerHeight - 1], [innerWidth - 1, 0], [0, innerHeight - 1]].find(([x, y]) => !(x >= r.left && x <= r.right && y >= r.top && y <= r.bottom) && !e.contains(document.elementFromPoint(x, y))) || [0, 0]; },
        states: n => {
          U.ims = imgs();
          const on = e => e.getAttribute('aria-selected') === 'true' || (e.hasAttribute('aria-current') && e.getAttribute('aria-current') !== 'false') || e.getAttribute('aria-pressed') === 'true' || e.getAttribute('aria-checked') === 'true' || !!e.control?.checked || e.checked === true;
          const item = e => e.tagName !== 'INPUT' ? e : getComputedStyle(e).appearance !== 'none' && !hidden(e) ? null : e.labels?.[0] || null;   // a native box draws its own state
          const shape = (e, p) => { const c = getComputedStyle(e, p);
            return [c.fontWeight, c.fontStyle, c.fontSize, c.textDecorationLine, c.textTransform, c.borderStyle, c.borderWidth, c.outlineStyle, c.outlineWidth, c.boxShadow.replace(/rgba?\([^)]*\)/g, ''), c.backgroundImage === 'none', c.transform,
              p ? [c.content, c.display, Math.round(parseFloat(c.width) / e.offsetWidth * 10), c.height, rgba(c.backgroundColor)[3] > 0] : ''].join('|'); };
          const parts = e => [e, owner(e)].flatMap(x => [null, '::before', '::after'].map(p => [x, p]));
          const look = e => [...parts(e).map(([x, p]) => shape(x, p)), [...e.querySelectorAll('svg,img')].filter(vis).length, fill(e)?.join() !== fill(up(e))?.join()].join('/');
          const paint = e => parts(e).flatMap(([x, p], i) => { const c = getComputedStyle(x, p), off = (i > 2 && x === e) || (p && c.content === 'none');   // only colours that are drawn
            return [['color', 1], ['background-color', 1], ['border-color', parseFloat(c.borderWidth) > 0], ['outline-color', c.outlineStyle !== 'none'], ['text-decoration-color', c.textDecorationLine !== 'none'], ['box-shadow', 1]]
              .map(([k, on]) => [(i > 2 ? 'text' : '') + (p || '') + ' ' + k, !off && on ? c.getPropertyValue(k) : '']); });
          const groups = new Set(), res = []; let total = 0; U.st = [];
          for (const s of document.querySelectorAll('[aria-selected=true],[aria-current]:not([aria-current=false]),[aria-pressed=true],[aria-checked=true],input:checked')) {
            const it = item(s); if (!it || !vis(it) || hidden(it)) continue;
            const g = it.closest('[role=tablist],[role=listbox],[role=radiogroup],[role=menu],[role=menubar],[role=toolbar],[role=group],[role=tree],[role=grid],nav,ul,ol,fieldset') || it.parentElement?.parentElement;
            const peer = g && !groups.has(g) && [...g.querySelectorAll(it.tagName)].find(p => p !== it && vis(p) && !hidden(p) && !p.contains(it) && !it.contains(p) && p.getAttribute('role') === it.getAttribute('role') && !on(p));
            if (!peer) continue;
            groups.add(g); if (++total > n) continue;
            const o = owner(it), B = onImage(o, U.ims) ? null : fill(o), Q = fill(peer), P = fill(up(it)), fg = ink(o);
            const r = { sel: sel(it), text: it.innerText.trim().slice(0, 30), peer: sel(peer), large: large(o), contrast: B && ratio(over(fg, B), B), indicators: [] };
            const q = paint(peer), differs = [...new Set(paint(it).filter(([, v], j) => v !== q[j][1]).map(([k]) => k.trim()))];
            if (look(it) === look(peer)) r.colourOnly = { differs: differs.length ? differs : 'nothing visible', textStateContrast: ratio(over(fg, B || [255, 255, 255]), over(ink(owner(peer)), Q || [255, 255, 255])), bgStateContrast: B && Q ? ratio(B, Q) : null };
            if (B && Q && P) {
              const ci = getComputedStyle(it), cp = getComputedStyle(peer);
              for (const d of ['Top', 'Right', 'Bottom', 'Left']) { const k = `border${d}`, c = rgba(ci[k + 'Color']);
                if (parseFloat(ci[k + 'Width']) > 0 && ci[k + 'Style'] !== 'none' && c[3] > 0 && (ci[k + 'Color'] !== cp[k + 'Color'] || ci[k + 'Width'] !== cp[k + 'Width'])) r.indicators.push(['border-' + d.toLowerCase(), ratio(over(c, P), P)]); }
              for (const p of ['::before', '::after']) { const a = getComputedStyle(it, p), b = getComputedStyle(peer, p), c = rgba(a.backgroundColor);
                if (a.content !== 'none' && a.display !== 'none' && c[3] > 0 && (a.backgroundColor !== b.backgroundColor || b.content === 'none' || b.display === 'none')) r.indicators.push([p, ratio(over(c, B), B)]); }
              if (B.join() !== Q.join()) r.indicators.push(['background', B.join() === P.join() ? ratio(B, Q) : Math.min(ratio(B, Q), ratio(B, P))]);
              const sh = ci.boxShadow.match(/rgba?\([^)]*\)/)?.[0]; if (sh && ci.boxShadow !== cp.boxShadow) r.indicators.push(['box-shadow', ratio(over(rgba(sh), B), B)]);
            }
            U.st.push(it); res.push(r);
          }
          return { total, res };
        },
      });
    });

    for (const [w, h] of [[320, 640], [390, 844], [820, 1180], [1280, 800]]) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(300);
      const r = out.viewports[w] = await page.evaluate(w => {
        const { vis, hidden, name, sel } = window.__ux;
        const clipsX = el => /hidden|clip/.test(getComputedStyle(el).overflowX);
        const tappable = [...document.querySelectorAll('a[href],button,input:not([type=hidden]),select,textarea,summary,[role=button],[role=link],[role=checkbox],[role=tab],[onclick],[tabindex]:not([tabindex="-1"])')].filter(vis);
        const small = tappable.map(el => ({ el, r: el.getBoundingClientRect() }))
          .filter(({ el, r }) => (r.width < 24 || r.height < 24) && !(el.tagName === 'A' && getComputedStyle(el).display === 'inline') && (!hidden(el) || el === document.activeElement))
          .map(({ el, r }) => ({ sel: sel(el), name: name(el), size: `${Math.round(r.width)}×${Math.round(r.height)}` }));
        // overflow-x:hidden on html/body cuts content off without making the page scroll
        const overflow = document.documentElement.scrollWidth > innerWidth || clipsX(document.documentElement) || clipsX(document.body)
          ? [...document.querySelectorAll('body *')].filter(el => vis(el) && el.getBoundingClientRect().right > innerWidth + 1)
              .slice(0, 10).map(el => ({ sel: sel(el), right: Math.round(el.getBoundingClientRect().right) }))
          : [];
        const r = { scrollWidth: document.documentElement.scrollWidth, pageHeight: document.documentElement.scrollHeight, overflow, smallTargets: small.slice(0, 30), smallTargetCount: small.length };
        if (w === 320) r.clippedSideways = [...document.querySelectorAll('body *')]
          .filter(el => clipsX(el) && el.scrollWidth > el.clientWidth + 1 && vis(el) && !hidden(el) && (el.innerText?.trim() || el.querySelector('a[href],button,input,select,textarea')))
          .slice(0, 10).map(el => ({ sel: sel(el), scrollWidth: el.scrollWidth, clientWidth: el.clientWidth }));
        if (w === 1280) {
          const fields = [...document.querySelectorAll('input:not([type=hidden]):not([type=submit]):not([type=button]),select,textarea')].filter(vis);
          const labelled = el => (el.labels && [...el.labels].some(l => l.innerText.trim())) || el.getAttribute('aria-labelledby');
          r.placeholderAsLabel = fields.filter(el => el.placeholder && !labelled(el)).map(el => ({ sel: sel(el), placeholder: el.placeholder }));
          r.fieldHints = fields.filter(el => el.tagName === 'INPUT' && /^(text|email|tel|search|url|number|password)$/.test(el.type)).map(el => {
            const words = s => (s || '').replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ');
            const k = [words(el.name), words(el.id), name(el), [...(el.labels || [])].map(l => l.innerText).join(' '), el.getAttribute('aria-label'), el.placeholder].join(' ').toLowerCase();
            const want = /\be-?mail\b/.test(k) ? 'email' : /\b(phone|tel|telephone|mobile)\b/.test(k) ? 'tel' : /\b(zip|postal|post ?code|zip ?code)\b/.test(k) ? 'postal-code'
              : /\b(first|given) ?name\b/.test(k) ? 'given-name' : /\b(last|family) ?name\b|\bsurname\b/.test(k) ? 'family-name' : /\bpassword\b/.test(k) ? 'password' : null;
            const ac = (el.getAttribute('autocomplete') || '').trim().toLowerCase();
            return want && (!ac || ac === 'on' || ac === 'off' || (want === 'email' && el.type !== 'email') || (want === 'tel' && el.type !== 'tel'))
              && { sel: sel(el), want, type: el.type, autocomplete: el.getAttribute('autocomplete') };
          }).filter(Boolean);
          r.disabledButtons = [...document.querySelectorAll('button[disabled],[aria-disabled=true]')].filter(vis).map(el => name(el));
          r.labels = Object.entries(tappable.reduce((m, el) => { const k = name(el) || '(no name: ' + sel(el) + ')'; m[k] = (m[k] || 0) + 1; return m; }, {})).sort((a, b) => b[1] - a[1]);
          r.headings = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(vis).map(h => h.tagName + ' ' + name(h));
          r.title = document.title; r.lang = document.documentElement.lang;
          r.viewportMeta = document.querySelector('meta[name=viewport]')?.content || null;
        }
        return r;
      }, w);
      const path = `ux-${slug}-${stamp}-${w}.png`;
      await page.screenshot({ path, fullPage: true, clip: { x: 0, y: 0, width: Math.max(w, r.scrollWidth), height: Math.max(1, Math.min(r.pageHeight, 3 * h)) } });
      out.screenshots.push(path);
      if (w !== 1280) await imageText(w);   // 1280 runs after axe, merged with its undecided text
    }

    let res = null;
    try {
      await page.addScriptTag({ path: AXE });
      for (const f of page.frames()) if (f !== page.mainFrame()) await f.addScriptTag({ path: AXE }).catch(() => {});   // axe tests only frames it is in
      for (const f of page.frames()) await f.evaluate(() => window.axe?.configure({ allowedOrigins: ['<unsafe_all_origins>'] })).catch(() => {});   // default: same-origin frames only
      res =await page.evaluate(() => axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] }));
      out.axe = res.violations.map(v => ({ id: v.id, impact: v.impact, help: v.help, count: v.nodes.length, nodes: v.nodes.slice(0, 5).map(n => n.target.flat().join(' ')) }));
      out.axeIncomplete = res.incomplete.map(v => ({ id: v.id, count: v.nodes.length }));
      out.framesNotTested = (res.incomplete.find(v => v.id === 'frame-tested')?.nodes || []).map(n => n.target.flat().join(' '));
    } catch (e) { out.axe = { error: 'not run: ' + msg(e) }; out.errors.push('axe not run: ' + msg(e)); }

    await imageText(1280);
    if (!res) out.errors.push('pixelContrast for axe-undecided text skipped: axe did not run');
    else {
      const nodes = res.incomplete.find(v => v.id === 'color-contrast')?.nodes || [];
      if (nodes.length > AXE_PX) out.capped.push(`axe-undecided text: ${nodes.length}, measured ${AXE_PX}`);
      for (const n of nodes.slice(0, AXE_PX)) {
        const node = n.target.flat().join(' ');
        try {
          let el = page;   // target: frames, then element; an array part is a shadow path
          n.target.forEach((t, i) => { const s = [].concat(t).join(' '); el = i < n.target.length - 1 ? el.frameLocator(s) : el.locator(s).first(); });
          const h = await el.elementHandle({ timeout: 3000 });
          if (await h.evaluate(e => !!window.__uxMeasured?.has(e))) continue;
          out.pixelContrast.push(await pixel(h, { width: 1280, node }));
          await h.dispose();
        } catch (e) { out.pixelContrast.push({ width: 1280, node, error: msg(e) }); }
      }
    }

    // only text clipped after, not before (sr-only, truncation)
    out.clippedAtTextSpacing = await page.evaluate(async () => {
      const cands = [...document.querySelectorAll('body *')].filter(el => { const cs = getComputedStyle(el);
        return el.innerText?.trim() && ([cs.overflowX, cs.overflowY].some(o => o === 'hidden' || o === 'clip') || cs.textOverflow === 'ellipsis'); });
      const clipped = el => el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1;
      const was = cands.map(clipped);
      const sheet = new CSSStyleSheet();   // adopted sheet: not blocked by a style-src CSP
      sheet.replaceSync('*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}');
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet];
      try {
        await new Promise(r => setTimeout(r, 200));
        return cands.filter((el, i) => !was[i] && clipped(el)).slice(0, 15).map(el => window.__ux.sel(el) + ' "' + el.innerText.trim().slice(0, 30) + '"');
      } finally { document.adoptedStyleSheets = document.adoptedStyleSheets.filter(s => s !== sheet); }
    });

    // blur() does not move the sequential focus start; focusing a node at the top does
    await page.evaluate(() => { const t = document.createElement('div'); t.tabIndex = -1; document.body.prepend(t); t.focus(); t.remove(); scrollTo(0, 0); window.__uxSeen = []; window.__uxPrev = null; });
    const walk = [];
    for (let i = 0; i < TABS; i++) {
      await page.keyboard.press('Tab');
      const { prevRing, stop } = await page.evaluate(async () => {
        const W = window, { name, look } = W.__ux, prev = W.__uxPrev;
        let el = document.activeElement;
        while (el?.shadowRoot?.activeElement || (el?.contentDocument?.activeElement && el.contentDocument.activeElement !== el.contentDocument.body))
          el = el.shadowRoot?.activeElement || el.contentDocument.activeElement;
        const prevRing = prev && prev !== el ? (await look(prev)) !== W.__uxPrevLook : undefined;
        if (!el || el === document.body) return { prevRing };
        const id = W.__uxSeen.indexOf(el) + 1 || W.__uxSeen.push(el);
        el.scrollIntoView({ block: 'nearest' });
        if (el !== prev) { W.__uxPrevLook = await look(el); W.__uxPrev = el; }
        const r = el.getBoundingClientRect(), hit = el.getRootNode().elementFromPoint?.(r.left + r.width / 2, r.top + r.height / 2);
        return { prevRing, stop: {
          el: el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + (el.tagName === 'IFRAME' ? ' ' + (el.getAttribute('src') || '').slice(0, 60) : ''), id,
          name: name(el).slice(0, 30),
          obscured: !!hit && hit !== el && !el.contains(hit) && !hit.contains(el),
          offscreen: r.bottom < 0 || r.top > el.ownerDocument.defaultView.innerHeight || r.width === 0,
        } };
      });
      const last = walk.at(-1);
      if (prevRing !== undefined && last?.id && !last.el.startsWith('iframe')) last.ring = prevRing;
      if (!stop) { walk.push('(back to body)'); break; }
      if (stop.id === walk[0]?.id && last?.id !== stop.id) { walk.push('(wrapped to first stop)'); break; }
      // a cross-origin iframe stays activeElement for every stop inside it
      if (walk.length >= 3 && !stop.el.startsWith('iframe') && walk.slice(-3).every(p => p.id === stop.id)) { walk.push({ ...stop, trap: true }); break; }
      walk.push(stop);
    }
    if (walk.length >= TABS) out.capped.push(`keyboard walk stopped after ${TABS} tabs`);
    const last = walk.at(-1);
    if (last?.id && last.ring === undefined && !last.trap && !last.el.startsWith('iframe'))
      last.ring = await page.evaluate(async () => { const el = window.__uxPrev; el.blur(); return (await window.__ux.look(el)) !== window.__uxPrevLook; });
    const stops = walk.filter(s => typeof s === 'object');
    out.keyboard = {
      stops: walk.length,
      noRing: stops.filter(s => s.ring === false).map(s => s.el + ' ' + s.name),
      obscured: stops.filter(s => s.obscured || s.offscreen).map(s => s.el + ' ' + s.name),
      trap: walk.find(s => s.trap) || null,
      order: walk.map(s => typeof s === 'string' ? s : s.name || s.el),
    };

    await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
    out.hoverContrast = []; out.hoverStuck = [];
    const [hoverAll, hoverStyles] = await page.evaluate(() => window.__ux.hoverables());
    let notHoverable = 0;
    for (let i = 0; i < Math.min(hoverStyles, HOVERS); i++) {
      const h = (await page.evaluateHandle(i => window.__ux.picked[i], i)).asElement();
      try {
        const rest = await h.evaluate(e => window.__ux.state(e));
        try { await h.hover({ timeout: 1000 }); } catch { notHoverable++; continue; }
        const s = await h.evaluate(async e => { await window.__ux.settle(e, 300); return window.__ux.state(e); });
        const px = s.ratio == null && await pixel(h, {});
        const hover = px ? px.p5 : s.ratio;
        if (hover < (s.large ? 3 : 4.5) && s.sig !== rest.sig) out.hoverContrast.push({ node: s.sel, text: s.text, rest: rest.ratio, hover, large: s.large, color: s.color, bg: px ? 'image: pixel p5' : s.bg });
        if (px?.error) out.hoverContrast.push({ node: s.sel, text: s.text, error: px.error });
        const [x, y] = await h.evaluate(e => window.__ux.away(e));
        await page.mouse.move(x, y);
        if (await h.evaluate(async (e, sig) => { await window.__ux.settle(e, 300); return window.__ux.state(e).sig !== sig; }, rest.sig)) out.hoverStuck.push(`${rest.sel} "${rest.text}"`);
      } catch { notHoverable++; } finally { await h.dispose().catch(() => {}); }
    }
    if (hoverStyles > HOVERS || notHoverable) out.capped.push(`hover: ${hoverAll} elements in ${hoverStyles} styles, hovered ${Math.min(hoverStyles, HOVERS) - notHoverable}${notHoverable ? `, ${notHoverable} covered or not hoverable` : ''}`);
    await page.mouse.move(0, 0);

    const st = await page.evaluate(n => window.__ux.states(n), STATES);
    if (st.total > STATES) out.capped.push(`selected states: ${st.total} groups, checked ${STATES}`);
    out.selectedContrast = []; out.colourOnlyState = []; out.stateIndicatorContrast = [];
    for (const [i, r] of st.res.entries()) {
      const base = { node: r.sel, text: r.text };
      let c = r.contrast;
      if (c == null) { const h = (await page.evaluateHandle(i => window.__ux.st[i], i)).asElement(), px = await pixel(h, base); await h.dispose(); if (px.error) out.selectedContrast.push(px); c = px.p5; }
      if (c < (r.large ? 3 : 4.5)) out.selectedContrast.push({ ...base, contrast: c, large: r.large });
      if (r.colourOnly) out.colourOnlyState.push({ ...base, unselected: r.peer, ...r.colourOnly });
      for (const [indicator, ratio] of r.indicators) if (ratio < 3) out.stateIndicatorContrast.push({ ...base, indicator, ratio });
    }

    // scripts read prefers-reduced-motion at start-up: load the page under it
    try {
      await page.emulateMedia({ reducedMotion: 'reduce' });
      reloaded = true;
      await page.reload();
      await page.waitForTimeout(500);
      out.motionUnderReduce = await page.evaluate(() => document.getAnimations()
        .filter(a => a.playState === 'running' && (a.effect?.getTiming().duration || 0) > 0)
        .map(a => (a.animationName || a.transitionProperty || 'web-animation') + ' on ' + (a.effect?.target?.tagName || '').toLowerCase()).slice(0, 15));
    } catch (e) { out.errors.push('motionUnderReduce: ' + msg(e)); }
    return out;
  } finally {
    await page.mouse.move(0, 0).catch(() => {});
    if (before) await page.setViewportSize(before).catch(() => {});
    await page.emulateMedia({ reducedMotion: null }).catch(() => {});
    if (reloaded) await page.reload().catch(e => out.errors.push('reload after motion check: ' + msg(e)));
    else await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); for (const k of ['__ux', '__uxSeen', '__uxPrev', '__uxPrevLook', '__uxMeasured']) delete window[k]; }).catch(() => {});
  }
}
