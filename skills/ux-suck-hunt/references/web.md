# Interaction UX for every platform, plus web specifics

Interaction UX for websites, iOS/iPadOS, Android and desktop apps alike (heuristics, feedback, forms, errors, navigation, search, empty/loading/error/offline states, loading and perceived speed, onboarding, permissions, dark patterns), plus web specifics in the sections marked web only (Core Web Vitals, responsive/mobile web, user-preference media queries). Read when: always, on every platform.
Summarised in our own words from the sources at the end; numbers and names are cited as facts.

## System status & feedback

- **WEB-1** Acknowledge every action quickly and visibly. Under 0.1 s a response reads as instant, up to 1 s the user's train of thought survives, and beyond 10 s attention drifts to something else. This rule owns the pass/fail line for response time: no visible change by 1 s is a finding; on the web, INP over 200 ms (WEB-50) is the field metric for the same thing; the Doherty 0.4 s (LAW-1) is a target, not a fail line.
  Check: time each control on a slow network (SKILL.md: Slow network) with a screen recording or trace (web: the DevTools Performance panel); a wait over 1 s with nothing changing on screen is a finding. [1][2]
- **WEB-2** Match the indicator to the wait: nothing below 1 s; from about 1 s some progress cue, and since the sources name no type for 1-2 s, a busy state on the control is enough; an indeterminate spinner for 2 to 10 s on a control or region (for a whole page or view, the skeleton of WEB-60); and at 10 s or more a percent-done bar with a cancel option. This rule owns the timings; WEB-60 owns which loader fits what is loading.
  Check: on a slow network (SKILL.md: Slow network), look for spinners that blink on quick loads, spinners on uploads/exports, and long jobs that cannot be stopped. [2][3][4]
- **WEB-3** Name things the way the audience does, using their domain vocabulary rather than the product's internals.
  Check: grep UI strings for DB column names, enum constants, HTTP status codes and internal codenames. [1]
- **WEB-4** Stick to the conventions of the wider web and use one term and one control per concept throughout; visitors arrive trained by other sites (Jakob's law).
  Check: collect the terms and controls used for a single concept (the verbs for one action, such as "Delete"/"Remove": TEXT-55 owns them); a logo that does not go home; links that do not look clickable. [1][14]
- **WEB-5** Keep choices on screen so people can pick instead of remember, and never make them memorise something from one screen to type on another.
  Check: a code or ID displayed on an earlier step and asked for later; menus made only of unlabelled icons. [1]

## User control, dialogs & notifications

- **WEB-6** Every flow, dialog and mode needs an obvious way out, and actions people may regret need a way back.
  Check: modals lacking a close or Cancel; multi-step flows lacking Back. Destructive actions with no undo, restore or fitting confirmation: WEB-68 owns them. [1][7]
- **WEB-7** Reach for undo before a confirmation; ask for confirmation only when the result is severe or permanent, never for everyday actions. A confirmation names what will happen, its buttons name the outcomes ("Delete file"/"Keep file"), and the destructive choice is not preselected.
  Check: grep `confirm(` and "Are you sure"; Yes/No/OK buttons; autofocus on the destructive button; confirmations on save, archive or favourite. [7]
- **WEB-8** The browser Back button must lead to the prior page exactly as the user left it.
  Check: press Back inside SPA flows; wiped form state, missing history entries or being thrown out of the app is a finding. [34]
- **WEB-9** Reserve modals for critical warnings or input the current task cannot proceed without; promotional or off-task content never goes in a modal, and nothing modal interrupts checkout.
  Check: newsletter or promo modals on load or during checkout. [8]
- **WEB-10** Errors never go in toasts or notifications that vanish on a timer; attach them to the input at fault. Success feedback appears next to the control that caused it.
  Check: grep toast/snackbar calls inside error/catch paths; an "Added to cart" banner far from its button. [18]
- **WEB-11** Anything needed to finish the task (instructions, format rules) sits on the page, not in a tooltip; tooltips stay short and add something the visible label does not already say.
  Check: `title=` or tooltip text carrying format rules or required info; tooltips that echo the button text. [9]
- **WEB-12** Tooltips open on keyboard focus too, not only on hover, and touch screens get a tap target (an "i" popup) instead.
  Check: tooltip handlers bound only to `mouseenter`. [9]

## Forms

- **WEB-13** Every question must earn its place: record why it is asked and what the answer is used for, and remove the rest. Baymard: most checkouts need only 8 fields; the 2024 average was 11.3.
  Check: count fields per form; flag any whose answer nothing downstream uses. [21][36]
- **WEB-14** Break long forms up using the "one thing per page" pattern (a single question, decision or fact per screen), and route people past questions that do not apply to them.
  Check: long single-page forms; questions everyone sees that only a few need. [36][34]
- **WEB-15** Stack form fields in one column; only parts of a single value (date parts, card expiry and CVC) may sit side by side.
  Check: desktop-width screenshot showing unrelated fields on one row. [27]
- **WEB-16** Each input carries a label that stays visible, placed above the field on mobile; placeholder text is never the label, hint or example.
  Check: `<input placeholder=` with no `<label>`; labels that live inside the field. [39][23]
- **WEB-17** Flag required and optional fields both, each at the label (an asterisk, and the word "Optional"); a single notice like "All fields are required" is not enough. (GOV.UK takes the opposite line and rules out asterisks for mandatory fields.)
  Check: forms flagging only one kind of field, or neither. [24][34]
- **WEB-18** Put `autocomplete` tokens on personal, address, payment and password inputs (`email`, `postal-code`, `cc-number`, `cc-exp`, `current-password`, `new-password`, `one-time-code`), and take card and phone numbers in a single input each.
  Check: grep inputs with no `autocomplete`; phone or card numbers split across boxes. [47][39]
- **WEB-19** Summon the right on-screen keyboard with `inputmode` (`numeric`, `decimal`, `tel`, `email`, `url`, `search`) rather than `type="number"` for codes and integers, and set `enterkeyhint` (`next`, `done`, `go`, `search`, `send`) to label the Enter key with its real effect.
  Check: grep `type="number"` on card, postcode, account or OTP fields; search and chat inputs lacking `enterkeyhint`. [39][51][52]
- **WEB-20** Let people type card numbers with spaces and group the digits as they type (4-4-4-4; Amex 4-6-5); do not reject, strip or length-cap the input.
  Check: enter a card number containing spaces; an error or silent stripping is a finding. [26]
- **WEB-21** When a form comes back with errors, every value the user typed is still there, card details included.
  Check: (disposable only) submit with one bad field; any emptied field is a finding. Read-only: in the guarded session the guard's 503 is a failed submit too, and every field must survive it (the 503 is not the finding; an emptied field is). [33][37][26]
- **WEB-22** Leave submit buttons enabled and explain problems after the attempt instead. Where duplicate submissions really occur, drop the repeat click and show that work is in progress.
  Check: submit `disabled` until the form is valid; (disposable only) a double click creating two records — read-only: double-click in the guarded session and count the writes it logs to `blocked.txt`. [35]
- **WEB-23** The main button's label is in sentence case and names what it does ("Continue", rather than "Next" or "Submit"). How many primary buttons: VIS-22.
  Check: vague labels on primary buttons. [35][34]
- **WEB-24** Multi-step transactions end with a summary of answers before the final submit; each Change link brings the user back to that summary once edited.
  Check: no summary step; a Change link that replays the whole flow. [38]
- **WEB-25** Checkout always works without an account, and the offer to create one waits until after the order is placed.
  Check: an account wall before payment; a "Create account" step inside checkout. [25]

## Validation & error messages

- **WEB-26** Do not flag a field while the person is still typing it; check it when focus leaves (Baymard) or when the form is submitted (GOV.UK). Once a message is showing, remove it on the keystroke that makes the value correct.
  Check: type into an email field; an error after the first character, or one that stays after the fix. [22][37]
- **WEB-27** After a failed submit, place an error summary at the top of `main` with the heading "There is a problem", send focus there, make each entry a link to its field, start the `<title>` with "Error: ", and show identical wording beside each faulty field.
  Check: submit an empty form in the guarded session, where client-side validation answers before any write; (disposable only) for the server's own errors — read-only: fake its 400/422 with `page.route` and `route.fulfill()`. Inspect focus, title, links and whether the wording matches. [32][37]
- **WEB-28** An error message names the problem and the fix in everyday words ("Enter your first name", "Name must be 35 characters or less"). It is never an error code, and avoids "valid", "invalid", "forbidden", "illegal", "you forgot", "oops", "please" and "sorry".
  Check: grep for "An error occurred", "Invalid", "This field is required", raw exception text and the words above. [1][5][33]
- **WEB-29** Design mistakes out: restrict inputs to what is possible, suggest probable corrections, and warn before a likely slip such as a mentioned but missing attachment.
  Check: free text where a picker would do; no "did you mean" suggestion on emails or addresses. [1][5]

## Navigation, content & search

- **WEB-30** Desktop layouts show top-level navigation openly along the top or left, not in a hamburger (people used hidden menus in 27% of desktop cases, against 48 to 50% for visible ones). Mobile shows up to 4 top links openly; if more must be hidden, key destinations are also linked from the page body.
  Check: screenshots at ≥1024 px and 375 px where a hamburger is the only navigation. [12]
- **WEB-31** Link wording: TEXT-26 owns the rule; menu items too must let people guess where they go, so in-house jargon in navigation fails.
  Check: read the navigation labels; product codenames or internal team names fail; link text: TEXT-26's Check. [10]
- **WEB-32** Sort long menus by how often items are used and put controls used in sequence next to each other: more options slow the choice (Hick's law), and farther, smaller targets slow the pointer (Fitts's law).
  Check: long menus in arbitrary order; a submit button far from the last field. [15][16]
- **WEB-33** Lead with what matters (key points early: TEXT-21): headings and link text that start with their most telling words, and text broken up by subheadings, lists and bolded key terms (readers skim in an F-pattern).
  Check: headings beginning "Welcome to" or "Introduction"; unbroken blocks of prose. [11]
- **WEB-34** Search is a text field visible at the top of the page, not a link or bare icon, and is wide enough to show a typical query.
  Check: a desktop homepage whose search hides behind an icon; a box too narrow for common queries. [13]
- **WEB-35** A search with no hits still offers a way forward: the query stays visible, alongside simpler or alternative queries (each previewing its top 3 to 5 results), related categories and links to support.
  Check: search for gibberish and for a typo; a page that only says "No results" is a finding. [30]
- **WEB-36** Autocomplete lists hold ≤10 suggestions on desktop and 4 to 8 on mobile; Up/Down move through them and Enter picks one; emphasis goes on the suggested completion rather than the letters already typed.
  Check: type a single letter, count suggestions, and arrow through them. [31]
- **WEB-37** Active filters are listed together, each removable on its own (an "x") with a Clear all as well; a bare count of active filters is not enough.
  Check: apply 2 filters and try to drop one without reopening the filter panel. [29]

## Empty, loading, error & offline states

- **WEB-38** No region is ever just blank: an empty state explains the cause (nothing yet, filters, still loading) and offers the action that would fill it.
  Check: screenshots of a fresh account ((disposable only) to create one — read-only: fake an empty list with `page.route` and `route.fulfill()`, or read the empty-state code) and of over-filtered lists; "No records" appearing before the data arrives on a slow network (SKILL.md: Slow network). [6]
- **WEB-39** Losing the connection is announced right away, along with what can still be done; cached content stays readable and user actions are queued to sync later rather than blocked.
  Check: cut the network (SKILL.md: Slow network; web: `context.setOffline(true)` or DevTools "Offline"); a blank screen, an endless spinner or lost input is a finding. (disposable only) Act while offline and reconnect: the queued actions write when they sync. [50]
- **WEB-40** When the system is down, apologise and tell people what will happen next; the worst moment and the last moment shape how the whole visit is remembered (peak-end rule).
  Check: fake a 500 or a timeout — web: `page.route` ending in `route.fulfill({ status: 500 })`, or a long delay then `route.fallback()`, never `route.continue()`, which bypasses the write guard; native: a mock server, the slow network (SKILL.md: Slow network), or (disposable only) a real failure; a generic "Something went wrong" with no next step is a finding. [5][17]

## Onboarding & permissions

- **WEB-41** Skip the up-front tutorial carousel where possible; if one exists, keep it short with a prominent Skip, and prefer hints shown at the moment a feature is used.
  Check: a first-visit carousel that cannot be skipped. [20]
- **WEB-42** Ask for notification, location or camera access only after the user does something that needs it, never as the page loads; a short explainer before the browser prompt is optional.
  Check: grep `Notification.requestPermission`, `getCurrentPosition`, `getUserMedia` running on load instead of inside a click handler. [49][19]
- **WEB-43** A refused permission leaves the product usable: read the blocked state through the Permissions API, offer another route (email in place of push, say), and explain how to turn access back on.
  Check: deny the prompt; a feature that silently breaks is a finding. [49]

## Dark patterns

- **WEB-44** The first price shown includes shipping, tax and any compulsory fees; nothing is added step by step (drip pricing). Unexpected extra costs are the leading reason shoppers abandon checkout (40%).
  Check: compare the first price on display with the amount at payment, walking to the payment step and stopping before paying. [60][59][28]
- **WEB-45** Cancelling takes no more effort than signing up and works through the same channel, with no retention offers forced in between.
  Check: count the steps to join and to cancel ((disposable only) by doing both — read-only: walk each flow to its last step without finishing it, and read the routes and help pages); web sign-ups that can only be cancelled by phone. [60][59]
- **WEB-46** Charge only with the customer's clear, informed agreement: paid extras and subscriptions start unticked, and a free trial states when and at what price it renews.
  Check: grep `checked` or default-true on paid add-ons and opt-ins; trials with no renewal date or price. [60][59]
- **WEB-47** Privacy settings are easy to reach and every option gets equal visual weight; defaults collect and share no more than people would anticipate.
  Check: a consent banner with a bold Accept and a hidden Reject; tracking switched on by default. [60]
- **WEB-48** Urgency, scarcity and popularity claims must be real; a countdown ends when the offer actually ends.
  Check: reload the page; a timer that restarts or a stock figure that changes at random is a finding. [60][59]
- **WEB-49** Word every choice even-handedly and respect a refusal: no confirmshaming, misleading wording, ads dressed as content, or prompts that keep coming back after dismissal.
  Check: read each decline link and opt-out label aloud; dismiss a prompt, move on, and see whether it reappears. [59][60]

## Performance (Core Web Vitals, web only)

- **WEB-50** Keep LCP ≤ 2.5 s (poor > 4 s), INP ≤ 200 ms (poor > 500 ms), CLS ≤ 0.1 (poor > 0.25), at the 75th percentile of page loads, split mobile/desktop.
  Check: Lighthouse, PageSpeed Insights or CrUX; the `web-vitals` library for field data. [40][41][42][43][44]
- **WEB-51** Give images and video `width`/`height` (or `aspect-ratio`), hold space for ads and embeds, and add late content below what is already shown, never above it.
  Check: grep `<img` lacking width/height; Layout Shift regions in a DevTools Performance recording. [45][42]
- **WEB-52** Move elements with `transform` rather than `top`/`left`, and tune the fallback font to the web font's metrics (`size-adjust` and the related overrides).
  Check: grep keyframes and transitions on top/left; text reflowing when fonts arrive. [45]

## Responsive & mobile web (web only)

- **WEB-53** Include `<meta name="viewport" content="width=device-width, initial-scale=1">` and leave zoom enabled: no `user-scalable=no` or `=0`, and no `maximum-scale` under 2 (WCAG's 200% resize); MDN advises allowing 5×.
  Check: grep the viewport meta tag; `user-scalable=no|0` or `maximum-scale` under 2 fails, under 5 is a weaker finding. [48][54]
- **WEB-54** Pages fit the viewport width without sideways scrolling; images get `max-width: 100%`; breakpoints follow where the content breaks, not device names.
  Check: screenshots at 320, 375 and 768 px; `document.documentElement.scrollWidth > innerWidth`. [48]
- **WEB-55** Use `dvh`/`svh` for full-height layouts instead of `100vh`, which overflows the visible area while mobile browser bars are showing.
  Check: grep `100vh`; a bottom CTA hidden behind the browser toolbar on a phone. [46]
- **WEB-56** Pages using `viewport-fit=cover` pad their edges with `env(safe-area-inset-*)` so nothing sits under a notch or home indicator.
  Check: grep `viewport-fit=cover` with no `safe-area-inset`; fixed bottom bars overlapping the home indicator. [54][53]
- **WEB-57** Nothing is reachable only by hovering; under `@media (hover: none)` or `(pointer: coarse)` every hover reveal has a tap equivalent (target sizes: see touch.md).
  Check: menus or content revealed only on hover; DevTools touch emulation. [55][56]
- **WEB-58** The web side of VIS-35: honour `prefers-reduced-motion: reduce` by dropping or swapping decorative motion, scaling and panning of large elements first.
  Check: grep animation code for a `prefers-reduced-motion` branch; emulate it in DevTools Rendering. [57]
- **WEB-59** Under `forced-colors: active`, controls must stay visible: since `box-shadow` and gradient backgrounds are forced to none, draw borders in system colors instead, and do not switch the mode off wholesale with `forced-color-adjust: none`.
  Check: emulate forced colors in DevTools Rendering; buttons or focus rings that disappear. [58]

## Loading & perceived speed

- **WEB-60** Size the loader to what is loading: a busy state or small spinner for a local wait (a button, a row, a panel); for a whole page or view, a skeleton whose blocks match the real layout (a bare header and footer frame does not count); one region fetching never blocks the whole screen. WEB-2 owns the timings.
  Check: load each screen on a slow network (SKILL.md: Slow network); a screen-wide spinner or overlay while one region fetches is a finding; a full-page spinner shown past 2 s where a skeleton would fit is a weaker finding. [4][61]
- **WEB-61** Show each part as soon as it is ready: frame and primary content first, text before images, offscreen images and heavy assets deferred (web: iframes and scripts too). Reserving space for what arrives late is WEB-51 (images, embeds, ads) and WEB-52 (fonts) on the web; a native app reserves it the same way for late images and embeds, and that native case is checked here.
  Check: screenshots or a screen recording every second on a slow network (SKILL.md: Slow network); text held back by unrelated assets; native only, content that jumps when an image or embed lands (web: WEB-51, WEB-52). [62][64]
- **WEB-62** Start work at the first clear signal of intent and acknowledge it at once: a search can fetch on the first keystroke (web: `keydown` rather than `keyup`), an upload can begin when the file is chosen rather than on submit, and a long operation shows its loader the moment it starts.
  Check: search and lookup handlers that wait for the key to come up (web: bound only to `keyup`) or for submit; uploads that only start on the final button: read-only, read whether the file input's change handler starts the upload; (disposable only) choose a file and watch whether the request leaves before submit. [62][64]
- **WEB-63** Keep progress honest: a percent-done bar tracks real work and never parks at 99%. When the length is unknown, name the current step and count ("Importing 3 of 12") and phrase estimates loosely ("this can take a few minutes").
  Check: (disposable only) start a long job on a slow network (SKILL.md: Slow network); a bar that stalls near the end, jumps to done, or a precise estimate that turns out wrong. Read-only: read how the progress value and estimate are computed. [61]
- **WEB-64** Let long jobs run without the user: past about 10 s, offer to continue in the background with a small progress drawer they can walk away from, and say when it is done, in the app or by email.
  Check: an export, import or report that holds the screen for minutes with no way out, on a slow network (SKILL.md: Slow network) ((disposable only) to start an import — read-only: read the job's UI code for a background path). [61]
- **WEB-65** Refresh without pulling content out from under the reader: data that syncs itself updates quietly; new data for something the user is reading is announced (a banner or toast that loads it on request) rather than reshuffled in.
  Check: leave a list open while new items arrive (web: serve them with `page.route` and `route.fulfill()`; (disposable only) by creating them); rows that jump or reorder under the cursor. [61]
- **WEB-66** Use optimistic updates for cheap, reversible actions that nearly always succeed (a like, a toggle, add to cart, reordering): show the result at once and confirm in the background. When the server refuses, roll back visibly and say what failed; a silent rollback is a screen that lied. Money, deletes and anything irreversible wait for the server.
  Check: toggles that wait a round trip before moving: read-only, read whether the handler changes state before the request resolves, or (web) answer the toggle's request with a delayed `page.route` that ends in `route.fulfill()`; (disposable only) flip it on a slow network (SKILL.md: Slow network). On a 500 (web: `page.route` with `route.fulfill({ status: 500 })`; native: a mock server or (disposable only) a real failure), an optimistic change that vanishes without a message. [63][1]

## Finding your way: calm, not hidden

- **WEB-67** Show up front what most users need for most tasks, and nothing that competes with it; put the rest behind a trigger that is plainly visible and labelled so it predicts what is behind it. Go no deeper than two disclosure levels, and give each secondary option one route, not several. A calm screen hides the rare, never the primary.
  Check: `reveal.js` output: a top-task action behind any revealer or only on hover; anything at depth 3 or more; a trigger labelled only "More", "..." or an icon; one option reachable from several menus. [65]

## Protecting against loss

- **WEB-68** Match the safeguard to the loss: undo for anything that can be reversed; a specific confirmation (WEB-7) for what is permanent; and for the rare, catastrophic ones (deleting an account, a whole project, every record) a step people would never do by habit, such as typing a confirming word. Keep that last tier for the few actions that earn it, or typing becomes the next reflex. A short-lived undo (a snackbar) is backed by somewhere lasting — trash, history, versions — because some regret it days later; and a destructive confirmation looks unlike the routine dialogs, so habit does not click it through.
  Check: list the destructive controls by hand: filter `reveal.js` output (its controls and its skipped list) by name for delete, remove, erase, clear and close account, since it does not flag them. Read-only: read each one's handler for a confirmation and its wording, an undo, and a soft-delete or trash path. (disposable only) press each and look for the item in trash or history afterwards. Each needs undo, a confirmation naming what is lost, or — for account, project or bulk deletion — a typed confirmation; a typed confirmation on routine deletes is a finding too; so is an undo snackbar with nothing lasting behind it. [7][66]

## Sources

Contains public sector information licensed under the Open Government Licence v3.0 (https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/).
Credit: web.dev, the Creative Commons Attribution 4.0 License (https://creativecommons.org/licenses/by/4.0/).
Credit: MDN Web Docs by Mozilla Contributors, CC-BY-SA 2.5 (https://creativecommons.org/licenses/by-sa/2.5/).
Credit: the FTC report cited below. Source: United States Federal Trade Commission, www.ftc.gov (public domain US Government work; https://www.ftc.gov/policy-notices/website-policy).

[1] NN/g, 10 Usability Heuristics for User Interface Design — https://www.nngroup.com/articles/ten-usability-heuristics/
[2] NN/g, Response Times: The 3 Important Limits — https://www.nngroup.com/articles/response-times-3-important-limits/
[3] NN/g, Progress Indicators Make a Slow System Less Insufferable — https://www.nngroup.com/articles/progress-indicators/
[4] NN/g, Skeleton Screens 101 — https://www.nngroup.com/articles/skeleton-screens/
[5] NN/g, Error-Message Guidelines — https://www.nngroup.com/articles/error-message-guidelines/
[6] NN/g, Designing Empty States in Complex Applications — https://www.nngroup.com/articles/empty-state-interface-design/
[7] NN/g, Confirmation Dialogs Can Prevent User Errors (If Not Overused) — https://www.nngroup.com/articles/confirmation-dialog/
[8] NN/g, Modal & Nonmodal Dialogs — https://www.nngroup.com/articles/modal-nonmodal-dialog/
[9] NN/g, Tooltip Guidelines — https://www.nngroup.com/articles/tooltip-guidelines/
[10] NN/g, Information Scent — https://www.nngroup.com/articles/information-scent/
[11] NN/g, F-Shaped Pattern of Reading on the Web — https://www.nngroup.com/articles/f-shaped-pattern-reading-web-content/
[12] NN/g, Hamburger Menus and Hidden Navigation Hurt UX Metrics — https://www.nngroup.com/articles/hamburger-menus/
[13] NN/g, Search: Visible and Simple — https://www.nngroup.com/articles/search-visible-and-simple/
[14] NN/g, Maintain Consistency and Adhere to Standards (Heuristic #4) — https://www.nngroup.com/articles/consistency-and-standards/
[15] NN/g, Fitts's Law and Its Applications in UX — https://www.nngroup.com/articles/fitts-law/
[16] NN/g, Hick's Law: Designing Long Menu Lists (video) — https://www.nngroup.com/videos/hicks-law-long-menus/
[17] NN/g, The Peak-End Rule — https://www.nngroup.com/articles/peak-end-rule/
[18] NN/g, Indicators, Validations, and Notifications — https://www.nngroup.com/articles/indicators-validations-notifications/
[19] NN/g, Permission Requests — https://www.nngroup.com/articles/permission-requests/
[20] NN/g, Mobile-App Onboarding — https://www.nngroup.com/articles/mobile-app-onboarding/
[21] Baymard, Checkout Optimization: Minimize Form Fields — https://baymard.com/blog/checkout-flow-average-form-fields
[22] Baymard, Usability Testing of Inline Form Validation — https://baymard.com/blog/inline-form-validation
[23] Baymard, Mobile Form Usability: Place Labels Above the Field — https://baymard.com/blog/mobile-form-usability-label-position
[24] Baymard, Mark Both Required and Optional Fields — https://baymard.com/blog/required-optional-form-fields
[25] Baymard, Delay Account Creation Until the End of Checkout — https://baymard.com/blog/delayed-account-creation
[26] Baymard, Format the Credit Card Number Field — https://baymard.com/blog/credit-card-field-auto-format-spaces
[27] Baymard, Avoid Multi-Column Forms — https://baymard.com/blog/avoid-multi-column-forms
[28] Baymard, Cart Abandonment Rate Statistics — https://baymard.com/blog/cart-abandonment-rate
[29] Baymard, How to Design Applied Filters — https://baymard.com/blog/how-to-design-applied-filters
[30] Baymard, "No Results" Page — https://baymard.com/blog/no-results-page
[31] Baymard, Autocomplete Design — https://baymard.com/blog/autocomplete-design
[32] GOV.UK Design System, Error summary — https://design-system.service.gov.uk/components/error-summary/
[33] GOV.UK Design System, Error message — https://design-system.service.gov.uk/components/error-message/
[34] GOV.UK Design System, Question pages — https://design-system.service.gov.uk/patterns/question-pages/
[35] GOV.UK Design System, Button — https://design-system.service.gov.uk/components/button/
[36] GOV.UK Service Manual, Structuring forms — https://www.gov.uk/service-manual/design/form-structure
[37] GOV.UK Design System, Recover from validation errors — https://design-system.service.gov.uk/patterns/validation/
[38] GOV.UK Design System, Check answers — https://design-system.service.gov.uk/patterns/check-answers/
[39] GOV.UK Design System, Text input — https://design-system.service.gov.uk/components/text-input/
[40] web.dev, Web Vitals — https://web.dev/articles/vitals
[41] web.dev, Interaction to Next Paint (INP) — https://web.dev/articles/inp
[42] web.dev, Cumulative Layout Shift (CLS) — https://web.dev/articles/cls
[43] web.dev, Largest Contentful Paint (LCP) — https://web.dev/articles/lcp
[44] web.dev, Defining the Core Web Vitals metrics thresholds — https://web.dev/articles/defining-core-web-vitals-thresholds
[45] web.dev, Optimize Cumulative Layout Shift — https://web.dev/articles/optimize-cls
[46] web.dev, The large, small, and dynamic viewport units — https://web.dev/blog/viewport-units
[47] web.dev Learn Forms, Autofill — https://web.dev/learn/forms/autofill
[48] web.dev, Responsive web design basics — https://web.dev/articles/responsive-web-design-basics
[49] web.dev, Permission UX best practices — https://web.dev/articles/permissions-best-practices
[50] web.dev, Offline UX design guidelines — https://web.dev/articles/offline-ux-design-guidelines
[51] MDN, inputmode — https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/inputmode
[52] MDN, enterkeyhint — https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Global_attributes/enterkeyhint
[53] MDN, env() — https://developer.mozilla.org/en-US/docs/Web/CSS/env
[54] MDN, Viewport meta tag — https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport
[55] MDN, hover media feature — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover
[56] MDN, pointer media feature — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer
[57] MDN, prefers-reduced-motion — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
[58] MDN, forced-colors — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/forced-colors
[59] Deceptive Patterns (deceptive.design), Types (practitioner catalogue of examples) — https://www.deceptive.design/types
[60] FTC Staff Report, Bringing Dark Patterns to Light (Sept 2022) — https://www.ftc.gov/system/files/ftc_gov/pdf/P214800%20Dark%20Patterns%20Report%209.14.2022%20-%20FINAL.pdf
[61] Pencil & Paper, UX Design Patterns for Loading (Vassilatos & Crawshaw, 2022; practitioner article, pattern examples, no research cited) — https://www.pencilandpaper.io/articles/ux-pattern-analysis-loading-feedback
[62] MDN, Perceived performance — https://developer.mozilla.org/en-US/docs/Learn_web_development/Extensions/Performance/Perceived_performance
[63] SubUX, Perceived speed (2026; practitioner guide, its optimistic-UI advice cites no research) — https://subux.pro/guides/article/perceived-speed
[64] Marvel, A Designer's Guide to Perceived Performance (Luke Jones; practitioner examples, no research cited) — https://marvelapp.com/blog/a-designers-guide-to-perceived-performance/
[65] NN/g, Progressive Disclosure — https://www.nngroup.com/articles/progressive-disclosure/
[66] UX Collective, Delete models in products, because sometimes cats walk on keyboards (Keren Rijensky, 2017; practitioner article) — https://uxdesign.cc/delete-models-in-products-because-sometimes-cats-walk-on-keyboards-6f886b767f6d
