# Building the sandbox

Referenced from `SKILL.md` step 1. A wall you did not test is a wall you are
guessing at — this builds one and proves it holds. The recipe is for a
containerised app; a disposable VM with the same egress rules is the equivalent.

**Precondition: the app runs as a container.** The commands attach the jail to
`<app-container>`. If the app boots as a host process (`npm start` and the like),
containerise it first — a minimal image, or `docker run` its runtime — or run
the whole game in a VM whose egress rules do the same job. A host-process app
cannot be jailed without host networking, which hands back the egress the jail
removes.

## Two internal networks, neither with a route off itself

A Docker network created `--internal` has no gateway to the outside. Put the app
and its seeded deps on one, the app and the attacker on another; the app bridges
them, and nothing reaches the internet.

```bash
docker network create --internal rb-appnet     # app + its deps (DB, broker)
docker network create --internal rb-jail       # app + attacker

# app and deps on the app-net; cut the app's egress
docker network connect rb-appnet <app-container>
docker network connect rb-appnet <db-container>
docker network disconnect <egress-net> <app-container>  # the default bridge, or its compose network — any net with a gateway
docker network disconnect <egress-net> <db-container>   # deps lose egress too

# attacker box: install tooling WHILE it still has egress, THEN jail it
docker run -d --name rb-attacker mcr.microsoft.com/playwright:latest sleep infinity  # browser image if red drives a UI
docker network connect rb-jail rb-attacker
docker network connect rb-jail <app-container>
docker network disconnect bridge rb-attacker    # attacker can now reach only the app
```

Match the attacker image to the attack surface: a Playwright/browser image if
red drives a web UI, a lean `alpine` with `curl python3` for API and CLI work.
Install everything the attacker needs *before* cutting egress — a jailed box
cannot fetch a package.

## Verify by inversion — a referee gate, run after the app is booted

Not an assumption. Probe from inside the jail **and** from the app: the attacker
must reach only the app, and the app must reach only its deps.

```bash
# from the attacker: app reachable, nothing else
docker exec rb-attacker curl -sm6 -o/dev/null -w'%{http_code}\n' http://<app-container>:<port>/health  # expect 200
docker exec rb-attacker curl -sm6 https://1.1.1.1                                                       # expect fail (no internet)
docker exec rb-attacker curl -sm6 http://<db-container>:<port>                                          # expect fail (not on rb-appnet)

# from the app: deps reachable, internet NOT — the SSRF-pivot gate
docker exec <app-container> curl -sm6 http://<db-container>:<port>   # expect success (deps still work)
docker exec <app-container> curl -sm6 https://1.1.1.1               # expect fail
docker exec <app-container> curl -sm6 http://169.254.169.254/       # expect fail (cloud metadata)
```

Any "expect fail" that instead succeeds → stop, you do not have a sandbox. **The
app-side probes are the ones that matter most:** an SSRF finding makes the *app*
fetch a URL, so if the app keeps egress the wall leaks through the exact pivot
the game is built to hunt. Walling only the attacker box is not enough.
