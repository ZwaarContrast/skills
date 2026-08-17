# ZwaarContrast Skills

Agent skills, installable with [`skills`](https://github.com/vercel-labs/skills).

Licensed under the [MIT License](LICENSE).

## Install

```bash
npx skills add ZwaarContrast/skills                    # all skills
npx skills add ZwaarContrast/skills --list             # see what's available
npx skills add ZwaarContrast/skills --skill clean-room # just one
```

## Skills

- **clean-room** — rethink existing functionality: trace it, restate it as a
  sanitized problem brief, redesign it with an isolated worker that cannot read
  the source, then compare the designs as replace / graft / keep.
- **cold-start** — test whether setup docs actually work: clone to a temp
  directory, send in a fresh-context agent to boot / verify / change the project,
  and report every guess it had to make.
- **red-blue** — turn-based red-team/blue-team game against a running app: red
  demonstrates a break, blue mitigates it, and the orchestrator re-runs every
  exploit so only reproducible attacks and verified fixes count.
- **crash-test** — profile a frontend by using it the way an impatient user
  does, while Chromium's own instruments record the cost: repeated requests,
  layout thrash, leaked listeners, timers nobody stops, each with the source
  line that caused it. A fix must move the number without moving the pixels.
- **first-contact** — usability test with an agent that has never seen the
  product: read the code to learn what it does, turn that into goals stated in
  a user's words, then send in a worker that gets only the goal and the URL.
  The browser's trace records what it really did, not what it says it did.

They all use real boundaries as measuring instruments rather than asking an
agent to pretend: an enforced context wall, a committed-only clone, a rerun
exploit, the browser's own counters, or a tester who has never seen the code.

### `clean-room` compatibility and safety

The skill requires an agent harness that can start a fresh worker without
inherited conversation history and prevent that worker from reading the target
repository. If either form of isolation is unavailable, the skill stops instead
of presenting an ordinary second opinion as a clean-room result. Internet access
is needed for verified ecosystem research; without it, the skill labels the run
offline and does not recommend new dependencies without evidence.

This is a cognitive de-anchoring workflow, not a legal clean-room engineering
process or evidence of non-infringement. Review the brief before delegation when
working with confidential code; proprietary identifiers and secrets must not be
sent to another worker or used in web searches.

## Developing a skill in this repo

Do not run the install command above from inside this repo. It replaces
`skills/<name>/` with symlinks into `.agents/skills/`, and any uncommitted edits
to a `SKILL.md` go with them.

Install from a local checkout instead, from a directory outside it:

```bash
cd /tmp/try
npx skills add /path/to/this/clone --skill clean-room
```

`--list` against the same path is a safe read-only check that a new skill is
discoverable and its frontmatter parses.

## Add a skill

```
skills/<name>/SKILL.md
```

with frontmatter:

```yaml
---
name: <name>          # must match the directory
description: <one line — this is what the agent matches on>
---
```

Nesting one or two category levels (`skills/<category>/<name>/SKILL.md`) also works.
