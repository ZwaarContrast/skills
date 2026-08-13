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

## Mock a required external dependency

If the app calls an external service to do its core job, the walled app can no
longer reach it, and every request that needs it fails at that boundary — you can
only test the front half. Stand up a mock on `rb-appnet` that answers in the real
service's contract, and point the app at it.

```bash
# a lean mock server (match the real response shape EXACTLY, or you test the reject path)
docker run -d --name rb-mock --network rb-appnet -v "$PWD/mock.py:/app.py:ro" python:3-alpine python /app.py
# point the app at it and restart the app
#   SERVICE_ENDPOINT=http://rb-mock:<port>   (reached by container name on rb-appnet)
```

Two things bite here:

- **Contract fidelity.** The mock's status, content-type and body must be what the
  app expects. A near-miss makes the app take its error path, so you end up
  testing error handling instead of the feature you meant to unlock. Read the
  client code for the exact shape (required fields included) before writing the mock.
- **The app may validate the endpoint.** Some clients refuse a plaintext URL
  unless the host is loopback, or pin TLS — the same guard that protects a real
  credential. A DNS-named mock is then rejected at startup. Two ways through:
  share the app's network namespace so the mock answers on loopback
  (`docker run --network container:<app-container> …`, app calls
  `http://127.0.0.1:<port>`), or give the mock a TLS cert the app will trust.

Make the mock's payload swappable at runtime (an env var it reads per request, no
rebuild) — that turns it into a red instrument: the same mock serves a benign
response to unlock the path, then a hostile one (a body far past any sane size, a
truncated JSON, an unexpected content-type, markup aimed at whatever renders the
result) to test the app's trust in its upstream. Verify by inversion as always:
the mock is a seeded dep, so it must sit behind the wall with the app — reachable
by the app, not from the internet.
