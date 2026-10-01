# TASK-774-ci-canvas — Work log

## 2026-10-01

- Dev container rebuilt: Node 24.21.0, `yarn check --integrity` in sync; branch equals origin at 716df2ba (pushed after the handoff was written); master has not moved.
- CI run 36861530827, job `test`: Install failed 3/3; Lint, Compile, Unit Tests skipped.
- Pre-existing issue, root cause: `canvas@2.11.2` (devDependency, used by jsdom) has no prebuilt binary for Node 24 (ABI 137, 404 on `canvas-v2.11.2-node-v137-linux-glibc-x64.tar.gz`), so node-pre-gyp falls back to a source build, which fails on ubuntu-latest: `Package 'pixman-1' was not found`. The devcontainer base image ships cairo/pixman dev packages, so local install and the round-12 local gates passed. The production Dockerfile already installs cairo-dev, giflib-dev, jpeg-dev, pango-dev, pixman-dev, so it is unaffected.
- Pre-existing issue: `gh` missing after the rebuild — it was never in the devcontainer config (installed by hand earlier).
- `.github/workflows/main.yml`: new step "Install canvas build dependencies" before Install — `apt-get install --no-install-recommends libcairo2-dev libgif-dev libjpeg-dev libpango1.0-dev libpixman-1-dev` (same set as the Dockerfile's apk list: cairo, giflib, jpeg, pango, pixman). Package names verified with apt-cache; YAML parsed with js-yaml (step order checkout → setup-node → canvas deps → Install).
- `.devcontainer/devcontainer.json`: added `ghcr.io/devcontainers/features/github-cli:1`; README lists the features.
- Pre-existing issue: `.devcontainer/devcontainer.json` failed `prettier --check` on master too (long `initializeCommand` line); root cause: never formatted. Fixed with `prettier --write`; `.github`, `.devcontainer` and these task files pass.
- Installed gh 2.102.0 in the running container from the official cli.github.com apt repo; `gh pr view 774` works via the Codespace token.
- PR #774 checked with gh: no new inline/issue comments since 2026-09-29; review threads 6/6 resolved (all outdated); latest review Fabdulla1 CHANGES_REQUESTED on d3a1b4dc (B1, awaiting re-review).
- Updated TASK-774-review.md (C1–C3 table, m5 draft CI note, next steps), TASK-774-handoff.md, TASK-774-todo.md, TASK-774-log.md.
- Gates in the rebuilt Node 24.21.0 container, run sequentially: `yarn lint` exit 0; `yarn tsc` exit 0; `yarn test:ci` exit 0 — 646/646 suites, 5546/5546 tests, 47/47 snapshots, 714 s, zero console output, coverage 98.35/95.75/98.35/98.45 (unchanged). No .ts/.tsx changed, so the 250-line and diff-coverage gates are unaffected.
- The CI step itself can only be proven on GitHub's runner after a push.
- Nothing committed or pushed.
