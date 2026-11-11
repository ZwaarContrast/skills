# Desktop apps and desktop-sized web apps

Keyboard, menus, windows, pointer, dense data, undo/save, settings, notifications and native feel for Windows, macOS (general desktop rules only), GNOME, Electron and Tauri. Read when: the product ships a desktop app (native, Electron, Tauri) or a web app used mainly on desktop/laptop screens. Loading, progress, empty, error and offline states: web.md (WEB-1, WEB-2, WEB-38 to WEB-40, WEB-60 to WEB-66) holds on every platform.
Summarised in our own words from the sources at the end; numbers and names are cited as facts.

## Keyboard

- **DESK-1** Everything a mouse can do, the keyboard can do too, right-click menus included; build clickable pictures and boxes from real button controls.
  Check: run each core task with no mouse; grep for click handlers on elements that cannot take focus (`PointerPressed` on `Image`, `onClick` on `div`). [4][16][17]
- **DESK-2** Leave the well-known shortcuts meaning what users expect: Ctrl+Z undo, Ctrl+Y redo, Ctrl+X/C/V, Ctrl+A, Ctrl+F, F3 next result, F2 rename, F5 refresh, Ctrl+S, Ctrl+W close, Ctrl+P, Ctrl+N, Ctrl++/Ctrl+-/Ctrl+0 zoom; macOS uses the Command versions plus Shift-Command-Z redo and Command-Comma settings.
  Check: try each key in the app; grep keydown handlers that call `preventDefault` on one of these and do something else. [1][23][27]
- **DESK-3** Stay off the modifiers the OS owns: Super in GNOME apps, Alt+letter on Windows/GNOME (access keys live there), and Control on macOS.
  Check: grep accelerator strings for `Super`, `Meta`, `Alt+<letter>`, and mac-only `Ctrl+`. [16][23]
- **DESK-4** Spend custom shortcuts only on the commands people repeat most; build them from Ctrl/Command plus a letter, use an added Shift for the inverse or extended form of a related shortcut, and never reuse an existing combo plus a modifier for something unrelated.
  Check: compare the custom shortcut list; flag Shift+Ctrl+Z (or Shift-Cmd-Z) mapped to anything other than redo. [16][23]
- **DESK-5** Electron accelerators use `CommandOrControl`, so a single binding becomes Cmd on macOS and Ctrl on Windows and Linux.
  Check: grep `accelerator:` for a bare `Ctrl+`/`Command+` with no platform branch. [46]
- **DESK-6** Teach shortcuts in the places people look: next to the item in main menus and inside the button tooltip (custom tooltip text must still carry it), but leave them off context menus.
  Check: hover or focus toolbar buttons that have shortcuts; open the menus; grep `ToolTipService.ToolTip` on controls with `KeyboardAccelerators`. [1][6][25]
- **DESK-7** F6 moves focus to the next major pane (sidebar, toolbar, content) and Shift+F6 to the previous one; in WinUI the app has to build this itself.
  Check: from launch, press F6 again and again; focus should land in every major region and come back round. [3][4]
- **DESK-8** Esc backs out of anything temporary (menu, popover, dialog, an open combo box, which reverts to its earlier value) and out of a pointer action under way such as a drag; it never closes or navigates back in the main window.
  Check: open each temporary surface, start a drag, then press Esc. [3][16][17]
- **DESK-9** Tab order runs top to bottom and left to right (mirrored per locale), each label comes just before its control, and only things you can operate get a stop.
  Check: the Tab stops step of Accessibility Insights FastPass; grep for positive `TabIndex`/`tabindex`. [3][16]
- **DESK-10** A cluster of related controls (list, grid, radio group, toolbar) takes one Tab stop; arrows move inside it and Home/End jump to its ends; in native Windows controls, wrapping from last to first is for popup menus only. Web ARIA widgets follow their APG pattern instead, where tabs do wrap (A11Y-63).
  Check: Tab into a list — one stop, arrows move within, the next Tab leaves; judge wrapping by the native-or-web split above. [3]
- **DESK-11** When a window or page opens, focus sits on the action people most likely want first and never on something destructive (such as Delete while reading mail).
  Check: open each window and page and record the focused element before typing anything. [3]
- **DESK-12** Each labelled control and menu item gets an Alt access key that no sibling in the same scope shares: prefer the first letter, then a strong consonant, vowels last; skip look-alikes such as I/l/1 and O/0; no more than two characters; translated with the label.
  Check: tap Alt (Windows/GNOME) and read the keytips or underlines; look for repeats within one scope. [2][16][20]
- **DESK-13** Keep the platform focus indicator, including on restyled controls (WinUI default: 2px primary outer border plus 1px secondary inner border); WCAG focus rules are in a11y.md.
  Check: grep `UseSystemFocusVisuals="False"` and `outline: none`/`outline: 0` with nothing put in their place; Tab through and screenshot. [4][5]

## Menus and command surfaces

- **DESK-14** macOS menu-bar order and the Window menu: IOS-57 owns the rule, for Electron and Tauri apps on macOS too.
  Check: IOS-57's Check. [24]
- **DESK-15** Menu-bar menus list the same items every time, greying out what cannot run now rather than removing it; an item that asks for more input before it acts ends in an ellipsis.
  Check: open each menu with and without a selection and diff the items; look for "Save As" or "Export" lacking "...". [24]
- **DESK-16** In Electron, standard items are declared with their `role` (`undo`, `redo`, `cut`, `copy`, `paste`, `selectAll`, `editMenu`, `windowMenu`, `appMenu`...) rather than hand-written click handlers, because roles give native behavior. Calling `Menu.setApplicationMenu(null)` removes the default menu, and on Windows/Linux the menu bar with it.
  Check: grep `label: 'Copy'` and similar without `role`; after `setApplicationMenu(null)`, confirm Cmd/Ctrl+C/V/Z/A still work in text fields. [40][41]
- **DESK-17** A context menu holds only what applies to the thing clicked, in roughly three groups or fewer, with no submenu inside a submenu; items that cannot run are left out (Cut/Copy/Paste may stay, greyed). GNOME sizes: 3-12 items per menu, 3-6 per submenu.
  Check: right-click every object type; count items, groups and nesting depth. [20][25]
- **DESK-18** Nothing lives only in a context menu: each of its commands can also be reached from the menu bar, a toolbar or a command bar.
  Check: for every context-menu entry, locate the same command somewhere else. [25]
- **DESK-19** Every kind of object answers right-click and the Menu key / Shift+F10 on the focused item with a context menu; a right-click lists options and does not itself carry out an action such as deleting.
  Check: right-click and Shift+F10 on each list, row, canvas object and text field. [16][17][25]

## Windows and display scaling

- **DESK-20** Primary windows can be resized; their first-launch size fits the content without being maximized or close to it, and growing the window reveals more content rather than more empty space.
  Check: launch with a clean profile and screenshot the default size; enlarge to full screen and compare. [8][19]
- **DESK-21** Below the size where content stops working, the window refuses to shrink, and before that point the layout adapts instead of cutting things off; the Windows guide aims for an 800×600 effective minimum (a Windows 7-era guide).
  Check: Electron `win.setMinimumSize()`, WinUI/Win32 minimum size; drag the window as small as it goes and screenshot clipped controls. [8][42]
- **DESK-22** On relaunch, each window comes back on the same monitor with the same size, position and maximized state; if that monitor is missing, the window is moved fully onto one that exists.
  Check: move and resize, quit, relaunch; repeat with the second display disconnected. [8][19]
- **DESK-23** Closing one primary window leaves the others alone; a secondary window has a parent, is modal to it, does not open further secondary windows on top of itself and is not bigger than its parent; Ctrl+W shuts a window and Esc shuts a modal one.
  Check: open two documents and close one; open a dialog from inside a dialog. [19]
- **DESK-24** A window the user asked for may grab input focus only if it appears within 5 seconds; a window the program opened on its own flashes the taskbar button rather than jumping to the front.
  Check: type in another app while a slow window opens and while a background event fires; note any focus theft. [8]
- **DESK-25** On Windows, the app declares Per-Monitor V2 DPI awareness and redoes its layout when the DPI changes, sizing itself to the rectangle that `WM_DPICHANGED` proposes; apps that are unaware or only system-aware get bitmap-stretched and look blurry.
  Check: manifest `dpiAwareness` set to `PerMonitorV2`; grep `GetSystemMetrics(` (the per-DPI form is `GetSystemMetricsForDpi`) and fixed pixel sizes. [7]
- **DESK-26** Try the app at 100%, 125% and 150% scaling, while dragging it across displays with different DPI, and while the scale is changed under a running app.
  Check: screenshot at every scale; look for clipped text and blurry or stretched icons. [7][8]
- **DESK-27** Use the platform's own title bar and window buttons where possible; a home-made one that misses any of the system's look or behavior makes the whole app seem broken.
  Check: Electron `titleBarStyle`/`frame: false`, Tauri `decorations: false`; hold it against the next two rules. [26]
- **DESK-28** A custom Windows title bar is 32px high (48px when it holds a search box or person picture); its empty areas move the window, right-click there opens the system window menu, double-click maximizes or restores, the caption buttons never get squeezed out, its elements turn semi-transparent while the window is inactive, and it recolors for light/dark and contrast themes.
  Check: drag, right-click and double-click empty title-bar space; make the window narrow; click into another app. [9]
- **DESK-29** Inside an Electron drag region, every button and input carries `app-region: no-drag` (the region otherwise eats their clicks), text cannot be selected, no custom context menu is attached, and on Windows/Linux the window buttons are brought back (`titleBarOverlay`).
  Check: grep `app-region: drag`, then click each control inside it. [43][44]

## Pointer and hover

- **DESK-30** Hover is never the only way to find an action or an important piece of information (WEB-57 owns the rule); on desktop the miss is mouse users who never park the pointer there.
  Check: screenshot with the pointer parked away; list what appears only on hover and find another route to each. [17][32][33]
- **DESK-31** Icon-only buttons in toolbars and header bars all carry a tooltip; once one control in a group has one, its neighbours do too. Tooltips on keyboard focus: WEB-12.
  Check: hover and then Tab along the toolbar. [6][18][32]
- **DESK-32** Tooltip content follows WEB-11; desktop sources add that a tooltip never holds errors, status or anything to click, and on a disabled control it says what would enable it.
  Check: read every tooltip; grep tooltips that contain links or buttons or repeat their button's text. [6][18][32][52]
- **DESK-33** Whatever can be done by dragging can also be done another way (Cut/Paste, a "Move to..." command); WCAG 2.5.7 is covered in a11y.md.
  Check: for each draggable item, perform the same move using only keyboard and menus. [17][30]
- **DESK-34** Draggable things look draggable and the drop says what it will do (copy, move or link); inside one container the default is move, between containers or apps it is copy, and a drop can be undone.
  Check: drag between panes and into another app; press Ctrl/Cmd+Z right after dropping. [10][30]
- **DESK-35** Modifier keys behave as on the platform: Ctrl/Cmd+click adds or removes one item, Shift+click selects a range, Shift during a resize locks the aspect ratio, arrow keys nudge what is selected, Ctrl+scroll wheel zooms.
  Check: try each on lists and on canvases. [11][17][23]

## Selection and bulk actions

- **DESK-36** Lists and tables allow extended selection with Ctrl+click, Shift+click, Shift+Arrow and Ctrl+A.
  Check: pick rows 1 and 3, then 5-9, using modifiers; then Ctrl+A. [1][3][11]
- **DESK-37** With nothing selected, bulk commands are unavailable apart from Select All; clicking outside does not end selection mode; destructive bulk commands ask first.
  Check: open the bulk toolbar with none, one and several selected; click empty space. [11]

## Data tables

- **DESK-38** Numbers right-aligned: VIS-43 owns that; dense tables also line up decimal points, left-align text columns, align each header with its column, and centre no column.
  Check: screenshot the table; inspect `text-align` on numeric `td`/`th`. [36]
- **DESK-39** Users can choose row density, and the header row matches the body row size. Pencil & Paper: condensed 40px, regular 48px, relaxed 56px; Carbon: 24/32/40 (default)/48/64px. The choice survives a reload and can be reset to default.
  Check: measure a row; switch density, reload, confirm it stayed. [36][37]
- **DESK-40** Pinned headers: VIS-44 owns the rule; in a wide desktop table that means the first, identifying column during horizontal scrolling too, and a totals footer may stay in view as well.
  Check: scroll a long, wide table in both directions; screenshot. [33][36]
- **DESK-41** Columns can be sorted and show which state they are in (unsorted, ascending, descending) without knocking the header out of alignment; the starting sort fits the data, such as newest first or most urgent first.
  Check: click the headers; check `aria-sort` and the icon. [36][37]
- **DESK-42** Every row has a checkbox and the header has a select-all checkbox that can be checked, unchecked or indeterminate; bulk actions appear only after at least one row is selected.
  Check: tick one row; the header checkbox should turn indeterminate and the action bar should show. [33][36][37]
- **DESK-43** Row actions are visible or one evident click away (a "View more" link or a "..." menu on the row); NN/g reports that actions tucked behind hover or a generic Actions menu are hard to find.
  Check: screenshot with no hover; can a row action be located? [33][36]
- **DESK-44** Editable cells show it (a text cursor on hover), a row in edit mode looks different from the rest, an edit is committed by Enter, clicking away, a checkmark or Save, and data with high stakes is edited in a modal or side panel instead of in the cell.
  Check: put a cell in edit mode and press Esc; (disposable only, or local scratch data) commit edits with Enter and by clicking elsewhere. [33][36]
- **DESK-45** A long column title wraps onto two lines and is then cut off, with the whole title in a tooltip; when row heights differ by more than 3 lines, cell content sits at the top.
  Check: narrow the columns; hover a cut-off header. [36][37]
- **DESK-46** Tables people use to look up or compare records are paged, with the page controls under the table; endless scrolling fits only a constant stream of flat content.
  Check: scroll to the end of a large table; is there a page number to come back to? [34][37]
- **DESK-47** Columns can be hidden and reordered easily without needing drag-and-drop, the table shows that some are hidden, and an obvious reset restores the default set.
  Check: hide a column, reload, look for the hidden-column indicator and the reset. [33][36]

## Undo, saving and confirmations

- **DESK-48** Undo and redo go back through every action since the document was opened or saved, sit first in the Edit menu (Ctrl+Z / Ctrl+Y; Command-Z / Shift-Command-Z), name the action they will reverse ("Undo Typing"), and scroll the affected change into view.
  Check: (disposable only, or a local scratch document) make 20 assorted edits, scroll away, undo all of them; read the Edit menu labels. [1][27]
- **DESK-49** Undo before confirmation: WEB-7 owns the rule and WEB-68 the safeguard for each size of loss, on desktop as on the web.
  Check: (disposable only, or a local scratch document) delete something; note whether there is undo, a prompt, or neither. Read-only: read the delete handler. [14][22]
- **DESK-50** Work is saved without being asked: at intervals during editing, on closing the file and on switching to another app.
  Check: (disposable only, or a local scratch document) edit, kill the process, relaunch; see what is missing. [29]
- **DESK-51** A "Save changes?" prompt appears only when the user really changed something, and its buttons name the outcome (Save / Don't save) instead of OK/Cancel.
  Check: open and close an unedited document (expect no prompt); (disposable only, or a local scratch document) edit and close (expect one); read the buttons. [14]
- **DESK-52** A dialog's confirming button says exactly what it does, Esc cancels, Return never defaults to a destructive button, and dialogs open only because the user did something and are modal to a parent window.
  Check: open each dialog; press Return and Esc; watch for dialogs that pop up on their own. [22]

## Settings

- **DESK-53** Changing a setting takes effect at once, with no OK/Save step; settings open as IOS-58 describes on macOS, and from the foot of the navigation pane (or the overflow menu) on Windows.
  Check: change a setting, look for an immediate effect and change it back ((disposable only) for settings stored in the user's account); press Cmd+, on macOS. [12][24][28]
- **DESK-54** The settings list is short with defaults that work for most people, holds no everyday workflow commands, and shows a setting that does not apply as disabled with a reason rather than removing it.
  Check: count the settings; look for routine commands reachable only from settings. [12][28]
- **DESK-55** The app follows OS-wide preferences rather than offering its own copy of them; on Windows a theme picker offers Light, Dark and "Use system setting" (the platform split: VIS-36).
  Check: change the OS appearance while the app runs; inspect the theme picker's options and default. [12][28]

## Notifications

- **DESK-56** OS notifications are for events worth knowing about while the user is in another app; while the app is in front, new information shows up inside it (toast, badge, new row). One event gives one notification, outdated ones (already read elsewhere) are withdrawn, and users can turn the volume down or off.
  Check: (disposable only) fire events with the app in front and behind, twice each; read the item in the app, then look in Notification Center. Read-only: read the notification code for one-per-event, withdrawal and in-app display. [13][21][31]
- **DESK-57** Clicking a notification opens the app on that item; a background action such as quick reply does its work without opening the app; a notification has three buttons at most; the app window carries everything the notification said.
  Check: click a notification; (disposable only) then each of its buttons that acts (reply, delete, mark done). [13][21]

## Updates, first run and native feel

- **DESK-58** Updates download quietly, the user is told when one is ready and offered Restart / Later, and a failed update is reported rather than swallowed.
  Check: Electron `autoUpdater` / `update-electron-app` setup; grep for an `error` handler. [45]
- **DESK-59** The app tracks the OS light/dark choice: Electron `nativeTheme.themeSource` stays `'system'`, CSS uses `prefers-color-scheme`, and a change arriving through `nativeTheme`'s `updated` event applies without a restart.
  Check: grep for `themeSource = 'light'`/`'dark'` set at startup; switch the OS theme while the app runs. [38][39]
- **DESK-60** Contrast themes are respected: read `nativeTheme.shouldUseHighContrastColors` / `inForcedColorsMode`, draw with system colors, fix no colors under HighContrast, and try all four Windows contrast themes (Aquatic, Desert, Dusk, Night sky). Reduced motion: VIS-35.
  Check: toggle with Left Alt + Left Shift + Print Screen and screenshot each screen. [15][39]

## Measure

- **Electron, Playwright** (documented, not run here): `const { _electron: electron } = require('playwright'); const app = await electron.launch({ args: ['main.js'] }); const win = await app.firstWindow();` and then script `win` as a normal page; `app.evaluate(({ app }) => ...)` executes in the main process. Marked experimental; needs Electron v21+; supports `recordVideo` and `executablePath`. [47]
- **Tauri, WebDriver** (documented, not run here): `cargo install tauri-driver --locked`; Linux needs `WebKitWebDriver` (package `webkit2gtk-driver` on Debian), Windows needs a Microsoft Edge Driver of the same version as the installed Edge; tauri-driver does not run on macOS, where the WebdriverIO service is the route. [48][49]
- **Accessibility Insights for Windows** (documented, not run here): Live Inspect lists the UI Automation properties of whatever is hovered or focused; FastPass combines automated checks (more than 60 requirements) with a guided Tab stops pass that finds missing stops, keyboard traps and wrong order; a contrast checker sits under Troubleshooting. [50]
- **macOS Accessibility Inspector** (documented, not run here): Xcode > Open Developer Tool > Accessibility Inspector; read element attributes and run Audit to catch clipped text, unlabeled elements, text size and contrast. [51]
- **Keyboard-only walk-through**: leave the mouse alone and complete each core task: Tab/Shift+Tab, arrows within groups, F6, Esc on each temporary surface, Alt for access keys, Shift+F10 for context menus, every shortcut in DESK-2; log each step that forced a pointer. [3][35]
- **Display scaling**: Windows Settings > Display scale at 100/125/150%; drag across monitors with different DPI; contrast themes via Left Alt + Left Shift + Print Screen. [7][8][15]

## Sources

Credit: Microsoft Learn, the Creative Commons Attribution 4.0 International License (https://creativecommons.org/licenses/by/4.0/).
Credit: Electron documentation, Copyright (c) Electron contributors and (c) 2013-2020 GitHub Inc., and Tauri documentation, Copyright (c) Tauri Programme within The Commons Conservancy, both under the MIT License (https://opensource.org/license/mit); the GNOME HIG and Fluent 2 state no open licence and are cited for facts only.
[1] Keyboard accelerators — https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-accelerators
[2] Access keys design guidelines — https://learn.microsoft.com/en-us/windows/apps/develop/input/access-keys
[3] Keyboard interactions — https://learn.microsoft.com/en-us/windows/apps/develop/input/keyboard-interactions
[4] Keyboard accessibility — https://learn.microsoft.com/en-us/windows/apps/design/accessibility/keyboard-accessibility
[5] Visual feedback (high visibility focus visuals) — https://learn.microsoft.com/en-us/windows/apps/develop/input/guidelines-for-visualfeedback
[6] Tooltips — https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/tooltips
[7] High DPI Desktop Application Development on Windows — https://learn.microsoft.com/en-us/windows/win32/hidpi/high-dpi-desktop-application-development-on-windows
[8] Window Management (Win32 UX guide) — https://learn.microsoft.com/en-us/windows/win32/uxguide/win-window-mgt
[9] Windows app title bar — https://learn.microsoft.com/en-us/windows/apps/design/basics/titlebar-design
[10] Drag and drop — https://learn.microsoft.com/en-us/windows/apps/develop/data/drag-and-drop
[11] Selection mode — https://learn.microsoft.com/en-us/windows/apps/develop/ui/controls/selection-modes
[12] Guidelines for app settings — https://learn.microsoft.com/en-us/windows/apps/design/app-settings/guidelines-for-app-settings
[13] Notifications design basics — https://learn.microsoft.com/en-us/windows/apps/develop/notifications/app-notifications/app-notifications-ux-guidance
[14] Confirmations (Win32 UX guide) — https://learn.microsoft.com/en-us/windows/win32/uxguide/mess-confirm
[15] Contrast themes — https://learn.microsoft.com/en-us/windows/apps/design/accessibility/high-contrast-themes
[16] GNOME HIG: Keyboard — https://developer.gnome.org/hig/guidelines/keyboard.html
[17] GNOME HIG: Pointer and touch — https://developer.gnome.org/hig/guidelines/pointer-touch.html
[18] GNOME HIG: Tooltips — https://developer.gnome.org/hig/patterns/feedback/tooltips.html
[19] GNOME HIG: Windows — https://developer.gnome.org/hig/patterns/containers/windows.html
[20] GNOME HIG: Menus — https://developer.gnome.org/hig/patterns/controls/menus.html
[21] GNOME HIG: Notifications — https://developer.gnome.org/hig/patterns/feedback/notifications.html
[22] GNOME HIG: Dialogs — https://developer.gnome.org/hig/patterns/feedback/dialogs.html
[23] Apple HIG: Keyboards — https://developer.apple.com/design/human-interface-guidelines/keyboards
[24] Apple HIG: The menu bar — https://developer.apple.com/design/human-interface-guidelines/the-menu-bar
[25] Apple HIG: Context menus — https://developer.apple.com/design/human-interface-guidelines/context-menus
[26] Apple HIG: Windows — https://developer.apple.com/design/human-interface-guidelines/windows
[27] Apple HIG: Undo and redo — https://developer.apple.com/design/human-interface-guidelines/undo-and-redo
[28] Apple HIG: Settings — https://developer.apple.com/design/human-interface-guidelines/settings
[29] Apple HIG: File management — https://developer.apple.com/design/human-interface-guidelines/file-management
[30] Apple HIG: Drag and drop — https://developer.apple.com/design/human-interface-guidelines/drag-and-drop
[31] Apple HIG: Notifications — https://developer.apple.com/design/human-interface-guidelines/notifications
[32] NN/g: Tooltip Guidelines — https://www.nngroup.com/articles/tooltip-guidelines/
[33] NN/g: Data Tables: Four Major User Tasks — https://www.nngroup.com/articles/data-tables/
[34] NN/g: Infinite Scrolling — https://www.nngroup.com/articles/infinite-scrolling/
[35] NN/g: Keyboard-Only Navigation for Improved Accessibility — https://www.nngroup.com/articles/keyboard-accessibility/
[36] Pencil & Paper: Data Table Design UX Patterns (practitioner article, pattern examples, no research cited) — https://www.pencilandpaper.io/articles/ux-pattern-analysis-enterprise-data-tables
[37] IBM Carbon: Data table usage — https://carbondesignsystem.com/components/data-table/usage/
[38] Electron: Dark Mode — https://www.electronjs.org/docs/latest/tutorial/dark-mode
[39] Electron: nativeTheme — https://www.electronjs.org/docs/latest/api/native-theme
[40] Electron: Menus (roles) — https://www.electronjs.org/docs/latest/tutorial/menus
[41] Electron: Menu API — https://www.electronjs.org/docs/latest/api/menu
[42] Electron: BrowserWindow — https://www.electronjs.org/docs/latest/api/browser-window
[43] Electron: Custom Window Interactions — https://www.electronjs.org/docs/latest/tutorial/custom-window-interactions
[44] Electron: Custom Title Bar — https://www.electronjs.org/docs/latest/tutorial/custom-title-bar
[45] Electron: Updating Applications — https://www.electronjs.org/docs/latest/tutorial/updates
[46] Electron: Keyboard Shortcuts — https://www.electronjs.org/docs/latest/tutorial/keyboard-shortcuts
[47] Playwright: Electron — https://playwright.dev/docs/api/class-electron
[48] Tauri: WebDriver — https://v2.tauri.app/develop/tests/webdriver/
[49] Tauri: WebDriver manual setup — https://v2.tauri.app/develop/tests/webdriver/manual-setup/
[50] Accessibility Insights for Windows — https://accessibilityinsights.io/docs/windows/overview/
[51] Apple: Accessibility Inspector — https://developer.apple.com/documentation/accessibility/accessibility-inspector
[52] Fluent 2: Tooltip usage — https://fluent2.microsoft.design/components/web/react/core/tooltip/usage
