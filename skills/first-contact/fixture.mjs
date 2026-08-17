#!/usr/bin/env node
// A small product with usability faults planted on purpose, so the protocol can
// be checked against problems whose answers are already known.
//
//   node fixture.mjs        serve it on a free port and print the URL
//
// Planted faults, and the goal that should expose each:
//   coined vocabulary — a project is a "Stream", settings are "Cogs",
//     the archive is the "Vault". Nothing on screen says what they mean.
//   a trap — "+ New" on the Streams page is the most prominent control and
//     creates a note, not a stream. Creating a stream is buried in Cogs.
//   an invisible feature — export exists, reachable only through a link
//     labelled "spill" at the bottom of the Vault, and never from the nav.
//   a dead control — "Filter" is wired to nothing at all.
//   modal navigation — opening a stream changes no URL, so any metric that
//     counts pages sees a user who never went anywhere.
//   a page that throws — Cogs raises a TypeError on load.
//   something impossible — nothing anywhere deletes a stream.
//   a false confirmation — "Kindle" reports "Stream kindled." and creates
//     nothing. This one was not planted. It was written by accident and found
//     by a tester, which is the most convincing thing in this directory: the
//     author of the fixture did not know it was there. Kept, because a success
//     message that isn't true is the most damaging fault on this list, and
//     because a tester that only rediscovers faults you planted proves nothing.
import { createServer } from 'node:http';

const shell = (title, body, extra = '') => `<!doctype html><meta charset=utf-8><title>${title} · Kettle</title>
<style>
 body{font:15px/1.5 system-ui;margin:0;color:#222}
 nav{background:#1f2933;padding:12px 24px}nav a{color:#cbd2d9;margin-right:20px;text-decoration:none}
 main{padding:24px;max-width:760px}h1{font-size:22px}
 .btn{background:#2563eb;color:#fff;border:0;padding:8px 14px;border-radius:6px;font-size:15px;cursor:pointer}
 .muted{color:#7b8794;font-size:13px}.card{border:1px solid #e4e7eb;border-radius:8px;padding:12px;margin:8px 0;cursor:pointer}
 dialog{border:0;border-radius:8px;padding:20px;box-shadow:0 10px 40px #0003;min-width:320px}
</style>
<nav><a href="/streams">Streams</a><a href="/cogs">Cogs</a><a href="/vault">Vault</a></nav>
<main>${body}</main>${extra}`;

const PAGES = {
  '/': shell('Home', `<h1>Kettle</h1>
    <p>Kettle keeps your streams flowing. Spin up a stream, tune your cogs, and let the vault handle the rest.</p>
    <p class=muted>Trusted by teams who ship.</p>
    <a class=btn href="/streams">Open Kettle</a>`),

  // the trap: "+ New" is the obvious control and it makes a note, not a stream
  '/streams': shell('Streams', `<h1>Streams</h1>
    <button class=btn id=new>+ New</button>
    <button class=btn style="background:#e4e7eb;color:#333" id=filter>Filter</button>
    <div class=card id=s1>Website redesign <span class=muted>· 4 notes</span></div>
    <div class=card id=s2>Q3 planning <span class=muted>· 1 note</span></div>
    <dialog id=noted><p>Note added to <b>Website redesign</b>.</p><button class=btn id=okn>OK</button></dialog>
    <dialog id=detail><h2 id=dt>Stream</h2><p>Notes live here. Nothing else does.</p><button class=btn id=okd>Close</button></dialog>`,
    `<script>
      const $ = i => document.getElementById(i);
      $('new').onclick = () => $('noted').showModal();          // adds a note, despite the label
      $('okn').onclick = () => $('noted').close();
      for (const id of ['s1','s2']) $(id).onclick = () => { $('dt').textContent = $(id).textContent.split('·')[0].trim(); $('detail').showModal(); };
      $('okd').onclick = () => $('detail').close();
      // #filter has no handler at all
    </script>`),

  // creating a stream is here, under settings, called "Kindle a stream"
  '/cogs': shell('Cogs', `<h1>Cogs</h1>
    <p class=muted>Preferences, tokens and provisioning.</p>
    <label>Display name <input value="Sam"></label>
    <p><button class=btn id=kindle>Kindle a stream</button></p>
    <dialog id=made><p>What shall we call it?</p><input id=nm><p><button class=btn id=okm>Kindle</button></p></dialog>
    <dialog id=done><p>Stream kindled.</p><button class=btn id=okd2>OK</button></dialog>`,
    `<script>
      const $ = i => document.getElementById(i);
      $('kindle').onclick = () => $('made').showModal();
      $('okm').onclick = () => { $('made').close(); $('done').showModal(); };
      $('okd2').onclick = () => $('done').close();
      undefinedFunction();                                       // throws on load, every time
    </script>`),

  // export exists, but only as "spill", at the bottom, never in the nav
  '/vault': shell('Vault', `<h1>Vault</h1>
    <p>Everything you have archived lives here.</p>
    <p class=muted>Nothing archived yet.</p>
    <p style="margin-top:60px"><a href="/spill" class=muted>spill</a></p>`),

  '/spill': shell('Spill', `<h1>Spill</h1>
    <p>Download your data as a spreadsheet.</p>
    <a class=btn href="/spill.csv">Download CSV</a>`),
};

createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  if (url === '/spill.csv') {
    res.setHeader('content-type', 'text/csv');
    res.setHeader('content-disposition', 'attachment; filename=kettle.csv');
    res.end('stream,notes\nWebsite redesign,4\nQ3 planning,1\n');
    return;
  }
  const body = PAGES[url];
  if (!body) { res.statusCode = 404; res.end(shell('Not found', '<h1>Not found</h1>')); return; }
  res.setHeader('content-type', 'text/html');
  res.end(body);
}).listen(Number(process.env.PORT || 0), function () {
  console.log(`fixture on http://localhost:${this.address().port}`);
});
