---
name: ux-suck-hunt
description: UX SUCK hunt — hunt the experience of a product as people use it, on websites, mobile and iPad apps, desktop apps and through AI agents, for everything that SUCKS, prove each find, then make it great. Confusing flows, dead ends, silent or lying feedback, slow-feeling loads, unhelpful errors, hostile forms, missing states, unclear copy, low contrast, cramped touch targets, broken keyboard and screen-reader paths, layouts that break on a phone, motion that ignores reduced-motion, dark patterns. Playwright, axe and platform tools measure, subagents walk it as researchers and as users who have never seen it, and nothing writes to a backend not proven disposable — safe on a live site. Use when UX, usability, accessibility, onboarding, copy or "why do users get stuck" is the focus. The code itself is suck-hunt's; when the ask is everything that SUCKS, run both.
---

# UX SUCK hunt

The team cannot see its own UX. They know where the button is, what the
error means, that the spinner will stop. Users know none of it, and they do
not file bug reports — they hesitate, guess, give up and leave. The hunt is
making that silent cost pointable: a screen, a moment, the code behind it,
and the reason a stranger would agree.

**The goal is a product people love using.** Clear at a glance, fast to
feel, easy to find your way in, kind when something goes wrong, a pleasure
on every device. Hunting SUCK is how you get there, not where you stop:
the hunt ends with what would make it amazing, not only what is broken.

**Calm, not hidden.** A calm screen shows little; a good one also never
makes the main job a scavenger hunt. The line between them: what most
users need for most tasks is on screen, labelled in words, where the task
happens. The rare goes behind one clearly labelled step, two at most
(WEB-67). Calm that hides the primary is SUCK, however clean it looks.

**A finding without evidence is an opinion.** "The signup is confusing" is
worthless. "On `/signup` at 390px the password rules appear only after a
failed submit, and the form clears every field (`ux-signup-390.png`,
`src/routes/signup.tsx:88` resets state in `onError`); the walker retyped its
email twice and gave up" is a finding.

**Taste is not SUCK.** A colour you would not have picked, a layout that is
merely different — leave it. UX SUCK costs the user one of NN/g's five
usability components, or **access**: being shut out entirely.
**Learnability** is how fast a newcomer gets the basic tasks done.
**Efficiency** is how fast once learned. **Memorability** is how easily
they pick it up again after a break. **Errors**: how many, how bad, how
easy to recover. **Satisfaction**: how pleasant. A feature users need that
is missing is a utility gap, not UX SUCK: note it once, outside the
findings. Every finding names the component it costs and the rule it
breaks, or it is dropped.

**It is always SUCK, in capitals.** Every time the word appears in what you
say, it is shouted. Everything around it stays plain and precise.

**This skill is UX only.** Code quality, dependencies and security are the
`suck-hunt` skill's. When the ask is "everything that SUCKS", run both and
deliver one report per hunt. Cross-reference a finding that is both: a
swallowed exception is code SUCK, the user staring at a frozen button is UX
SUCK. Raw speed is `crash-test`'s. It measures; this one asks whether the
user was told what was happening.

## The rulebook

The rules a finding cites live in `references/`, one file per domain. There
are about 500, each with a stable ID, a Check line saying how to tell it is
broken, and the source it was verified against. Never read a file whole.
`references/RULES.tsv` indexes every rule: `id <TAB> file <TAB>
start <TAB> end <TAB> topic <TAB> text <TAB> check`. The last two are the
rule's whole statement and how to test it; axe rule ids, `simctl` and `adb`
live there. Find rules there and read only their lines:

```
cd <skill-dir>/references
grep -i 'contrast' RULES.tsv                          # every rule on a subject, all files
awk -F'\t' '$2=="web.md"{print $5}' RULES.tsv | uniq   # one file's topics
awk -F'\t' '$5 ~ /^Forms/' RULES.tsv                  # one topic's rules
sed -n '54,55p' web.md                                # read a rule: WEB-21's start,end
sed -n '/^## Measure/,/^## Sources/p' apple.md        # a platform's tools
```

| File | IDs | Read when |
|---|---|---|
| `web.md` | WEB- | always, on every platform: feedback, loading and perceived speed, forms, errors, navigation, search, states, onboarding, dark patterns; web only: Core Web Vitals, responsive web |
| `a11y.md` | A11Y- | always: WCAG 2.2 A/AA one line per criterion with its axe rule, ARIA keyboard patterns, cognitive accessibility, WCAG for native apps |
| `content.md` | TEXT- | always, with the audience from step 1: plain language, reading level, scannability, terminology, measuring readability |
| `visual.md` | VIS- | always: typography, colour, spacing, hierarchy, signifiers, icons, motion, dark mode, tokens, data display |
| `laws.md` | LAW- | to name the research behind a finding: Fitts, Hick, Jakob, Doherty, Postel, peak-end and the rest |
| `touch.md` | TOUCH- | anything used on a touchscreen — phones, tablets, mobile web: target sizes per platform, gestures, reach, haptics, stylus |
| `apple.md` | IOS- | an iOS, iPadOS or macOS app, or a web app that must feel at home on an iPad |
| `android.md` | AND- | an Android app, tablets, foldables, ChromeOS |
| `desktop.md` | DESK- | a desktop app (Windows, macOS, Linux, Electron, Tauri) or a dense desktop web app: keyboard, menus, windows, data tables, bulk actions |
| `agents.md` | AGENT- | always when people use AI agents on the product's behalf or the product has an API, CLI or MCP server |

Where two sources disagree, the rule says so; pick by the audience and say
which one you followed. A finding cites the rule IDs it breaks
(`Principle: WEB-21, A11Y-52`), so the developer can read the source.
The rules restate their sources in our own words; `references/NOTICE.md`
lists the licences. After editing a reference file, run `python3
<skill-dir>/index.py`. It rebuilds `RULES.tsv` and fails on a malformed
rule, a missing Check, or a rule ID cited anywhere that does not exist.

## 1. Ground rules

Default to the whole product; ask only if that is genuinely ambiguous. Record
`git rev-parse --short HEAD` and whether the tree is dirty — or, for a live
site with no repository, the URL and the date.

**Budget**: it makes two runs cover the same ground and keeps a big product
affordable. Raise it only when the user asks:

- **Screens**: every screen of a top task, with its states; then one
  screen per remaining route pattern (`/items/:id` once, not per item). At
  most 30 in all. The report states coverage against this budget.
- **People**: two unknowing users per top task, for at most five top
  tasks; one researcher per area, at most six areas; one agent user.
- **Browsers at once**: at most four sessions locally, two against a live
  site.

Each step below ends on a **Done when** line. Do not start the next step
before it holds.

### Who, what, and what you may change

Great design starts with who it is for. The same sentence is clear to a
tax adviser and opaque to a first-time filer; a dense table is a gift to an
analyst and a wall to a visitor. Every judgement in this hunt is relative
to the audience — is this copy clear, is this flow too long, is this
jargon. So pin it down before judging anything.

**Infer first.** Read the product: landing and marketing copy, README,
onboarding, pricing, seed and fixture data, route names, locale files,
analytics events, support docs. From it, draft:

- **Who** — the primary audience and any secondary one. General public or
  specialists, their domain knowledge, how tech-confident, languages and
  whether many read in a second language, likely disabilities, age range if
  it matters (children, older adults).
- **Where** — the platforms and contexts: phone on the go, desktop at a
  desk all day, iPad, kiosk. AI agents acting for the user count too; they
  read the product through its accessibility tree, API or CLI (`agents.md`).
- **What** — the **top tasks**: the five to ten jobs the product exists for,
  in the user's words ("send an invoice", not "POST /invoices"). Every later
  step is ranked by them.

**Then confirm with the developer**, because a wrong audience makes every
finding wrong. Ask multiple-choice questions, with your inference as the
first, recommended option, so a right guess costs one click. Use the
`AskUserQuestion` tool where the harness has one, otherwise a numbered list
in chat. Ask at most one round of up to four questions, covering:

1. **Audience** — "Who is this for? (a) small-business owners, not
   accountants — my read from the pricing page (b) accountants (c) both ..."
2. **Reading level and language** — "How plain should the text be? (a)
   plain for the general public (b) professional terms are fine (c) ..."
   `content.md` turns the answer into the bar the copy is held to.
3. **Top tasks** — the drafted list, to confirm, reorder or correct.
4. **Mandate** — what this hunt may change, multi-select: report only;
   propose copy changes; rewrite copy; adjust layout and components within
   the existing design system; redesign screens or flows; change the design
   system itself; add haptics or sound. And what is off limits: legal or
   regulated text, brand voice, a component library owned by another team.

Record the answers in `$H/brief.md` and quote them in the report header.
What the developer did not answer stays your inference, labelled as one.
Ask again mid-hunt only when a finding hinges on something the brief does
not settle ("Is `/admin` used by customers or only staff?"). Otherwise
decide, and say what you assumed. The mandate binds step 7: a fix outside
it is a proposal in the report, never an edit.

**Done when** `$H/brief.md` holds who, where, the top tasks and the
mandate, each marked confirmed or inferred.

**One hunt directory holds everything**, as in `suck-hunt`:

```
H=$(mktemp -d) && mkdir -p "$H/tmp" "$H/findings" "$H/walks" "$H/.playwright" && git status --porcelain --ignored > "$H/before" && echo "$H"
cp <skill-dir>/probe.js <skill-dir>/reveal.js <skill-dir>/guard.js "$H/" && cp <skill-dir>/cli.config.json "$H/.playwright/"
```

Tool output, screenshots, probe JSON, walker logs and findings all go to
`$H`. Count and grep them; never paste them whole into the conversation.
Each shell call starts fresh: use the printed path literally. The hunt never
edits the repository before step 7, and at the end deletes only the paths
`git status` shows as new. **Keep `$H` itself**: every finding, screenshot
and walker log lives there, and the report points at it.

### Is it safe to touch?

Looking never breaks anything: loading, scrolling, hovering, focusing,
tabbing, resizing, opening menus and dialogs, filling a field, taking a
screenshot. Writing does: a walker that "tries the delete button" on
production deletes a customer's data. So the hunt always looks freely, and
writes only to a backend proven disposable. "It's localhost" proves
nothing: a local frontend pointed at the production API, or a local server
holding the production `DATABASE_URL`, is production.

Before starting anything, check, and write each answer into `$H/safety.md`
with the evidence:

1. **The URL under test.** A public domain, a staging host shared with
   others, anything behind real SSO — not disposable.
2. **Where the app's data goes.** Read the env the running app actually
   uses: `.env*`, the dev script in `package.json`, `docker-compose*.yml`,
   framework config (`next.config.*`, `nuxt.config.*`, `vite.config.*`,
   `config/database.yml`, `wp-config.php`, `settings.py`). Find
   `DATABASE_URL`, `DB_HOST`, `*_API_URL`, `SUPABASE_URL`, `FIREBASE_*`,
   `MONGODB_URI`, `STRIPE_*` and friends. Disposable looks like: SQLite in
   the repo or a temp dir, a host of `localhost`/`127.0.0.1`/a compose
   service name, a mock layer (MSW, json-server, Mirage, WireMock, a
   `mocks/` directory switched on), a Stripe `sk_test_` / `pk_test_` key.
   A managed-cloud hostname (`*.rds.amazonaws.com`, `*.supabase.co`,
   `*.neon.tech`, `*.planetscale.com`, `cluster0.*.mongodb.net`), a live
   payment key, or a value you cannot resolve — not disposable.
3. **Side effects beyond the database.** Real email (SMTP, SendGrid,
   Postmark, Resend), SMS, webhooks, payments, push. A disposable database
   that sends real mail to real addresses in its seed data is not safe.
4. **What the running app talks to** — after "Running it" below, with the
   guard on: the origins its first page load calls. Each gets the same
   question.

Then one of three modes, stated in the report header and given to every
subagent:

- **Look, don't touch** — the default, and the mode until another is
  decided. Everything that looks is allowed; nothing that writes is. Per
  channel:
  - *Browser*: every session runs [`guard.js`](guard.js) before its first
    page load (step 3). It answers `POST`, `PUT`, `PATCH` and `DELETE` with
    a 503 (read-only GraphQL with its query text excepted). It drops what
    the page sends over a WebSocket and logs what it stopped. The session
    config blocks service workers, so none can answer out of its sight.
    It cannot stop a `GET` that writes (`/logout`, `?action=delete`, magic
    links) or a page that writes when loaded: leave those alone. Forms may
    be submitted into the guard to see the app's error path; a failure the
    guard caused is not a finding.
  - *Mocks*: a `page.route` handler ends in `route.fulfill()` or
    `route.fallback()`, never `route.continue()` — `continue` sends the
    request to the network past the guard.
  - *API, CLI, MCP*: reads only — `GET`, `--help`, `--dry-run`,
    `tools/list`, the OpenAPI or schema file. A Check that needs a write
    (`(disposable only)` in the rulebook) is recorded as "not run:
    look-don't-touch".
  - *Native, Electron, Tauri*: no guard can sit in their traffic. Walk and
    look, but submit, create, send, buy and delete nothing, and sign in
    only with an account the user gave for the hunt.
- **Live site** — a production URL. Look, don't touch, plus: at most two
  browser sessions against it, no load, crawl or rate-limit tests, the
  budget's screens only. Decline optional cookies. Never sign up or sign
  in with a real identity. Say in the report that page views landed in its
  analytics.
- **Disposable — proven.** Every check above names its evidence, and the
  user has confirmed it: show them the evidence and ask once, "this
  backend is disposable — may the hunt write to it?". Walkers may then
  create, edit and delete, using data they make themselves, and the seed or
  reset command is noted so the state can be restored.

Without the user's yes there is no disposable mode, whatever the evidence
looks like. A Check or Measure step marked **(disposable only)** in the
rulebook writes to the backend: in any other mode use the read-only
alternative beside it.

### Running it

Find out how the app starts (README, `package.json` scripts, `Makefile`,
compose). Reuse a server the user already has running; otherwise start the
dev server with `TMPDIR="$H/tmp"` and stop it at the end. Starting it is
running project code: read the script first, and do not start anything that
migrates or seeds a database checks 1–3 have not cleared. Then do check 4
with the guarded session from step 3. If the app cannot run at all, the
hunt falls back to reading (step 3's static part and step 4 against the
code) and the report says "not run" with the reason.

**Done when** `$H/safety.md` names the mode with its evidence, and the
user's answer if it is disposable.

## 2. Map the experience

Before judging anything, list it. From the router (file-based routes, a
routes file, `register_rest_route`, menu definitions) and the running app,
write `$H/map.md`:

- **Screens**: every route or view, and which top task it serves. A screen
  serving none is a finding candidate itself.
- **States per screen**: first run (no data yet), empty, loading, partial,
  full (a lot of data: long names, 500 rows), error (server 500, offline,
  validation), no permission, success. Most UX SUCK lives in the states
  nobody designed. Seed or route-mock each one you can. Playwright's
  `page.route` can return an empty list, a 500, or a 3-second delay
  without touching the backend, as long as it ends in `fulfill` or
  `fallback`.
- **Flows**: each top task as a sequence of screens and actions, the steps
  counted.
- **Features**: everything the product can do, read from the code — routes,
  menu and command definitions, action handlers, API operations, settings.
  Step 3's `reveal.js` finds where each one lives in the interface and how
  deep. A feature the code has and nobody can reach is a finding.
- **Portrait**: a contact sheet of every budgeted screen at phone and
  desktop width (the probe's screenshots), so the whole product can be seen
  at once. Inconsistencies between screens show here first.

**Done when** `$H/map.md` lists every route pattern with its top task, the
screens inside the budget are marked, and each has its states.

## 3. Let the instruments speak first

Instruments find the mechanical UX SUCK exhaustively, so walking and reading
can go to the rest. A tool's output is a lead, not a finding: everything
goes through step 5.

### Static

```
cat > "$H/a11y.json" <<'EOF'
{"plugins":["jsx-a11y"],"categories":{"correctness":"warn","suspicious":"warn","pedantic":"warn","style":"warn","restriction":"warn","nursery":"off","perf":"off"}}
EOF
npx -y oxlint@latest -c "$H/a11y.json" -f unix <src> 2>&1 | grep 'jsx-a11y(' > "$H/a11y-lint.txt"           # JSX/TSX
grep -rnE 'outline: *(none|0)\b|:focus *\{[^}]*outline: *(none|0)' --include='*.css' --include='*.scss' --include='*.vue' --include='*.svelte' <src> > "$H/focus-killed.txt"
grep -rnE 'user-scalable *= *no|maximum-scale *= *(0?\.[0-9]+|1(\.[0-9]+)?)\b' <src> > "$H/zoom-blocked.txt"
grep -rnE 'tabindex="?[1-9]|autoplay|autofocus' <src> > "$H/focus-order.txt"
grep -rnE '\b(window\.)?(alert|confirm|prompt)\(' <src> > "$H/native-dialogs.txt"
grep -rnE 'onPaste|paste.*preventDefault|autocomplete="?off' <src> > "$H/paste-blocked.txt"
grep -rnE '@keyframes|animation:|transition:' --include='*.css' --include='*.scss' <src> | wc -l > "$H/motion-count.txt"; grep -rn 'prefers-reduced-motion' <src> >> "$H/motion-count.txt"
grep -rnoiE "['\"\`>](an? )?(error|unknown error|something went wrong|invalid( input)?|oops[^'\"<]*|failed|try again( later)?|error occurred[^'\"<]*)[.!]?['\"\`<]" <src> > "$H/vague-errors.txt"
grep -rnoiE ">\s*(click here|here|read more|learn more|more|submit|ok|go|continue)\s*<" <src> > "$H/vague-labels.txt"
grep -rnE 'toast|snackbar|notify\(' <src> | grep -iE 'error|fail' > "$H/toast-errors.txt"
grep -rnE 'toLocale(Date)?String\(\)|new Date\([^)]*\)\.(getMonth|getDate)|\$\{[^}]*\}\s*(item|file|result|user)s\b' <src> > "$H/i18n-smell.txt"
```

What the list needs to be read correctly:

- **jsx-a11y** rules only. `a11y.json` turns every core rule category off
  by turning only that plugin on; the `grep` drops the core rules that
  still ride along. Vue and Svelte have their own
  (`eslint-plugin-vuejs-accessibility`, `svelte-check` a11y warnings): run
  them if the project uses those.
- **`outline: none`** is only SUCK when nothing replaces it: look for a
  `:focus-visible` style beside it. The probe's keyboard walk is the proof.
- **Native dialogs**: `confirm()` before a destructive action is a lead for
  "confirm where undo belongs". `alert()` for an error is a lead for an
  error that blocks, can't be styled, and vanishes with its message.
- **Vague errors** and **vague labels** are copy leads: open each one and
  ask whether the user can tell what happened and what to do.
- **Toast errors**: an error that disappears after four seconds is gone
  before a slow reader, a screen-reader user or someone who looked away
  has read it. It is also far from the field that caused it.
- **i18n smell**: dates with no locale, plurals glued on with an `s` ("1
  items"). Only a finding if the product has, or claims, users who see it.

### Live — Playwright

Driving the browser is the **playwright-cli** skill's job (`npx
@playwright/cli` if it is not installed); use it, don't rebuild it. Take a
session name of your own and close it when the run ends or aborts, as
`crash-test` explains: a forgotten session keeps a Chromium alive for days.

Every session is opened **from `$H`**, in the same shell call as the
guard. `run-code --filename` reads only files under the directory the
session was opened from. Outside it, it fails with "File access denied" —
and exit code 0. So check what the guard printed, never its exit code:

```
npm i -s --prefix "$H/axe" axe-core@4 && cp "$H/axe/node_modules/axe-core/axe.min.js" "$H/"
cd "$H" && SESSION="ux$(basename "$H" | tail -c 7)" && echo "$SESSION" && playwright-cli -s=$SESSION open \
  && playwright-cli -s=$SESSION --raw run-code --filename=guard.js | grep -q 'write guard on' \
  || { echo "NO GUARD — stop"; playwright-cli -s=$SESSION close; }
cd "$H" && playwright-cli -s=$SESSION run-code "async page => { await page.goto('<url>'); }"
cd "$H" && playwright-cli -s=$SESSION --raw run-code --filename=probe.js > "$H/probe-<screen>.json"
cd "$H" && playwright-cli -s=$SESSION --raw run-code --filename=reveal.js > "$H/reveal-<screen>.json"
cd "$H" && playwright-cli -s=$SESSION --raw run-code "async page => page.context().__uxBlocked || []" >> "$H/blocked.txt"
cd "$H" && playwright-cli -s=$SESSION close
```

Like `$H`, use the printed session name literally in later calls. A
session belongs to the directory it was opened from: `close` it from there
too, or it stays open. Skip the guard line only in proven-disposable mode.
`$H/.playwright/cli.config.json` (copied in step 1) opens every session
with the page's Content Security Policy bypassed, so axe can be injected.
Append each session's blocked writes to `$H/blocked.txt` (one JSON array
per session) before closing it.

Run [`probe.js`](probe.js) on every screen in the map, and on its states
where you can reach them. It looks, tabs, hovers, resizes and restyles for
a moment. At the end it reloads the page twice, once under reduced motion
and once back. So screenshot a state reached by clicking before probing
it, and never probe a page whose GET writes. It leaves viewport, media
emulation and styles as it found them. Per screen it screenshots at 320,
390, 820 (iPad portrait) and 1280px, at most three screens tall, under a
new name each run (listed in `screenshots`; `pageHeight` says what was
cut). A non-empty `errors` means a check did not run: rerun, never read it
as zero violations. It returns:

- **axe** violations against WCAG 2.2 A/AA plus best practice, in every
  frame (a node in a frame reads `iframe … button`), and the `incomplete`
  ones axe could not decide. `framesNotTested` lists frames it could not
  reach: check those by hand.
- **Pixel contrast** for text on an image, video, canvas, gradient or
  `background-image`, and for the text axe left undecided. It measures at
  every width: the text sits on a different part of the image at each.
  Images under it are loaded first; one that never loads reports `image
  under it did not load, check by eye`, never a pass. `p5` is the contrast
  95% of the background beats; `fails` applies 4.5:1, or 3:1 for large
  text. Shadows and scrims stay in the measurement and `hasTextShadow` asks
  for a check by eye. Moving text reports `moving or covered, check by
  eye`.
- **Hover** on up to 40 links, buttons, tabs and menu items, one per style.
  `hoverContrast` is text that drops below 4.5:1 (3:1 large) while hovered,
  with its resting ratio. `hoverStuck` does not return to rest.
- **Selected, current, pressed, checked** (tabs, nav, listboxes, segmented
  controls, toggles), against an unselected sibling. `selectedContrast`:
  below 4.5:1. `colourOnlyState`: a state that differs only by colour (WCAG
  1.4.1, a lead — 3:1 between the states plus another cue passes;
  `"nothing visible"` means no difference at all). `stateIndicatorContrast`:
  an underline, bar, border or fill under 3:1 against its neighbours (WCAG
  1.4.11). `capped` says what the probe's `limits` cut short.
- **Text spacing** (WCAG 1.4.12): text that clips once the minimum line,
  letter, word and paragraph spacing are applied, and did not before.
- **Reflow** at 320px (WCAG 1.4.10): elements that stick out and scroll
  sideways, and `clippedSideways` — content cut off by `overflow-x:
  hidden`, which fails just the same. Carousels land there too: check the
  screenshot.
- **Small targets** under 24×24px (WCAG 2.5.8), visually hidden elements
  skipped. Inline links in running text are exempt, and so is a small
  target with 24px of clear space around it — check before reporting.
  Touch platforms want more: `touch.md`.
- **Fields**: placeholder used as the only label. A field asking for an
  email, phone, postcode, name or password with no or `off` `autocomplete`
  or the wrong `type` (wrong keyboard, no autofill — WCAG 1.3.5). Disabled
  buttons (a disabled submit that never says why is a lead).
- **Labels**: every control's accessible name with counts — five "Learn
  more"s, an unnamed icon button, three different words for one action.
- **Headings, title, lang, viewport meta**.
- **Keyboard walk** from the top of the page, into shadow DOM and
  same-origin frames: every stop in order. `noRing`: stops whose look does
  not change on focus (a change on a child element only needs the
  screenshot). Focus hidden under a sticky header or cookie banner (WCAG
  2.4.11). Traps (2.1.2): focus that stays on one element. Focus bouncing
  between two elements is not detected; the order shows it.
- **Motion**: what still animates when the page loads with
  `prefers-reduced-motion: reduce`.

[`reveal.js`](reveal.js) finds what is hidden on a screen. It lists every
visible control, then opens every revealer, three layers deep: menus,
`aria-expanded` toggles, disclosures, unselected tabs, overflow and
hamburger buttons, hovered rows and cards, one right-click on the main
content. It records what each revealed and its `path`. It opens, never
chooses: anything named like delete, remove, sign out, pay, send, submit
or archive is skipped. Every layer is closed, and `endState` proves the
page is back where it started. Read its `summary`:

- `deep`: controls two or more layers down — few people find them.
- `hoverOnly`: invisible to touch and keyboard users.
- `contextMenuOnly`: actions with no other way in.
- `iconOnly`: `hasName: false` is an accessibility bug; no `tooltip` means
  a sighted user has to guess. Its `crop` PNGs feed the icon test (step 4).
- `navigated`: a "menu" button that is really a link.
- `focusNotReturned`, `popupNotClosedByEscape`: keyboard traps in the
  making.

`capped` and `errors` are what it did not look at — a gap, not proof that
nothing is there. Compare its controls with the features list from step 2:
a feature found nowhere is hidden from everyone.

Beyond the probe, use Playwright for whatever a screen needs to prove a
point, in look-don't-touch mode or not. Fake an empty list, a 500 or a slow
response with `page.route` (ending in `fulfill` or `fallback`) and
screenshot what the user sees. Try `context.setOffline(true)` and
`emulateMedia({ colorScheme: 'dark' })`. Use `page.goBack()` after a step
to see whether state survives, and a reload in the middle of a form. For
real touch input (`hasTouch`, `isMobile`, `tap()`) open the page in a
context made from a Playwright device — `touch.md`, Measure. Every one of
these screenshots is evidence.

### Slow network

Loading, progress and offline rules (`web.md`) are checked on a slow
network, on every platform:

- *Web, Electron*: in the session, `const cdp = await
  page.context().newCDPSession(page); await
  cdp.send('Network.emulateNetworkConditions', { offline: false, latency:
  400, downloadThroughput: 51200, uploadThroughput: 51200 })` — a slow 3G.
- *iOS, iPadOS*: Network Link Conditioner, in Settings › Developer on a
  development device, or the device conditions in Xcode's Devices and
  Simulators window. On a Mac, its preference pane from Additional Tools
  for Xcode.
- *Android emulator*: start it with `emulator @<avd> -netspeed edge
  -netdelay edge` (startup options only).
- *Offline*: `page.context().setOffline(true)` in a browser session;
  airplane mode on a device or emulator.

**Done when** every budgeted screen has a probe JSON with an empty
`errors` (or a rerun noted), and the static outputs exist.

### Native and desktop builds

Playwright reaches web views, Electron and (through WebDriver) Tauri. None
of them sits behind the guard, since their data goes through the app's own
process: look-don't-touch there means look, never submit. A native iOS,
iPadOS, macOS or Android app is measured with its platform's own tools:
simulator and emulator commands, accessibility audits in UI tests,
font-scale and dark-mode switches, and grep patterns for the code. Each
file's `## Measure` section has them: `apple.md`, `android.md`,
`desktop.md`. Commands marked "documented, not run here" were checked
against their docs, not executed; confirm the first one works before
building on it.

## 4. Hunt — walk it like a user, read it like a designer

### Researchers and unknowing users

Fan out with subagents. Two kinds, never mixed in one agent.

**UX researchers** get `$H`, the map, the probe output, the safety mode and
one **area**: a flow or a cluster of screens. Never one category: the
screen that is three kinds of SUCK at once only shows to someone looking
at the whole of it. Each walks its area through Playwright with a session
of its own, every state from the map, at 390px and 1280px, keyboard-only
once. Before walking, it lists the rule topics that apply — the
always-files plus its platform's:

```
awk -F'\t' '$2 ~ /^(web|a11y|content|visual|touch|apple)\.md$/ {print $2"\t"$5}' <skill-dir>/references/RULES.tsv | sort -u
```

It picks every topic its screens touch: Forms for a form, Navigation for a
menu, Loading for anything that fetches. It runs the Check of every rule in
those topics. It writes `$H/findings/<area>--coverage.md`: the topics, the
rule IDs checked, and those it could not check and why. Two runs then
cover the same rules. Findings go to
`$H/findings/<area>--<category>-<slug>.md` with screenshots; researchers
never number or index anything.

**Unknowing users** test whether a stranger can do the top tasks. Each gets
only: a goal in the user's words ("you just signed up; invite a colleague"),
the URL, a persona if it matters ("on a phone, in a hurry"), the safety mode
as a hard rule, and how to drive the browser. Not the code, the map, the
route names or the button labels — anything the brief names is a hint the
real user did not get. They think aloud into `$H/walks/<task>.md`: what
they expected, what they tried, where they hesitated, where they went back,
whether they finished, and how sure they are that it worked. Run every top
task with two walkers. Two walkers from one model share blind spots: a
place both struggle is a pattern, but a place neither struggles proves
nothing about real people. Their trace is the evidence, not their summary.
Each walker runs `playwright-cli -s=<its session> tracing-start` before its
first step and `tracing-stop` after its last. The trace lands in
`$H/.playwright-cli/traces/`. When the `first-contact` skill is installed,
its ledger turns a trace into moves, screens, backtracks and screens
"looked at and left" (dead ends):

```
node <first-contact-dir>/ledger.mjs "$H"/.playwright-cli/traces/<trace> --notes "$H/walks/<task>-a.md"
```

Without it, count backtracks and dead ends from the walker's notes and
say so.

**The icon test**: give an unknowing user only the `crop` PNGs from
`reveal.js`, one at a time, and ask what each button does. A wrong or
"no idea" answer for an icon on a top task is a finding (VIS-30). Time
between actions measures the model thinking, not the user confused: never
report it. For a full, trace-measured usability test, use `first-contact`;
this is its quick form.

**An agent user**, when agents use the product (`agents.md`): a walker
that may read only `playwright-cli snapshot` — the accessibility tree as
text, no screenshots — and must do a top task with it. That is how many
agents see a page. Where it cannot find, name or operate a control, neither
can they, and usually neither can a screen-reader user. If the product has
an API, CLI or MCP server, the same walker does a top task through it,
reading only its own help and error output — and in look-don't-touch only
through reads.

**Every subagent brief** includes the path of `$H` and the mode from
`$H/safety.md` with its rules for each channel. Briefs that touch a
browser add the session block from step 3 verbatim. In look-don't-touch
and live mode they also add: "open your session from $H with the guard
line, and stop if it does not print `write guard on`; do not follow logout,
delete, unsubscribe or confirmation links; do not use real people's email
addresses or phone numbers, ever; before closing, append your blocked
writes to $H/blocked.txt and close the session from $H."

**Done when** every area has its `coverage.md`, every budgeted top task
has two walks (with ledgers where `first-contact` is installed), and the
agent user has walked when agents use the product.

### What UX SUCK is

The categories, grouped by the band they usually land in (step 6). A
finding takes its category from here and its rule IDs from `references/`.

**Usually fire — a user is stopped, misled or shut out**

- **Dead end** — a top task cannot be completed: a broken step, a button
  that does nothing, a flow that loops, a 404 from the app's own link, a
  page with no way back or forward (Nielsen #3, user control and freedom).
- **Shut out** — a WCAG 2.2 AA failure on a top task. No keyboard path or a
  trap, focus invisible or hidden, unlabelled controls, images with meaning
  and no `alt`, text below 4.5:1 contrast (3:1 for large text and UI parts),
  zoom blocked, sideways scroll at 320px, targets under 24px. Drag-only
  actions with no click alternative (2.5.7), a login that needs a memory
  test or blocks paste into the password field (3.3.8), the same info asked
  twice in one process (3.3.7), help that moves between pages (3.2.6),
  status messages a screen reader never hears (4.1.3). One finding per
  barrier, listing every screen it is on.
- **Lost work** — input thrown away: a form cleared on error, a draft lost
  on back, reload or timeout, a session that expires mid-task with no
  warning (Nielsen error guidance: preserve input).
- **Lying UI** — the screen says something false: success shown before the
  save, a stale count, a saved state that is not, a progress bar that
  restarts, a "free" that is not.
- **Dark pattern** — the product works against the user on purpose:
  confirmshaming ("No thanks, I like paying more"), preselected opt-ins,
  hidden costs, an easy signup with a hard cancel, nagging, disguised ads,
  trick wording (deceptive.design, the FTC's dark-patterns report:
  `web.md`).
- **Unsafe destruction** — delete, overwrite or send with neither undo nor
  a confirmation that names what will be lost. Undo beats a confirm dialog:
  people click through confirms by habit. Keep the confirm for the
  permanent, and a typed name for the catastrophic (WEB-68).

**Usually slow — friction on every visit**

- **Silent** — no feedback (Nielsen #1, visibility of system status): no
  response to a click, no indicator for a wait, no progress for a long one
  (the response-time limits are in `web.md`). A button that stays live and
  invites the double submit, a whole page blocked while one region loads,
  progress that lies, content that jumps as it arrives (`web.md`, "Loading
  & perceived speed").
- **Error SUCK** — errors that do not help (NN/g error-message guidelines):
  far from the field, colour-only, generic ("Something went wrong"), jargon
  or codes, blaming ("invalid"), no next step, validated before the user
  finished typing, or left showing after it is fixed. Good: next to the
  field, says what is wrong and how to fix it in the user's words, keeps
  the input, and the form's summary links to each field.
- **Form SUCK** — forms that make the user work: placeholder as label, one
  long line split into four boxes, fields that are not needed (every field
  costs completion), multi-column layouts that get skipped. Format demands
  the code could handle (spaces in a card number, dashes in a phone),
  required/optional unmarked, the wrong keyboard on mobile, no
  `autocomplete`, a date picker for a birthday (Baymard, GOV.UK Design
  System: `web.md`).
- **Missing state** — the states nobody designed. An empty screen that is
  just blank; a good one says what goes here and offers the first action.
  No loading state, or a spinner where a skeleton of the layout would hold
  the eye and stop the jump. An error state that is a stack trace or
  nothing, no offline message, a no-permission page that does not say who
  can grant it, "0 results" with no way to widen the search.
- **Unclear** — the user cannot tell what something is or does: vague
  labels ("Submit", "Click here", "Process"), the team's jargon instead of
  the user's words (Nielsen #2, match the real world). Icon-only buttons
  with no label, two words for one thing or one word for two things.
- **Hard to read** — text above the audience's reading level: long
  sentences, passive voice, undefined terms and abbreviations, walls of
  text with nothing to scan, the important word at the end. Judged against
  the audience from step 1 (`content.md`).
- **Hidden** — the user cannot find what the product can do. A top-task
  action behind an overflow menu or two layers deep, controls that appear
  only on hover, a right-click menu or a gesture with no visible
  alternative. Icon-only buttons people cannot name, a feature the code has
  but the interface never exposes. Hidden in plain sight counts: a control
  that does not look like one, or a label nobody would connect to the job
  (`reveal.js` output; `web.md`, `visual.md` iconography, `touch.md`).
- **Lost** — the user cannot tell where they are or how to get back: no
  page title or heading matching the link they clicked, no current-page
  marker in navigation. The back button leaving the app or losing the
  filters, state that is not in the URL so it cannot be shared or
  bookmarked, a modal opening a modal.
- **Overloaded** — too much at once: too many equal-weight choices (Hick's
  law), no visual hierarchy so the primary action does not stand out. Walls
  of text, long instructions up front instead of help where it is needed.
  Memory demands: a code shown on one screen to type on the next
  (recognition over recall, Nielsen #6).
- **Inconsistent** — the same thing looking or behaving differently: two
  button styles for the primary action, cancel left on one dialog and right
  on the next, a component reinvented per page. Conventions broken without
  reason (Jakob's law: users spend their time on other sites): a logo that
  is not home, a link that does not look like one.
- **Cramped on touch** — works at 1280px with a mouse, fights the user on
  a phone or tablet. Targets below the platform's size, hover-only menus
  and tooltips, gestures with no visible alternative, primary actions out
  of reach, tables that scroll sideways with no hint. A fixed header and
  footer eating half the screen, a keyboard covering the field being typed
  in, an iPad layout that is a stretched phone (`touch.md`, `apple.md`,
  `android.md`).
- **Desktop friction** — a desktop app that ignores desktop: no keyboard
  shortcuts or broken standard ones, no undo, no multi-select or bulk
  action where users handle many items. A window that forgets its size,
  context menus that are the only path (`desktop.md`).
- **Agent-hostile** — an agent acting for the user cannot do the task:
  controls with no accessible name, state only visible in pixels, an API
  error that does not say what to change. A CLI that prompts with no
  terminal attached, a destructive tool with no confirmation (`agents.md`).
- **Interrupting** — the product grabbing attention it did not earn: a
  modal or newsletter popup on arrival, a cookie banner covering the task,
  notification-permission prompts before any value, autoplaying media,
  focus stolen while typing, toasts piling up.
- **Motion** — animation that ignores `prefers-reduced-motion`, motion that
  delays the user (a 600ms transition on every click), parallax and
  auto-advancing carousels. Motion should explain a change, not decorate it.

**Usually polish — the difference between working and delightful**

- **Flat copy** — the voice: microcopy that is robotic, inconsistent in
  tone, or says too much. Front-load the words that matter, use the user's
  vocabulary, sentence case, buttons that say what they do ("Send invoice",
  not "OK").
- **Weak defaults** — making the user choose what the product could have
  guessed: country from locale, the most common option preselected (never
  for consent or money), sensible sort order, remembered preferences.
- **Unrewarded finish** — the end of a top task is an anticlimax: no
  confirmation that says what happened and what comes next, no way to the
  obvious next step. The end of an experience weighs heavily in how it is
  remembered (peak-end rule, `laws.md`). The finish of a top task is where
  delight pays most.
- **Rough edges** — misaligned spacing, a jump when content loads (layout
  shift), truncated text with no way to read the rest, orphaned words in
  headings, a favicon or title missing, dark mode with unreadable bits.

## 5. Try to kill every find

Hunters overclaim, and a checker asked to "confirm" will confirm. For each
finding, try to prove it wrong. Give a refuter subagent one area's batch
with `$H`; it may rerun anything and answers per finding "holds" or
"refuted, because …".

- **Is it the product, or the test setup?** A blank screen because the dev
  seed is empty, a slow load from a cold dev server, an error because the
  guard blocked a write. Reproduce it the way a real user would meet it,
  or drop it.
- **Is it real for the users?** An admin screen used by two staff weighs
  less than checkout. A pattern that breaks a convention may be the
  convention of this product's domain.
- **Shut out:** reproduce it by hand — keyboard only, or with the screen
  reader's view (`playwright-cli snapshot` gives the accessibility tree).
  axe `incomplete` items are not findings until a human check says so.
- **Unknowing-user findings:** did both walkers struggle there? One
  walker's struggle stays a lead until a second walker, or a researcher's
  reproduction, meets it too. Was the walker's goal one a real user has?
- **Taste:** can you name the cost and the principle? If not, drop it.

**Done when** every finding is marked holds or refuted, and every holding
one is a file in `$H/findings/`.

What survives keeps its evidence: screenshots before anything changes, the
probe line, the walker's quote, and the code that causes it (file:line and
component name). A UX finding a developer cannot locate in the code is half
a finding.

**Write every survivor down the moment it survives** — one file per
finding, `$H/findings/<category>-<slug>.md`, in the write-up format from
step 6, screenshots referenced by path. Every one, not only the ones that
will make the top ten: a long hunt that runs out of room before the report
must not lose what it already proved. Subagents write theirs into the same
directory prefixed with their area — `$H/findings/<area>--<category>-<slug>.md`
— so two can never pick the same name. They never number files and never
write an index.

## 6. Report — in the conversation

The conversation gets a ranked, capped report, because one nobody reads to
the end fixes nothing; `$H/findings/` gets everything. Once every subagent
is done, the lead — and only the lead — consolidates it. It merges files
about the same moment into one, keeping what is unique in each, and
deletes the merged-away files. It numbers the rest once, in report order
(`001-…`, `002-…`). It writes a single `$H/findings/INDEX.md`: one row per
finding with its band, category, rule IDs and status, linked to its file.

**Header**, short. First the path to `$H/findings/`, with the total. It is
the complete record, and it lives in the system temp directory, so copy it
somewhere if it should outlast a reboot. Then the commit and the **safety
mode with its evidence** ("look, don't touch: `DATABASE_URL` points at a
managed host; 14 writes blocked, listed in `$H/blocked.txt`"). Then the
URL, and what ran and what did not, with tool versions. Last, coverage:
screens and states visited out of the map, top tasks walked and by how
many walkers.

**Table**, up to 25, then one line counting the rest by category and
pointing at `INDEX.md`:

```
| #  | Band   | Category   | Where (screen · code)                    | Fix                               | Effort | Fix risk |
|----|--------|------------|------------------------------------------|-----------------------------------|--------|----------|
| 1  | fire   | lost work  | /signup · src/routes/signup.tsx:88       | keep values on error              | S      | low      |
| 2  | slow   | error SUCK | /settings · src/lib/api.ts:40 toastError | inline, specific field errors     | M      | low      |
```

Order by band: fire, slow, polish. Within a band, order by how many users
meet it on a top task, cheaper fix first on a tie. A finding moves up when
it sits on a top task's main path, on money or account access, or blocks a
whole group of users. It moves down when it is on a rarely used admin
screen.

**Full write-ups for the first ten**, each standing on its own:

```
### 1 · Keep the user's input when signup fails — lost work · effort S · fix risk low

**Where:** `/signup` at every width; `src/routes/signup.tsx:88` `onError` calls
`reset()`; at HEAD a1b2c3d
**Who meets it:** everyone whose first password misses a rule — 2 of 2 walkers
**Costs:** errors, efficiency
**What SUCKS:** Password rules show only after a failed submit, and the failure
empties every field. Walker: "it wiped my email again, I'm out."
**Evidence:** `$H/ux-signup-<stamp>-390.png`, `$H/walks/signup-a.md` steps 4–9
**Principle:** WEB-21 keep every value on error; WEB-28 name the problem and the fix;
A11Y-52 (WCAG 3.3.7) redundant entry
**Fix:**
1. Delete the `reset()` in `onError`; keep values, clear only the password.
2. Show the password rules under the field from the start; tick each as met.
3. Put the server's error next to the field it names, with `aria-describedby`.
**Done when:** a failed signup keeps name and email; the probe shows no
placeholder-as-label on `/signup`; a walker completes signup without retyping.
**Watch out:** —
**Depends on:** —
```

- **Where** — the screen and state *and* the code, with the symbol name.
- **Who meets it** — which users, on which task, how often.
- **Evidence** — screenshot paths, the probe or tool line, the walker's
  words. Pasted, not paraphrased.
- **Principle** — the rule IDs it breaks, from `references/`, in a few
  words each.
- **Fix** — numbered steps naming files, components and the exact new copy.
  "Improve the UX" is banned; say what to change to what.
- **Done when** — a check that fails now and passes after: the probe line
  gone, axe clean on that rule, a screenshot showing the state, a walker
  finishing the task.
- **Effort** S (under an hour) or M (up to a day); bigger is a project —
  give its first S step. **Fix risk**: low, medium (shared component, many
  screens), high (auth, payments, a flow other teams own).

Findings 11–25 stay one table row each here; their full write-ups, and
every finding past 25, are in `$H/findings/`. End with the single change
that removes the most UX SUCK for the least work.

**What would make it amazing** — after the SUCK, up to five things that go
beyond fixing. Each rests on evidence from the hunt: a frequent action
that deserves a shortcut, a top task that could lose two steps, a default
the product could have guessed, a finish worth remembering, a feature
people would love if they could find it. Proposals, marked as such, within
the mandate.

Then offer to make it great: one finding, one band or one proposal at a
time.

Sign off with a haiku about this hunt's worst UX SUCK — 5-7-5, naming the
real moment a user suffers. It is the only flourish in the report.

## 7. Make it great

Only when the user says go, and only what they picked, within the mandate.
Now the repository is no longer read-only: edit the files, and commit only
when the user asks, in the project's own commit style.

- **Use what is there.** The project's design system, tokens, components
  and voice come first; a fix that adds a fourth button style is new SUCK.
  If the project's own component is the cause, fix the component, once.
- **Copy is a fix.** New wording follows the voice of the best existing
  copy, front-loads the key word, and says what happens next.
- **Prove it twice.** Rerun what found it: the probe line, axe, the
  screenshot of the state, the walker's task with a fresh unknowing user.
  Show before and after screenshots side by side. Then rerun the probe
  on every other screen the changed component appears on: a fix that moves
  the problem two screens over is not a fix.
- **Accessible by default.** Every fix keeps or adds keyboard access, a
  visible focus state, a label, and a contrast that passes. Delight never
  costs access.
- **Haptics and sound are the owner's call.** Many people do not want their
  phone buzzing or the app making noise, and the system has settings for
  both. A haptic or sound that is broken — carrying meaning alone, ignoring
  the system setting, buzzy (`touch.md`) — is a finding to fix. One that is
  missing is a proposal, added only when the mandate says so.
- **The suite still passes**, and the project's own linters do too.

One finding per change, so each can be reviewed and reverted on its own.
After each, update the finding's file and its `INDEX.md` row: `Status:
fixed` (with the commit, if one was made), or `proposed` for a fix outside
the mandate. Put the after screenshots beside the before ones, so the
record says what is done and what is still open.
