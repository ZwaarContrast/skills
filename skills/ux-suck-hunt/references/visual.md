# Visual design

Typography, colour, spacing and layout, hierarchy, signifiers, icons, motion, dark mode, tokens and data display — visual choices that, when wrong, cost people time, mistakes or comfort. Read when: the product has any visual UI (web, app, desktop) and you are judging how it reads, looks or moves, or auditing its CSS, theme or token files.
Summarised in our own words from the sources at the end; numbers and names are cited as facts.

Contrast ratios, colour-alone, text resize and reflow belong to a11y.md (WCAG 1.4.1, 1.4.3, 1.4.4, 1.4.10, 1.4.11, 1.4.12); platform type sizes to apple.md / android.md; layout shift to web.md.

## Typography

- **VIS-1** Size web body copy between 15-25 px (Butterick); USWDS puts the floor at an effective 16 px, with smaller text kept for captions and footnotes.
  Check: computed `font-size` on `p`/body copy in DevTools; grep CSS for paragraph/body `font-size` under `16px`/`1rem`. [1][6]
- **VIS-2** Hold body text to 45-90 characters per line, spaces counted; aim near 66 for long reading. WCAG 1.4.8 (AAA) sets 80 as the ceiling (40 CJK).
  Check: text containers lacking a `max-width` (e.g. `max-width: 66ch`); count characters per line in a 1440 px-wide screenshot — paragraphs spanning the full desktop width fail. [1][5][6][7]
- **VIS-3** Give body text leading of 120-145% of its size (Butterick); USWDS wants 1.5 or more for long passages and 1-1.35 for headings and short bits.
  Check: computed `line-height` on paragraphs; multi-line text at `line-height: 1`, `normal`, or a px value equal to the font size fails. [1][6]
- **VIS-4** Space paragraphs further apart than their lines (1.4.8: at least 1.5× the line spacing), and put at least 1.5× more space above a heading than below it, so it reads as the start of the next section.
  Check: compare `margin-top` with `margin-bottom` on `h1`-`h6`; a bottom margin equal to or bigger than the top one fails. [6][7]
- **VIS-5** Align running text to the left on the web; if a block must be justified, switch hyphenation on with it.
  Check: grep for `text-align: justify` with no `hyphens: auto` on the same element; look for rivers and wide word gaps in screenshots. [1][3][6]
- **VIS-6** Limit capitals-only text to under a line (labels, short headings, captions) and track it out by 5-12%; for emphasising a passage use weight, size or a rule instead of capitals.
  Check: grep `text-transform: uppercase` and see what it styles — paragraphs, body or alert text fail; uppercase without any `letter-spacing` is a weaker finding. [1][2][6]
- **VIS-7** Let only links carry an underline; use bold or italic for emphasis.
  Check: grep `text-decoration: underline` / `<u>` applied to anything that is not a link. [4][24]
- **VIS-8** Work with at most 3 type sizes for the body/subheader/header levels of a view; the most important thing gets the largest size, and no more than 2 elements are large.
  Check: tally distinct `font-size` values per screen from computed styles and across the repo (`grep -ohE 'font-size:\s*[^;]+' -r src | sort | uniq -c`); many one-off sizes outside the scale fail. [10]
- **VIS-9** Take text sizes from a defined type scale (e.g. M3 baseline: Body Large 16sp, Body Medium 14sp, Body Small 12sp, Label Small 11sp), not ad-hoc values, so hierarchy and user text scaling hold together.
  Check: literal font sizes in components where scale tokens or text styles (`textAppearance*`, `MaterialTheme.typography`, CSS custom properties) should be. [8][9]
- **VIS-10** Keep typefaces few, and stay off Ultralight, Thin and Light weights at small sizes.
  Check: count distinct `font-family` values and `@font-face` families; grep `font-weight: 100|200|300` on text below ~16 px. [8]

## Colour

- **VIS-11** Give each colour a single job: the colour that signals interactivity never dresses static text, and status colours are not spent on decoration.
  Check: locate the link/accent token and grep for it on headings, labels or icons that have no handler. [11][19][22]
- **VIS-12** Choose colours by role rather than appearance: pair every container colour with its matching on-colour (M3 `colorPrimary`/`colorOnPrimary`, `colorError`/`colorOnError`, `colorSurface`/`colorOnSurface`), and use error colours only for errors.
  Check: `onSurface` text sitting on a `primary` fill, or a token picked only because its value matched — these break once the theme changes. [12][15]
- **VIS-13** Define a light, a dark and a higher-contrast version of each custom colour.
  Check: custom colours with a single value and no dark counterpart (no `values-night`, no `prefers-color-scheme: dark` override, no Color Set appearance variants). [11][13]
- **VIS-14** Colour is never the only cue: A11Y-12 owns the rule; in visual design the usual misses are listed in this Check.
  Check: status dots/pills, red/green deltas or chart series that carry no label or icon. [11]
- **VIS-15** Allow for colours meaning different things in different markets (e.g. red signals a rise in Chinese Stocks).
  Check: localised builds that hard-wire red/green to down/up. [11]

## Spacing, layout and grouping

- **VIS-16** Draw every margin, padding and gap from a single spacing scale (Carbon: 2, 4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 160 px; Android: steps of 8 dp, with 4 dp for small elements).
  Check: `grep -ohE '(margin|padding|gap)[^:]*:\s*[^;]+' -r src | sort | uniq -c`; off-scale values (5px, 13px, 18px...) show drift. [16][17]
- **VIS-17** Put things that belong together closer than things that don't; a label should be nearer its own field than the field before it.
  Check: in a screenshot, compare the gap from a label to its field with the gap from that field to the next label; equal or reversed gaps fail. [18]
- **VIS-18** Line elements up on shared edges, and indent only what is subordinate.
  Check: overlay left edges on a screenshot; ragged starts inside one column, or indented items that are not children, fail. [20]
- **VIS-19** Order content by importance, starting at the top and leading edge.
  Check: the main task sits below secondary panels in the first viewport. [20]
- **VIS-20** Keep content that matters away from spots and styles people associate with ads (top banner, right rail, boxed or animated promo look), because users skip those.
  Check: key notices or CTAs shown as banners, side-rail cards or with ad-style animation; confirm with a usability test. [26]
- **VIS-21** Give images and surfaces a consistent aspect ratio (Android recommends 16:9, 3:2, 4:3, 1:1, 3:4, 2:3) and reserve their space — layout shift is in web.md.
  Check: mixed ratios in one image grid; `<img>` with neither `width`/`height` nor `aspect-ratio`. [17]

## Hierarchy and actions

- **VIS-22** Allow a single primary button or CTA within each page or region.
  Check: count primary/filled button variants per view (`variant="primary"`, `.btn-primary`, `Button appearance="primary"`); two or more in one container fail. [21]
- **VIS-23** Greyed-out buttons that hide why: WEB-22 owns the rule for forms; any other disabled button says nearby what would enable it.
  Check: `disabled` buttons with no visible reason; submit buttons: WEB-22's Check. [21]
- **VIS-24** Ration emphasis; when every element is bright or high-contrast, none of them leads. The law is LAW-10; the button count is VIS-22.
  Check: per region, find the lead element; any other element with the same colour, size and weight as the lead fails. [10]

## Signifiers

- **VIS-25** Mark links with a colour distinct from body text and use that same style everywhere; adding an underline to the colour makes clickability most obvious. Show visited links in a duller tone than unvisited ones.
  Check: inline links coloured like body text, link styles that differ between pages, no `:visited` rule. [22][24]
- **VIS-26** Make controls read as clickable through shape and edge even in a flat style, and never give headings or static text the look of a button or link.
  Check: buttons that are bare text with no border or fill; headings on coloured backgrounds; `cursor: pointer` on elements with no handler; clickable `div`s that look like plain text. [22][19]
- **VIS-27** Use strong signifiers on dense or unusual layouts — in NN/g's study, weak ones cost 22% more time and 25% more fixations.
  Check: ghost or flat controls on content-heavy pages; first-time users hesitating in a first-contact run. [23]

## Iconography

- **VIS-28** Put a visible text label beside icons, apart from the handful almost everyone recognises (home, print, search); a hover tooltip is not a label.
  Check: icon-only toolbar/navigation buttons (`<button><svg/></button>` with only `title`/`aria-label`); the accessible name is A11Y's concern, the visible label is this rule's. [25]
- **VIS-29** Bind each icon to one function product-wide, and take icons from one set.
  Check: one glyph used for different actions; several icon libraries in use (`grep -r "from 'lucide\|heroicons\|@mui/icons\|fontawesome"`). [25][19]
- **VIS-30** Check icons by asking users what they think each one does; when no fitting icon comes to mind within 5 seconds, use a word.
  Check: abstract or custom glyphs without labels on non-standard actions. [25]

## Motion

- **VIS-31** Add motion only when it explains something; skip it on interactions people repeat often, and let users act before an animation finishes.
  Check: decorative entrances on every list item; input locked during transitions (`pointer-events: none` until `animationend`). [30]
- **VIS-32** Keep UI animations between 100-500 ms: around 100 ms for small feedback like toggles and checkboxes, 200-300 ms for big changes such as modals; at 500 ms they start to feel sluggish. Make exits a little quicker than entrances. NN/g and M3 differ on large moves: M3 lets duration grow with the area covered (VIS-33).
  Check: grep `transition-duration`, `animation-duration`, `duration:` values; ≥ 500 ms on small, frequent feedback (toggles, checkboxes, menus, tooltips, list items) fails; full-screen or shared-element transitions may use VIS-33's long tokens. [27]
- **VIS-33** Take durations from tokens, not literals — M3: short 50-200 ms, medium 250-400 ms, long 450-600 ms, extra-long 700-1000 ms; Carbon: 70, 110, 150, 240, 400, 700 ms — and lengthen them as the distance or area covered grows: long and extra-long are for large-area moves only, and VIS-32's ceiling holds for small feedback.
  Check: count distinct duration literals in CSS/JS; many one-offs, or long durations on small elements, fail. [28][29]
- **VIS-34** Ease in-coming elements with a decelerating curve, out-going ones with an accelerating curve, and on-screen moves with the standard curve (M3 standard `cubic-bezier(0.2, 0, 0, 1)`, decelerate `(0, 0, 0, 1)`, accelerate `(0.3, 0, 1, 1)`; Carbon productive standard `(0.2, 0, 0.38, 0.9)`); use Carbon's productive style for task UI and expressive for significant moments.
  Check: `linear` on UI movement, `ease-in` on entrances. [28][29]
- **VIS-35** Respect the reduced-motion setting by dropping or swapping scale, pan and parallax effects, and never let motion be the sole carrier of information.
  Check: grep for `prefers-reduced-motion` (CSS/JS), `UIAccessibility.isReduceMotionEnabled`, `ANIMATOR_DURATION_SCALE`; absent while large-motion animation exists fails. Platform detail: WEB-58 (web), IOS-49 (Apple). [30][31]

## Dark mode

- **VIS-36** Follow the system light/dark choice by default; a hard-locked appearance is a finding everywhere. An in-app override splits by platform: Apple discourages it (IOS-37), Android and Windows expect a Light/Dark/System picker (AND-40, DESK-55). Outside Apple platforms, the web included, a picker that defaults to System passes.
  Check: a locked mode fails; `overrideUserInterfaceStyle`, hard-set `AppCompatDelegate.MODE_NIGHT_NO/YES`, CSS with neither `prefers-color-scheme` nor `color-scheme`. [13]
- **VIS-37** Base dark themes on dark grey rather than pure black, and convey elevation with progressively lighter tonal surfaces, because shadows hardly register on dark backgrounds.
  Check: `#000`/`black` as page or surface background in dark theme; dark-theme cards separated only by `box-shadow`. [14][12]
- **VIS-38** In dark mode hold text contrast at 4.5:1 or better and target 7:1 for custom colours, small text especially (Apple); re-check with Increase Contrast and Reduce Transparency switched on.
  Check: contrast tool on dark-theme screenshots — thresholds as in A11Y-14. [13]
- **VIS-39** Review every screen, image and icon in both appearances; tone down images with white backgrounds and give icons that disappear on dark an outline.
  Check: screenshot each route in light and dark; logos or illustrations showing white boxes or losing detail on dark. [13]
- **VIS-40** Use semantic colours that adapt to the appearance instead of fixed colour values.
  Check: `grep -rnE '#[0-9a-fA-F]{3,8}\b|rgba?\(' src` outside the token/theme file; `Color(red:...)`, `UIColor(red:`, `Color(0xFF...)` in views. [13][11][15]

## Tokens and consistency

- **VIS-41** Define colour, type, spacing and motion as design tokens selected by meaning, so a theme, dark mode or a brand change lands everywhere at once.
  Check: share of literal values versus token references in styles; appearance-named tokens (`blue-500`) used straight in components where role tokens (`color.text.danger`) belong. [15]
- **VIS-42** Style every element of a given type the same way (one link style; one style per button variant).
  Check: compare computed styles of all `a` and each `button` variant across pages; near-duplicate component implementations. [19][22]

## Data display

- **VIS-43** Right-align quantities that add up (amounts, percentages, currency, tallies) and set them in tabular or monospace figures; phone numbers, ZIP codes and dates need neither.
  Check: numeric `td` lacking `text-align: right`; no `font-variant-numeric: tabular-nums`. [32]
- **VIS-44** Use one unit and format per column, give every table a header row, and pin header rows/columns when the table outgrows the screen.
  Check: mixed units within a column; no `thead`; long tables without `position: sticky` headers. [32][34]
- **VIS-45** Label chart series in place rather than through a legend when the labels fit; leave the legend off for a single series; add texture or labels so no series depends on colour.
  Check: multi-series charts identified only by a colour legend. [33]

## Iconography: the right icon for the job

- **VIS-46** For a well-known action, use the icon people already know for it, drawn the way the platform draws it: trash for delete, pencil for edit, gear for settings, magnifier for search, the platform's own share symbol. Before drawing a new icon, look at what competitors and the target platform use. A familiar icon never takes on a different meaning (a hamburger that means "list", a trash can that archives): even a slight shift costs the icon its trust.
  Check: set each icon crop from `reveal.js` beside the action it performs; a familiar action with an unfamiliar icon, or a familiar icon on a different action. [25]
- **VIS-47** Icons whose meanings compete — heart, star, bookmark, flag — get one fixed meaning across the product and a visible label. An icon nobody recognises hides its feature as well as a menu does. Draw icons simple and schematic, so they still read at their smallest size.
  Check: the icon test's wrong answers; two of heart, star and bookmark in one product for different jobs; detailed icons that blur at 16–24 px. [25]

## Sources

Credit: W3C WAI, "Understanding WCAG 2.2" (Copyright 2026 World Wide Web Consortium), the W3C Software and Document License (https://www.w3.org/copyright/software-license/).
Credit: "prefers-reduced-motion" by Mozilla Contributors, CC-BY-SA 2.5 (https://creativecommons.org/licenses/by-sa/2.5/).
Credit: Android Developers documentation and Material Components for Android by Google, the Apache License 2.0 (https://www.apache.org/licenses/LICENSE-2.0).
Credit: the IBM Carbon Design System website, the Apache License 2.0 (https://www.apache.org/licenses/LICENSE-2.0).
Credit: the U.S. Web Design System [6][32] (designsystem.digital.gov), a public domain US Government work; cited for facts.

[1] Butterick, Practical Typography — Summary of key rules (practitioner book, [1]-[5]) — https://practicaltypography.com/summary-of-key-rules.html
[2] Butterick — All caps — https://practicaltypography.com/all-caps.html
[3] Butterick — Justified text — https://practicaltypography.com/justified-text.html
[4] Butterick — Underlining — https://practicaltypography.com/underlining.html
[5] Butterick — Line length — https://practicaltypography.com/line-length.html
[6] USWDS — Typography — https://designsystem.digital.gov/components/typography/
[7] W3C WAI — Understanding SC 1.4.8 Visual Presentation — https://www.w3.org/WAI/WCAG22/Understanding/visual-presentation.html
[8] Apple HIG — Typography — https://developer.apple.com/design/human-interface-guidelines/typography
[9] Material Components Android (M3) — Typography theming — https://github.com/material-components/material-components-android/blob/master/docs/theming/Typography.md
[10] NN/g — Visual Hierarchy in UX — https://www.nngroup.com/articles/visual-hierarchy-ux-definition/
[11] Apple HIG — Color — https://developer.apple.com/design/human-interface-guidelines/color
[12] Material Components Android (M3) — Color theming — https://github.com/material-components/material-components-android/blob/master/docs/theming/Color.md
[13] Apple HIG — Dark Mode — https://developer.apple.com/design/human-interface-guidelines/dark-mode
[14] Material Components Android (M3) — Dark theme — https://github.com/material-components/material-components-android/blob/master/docs/theming/Dark.md
[15] Atlassian Design — Design tokens — https://atlassian.design/foundations/tokens/design-tokens
[16] IBM Carbon — Spacing — https://carbondesignsystem.com/elements/spacing/overview/
[17] Android Developers — Grids and units — https://developer.android.com/design/ui/mobile/guides/layout-and-content/grids-and-units
[18] NN/g — Proximity Principle in Visual Design — https://www.nngroup.com/articles/gestalt-proximity/
[19] NN/g — Similarity Principle in Visual Design — https://www.nngroup.com/articles/gestalt-similarity/
[20] Apple HIG — Layout — https://developer.apple.com/design/human-interface-guidelines/layout
[21] Atlassian Design — Button usage — https://atlassian.design/components/button/usage
[22] NN/g — Beyond Blue Links: Making Clickable Elements Recognizable — https://www.nngroup.com/articles/clickable-elements/
[23] NN/g — Flat UI Elements Attract Less Attention and Cause Uncertainty — https://www.nngroup.com/articles/flat-ui-less-attention-cause-uncertainty/
[24] NN/g — Guidelines for Visualizing Links — https://www.nngroup.com/articles/guidelines-for-visualizing-links/
[25] NN/g — Icon Usability — https://www.nngroup.com/articles/icon-usability/
[26] NN/g — Banner Blindness Revisited — https://www.nngroup.com/articles/banner-blindness-old-and-new-findings/
[27] NN/g — Executing UX Animations: Duration and Motion — https://www.nngroup.com/articles/animation-duration/
[28] IBM Carbon — Motion — https://carbondesignsystem.com/elements/motion/overview/
[29] Material Components Android (M3) — Motion — https://github.com/material-components/material-components-android/blob/master/docs/theming/Motion.md
[30] Apple HIG — Motion — https://developer.apple.com/design/human-interface-guidelines/motion
[31] MDN — prefers-reduced-motion — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
[32] USWDS — Table — https://designsystem.digital.gov/components/table/
[33] IBM Carbon — Data visualization: Legends — https://carbondesignsystem.com/data-visualization/legends/
[34] NN/g — Data Tables: Four Major User Tasks — https://www.nngroup.com/articles/data-tables/
