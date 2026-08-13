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

Write `mock.py` first — the service contract, with the response mode read per
request from a one-line file so the orchestrator can flip it with no rebuild:

```python
# mock.py — stdlib only. Mode read per request from /tmp/mode (default benign).
from http.server import BaseHTTPRequestHandler, HTTPServer
def mode():
    try: return open("/tmp/mode").read().strip()
    except FileNotFoundError: return "benign"
class H(BaseHTTPRequestHandler):
    def do_GET(self):  self.reply()
    def do_POST(self): self.reply()
    def reply(self):
        if mode() == "benign":               # match the real contract EXACTLY
            body, ct = b'{"ok":true,"text":"seeded result"}', "application/json"
        else:                                 # one hostile mode shown; add others as needed
            body, ct = b"A" * (50 << 20), "application/json"   # oversized body
        self.send_response(200); self.send_header("Content-Type", ct)
        self.send_header("Content-Length", str(len(body))); self.end_headers()
        self.wfile.write(body)
HTTPServer(("0.0.0.0", 8080), H).serve_forever()
```

```bash
docker run -d --name rb-mock --network rb-appnet -v "$PWD/mock.py:/app.py:ro" python:3-alpine python /app.py
# point the app at it and restart:  SERVICE_ENDPOINT=http://rb-mock:8080
# flip the mode from the host (orchestrator), never from jailed red:
docker exec rb-mock sh -c 'echo hostile > /tmp/mode'   # arm a hostile response
docker exec rb-mock sh -c 'echo benign  > /tmp/mode'   # baseline — reset each move
```

Two things bite here:

- **Contract fidelity.** The mock's status, content-type and body must be what the
  app expects. A near-miss makes the app take its error path, so you end up
  testing error handling instead of the feature you meant to unlock. Read the
  client code for the exact shape (required fields included) before writing the mock.
- **The app may validate the endpoint.** Some clients refuse a plaintext URL
  unless the host is loopback, or pin TLS — the same guard that protects a real
  credential. A DNS-named mock is then rejected at startup. Prefer giving the
  mock a TLS cert the app will trust. The alternative — sharing the app's network
  namespace so the mock answers on loopback (`docker run --network
  container:<app-container> …`, app calls `http://127.0.0.1:<port>`) — works but
  drags the mock into the app's whole netns: its port must not collide with any
  app port, and it becomes reachable wherever the app is, including from the
  jail. Use it only if the TLS route is closed.

The per-request mode file turns the mock into a red instrument: benign unlocks
the path for the smoke check, a hostile mode (a body far past any sane size,
truncated JSON, an unexpected content-type, markup aimed at whatever renders the
result) tests the app's trust in its upstream. Only the orchestrator flips it
(`docker exec rb-mock …`); red, jailed on rb-jail, cannot reach the mock, so
upstream-hostile repros are referee-driven — set the mode, then run the
app-facing trigger. Benign is the baseline; reset to it each move. Verify by
inversion as always: the mock is a seeded dep, reachable by the app, not from the
internet.
