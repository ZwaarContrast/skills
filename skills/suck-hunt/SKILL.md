---
name: suck-hunt
description: SUCK hunt — sweep a codebase for everything that SUCKS and prove each find. Broken, insecure, untested, brittle, badly typed, lint-suppressed, dead, duplicated, overengineered, reinvented, slow, unreadable code; vulnerable or outdated dependencies, committed secrets, big files outside LFS, missing lint and format, a README that lies. Tools find the mechanical SUCK, reading finds the rest, and the reply is ranked findings a developer can pick up cold. Use to find what SUCKS, hunt tech debt or code smells, roast a codebase, or find what to delete. Reports in conversation; does not fix.
---

# SUCK hunt

Everyone knows their codebase has SUCK in it. Nobody can point at it, because
the person who wrote it has stopped seeing it. The hunt is making the SUCK
pointable: a file, a line, and a reason a stranger would agree with.

**A finding without evidence is an opinion.** "This module is overengineered"
is worthless. "`PaymentStrategyFactory` has one implementation and one caller,
`src/pay.ts:40`; inline it" is a finding.

**Taste is not SUCK.** A naming style you would not have picked, a pattern
that is merely unfamiliar — leave it. SUCK costs something: bugs, time to
read, time to change, fear of touching it. If you cannot name the cost, it is
not a finding.

**It is always SUCK, in capitals.** Every time the word appears in what you
say — "hunting for SUCK", "this module SUCKS", "the worst SUCK" — it is
shouted. Everything around it stays plain and precise.

## 1. Ground rules

Default to the whole repository; ask only if that is genuinely ambiguous.
Skip generated code, vendored dependencies, lockfiles, fixtures, and build
output. Record `git rev-parse --short HEAD` and whether the tree is dirty —
with uncommitted changes, line numbers are true for "HEAD + uncommitted
changes", and the report says so. Learn the stack: language, runtime
versions it supports, test runner, and what is already in the dependency
manifest.

**One hunt directory holds everything.** Make it first, and snapshot the
repository's state into it:

```
H=$(mktemp -d) && git status --porcelain --ignored > "$H/before" && echo "$H"
```

Every tool writes its output to a file in `$H`, never to the conversation:
count first (`wc -l "$H"/*.txt`), then `grep`, `head` or `sort` what you
need. A count of 3,000 is itself a finding; reading all 3,000 lines is not.
Each shell call starts fresh, so use the printed path literally or start the
call with `H=<path>;`. Subagents get the path too and read the same files
instead of rerunning the tools. The commands are bash and full of quotes; rather than
retyping them for another shell, paste a block into `"$H/run.sh"` and run
`H=<path> bash "$H/run.sh"`.

**The repository is read-only.** At the end, compare a fresh `git status
--porcelain --ignored` against `$H/before`, delete only the paths that are new
— including a `target/`, `node_modules/` or `vendor/` the hunt created. Keep `$H` itself:
it holds every finding and every raw tool hit, and the report points at it.
Delete only the scratch copy inside it. To see what happens *without*
something — a suppression, a cast — change a throwaway copy, never the
repository:

```
mkdir "$H/copy" && git archive HEAD | tar -x -C "$H/copy"
```

**Running project code is not free.** Tests, coverage, the entry point and
bug reproductions all execute it. Read what will run first. Run it only if
it is self-contained: nothing that migrates or seeds a database the run did
not create, calls a real external service, sends mail, deploys, or starts a
server that stays up. Give it `TMPDIR="$H/tmp"` so leftovers land in the
hunt directory (and `PYTHONDONTWRITEBYTECODE=1` for Python), and stop it
after ten minutes — the shell tool's timeout, or `timeout 600` where it
exists. What cannot run safely is "not run" in the report header, with the
reason; a skipped suite is an honest result, a wiped dev database is not.

**The hunt fetches its tools.** The commands below download and run
well-known tools through `npx`, `uvx` and `go run`, and PHP's through
`composer` into `$H` — nothing is added to the
project. Report the version of each one the project does not pin: `npx`,
`uvx` and composer tools print it with `--version`, and `go list -m <module>@latest`
names the version `go run …@latest` resolved — the binaries themselves often
say "dev". osv-scanner
sends package names and versions, not code, to osv.dev; if even the
dependency list is confidential, ask first.

## 2. Let the instruments speak first

Tools find the mechanical SUCK exhaustively, so reading can go to the rest.
Run the **every project** set, then the section for each language the
project uses. Replace `<src>` with the source directories. A tool's output
is a lead, not a finding: everything goes through step 4.

### Every project

```
npx -y jscpd@5 --reporters ai --min-tokens 25 --ignore-identifiers <src> > "$H/clones.txt" 2>&1
npx -y jscpd@5 --reporters ai --similarity 0.85 <src> > "$H/near-clones.txt" 2>&1   # JS/TS only
npx -y jscpd@5 --dead-code --reporters ai . > "$H/dead.txt" 2>&1                    # JS/TS/Python
git log --since=1.year --format= --name-only | grep . | sort | uniq -c | sort -rn | head -30 > "$H/churn.txt"
git ls-files <src> | xargs wc -l | sort -rn | head -15 > "$H/big-files.txt"
uvx lizard -w <src> > "$H/complexity.txt" 2>&1; uvx lizard <src> | tail -3 >> "$H/complexity.txt"
grep -rnE 'verify=False|rejectUnauthorized: *false|InsecureSkipVerify: *true|shell=True|\beval\(|new Function\(|pickle\.loads?\(|yaml\.load\(|innerHTML *=|dangerouslySetInnerHTML|\bunsafe *\{' <src> > "$H/security.txt"
grep -rnE 'console\.(log|debug)\(|debugger;|\bdbg!\(|breakpoint\(\)|pdb\.set_trace|^\s*print\(|fmt\.Print(ln|f)?\(' <src> > "$H/debug.txt"
grep -rnE 'eslint-disable|oxlint-disable|biome-ignore|stylelint-disable|@ts-ignore|@ts-expect-error|@ts-nocheck|noqa|type: ?ignore|pyright: ?ignore|mypy: ?ignore-errors|pylint: ?disable|#!?\[(allow|expect)\(|//\s*nolint|//lint:ignore|#nosec|\.skip\(|xit\(|todo!|unimplemented!' <src> > "$H/suppressions.txt"
grep -rnE 'continue-on-error: *true|allow_failure: *true|\|\| *true' .github .gitlab-ci.yml .circleci > "$H/ci.txt" 2>/dev/null
go run github.com/google/osv-scanner/v2/cmd/osv-scanner@latest scan source -r -f markdown . > "$H/osv.md" 2>/dev/null
go run github.com/zricethezav/gitleaks/v8@latest git --no-banner --redact -f csv -r "$H/secrets.csv" . 2>/dev/null
git ls-files -ci --exclude-standard > "$H/tracked-ignored.txt"
git ls-tree -r -l HEAD | sort -k4 -rn | head -20 > "$H/big-blobs-now.txt"
git rev-list --objects --all | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' | awk '$1=="blob" && $3 > 1048576 {print $3, $4}' | sort -rn | head -20 > "$H/big-blobs-history.txt"
[ -f README.md ] && grep -oE '\]\([^)#:]+\)' README.md | sed 's/](\(.*\))/\1/' | while read f; do [ -e "$f" ] || echo "dead link: $f"; done > "$H/readme-links.txt"
git ls-files '*.sh' '*.bash' | xargs uvx --from shellcheck-py shellcheck -f gcc > "$H/shellcheck.txt" 2>&1   # only if any are listed
```

What the list needs to be read correctly:

- **jscpd** is pinned to `@5`: a project's own jscpd 4 has none of these
  flags, and `npx` would pick it first. The defaults miss the copy that was
  renamed or already drifted, which is the one that matters; these flags
  catch it. Outside JS/TS there is no near-clone pass, so a copy that drifted
further only turns up in reading. Ignore clones inside tests unless they are
large. `--semantic`
  finds the same logic in different words but downloads a 548 MB model — ask
  first. Dead code is scanned from `.` so the tests count as importers;
  report paths relative to the repository root.
- **Entry points decide dead code.** Scripts, CLIs, tests, framework routes,
  anything named in a manifest, and anything loaded by a name built at
  runtime (``import(`./handlers/${kind}.ts`)``) are entry points, and so is
the exported API of a package others import. A tool that
  does not know one reports it as unused. When the output is nonsense — half
  the repository "unused" — say the tool did not run; never report the noise.
- **Churn counts commits, not change.** `git show --stat` a few of a hot
  file's commits before trusting it: a "fix" that only touched a comment
  fixed nothing, and the bug it names may still be there. Add
  `--grep='^fix'` for fix-churn only if the project uses Conventional
  Commits.
- **The greps are leads.** Output that *is* the product — a CLI printing its
  result — is not a debug leftover. `cmd || true` in a cleanup step is
  normal; in a test or lint step it is a CI that cannot fail.
- **Secrets never reach the conversation.** `--redact` keeps values out of
  the file; the report names file, commit and kind of secret, never the
  value.
- **Big files:** check `.gitattributes` for `filter=lfs` first — a file
  already in LFS is a tiny pointer. A binary over about 1 MB (images, video,
  archives, models, datasets) outside LFS is a finding; one that only lives in
  history still makes every clone pay for it. Big text files are not LFS
  material.
- **Lint and format:** look for the project's config — `eslint.config.*` or
  `.eslintrc*`, `biome.json`, `.oxlintrc.json`, `.prettierrc*`, `[tool.ruff]`
  in `pyproject.toml`, `phpstan.neon*`, `phpcs.xml*`, `.php-cs-fixer*.php`,
  `pint.json`, `.stylelintrc*` — and for a script or CI job that runs it. Rust and Go
  ship theirs; the language sections check them.
- **README:** every command it tells you to run (`npm run x`, `make x`,
  `just x`) must exist in `package.json`, the `Makefile` or the `justfile`.
  Whether its setup steps work end to end is the `cold-start` skill's job.
- **Start it the way its users do,** once, under the rules in step 1: import
  the package's entry point with the project's own runtime flags on the
  oldest and newest runtime it claims to support, and run the binary with no
  arguments and with `--help`. A package that cannot load is the worst SUCK
  there is, and no linter reports it. When the entry point will not load,
  reproduce other bugs through the module that holds them.
- **Coverage:** the project's own coverage command if the tests may run,
  with its output pointed into `$H`. Without one: `node --test
  --experimental-test-coverage` prints and writes nothing;
  `COVERAGE_FILE="$H/.coverage" uvx coverage run --source=<pkg> -m pytest`
  (or `-m unittest`) with the project's dependencies available; for PHP,
  `XDEBUG_MODE=coverage vendor/bin/phpunit --coverage-text` with Xdebug or
  PCOV loaded. Otherwise, a
  source file no test imports is untested.
- **ast-grep** searches by syntax tree, so it finds shapes, not strings. The
  language sections have starters. When reading turns up a smell, write a
  pattern: if it is in one place, the pattern finds every other place.

### JavaScript / TypeScript

```
npx -y knip --no-exit-code > "$H/knip.txt" 2>&1
npx -y knip --production --no-exit-code > "$H/knip-prod.txt" 2>&1
npx -y madge --circular --extensions ts,tsx,js <src> > "$H/cycles.txt" 2>&1
npx -y oxlint@latest -f agent <src> > "$H/oxlint.txt" 2>&1
npx -y oxlint@latest -f agent -A all -D no-await-in-loop -D no-eval -D no-implied-eval -D no-new-func <src> > "$H/oxlint-perf-sec.txt" 2>&1
npx -y -p oxlint@latest -p oxlint-tsgolint@latest oxlint --type-aware -f agent -A all -D typescript/no-unnecessary-type-assertion -D typescript/no-non-null-assertion -D typescript/no-unsafe-assignment -D typescript/no-unsafe-member-access -D typescript/no-unsafe-return -D typescript/no-unsafe-argument -D typescript/no-unsafe-call <src> > "$H/oxlint-types.txt" 2>&1
npx -y oxlint@latest -f agent --report-unused-disable-directives <src> > "$H/stale-disables.txt" 2>&1
npx -y -p typescript tsc --noEmit -p . --pretty false > "$H/tsc.txt" 2>&1
npx -y -p typescript tsc --noEmit -p . --strict --pretty false > "$H/tsc-strict.txt" 2>&1   # if tsconfig is not strict
grep -rnE ':\s*any\b|as any|<any>' <src> > "$H/any.txt"
grep -rnE 'as unknown\)? as ' <src> > "$H/double-casts.txt"
npx -y -p @ast-grep/cli ast-grep run -l ts -p 'JSON.parse($$$) as $T' <src> > "$H/unchecked-input.txt"
npx -y -p @ast-grep/cli ast-grep run -l ts -p 'try { $$$ } catch ($E) { }' <src> > "$H/swallowed.txt"
npx -y -p @ast-grep/cli ast-grep run -l ts -p 'JSON.parse(JSON.stringify($X))' <src> > "$H/deep-clone.txt"
npx -y -p @ast-grep/cli ast-grep run -l ts -p 'new Promise($$$A => setTimeout($$$))' <src> > "$H/sleeps.txt"
npx -y npm-check-updates > "$H/outdated.txt" 2>&1
npm audit --package-lock-only > "$H/audit.txt" 2>&1
```

- knip also reads `package.json`: dependencies nothing imports, imports of
  packages that are not listed. It finds `main`, `bin`, scripts and most
  framework entry points on its own.
- The type-aware oxlint run answers against the project's `tsconfig`. With
  dependencies not installed, every imported type is `any` and its
  `no-unsafe-*` rules are noise — drop them then.
- A file-wide `/* eslint-disable */` hides the file from oxlint too: lint the
  scratch copy with the disable removed. oxlint judges stale disables by its
  own rules; if the project has eslint, `npx -y eslint
  --report-unused-disable-directives <src>` is the authority.
- `tsc` never reports a `@ts-ignore` that suppresses nothing;
  `@ts-expect-error` does, which makes the swap the usual fix. Delete one in
  the scratch copy to see what it hides. Without `@types/node`, every `node:`
  import fails `tsc` — one finding, not dozens.

### Python

```
uvx ruff check --no-cache --output-format concise --select ERA,F401,F841,C901,RUF100 . > "$H/ruff-dead.txt" 2>&1
uvx ruff check --no-cache --output-format concise --select B,SIM,RUF,S,PERF . > "$H/ruff-practice.txt" 2>&1
uvx ruff check --no-cache --statistics --select ANN,PGH003 . > "$H/ruff-typing.txt" 2>&1
uvx ruff format --check --no-cache --output-format concise . > "$H/format.txt" 2>&1
uvx vulture --min-confidence 80 <src> tests > "$H/vulture.txt" 2>&1
uvx deptry . > "$H/deptry.txt" 2>&1
uvx mypy --no-incremental --cache-dir=/dev/null --ignore-missing-imports --warn-redundant-casts --warn-unused-ignores <src> > "$H/mypy.txt" 2>&1
uv tree --outdated --depth 1 --frozen > "$H/outdated.txt" 2>&1   # uv projects; --frozen keeps uv.lock untouched
```

`S` is bandit's rule set and `PERF` ruff's performance rules. Without the
dependencies installed, deptry cannot map import names to packages (`yaml`
is `pyyaml`) and reports both "missing" and "unused" — refute those before
reporting them.

### Rust

```
cargo clippy -q --message-format=short -- -W clippy::pedantic > "$H/clippy.txt" 2>&1
cargo check -q --message-format=json 2>/dev/null | npx -y jscpd@5 --dead-code --rust-diagnostics - --reporters ai <src> > "$H/dead-rust.txt" 2>&1
cargo clippy -q --message-format=short -- -A clippy::all -W clippy::allow_attributes -W clippy::allow_attributes_without_reason > "$H/allows.txt" 2>&1
npx -y -p @ast-grep/cli ast-grep run -l rust -p '$X.unwrap()' <src> > "$H/unwraps.txt"
grep -rnE 'Result<[^>]*, ?String>' <src> > "$H/string-errors.txt"
cargo fmt --check -- -l > "$H/format.txt" 2>&1
cargo update --dry-run --verbose > "$H/outdated.txt" 2>&1
D=$(mktemp -d) && cargo install -q --root $D cargo-machete && $D/bin/cargo-machete > "$H/unused-deps.txt" 2>&1; rm -rf $D
```

Let cargo use the project's `target/`: a fresh one rebuilds every
dependency. clippy's default set covers correctness, performance and best
practice; pedantic adds noise — keep the lints that name a cost. `manual_*`
is **reinvented**, `needless_*` and `redundant_*` **overengineered**,
`cast_*` a numeric cast that truncates or wraps (**typing**). Every
`unwrap()` outside tests is a panic nobody decided on. `allow_attributes`
lists every `#[allow]`; a crate- or module-wide `#![allow]` shows up only
under the second lint. Each wants to be `#[expect(…, reason = "…")]`, which
warns the moment it is no longer needed — change it in the scratch copy and
run clippy there to see whether it still hides anything. `cargo machete`
has no `npx`, so it builds into a throwaway directory (about a minute);
leave off `--with-metadata`, which rewrites `Cargo.lock`. `"Unchanged x
(available: y)"` from `cargo update` is a major version behind. Coverage, if
installed: `CARGO_LLVM_COV_TARGET_DIR="$H/cov" cargo llvm-cov --summary-only`.

### Go

```
go vet ./... > "$H/vet.txt" 2>&1
go run honnef.co/go/tools/cmd/staticcheck@latest ./... > "$H/staticcheck.txt" 2>&1
go run golang.org/x/tools/cmd/deadcode@latest ./... > "$H/deadcode.txt" 2>&1
go run github.com/securego/gosec/v2/cmd/gosec@latest -quiet -fmt golint ./... > "$H/gosec.txt" 2>&1
go run golang.org/x/vuln/cmd/govulncheck@latest ./... > "$H/govulncheck.txt" 2>&1
grep -rnE 'interface\{\}|\bany\b' --include='*.go' . > "$H/any.txt"
gofmt -l . > "$H/format.txt"
go list -m -u all > "$H/outdated.txt" 2>&1
```

`go run …@latest` builds into the module cache, not the repository.
staticcheck's `U1000` is dead code and `SA*` bugs; gosec also reports
ignored errors, and it honours `#nosec`, not `//nolint` — a `//nolint:gosec`
only means something where golangci-lint runs. `deadcode` traces from
`main`, so in a library package every exported function looks unreachable:
that is API, not dead code. govulncheck goes further than osv-scanner: it
reports only vulnerabilities the code actually reaches, the standard
library's included — a toolchain behind its patch release shows up here and
nowhere else. Drop the `any` hits that sit in comments.

### PHP

```
P="$H/php" && mkdir -p "$P" && composer require -q -d "$P" --no-plugins phpstan/phpstan:^2 shipmonk/dead-code-detector friendsofphp/php-cs-fixer icanhazstring/composer-unused maglnet/composer-require-checker
composer install --no-scripts --no-plugins --no-interaction -q   # only if vendor/ is missing
composer validate --strict --no-check-publish > "$H/composer-validate.txt" 2>&1
composer audit --locked > "$H/audit.txt" 2>&1
composer outdated --direct --locked > "$H/outdated.txt" 2>&1
"$P/vendor/bin/composer-unused" --no-progress > "$H/unused-deps.txt" 2>&1
"$P/vendor/bin/composer-require-checker" check > "$H/missing-deps.txt" 2>&1
"$P/vendor/bin/phpstan" analyse --no-progress --error-format=raw <src> > "$H/phpstan.txt" 2>&1
"$P/vendor/bin/phpstan" analyse --no-progress --error-format=raw -l max <src> > "$H/phpstan-max.txt" 2>&1
printf 'includes:\n  - %s/vendor/shipmonk/dead-code-detector/rules.neon\n' "$P" > "$H/dead.neon"
"$P/vendor/bin/phpstan" analyse --no-progress --error-format=raw -c "$H/dead.neon" -l 0 <src> tests > "$H/dead-php.txt" 2>&1
"$P/vendor/bin/php-cs-fixer" check --using-cache=no --show-progress=none --rules=@PER-CS <src> > "$H/format.txt" 2>&1
grep -rnE '\b(unserialize|extract|shell_exec|exec|system|passthru|proc_open|popen|create_function)\(|SSL_VERIFY(PEER|HOST)[^;]*(false|0)|\b(md5|sha1)\(' --include='*.php' <src> > "$H/security-php.txt"
grep -rnE '\b(var_dump|print_r|var_export|dd|dump|ray)\(' --include='*.php' <src> > "$H/debug-php.txt"
grep -rnE '@phpstan-ignore|@psalm-suppress|phpcs:(ignore|disable)|@codingStandardsIgnore|(^\s*|[=(,!] *)@[a-z_\\]+\(' --include='*.php' <src> > "$H/suppressions-php.txt"
grep -hE '^\s+count: [0-9]+' phpstan-baseline.neon 2>/dev/null | awk '{s+=$2} END {print s+0, "errors in phpstan-baseline.neon"}' > "$H/baseline.txt"
npx -y -p @ast-grep/cli ast-grep run -l php -p 'try { $$$ } catch ($$$) { }' <src> > "$H/swallowed-php.txt"
```

Every tool goes into `$H/php`; `--no-plugins` keeps composer plugins from
running. The tools that read the project's classes need its `vendor/`:
`--no-scripts --no-plugins` installs it without running project code, and
the `vendor/` (and a `composer.lock` a library did not have) is new, so step
1 deletes it. If the local PHP is not the one `composer.json` requires,
add `--ignore-platform-reqs` — analysis only, say so in the report.

- **PHPStan** picks up the project's `phpstan.neon(.dist)` on its own; with
  none it runs at level 0. If the project ships its own PHPStan, use its
  `vendor/bin/phpstan` for the first run — its config and extensions are
  written for that version. The `-l max` run is the **typing** lead list:
  group it by message ("no value type specified in iterable type array",
  "mixed given") rather than reading it line by line. A
  `phpstan-baseline.neon` is a suppression file; its total is the count of
  errors the project decided to stop seeing.
- **Dead code** (shipmonk) knows Symfony, Doctrine and PHPUnit entry
  points, not a DI container wired by config, routes in a closure file or a
  callback named in a string. Expect controllers and actions to show up
  unused; step 4 refutes them.
- **php-cs-fixer** with `@PER-CS` only stands in when the project has no
  formatter of its own. If it has `.php-cs-fixer(.dist).php`, `pint.json`
  or `phpcs.xml(.dist)`, run that through its `vendor/bin` instead: failing
  it is **no guard rails**; disagreeing with PER-CS is taste. Its warning
  about the PHP version is noise.
- **composer-require-checker:** a class from a package the project does
  not require is a real finding — it works until that dependency drops it.
  So is an `ext-*` used and not required.
- **The `@` grep** finds the error-suppression operator (`@unlink($f)`).
  `md5`/`sha1` is a finding on passwords and tokens only, not on cache keys.
- **Laravel:** without `larastan/larastan` PHPStan drowns in facades and
  magic properties. Larastan boots the application, which runs project code
  — step 1 decides.

### WordPress

On top of PHP. WordPress core, and the plugins and themes the project did
not write, are vendored: skip their code, but list their versions. Run this
as one script (the function does not survive a fresh shell):

```
P="$H/php"; composer require -q -d "$P" --no-plugins wp-coding-standards/wpcs:^3 phpcompatibility/phpcompatibility-wp:* szepeviktor/phpstan-wordpress
V="$P/vendor"
wpcs() { "$V/bin/phpcs" --runtime-set installed_paths "$V/wp-coding-standards/wpcs,$V/phpcsstandards/phpcsutils,$V/phpcsstandards/phpcsextra,$V/phpcompatibility/php-compatibility,$V/phpcompatibility/phpcompatibility-paragonie,$V/phpcompatibility/phpcompatibility-wp" -q --report=emacs --extensions=php --ignore="*/wp-config*.php" "$@"; }
wpcs --standard=WordPress --sniffs=WordPress.Security.EscapeOutput,WordPress.Security.NonceVerification,WordPress.Security.ValidatedSanitizedInput,WordPress.Security.SafeRedirect,WordPress.Security.PluginMenuSlug,WordPress.DB.PreparedSQL,WordPress.DB.PreparedSQLPlaceholders,WordPress.WP.Capabilities <src> > "$H/wp-security.txt"
wpcs --standard=WordPress --sniffs=WordPress.PHP.DontExtract,WordPress.PHP.NoSilencedErrors,WordPress.PHP.RestrictedPHPFunctions,WordPress.PHP.DiscouragedPHPFunctions,WordPress.PHP.DevelopmentFunctions,WordPress.PHP.StrictInArray,Universal.Operators.StrictComparisons,Universal.Operators.DisallowShortTernary,Generic.CodeAnalysis.AssignmentInCondition,WordPress.CodeAnalysis.AssignmentInTernaryCondition,Generic.PHP.BacktickOperator,Generic.PHP.DisallowShortOpenTag,Generic.PHP.DiscourageGoto,Squiz.PHP.Eval,WordPress.DB.DirectDatabaseQuery,WordPress.DB.RestrictedFunctions,WordPress.DB.SlowDBQuery,WordPress.WP.PostsPerPage,WordPress.WP.AlternativeFunctions,WordPress.WP.DeprecatedFunctions,WordPress.WP.DeprecatedClasses,WordPress.WP.DeprecatedParameters,WordPress.WP.DiscouragedFunctions,WordPress.WP.EnqueuedResources,WordPress.WP.GlobalVariablesOverride <src> > "$H/wp-practice.txt"
wpcs --standard=PHPCompatibilityWP --runtime-set testVersion 7.4- <src> > "$H/php-compat.txt"   # the oldest PHP the plugin or theme claims
printf 'includes:\n  - %s/szepeviktor/phpstan-wordpress/extension.neon\n' "$V" > "$H/wp.neon"
printf '  - %s/szepeviktor/phpstan-wordpress/extension.neon\n' "$V" >> "$H/dead.neon"
grep -rnE 'register_rest_route|permission_callback|wp_ajax_(nopriv_)?|admin_post_(nopriv_)?' --include='*.php' <src> > "$H/wp-endpoints.txt"
grep -rnE 'add_(action|filter)\([^,]+, *(function|fn|static)\b' --include='*.php' <src> > "$H/wp-closure-hooks.txt"
grep -lE 'Plugin Name:|Theme Name:' wp-content/plugins/*/*.php wp-content/themes/*/style.css 2>/dev/null | xargs grep -HiE '^\s*\*?\s*Version:' > "$H/wp-versions.txt"
grep -nE "DISALLOW_FILE_(EDIT|MODS)|WP_DEBUG|SCRIPT_DEBUG|table_prefix|_(KEY|SALT)'|DB_(USER|PASSWORD)" wp-config*.php > "$H/wp-config.txt" 2>/dev/null
git ls-files | grep -E '(^|/)(debug\.log|wp-config\.php|\.htaccess|[^/]*\.sql(\.gz)?)$' > "$H/wp-files.txt"
grep -rnE 'chmod +(-R +)?[0-7]?77' $(git ls-files '*.sh' '*.yml' '*.yaml' Makefile Dockerfile 2>/dev/null) > "$H/wp-perms.txt" 2>/dev/null
```

Without stubs PHPStan reports every WordPress function as unknown: rerun
the PHP block's PHPStan commands, adding `-c "$H/wp.neon"` to the first two
unless the project's own config already includes `phpstan-wordpress`.

- **The security sniffs are leads to demonstrate.** A missing nonce matters
  on a handler that changes state; output already escaped by a template
  function is a false positive. A REST route with `permission_callback =>
  '__return_true'` that writes, or a `wp_ajax_nopriv_` handler that writes
  without `current_user_can`, is **insecure**, band fire.
- **The practice sniffs** are the rules from the WordPress PHP standard that
  cost something. `AlternativeFunctions` is **reinvented** (`curl_*` where
  `wp_remote_get` is, `json_encode` over `wp_json_encode`);
  `DirectDatabaseQuery`, `SlowDBQuery` and `PostsPerPage` (`-1`, everything
  at once) are **performance** — give the size; `DevelopmentFunctions` is
  **debug leftovers**; `Deprecated*` is **dependencies behind**.
- **Closures as hooks** cannot be removed with `remove_action` — a finding
  in a plugin or theme others extend, not in a site's own glue.
- **Style is taste unless the project chose it.** Tabs, spacing, Yoda
  conditions, `array()` — the WordPress standard has opinions, but without
  a `phpcs.xml(.dist)` naming WordPress they are not SUCK. With one, run
  `wpcs` with that ruleset: failing it is **no guard rails**.
- **Dead code:** a callback named in a string (`add_action( 'init',
  'my_init' )`), a shortcode, a template file loaded by name — all entry
  points. Grep the name before believing shipmonk.
- **Hardening**, from the WordPress hardening guide, as far as a repository
  shows it: real keys, salts or `DB_PASSWORD` committed are **secrets**;
  the sample's `put your unique phrase here` left in is **broken** — every
  such site shares its salts. `WP_DEBUG_DISPLAY` on, or a `debug.log` in the
  tree, leaks paths and queries. No `DISALLOW_FILE_EDIT` lets one stolen
  admin login edit PHP. A tracked `.htaccess` should deny `wp-config.php`
  and block PHP in `wp-includes/`, outside the `# BEGIN WordPress` markers
  WordPress rewrites. `chmod 777` in a deploy script, an `admin` user in a
  SQL seed, a plugin that runs PHP stored in the database (Code Snippets,
  Insert PHP) are findings; the default `wp_` table prefix is a weak one,
  with fix risk high on a live database.
- **Plugin versions:** osv-scanner and `composer audit` do not know
  WordPress.org plugins unless they come through `wpackagist` with
  advisories. Check `wp-versions.txt` against WPScan or Wordfence
  Intelligence — both want an account and receive the plugin list, so ask
  first. A plugin nobody can say is still used is **dead**.
- **JavaScript and CSS** go through their own sections. A project on
  `@wordpress/scripts` runs `wp-scripts lint-js` and `lint-style` with
  WordPress's configs; failing them is **no guard rails**. The accessibility
  standard is WCAG 2.2 AA: an image without `alt` or a field without a label
  in a template is **broken** for the people who need it — a full audit is
  not this hunt.

### CSS

```
cat > "$H/stylelint.json" <<'EOF'
{ "rules": {
  "block-no-empty": true, "color-no-invalid-hex": true, "declaration-block-no-duplicate-properties": true,
  "declaration-block-no-shorthand-property-overrides": true, "declaration-no-important": true,
  "font-family-no-missing-generic-family-keyword": true, "function-no-unknown": true, "max-nesting-depth": 3,
  "no-descending-specificity": true, "no-duplicate-at-import-rules": true, "no-duplicate-selectors": true,
  "no-invalid-double-slash-comments": true, "property-no-unknown": true, "property-no-vendor-prefix": true,
  "selector-max-compound-selectors": 3, "selector-max-id": 0, "selector-no-qualifying-type": true,
  "selector-pseudo-class-no-unknown": true, "selector-pseudo-element-no-unknown": true,
  "selector-type-no-unknown": [true, { "ignore": ["custom-elements"] }], "unit-no-unknown": true, "value-no-vendor-prefix": true
} }
EOF
npx -y -p stylelint@16 -p postcss-scss stylelint --custom-syntax postcss-scss --config "$H/stylelint.json" --report-needless-disables --formatter unix '<src>/**/*.{css,scss}' > "$H/stylelint.txt" 2>&1
npx -y purgecss@6 --css '<src>/**/*.css' --content '<templates>' --rejected 2>/dev/null | node -e 'for (const r of JSON.parse(require("fs").readFileSync(0))) console.log(r.file + ": " + r.rejected.join(", "))' > "$H/unused-css.txt"
grep -rhoiE '#[0-9a-f]{3,8}\b|(rgb|hsl)a?\([^)]*\)' --include='*.css' --include='*.scss' <src> | tr 'A-F' 'a-f' | sort | uniq -c | sort -rn > "$H/colors.txt"
grep -rnoE 'z-index: *-?[0-9]+' --include='*.css' --include='*.scss' <src> > "$H/z-index.txt"
grep -rhoE '@media[^{]+' --include='*.css' --include='*.scss' <src> | sort | uniq -c | sort -rn > "$H/breakpoints.txt"
```

- **stylelint** runs this config, not the project's: core rules only, each
  naming a cost — a duplicate property or selector is one the next edit
  misses, an ID or a four-deep selector starts a specificity war that
  `!important` finishes. If the project has its own stylelint config, run
  it too; failing it is **no guard rails**. `--report-needless-disables` is
  **stale**. For Less, swap `postcss-scss` for `postcss-less`.
- **Vendor prefixes** written by hand are **dead weight** when Autoprefixer
  or a `browserslist` is set up, and wrong for the next browser when not.
- **purgecss** lists selectors no file in `<templates>` mentions. Give it
  everything that can name a class: HTML, templates, JS, JSX, PHP, Markdown.
  A class built at runtime (`'is-' + state`), added by a CMS editor or a
  third-party script, or one of WordPress's (`.wp-block-*`, `.alignwide`)
  looks unused — grep the stem before calling it **dead**.
- **Colours, z-index, breakpoints** are counts, not findings. Forty hex
  values for what is six colours, the same one repeated in thirty places, a
  `z-index` ladder up to 99999, breakpoints at 767, 768 and 769px: the
  finding is the change that must be made in many places (**duplicate**) or
  the next one that will escalate (**brittle**).
- **Duplicates** across stylesheets come from jscpd, which reads CSS and
  SCSS.

## 3. Hunt

Nobody can read a whole codebase, so read where SUCK costs most first: files
high on churn, low on coverage, and high on complexity, then the files the
tools pointed at. Without coverage numbers, "low on coverage" means no test
imports the file. Work down that list until new files stop turning up
findings, and keep count — the report says what was covered and what was
not.

On a large codebase, fan out by **area** — a directory or a cluster of
hotspots per subagent — with each subagent hunting every category below,
given `$H` and the ground rules. Splitting by category instead makes every
subagent read everything and misses the code that is three kinds of SUCK at
once. Merge findings about the same code into one.

The categories, grouped by the band they usually land in (step 5):

**Usually fire**

- **Broken** — bugs you can demonstrate: wrong conditions, off-by-ones,
  unhandled rejections, resource leaks, races, error paths that crash, a
  package that will not load.
- **Insecure** — the obvious kind: input reaching a shell, SQL, `eval` or a
  template unescaped; TLS verification off; unsafe deserialization
  (`pickle`, `yaml.load`, `unserialize`); a WordPress handler with no nonce or
  capability check; secrets in logs; checks only the client enforces.
  Demonstrate it like a bug. This is the obvious layer, not an audit — that
  is the `security-review` and `red-blue` skills.
- **Secrets** — a key, token or password in the tree or anywhere in history.
  The fix starts with rotating it: deleting it from history does not
  un-leak it.
- **Vulnerable dependencies** — a known vulnerability with a fixed version
  out, in something that ships.
- **Untested** — logic with branches and no test that fails when it breaks.
  Weight it: an untested money, auth or parsing path beats an untested
  getter. Tests that assert nothing count as untested.

**Usually slow**

- **Brittle** — breaks when something nearby changes: order-dependent setup,
  matching on error-message strings, hard-coded paths and ports, `sleep` to
  wait for readiness, tests that assert on implementation, shared mutable
  state, catch-all handlers that swallow and carry on, circular imports.
- **Performance** — the obvious kind, visible in the code: a query or HTTP
  call per item (N+1), `await` in a loop where the calls are independent, a
  list searched inside a loop over another list, the whole file rewritten on
  every append, everything loaded to use a page of it, a cache that only
  grows. A loop is only as slow as what it loops over, so every performance
  finding states the size: where the items come from, how many there
  realistically are, and the cost at that size — "one HTTP call per note: at
  1,000 notes, 1,000 round trips, a minute of waiting". A nested loop over
  five items is not a finding. Measuring a running app is `crash-test`.
- **Typing** — types that stopped checking or started lying: `any`, `Any`,
  `interface{}`; functions with no types; strict mode off; casts that change
  nothing or silence a real mismatch (`as unknown as`, `cast()`); `!` on a
  value that can be null; outside data cast straight to a type
  (`JSON.parse(body) as User` is a promise nobody checked); `string` where a
  union or enum fits; errors typed as strings. The cost is the bug the type
  would have caught.
- **Suppressed** — a rule switched off instead of obeyed. Worst first: a
  whole file or crate (`/* eslint-disable */`, `@ts-nocheck`,
  `#![allow(clippy::all)]`, `# mypy: ignore-errors`, a PHPStan
  baseline); a blanket one naming no rule (`# noqa`, `//nolint`, `# type: ignore`); one that no longer
  suppresses anything; one hiding a real error. Look for the reason first —
  a comment beside it, `reason = "…"`, the commit that added it. A named
  rule on one line with a reason that still holds is a decision, not a
  finding. The fix is to satisfy the rule; if the rule is wrong for the
  project, say so once in the config, not in forty files.
- **Against best practice** — breaking the language's idioms where its
  recommended linter or official docs say why: files not closed, mutable
  default arguments, `==` where `===` is meant, errors ignored, blocking
  calls in async code. Style rules (`Path.open()` over `open()`, quote
  style) are taste.
- **No guard rails** — no linter or formatter, or one nobody runs; code that
  fails its own formatter; CI that cannot fail (`continue-on-error`,
  `|| true`, `allow_failure`). Setting up lint and format is effort S and
  often the cheapest win in the report.
- **Duplicate** — the same logic twice, found by jscpd or by reading. Two
  copies that must change together are the finding; two that merely look
  alike are not.
- **Overengineered / YAGNI** — an interface with one implementation, a
  factory for one product, a plugin system with one plugin, config for a
  value that never changes, generics nobody varies, layers that only
  forward calls, scaffolding for a "later" that never came.
- **Unreadable** — names that lie (`getUser` that writes), boolean
  parameters that make call sites cryptic, magic numbers, nesting past three
  levels, functions too long to hold in your head, files nobody reads whole.
  Name the misread it invites.
- **Dependencies behind** — a major version behind, or a lockfile missing
  from an application.
- **README** — missing, a title and nothing else, commands that do not
  exist, dead links, features that are not there, a different program.
- **Hygiene** — files tracked that `.gitignore` excludes (a committed `.env`
  is a **secret** too), build output in git, binaries that belong in LFS.
  Moving them out of history means rewriting it: fix risk high, and the team
  agrees first.

**Usually dead weight**

- **Dead** — what the dead-code tools report and survives step 4; flags
  stuck on one value, commented-out code, unreachable branches, config
  nobody reads.
- **Reinvented** — hand-rolled date maths, retries, deep clone, arg parsing,
  CSV, debounce, validation: anything the stdlib, the platform or a
  dependency already in the manifest does. Name the replacement exactly;
  suggest a new dependency only when the hand-rolled one is large, buggy or
  both.
- **Comment SUCK** — comments that restate the code, essays where a name
  would do, docblocks that repeat the signature or contradict the code,
  TODOs older than a year (`git blame` dates them), changelogs in source. A
  comment that says *why* is not SUCK.
- **Debug leftovers** — `console.log`, `print`, `dbg!`, `debugger`,
  `breakpoint()`, `var_dump`, `dd()` left from a debugging session in code
  that ships.
- **Stale** — suppressions that suppress nothing, dependencies a patch or
  minor behind (one finding together, not one per package).
- **Bullshit** — the rest of what makes a newcomer say "why?": wrappers
  around a single call, abstractions named after patterns instead of the
  domain. Same bar: name the cost.

## 4. Try to kill every find

Hunters overclaim, and a checker asked to "confirm" will confirm. For each
finding, try to prove it wrong. Where subagents are available, give one
refuter a batch — the findings for one area — with `$H`, the claims and the
code; it may rerun any tool, is told to refute each, and answers per finding
"holds" or "refuted, because …". One refuter per finding costs more than the
hunt. A hunter that cannot start subagents refutes its own findings the same
way.

- **Dead:** grep the name as a string too — routes, reflection, templates,
  dynamic imports, config, other packages in a monorepo. The tools follow
  imports; they cannot see a name built at runtime.
- **Untested:** search the tests for the behaviour, not the file name.
- **Duplicate:** would a change to one copy really have to be made to the
  other? If they only rhyme, drop it.
- **Reinvented:** does the replacement handle the same edge cases?
- **Broken / insecure:** reproduce it, or state the exact input.
- **Performance:** is the size real? Find where the collection comes from
  and how big it gets in use. If it stays small, drop it.
- **Overengineered:** is there really one implementation and one caller?
- **Suppressed:** does it still hide anything? Remove it in the scratch copy
  and rerun the tool.

What survives keeps the evidence that saved it. For survivors, collect the
blast radius the fix needs: every reference (with the count), the tests that
cover it now, and whether it is public API.

**Write every survivor down the moment it survives** — one file per finding,
`$H/findings/<category>-<short-slug>.md`, in the write-up format from step
5. Every one, not just the ones that will make the top ten: a long hunt that
runs out of room before the report must not lose what it already proved.
Subagents write their survivors into the same directory, prefixed with their
area — `$H/findings/<area>--<category>-<slug>.md` — so two of them can never
pick the same name. They never number files and never write an index.

## 5. Report — in the conversation

Reply in chat, and write nothing into the repository. The conversation
gets a ranked, capped report, because one nobody reads to the end fixes
nothing; `$H/findings/` gets everything. Once every subagent is done, the
hunt's lead — and only the lead — consolidates it: merges files about the
same code into one, keeping what is unique in each; deletes the merged-away
files; numbers the rest once, in report order (`001-…`, `002-…`); and writes
a single `$H/findings/INDEX.md`, the full table of every finding, one row
each, linked to its file.

**Header**, short: the path to `$H/findings/` first, with the total number
of findings — it is the complete record, and it lives in the system temp
directory, so copy it somewhere if it should outlast a reboot. Then the commit (plus "+ uncommitted changes" if dirty); what
ran, with the version of each fetched tool, and what did not and why ("tests
not run: they migrate the dev database"); and coverage — "read 34 of 210
source files, hotspots first; `legacy/` not read".

**Table** of the surviving findings, up to 25, then one line counting any
beyond that by category and pointing at `INDEX.md` for the rest:

```
| #  | Band | Category  | Where                       | Fix                      | Effort | Fix risk |
|----|------|-----------|-----------------------------|--------------------------|--------|----------|
| 1  | fire | broken    | src/pay.ts:88 chargeCart    | guard empty cart         | S      | low      |
| 2  | slow | duplicate | src/a.ts:10 / src/b.ts:40   | extract parseAmount      | S      | low      |
```

Order by band — fire, slow, dead weight — and within a band by impact,
with the cheaper fix first when two weigh the same. A category's usual band (step 3) moves when the
evidence says so:

| Moves to | When |
|---|---|
| fire | exploitable; on money, auth or a trust boundary; can take the service down (unbounded growth, N+1 on a hot path); brittle code in a high-churn file; a suppression hiding a real error; a committed `.env` |
| slow | a lazy suppression that still suppresses something; a vulnerable dependency the shipped code never reaches |
| dead weight | dead code, however brittle or insecure — deleting it fixes everything. But dead code that looks about to go live (recent, half-wired) and holds a hazard says so in its finding |

**Full write-ups for the first ten** (or all, if there are fewer), each one
standing on its own — a developer who reads only that finding can do it and
knows when it is done:

```
### 2 · Extract parseAmount — duplicate · effort S · fix risk low

**Where:** `src/a.ts:10-24` `parseAmount`, `src/b.ts:40-55` `toCents`
(at HEAD a1b2c3d); callers: `src/cart.ts:12`, `src/refund.ts:30`
**What SUCKS:** Same parsing written twice; `toCents` already lost the
negative-amount check `parseAmount` has.
**Evidence:** `npx -y jscpd@5 --reporters ai --similarity 0.85 src/a.ts src/b.ts`
→ `a.ts:10-24 ~ b.ts:40-55 [~0.87 ast]`
**Fix:**
1. Keep `parseAmount` in `src/a.ts`, export it.
2. Replace the body of `toCents` in `src/b.ts` with a call; delete the copy.
**Done when:** the same jscpd command reports 0 clones; `npm test` passes.
**Watch out:** `src/refund.ts:30` passes negatives — this fix changes its
behaviour. Add a test for a negative refund first.
**Depends on:** —
```

- **Where** — file:line *and* the symbol name, since lines drift with the
  next commit; every caller the fix touches.
- **Evidence** — the command and its output, or the exact failing input,
  pasted rather than paraphrased, so the developer can re-check it in ten
  seconds.
- **Fix** — numbered steps naming files and functions. "Consider
  refactoring" is banned; say what to extract, inline, rename or delete, and
  the exact replacement for reinvented code.
- **Done when** — a check that fails now and passes after, preferably the
  tool that found it: knip no longer lists the export, jscpd reports no
  clone, the ast-grep pattern returns nothing. For **broken**, the failing
  input becomes the regression test, written first. For **untested**, the
  cases the missing test must cover, with inputs.
- **Effort** — S (under an hour) or M (up to a day). Anything bigger is a
  project, not a finding: say so, and give the first S-sized step.
- **Fix risk** — how dangerous the *fix* is, not the SUCK: low (private,
  covered), medium (many callers, thin coverage), high (public API,
  persistence, money, auth, rewriting history). Medium and high get
  **Watch out**: what could break and how anyone would notice. High starts
  with the test that would catch it.
- **Depends on** — findings that must land first, e.g. the test before the
  deletion it protects.

Findings 11–25 stay one table row each here; their full write-ups, and
every finding past 25, are in `$H/findings/`. End
with the single change that removes the most SUCK for the least work, then
offer to fix — one finding or one band at a time, so each change can be
reviewed on its own.

Sign off with a haiku about this hunt's worst SUCK — 5-7-5, naming the real
thing, not code in general. It is the only flourish in the report.
