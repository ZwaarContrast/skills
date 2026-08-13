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
   reachable, and the app itself reaches nothing but its own seeded deps: no
   internet egress on either side, so an SSRF finding cannot pivot through the
   app to the internet. If you cannot establish that isolation, stop
   and say so; do not run. The fence below is the rules of the game — the
   sandbox is the wall that enforces them. Create the jail networks now; connect
   the app and prove the wall holds once it is booted (step 5), following
   [`sandbox-recipe.md`](sandbox-recipe.md).
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
   turns; note the restart command — blue will need it. If the app calls an
   external service for its core job, stand up an in-sandbox mock of it in
   **benign** mode now — see [`sandbox-recipe.md`](sandbox-recipe.md) — so the
   back half runs and step 5's smoke check can exercise it. A mock is a seeded
   dep, so the wall's invariant holds; red attacks it in its hostile mode
   (Red's turn).
5. **Prove the wall, then capture the baselines.** With the app up and
   untouched, first run the sandbox verification gate from
   [`sandbox-recipe.md`](sandbox-recipe.md): the attacker box must reach only the
   app, and the app must reach only its deps — any "expect fail" probe that
   succeeds stops the game. Then record the two things the game measures against:
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
   rebuilds to the baseline and the mock returns to its benign mode.

## The sandbox

Step 1's wall, built and proven before any move; the mechanics — two internal
Docker networks, tooling installed before egress is cut, the inversion probes
that prove it holds, and the mock that lights the app's back half — live in
[`sandbox-recipe.md`](sandbox-recipe.md). One thing about it belongs here,
because it shapes every turn.

**Who runs the attacks — jailing the exec context is not jailing the agent.** A
red subagent with a full shell runs in the harness, beside the app, not inside
the jail; "only use the jail" is then a rule, not a wall. Two honest configs,
and you state which you used in the report:

- **Config A — the harness can network-confine the agent** (its own egress-blocked sandbox or jailed exec context): dispatch red and blue inside it. Independent adversarial agents behind an enforced wall. The ideal.
- **Config B — it cannot** (subagents inherit host reach, as most do today): you, the orchestrator, play the seats yourself and route every app-facing command through the jailed attacker box the recipe builds. You lose independent agents; you keep reproducible exploits, verified fixes, the ratchet, and a real boundary.

Only the app-facing seats route through the jail. **Red**'s exploits and the
**referee**'s rerun of them and the smoke check are app-facing — in config B
author each to run inside the jailed attacker box, so the attack and its
adjudication are one jailed command. **Blue** does not and cannot: it edits code and rebuilds
the app, needing the toolchain and registry the jail denies; its containment is
the worktree plus the fence rule that it commits only to the branch and never
pushes — enforced by the referee inspecting the commit before applying it.
Building and restarting the app between rounds is a host operation for the same
reason.

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

In **config A**, dispatch a red subagent (`general-purpose`, or whatever runs
commands and drives a browser) with the board and the app's address. In **config
B**, you play red yourself, routing every attack through the jailed box. Either
way the brief is the same:

> You are red team. Break this application. Read the whole board first — you may
> not resubmit a break already marked CLOSED, and any break blue has fixed you
> must now get *past*, not repeat.
>
> Pick one target. Use whatever the app exposes: an HTTP client against an API,
> Playwright or a browser against a web UI, direct invocation of a CLI. Look for
> the usual doors — injection, broken auth and access control, IDOR, SSRF,
> secrets in responses, unsafe deserialization, missing rate limits, logic flaws
> in whatever this app is actually for. If a core-job dependency is mocked, test
> the app's trust in it: how it parses, stores and re-serves a hostile upstream
> response (oversized, malformed, wrong content-type, injected markup, slow-drip).
>
> A secret that should never be in the codebase — a committed `.env`, a hardcoded
> password, an API key or token in the source, the git history, or the built
> image — is a confirmed vulnerability the moment you see it. Report it on sight:
> its repro is the one-line inspection that surfaces it (`git show …`, `grep …`),
> not an exploit, and you never use the credential — it may be live. You cannot
> prove it live without using it, so judge by heuristic: a known key shape
> (`AKIA…`, `sk_live_…`), high entropy, and whether it is the app's live config
> rather than an `.env.example` or a test fixture. Report it as a
> credential-shaped secret with your confidence, name what it would unlock, and
> move on; its presence is the proof.
>
> Stay inside the fence: <paste the fence>. Produce one break and a **repro** —
> the exact runnable command or script that demonstrates it. The repro must run
> green from the baseline with no manual prep: include every setup step — the
> injection, the seeding, the login — inside it, because the referee rebuilds
> the data between moves and a repro that assumes leftover state will be scored
> wrong. In config B, write the repro to run inside the jailed attacker box, so
> your attack and the referee's rerun are the same jailed line. A claim
> without a repro the referee can run does not count. Append your move to the
> board and add any further ideas to red's backlog.

An upstream-hostile break is the one exception to the single jailed line: red
cannot reach the mock — it sits on the app's own network, which the jail does
not reach — so the referee drives it. Author the repro as two steps run
together: flip the mock's mode switch to hostile, then the jailed app-facing
trigger. The referee reruns both, and the mock returns to benign with the
baseline.

Then **adjudicate**: run the repro yourself.

- It breaks the app → `PASS`. Hand it to the judge; a break the judge rules valid enters **Open breaks** at the judge's severity.
- It does not → log `FAIL`. The move does not count; red may try again next red turn.
- It is a committed or baked-in secret → the repro is an inspection, not an exploit. Re-run the `git show`/`grep`, confirm a credential-shaped value is really there (not an `.env.example` or a test fixture), and enter it in **Open breaks** at a severity set by what it unlocks — a live payment key is critical, a throwaway CI token is not, so it skips the exploit rerun but still takes the judge's severity call. Closing it means removing the secret *and* rotating it; the game can verify removal by re-inspecting, not rotation, so the report flags rotation as required follow-up.

## Blue's turn

Dispatch a blue subagent. Give it the board. Instruct it:

> You are blue team. Read the board and pick one open break. Fix it in the code
> or config of this worktree so the break's repro no longer works, without
> breaking what the app does. Where the judge cited a spec or best practice for
> this break, fix the app to conform to that standard — its current version —
> not merely to defeat the repro, and have the regression test assert what the
> standard requires.
>
> Find the **right fix, not a bandaid.** The standard the judge cited says what
> correct behaviour is; now find how it is canonically achieved. Check how this
> class of bug is properly resolved — the library's own docs and security
> advisories, a patched release to upgrade to, how others fixed the same issue —
> and apply that production-grade remediation (often the upgrade itself), not a
> hand-rolled workaround around a fix that already exists. Cite a source that
> resolves — an advisory ID, release notes, a commit — not a plausible-looking
> reference; an unresolvable citation counts as no citation.
>
> Where no canonical fix exists, or the fix exists but you cannot reach it
> (offline, no registry), a hand-rolled fix is the right answer — the rule is
> against reinventing a worse version of a fix you could have used, not against
> writing one where none is available. A sound hand-rolled fix survives the
> judge's variants, passes its regression test, and conforms to the cited
> standard; flag an unreachable-but-known fix as "upgrade to X once online". No
> web reach at all? Do your best from first principles and say the remediation
> is unverified against prior art.
>
> **Document the fix in the commit, not the code:** its
> message names the break, what closed it, and any residual risk. The code stays
> prose-free — only the short, concrete comment a maintainer needs to not
> re-break it, never a write-up of the vulnerability.
>
> If the app has a test suite, land the break as **two commits**: first the
> **regression test** — the test that would have caught this break, failing
> (red) on the code as it stands; then the fix that turns it green. It asserts
> the condition the vulnerability violated, not just red's one payload, so the
> hole cannot silently reopen. Keep the rest of the suite green; where your fix
> legitimately changes behaviour and a test now fails, update that test to
> assert the new correct behaviour — never weaken or delete an assertion just to
> make it pass. If the app has no test suite, say so — red's repro is promoted
> into the smoke check as the standing guard instead.
>
> Stay inside the fence: <paste the fence>. Append your move to the board, and
> if you cannot close a break without disabling a feature, say so — that break
> stays open as an accepted risk.

Then **adjudicate**: first inspect the commits — the fix is documented in its
message, the code is prose-free, and (if the app has a suite) a regression test
lands first. Bounce it back if the rationale is buried in the source, if the
regression test is missing where a suite exists, or if it made an existing test
pass by gutting an assertion rather than matching legitimately-changed behaviour.
Then apply the commits, restart the app, and run the checks yourself.

- The regression test must go **red→green** across the two commits: genuinely red at the test commit — a real assertion exhibiting the bug, not an import or collection error from referencing code the fix adds later — and green at the fix commit. Run the suite at each; the split makes this one command, no surgery. Any other outcome bounces: green at both is theater (it guards nothing), red at both means the fix does not satisfy it, green→red means the test is inverted. A green test is evidence, not proof — only a test that bites when the fix is gone proves the fix is real.
- Red's repro now fails **and** the smoke check from setup still passes green (the app's test suite included, with blue's regression test now part of it) → hand it to the judge, which attacks the fix with variants (below). Any variant fires → blue patched the symptom; the break stays open with that variant as its new repro. No variant fires → `CLOSED-this-round`.
- Red's repro still works → mitigation `FAIL`; the break stays open.
- The smoke check fails → own-goal; reject the commit, the break stays open. (A dependency upgrade that legitimately changes behaviour is not an own-goal if blue updated the affected tests and the smoke check's intent still holds.)

## The judge

A neutral third seat, dispatched as its own subagent — not red, not blue, told
to distrust both equally. It rules on what a rerun cannot, and settles every
existence question by handing a repro to the referee, never by decree. Called at
two points:

- **After a red PASS** — the referee has shown the exploit fires. The judge rules whether it is a real flaw and how bad, running two checks before it opens anything:
  - **Rule the sandbox out.** A "break" that is really the app failing to reach a dependency the wall blocks — a cut egress, a missing external service — is the wall talking, not a vulnerability, and blue can never close it. The tell is whether it would still happen with egress restored; if the behaviour vanishes once the blocked dependency is reachable, strike it as a sandbox artifact and note it untestable in this harness, rather than sending blue in circles after an unfixable finding.
  - **Judge against the standard, not red's expectation.** Where a spec or an established best practice governs the behaviour — an API contract, an RFC the app implements, current hardening guidance like OWASP, or the app's own documented behaviour — validate the finding against the *current* version of it (look it up — a reference lookup outside the wall; a superseded recommendation is the wrong bar). No web reach? Fall back to the app's own documented spec and label the finding's currency unverified, rather than asserting a standard from memory. Conforms and is sound → not a break, but a design question for the user, not one to hand blue. Violates it — or conforms only to the app's own outdated spec while failing current best practice → confirmed; cite the clause or guidance and its version on the board, which sets the bar blue's fix must meet.

  A break that survives both enters **Open breaks** at its severity; any invalid or fence-breaching break is struck.
- **After a blue PASS** — the referee has shown red's repro now fails and the app still works. The judge writes **two or three variants** aimed at the same underlying flaw — a mutated payload, a sibling endpoint, an encoding trick — and hands each to the referee to run. This is the whack-a-mole check. Aim one variant at blue's regression test as well: if a variant slips past it, the test guards red's one payload, not the condition — bounce it back to widen. Then weigh the fix as a fix: confirm blue's cited source resolves to a real advisory or release — an unresolvable citation counts as none — and check it against what the library actually documents. A bandaid that survives the variants is still a bandaid: if a production-grade fix was **reachable and ignored** (a patched release blue could have installed, the library's secure-usage pattern) and blue hand-rolled around it, bounce it back for the real one. Where no fix is documented, or one exists but was out of reach, a hand-rolled fix stands as long as it survives the variants and its regression test. If none fires and the fix is either the documented remediation or a sound hand-rolled one, the break is `CLOSED-this-round`, which means no variant defeated the fix this round — not that the class is proven shut. The report says exactly that.

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

Then the **spec/design questions** the judge surfaced — behaviour that conforms
to spec but that you should rule on — listed for the user, not scored as breaks.

State the game's reach honestly: the round budget spent, and that no finding
here means the app is secure — only that this much effort did not break it
further. End with the fixes as a proposal — the worktree branch holds every
accepted fix, ready for the user to review, cherry-pick, or discard. Nothing is
merged.
