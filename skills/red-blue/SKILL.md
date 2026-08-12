---
name: red-blue
description: Turn-based red-team/blue-team game against a running application — red demonstrates a break, blue mitigates it, and every move is adjudicated by the orchestrator re-running the exploit, so only reproducible attacks and verified fixes count. Runs in a network-isolated sandbox; teams communicate through a shared board file and alternate like chess until the round budget is spent. Use to adversarially security-test or harden an app, pit attack against defence, stress-test where something breaks under a real attacker, or produce a pentest-style report backed by reproducible exploits and their fixes.
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

The output is a report and a branch of proposed fixes. Nothing is merged. It
finds what an attacker with this much time finds — never treat a quiet game as
proof the app is secure.

## Setup

1. **Sandbox the whole game.** Red runs real attacks with a live agent's full
   tooling; the only safe place for that is one it cannot escape. Run everything
   — the app and both agents — where nothing but the app under test is
   reachable: a container with egress blocked, a disposable VM, or the
   equivalent this harness offers. If you cannot establish that isolation, stop
   and say so; do not run. The fence below is the rules of the game — the
   sandbox is the wall that enforces them. **Build it and prove it holds before
   any move — see [Building the sandbox](#building-the-sandbox) for a tested
   recipe and the verification gate.**
2. **Isolate the code.** Create a git worktree on a fresh branch
   (`redblue/<app>`), or whatever this harness calls an isolated checkout. The
   app runs here and blue commits fixes here; the user's working tree is never
   touched.
3. **Back up first, before booting anything.** If the app is configured to reach
   any database that already existed — one you did not create fresh for this
   game — back it up in full and note the restore command now, while the process
   is still down. **If you cannot make that backup yourself** — no access, an
   engine you cannot dump, credentials you should not touch — stop and ask the
   user to make one, and do not proceed until a backup exists. No backup, no
   game; this gate has no override. A stateless app skips this.
4. **Boot the app** from the worktree, local instance only, pointed at a
   throwaway store seeded with test data — never a real or shared one. Work out
   the launch from the repo the way any newcomer would. Keep it running across
   turns; note the restart command — blue will need it.
5. **Capture the baselines.** With the app up and untouched, record the two
   things the game measures against:
   - The **data baseline** — rebuilt from the app's own migrate and seed
     commands, so blue's committed schema or data fixes replay on every reset
     instead of being frozen out by a stale dump. After any move or rerun that
     mutates the store, rebuild it before the next move. Nothing is lost: every
     repro is self-contained from the baseline (enforced on red below), so it
     recreates whatever state it needs — which is also what lets red demonstrate
     a destructive break (dropping a table, deleting a file) without ending the
     game. A stateless app skips this.
   - The **smoke check** — a concrete, rerunnable proof the app still does its
     job: its test suite, or a scripted golden path you write down. Confirm it
     passes green now, before any attack. Blue's fixes are accepted only against
     *this* named check; an invented, trivially-passing one defeats the whole
     own-goal guard.
6. **Open the board** at `<tmpdir>/redblue/board.md`. This is the comms channel:
   both teams read all of it before moving and append their move to it. Between
   turns, only the board and blue's committed fixes carry over — the datastore
   rebuilds to the baseline.

## Building the sandbox

The skill names the wall — "a container with egress blocked" — but a wall you
did not test is a wall you are guessing at. This is how to build one and, more
importantly, how to prove it holds. The recipe is for a containerised app; a
disposable VM with egress rules is the equivalent.

**Build an egress-blocked box on the app's own network.** A Docker network
created `--internal` has no route off itself: containers on it reach each other
and nothing else — not the internet, not the host's other containers, not the
host disk.

```bash
docker network create --internal rb-jail
docker network connect rb-jail <app-container>          # app reachable from the jail
# build the attacker box WITH tooling, THEN cut its egress — order matters:
docker run -d --name rb-attacker alpine sleep infinity  # starts with egress
docker exec rb-attacker apk add --no-cache curl python3 # install while it still has the internet
docker network connect rb-jail rb-attacker
docker network disconnect bridge rb-attacker            # remove every egress-capable network
```

Install tooling *before* cutting egress — once jailed, the box cannot fetch a
package. The app stays dual-homed: still on its own network for its
dependencies (a broker, a DB), now also on `rb-jail` for the attacker.

**Verify the wall by inversion, before any move.** This is a referee check, not
an assumption. Run the same probe from inside the jail and confirm it reaches
the app and fails everything else:

```bash
docker exec rb-attacker curl -sm6 -o/dev/null -w'%{http_code}\n' http://<app-container>:<port>/health  # expect 200
docker exec rb-attacker curl -sm6 https://1.1.1.1                                                       # expect connect failure
docker exec rb-attacker curl -sm6 http://<another-host-container>:<port>                                # expect DNS/connect failure
docker exec rb-attacker sh -c 'test -r <a-real-host-secret> && echo LEAK || echo walled'               # expect walled
```

App reachable **and** internet, the host's other containers, and host secrets
all unreachable → the wall holds. Any "expect fail" line that succeeds → stop,
you do not have a sandbox.

**Who runs the attacks.** The jail confines commands run *inside* it, not the
agent that decides them. A red subagent dispatched with a full shell runs in the
harness, beside the app — not inside the jail — so telling it to "only use the
jail" is a rule, not a wall, and one misfire reaches everything the probe above
reached. Two honest configurations:

- **Harness can network-confine the agent** (its own egress-blocked sandbox, a jailed exec context): dispatch red and blue inside it. This is the ideal — independent agents behind an enforced wall.
- **Harness cannot** (subagents inherit host reach, as most do today): the orchestrator drives the seats itself and routes every attack through the jailed box (`docker exec rb-attacker …`). The wall is then enforced on execution even though the deciding agent is not jailed. You lose independent adversarial agents; you keep reproducible exploits, verified fixes, the ratchet, and a real boundary. State which configuration you used in the report.

## The fence

The rules both teams play by inside the sandbox. Red attacks **the
application**, never the machine it runs on or the world around it:

- Attacking anything outside the app under test — the host, other services, the network, real third-party APIs.
- Real credentials, or anything pointing at production or staging — including the datastore, which is disposable seed data only.
- Denial-of-service that wrecks the sandbox rather than demonstrating a flaw. A repro that shows the app falls over is a finding; actually exhausting the host is not.
- Exfiltration to any real endpoint. Prove the read; do not ship the data anywhere.
- Blue disabling a feature to win. A mitigation that fails the smoke check is an own-goal, and the referee will catch it.
- Commits to any branch but the worktree's, and any push, deploy, or publish.

## The board

Append-only. One entry per move:

```markdown
## Turn <n> — <RED|BLUE>
Target: <the break being attacked or defended>
Move: <what was done, in one or two sentences>
Repro: <the exact runnable thing — curl, HTTP request, Playwright script, CLI
        invocation — self-contained from the baseline, that the referee runs>
Referee: <filled in by you: PASS/FAIL and what you observed on rerun>
```

Plus two running sections at the top, updated as the game goes:

- **Open breaks** — demonstrated, not yet closed.
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
> the exact runnable command or script that demonstrates it. The repro must run
> green from the baseline with no manual prep: include every setup step — the
> injection, the seeding, the login — inside it, because the referee rebuilds
> the data between moves and a repro that assumes leftover state will be scored
> wrong. A claim without a repro the referee can run does not count. Append your
> move to the board and add any further ideas to red's backlog.

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

- Red's repro now fails **and** the smoke check from setup still passes green → hand it to the judge, which attacks the fix with variants (below). Any variant fires → blue patched the symptom; the break stays open with that variant as its new repro. No variant fires → `CLOSED-this-round`.
- Red's repro still works → mitigation `FAIL`; the break stays open.
- The smoke check fails → own-goal; reject the commit, the break stays open.

## The judge

A neutral third seat, dispatched as its own subagent — not red, not blue, told
to distrust both equally. It rules on what a rerun cannot, and settles every
existence question by handing a repro to the referee, never by decree. Called at
two points:

- **After a red PASS** — the referee has shown the exploit fires. The judge rules whether it is a real flaw in the app or an artifact of the test setup or a fence breach, and rates its severity. An invalid break is struck; a valid one enters **Open breaks** at that severity.
- **After a blue PASS** — the referee has shown red's repro now fails and the app still works. The judge writes **two or three variants** aimed at the same underlying flaw — a mutated payload, a sibling endpoint, an encoding trick — and hands each to the referee to run. This is the whack-a-mole check. If none fires, the break is `CLOSED-this-round`, which means no variant defeated the fix this round — not that the class is proven shut. The report says exactly that.

## Stop

- **Round budget** (default 6 rounds, one round = red then blue): a hard stop. Six rounds is a smoke test, not an audit — raise it for a larger app. State the budget at the start.
- **Red runs dry**: two red turns in a row produce no new PASS. This bounds the game's effort — it is not evidence the app is secure, and the report must not imply it is.
- **Blue concedes a point**: a break blue cannot close without an own-goal stays open as an accepted-risk finding; the game continues on other fronts.

## Report

Count first: breaks red opened, of those how many blue closed and how many stand
open. Then, ranked by the judge's severity, every demonstrated break:

- What it was, and its repro — this is a reproducible exploit, not a claim.
- Whether it is `CLOSED-this-round`, and if so the fix commit and how many variants it survived. Say plainly that this is not a proof the class is shut.
- If open: why, and what an attacker gets.

State the game's reach honestly: the round budget spent, and that no finding
here means the app is secure — only that this much effort did not break it
further. End with the fixes as a proposal — the worktree branch holds every
accepted fix, ready for the user to review, cherry-pick, or discard. Nothing is
merged.
