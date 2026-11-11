# Agent experience (AX)

Rules for products that AI agents operate for a user — via the web UI, an API, MCP tools, a CLI or docs — as a second audience next to humans. Read when: the product has a web UI an agent might drive, a public API, an MCP server, a CLI, or developer docs.
Summarised in our own words from the sources at the end; numbers and names are cited as facts.
Biilmann coined AX for everything an AI agent goes through when it is the one using a product or platform [1]. Many sources here are young; drafts and proposals are marked.

## Web UI for browser and computer-use agents

- **AGENT-1** Build controls from native elements — `<button>` and `<a>`, not clickable `<div>`/`<span>` — and where you cannot, add the right `role` and `tabindex`. Agents perceive the page through its accessibility tree; Playwright MCP works from that tree and needs no screenshots at all [2][3].
  Check: `playwright-cli snapshot`; a control a mouse can use that is absent from the snapshot, or appears as `generic` with no name, is broken. Grep for `onClick` on `div|span` lacking a `role`. (Accessible-name rules themselves: see a11y.md.)
- **AGENT-2** Associate each label with its input (`<label for>` or wrapping) so the snapshot shows a named textbox, not an anonymous field [2].
  Check: unnamed inputs in the snapshot; grep `<input` that has no `id` targeted by a `for=` and no `aria-label`.
- **AGENT-3** Every element a task depends on must be visible, above 8 square pixels in size, and free of transparent overlays; smaller or covered targets get dropped from a vision model's view of the page [2].
  Check: screenshot plus `--boxes` from the snapshot; zero-size, `opacity:0` or covered hit targets on a top-task path.
- **AGENT-4** Hold the layout still while the agent works: a page that keeps moving misleads screenshot-based agents, and web.dev counts elaborate hover states, moving layouts and fluid animation as things that break agents outright [2].
  Check: take two snapshots or screenshots 1 s apart with no input and diff them; list any action reachable only via `:hover` or `mouseenter`.
- **AGENT-5** Make dropdowns, scroll areas and custom widgets operable from the keyboard. Anthropic reports that Claude struggles to drive dropdowns and scrollbars with the mouse and suggests keyboard shortcuts instead [4].
  Check: finish the widget with Tab, arrows and Enter alone; custom selects that will not open from the keyboard.
- **AGENT-6** Put a separate human-confirmation step before any action with real-world effect — paying, accepting terms, giving consent — that an agent cannot fold into the action itself. Anthropic tells deployers to get human sign-off for payments and terms acceptance, and to check before each batch, since one batch can finish a multistep action in a single turn [4].
  Check: walk checkout, delete and terms flows in the snapshot up to the final click and stop there ((disposable only) press it); a single click that spends money or deletes data without a review state is a finding.
- **AGENT-7** Show the result of each action on the page (status message, changed heading, new row). Claude can assume an action worked without looking [4], so a silent success or failure reaches the user as a wrong report.
  Check: diff the snapshot after each step of the walk; no visible change means the agent has nothing to verify against.
- **AGENT-8** Treat page content as a prompt-injection channel: text on a page or in an image can redirect an agent away from its instructions [4]. Keep user-generated content visibly apart from controls and never present it as instructions.
  Check: can user-supplied text (reviews, names, comments) land beside or inside action labels in the snapshot?
- **AGENT-9** (Draft) If the product wants agents to call declared tools instead of clicking, register them with WebMCP: `document.modelContext.registerTool()` with `name`, `description`, `inputSchema` and annotations such as `readOnlyHint` and `consequentialHint`. WebMCP is a Draft Community Group Report, not a W3C Standard [5], and web.dev warns the API is still changing [2].
  Check: `typeof document.modelContext` in the console; list the registered tools and apply AGENT-11-AGENT-16 to them.
- **AGENT-10** A bot wall or CAPTCHA that stops an agent the user has authorised, with no other route for it (an API, an MCP server, verified-agent signing), is a finding; report the step and leave the trade-off against abuse to the owner. A draft route to verified agents exists: the IETF Web Bot Auth Internet-Draft has agents sign requests (`Signature-Agent` header, keys at `/.well-known/http-message-signatures-directory`, `tag` set to `web-bot-auth`), and it is still a work in progress [6].
  Check: during the agent walk, note whether and at which step a challenge page appears; a challenge with no alternative route for agents fails.

## APIs and MCP tools

- **AGENT-11** Offer a small set of tools shaped around user tasks rather than mirroring each endpoint; give each one a single, non-overlapping job — e.g. one `schedule_event` that both finds a free slot and books it [7]. Merge related operations into one tool with an `action` parameter [8].
  Check: read `tools/list`; overlapping tools, or a common user task that takes several chained low-level calls, is a finding.
- **AGENT-12** Prevent name collisions by prefixing tools with service or resource (`asana_search`, `github_list_prs`) [7][8]. MCP: names SHOULD be 1-128 characters, case-sensitive, limited to A-Z, a-z, 0-9, `_`, `-` and `.`, and unique per server [9]. Claude API: `^[a-zA-Z0-9_-]{1,128}$` [8].
  Check: run the regex over every tool name; flag bare names such as `search` or `get`.
- **AGENT-13** Describe each tool the way you would brief a new colleague: its job, when to pick it and when not to, what every parameter does, and what it leaves out. Anthropic's target is 3-4 sentences or more per description [8][7].
  Check: count sentences per description; a one-line description that only restates the tool name fails [8].
- **AGENT-14** Give parameters unambiguous names (`user_id` rather than `user`) and pin them down in a typed schema with enums, required fields and formats [7]. Shape arguments so mistakes are hard to make, e.g. insist on absolute file paths [10]. A tool without parameters should use `{"type":"object","additionalProperties":false}` per MCP [9].
  Check: `inputSchema` `string` properties lacking `description`, `enum` or `format`; parameters called `data`, `input`, `user` or `id`.
- **AGENT-15** Return just the fields the next step needs, using meaningful, stable identifiers instead of opaque ones; drop technical fields like `uuid`, `256px_image_url` and `mime_type` unless they are needed [7][8]. Add a `response_format` enum (`"concise"`/`"detailed"`) when callers need different depths [7].
  Check: call a list tool and count fields an agent will never use; ids without a readable name alongside.
- **AGENT-16** Cap response size through pagination, ranges, filters or truncation; when you truncate, say so and explain how to narrow the request. Claude Code limits a tool response to 25,000 tokens by default [7]. MCP lists page with an opaque `cursor`/`nextCursor` [9].
  Check: run the widest query; an unbounded dump, or a silent cut with no "N more, filter by X" hint, is a finding.
- **AGENT-17** Put tool failures in the tool result with `isError: true` and a message that says how to fix the call — not in a protocol-level error, which the model never sees and so cannot recover from [11]. Input-validation failures go here too (e.g. "Start date must be after today; today is 2026-11-11") [9]. Avoid bare error codes and tracebacks [7].
  Check: call every read-only tool (read-only by its code, not just `readOnlyHint`) with a wrong type, an out-of-range value and a missing field, and read the reply; (disposable only) do the same with write tools, since a broken validator lets the bad call write — read-only: read their validation code and `inputSchema`.
- **AGENT-18** Set MCP annotations honestly: `readOnlyHint` (default false), `destructiveHint` (default true, only meaningful for non-read-only tools), `idempotentHint` (default false), `openWorldHint` [11]. Clients MUST treat annotations from untrusted servers as untrusted [9], so they never stand in for server-side checks.
  Check: a delete/send/pay tool without annotations or with `destructiveHint:false`; a read tool lacking `readOnlyHint:true`.
- **AGENT-19** For structured results, declare an `outputSchema`, return `structuredContent` that matches it (a MUST for servers), and repeat it as serialized JSON in a text block for older clients [9].
  Check: call a read-only tool ((disposable only) a write tool) and validate its `structuredContent` against its `outputSchema`.
- **AGENT-20** Return HTTP API errors as RFC 9457 Problem Details (`application/problem+json`, with `type`, `title`, `status`, `detail`, `instance`), and aim `detail` at telling the client how to fix the request, not at debugging output [12].
  Check: `curl -i` a malformed read (a bad query parameter, an unknown id); (disposable only) a malformed `POST` or `PUT`; HTML error pages, bare 500s or stack traces in the body are findings.
- **AGENT-21** Make retries harmless with an idempotency key on every create and update (Stripe: `Idempotency-Key` header on `POST`, keys up to 255 characters, eligible for removal after 24 hours, rejected when reused with different parameters) [13]. Flag idempotent MCP tools with `idempotentHint` [11].
  Check: (disposable only) send one create twice with the same key; two resulting objects mean a retrying agent duplicates charges or records. Read-only: find the `Idempotency-Key` handling in the code or OpenAPI description; a create with none fails.
- **AGENT-22** Throttle with `429 Too Many Requests`, an explanation in the body, and a `Retry-After` header giving the wait [14]. MCP servers MUST rate limit tool calls [9].
  Check: (disposable only) burst until throttled; a 429 lacking `Retry-After`, or throttling that surfaces as a 500 or a hang, is a finding. Read-only: read the rate-limit middleware or config and the documented 429 body and `Retry-After`.
- **AGENT-23** Publish an OpenAPI description so people and programs can learn what the API does without reading its code; every `operationId` MUST be unique across the API, and each operation needs a `summary`/`description` [15].
  Check: fetch the description and lint it; flag operations without `operationId` or `description`.

## CLIs

- **AGENT-24** Write results to stdout and logs and errors to stderr; exit 0 on success and non-zero on failure [16].
  Check: `cmd >/dev/null` should leave only diagnostics; force a failure with an unknown flag or a missing argument, then `echo $?`.
- **AGENT-25** Support machine-readable output: emit formatted JSON under `--json`, and offer `--plain` when decorated output would break parsing [16].
  Check: `cmd --json | jq .` for each read command.
- **AGENT-26** Prompt only when stdin is an interactive terminal; otherwise demand the values as flags or arguments, and treat `--no-input` as a ban on all interaction [16].
  Check: `cmd </dev/null` on a read command, and on a write command with `--dry-run` or (disposable only) without; hanging or waiting at a prompt is a finding.
- **AGENT-27** Guard dangerous operations in a scriptable way: without a TTY, require `-f`/`--force` or `--confirm="name-of-thing"`; offer `--dry-run` to report what would change without changing it [16].
  Check: (disposable only) run the delete command with stdin closed; it must refuse without `--force` and must not prompt. Read-only: its `--help` lists `--force` (or `--confirm`) and `--dry-run`, the code refuses without a TTY, and `--dry-run` with stdin closed changes nothing.
- **AGENT-28** Show help for `-h` and `--help`; drop animations when stdout is not a TTY; respect `NO_COLOR`; provide `-q` [16].
  Check: `cmd --help`; `cmd | cat` for spinner or ANSI leftovers; `NO_COLOR=1 cmd`.
- **AGENT-29** Keep operations idempotent where you can, and catch expected errors to replace them with a message that says what to do next [16].
  Check: (disposable only) run the same create/apply twice — read-only: `--dry-run` the apply against the existing state; read the error for a missing argument.
- **AGENT-30** Take secrets from a file or stdin (e.g. `--password-file`), not from a flag value [16].
  Check: `--help` for `--token`/`--password` flags that take the secret inline.

## Docs for agents

- **AGENT-31** (Proposal) Serve `/llms.txt`: Markdown with an H1 naming the project (the one required part), a blockquote summary, H2 sections of link lists, and an "Optional" H2 for links an agent may skip. The llms.txt proposal is at version 2 and still open for community input [17].
  Check: `curl -sf https://<host>/llms.txt`; a 404 or HTML is a finding; verify the H1 and that links resolve.
- **AGENT-32** (Proposal) Publish a clean Markdown copy of each doc page at its URL plus `.md` (`page.html.md` or `page.md`; `index.html.md` for directory URLs) [17].
  Check: `curl -sf <doc-url>.md`.
- **AGENT-33** For a code product, keep agent instructions in `AGENTS.md` at the repo root — build and test commands, code style, testing, security notes. In a monorepo, add one per package; agents use the nearest file up the tree [18].
  Check: `ls AGENTS.md`; confirm its build and test commands run.
- **AGENT-34** Document example calls, edge cases and input formats for tools and APIs [10]; give complex tools schema-valid `input_examples` [8]. Prefer formats that are common in ordinary text on the web over bespoke ones [10].
  Check: run each documented read example exactly as written; (disposable only) the examples that write — read-only: validate them against the schema or OpenAPI description; a broken example sends an agent into a retry loop.

## Safety and trust

- **AGENT-35** Let agents sign in with scoped, audience-bound tokens instead of the user's password. MCP over HTTP: OAuth 2.1 with PKCE, Protected Resource Metadata and `resource` indicators; tokens MUST NOT go in the URI query string; reject tokens minted for another audience; never forward a received token; 401 for invalid tokens, 403 for missing scope; short-lived access tokens [19]. Anthropic advises keeping login credentials away from computer-use models [4].
  Check: `curl -i` the MCP endpoint without a token — expect 401 with `WWW-Authenticate`; can an agent be granted less than full account access?
- **AGENT-36** Keep a human able to refuse tool calls: show which tools the model can use, mark visibly when one runs, show its inputs before the call, and ask for confirmation on sensitive operations [9].
  Check: (disposable only) trigger a destructive tool in the client or host UI; it must show the inputs and wait for approval, then decline it. Read-only: read the host's approval setting for that tool.
- **AGENT-37** Record agent actions in an audit log (an MCP client SHOULD log tool use for audit) and tie each entry to both the agent and the user it acted for [9].
  Check: (disposable only) act through the API/MCP, then find that action in the product's activity or audit log. Read-only: read the code that writes the audit entry; it must record both the agent and the user.
- **AGENT-38** Make agent output easy to hand over: a shareable result the user can claim into their own account in one step, as with Netlify's one-click site claiming [1].
  Check: (disposable only) after an agent creates something, can the human find it, claim it and take over without the agent? Read-only: read the docs or code for a claim or transfer flow.

## Measure

Each command below was checked against its documentation; none were run against a product here ("documented, not run here").

- Agent walk without vision: open the session with the guarded session block in SKILL.md step 3, then `snapshot` / `click` (and `fill`) under that session's name; refs come from the snapshot, each snapshot is saved as YAML, and `--boxes` adds bounding boxes [20]. Walk one top task from the snapshot alone, no screenshots. Each step where the control is missing, unnamed or ambiguous is an AGENT-1/2/3 finding; each step with no visible change is AGENT-7.
- Docs: `curl -sf https://<host>/llms.txt` and `curl -sf https://<host>/<page>.md` (AGENT-31, AGENT-32).
- CLI: `cmd </dev/null; echo $?` on a read command, `cmd --json | jq .`, `cmd >/dev/null` (only stderr remains), `cmd | cat` (no spinners); the destructive command's `--help` and `--dry-run`, and (disposable only) the command itself without `--force` and with stdin closed (AGENT-24-AGENT-28).
- API: `curl -i` a malformed read (bad parameter, unknown id) and read status, `Content-Type` and body (AGENT-20); (disposable only) the same with `curl -i -X POST <endpoint> -d '{bad}'`, a create repeated with one `Idempotency-Key` (AGENT-21), and a burst until 429 to read `Retry-After` (AGENT-22) — read-only: find the key handling and the rate limit in the code or OpenAPI description; call without credentials and expect 401 with `WWW-Authenticate` (AGENT-35).
- MCP: send `tools/list` (page with `cursor`) and audit names, descriptions, `inputSchema`, `outputSchema` and `annotations` (AGENT-11-19); call each read-only tool (by its code, not just `readOnlyHint`) with bad input and confirm `isError: true` with a fix-it message (AGENT-17); (disposable only) the write tools too — read-only: read their validation code.

## Sources

Credit: web.dev (Google), the Creative Commons Attribution 4.0 License (https://creativecommons.org/licenses/by/4.0/).
Credit: Command Line Interface Guidelines (clig.dev), the Creative Commons Attribution-ShareAlike 4.0 International License (https://creativecommons.org/licenses/by-sa/4.0/).
Credit: the WebMCP specification, Draft Community Group Report of 10 November 2026, under the W3C Community Contributor License Agreement (https://www.w3.org/community/about/process/cla/).
Credit: the Model Context Protocol specification (versions 2025-06-18 and 2025-11-25), the OpenAPI Specification v3.1.1, and the llms.txt proposal, the Apache License 2.0 (https://www.apache.org/licenses/LICENSE-2.0); MCP contributions not yet relicensed remain under the MIT License.

[1] Mathias Biilmann, "Introducing AX: Why Agent Experience Matters" (28 Jan 2025; practitioner blog post by Netlify's CEO, no research cited) — https://biilmann.blog/articles/introducing-ax/
[2] web.dev, Kasper Kulikowski & Omkar More, making sites work for AI agents — https://web.dev/articles/ai-agent-site-ux
[3] Microsoft, Playwright MCP README — https://github.com/microsoft/playwright-mcp
[4] Anthropic, Computer use tool — https://platform.claude.com/docs/en/agents-and-tools/tool-use/computer-use-tool
[5] W3C Web Machine Learning CG, WebMCP, Draft Community Group Report (10 Nov 2026) — https://webmachinelearning.github.io/webmcp/
[6] IETF, draft-ietf-webbotauth-httpsig-protocol-00, HTTP Message Signatures for Bots (Internet-Draft, Sep 2026) — https://www.ietf.org/archive/id/draft-ietf-webbotauth-httpsig-protocol-00.html
[7] Anthropic Engineering, "Writing effective tools for agents" — https://www.anthropic.com/engineering/writing-tools-for-agents
[8] Anthropic, Define tools (best practices for tool definitions) — https://platform.claude.com/docs/en/agents-and-tools/tool-use/define-tools
[9] Model Context Protocol spec 2025-11-25, Tools — https://modelcontextprotocol.io/specification/2025-11-25/server/tools
[10] Anthropic Engineering, "Building effective agents" (Appendix 2, prompt engineering your tools) — https://www.anthropic.com/engineering/building-effective-agents
[11] Model Context Protocol spec 2025-06-18, Schema reference (ToolAnnotations, CallToolResult) — https://modelcontextprotocol.io/specification/2025-06-18/schema
[12] RFC 9457, Problem Details for HTTP APIs — https://www.rfc-editor.org/rfc/rfc9457.html
[13] Stripe API, Idempotent requests — https://docs.stripe.com/api/idempotent_requests
[14] RFC 6585, Additional HTTP Status Codes (section 4, 429) — https://www.rfc-editor.org/rfc/rfc6585.html
[15] OpenAPI Specification 3.1.1 — https://spec.openapis.org/oas/v3.1.1.html
[16] Command Line Interface Guidelines — https://clig.dev/
[17] Jeremy Howard, The /llms.txt file (proposal, v2) — https://llmstxt.org/
[18] AGENTS.md (Agentic AI Foundation, Linux Foundation) — https://agents.md/
[19] Model Context Protocol spec 2025-06-18, Authorization — https://modelcontextprotocol.io/specification/2025-06-18/basic/authorization
[20] Microsoft, Playwright CLI README — https://github.com/microsoft/playwright-cli
