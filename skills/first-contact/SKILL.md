---
name: first-contact
description: Usability test a running product with an agent that has never seen it — read the codebase to learn what the product can do, turn each capability into a goal stated in a user's words rather than the product's, then send in a worker that knows only the goal and the URL and must find its own way by reading and clicking. What it did is recorded from the browser's own trace, not from its account of itself, so hesitation, wrong turns, backtracks and giving up are all counted. Use to find where a UI confuses people, to test onboarding or a new flow, to check whether a feature is discoverable at all, or to get an honest first-time-user report on a product you are too close to.
---

# First contact

Everyone who built the product knows where the button is. They named it, they
placed it, they have clicked it a thousand times. That knowledge cannot be
un-learned, which is why the team is the worst possible judge of whether the
thing is usable — and why "is this obvious?" asked around the office always
comes back yes.

The only honest test is someone who has never seen it. Give them a goal, not
instructions, and watch what they do.

**Their confusion is the measurement.** Not their opinion afterwards, which is
polite and unreliable, and not whether they succeeded — a user who reaches the
goal in fourteen clicks down two dead ends has found you a problem, not
absolved you of one. Three rules follow:

1. **The path is the result.** Success is a checkbox; the route is the finding.
2. **The goal names the outcome, never the mechanism.** The moment you say "use the Export menu", you have told them the answer and measured nothing.
3. **What the tester did is evidence. What it says it did is a story.** The browser's trace is the record.

## 1. The tester must be genuinely ignorant

This skill needs a worker with no inherited context and no access to the
repository. Not "instructed not to look" — actually unable to, or at minimum
dispatched without the path and without a word of what the product is.

You cannot play the tester yourself. By the time you have read the code to write
the goals, you know where the button is, and no amount of pretending recovers
that. If your harness cannot dispatch a fresh worker that has not seen the
codebase, stop and say so; a run where the tester knew the answer measures
nothing, and reporting it as a usability test is worse than not running it.

**Be honest that this is a rule, not a cage.** A worker with a shell can read
whatever it likes, and the instruction not to is exactly the kind of boundary
this repository otherwise refuses to trust. What the ledger *can* do is catch
the loudest tell: it collects every link the tester was ever shown, and flags
any address it navigated to that it could not have seen — `unseen URL`. A
first-time visitor cannot type `/admin/export` unprompted. If that mark appears
and the URL is not something anyone would guess (`/`, `/login`), the run is void.
Silence there is weak evidence, not proof. Dispatch the tester into an empty
working directory, never mention the repository path, and treat the whole thing
as a measurement that can be spoiled rather than one that cannot.

## 2. Learn what the product actually does

Read the codebase as the analyst — routes, navigation, forms, empty states,
permissions, feature flags, the jobs a user can start and finish. You are
building two things: a list of what the product claims to do, and, for each one,
the path its designers had in mind.

Note also what the product needs before any of it works: an account, seeded
data, a particular role. A tester who lands on an empty dashboard is testing
your fixtures, not your interface.

## 3. Turn capabilities into goals

A goal is a job someone came here to get done, written the way they would say it
to a friend. This is the part that gets the skill wrong most easily, so:

- **Outcome, not mechanism.** "Get last month's invoice as a PDF", not "use Billing → Export".
- **Their vocabulary, not yours.** If the product calls them Workspaces, the goal says "somewhere to keep my team's stuff". If the goal has to use the product's own coined word, you have leaked the map — and you have also found a finding, because the user has to learn that word from somewhere.
- **One job per goal**, with a definition of done the tester can check for itself.
- Include a **"what even is this"** goal — land on the front page and decide, in a minute, what this product is for and whether it is for you. Most products fail here first.
- Include a **recovery** goal — undo it, change it back, cancel it, get the thing you just deleted. Products are designed forwards and used in both directions.
- Include one **impossible** goal — something the product genuinely does not do. A user must be able to conclude "it can't" quickly; hunting for twenty minutes for a thing that was never there is a real and common failure.

A leaked goal produces a tidy ledger that measures nothing, and it is easy to
leak without noticing. So take the product's vocabulary off the running screens
rather than from memory — you have just read the code, so you know the routes,
and remembering every label is the part nobody should be trusted with:

```bash
node <skill-dir>/check.mjs --harvest <url>/ <url>/streams <url>/settings > vocab.txt
```

That prints every word the product puts in front of a visitor, minus the
ordinary English ones. Cut it down to the terms a first-timer could not know,
then check the goals against it before anyone is dispatched:

```bash
node <skill-dir>/check.mjs goals.md vocab.txt
```

It flags goals containing the product's own vocabulary, and goals naming a
mechanism (`click`, `menu`, `settings`, `export`) rather than an outcome. It
exits non-zero if any goal fails, because a run built on a leaked goal is not
worth the tokens.

**Where this may run.** A local instance with disposable data. The tester is a
stranger with no idea what is safe: it will click *Delete*, submit the form
twice, and try the big red button to see what it does. Never point it at
production, staging, a shared database, or anything wired to real mail,
payments, or a third party. Give it credentials if a real user would have them —
an email and a password, not a login URL.

## 4. Seal the intended path first

Before dispatching, write down what you expect — for each goal, the route the
designers intended, counted in steps, and the single element you think the
tester will find first. Put it in a file and do not change it afterwards.

This is what makes the ledger mean something. "Fourteen moves" is a number
without an opinion; "fourteen moves against an intended three" is a finding.

Sealing it is mechanical, because "we meant three" claimed after seeing
fourteen is not a prediction:

```bash
node <skill-dir>/check.mjs --seal intended.md   # sealed 4f3a91c02b7e · 3 intended moves
```

That writes `intended.md.sealed` beside it. Afterwards, `ledger.mjs --intended
intended.md` reports one of three things: `sealed <hash>`, `EDITED SINCE SEALING
— the comparison is void`, or `NEVER SEALED — this was not committed to before
the run, so it is a description, not a prediction`.

Be clear about what that is worth. One agent holds both ends here, and could
delete the sealed file and start again. It makes an edit *visible*; it does not
make one impossible, and nothing short of a second party would.

## 5. Send the tester in

One goal per session, so nothing carries over. Start it yourself — the tracing
is the observation, and the tester should not be in charge of the record of its
own behaviour:

```bash
WORK=$(mktemp -d) && cd "$WORK" && S="fc$(basename "$WORK" | tail -c 7)"
playwright-cli -s=$S open          # in-memory profile: no cookies, no history, no logins
playwright-cli -s=$S tracing-start
```

**Every command must run from that one directory — yours and the tester's.**
`playwright-cli` scopes its sessions to the working directory: the same session
name used from two different directories is two different browsers. Start
tracing in one and let the tester work in another and everything appears to
succeed, the tester does its job, and the trace records an idle browser that
nobody touched. This was not a hypothetical; it cost four trial runs to notice,
because an empty ledger looks exactly like a run where nothing went wrong. Put
the tester's working directory in its brief, and stop the recording from there
too.

Then dispatch the worker with the goal, the URL, the session name, and nothing
else:

> You are a competent internet user. You have used the web for years — you know
> forms, tabs, search boxes, the back button, and what a gear icon usually means.
> You have never seen this particular product before and know nothing about it.
> Nobody is available to ask, and there is no manual.
>
> Your goal: **<the goal, in the user's words>**. You are done when <definition of done>.
>
> Work only through the browser, in session `$S`, starting at `<url>`:
>
> ```
> playwright-cli -s=$S goto <url>
> playwright-cli -s=$S snapshot          # what is on the page
> playwright-cli -s=$S screenshot        # what it looks like — actually look at it
> playwright-cli -s=$S click e12         # refs come from the snapshot
> playwright-cli -s=$S fill e4 "text"
> ```
>
> You may only perceive what a visitor perceives: the snapshot and screenshots.
> Do not use `eval`, do not inspect the DOM or page source, do not read the
> network log or console, do not open any file, and do not look for the
> project's code. Those are X-ray vision and a real user does not have them. If
> you catch yourself reasoning about how it is built, stop and go back to
> looking at the page.
>
> Before every action, append one line to `notes.txt` in the form
> `<the command you are about to run> :: <what you are trying to do>`:
>
> ```
> echo 'click e9 :: maybe help explains what this is' >> notes.txt
> ```
>
> Name the command, because one intention often takes two moves and the notes
> are matched to what they say they are about. Write it before you act, never
> afterwards from memory. Nobody else can see what you intended, and where the
> intent and the outcome disagree is the whole point of this exercise.
>
> Give up when you would give up in real life — roughly twenty-five actions or
> three dead ends. **Giving up is a valid and useful result**; say where you
> were, what you had tried, and what you would have done next (emailed support,
> googled it, left). Do not push on out of diligence.
>
> Report: whether you reached the goal, your running commentary, every word or
> label you did not understand, everything you clicked that looked like the
> answer and was not, and the one thing that would have helped you most.

**Watch the tester's context, because it degrades quietly.** Every command
returns a full accessibility snapshot, and on a real application those are
large — twenty-five moves of them will crowd out the early part of the run. A
tester running short on room gets terser and more decisive, which reads in the
ledger as *confidence* and is nothing of the sort, and it biases later goals to
look worse than earlier ones. One goal per session is the main defence. Beyond
that, `playwright-cli snapshot --depth=4` trims a deep tree, `--depth` plus a
targeted `snapshot "#main"` is cheaper still, and a goal that needs more than
about twenty-five moves should be split rather than squeezed.

Then stop the recording and clear the ground for the next goal:

```bash
playwright-cli -s=$S tracing-stop
playwright-cli -s=$S close          # next goal opens a fresh session, not a cleared one
```

## 6. Keep the ledger

Two records, and only one of them is evidence.

The tester tells you what it *meant* to do — which only it knows. The trace
tells you what it *did*, and it cannot be edited after the fact:

```bash
node <skill-dir>/ledger.mjs .playwright-cli/traces/trace-*.trace --notes notes.txt
```

```
| # | page     | was trying to                    | did   | to                  | saw   | marks                        |
| 2 | /        | the main call to action          | click | link "Open Kettle"  | f2→f3 |                              |
| 3 | /streams | settings, export usually lives there | click | link "Cogs"      | f4→f5 | left without doing anything  |
| 4 | /cogs    | maybe backups live in the vault  | click | link "Vault"        | f5→f6 | left without doing anything  |
| 5 | /vault   | "spill" is the only odd link     | click | link "spill"        | f6→f7 | left without doing anything  |

moves: 6 · screens: 5 · lookedAndLeft: 3 · noVisibleChange: 1 · unseenUrls: 0
```

The recording holds all of it, and none of it is the tester's account of itself:

- **every move in order**, with the click resolved back to the label the tester actually saw — `button "Add rows"`, never a CSS selector, because the label is what misled them
- **a JPEG of the screen either side of each move**, so the screenshot at the moment it went wrong is automatic rather than something the tester had to think to capture
- **the accessibility snapshot** it was reading at each point, and the full DOM
- **the page and URL** for every step
- **console messages and uncaught errors**, attached to the move that caused them — a user stuck on a screen that was quietly throwing is a bug report, not a UX finding
- **the complete network log**, in `traces/*.network`

Trouble is judged by **what changed on screen**, never by the URL — a modal, a
client-side route and a tab are all invisible to a URL, and most products are
mostly those:

- **left without doing anything** — arrived at a screen, did nothing there, moved on. This is what a dead end looks like from outside when the tester recovers by going *forwards*, which is what they usually do. Read it as a rate, not a list: on a flat-navigation run it marked 3 moves out of 6 and every one was a real dead end, while on a modal-heavy run it first marked 16 out of 21 and was worthless. Opening and closing a dialog is now excluded, which brought that run to 5, but the rule stands — when this mark covers most of the moves it is describing the interaction style, not the product.
- **wrong turn** — a move undone by the next one, whether by the back button or by clicking away.
- **no visible change** — the screen did not change at all. Usually a dead control; sometimes a download or a copy to the clipboard, so judge it rather than counting it.
- **returned to an earlier screen**, **backtrack**, **repeat** — going in circles.
- **unseen URL** — see §1. This one voids the run.

The one thing the browser cannot record is intent, which is why the tester keeps
`notes.txt`. `--notes` matches each note to the move it names, not to a position
in the list, and reports how many moves it could not match rather than shifting
everything by one.

Where the notes and the trace disagree, the trace wins. Not because testers
lie — in the calibration run below the tester's own account was accurate and
richer than the ledger — but because the trace is the part nobody can revise,
and it counts things prose does not: it independently marked the same three dead
ends the tester described, caught a page throwing an error the tester never
mentioned, and confirmed no impossible URLs were visited.

For a human to scrub through the whole run visually, `npx playwright show-trace
<trace-file>` opens it with the DOM, the screenshots and the network side by side.

### The calibration run

[`fixture.mjs`](fixture.mjs) is a small product with faults planted on purpose —
coined vocabulary, a prominent control that does the wrong thing, a feature
reachable only through a link labelled `spill`, a control wired to nothing, a
page that throws, and a task that is impossible. Run the protocol against it to
see what a good run looks like, and to check the marks still fire before
trusting them on real code.

```bash
node <skill-dir>/fixture.mjs        # prints its URL
```

Goal *"get a copy of your data as a spreadsheet"*, one tester, no hints. It
succeeded in 6 moves through 3 dead ends, and reported: *"I clicked it on a pun.
Kettles spill, spilling is pouring the contents out. That's a guess about
wordplay, not a guess about software."* The ledger, built from the trace alone:

```
| 3 | /streams | click | link "Cogs"  | left without doing anything, page error: undefinedFunction is not defined |
| 4 | /cogs    | click | link "Vault" | left without doing anything |
| 5 | /vault   | click | link "spill" | left without doing anything |

moves: 6 · screens: 5 · lookedAndLeft: 3 · noVisibleChange: 1 · unseenUrls: 0
```

`lookedAndLeft: 3` are the same three dead ends the tester described in prose,
found independently and without reading a word of it. That run is also what
tuned these detectors: written against imagined traces they missed all three,
because the tester never once pressed the back button.

**What repeated runs showed.** The same export goal, three testers, no hints:
6, 10 and 18 moves; two, two and three dead ends; all three succeeded, all three
named `spill` as the problem, and all three reached it through the archive by
guessing at a pun. That is the shape of a real result — the count varies by
three times, the finding does not. One run would have reported "6 moves" as
though it were a property of the product.

Two other goals, one run each. **The trap**: a tester asked to make a place for
a kitchen renovation pressed the big blue *+ New*, which silently filed a note
against somebody else's project, then found the real create action buried in
settings, used it twice, and was told *"Stream kindled."* both times while
nothing appeared. It failed the goal and reported the false confirmation as the
worse of the two bugs. **The impossible one**: a tester asked to delete a
project spent 28 moves, tried right-click, drag, the Delete key, `?` and two
guessed URLs, then correctly concluded it could not be done — *"the destination
exists, the door doesn't"*.

The trap run matters most, because that false confirmation **was not planted**.
It was a mistake in the fixture, written by the person who wrote the faults, and
found by a tester who had never seen the code. A method that only recovers the
problems you already knew about is a mirror; this one found something its author
did not know was there. Its ledger, 21 moves:

```
| 3 | /streams | "+ New" should create a new stream | click | button "+ New" | wrong turn, left without doing anything |
| 10| /cogs    | confirm creating it                | click | button "Kindle" | left without doing anything |
| 13| —        | reload in case the list was stale  | goto  | .../streams     | no visible change |
| 14| /streams | maybe a filter is hiding my stream | click | button "Filter" | no visible change |
```

Two `no visible change` marks in a row, on a reload and then on a control, is
what "I was told it worked and nothing happened" looks like from the outside.
The dead `Filter` control shows up in the same mark.

**These marks are heuristics tuned on two runs**, and they were both wrong the
first time: `left without doing anything` fired on 76% of the modal-heavy run
until dialog excursions were excluded, and `unseen URL` — the mark that voids a
run — fired twice on a tester re-typing an address it had already visited, until
visited addresses were added to what it counts as seen. Expect to tune them
again on a product shaped differently from these. Prefer the intent column and
the screenshots over the counts when they disagree.

There are deliberately **no timing marks**. The gaps between an agent's actions
are model latency, not hesitation, and reading them as a confused pause would be
inventing findings. Count moves, not minutes.

## 7. What counts as a finding

Against the sealed path, and ranked by what it costs a real person:

- **Blocked** — did not reach the goal. Where it stopped, and what it was looking for that was not there.
- **Detour** — reached it, but well past the intended step count. Say both numbers.
- **Wrong turn** — something looked like the answer and was not. The label that misled, and what it actually does. These are the cheapest wins in the whole report.
- **Looked and left** — a screen the tester went to, hoping, and abandoned without touching anything. Read these as the question they arrived with: three testers passing through Settings on the way to an export is Settings failing to say what it holds.
- **Right result, wrong route** — the goal reached by a path nobody designed: the back button instead of your breadcrumbs, the URL bar instead of your nav, a workaround instead of the feature. The product taught them a habit you did not intend, usually because the intended route is less discoverable than the accident.
- **Jargon** — a word on screen the tester could not interpret. Your coined nouns, your internal names, your abbreviations.
- **Invisible** — a feature that exists and was never found. The most expensive kind of finding, because someone built it.
- **Told it worked when it didn't** — the product confirmed something that did not happen. Rank this above everything else on the list: every other finding costs the user time, and this one costs them the work, because a success message stops them checking. A tester will usually catch it only if the goal's definition of done makes them go back and look, so write the goals that way.
- **Dead-ended without knowing** — for the impossible goal, how long before the tester concluded it could not be done. If it never concluded that, your product has no way of saying no.

A finding is a moment, with the ledger row and a screenshot behind it. "The
navigation is confusing" is not a finding; "on `/projects`, three of four
testers clicked *Overview* looking for a place to add a project, then went back"
is one.

**Run each goal three times.** The tester is not deterministic, and with two runs
you cannot tell a pattern from a coincidence — a second run that agrees is one
data point, not corroboration. What survives three is structural; what happens
once is a bad roll. If three runs of a goal is more than the budget allows, that
is a legitimate choice, but then call the result a smoke test and not a finding.

## 8. Report

Lead with the goals that were not reached, then the detours, ordered by how much
they cost. Each with: the goal, intended steps versus actual, the ledger extract,
the screenshot at the moment it went wrong, and what would have prevented it —
usually a label, an empty state, or one link in the wrong place, rarely a
redesign.

Then the limits, which are real:

- **An agent is not a person.** It reads the whole accessibility tree at once, never gets frustrated, and cannot see visual hierarchy — your big primary button and a muted secondary link look identical to it. Screenshots close some of that gap; they do not close all of it.
- **It is closer to a screen-reader user than a sighted one.** That cuts both ways: if the tester could not find a control in the snapshot, someone using assistive technology cannot either, and that is an accessibility finding you got for free.
- **It is a more capable novice than any real one.** It knows the conventions of a thousand products, so it pattern-matches its way past things a genuine first-timer would not. Every finding here is a floor, not a ceiling — a real novice does worse.
- **Only the goals you wrote** were tested, and a goal that leaked the mechanism tested nothing. List them so the reader can judge.
- **It is not cheap.** One tester, one goal, one short run against a five-page fixture cost roughly 40k tokens. A real product with deeper screens costs more, and the arithmetic is goals × three runs: eight goals is on the order of a million tokens. Decide the goal list with that in mind rather than discovering it halfway.
