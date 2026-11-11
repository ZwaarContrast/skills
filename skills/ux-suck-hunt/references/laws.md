# UX laws and the research behind them

Psychology laws behind UX findings, each paired with the research it comes from and a way to test a product against it. Read when: a finding needs the underlying law, or the hunt covers speed, choice, memory, grouping or motivation in any product. Platform numbers (target sizes, contrast, timings) live in touch.md, web.md, visual.md; this file states each law once.
Summarised in our own words from the sources at the end; numbers and names are cited as facts.

## Speed and effort

- **LAW-1** Doherty Threshold (Doherty & Thadani, IBM Systems Journal 1982): aim for a visible reaction to every user action within 400 ms; work that runs longer shows a progress indicator or other perceived-speed cue, since even an imprecise bar makes waiting easier to bear. The pass/fail lines are WEB-1's.
  Check: time click/keypress to first visible change on a slow network (SKILL.md: Slow network), from video frames on any platform (web: DevTools Performance, INP), and judge it by WEB-1; quote 400 ms as the target missed. [1]
- **LAW-2** Fitts's Law (Paul Fitts, 1954): frequently used targets are big, spaced apart, and near where the hand or cursor already rests; the primary button sits right after the field that precedes it; with a mouse, screen edges and corners act as targets of unlimited depth (this gain disappears on touchscreens).
  Check: measure target box and distance from the preceding interaction (e.g. submit button far from last form field, menu options opened in a bottom sheet far from their label, tiny adjacent targets causing mis-taps). Sizes: see touch.md. [2][23]
- **LAW-3** Tesler's Law, conservation of complexity (Larry Tesler, Xerox PARC mid-1980s; interview in Dan Saffer, *Designing for Interaction*): the product absorbs the complexity no design can remove — anything it already knows or can work out, it fills in instead of asking.
  Check: list every input the user must supply; any value the system could infer (city from postcode, card type from number, timezone, previously entered data) that it asks for again breaks it. [3]

## Choice and decisions

- **LAW-4** Hick's Law (Hick & Hyman, 1952): where speed counts, the screen offers few options, marks a suggested one, breaks big tasks into stages and reveals features gradually to newcomers — while still giving enough context that options stay meaningful.
  Check: count options on time-critical screens (primary nav, dialogs, checkout); a long flat list with no default/recommended option, or a first-run screen exposing every feature, breaks it. [4]
- **LAW-5** Choice Overload (term from Alvin Toffler, *Future Shock*, 1970): large option sets come with ways to narrow them early (search, filters, a featured pick) and, where options must be weighed, a side-by-side comparison such as a plan table.
  Check: large catalogues or plan pages without filter/search/compare, or plan tiers whose differences must be read in separate pages or modals. [5]

## Memory and comprehension

- **LAW-6** Miller's Law (George A. Miller, 1956): content is split into small, digestible groups; the seven-item figure is no justification for arbitrary caps such as limiting a menu to 7 entries, and memory span differs between people and situations.
  Check: flag findings or code comments that treat seven plus-or-minus two as a hard cap; treat as a smell any long ungrouped sequence the user must hold in mind (codes, steps, options). [6]
- **LAW-7** Chunking (term from Miller's 1956 paper "The Magical Number Seven, Plus or Minus Two"): content falls into clearly separated, ranked groups so a reader can skim straight to the part they need; long strings are displayed and entered in short segments.
  Check: walls of text without headings or grouping; phone/IBAN/licence keys/OTPs shown or entered as one unbroken string. [7][24]
- **LAW-8** Cognitive Load (John Sweller, "Cognitive Load Theory, Learning Difficulty, and Instructional Design", 1988): the screen spends the user's attention only on the task; anything that demands thought without aiding understanding is removed.
  Check: decorative or distracting elements competing with the task area (auto-playing media, redundant banners, duplicate links), and tasks that require remembering information from a previous screen instead of showing it. [8][25]
- **LAW-9** Serial Position Effect (term coined by Hermann Ebbinghaus; primacy and recency): the items people most need sit at the start and end of a list or nav bar; the middle holds what matters least.
  Check: the most-used or most important nav item or option buried mid-list while low-value items take the first/last slots. [9]
- **LAW-10** Von Restorff Effect, isolation effect (Hedwig von Restorff, 1933): the one thing that matters most on a screen stands out, and only it — sparing emphasis keeps highlights from fighting each other or being mistaken for ads; the difference never rests on colour alone, and motion used for emphasis respects motion sensitivity.
  Check: primary-button count per VIS-22; primary action indistinguishable from secondary; emphasis carried only by hue (colour rules: see visual.md and a11y.md). [10]
- **LAW-11** Zeigarnik Effect (Bluma Zeigarnik, 1920s): unfinished work stays on people's minds, so the product shows plainly that more content exists and how much of an open task remains, giving users a reason to return and finish.
  Check: content cut off with no visible cue that more exists (no partial item, arrow or "more"); incomplete profiles/setups/drafts with no visible remaining-steps indicator. [11]

## Motivation and memory of the experience

- **LAW-12** Goal-Gradient Effect (Clark Hull, 1932; Hull 1934 rat-alley experiment): people speed up as the finish nears, so multi-step tasks show where the user stands and how far is left; the source adds that even artificial progress toward the goal raises motivation.
  Check: multi-step flows (checkout, onboarding, long forms) with no step count or progress indicator. [12]
- **LAW-13** Peak-End Rule (Kahneman, Fredrickson, Schreiber & Redelmeier, "When More Pain Is Preferred to Less: Adding a Better End", 1993): the strongest moment and the closing moment of a journey get deliberate design, because they shape how the whole is remembered and bad moments stick harder than good ones.
  Check: walk the journey's end states (confirmation, success, error, cancellation, waiting for a result) — (disposable only) reach success and confirmation for real; read-only: fake them with `page.route` and `route.fulfill()`, or read their templates; a bare or confusing ending, or an unmitigated negative peak (long unexplained wait, harsh error) breaks it. [13][26]

## Expectations and input

- **LAW-14** Jakob's Law (Jakob Nielsen, NN/g): the product follows the conventions users learned elsewhere; a redesign lets people stay on the old version for a transition period.
  Check: compare conventions against common products of the same kind (logo links home, cart top-right, search field looks like a field, standard control behaviour); where the repo or release notes show a major redesign, no preview or opt-out period for it. [14]
- **LAW-15** Postel's Law, robustness principle (Jon Postel, TCP specification): the product is strict in its own output and tolerant of what users type — it normalises any input whose meaning is clear, states the limits it enforces, and says plainly what it did with the value.
  Check: enter phone numbers with spaces/dashes/+country, card numbers with spaces, dates in several formats, emails with trailing spaces or capitals, pasted values; any rejection where meaning is clear breaks it. Grep for strict regex validation on such fields without normalisation. [15]
- **LAW-16** Paradox of the Active User (Rosson & Carroll, 1987): people dive in without reading instructions, so help lives where they are working (tooltips, inline hints), whichever route they took.
  Check: help available only in separate docs, up-front tutorials or skippable carousels; features with no in-context explanation where first-time users stall. [16][27]

## Grouping (gestalt)

- **LAW-17** Proximity, common region and uniform connectedness (Gestalt laws of grouping): things that belong together sit nearer each other than to anything else, share a container (border or background fill), or are joined by a line or frame, so the structure reads at a glance.
  Check: label-to-field spacing per VIS-17; equal spacing within and between groups; related controls split across regions; a group's members not enclosed or connected. Spacing scales: see visual.md. [17][18][19]
- **LAW-18** Similarity (Gestalt laws of grouping): elements that do the same thing look the same, elements that do different things look different, and links and navigation never look like plain text.
  Check: links styled as body text; clickable and non-clickable cards/chips that look identical; same action styled differently across screens. [20]

## Evaluating

- **LAW-19** Aesthetic-Usability Effect (Kurosu & Kashimura, Hitachi Design Center, 1995; 26 ATM UI variants, 252 participants): good looks raise how usable people think a product is and make them forgive small flaws, which can hide real problems in testing — so a verdict rests on observed behaviour, not on opinions.
  Check: on the most polished screens, count task failures, errors and time from traces; failures there are findings even when testers (human or agent) praise the look, and praise alone is never evidence. [21][22]

## Sources

Laws of UX by Jon Yablonski (lawsofux.com) is credited as the index these laws were selected from; its site is licensed CC BY-NC-ND 4.0 (https://creativecommons.org/licenses/by-nc-nd/4.0/), so no text from it is reproduced or adapted here — only facts and citations.
[1] Laws of UX — Doherty Threshold — https://lawsofux.com/doherty-threshold/
[2] Laws of UX — Fitts's Law — https://lawsofux.com/fittss-law/
[3] Laws of UX — Tesler's Law — https://lawsofux.com/teslers-law/
[4] Laws of UX — Hick's Law — https://lawsofux.com/hicks-law/
[5] Laws of UX — Choice Overload — https://lawsofux.com/choice-overload/
[6] Laws of UX — Miller's Law — https://lawsofux.com/millers-law/
[7] Laws of UX — Chunking — https://lawsofux.com/chunking/
[8] Laws of UX — Cognitive Load — https://lawsofux.com/cognitive-load/
[9] Laws of UX — Serial Position Effect — https://lawsofux.com/serial-position-effect/
[10] Laws of UX — Von Restorff Effect — https://lawsofux.com/von-restorff-effect/
[11] Laws of UX — Zeigarnik Effect — https://lawsofux.com/zeigarnik-effect/
[12] Laws of UX — Goal-Gradient Effect — https://lawsofux.com/goal-gradient-effect/
[13] Laws of UX — Peak-End Rule — https://lawsofux.com/peak-end-rule/
[14] Laws of UX — Jakob's Law — https://lawsofux.com/jakobs-law/
[15] Laws of UX — Postel's Law — https://lawsofux.com/postels-law/
[16] Laws of UX — Paradox of the Active User — https://lawsofux.com/paradox-of-the-active-user/
[17] Laws of UX — Law of Proximity — https://lawsofux.com/law-of-proximity/
[18] Laws of UX — Law of Common Region — https://lawsofux.com/law-of-common-region/
[19] Laws of UX — Law of Uniform Connectedness — https://lawsofux.com/law-of-uniform-connectedness/
[20] Laws of UX — Law of Similarity — https://lawsofux.com/law-of-similarity/
[21] Laws of UX — Aesthetic-Usability Effect — https://lawsofux.com/aesthetic-usability-effect/
[22] NN/g — The Aesthetic-Usability Effect — https://www.nngroup.com/articles/aesthetic-usability-effect/
[23] NN/g — Fitts's Law and Its Applications in UX — https://www.nngroup.com/articles/fitts-law/
[24] NN/g — How Chunking Helps Content Processing — https://www.nngroup.com/articles/chunking/
[25] NN/g — Minimize Cognitive Load to Maximize Usability — https://www.nngroup.com/articles/minimize-cognitive-load/
[26] NN/g — The Peak-End Rule: How Impressions Become Memories — https://www.nngroup.com/articles/peak-end-rule/
[27] NN/g — Paradox of the Active User — https://www.nngroup.com/articles/paradox-of-the-active-user/
