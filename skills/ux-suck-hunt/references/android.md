# Android and Material 3

Rules for Android apps (phone, tablet, foldable, ChromeOS/desktop windowing) built with Views, Compose, Flutter or React Native, from developer.android.com and Material Components. Read when: the product ships an Android app, or a cross-platform app that runs on Android. Loading, progress, empty, error and offline states: web.md (WEB-1, WEB-2, WEB-38 to WEB-40, WEB-60 to WEB-66) holds on every platform.
Summarised in our own words from the sources at the end; numbers and names are cited as facts.

## Window size classes and adaptive layout

- **AND-1** Pick the layout from the window size class, not from what kind of device it is. Width: compact < 600dp, medium 600-840dp, expanded 840-1200dp, large 1200-1600dp, extra-large ≥ 1600dp. Height: compact < 480dp, medium 480-900dp, expanded ≥ 900dp.
  Check: grep `isTablet|smallestScreenWidthDp|Build.MODEL|resources.getBoolean(R.bool.is_tablet` deciding layout; a device check standing in for a size class is the bug. [1]
- **AND-2** Recompute the layout every time the window size moves (rotation, fold/unfold, split-screen or desktop resize); the class can change while the app runs.
  Check: size class computed once in `onCreate` or cached; drag-resize in the resizable emulator and look for a layout that does not follow. [1]
- **AND-3** Look at height as well: phones turned to landscape tend to be medium wide yet compact tall (< 480dp), too short for two panes.
  Check: landscape phone screenshot; a two-pane or tall header layout that squeezes content out. [1]
- **AND-4** Occupy the full window, without letterboxing or compatibility mode, and keep every piece of content inside it.
  Check: manifest `android:resizeableActivity="false"`, fixed `android:screenOrientation`, `maxAspectRatio`; black bands on a tablet or open foldable. Large screens (sw ≥ 600dp) on Android 12+ allow every orientation whatever `screenOrientation` says, and multi-window even with `resizeableActivity="false"`, so test both. [3]
- **AND-5** Preserve what the user was doing across configuration changes: list scroll offset, typed text and keyboard state, playback position; this must hold for rotation, fold/unfold, window resize and any sequence of them.
  Check: fill fields, scroll, start media, then rotate, resize and fold in turn; anything that resets fails (T-Config_State, T-Config_Combinations). [3]
- **AND-6** Where content allows, use a canonical multi-pane layout: list-detail (messaging, contacts, media browsing), supporting pane (document beside comments, video beside related items), feed (a grid whose column count follows width).
  Check: at expanded width, one stretched column or a phone layout floating in empty space. Compose: `ListDetailPaneScaffold`, `SupportingPaneScaffold`, `LazyVerticalGrid(GridCells.Adaptive(...))`; Views: Activity embedding. [4][6]
- **AND-7** List-detail shows both panes at expanded width and one pane at medium/compact, with Back going from detail to list. Carry the selection through width changes: going narrow keeps the open detail, going wide highlights the item it belongs to.
  Check: open an item, resize compact to expanded and back; a lost selection or the wrong pane is a fail. [6]
- **AND-8** Place a supporting pane by width: under the main content or in a bottom sheet at compact, half and half at medium, 70% main / 30% supporting at expanded.
  Check: one screenshot per size class. [6]
- **AND-9** On big windows, constrain secondary UI: bottom sheets, buttons and text fields keep a sensible width, small menus and modals leave the screen visible, context menus appear beside the item tapped, images keep their proportions and are not cropped.
  Check: expanded-width screenshot; a button or text field spanning a whole tablet. MDC `BottomSheet` default `android:maxWidth` is 640dp. [4][15]

## Foldables, ChromeOS and external input

- **AND-10** Adapt to tabletop posture (calls, playback) and book posture (long-form reading); in tabletop, move controls like media transport onto the flat lower half.
  Check: Pixel Fold emulator half-open; controls sitting across the hinge. [5]
- **AND-11** Work completely in multi-window with multi-resume: an unfocused window keeps updating (playback, incoming messages, progress), and camera and mic are given up and taken back cleanly.
  Check: split-screen with the other app focused; stalled content or a camera that never recovers (T-Multi-Window_Focus, T-Multi-Window_Resources). [3]
- **AND-12** Take text from a hardware keyboard and move between hardware and on-screen keyboards with no activity restart.
  Check: plug and unplug a keyboard while typing; a relaunch or vanished text. [3]
- **AND-13** Handle a mouse or trackpad for the basics: clicking anything clickable, selecting text by dragging or double-clicking, scrolling lists and pickers vertically and horizontally.
  Check: operate each screen with a mouse on ChromeOS or the Desktop emulator. [3]
- **AND-14** Let users complete the main flows with Tab and arrow keys, and show a visible focus state on every interactive custom drawable outside touch mode.
  Check: Tab across a screen; focus that disappears, jumps over controls or cannot be seen (Keyboard_Navigation, Drawable_Focus). [4]
- **AND-15** Honour expected keys: Ctrl shortcuts for select, cut, copy, paste, undo, redo; Space toggles playback; Enter sends in messaging apps; Esc backs out (closes dialogs, menus and pop-ups, clears search, leaves full screen, abandons an edit).
  Check: try each key on a hardware keyboard; no `onKeyEvent`/`onKeyDown` handling for Esc and Enter. [4]
- **AND-16** Show hover feedback on actionable elements, open context menus from right-click or two-finger tap, and support zoom with Ctrl+scroll and pinch on a trackpad.
  Check: hover and right-click with a mouse; no response. [4]
- **AND-17** Let a stylus pick, scroll and handwrite into text fields (on Android 14+ `EditText` accepts handwriting out of the box, with no soft keyboard popping up).
  Check: a home-made text input drawn on a plain `View`/`Canvas` that ignores stylus writing. [3]

## Edge-to-edge and insets

- **AND-18** Lay out edge-to-edge and add padding for insets. Targeting SDK 35 makes edge-to-edge mandatory on Android 15+; older versions need `enableEdgeToEdge()`.
  Check: `targetSdk >= 35` but no `WindowInsets`/`setOnApplyWindowInsetsListener`/`safeDrawingPadding`; a FAB, bottom bar or final list row under the navigation bar. [8]
- **AND-19** Pad tappable views clear of `WindowInsetsCompat.Type.systemBars()`, pad lists clear of `displayCutout()`, and keep swipe surfaces out of `systemGestures()` zones.
  Check: screenshots in gesture and 3-button nav, portrait and landscape on a device with a cutout; a carousel or sheet that competes with the back swipe. [8][9]
- **AND-20** Let lists scroll behind the navigation bar but still reach their last row: add bottom padding and `clipToPadding="false"`.
  Check: scroll to the bottom; the last row stays hidden. [8]
- **AND-21** Leave the gesture nav bar see-through with no fill; a translucent scrim belongs only behind 3-button nav over scrolling content. Choose light or dark status bar icons to stand out from the content underneath.
  Check: solid colored bar behind the gesture handle; light icons over a light app bar (`isAppearanceLightStatusBars`). [9][8]
- **AND-22** Move the layout in step with the keyboard animation and keep the active field above the IME (`WindowInsetsAnimationCompat`).
  Check: tap the lowest field; it ends up under the keyboard or the layout snaps. [9]

## System back and predictive back

- **AND-23** Route Back through `OnBackPressedCallback`/`BackHandler`/`PredictiveBackHandler` (AndroidX Activity 1.6.0+) rather than an `onBackPressed` override or `KEYCODE_BACK` interception. Predictive back is enabled by default.
  Check: grep `override fun onBackPressed|onBackPressed()|KEYCODE_BACK`; `android:enableOnBackInvokedCallback="false"` in the manifest turns the system animations off. [10]
- **AND-24** Turn a back callback on only while there is UI to unwind (unsaved form, open sheet, detail pane), tied to observable state; logging or business logic belongs elsewhere, because a consuming callback kills the back-to-home preview.
  Check: a callback that is always enabled or fires analytics; a back swipe at the root with no home preview. [10]
- **AND-25** Back should first close a modal bottom sheet, dialog or search, then navigate. MDC modal sheets get predictive back for free; a standard sheet needs an `OnBackPressedCallback` that hands events to `BottomSheetBehavior`.
  Check: open a sheet and press Back; the screen underneath pops instead. [15]

## Navigation components by size

- **AND-26** Show a navigation bar when width or height is compact (or in tabletop posture) and a navigation rail otherwise; expanded widths may use an expanding rail or a permanent drawer. Drawers on large screens give way to expanded rails.
  Check: a bottom bar stretched across a landscape tablet; neither `NavigationSuiteScaffold` nor a manual switch. [7][4]
- **AND-27** A navigation bar carries three to five destinations and a collapsed rail three to seven; each item has an `android:title` for TalkBack.
  Check: count items; `BottomNavigationView` refuses more than 5; icon-only items without a title. [13][14]

## Components

- **AND-28** Reserve the FAB for the screen's main or most frequent action, and label an icon-only FAB with `contentDescription`.
  Check: several FABs on a screen; `FloatingActionButton` lacking `android:contentDescription` (Compose `Icon(..., contentDescription = null)` in a FAB). [16]
- **AND-29** Keep dialogs rare and for things that need an answer now; they halt the app until the user accepts, cancels or acts. A multi-step task gets a full-screen dialog.
  Check: dialogs for tips or success notices; a title icon with no content description. [17]
- **AND-30** Use a snackbar for short, non-blocking feedback (offer Undo after something destructive); never stack them; anchor them above the FAB or bottom navigation.
  Check: snackbar on top of the bottom nav or FAB (no `setAnchorView`/`Scaffold` `snackbarHost`); a critical error shown only as a snackbar. [11][12]
- **AND-31** Timed UI that holds controls (an action snackbar, self-hiding player controls) stays up for at least `AccessibilityManager.getRecommendedTimeoutMillis()`; an important snackbar action can use `SnackbarDuration.Indefinite` / `LENGTH_INDEFINITE` plus a dismiss action.
  Check: fixed `postDelayed`/`delay()` hide timers; `LENGTH_SHORT` on a snackbar with Undo. [31][11][12]

## Text fields, IME and autofill

- **AND-32** Set `android:inputType` on each `EditText` (`phone`, `textEmailAddress`, `textPassword`, `number`...) to get the matching keyboard and masked passwords.
  Check: lint `TextFields`; `EditText` with no `inputType`; an email field that opens the plain text keyboard. [18][40]
- **AND-33** Give each field the IME action that fits it (`imeOptions` `actionNext`, `actionDone`, `actionSend`, `actionSearch`) and act on it.
  Check: the final field offers Next and nothing happens; a search box with no `actionSearch`. [18]
- **AND-34** Tag autofillable fields with `android:autofillHints` / `HintConstants.AUTOFILL_HINT_*`, and keep `importantForAutofill="no"` off password and card fields.
  Check: lint `Autofill`; login fields lacking `password`/`username`; a sign-up form using `password` where `newPassword` belongs. [19][40]
- **AND-35** Tie a visible label to every field (Views `android:labelFor`; Compose `TextField(label = ...)`); placeholder text shows example input and does not count as the label.
  Check: lint `LabelFor`; TalkBack says "Edit box" with no name. [28][27]

## Permissions and notifications

- **AND-36** Ask for a runtime permission at the moment the user reaches for the feature that needs it (general rule: WEB-42); when `shouldShowRequestPermissionRationale()` is true, explain first in a screen the user can dismiss.
  Check: permission prompts in the launcher activity's `onCreate` or a splash; an explanation with no way out. [20]
- **AND-37** After a denial, keep going: leave the rest of the app working, explain in the spot where the missing result would show exactly which feature is off, no blocking full-screen warning, no repeated pleading. A second denial makes the system dialog stop appearing.
  Check: deny and carry on; a dead end, a loop back to the prompt, or recurring "please enable" dialogs. `adb shell dumpsys package <pkg>` shows `USER_FIXED`. [20]
- **AND-38** On Android 13+, request `POST_NOTIFICATIONS` in response to something the user did that implies wanting updates (subscribing, tracking an order), not on first launch, and test `areNotificationsEnabled()` before depending on notifications.
  Check: `POST_NOTIFICATIONS` requested at startup; reset with `adb shell pm revoke <pkg> android.permission.POST_NOTIFICATIONS` and relaunch clean. [21]
- **AND-39** Give every kind of notification its own channel, with a readable name and description and an importance matching how urgent it is; offer a shortcut to `ACTION_CHANNEL_NOTIFICATION_SETTINGS` in the app's settings.
  Check: a single channel for everything; promotions at `IMPORTANCE_HIGH`. [22]

## Dark theme and dynamic color

- **AND-40** Support dark theme (Android 10+): base the theme on `DayNight` and take colors from theme attributes or `-night` resources instead of literals; offer Light / Dark / System default, defaulting to System default (the platform split: VIS-36).
  Check: grep `#FFFFFF|Color.White|Color(0xFF` for backgrounds and text in layouts and composables; `adb shell cmd uimode night yes`, then screenshot. [23]
- **AND-41** Theme widgets, custom notification layouts and the launch screen too; prefer system notification templates such as `MessagingStyle`.
  Check: a white splash or widget in dark mode; drawables with baked-in colors. [23]
- **AND-42** With dynamic color (Android 12+, `DynamicColors.applyToActivitiesIfAvailable`, Compose `dynamicLightColorScheme`/`dynamicDarkColorScheme`), color by role tokens and pull brand colors into the palette with `HarmonizedColors` so contrast survives any wallpaper.
  Check: literal colors next to dynamic roles; text on `primary` that is not `onPrimary`. [24]

## Text scaling

- **AND-43** Express text size and `lineHeight` in `sp`, not `dp`/`px`, so the user's font setting takes effect; Android 14 scales fonts up to 200%, nonlinearly.
  Check: lint `SpUsage`; grep XML `textSize="[0-9.]+(dp|dip|px)"` and `lineHeight="[0-9.]+dp"`; `setTextSize(TypedValue.COMPLEX_UNIT_(DIP|PX)`. [25][40]
- **AND-44** Skip arithmetic on `fontScale` or `scaledDensity`, which nonlinear scaling made unreliable; convert with `TypedValue.applyDimension()`/`deriveDimension()`, and keep `sp` out of padding and fixed heights.
  Check: grep `scaledDensity|fontScale \*|\* fontScale`; hard `layout_height`/`Modifier.height(` on text containers. [25]
- **AND-45** Walk every screen at 200% font size: text must not truncate, clip or overlap and every control must stay reachable.
  Check: `adb shell settings put system font_scale 2.0`, screenshot each screen, set back to `1.0`. [25][38]

## Accessibility

- **AND-46** Make every interactive element at least 48dp × 48dp to touch (Material components already are; custom clickables need `sizeIn(minWidth = 48.dp, minHeight = 48.dp)` or `minimumInteractiveComponentSize()`). touch.md owns target sizing in depth.
  Check: grep `Modifier.*clickable` near `.size\((1?[0-9]|[2-3][0-9]|4[0-7])\.dp\)`; Accessibility Scanner "Touch target". [26][29]
- **AND-47** Every meaningful image and icon-only control gets a localized `contentDescription` naming what it does, not what it is ("Share", not "Share button"); only decorative images get `null` (Compose) or `importantForAccessibility="no"` (Views).
  Check: lint `ContentDescription`; grep `contentDescription = null` within `IconButton`/`clickable`/FAB; `contentDescription = ""`; descriptions that end in "button" or "icon". [26][28][40]
- **AND-48** Make each list item's description distinct by folding in its own data, so a row of "Delete" or "Play" buttons can be told apart.
  Check: TalkBack down a list; every row sounds the same. [26][27]
- **AND-49** Collapse related bits into a single focus stop (Compose `semantics(mergeDescendants = true)`; Views `screenReaderFocusable="true"` on the container), and make only the container clickable.
  Check: TalkBack lands separately on a card's avatar, name and time; clickables nested in a clickable row. [27][28]
- **AND-50** Flag headings (`semantics { heading() }` / `android:accessibilityHeading`) and name separate panes with distinct titles (`paneTitle` / `android:accessibilityPaneTitle`).
  Check: TalkBack jump-by-heading finds none; the same vague pane title reused across screens. [27][28]
- **AND-51** Offer each gesture-only action (swipe to dismiss, drag to reorder, long press) as a labelled accessibility action (`customActions`, `onClickLabel`/`onLongClickLabel`; `ViewCompat.addAccessibilityAction`/`replaceAccessibilityAction`).
  Check: TalkBack says "Double tap and hold to long press"; swipe-to-delete missing from the TalkBack actions menu. [27][28]
- **AND-52** Expose role and state on custom controls (`Role.Switch`, `stateDescription`, `toggleable`/`triStateToggleable`), or subclass the nearest framework widget.
  Check: a custom toggle read as plain text with no on/off; `Modifier.clickable` on something that looks like a checkbox, with no `role`. [27][29]
- **AND-53** Make TalkBack and keyboard order follow how the screen reads; repair column or circular layouts with `isTraversalGroup`/`traversalIndex` (Views `accessibilityTraversalBefore/After`).
  Check: TalkBack hops between columns; an Accessibility Test Framework result on traversal order. [30][32]
- **AND-54** Text contrast of 4.5:1 or more below 18sp (or bold below 14sp), 3:1 or more above, which matches WCAG (A11Y-14 owns contrast); state is never shown by color alone (A11Y-12).
  Check: Accessibility Scanner "Low contrast"; an error marked only in red. [26][27]
- **AND-55** Any view that overrides `onTouchEvent` or sets `setOnTouchListener` must also wire `performClick()`; custom widgets must be keyboard reachable.
  Check: lint `ClickableViewAccessibility`, `KeyboardInaccessibleWidget`. [40]

## Measure

Each checked against the cited page or source; documented, not run here (no adb device or Flutter SDK on this machine).

- Screenshot: `adb exec-out screencap -p > screen.png` (`exec-out` passes the PNG through unmodified). [35]
- UI tree with text, content-desc, bounds and clickable flags: `adb shell uiautomator dump [--compressed] [file]` (default `/sdcard/window_dump.xml`), then `adb pull`. Look for `clickable="true"` nodes whose `text` and `content-desc` are both empty, and for bounds under 48dp (px / density/160). [37]
- Font scale: `adb shell settings put system font_scale 2.0` (key `font_scale`, Settings.System.FONT_SCALE); `1.0` restores it. [38][39] Dark mode: `adb shell cmd uimode night yes` / `no` / `auto`. [36]
- Notification permission reset: `adb shell pm revoke <pkg> android.permission.POST_NOTIFICATIONS`, then `pm clear-permission-flags <pkg> android.permission.POST_NOTIFICATIONS user-set` and `user-fixed`; `adb shell dumpsys package <pkg>` lists every permission's state. [21][20]
- TalkBack from the shell: `adb shell settings put secure enabled_accessibility_services com.google.android.marvin.talkback/com.google.android.marvin.talkback.TalkBackService` (an emulator needs a Play image that has TalkBack). [42]
- Accessibility Scanner (Play Store) reports labels, touch target size, clickable items and contrast per screen; the Play Console pre-launch report uses the same framework. Android Studio's Compose Preview "UI Check" mode audits previews across sizes. [32]
- Espresso: `AccessibilityChecks.enable().setRunChecksFromRootView(true)` runs ATF on each `ViewActions` action; suppress only tightly scoped results with `setSuppressingResultMatcher`. [34]
- Compose (1.8.0+): add `ui-test-junit4-accessibility`, call `composeTestRule.enableAccessibilityChecks()`, then any action or `onRoot().tryPerformAccessibilityChecks()`; it covers labels, contrast, touch target size and traversal order. [33]
- Android lint (`./gradlew lint`) IDs: `ContentDescription`, `ClickableViewAccessibility`, `KeyboardInaccessibleWidget`, `LabelFor`, `SpUsage`, `SmallSp`, `TextFields`, `Autofill`, `LockedOrientationActivity`, `SourceLockedOrientationActivity`, `NonResizeableActivity`. Grep `lint.xml`/`tools:ignore=` for any of them being silenced. [40]
- Flutter widget tests: `expectLater(tester, meetsGuideline(androidTapTargetGuideline))` (48×48), `labeledTapTargetGuideline`, `textContrastGuideline`, after `tester.ensureSemantics()`. [41]
- React Native: look at `accessibilityLabel`/`aria-label`, `accessibilityRole`/`role`, `accessibilityState`, `accessibilityActions` on custom touchables, `importantForAccessibility`, `accessibilityLiveRegion` (Android). [42]
- Adaptive: run on the Pixel Fold, Medium Tablet and Desktop emulators and the resizable emulator; reference sizes foldable 841×701dp, 8-inch tablet 1024×640dp, 13-inch Chromebook 1600×900dp. [2]

Static grep starters (Kotlin/XML):
- `grep -rnE 'contentDescription\s*=\s*(null|"")' --include=*.kt`, keeping hits inside `IconButton|FloatingActionButton|clickable`.
- `grep -rnE 'android:textSize="[0-9.]+(dp|dip|px)"' --include=*.xml`
- `grep -rnE '\.size\(([0-9]|[1-3][0-9]|4[0-7])\.dp\)' --include=*.kt` near `clickable|IconButton|onClick`.
- `grep -rnE 'override fun onBackPressed|KEYCODE_BACK|enableOnBackInvokedCallback="false"'`
- `grep -rnE 'screenOrientation="(portrait|landscape|sensorPortrait)"|resizeableActivity="false"' --include=AndroidManifest.xml`
- `grep -rnE '<EditText' -A8 --include=*.xml | grep -L inputType` (fields with no `inputType`).

## Sources

Credit: Android Developers documentation (developer.android.com), the Android Open Source Project source (android.googlesource.com), Material Components for Android docs and the Android Lint checks index, the Apache License 2.0 (https://www.apache.org/licenses/LICENSE-2.0); non-documentation content on developer.android.com is licensed under Creative Commons Attribution 2.5 (https://creativecommons.org/licenses/by/2.5/), portions are modifications based on work shared by the Android Open Source Project.
Credit: the Flutter documentation (docs.flutter.dev) and the React Native documentation (reactnative.dev), Creative Commons Attribution 4.0 International (https://creativecommons.org/licenses/by/4.0/).

[1] Use window size classes — https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes
[2] Adaptive app quality guidelines — https://developer.android.com/docs/quality-guidelines/large-screen-app-quality
[3] Adaptive ready (Tier 3) — https://developer.android.com/docs/quality-guidelines/adaptive-app-quality/tier-3
[4] Adaptive optimized (Tier 2) — https://developer.android.com/docs/quality-guidelines/adaptive-app-quality/tier-2
[5] Foldables experience (Tier 1) — https://developer.android.com/docs/quality-guidelines/adaptive-app-quality/experiences/foldables
[6] Canonical layouts — https://developer.android.com/develop/ui/compose/layouts/adaptive/canonical-layouts
[7] Build adaptive navigation — https://developer.android.com/develop/ui/compose/layouts/adaptive/build-adaptive-navigation
[8] Display content edge-to-edge in views — https://developer.android.com/develop/ui/views/layout/edge-to-edge
[9] Android system bars (design) — https://developer.android.com/design/ui/mobile/guides/foundations/system-bars
[10] Add support for the predictive back gesture — https://developer.android.com/guide/navigation/custom-back/predictive-back-gesture
[11] Snackbar (Compose) — https://developer.android.com/develop/ui/compose/components/snackbar
[12] Material Components Android: Snackbar — https://github.com/material-components/material-components-android/blob/master/docs/components/Snackbar.md
[13] Material Components Android: Navigation bar — https://github.com/material-components/material-components-android/blob/master/docs/components/BottomNavigation.md
[14] Material Components Android: Navigation rail — https://github.com/material-components/material-components-android/blob/master/docs/components/NavigationRail.md
[15] Material Components Android: Bottom sheets — https://github.com/material-components/material-components-android/blob/master/docs/components/BottomSheet.md
[16] Material Components Android: FAB — https://github.com/material-components/material-components-android/blob/master/docs/components/FloatingActionButton.md
[17] Material Components Android: Dialogs — https://github.com/material-components/material-components-android/blob/master/docs/components/Dialog.md
[18] Specify the input method type — https://developer.android.com/develop/ui/views/touch-and-input/keyboard-input/style
[19] Optimize your app for autofill — https://developer.android.com/guide/topics/text/autofill-optimize
[20] Request runtime permissions — https://developer.android.com/training/permissions/requesting
[21] Notification runtime permission — https://developer.android.com/develop/ui/views/notifications/notification-permission
[22] Create and manage notification channels — https://developer.android.com/develop/ui/views/notifications/channels
[23] Implement dark theme — https://developer.android.com/develop/ui/views/theming/darktheme
[24] Dynamic color — https://developer.android.com/develop/ui/views/theming/dynamic-colors
[25] Android 14 features: non-linear font scaling — https://developer.android.com/about/versions/14/features#non-linear-font-scaling
[26] Make apps more accessible — https://developer.android.com/guide/topics/ui/accessibility/apps
[27] Principles for improving app accessibility (Compose) — https://developer.android.com/guide/topics/ui/accessibility/principles
[28] Principles for improving app accessibility (Views) — https://developer.android.com/guide/topics/ui/accessibility/views/principles-views
[29] Compose accessibility API defaults — https://developer.android.com/develop/ui/compose/accessibility/api-defaults
[30] Compose traversal order — https://developer.android.com/develop/ui/compose/accessibility/traversal
[31] AccessibilityManager.getRecommendedTimeoutMillis — https://developer.android.com/reference/android/view/accessibility/AccessibilityManager#getRecommendedTimeoutMillis(int,%20int)
[32] Test your app's accessibility — https://developer.android.com/guide/topics/ui/accessibility/testing
[33] Compose accessibility testing — https://developer.android.com/develop/ui/compose/accessibility/testing
[34] Espresso accessibility checking — https://developer.android.com/training/testing/espresso/accessibility-checking
[35] Android Debug Bridge (screencap) — https://developer.android.com/tools/adb
[36] AOSP UiModeManagerService shell (`cmd uimode night`) — https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/services/core/java/com/android/server/UiModeManagerService.java
[37] AOSP uiautomator DumpCommand — https://android.googlesource.com/platform/frameworks/testing/+/refs/heads/main/uiautomator/cmds/uiautomator/src/com/android/commands/uiautomator/DumpCommand.java
[38] AOSP SettingsService (`settings put`) — https://android.googlesource.com/platform/frameworks/base/+/refs/heads/main/packages/SettingsProvider/src/com/android/providers/settings/SettingsService.java
[39] Settings.System.FONT_SCALE — https://developer.android.com/reference/android/provider/Settings.System#FONT_SCALE
[40] Android Lint checks index — https://googlesamples.github.io/android-custom-lint-rules/checks/index.md.html
[41] Flutter accessibility testing — https://docs.flutter.dev/ui/accessibility/accessibility-testing
[42] React Native accessibility — https://reactnative.dev/docs/accessibility
