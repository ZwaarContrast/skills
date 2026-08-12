# ZwaarContrast Skills

Agent skills, installable with [`skills`](https://github.com/vercel-labs/skills).

## Install

```bash
npx skills add ZwaarContrast/skills                    # all skills
npx skills add ZwaarContrast/skills --list             # see what's available
npx skills add ZwaarContrast/skills --skill clean-room # just one
```

## Skills

- **clean-room** — rethink existing functionality: trace it, restate it as a problem brief, redesign it behind a context wall (a subagent that never sees the code), then verdict the current implementation as replace / graft / keep.
- **cold-start** — test whether your setup docs actually work: clone to a temp dir so only committed files exist, send a fresh-context agent in to boot / verify / change the project, and report every guess it had to make.

Both work the same way — a real context boundary as the measuring instrument, rather than asking an agent to pretend it doesn't know something.

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
