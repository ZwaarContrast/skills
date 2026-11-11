# What probe.js and reveal.js return

Read the part you need before reading a `probe-*.json` or `reveal-*.json`.

## probe.js

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
  eye`. Text on a solid card above the image is skipped,
  and `capped` counts it.
- **Hover** on up to 40 links, buttons, tabs and menu items, one per style.
  `hoverContrast` is text that drops below 4.5:1 (3:1 large) while hovered,
  with its resting ratio. `hoverStuck` does not return to rest.
- **Selected, current, pressed, checked** (tabs, nav, listboxes, segmented
  controls, toggles), against an unselected sibling. `selectedContrast`:
  below 4.5:1. `colourOnlyState`: a state that differs only by colour (WCAG
  1.4.1, a lead — 3:1 between the states plus another cue passes;
  `"nothing visible"` means no difference at all). `stateIndicatorContrast`:
  an underline, bar, dot, border or fill — a separate ink-bar or dot
  element included, named by its selector — under 3:1 against its
  neighbours (WCAG 1.4.11). `capped` says what the probe's `limits` cut
  short.
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
- **Headings, title, lang, viewport meta**. Fields, labels and these sit
  under `viewports["390"]` and `viewports["1280"]` — a phone layout can hold
  a different form than the desktop one; the other checks sit under every
  width or at the top level.
- **Keyboard walk** from the top of the page, into shadow DOM and
  same-origin frames: every stop in order. `noRing`: stops whose look does
  not change on focus (a change on a child element only needs the
  screenshot). Focus hidden under a sticky header or cookie banner (WCAG
  2.4.11). Traps (2.1.2): focus that stays on one element. Focus bouncing
  between two elements is not detected; the order shows it.
- **Motion**: what still animates when the page loads with
  `prefers-reduced-motion: reduce`.

## reveal.js

`reveal.js` finds what is hidden on a screen. It lists every
visible control, then opens every revealer, three layers deep: menus,
`aria-expanded` toggles, disclosures, unselected tabs, overflow and
hamburger buttons, hovered rows and cards, one right-click on the main
content. It records what each revealed and its `path`. It opens, never chooses. It never clicks a switch, checkbox, radio or
field, never follows a link, and skips a dialog button whose name is an
action. Anything whose name, title, aria-label, id, class, data-* or href
reads like delete, remove, sign out, pay, buy, send, submit, publish,
archive, reset or leave — in English, Dutch, German, French and Spanish —
is skipped. The list is a net, not a guarantee; `skipped` says what was
left closed and why. Every layer is closed. `endState.clean` is true only
when the URL, open layers, storage and form state match the start, no
reload was needed and no write was attempted; otherwise `reloads`,
`requestsMade`, `writesAttempted`, `storageChanged` and `controlsChanged`
say what happened. Read its `summary`:

- `deep`: controls two or more layers down — few people find them.
- `hoverOnly`: invisible to touch and keyboard users.
- `contextMenuOnly`: actions with no other way in.
- `iconOnly`: `hasName: false` is an accessibility bug; no `tooltip` means
  a sighted user has to guess. Its `crop` PNGs feed the icon test (step 4).
- `navigated`: a "menu" button that is really a link, listed as "(link,
  not followed)".
- `focusNotReturned`, `popupNotClosedByEscape`: keyboard traps in the
  making.

`capped` and `errors` are what it did not look at — a gap, not proof that
nothing is there.
