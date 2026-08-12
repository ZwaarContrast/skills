---
name: red-blue
description: Turn-based red-team/blue-team game against a running application — red demonstrates a break, blue mitigates it, and every move is adjudicated by the orchestrator re-running the exploit, so only reproducible attacks and verified fixes count. Teams communicate through a shared board file and alternate like chess until red runs out of new breaks or the round cap is hit. Use to adversarially security-test or harden an app, pit attack against defence, stress-test where something breaks under a real attacker, or produce a pentest-style report backed by reproducible exploits and their fixes.
---

# Red vs blue

Two teams take turns against a running application. **Red** finds a way to break
it. **Blue** closes the hole. Red's next turn must get past what blue just did.
That ratchet is the point — it drives red past the first easy finding into the
deep ones, and forces blue to actually close things rather than wave at them.

Two seats keep the teams honest. As **referee** you, the orchestrator, settle
existence mechanically: a break counts only when you re-run red's exploit and
watch it break; a fix counts only when you re-run that same exploit and it now
fails *and* the app still works. Neither team's claim is evidence; your rerun
is. A neutral **judge** settles what a rerun cannot — whether a break is worth
counting, how bad it is, and whether a fix closed the hole or only the one
repro. The judge is bound by the same rule: it proves its point by handing a
repro back to you, never by decree. Hold the board, run the app, execute every
repro yourself.

The output is a report and a branch of proposed fixes. Nothing is merged.

## Setup

1. **Isolate.** Create a git worktree on a fresh branch (`redblue/<app>`), or
   whatever this harness calls an isolated checkout. The app runs here and blue
   commits fixes here; the user's working tree is never touched.
2. **Guard the data, when it has any.** First the seatbelt: if the app is
   configured to reach any database that already existed — one you did not
   create fresh for this game — back it up in full and note the restore command
   before you boot anything. **If you cannot make that backup yourself** — no
   access, an engine you cannot dump, credentials you should not touch — stop
   and ask the user to make one, and do not proceed until a backup exists. No
   backup, no game; this gate has no override. Then run the game against a
   throwaway store seeded with test data, never a real or shared one, and once
   it is seeded capture a baseline you can restore: prefer the app's own seed or
   rebuild command, fall back to a dump or a file copy. A stateless app skips
   all of this. The baseline is the starting position: after any move or rerun
   that mutates the store, restore it before the next move. Nothing is lost by
   resetting — a break's repro starts from the baseline and recreates whatever
   state it needs — and it is what lets red demonstrate a destructive break
   (dropping a table, deleting a file) without ending the game.
3. **Boot the app** from the worktree, local instance only, pointed at the
   throwaway store. Work out the launch from the repo the way any newcomer
   would. Keep it running across turns; note the restart command — blue will
   need it.
4. **Open the board** at `<tmpdir>/redblue/board.md`. This is the comms channel:
   both teams read all of it before moving and append their move to it. Between
   turns, only the board and blue's committed fixes carry over — the datastore
   resets to the baseline.

## The fence

Red attacks **the application**, never the machine it runs on or the world
around it. Forbidden to both teams:

- Attacking anything outside the local instance — the host, other services on it, the network, real third-party APIs.
- Real credentials, or anything pointing at production or staging — including the datastore, which is disposable seed data only.
- Denial-of-service that wrecks the dev machine rather than demonstrating a flaw. A repro that shows the app falls over is a finding; actually exhausting the host is not.
- Exfiltration to any real endpoint. Prove the read; do not ship the data anywhere.
- Blue disabling a feature to win. A mitigation that breaks what the app is for is an own-goal, and the referee will catch it (see below).
- Commits to any branch but the worktree's, and any push, deploy, or publish.

## The board

Append-only. One entry per move:

```markdown
## Turn <n> — <RED|BLUE>
Target: <the break being attacked or defended>
Move: <what was done, in one or two sentences>
Repro: <the exact runnable thing — curl, HTTP request, Playwright script, CLI
        invocation — that the referee runs to adjudicate>
Referee: <filled in by you: PASS/FAIL and what you observed on rerun>
```

Plus two running sections at the top, updated as the game goes:

- **Open breaks** — demonstrated, not yet closed. The score red is ahead by.
- **Red's backlog** — attack ideas not yet tried. Lets a fresh red turn pick up where the last left off.

## Red's turn

Dispatch a red subagent (`general-purpose`, or whatever runs commands and
drives a browser). Give it the board and the app's address. Instruct it:

> You are red team. Break this application. Read the whole board first — you may
> not resubmit a break already marked CLOSED, and any break blue has fixed you
> must now get *past*, not repeat.
>
> Pick one target. Use whatever the app exposes: an HTTP client against an API,
> Playwright or a browser against a web UI, direct invocation of a CLI. Look for
> the usual doors — injection, broken auth and access control, IDOR, SSRF,
> secrets in responses, unsafe deserialization, missing rate limits, logic flaws
> in whatever this app is actually for.
>
> Stay inside the fence: <paste the fence>. Produce one break and a **repro** —
> the exact runnable command or script that demonstrates it. A claim without a
> repro the referee can run does not count. Append your move to the board and
> add any further ideas to red's backlog.

Then **adjudicate**: run the repro yourself.

- It breaks the app → `PASS`. Hand it to the judge; a break the judge rules valid enters **Open breaks** at the judge's severity.
- It does not → log `FAIL`. The move does not count; red may try again next red turn.

## Blue's turn

Dispatch a blue subagent. Give it the board. Instruct it:

> You are blue team. Read the board and pick one open break. Fix it in the code
> or config of this worktree so the break's repro no longer works, without
> breaking what the app does. Commit the fix on this branch with a message
> naming the break. Stay inside the fence: <paste the fence>. Append your move
> to the board, and if you cannot close a break without disabling a feature, say
> so — that break stays open as an accepted risk.

Then **adjudicate**: apply the commit, restart the app, and run two checks
yourself.

- Red's repro now fails **and** a functionality smoke check still passes → hand it to the judge, which tries to defeat the fix with a variant (below). Variant fires on rerun → blue patched the symptom; the break stays open with the variant as its new repro. Variant does not fire → `CLOSED` at the judge's severity.
- Red's repro still works → mitigation `FAIL`; the break stays open.
- The smoke check fails → own-goal; reject the commit, the break stays open.

## The judge

A neutral third seat, dispatched as its own subagent — not red, not blue, told
to distrust both equally. It rules on what a rerun cannot, and settles every
existence question by handing a repro to the referee, never by decree. Called at
two points:

- **After a red PASS** — the referee has shown the exploit fires. The judge rules whether it is a real flaw in the app or an artifact of the test setup or a fence breach, and rates its severity. An invalid break is struck; a valid one enters **Open breaks** at that severity.
- **After a blue PASS** — the referee has shown red's repro now fails and the app still works. The judge writes a **variant** aimed at the same underlying flaw — a mutated payload, a sibling endpoint, an encoding trick — and hands it to the referee to run. This is the whack-a-mole check: a fix that defeats one repro but not its variants closed nothing.

## Stop

- **Round cap** (default 6 rounds, one round = red then blue): a hard budget stop. State it at the start.
- **Red resigns**: two red turns in a row produce no new PASS. The app is holding — blue wins the remaining ground.
- **Blue concedes a point**: a break blue cannot close without an own-goal stays open as an accepted-risk finding; the game continues on other fronts.

## Report

Score first: breaks red opened, of those how many blue closed, how many stand
open. Then, ranked by the judge's severity, every demonstrated break:

- What it was, and its repro — this is a reproducible exploit, not a claim.
- Whether it is closed, and if so the fix commit that closed it.
- If open: why, and what an attacker gets.

End with the fixes as a proposal — the worktree branch holds every accepted fix,
ready for the user to review, cherry-pick, or discard. Nothing is merged.
