# TASK-683 Work Log

## 2026-02-25

- Initialized mandatory task tracking files per repository instructions.
- Corrective action: resumed implementation with strict `yarn`-only command usage.
- Queried registry with `yarn info` to select current versions.
- Verified `@typescript-eslint@8.56.1` peer compatibility with TypeScript 5.9.x and ESLint 8.57+.
- Updated `package.json` to `@typescript-eslint/*` `^8.56.1` and pinned `typescript` to `~5.9.3`.
- Ran `yarn install` to regenerate `yarn.lock`.
- Ran `yarn lint`; TypeScript support warning disappeared.
- Applied minimal lint-only fix in `src/akkadian/ui/akkadianWordAnalysis.tsx` (`catch (error)` -> `catch`).
- Added test in `src/transliteration/ui/AkkadianWordAnalysis.test.tsx` to cover fallback branch when `tokenToPhoneticSegments` throws.
- Fixed lint errors in new test by replacing direct DOM-node assertions with Testing Library query assertions.
- Updated `.github/copilot-instructions.md` to require running `yarn lint` after any code change.
- Ran `yarn lint` successfully after latest changes.
- Ran focused test coverage command for `src/transliteration/ui/AkkadianWordAnalysis.test.tsx`; all tests passed and file reached 100% lines.
- Ran `yarn tsc` successfully.
- Ran `yarn build` twice; both attempts failed with: "The build failed because the process exited too early." (likely environment/process termination in container).
- Investigated `postcss-resolve-url: postcss.plugin was deprecated` warning.
- Found source: `react-scripts@5.0.1` transitively depends on `resolve-url-loader@^4.0.0`, currently resolved to `4.0.0` (uses `postcss@^7.0.35`).
- Identified mitigation: force `resolve-url-loader@^5.0.0` via Yarn `resolutions` (uses `postcss@^8.2.14`) to remove deprecated plugin API warning.
- Applied `"resolve-url-loader": "^5.0.0"` in `package.json` `resolutions` and ran `yarn install`.
- Verified lockfile now resolves both `resolve-url-loader@^4.0.0` and `@^5.0.0` requests to `5.0.0`.
- Ran `yarn lint` successfully after change.
- Ran `yarn build`; `postcss-resolve-url: postcss.plugin was deprecated` warning no longer appeared, but build still exits early due environment/process termination.

### Known install/build warnings and issues

- Build issue (current blocker): `yarn build` exits with `The build failed because the process exited too early.` (reproduced multiple times in container).
- `yarn install` warning: `Resolution field "eslint@8.57.1" is incompatible with requested version "eslint@^7.12.0"`.
- `yarn install` warning: `bare-fs@4.5.3: The engine "bare" appears to be invalid.`
- `yarn install` warning: `bare-os@3.6.2: The engine "bare" appears to be invalid.`
- `yarn install` warning: `webpack-dev-server > webpack-dev-middleware@5.3.4 has unmet peer dependency "webpack@^4.0.0 || ^5.0.0"`.
- `yarn install` warning: `bootstrap@5.3.8 has unmet peer dependency "@popperjs/core@^2.11.8"`.
- `yarn install` warning: `react-dynamic-sitemap@1.2.1 has incorrect peer dependency "react@^16.13.1"`.
- `yarn install` warning: `react-image-annotation@0.9.10 has incorrect peer dependency "react@^16.3"`.
- `yarn install` warning: `react-image-annotation > styled-components@3.4.10 has incorrect peer dependency "react@>= 0.14.0 < 17.0.0-0"`.

### Additional remediation work

- Removed forced `eslint` resolution from `package.json` and added missing peers `@popperjs/core` + `webpack`.
- Updated build script to `GENERATE_SOURCEMAP=false NODE_OPTIONS=--max_old_space_size=4096 craco build` to mitigate memory-related exits.
- Re-ran `yarn install` twice; steady-state install now clears previous `eslint` resolution mismatch and unmet peer warnings.
- Re-ran `yarn lint`; passed.
- Re-ran `yarn build` and `CI=true yarn build`; early-exit failure still reproduces in this container.
- Confirmed remaining install warnings are from upstream/transitive constraints:
  - `bare-fs` / `bare-os` engine warnings (via `lighthouse -> puppeteer-core -> @puppeteer/browsers -> tar-fs`).
  - React peer mismatch warnings for `react-dynamic-sitemap` and `react-image-annotation` families.

### Revert + plain-update-only guidance

- Reverted latest package edits (`package.json`, `yarn.lock`) on request.
- Reverted non-package prototype migration edits for image annotation and removed temporary compat file.
- Plain-update-only guidance:
  - `react-dynamic-sitemap` warning: **skip/wontfix** (latest published version is already `1.2.1`).
  - `react-image-annotation` + `styled-components` peer warnings: **skip/wontfix** via updates alone (latest published version is already `0.9.10`).
  - `bare-fs` / `bare-os` warnings: possible via plain dependency update by changing `lighthouse` version (requires validation of script behavior).

### Build early-exit debugging (continued)

- Re-validated environment basics: no cgroup memory cap (`/sys/fs/cgroup/memory.max = max`), disk has free space.
- Reproduced failure with multiple build variants:
  - `yarn build`
  - `CI=true yarn build`
  - `GENERATE_SOURCEMAP=false yarn build`
  - `DISABLE_ESLINT_PLUGIN=true yarn build`
- Result: all variants fail with the same CRA message: `The build failed because the process exited too early.`
- Conclusion: issue is reproducible and appears external/environmental to webpack internals in this container session (process termination), not tied to ESLint plugin or sourcemap generation.
- Additional checks:
  - `npx react-scripts build` fails with the same early-exit message (so not CRACO-specific).
  - Memory samples during background build stayed stable (~4.8GB used, ~2.3GB free), no obvious host OOM signature in available logs.
  - `NODE_OPTIONS=--max_old_space_size=6144 yarn build` still fails the same way.
- Current hypothesis: process receives external termination signal in this container/session; not explained by webpack configuration toggles tested so far.

### Cross-signal correlation update (build + CI test terminations)

- User report added: GitHub Actions tests (including PyPy-related pipelines in surrounding context) often terminate without named reason after CRACO switch.
- Repository check: no explicit `pypy` workflow exists in this repo; likely cross-repo signal, but termination symptom matches this project's build early-exit pattern.
- Local CI-like test run (`CI=true yarn test --coverage --forceExit --detectOpenHandles --watch=false`) completed successfully (287 suites, 22129 tests), so termination is not deterministic test logic failure.
- Important CI hardening applied: `.github/workflows/main.yml` unit test step now caps workers (`--maxWorkers=50%`) and retries once on failure.
- Rationale: workflow previously bypassed the project's `test` script worker cap, potentially increasing runner pressure and random process-kill events.

### CI docker hardening update

- Applied the same termination-mitigation pattern to both Docker jobs in `.github/workflows/main.yml`:
  - Added `timeout-minutes: 60` for `docker` and `docker-test` jobs.
  - Added `BUILDKIT_PROGRESS=plain` for clearer failure diagnostics.
  - Replaced one-shot `docker/build-push-action` build steps with retrying `docker buildx build --push` shell loops (2 attempts, 30s backoff).
- Objective: reduce transient runner/process-kill impact and improve reproducibility for intermittent termination failures.

### Direct validation of modified workflow commands

- Ran updated unit-test workflow command locally:
  - `CI=true yarn test --coverage --forceExit --detectOpenHandles --maxWorkers=50% --watch=false`
  - Result: passed (`287` suites, `22129` tests).
- Tried to validate Docker workflow command path locally:
  - `docker buildx version && docker info ...`
  - Result: local environment lacks Docker CLI (`docker: command not found`), so Docker workflow command execution must be validated in GitHub Actions runner.

### Full regression rerun + artifacts

- Re-ran all tests with CI-style command and captured complete output:
  - Command: `CI=true yarn test --coverage --forceExit --detectOpenHandles --maxWorkers=50% --watch=false`
  - Result: passed (`287` suites, `22127` tests passed, `2` skipped).
  - Artifact: `TASK-683-test-output.txt` (full raw output, 25k+ lines).
- Extracted warning counts from test output:
  - `Spinner defaultProps` warning: `74` occurrences.
  - React Router future warning (`v7_startTransition`): `71` occurrences.
  - React Router future warning (`v7_relativeSplatPath`): `71` occurrences.
  - Dossier fetch fallback warning: `2` occurrences.
- Created structured issues report with table + summary:
  - Artifact: `TASK-683-issues-summary.md`.
- Created separate detailed all-test-issues table with locations and possible solutions:
  - Artifact: `TASK-683-test-issues-detailed.md`.
