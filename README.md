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
