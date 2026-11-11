# Apple platforms (iOS, iPadOS, macOS-native)

Checkable rules for iPhone, iPad and Mac-only UI conventions, plus Apple's accessibility APIs, drawn from the HIG and developer docs. Read when: the product ships an iOS, iPadOS or native macOS (AppKit, SwiftUI, Mac Catalyst) app. Loading, progress, empty, error and offline states: web.md (WEB-1, WEB-2, WEB-38 to WEB-40, WEB-60 to WEB-66) holds on every platform.
Summarised in our own words from the sources at the end; numbers and names are cited as facts.

## Layout and adaptivity

- **IOS-1** Lay out content and controls within the safe area, so nothing important sits under the Dynamic Island, status bar, toolbar or tab bar.
  Check: screenshot a Dynamic Island device in portrait and landscape; grep `.ignoresSafeArea(` / `edgesIgnoringSafeArea` on views that contain controls; UIKit constraints pinned to the view edge rather than `safeAreaLayoutGuide`. [4][40]
- **IOS-2** Drive layout decisions from size classes; device model and orientation say nothing about the space actually available.
  Check: grep `userInterfaceIdiom == .pad`, `UIDevice.current.orientation`, `UIScreen.main.bounds` used for layout; the fix reads `horizontalSizeClass` / `UITraitCollection`. [4]
- **IOS-3** Every compact/regular combination must render well, and changing size class (rotation, resizing, iPad windows) must never remove a feature.
  Check: screenshots at compact and regular width, portrait and landscape, plus a narrow iPad window; a feature reachable in one and gone in another fails. [4]
- **IOS-4** An app that supports both orientations opens in whichever one the device is in; a landscape-only app works with the device turned either way.
  Check: launch while holding the device each way; inspect `supportedInterfaceOrientations` / `UISupportedInterfaceOrientations`. [21]
- **IOS-5** At big text sizes, rearrange rather than clip: stack items that sat side by side and let rows get taller.
  Check: set `accessibility-extra-extra-extra-large` (see Measure) and screenshot; overlapping or cut-off text fails. [4][3]

## iPadOS: multitasking, windows, pointer, keyboard, Pencil

- **IOS-6** Handle any window size gracefully: iPad apps may be windowed and freely resized as on a Mac, and the app is not told which arrangement the person picked.
  Check: drag the window to its smallest size and back to full screen; broken or letterboxed layout fails. [22][23]
- **IOS-7** When the person leaves a game or a video, stop it, and pick up at the same point when they return.
  Check: background the app mid-video or mid-level and come back; lost progress fails. [22]
- **IOS-8** Standard buttons and text areas get the system pointer effects; leave roughly 12 pt around bezeled elements and roughly 24 pt around unbezeled ones, and make the hit areas of adjacent custom bar buttons touch with no dead gaps.
  Check: hover with a trackpad on device or in Simulator; custom controls with no highlight or lift fail; grep custom controls missing `.hoverEffect(` / `UIPointerInteraction` / `isPointerInteractionEnabled`. [24][1]
- **IOS-9** Everything works from a hardware keyboard with Full Keyboard Access, and the familiar shortcuts (Cmd-C/V/Z/F/N/W, Esc to cancel) keep their usual meaning.
  Check: attach a keyboard, turn on Settings > Accessibility > Keyboards > Full Keyboard Access, and reach every control; grep `UIKeyCommand(` / `.keyboardShortcut(` binding a standard key to an unrelated action. [25][1]
- **IOS-10** Each custom key command carries a title, so iPad lists it in the shortcut overlay and the menu bar.
  Check: grep `UIKeyCommand(` lacking `title:`/`discoverabilityTitle`; hold Cmd on iPad and look for it. [39][28]
- **IOS-11** Menu bar commands on iPad also need an on-screen route: the menu bar is usually hidden in full screen, and dynamic items need a hardware keyboard.
  Check: list `CommandMenu`/`UIMenuBuilder` items; any command with no equivalent in the visible UI fails. [28]
- **IOS-12** A Pencil stroke draws the instant the tip lands, with no button or mode to enable first; Pencil hover and double tap never change content.
  Check: open a canvas and draw straight away; grep `UIPencilInteraction` handlers that delete or alter content. [26]
- **IOS-13** Scribble should work wherever writing text makes sense, and a field must hold still (no autoscroll) while someone writes in it.
  Check: handwrite into each text field and custom text view; grep `UIScribbleInteraction` that turns it off. [26]

## Navigation

- **IOS-14** Tabs switch between top-level areas only; commands belong in a toolbar. An iPad app with many areas can use a tab bar that turns into a sidebar, kept to two levels at most.
  Check: a tab that performs a command or opens a sheet fails; a sidebar three levels deep fails. [8][27]
- **IOS-15** The tab bar stays on screen in every section (a modal may cover it), and tabs are never hidden or greyed out; an empty section says why it is empty.
  Check: walk each tab and push detail views; a tab bar that vanishes on push, or a disabled tab, fails; grep `.toolbar(.hidden, for: .tabBar)`, `hidesBottomBarWhenPushed`. [8]
- **IOS-16** Each tab shows a brief text label, ideally a single word, alongside its icon.
  Check: screenshot the tab bar; grep `tabItem { Image(` with no `Text`/`Label`. [8]
- **IOS-17** Rely on the system Back and Close controls with their standard symbols rather than text buttons reading "Back" or "Close", and leave the edge swipe back intact.
  Check: grep `navigationBarBackButtonHidden(true)`, `hidesBackButton = true`, custom leading "Back" buttons; try the edge swipe in Simulator. [14][31]
- **IOS-18** Custom shortcut gestures add to the standard ones and never take their place; system gestures such as three-finger undo/redo and screen-edge swipes keep their meaning.
  Check: grep `DragGesture`/`UIScreenEdgePanGestureRecognizer` attached to screen edges; try a three-finger swipe while editing text. [31][32]
- **IOS-19** After a relaunch, bring people back to the screen, scroll offset and windows they had.
  Check: go several levels deep, kill the app (`simctl terminate`), relaunch; starting over at the root fails. [21]

## Modality and sheets

- **IOS-20** Every modal must be easy to leave: on iOS/iPadOS that means a button in its top toolbar plus swiping it down.
  Check: open each sheet and full-screen cover; no Cancel/Close and no swipe-down fails; grep `interactiveDismissDisabled()` / `isModalInPresentation = true` with no visible way out. [9][10]
- **IOS-21** If closing a modal would throw away what the person typed, stop and ask first (for example an action sheet with a save option), for both swipe and button.
  Check: type into a sheet and swipe it away; losing the input silently fails. [9][10]
- **IOS-22** Never stack sheets: dismiss the current one before another appears.
  Check: any flow where a sheet opens on top of a sheet fails. [10]
- **IOS-23** In a single-view sheet, Cancel sits at the leading edge and Done at the trailing edge; Done always has a Cancel or Back partner, and the three never appear together.
  Check: screenshot each sheet's toolbar. [10]

## Controls, alerts and destructive actions

- **IOS-24** Button hit regions follow TOUCH-1: Apple's default control size is 44×44 pt on iOS/iPadOS with a 28×28 pt minimum, and 28×28 pt on macOS with a 20×20 pt minimum. Spacing: TOUCH-4.
  Check: Accessibility Inspector "Hit region" audit; grep `.frame(width:` on buttons: under the minimum fails, between minimum and default is a weaker finding. [11][1]
- **IOS-25** Custom buttons visibly react when pressed, and a button that starts slow work shows a spinner until it finishes.
  Check: press and hold a custom button; on a slow network (SKILL.md: Slow network), tap an action that hits the network — a read (refresh, search, open), or (disposable only) one that writes — and watch for feedback. Loading and progress beyond the spinner: WEB-60 to WEB-66. [11]
- **IOS-26** The visually prominent (primary) role goes to a safe option, never to a destructive one, however likely people are to pick it.
  Check: grep `.buttonStyle(.borderedProminent)` / `.keyboardShortcut(.defaultAction)` on delete or erase buttons. [11]
- **IOS-27** Keep alerts for things that truly matter: not for routine deletions people can undo, and not on launch (report problems such as being offline with a quiet inline label).
  Check: launch with no network; an alert on startup fails; an alert in front of a routine, undoable delete fails ((disposable only) to delete for real; read-only: grep the delete path for `.alert(`). [12]
- **IOS-28** Name alert buttons after what they do ("Delete", "Erase"); "OK" only fits a purely informational alert. Any alert with a destructive choice also offers Cancel.
  Check: grep `Alert(`/`.alert(`/`UIAlertAction(title: "OK"` in confirmation dialogs; destructive alerts with no `.cancel` role. [12]
- **IOS-29** Mark a button destructive when it would destroy data the person did not set out to destroy; options that follow from an action they started go in an action sheet (`confirmationDialog`), not an alert or menu.
  Check: review `role: .destructive` / `.destructive` usage; follow-up choices presented with `.alert`. [12][13]

## Text input and keyboards

- **IOS-30** Match the keyboard to the field and tell the system what the field holds, so AutoFill and suggestions can help (email, phone, one-time code, new password, address).
  Check: grep `TextField(` / `UITextField` with no `.keyboardType(` and `.textContentType(` (e.g. `.emailAddress`, `.oneTimeCode`, `.newPassword`). [16][15]
- **IOS-31** Password entry uses a secure field and always starts empty.
  Check: grep password inputs that are not `SecureField` / `isSecureTextEntry = true`, or that get a default value. [15][17]
- **IOS-32** When the on-screen keyboard is up, the focused field and its submit control remain visible; position them with the keyboard layout guide.
  Check: focus the lowest field; if it or the submit button ends up under the keyboard, fail; grep `keyboardLayoutGuide`, `.ignoresSafeArea(.keyboard)`. [16]

## Dynamic Type and typography

- **IOS-33** Set text in system text styles, or scale custom fonts, so it follows Dynamic Type and can grow to at least 200 percent. Reference sizes on iOS/iPadOS: 17 pt default, 11 pt minimum; macOS: 13 pt and 10 pt.
  Check: grep `.font(.system(size:`, `Font.custom(` without `relativeTo:`, `UIFont.systemFont(ofSize:`, `UIFont(name:` not passed through `UIFontMetrics`; UIKit labels without `adjustsFontForContentSizeCategory = true`. [1][3][38]
- **IOS-34** Large text should not cost content: let labels wrap, and at the largest accessibility size show as much as at the largest standard size.
  Check: grep `.lineLimit(1)`, `numberOfLines = 1` on body text; Inspector "Clipped text" audit. [3]
- **IOS-35** Icons that carry meaning, and fixed dimensions next to text, grow along with the text size.
  Check: grep hard-coded `.frame(width:height:)` on icons beside text with no `@ScaledMetric`; SF Symbols already scale. [3][7]
- **IOS-36** Apple asks for more than VIS-10 (which bans thin weights at small sizes only): set all UI text in Regular weight or heavier, not Ultralight, Thin or Light, and make custom fonts honour Bold Text.
  Check: grep `.ultraLight`, `.thin`, `.light`; turn on Bold Text and look for custom-font text that stays thin (SwiftUI `legibilityWeight`, UIKit `isBoldTextEnabled`). [3][37]

## Color, Dark Mode and symbols

- **IOS-37** Follow the system light/dark setting; Apple advises against an in-app appearance switch, and a hard-locked mode makes the app look broken. This is Apple's line; Android and Windows expect a picker (VIS-36).
  Check: grep `.preferredColorScheme(`, `overrideUserInterfaceStyle`, `UIUserInterfaceStyle` in Info.plist; flip appearance (see Measure). A locked mode fails; a Light/Dark/System picker that defaults to System is a weaker, Apple-only finding. [5]
- **IOS-38** Paint with dynamic system and semantic colors (`label`, `secondaryLabel`, `systemBackground`, grouped backgrounds) rather than fixed values, so Dark Mode, elevated surfaces and Increase Contrast all adapt.
  Check: grep `Color(red:`, `UIColor(red:`, `Color.white`/`.black` on text, hex helpers; compare light and dark screenshots. [6][5]
- **IOS-39** Hit the contrast thresholds Accessibility Inspector applies, in light, dark and Increase Contrast: 4.5:1 for text up to 17 pt, 3:1 at 18 pt or in bold. Apple passes bold text of any size at 3:1; WCAG (A11Y-14) wants 4.5:1 for bold under 14 pt, so a finding against WCAG cites A11Y-14.
  Check: run the Inspector "Contrast" audit in both appearances; it passes small bold text at 3:1, so measure bold text under 14 pt against 4.5:1 yourself. [1]
- **IOS-40** If default colors fall short of contrast, switch to a stronger palette whenever Increase Contrast is on.
  Check: grep for `colorSchemeContrast` / `isDarkerSystemColorsEnabled` or high-contrast asset-catalog variants; `simctl ui <dev> increase_contrast enabled`, then screenshot. [1][36]
- **IOS-41** Colour is never the only cue (A11Y-12 owns the rule); on Apple platforms the second cue is a shape, a symbol or words.
  Check: view a screenshot in grayscale; states that become indistinguishable fail. [6][1]
- **IOS-42** Draw interface icons from SF Symbols where possible, and give any custom symbol an accessibility label.
  Check: grep `Image("` asset icons in toolbars and tabs; custom symbols with no `accessibilityLabel`. [7][5]

## VoiceOver and accessibility settings

- **IOS-43** Every icon-only control and informative image has a label naming its purpose, without the control type (label it "Play", not "Play button").
  Check: grep `Button` whose label is only an `Image(` and has no `.accessibilityLabel(`; `Image("` with no `Label`/`accessibilityLabel`; Inspector "Element description" audit. [2][33]
- **IOS-44** Images that are pure decoration are skipped by VoiceOver.
  Check: grep ornamental `Image(` lacking `.accessibilityHidden(true)` / `Image(decorative:)`; UIKit `isAccessibilityElement`. [2]
- **IOS-45** Give each screen its own distinct title, and flag section headings so the rotor can jump between them.
  Check: grep `.accessibilityAddTraits(.isHeader)` / `.header` trait; screens with no `navigationTitle`. [2]
- **IOS-46** Bundle elements that belong together (a picture and its caption, a cell's parts) so VoiceOver speaks them as one, in a sensible order.
  Check: grep `.accessibilityElement(children: .combine)` / `shouldGroupAccessibilityChildren` in list cells; swipe through a cell with VoiceOver on. [2]
- **IOS-47** When visible content or layout changes (an error appears, results load), announce it with an accessibility notification.
  Check: grep `AccessibilityNotification`, `UIAccessibility.post(notification:`; trigger an inline error with VoiceOver running. [2]
- **IOS-48** Custom controls expose correct traits (button, adjustable, selected) and actions, and every gesture has an on-screen equivalent (say, a delete button next to swipe-to-delete).
  Check: Inspector "Traits" audit; grep `onTapGesture` on views that are not `Button` and lack `.accessibilityAddTraits(.isButton)`. [1][2]
- **IOS-49** Apple's take on VIS-35: with Reduce Motion on, drop automatic and looping animation (zoom, scale, parallax, depth) and swap sliding transitions for fades; motion is never the sole carrier of information.
  Check: grep `withAnimation`, `.animation(`, `UIView.animate`, `matchedGeometryEffect` with no `accessibilityReduceMotion` / `isReduceMotionEnabled` check. [1][30][35]
- **IOS-50** Photos, video and other media opt out of Smart Invert.
  Check: grep media views lacking `.accessibilityIgnoresInvertColors()` / `accessibilityIgnoresInvertColors = true`; turn on Smart Invert and screenshot. [34]

## Permissions, notifications, onboarding, launch

- **IOS-51** Ask for a permission at the moment a feature needs it (general rule: WEB-42); asking on launch is only acceptable when the app is useless without it.
  Check: fresh install (`simctl privacy <dev> reset all`) and launch; a permission prompt before any related action fails; grep `requestAuthorization`, `requestWhenInUseAuthorization`, `requestAccess` in app init/`didFinishLaunching`. [19]
- **IOS-52** Each purpose string is one concrete, complete sentence explaining what the app does with the data.
  Check: read the `NS*UsageDescription` keys in Info.plist; a generic string like "We need this to work properly" fails. [19]
- **IOS-53** A screen shown before a permission prompt carries a single button, which leads to the system alert and is not labelled "Allow"; before the tracking prompt a custom screen may explain the benefit, but it offers no incentive, does not look like the request, shows no image of the alert and adds no marks pointing at the alert.
  Check: screenshot pre-prompt screens; an extra "Not now" button or an "Allow" label fails; before tracking, an incentive, a fake alert or arrows at "Allow" fail, a plain explainer with one button passes. [19]
- **IOS-54** Promotional notifications need explicit opt-in and must not use Time Sensitive; the app also offers its own screen for changing notification choices.
  Check: grep `interruptionLevel = .timeSensitive` on promotional payloads; look for an in-app notification settings screen. [18]
- **IOS-55** Onboarding is short and skippable, teaches inside the real UI, defers optional setup, and holds back rating requests and purchase offers until people have tried the app.
  Check: count screens before the first real content; a rating prompt or paywall on first run fails. [20]
- **IOS-56** Get to the first screen fast, behind a launch screen that looks almost exactly like it, with no text or advertising, in the current orientation and appearance.
  Check: record the launch (`simctl io booted recordVideo`); a visible jump between launch screen and first screen fails. [21]

## macOS-native specifics (general desktop: see desktop.md)

- **IOS-57** Provide the standard menus in their usual order (App, File, Edit, Format where the app edits formatted text, View, app menus, Window, Help), keep a Window menu with Minimize and Zoom even with one window, and wire up the standard shortcuts. Fixed item lists and ellipses: DESK-15.
  Check: screenshot the menu bar; open the Window menu; a missing or reordered standard menu fails. [28]
- **IOS-58** Settings open from App menu > Settings... (Cmd-Comma) in a window whose minimize and maximize buttons are dimmed, with a fixed toolbar, a title naming the current pane, and the last-viewed pane reopened.
  Check: press Cmd-Comma; a settings button in the main toolbar, or a resizable settings window, fails. [29][25]

## Measure

simctl (checked against `xcrun simctl help` and `help ui|io|launch|privacy|status_bar` from the local Xcode; listed from the help text, not run here, since no simulator was booted). If `xcrun` cannot locate simctl, export `DEVELOPER_DIR=/Applications/Xcode.app/Contents/Developer`. [45]
- Run: `xcrun simctl list devices` ; `xcrun simctl boot <udid>` ; `xcrun simctl install booted <App.app>` ; `xcrun simctl launch --terminate-running-process booted <bundle.id>` ; `xcrun simctl terminate booted <bundle.id>` (IOS-19).
- Capture: `xcrun simctl io booted screenshot shot.png` ; `xcrun simctl io booted recordVideo launch.mp4` (Ctrl-C ends it) ; `xcrun simctl status_bar booted override --time 9:41`.
- Settings: `xcrun simctl ui booted appearance dark|light` (IOS-37/38) ; `xcrun simctl ui booted content_size accessibility-extra-extra-extra-large` (also `extra-small`..`extra-extra-extra-large`, `accessibility-medium`.., `increment`, `decrement`) (IOS-5/33/34) ; `xcrun simctl ui booted increase_contrast enabled` (IOS-40) ; `xcrun simctl privacy booted reset all [<bundle.id>]` makes permission prompts appear again (IOS-51; per the help text, `grant` can hide a missing usage string). simctl cannot toggle Reduce Motion, Bold Text or Smart Invert; flip those in the simulator's Settings > Accessibility.

XCUITest: `try app.performAccessibilityAudit()` (iOS/iPadOS 17+, macOS 14+) runs the Accessibility Inspector checks on the current screen and fails the test if anything turns up; limit it with `for: [.dynamicType, .textClipped, .contrast, .hitRegion, .sufficientElementDescription, .trait, .elementDetection]` (macOS also has `.parentChild`, `.action`); the optional `(XCUIAccessibilityAuditIssue) throws -> Bool` closure returns true for issues to skip. Call it once per screen. [41][42]

Accessibility Inspector (`/Applications/Xcode.app/Contents/Applications/Accessibility Inspector.app`): select the simulator or app as target, then Audits > Run Audit (element description, hit region, contrast, element detection; on iOS also clipped text, traits, Dynamic Type); File > Save Audit Report As... writes an HTML report. Passing the audit proves little on its own; also try the app with VoiceOver. [43][44]

Static grep (`rg -n`, SwiftUI/UIKit):
- IOS-33 fixed fonts: `\.font\(\.system\(size:|UIFont\.systemFont\(ofSize:|UIFont\(name:|Font\.custom\(` (fine only with `relativeTo:` / `UIFontMetrics`). IOS-34 clipping: `lineLimit\(1\)|numberOfLines = 1`.
- IOS-43 icon-only buttons: `Button[^{]*\{[^}]*Image\(`, `setImage\(` with no `accessibilityLabel` close by. IOS-50 media and Smart Invert: `AVPlayer|VideoPlayer|AsyncImage` without `accessibilityIgnoresInvertColors`.
- IOS-37 forced appearance: `preferredColorScheme\(|overrideUserInterfaceStyle|UIUserInterfaceStyle`. IOS-38 fixed colors: `Color\(red:|UIColor\(red:|#colorLiteral|Color\(hex`.
- IOS-49 motion: files containing `withAnimation|\.animation\(|UIView\.animate` but no `accessibilityReduceMotion|isReduceMotionEnabled`. IOS-2 idiom-based layout: `userInterfaceIdiom|UIScreen\.main\.bounds|UIDevice\.current\.orientation`.
- IOS-30 input semantics: `TextField\(|UITextField\(` without `textContentType|keyboardType`. IOS-51 asks on launch: `requestAuthorization|requestWhenInUseAuthorization|requestAccess|requestTrackingAuthorization` in `App.init`, `didFinishLaunchingWithOptions` or root `onAppear`.
- IOS-20 blocked dismiss: `interactiveDismissDisabled|isModalInPresentation`. IOS-17 hidden back: `navigationBarBackButtonHidden\(true\)|hidesBackButton`.

## Sources

[1] Apple HIG — Accessibility — https://developer.apple.com/design/human-interface-guidelines/accessibility
[2] Apple HIG — VoiceOver — https://developer.apple.com/design/human-interface-guidelines/voiceover
[3] Apple HIG — Typography — https://developer.apple.com/design/human-interface-guidelines/typography
[4] Apple HIG — Layout — https://developer.apple.com/design/human-interface-guidelines/layout
[5] Apple HIG — Dark Mode — https://developer.apple.com/design/human-interface-guidelines/dark-mode
[6] Apple HIG — Color — https://developer.apple.com/design/human-interface-guidelines/color
[7] Apple HIG — SF Symbols — https://developer.apple.com/design/human-interface-guidelines/sf-symbols
[8] Apple HIG — Tab bars — https://developer.apple.com/design/human-interface-guidelines/tab-bars
[9] Apple HIG — Modality — https://developer.apple.com/design/human-interface-guidelines/modality
[10] Apple HIG — Sheets — https://developer.apple.com/design/human-interface-guidelines/sheets
[11] Apple HIG — Buttons — https://developer.apple.com/design/human-interface-guidelines/buttons
[12] Apple HIG — Alerts — https://developer.apple.com/design/human-interface-guidelines/alerts
[13] Apple HIG — Action sheets — https://developer.apple.com/design/human-interface-guidelines/action-sheets
[14] Apple HIG — Toolbars — https://developer.apple.com/design/human-interface-guidelines/toolbars
[15] Apple HIG — Text fields — https://developer.apple.com/design/human-interface-guidelines/text-fields
[16] Apple HIG — Virtual keyboards — https://developer.apple.com/design/human-interface-guidelines/virtual-keyboards
[17] Apple HIG — Entering data — https://developer.apple.com/design/human-interface-guidelines/entering-data
[18] Apple HIG — Managing notifications — https://developer.apple.com/design/human-interface-guidelines/managing-notifications
[19] Apple HIG — Privacy — https://developer.apple.com/design/human-interface-guidelines/privacy
[20] Apple HIG — Onboarding — https://developer.apple.com/design/human-interface-guidelines/onboarding
[21] Apple HIG — Launching — https://developer.apple.com/design/human-interface-guidelines/launching
[22] Apple HIG — Multitasking — https://developer.apple.com/design/human-interface-guidelines/multitasking
[23] Apple HIG — Windows — https://developer.apple.com/design/human-interface-guidelines/windows
[24] Apple HIG — Pointing devices — https://developer.apple.com/design/human-interface-guidelines/pointing-devices
[25] Apple HIG — Keyboards — https://developer.apple.com/design/human-interface-guidelines/keyboards
[26] Apple HIG — Apple Pencil and Scribble — https://developer.apple.com/design/human-interface-guidelines/apple-pencil-and-scribble
[27] Apple HIG — Sidebars — https://developer.apple.com/design/human-interface-guidelines/sidebars
[28] Apple HIG — The menu bar — https://developer.apple.com/design/human-interface-guidelines/the-menu-bar
[29] Apple HIG — Settings — https://developer.apple.com/design/human-interface-guidelines/settings
[30] Apple HIG — Motion — https://developer.apple.com/design/human-interface-guidelines/motion
[31] Apple HIG — Gestures — https://developer.apple.com/design/human-interface-guidelines/gestures
[32] Apple HIG — Undo and redo — https://developer.apple.com/design/human-interface-guidelines/undo-and-redo
[33] SwiftUI accessibilityLabel(_:) — https://developer.apple.com/documentation/swiftui/view/accessibilitylabel(_:)-1d7jv
[34] accessibilityIgnoresInvertColors (SwiftUI, UIKit) — https://developer.apple.com/documentation/swiftui/view/accessibilityignoresinvertcolors(_:) , https://developer.apple.com/documentation/uikit/uiview/accessibilityignoresinvertcolors
[35] accessibilityReduceMotion / isReduceMotionEnabled — https://developer.apple.com/documentation/swiftui/environmentvalues/accessibilityreducemotion , https://developer.apple.com/documentation/uikit/uiaccessibility/isreducemotionenabled
[36] colorSchemeContrast / isDarkerSystemColorsEnabled — https://developer.apple.com/documentation/swiftui/environmentvalues/colorschemecontrast , https://developer.apple.com/documentation/uikit/uiaccessibility/isdarkersystemcolorsenabled
[37] legibilityWeight / isBoldTextEnabled — https://developer.apple.com/documentation/swiftui/environmentvalues/legibilityweight , https://developer.apple.com/documentation/uikit/uiaccessibility/isboldtextenabled
[38] adjustsFontForContentSizeCategory — https://developer.apple.com/documentation/uikit/uicontentsizecategoryadjusting/adjustsfontforcontentsizecategory
[39] UIKeyCommand discoverabilityTitle — https://developer.apple.com/documentation/uikit/uikeycommand/discoverabilitytitle
[40] safeAreaLayoutGuide — https://developer.apple.com/documentation/uikit/uiview/safearealayoutguide
[41] performAccessibilityAudit(for:_:) — https://developer.apple.com/documentation/xcuiautomation/xcuiapplication/performaccessibilityaudit(for:_:)
[42] XCUIAccessibilityAuditType — https://developer.apple.com/documentation/xcuiautomation/xcuiaccessibilityaudittype
[43] Performing accessibility audits for your app — https://developer.apple.com/documentation/accessibility/performing-accessibility-audits-for-your-app
[44] Performing accessibility testing for your app — https://developer.apple.com/documentation/accessibility/performing-accessibility-testing-for-your-app
[45] `xcrun simctl help` output, Xcode at /Applications/Xcode.app (run locally, 2026-11-11)
