# Touch and haptics

How big and how far apart touch targets must be on each platform, gestures and the alternatives they need, grip and reach, touch on the web, designing haptic feedback, stylus. Read when: the product runs on a touchscreen (phone, tablet, touch laptop, kiosk) or plays haptics or vibration.
Summarised in our own words from the sources at the end; numbers and names are cited as facts.

## Target size compared

| Source | Recommended | Minimum / exception | Spacing |
|---|---|---|---|
| Apple HIG [3] | Default control 44×44 pt on iOS, iPadOS, watchOS; 60×60 pt visionOS; 66×66 pt tvOS; 28×28 pt macOS | Minimum control size: 28×28 pt on iOS, iPadOS, watchOS, visionOS; 56×56 pt tvOS; 20×20 pt macOS | Roughly 12 pt of padding around controls with a bezel, roughly 24 pt around the visible edge of controls without one |
| Android / Material [7][8][9] | 48×48 dp or more, and bigger helps; 48 dp comes out near 9 mm | 7-10 mm physical range | At least 8 dp between targets |
| Microsoft Windows [10] | 7.5 mm square, equal to 40×40 pixels at 135 PPI and 1.0x scaling | Go larger for often-hit targets; add padding for targets whose mis-tap is costly | No number given |
| WCAG 2.5.8 Target Size (Minimum), AA [1] | 24×24 CSS px or more | Spacing exception: an undersized target still passes when a 24 CSS px diameter circle centred on its bounding box overlaps no other target and no other undersized target's circle. Further exceptions: Equivalent, Inline, User agent control, Essential | Through the circle test |
| WCAG 2.5.5 Target Size (Enhanced), AAA [2] | 44×44 CSS px or more | Equivalent (a 44×44 control elsewhere on the page does the same), Inline, User agent control, Essential. Spacing does not rescue a small target here | — |
| NN/g [17] | 1 cm × 1 cm or more | Gaps cannot make up for a target that is too small | Roughly 2 mm is the minimum gap commonly recommended |

- **TOUCH-1** Size every touch target to its platform's recommended size: 44×44 pt for iOS/iPadOS (Apple's default; under Apple's 28×28 pt minimum fails, 28-43 pt is a weaker finding), 48×48 dp for Android, 7.5 mm for Windows touch, and 24×24 CSS px on the web (AA) or 44×44 for AAA.
  Check: measure `boundingBox()` in Playwright for each `a, button, input, select, [role=button], [onclick]` (see Measure); run Android Accessibility Scanner or Xcode Accessibility Inspector; lay a 44 pt grid over a screenshot. [1][2][3][7][9][10]
- **TOUCH-2** On the web, a target smaller than 24×24 CSS px fails unless it passes the 24 px circle test, sits inside running text, is untouched browser UI, has a size that is essential or legally required, or another compliant control on the page does the same job. A11Y-40 is the WCAG line; this rule is its detail.
  Check: centre a 24 px circle on each small target's bounding box and look for overlap with neighbours; rows of 16 px tall buttons stacked directly on each other fail. [1]
- **TOUCH-3** Enlarge the touchable region, not necessarily the drawing: add padding around small icons until the hit area meets TOUCH-1's size, leaving the visual size alone.
  Check: Android Views — `paddingLeft + minWidth + paddingRight ≥ 48dp`, same sum vertically; Compose — a custom `clickable` lacking `sizeIn(minWidth = 48.dp, minHeight = 48.dp)` or `minimumInteractiveComponentSize()`; web — an icon button whose `width/height` is under 24px with zero padding. [7][8]
- **TOUCH-4** Leave room between neighbouring targets: 8 dp or more on Android; around 12 pt (bezeled) or 24 pt (no bezel) of padding on Apple platforms.
  Check: measure the gap between adjacent targets from a screenshot or layout bounds; icon toolbars and the trailing icons of list rows fail most often. [3][9]
- **TOUCH-5** Give high-stakes targets more size and more padding, and move them away from the content edge and from controls people hit often.
  Check: Delete/Pay/Send flush against a frequently tapped control; a tiny dismiss "x" next to a Follow or Buy button. [10][17][19]
- **TOUCH-6** In Compose, give each small clickable its own 48 dp minimum; otherwise the automatic hit-area expansion can spill into a neighbour's touch area.
  Check: a `.clickable` composable smaller than 48.dp placed next to another clickable. [8]

## Gestures

- **TOUCH-7** Keep standard gestures on their standard jobs: tap to activate or select, swipe to reveal actions, dismiss or scroll, drag to move, touch-and-hold for extra options, pinch to zoom. A well-known gesture must not trigger something unique to the app, and a standard action must not need a new gesture.
  Check: grep custom recognizers (`UISwipeGestureRecognizer`, `UILongPressGestureRecognizer`, `pointerInput`, `detectTapGestures`, `GestureDetector`, Hammer.js, `touchstart`) and compare each action against that list. [4]
- **TOUCH-8** Back every gesture with a visible control; the gesture only speeds things up. Apple's examples: a Back button alongside edge-swipe back, a button alongside swipe-to-dismiss.
  Check: for each gesture handler, look for a button or menu item that does the same; if there is none, report it. [3][4]
- **TOUCH-9** Anything driven by a multipoint gesture (pinch, two fingers) or a path-based one (tracing a route or pattern) also works with one pointer and plain taps, unless the path itself is essential (WCAG 2.5.1, A).
  Check: a map, carousel or image viewer that offers only pinch or swipe, with no +/- or previous/next buttons. [11]
- **TOUCH-10** Anything done by dragging can also be done by one pointer without dragging (WCAG 2.5.7, AA): sortable lists, sliders, kanban cards, map panning inside custom scroll areas.
  Check: grep `draggable`, `dragstart`, `react-beautiful-dnd`, `dnd-kit`, `SortableJS`, `onDragGesture`, `.draggable(`; confirm a tap-then-tap-destination path, up/down buttons or a menu. Native browser scrolling is out of scope; scrolling the page reimplements is in scope. [14]
- **TOUCH-11** Complete actions on release, and let people back out (slide off before lifting) or undo; acting on touch-down is only acceptable when that is essential (WCAG 2.5.2, A).
  Check: grep `touchstart`, `pointerdown`, `mousedown`, `onPressIn`, `ACTION_DOWN` handlers that navigate, submit, delete or buy. [12]
- **TOUCH-12** Any feature triggered by shaking, tilting or other movement also needs an on-screen control, plus a way to switch motion triggering off (WCAG 2.5.4, A).
  Check: grep `devicemotion`, `deviceorientation`, `CMMotionManager`, `motionEnded`, `SensorManager`, `TYPE_ACCELEROMETER`; find the equivalent button and the off setting. [13]
- **TOUCH-13** Leave system edge gestures to the system. On Android an inward swipe from the left or right edge means Back and the bottom edge belongs to Home and app switching, which apps cannot override; carve out edge regions with `setSystemGestureExclusionRects` only where truly needed, and in games only while playing. On Apple platforms, avoid custom gestures that clash with system ones.
  Check: carousels or drawers whose swipe starts at the screen edge; `setSystemGestureExclusionRects` calls with large or always-on rects; custom edge-pan recognizers on iOS. [4][15]
- **TOUCH-14** A custom gesture (touch-and-hold included) has to be findable, easy to do, unlike other gestures, and taught inside the app.
  Check: a feature reachable only through long-press, double-tap or multi-finger gestures, with no hint, menu entry or onboarding. [4]
- **TOUCH-15** When a gesture cannot work, say so visibly instead of doing nothing (an item that is locked and won't drag, a disabled button that still looks active).
  Check: try the gesture on locked or disabled items in the running app; no visible response means a finding. [4]
- **TOUCH-16** Respond during the gesture, not after: the item tracks the finger and the swipe exposes the action progressively, so people can see what will happen and how far to go.
  Check: record a swipe or drag; if nothing moves until the finger lifts, report it. [4]
- **TOUCH-17** Reserve row swipes for the destructive actions people look for there; every swipe-delete needs a confirmation or an undo that is easy to spot; important actions must also be reachable without swiping.
  Check: swipe a list row partway to reveal its actions; (disposable only) complete a swipe-delete — read-only: read its handler for undo or confirmation; deletion with no undo snackbar/toast and no confirmation is a finding, as is an action available only behind the swipe. [16]
- **TOUCH-18** Keep pinch zoom working: the viewport tag follows WEB-53 (iOS 10 and later disregards `maximum-scale` by default, other browsers may honour it), and no `touch-action: none` sits on page-wide containers.
  Check: the viewport grep in WEB-53; `touch-action: none` on `html`, `body` or full-page wrappers. [23][25]

## Reach and grip

- **TOUCH-19** Expect many grips, swapped frequently: across 1,333 observations (780 people touching the screen) Hoober saw 49% one-handed, 36% cradled and 15% two-handed use, with people changing grip within seconds.
  Check: a flow usable only with two hands (a frequent action needs reaches to opposite far corners) or only in one orientation. [18]
- **TOUCH-20** Place primary content and actions mid-screen, secondary actions on the top and bottom edges, and tertiary functions in menus; Hoober's later data shows the centre is touched most, fastest and most accurately, and people prefer it. His 2013 thumb-zone drawings were withdrawn by him, so do not base findings on them.
  Check: a primary action in a top corner; any finding that leans on a green/yellow/red thumb-zone overlay. [18][19]
- **TOUCH-21** Make edge and corner targets bigger than central ones: in Hoober's data, 95% of taps landed within 7 mm at the centre and about 12 mm at the corners.
  Check: corner icons (close, back, overflow) built at no more than the platform minimum. [19]
- **TOUCH-22** Separate risky or unrelated controls from frequent ones, and keep them out of the upper-left area that a right thumb struggles to reach one-handed.
  Check: a destructive action next to a frequent one, or sitting in the top-left corner. [18][19]
- **TOUCH-23** For a handful of top-level destinations use a persistent bottom tab bar (beyond 5 they stop fitting); a hamburger menu hides options more than any other pattern, so it must not be the only navigation.
  Check: count the top-level destinations; report navigation that exists only inside a menu icon with no visible tabs. [20]

## Touch on the web

- **TOUCH-24** Adjust layout to the input: under `@media (pointer: coarse)` (the main pointer is imprecise, such as a finger) give targets more room, and use `any-pointer` when any attached pointer matters, not just the main one.
  Check: grep CSS for `pointer: coarse` / `any-pointer`; a compact desktop layout sent unchanged to touch devices. [21]
- **TOUCH-25** Hover reveals need a tap path: WEB-57 owns the rule. On touch, `hover: none` matches devices whose main input cannot hover, or can only fake it through a long press.
  Check: grep `:hover` rules that toggle `display`/`visibility`/`opacity` of menus or buttons, and `mouseenter`/`mouseover` handlers lacking a click/tap equivalent; in Playwright with `hasTouch`, try opening the menu with `tap()` alone. [22]
- **TOUCH-26** Include `<meta name="viewport" content="width=device-width">`: the page gets a mobile layout and loses the old 300-350 ms tap delay (removed for such pages from Chrome 32 on); `touch-action: manipulation` drops double-tap zoom and its click delay while leaving pinch zoom intact.
  Check: no viewport meta, or a fixed-width one; lag between tap and response in a trace. [23][24][25]
- **TOUCH-27** Give every custom button and tappable row a visible pressed state (`:active` or similar), so the tap registers visually before the result lands.
  Check: custom `div`/`span` click targets with no `:active` style plus `-webkit-tap-highlight-color: transparent`; a mid-tap screenshot that looks identical to the resting state. [4]
- **TOUCH-28** Never rely on `navigator.vibrate`: MDN lists it as limited availability (not Baseline); Safari and iOS Safari lack it, desktop Firefox dropped it in 129, Firefox for Android returns `true` but never vibrates, and Chrome for Android needs a user gesture (from 60) and refuses it in cross-origin iframes (from 55).
  Check: grep `navigator.vibrate`; any message or confirmation delivered by vibration alone. [28]

## Haptics

- **TOUCH-29** Haptics reinforce what the screen and sound already say; they never carry information on their own, and the app stays fully usable with them switched off.
  Check: an outcome (success, error, limit hit) whose handler fires a haptic but changes nothing visible or audible. [5][26]
- **TOUCH-30** Offer a way to disable haptics and obey the system. On Android, `performHapticFeedback` and the other haptic APIs follow the user's touch-feedback setting; on iOS the Taptic Engine stays silent in Low Power Mode, when switched off in Settings, and while the camera or dictation runs.
  Check: UI feedback routed through paths that skip settings (Android `Vibrator.vibrate`); a haptics-heavy app or game with no in-app switch. [5][27][34]
- **TOUCH-31** Pick system haptics by what they are documented to mean: iOS `UIFeedbackGenerator` offers Notification (a task's result, as success, warning or error, so those three outcomes never share one pattern), Impact (a physical bump, such as something snapping into place) and Selection (a value stepping through choices); on Android reach for `HapticFeedbackConstants` (`CONFIRM`, `REJECT`, `VIRTUAL_KEY` and others) before building custom effects. Do not borrow a pattern for some other meaning.
  Check: grep the calls (see Measure) and match each to its trigger; an error playing a success notification, success, warning and error sharing one pattern, or a selection tick on a plain button press are findings. [5][26][27]
- **TOUCH-32** One interaction, one haptic, across the whole app, and the same haptic the system uses for well-known controls such as pickers and keyboards.
  Check: list every haptic call with its trigger; similar actions with different or absent haptics are findings. [5][26]
- **TOUCH-33** Use haptics sparingly: short pulses for discrete events, barely perceptible ones for very frequent events (scrolling, dragging a text handle), stronger ones for important events than for routine ones.
  Check: a haptic inside a scroll or `onChange` handler that fires every frame; heavy impacts on everyday taps; long continuous haptics outside games. [5][26]
- **TOUCH-34** Choose crisp haptics over buzzy, ringing ones, and for touch feedback prefer no haptic at all to a buzzy one. Do not use legacy one-shot vibrations (`VibrationEffect.createOneShot`, `Vibrator.vibrate(long)`, `Vibrator.vibrate(long[], int)`) for feedback: a keyclick should take 10-20 ms, yet the actuator can keep ringing for another 20-50 ms.
  Check: grep `createOneShot`, `createWaveform`, `vibrate(` on UI taps; Flutter `HapticFeedback.vibrate()` used for routine feedback. [26][27]
- **TOUCH-35** Time each haptic to land with its animation and sound; a mismatch makes the device feel faulty.
  Check: a haptic that fires after an `await` or network call when the animation already finished, or before the animation begins. [5][26]
- **TOUCH-36** Hold haptics back while the camera, gyroscope or microphone is working.
  Check: haptic calls inside capture, recording or motion-tracking flows. [5]

## Stylus

- **TOUCH-37** The pencil or stylus must work on every control, and touching the canvas with it must draw at once, without first picking a mode or pressing a button.
  Check: controls that respond to a finger but ignore pencil/stylus input (Android: handlers that discard `TOOL_TYPE_STYLUS` pointers); a "draw mode" switch needed before inking. [6][29]
- **TOUCH-38** Pencil hover may preview but never act, Apple Pencil double-tap must not run anything destructive, and the user's system-wide double-tap choice should be honoured.
  Check: hover handlers that commit changes; double-tap wired to delete or clear. [6]
- **TOUCH-39** Remove strokes the system later cancels: on Android, after `ACTION_CANCEL` (navigation gesture, palm rejection) or `FLAG_CANCELED` (Android 13+), drop that pointer's stroke since its last `ACTION_DOWN` and redraw.
  Check: grep the drawing surface's touch handler for `ACTION_CANCEL` and `FLAG_CANCELED`; a resting palm that leaves marks is a finding. [29]
- **TOUCH-40** Place drawing-app controls so neither a left nor a right hand covers them, or make them movable.
  Check: a fixed palette on one side that the drawing hand hides. [6]

## Haptics: devices and judging them

- **TOUCH-41** How a haptic feels is judged in its final context, on a physical device that supports haptics, not from the code or on a desktop. Which pattern each meaning gets is TOUCH-31's, one haptic per interaction is TOUCH-32's, and agreeing with screen and sound is TOUCH-29's.
  Check: on a supported device, play each call on the TOUCH-32 list through read-only actions ((disposable only) for one behind a write; read-only: leave it to the code review of TOUCH-29 to TOUCH-36); two meanings that feel alike in the hand though the code gives them different patterns, or a haptic felt where no call was found (a library or system default firing). [35]
- **TOUCH-42** Some Apple devices have no haptics at all (iPad, iPod touch, Apple Vision Pro): check `CHHapticEngine.capabilitiesForHardware().supportsHaptics` and give those devices the same information as sound or a visual cue.
  Check: read the code paths: a confirmation that exists only as a haptic, so iPad users get nothing; Core Haptics code with no `supportsHaptics` branch. [36]

## Measure

Playwright device emulation (checked with playwright-core 1.65.0 and run in headless Chromium):

```js
const { chromium, webkit, devices } = require('playwright');
// devices['iPhone 15'], devices['iPad Pro 11'] (webkit, isMobile, hasTouch); devices['Pixel 7'] (chromium)
const ctx = await browser.newContext({ ...devices['Pixel 7'] });
const page = await ctx.newPage();
await page.goto(url);
await page.evaluate(() => [matchMedia('(pointer: coarse)').matches, matchMedia('(hover: none)').matches]); // [true, true] in run
await page.locator('nav >> text=Menu').tap();   // needs hasTouch: true, else "The page does not support tap"
const small = await page.$$eval('a,button,input,select,textarea,[role=button],[onclick]',
  els => els.map(e => { const r = e.getBoundingClientRect(); return { html: e.outerHTML.slice(0, 80), w: r.width, h: r.height }; })
            .filter(r => r.w > 0 && (r.w < 24 || r.h < 24)));   // candidates for TOUCH-1/2; apply the spacing test by hand
```

- `isMobile` makes the page honour the meta viewport and turns on touch events; `hasTouch` turns on touch events and is off unless set. The device descriptors switch both on. [30][31]
- `locator.tap()` / `page.tap()` tap via `page.touchscreen` and require `hasTouch: true`. [32]
- Use `tap()` (not `click()`) to prove hover-only menus fail (TOUCH-25), and record a trace to time tap-to-feedback (TOUCH-16, TOUCH-27).
- Native: Android Accessibility Scanner flags small targets (accounts for `TouchDelegate` only on Android 10+); Xcode Accessibility Inspector. Documented, not run here. [9]

Grep for haptics and vibration (then apply TOUCH-29 to TOUCH-36, TOUCH-41 and TOUCH-42 to each hit):

```sh
rg -n 'UIImpactFeedbackGenerator|UINotificationFeedbackGenerator|UISelectionFeedbackGenerator|UIFeedbackGenerator|CHHapticEngine|\.sensoryFeedback\(|NSHapticFeedbackManager|WKInterfaceDevice.*play'   # Apple
rg -n 'performHapticFeedback|HapticFeedbackConstants|VibrationEffect|Vibrator|createOneShot|createWaveform|LocalHapticFeedback|android.permission.VIBRATE'   # Android
rg -n 'HapticFeedback\.(lightImpact|mediumImpact|heavyImpact|selectionClick|vibrate|successNotification|warningNotification|errorNotification)'   # Flutter
rg -n "expo-haptics|Haptics\.(impactAsync|notificationAsync|selectionAsync|performAndroidHapticsAsync)|react-native-haptic-feedback"   # React Native / Expo
rg -n 'navigator\.vibrate'   # Web
rg -n 'touchstart|pointerdown|onPressIn|devicemotion|deviceorientation|user-scalable|touch-action:\s*none|setSystemGestureExclusionRects'   # TOUCH-11/12/13/18
```

The Flutter `HapticFeedback` and Expo `Haptics` names above match their API reference pages. [33][34]

## Sources

Credit: W3C documents (WCAG 2.2 Understanding), Copyright (c) 2023 W3C, under the W3C Document License (https://www.w3.org/copyright/document-license-2023/).
Credit: MDN Web Docs by Mozilla Contributors, CC-BY-SA 2.5 (https://creativecommons.org/licenses/by-sa/2.5/).
Credit: Android Developers documentation by the Android Open Source Project, the Apache License 2.0 (https://www.apache.org/licenses/LICENSE-2.0).
Credit: Chrome for Developers, the Creative Commons Attribution 4.0 License (https://creativecommons.org/licenses/by/4.0/).
Credit: Microsoft Learn (Windows apps documentation), CC BY 4.0 (https://creativecommons.org/licenses/by/4.0/).
Credit: the Playwright documentation by Microsoft, the Apache License 2.0 (https://www.apache.org/licenses/LICENSE-2.0).
Credit: the Flutter documentation (docs.flutter.dev, api.flutter.dev), Creative Commons Attribution 4.0 International (https://creativecommons.org/licenses/by/4.0/).
Credit: the Expo documentation, Copyright (c) 650 Industries, Inc. (Expo), the MIT License (https://opensource.org/license/mit).

[1] W3C, Understanding SC 2.5.8 Target Size (Minimum) — https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html
[2] W3C, Understanding SC 2.5.5 Target Size (Enhanced) — https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html
[3] Apple HIG, Accessibility (Mobility) — https://developer.apple.com/design/human-interface-guidelines/accessibility
[4] Apple HIG, Gestures — https://developer.apple.com/design/human-interface-guidelines/gestures
[5] Apple HIG, Playing haptics — https://developer.apple.com/design/human-interface-guidelines/playing-haptics
[6] Apple HIG, Apple Pencil and Scribble — https://developer.apple.com/design/human-interface-guidelines/apple-pencil-and-scribble
[7] Android Developers, Make apps more accessible (and Views version) — https://developer.android.com/guide/topics/ui/accessibility/apps ; https://developer.android.com/guide/topics/ui/accessibility/views/apps-views
[8] Android Developers, Compose accessibility API defaults: Minimum touch target sizes — https://developer.android.com/develop/ui/compose/accessibility/api-defaults
[9] Google Android Accessibility Help, Touch target size — https://support.google.com/accessibility/android/answer/7101858
[10] Microsoft Learn, Targeting (Windows apps) — https://learn.microsoft.com/en-us/windows/apps/design/input/guidelines-for-targeting
[11] W3C, Understanding SC 2.5.1 Pointer Gestures — https://www.w3.org/WAI/WCAG22/Understanding/pointer-gestures.html
[12] W3C, Understanding SC 2.5.2 Pointer Cancellation — https://www.w3.org/WAI/WCAG22/Understanding/pointer-cancellation.html
[13] W3C, Understanding SC 2.5.4 Motion Actuation — https://www.w3.org/WAI/WCAG22/Understanding/motion-actuation.html
[14] W3C, Understanding SC 2.5.7 Dragging Movements — https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements.html
[15] Android Developers, Ensure compatibility with gesture navigation — https://developer.android.com/develop/ui/views/touch-and-input/gestures/gesturenav
[16] Nielsen Norman Group, Contextual Swipe — https://www.nngroup.com/articles/contextual-swipe/
[17] Nielsen Norman Group, Touch Targets on Touchscreens — https://www.nngroup.com/articles/touch-target-size/
[18] Steven Hoober, How Do Users Really Hold Mobile Devices? (UXmatters, 2013, with 2017 author correction; practitioner article reporting the author's own field observations) — https://www.uxmatters.com/mt/archives/2013/02/how-do-users-really-hold-mobile-devices.php
[19] Steven Hoober, Design for Fingers, Touch, and People, Part 1 (UXmatters, 2017; practitioner article reporting the author's own research) — https://www.uxmatters.com/mt/archives/2017/03/design-for-fingers-touch-and-people-part-1.php
[20] Nielsen Norman Group, Basic Patterns for Mobile Navigation — https://www.nngroup.com/articles/mobile-navigation-patterns/
[21] MDN, pointer media feature — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer
[22] MDN, hover media feature — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/hover
[23] MDN, touch-action — https://developer.mozilla.org/en-US/docs/Web/CSS/touch-action
[24] Chrome for Developers, 300ms tap delay, gone away — https://developer.chrome.com/blog/300ms-tap-delay-gone-away
[25] MDN, meta name="viewport" — https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/meta/name/viewport
[26] Android Developers, Haptics design principles — https://developer.android.com/develop/ui/views/haptics/haptics-principles
[27] Android Developers, Add haptic feedback to events — https://developer.android.com/develop/ui/views/haptics/haptic-feedback
[28] MDN, Vibration API, and MDN browser-compat-data api.Navigator.vibrate — https://developer.mozilla.org/en-US/docs/Web/API/Vibration_API ; https://github.com/mdn/browser-compat-data/blob/main/api/Navigator.json
[29] Android Developers, Advanced stylus features — https://developer.android.com/develop/ui/compose/touch-input/stylus-input/advanced-stylus-features
[30] Playwright, Emulation — https://playwright.dev/docs/emulation
[31] Playwright, Browser.newContext (hasTouch, isMobile) — https://playwright.dev/docs/api/class-browser#browser-new-context
[32] Playwright, Locator.tap — https://playwright.dev/docs/api/class-locator#locator-tap
[33] Flutter API, HapticFeedback class — https://api.flutter.dev/flutter/services/HapticFeedback-class.html
[34] Expo, Haptics — https://docs.expo.dev/versions/latest/sdk/haptics/
[35] Hapticlabs, Design principles for haptic UX (vendor guide, no research cited) — https://www.hapticlabs.io/principles
[36] Apple, Preparing your app to play haptics — https://developer.apple.com/documentation/corehaptics/preparing-your-app-to-play-haptics
