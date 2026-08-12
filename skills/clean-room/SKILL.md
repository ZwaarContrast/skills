---
name: clean-room
description: Clean-room rethink of existing functionality — trace what the code really does, restate it as a problem and a goal, design a solution behind a context wall where the code is unseen (web research for libraries and best practices), then judge the current implementation against that design and propose replace, graft, or keep-as-is. Use when asked whether some code is the best way to solve its problem, to rethink or redesign a module, for a second opinion on an approach, or to find a simpler, more robust, or more testable way to build something that already exists.
---

# Clean room

Clean-room design: one party studies the original and writes a specification, a
second party builds from that specification alone, having never seen the
original. The wall between them is the whole point — an implementation you have
read anchors you to itself, and every "improvement" downstream of that anchor is
a variation on what is already there rather than an answer to the problem.

Four phases. The wall stands between phase 2 and phase 3, and it is a real
context boundary — a subagent — not a promise to ignore what you have read.

The output is a proposal. Do not edit the target code; that is a separate ask.

## 1. Trace

Read the target end to end and write down, for the brief:

- Every entry point, and who calls each one.
- The data in and the data out, at the boundary — shapes, types, units, nullability.
- Every branch, and the condition that selects it.
- Every side effect: I/O, network, filesystem, DB, global state, logging, clocks, randomness.
- Every error path and what it does — retries, swallows, propagates, corrupts.
- Every edge case the code visibly handles. These are scars; note each one, they matter in phase 4.
- What it plugs into: interfaces it must satisfy, modules that depend on it, modules it depends on.
- Hard constraints: language, runtime, deployment target, already-installed dependencies, performance and security requirements, compatibility it cannot break.
- How it is tested today, and what currently makes it hard to test.

Separate **essential** (what it must achieve — behaviour, guarantees, contracts)
from **incidental** (this library, this data structure, this file layout). Only
the essential crosses the wall.

Done when every branch and every side effect in the target is accounted for.

## 2. Brief

Write the brief to a scratch file. It is read by someone who has never seen this
repository and never will:

```markdown
# Problem
What goes wrong in the world when this does not exist. Two or three sentences.

# Goal
The observable outcomes. Behaviour and guarantees, not mechanism.

# Context
What this plugs into: the callers, the callees, the data crossing each boundary.
Anything it must interoperate with.

# Hard constraints
Language, runtime, deployment target, dependencies already present, performance,
security, compatibility. Say which are immovable and which are preferences.

# Edge cases that must hold
The scars from the trace, stated as requirements. "Handles a payload of 0 bytes",
not "there is an if-statement for empty payloads".

# Out of scope
What this must not try to solve.

# Done looks like
How correctness is observed from outside. The acceptance criteria.
```

Written in problem language throughout. Done when the brief names no file,
function, class, or library from the implementation, and a competent stranger
could build to it.

## 3. Design, behind the wall

Dispatch **one subagent** (`general-purpose`, or whatever this harness calls an
agent with web access) with the brief pasted into its prompt. It works from the
brief and the open internet; the repository stays shut. Instruct it:

> You are designing a solution from a brief. You have never seen an
> implementation and will not look for one — the repository is out of bounds.
> Design the simplest, most robust thing that satisfies the brief.
>
> Take the first option that holds: the standard library; a native platform
> feature; a dependency the brief says is already installed; one small,
> well-maintained third-party library; only then code written from scratch.
>
> Search the web for how this problem is normally solved and for libraries that
> solve it. For each library you propose, report the evidence: latest release
> date, release cadence, open-issue responsiveness, weekly downloads, license,
> and who maintains it. An unmaintained library is worse than the code you would
> have written.
>
> Return: the design in the fewest moving parts you can manage; each component
> and what it is responsible for; the libraries with their evidence; the seams
> that make it testable and the test plan those seams enable; the failure modes
> and what happens at each; and the two or three places this design could turn
> out to be wrong.

Without a real subagent there is no wall — say so plainly rather than running
phase 3 in the same context and calling it clean.

Done when the returned plan names its libraries with maintenance evidence and
its test seams.

## 4. Verdict

Now put the plan next to the code and judge, element by element, on four axes:
**correctness** against the brief, **simplicity** (moving parts, lines, concepts
a newcomer must hold), **robustness** (failure modes actually handled), and
**testability** (seams, determinism, no hidden I/O).

Find the fence first. For every behaviour the code has that the plan lacks, ask
why the code does it — Chesterton's fence. Each one resolves to:

- **In the brief, dropped by the plan** — the plan is incomplete, not simpler. Score it as incomplete.
- **Absent from the brief** — phase 1 missed it. Go and find out why the code does it before scoring anything.
- **Genuinely dead** — the code is carrying weight nothing needs. That is a finding in its own right.

A plan is only simpler when it does the same job with less. Then pick one verdict:

- **Replace** — the plan wins on the axes that matter here. Propose it as a sequenced set of changes, smallest shippable step first.
- **Graft** — parts of the plan win. Propose each part as its own independent change, ordered by value over effort. Say explicitly which parts of the current code stay and why.
- **Keep** — the current implementation wins. Say so plainly and stop. No consolation refactor.

Report testability findings under every verdict, Keep included: a design that is
right but untestable still earns a proposed refactor for its seams.

For each proposed change give: what changes, which axis it wins on, rough size,
what it risks, and how it is verified. End with the open questions the trace
could not answer.
