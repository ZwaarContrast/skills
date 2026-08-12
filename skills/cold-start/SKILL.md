---
name: cold-start
description: Cold-start test for a project's onboarding — clone it to a temp directory so only committed files exist, then send a fresh-context agent in to get it running, verify it, and make one change, recording every guess it had to make. Use when asked whether the setup docs actually work, before handing a project to a client or a new developer, when onboarding is slow or README steps have gone stale, or to find the tribal knowledge that only lives in someone's head.
---

# Cold start

Setup documentation is never wrong on the machine that wrote it. The missing
step is already done there, the undocumented environment variable is already
exported, and the tool nobody mentions is already installed. The only honest
test is to put someone who knows nothing in front of the repository and watch
where they stop.

A fresh agent is that someone. It has no conversation history and no tribal
knowledge — the same position a client or a new hire is in. Its confusion is the
measurement.

**A guess is a gap.** The run succeeding is not the result. Every point where
the runner had to infer something the project never told it is a finding, even
when the inference was right — because the next person guesses differently.

## 1. Make the start actually cold

A cold start in a warm directory proves nothing. Clone to a temp directory:

```
git clone <repo-path> <tmpdir>/coldstart
```

A local clone carries committed files only. Everything uncommitted — the `.env`
that makes it work on your machine, the built assets, the installed
dependencies, the local database volume — is correctly absent, which is the
whole point.

Then inventory what a clone cannot isolate, because these leak the warmth back
in and the runner must be told about them:

- Databases, queues, and other services already running on this machine.
- Credentials in the ambient environment or in a shared keychain.
- Globally installed tooling: language runtimes, package managers, version managers, CLIs.
- Containers, volumes, and images already built.
- Anything the project reaches over the network that is shared with real users.

## 2. Fence off what must not be touched

The runner executes commands, so decide the blast radius before it starts, not
after. Identify and name as forbidden:

- Migrations, seeds, or resets against any database that is not created fresh by the run itself.
- Anything carrying production or staging credentials.
- Deploys, publishes, pushes, and releases.
- Destructive cleanup of shared machine state — pruning images, wiping caches other projects use.
- Writes to shared third-party services: sending real email, charging real cards, posting to real channels.

Where a documented step would cross one of these lines, the runner reports the
step as unrunnable rather than running it. Unrunnable is a legitimate result and
often a finding in itself: a setup that cannot be exercised safely by a newcomer
is a setup problem.

## 3. Send the runner in

Dispatch **one subagent** (`general-purpose`, or whatever this harness calls an
agent that can run commands). One shot, no conversation. You have been working
in this repository and you know things — answering its questions destroys the
measurement. If it gets stuck, that is the result.

> You are a developer who has just been given access to this project and knows
> nothing else about it. Your working directory is `<tmpdir>/coldstart`. Nobody
> is available to ask.
>
> Do not touch anything outside that directory. These are off limits: <the
> fenced list from step 2>. If a documented step would cross one of those lines,
> record it as unrunnable and move on.
>
> Work from what is in the repository — README, docs, contributing guide,
> scripts, config, comments. Get through three gates in order, and stop at the
> first one you cannot pass:
>
> 1. **Boot** — install dependencies and get the project to build or start.
> 2. **Verify** — prove it is actually working: run the tests, hit the health
>    endpoint, load the page, invoke the CLI. Whatever this project offers.
> 3. **Change** — make one trivial visible change and confirm it takes effect.
>    A string in a UI, a new test that fails, an extra line of output.
>
> Keep a log as you go. For every command: what you ran, where you got the idea,
> and what happened. Then mark up the log:
>
> - **Guess** — you did something the project never told you to do. Looking up
>   a generic ecosystem error is not a guess. Inferring anything specific to
>   this project is, and it counts even when it worked.
> - **Stale** — the docs said to do something and it no longer matches reality.
> - **Assumed** — a tool, service, credential, or runtime you used that was
>   already present and that the project never asks you to install.
> - **Blocked** — you could not continue.
>
> Report: which gates you passed; the log with those marks; and the one thing
> that, had it been written down, would have helped you most.

## 4. Report

Lead with the **first blocker** — where a real newcomer would have given up.
Everything past that point is speculative, because they would never have reached
it. Then the gaps in the order the runner hit them, each with:

- What the runner had to guess, and what it guessed.
- The fix, which is usually a documented line or a script, not a change in architecture.
- Who it bites: a client taking the project over, a new developer, or CI on a clean machine.

Say plainly which gates passed. "Boots and verifies, cannot make a change
without help" is a precise and useful result.

Resist redesigning the setup. A missing sentence in the README is the cheapest
fix in software; propose the script or the container only when the number of
gaps says the sentence is no longer enough.

## 5. Confirm the fix

Once the fixes are in and committed, run it again: fresh clone, fresh agent,
same three gates. It is the same cost as the first run and it is the only thing
that distinguishes a fixed onboarding from a documented one.
