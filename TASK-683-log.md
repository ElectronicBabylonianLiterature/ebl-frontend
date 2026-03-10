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

## 2026-03-04

### Commented-out test assertions audit + restoration start

- Scanned test files for commented-out assertions and placeholder assertions (`// expect(...)`, commented navigation checks, `waitFor(() => expect(true).toBe(true))` placeholder).
- Confirmed 8 high-confidence findings across 5 files.
- Created artifact: `TASK-683-commented-test-assertions-audit.md` with findings table, counts, and status.
- Restored assertions/placeholders in:
  - `src/fragmentarium/ui/SearchForm.test.tsx`
  - `src/fragmentarium/ui/search/PaginationItems.test.tsx`
  - `src/bibliography/ui/BibliographyViewer.test.tsx`
  - `src/fragmentarium/ui/FragmentButton.test.tsx`
  - `src/fragmentarium/ui/images/Images.test.tsx`
- Ran focused tests:
  - `CI=true yarn test --watch=false --runTestsByPath src/fragmentarium/ui/SearchForm.test.tsx src/fragmentarium/ui/search/PaginationItems.test.tsx src/bibliography/ui/BibliographyViewer.test.tsx src/fragmentarium/ui/FragmentButton.test.tsx src/fragmentarium/ui/images/Images.test.tsx`
  - Result: `5` suites passed, `58` tests passed.
- Ran `yarn lint` after changes; passed.

### Src recent-comments audit

- Scanned `src/` for comment-syntax lines and resolved per-line blame metadata.
- Filtered entries to recent additions (`author-time >= 2026-01-01`).
- Confirmed requested example comment in `src/setupTests.ts`:
  - `// Polyfill for TextEncoder/TextDecoder required by some dependencies`.
- Created artifact: `TASK-683-src-comments-audit.md` with:
  - summary counts,
  - per-file inventory,
  - notable comments list (including placeholder spy comments and suppression comments).
- Follow-up refinement: added a separate `Commented-out Code` section in `TASK-683-src-comments-audit.md` listing executable-code-like comment entries (`jest.spyOn(...)` placeholders and `PdfExport.tsx` commented logic).

### Commented-out code cleanup (requested subset)

- Removed requested commented-out spy lines from:
  - `src/dictionary/ui/search/WordSearchForm.test.tsx` (5 lines)
  - `src/bibliography/ui/BibliographyViewer.test.tsx` (1 line)
- Updated `TASK-683-src-comments-audit.md` to keep original rows and mark these six entries as fixed (removed on 2026-03-05).
- Verification:
  - `CI=true yarn test --watch=false --runTestsByPath src/dictionary/ui/search/WordSearchForm.test.tsx src/bibliography/ui/BibliographyViewer.test.tsx` → passed (`2` suites, `26` tests).
  - `yarn lint` → passed.

### Commented-out code cleanup (PdfExport follow-up)

- Removed remaining commented-out code lines from `src/fragmentarium/ui/fragment/PdfExport.tsx`:
  - `// table.hide()`
  - commented `else if ($(el)[0].nodeType === 3)` block lines
- Updated `TASK-683-src-comments-audit.md` to keep the original rows and mark these four entries as fixed (removed on 2026-03-05).
- Updated commented-out-code summary in audit: `10 originally identified; 10 fixed; 0 remaining`.
- Verification:
  - `CI=true yarn test --watch=false --runTestsByPath src/fragmentarium/ui/fragment/PdfExport.test.ts` → passed (`1` suite, `1` test).
  - `yarn lint` → passed.

### Audit classification correction

- Updated `TASK-683-src-comments-audit.md` so the `jest.spyOn(history, "push")` placeholder entries are no longer listed in `Notable Comment Entries`.
- These entries are now represented only in `Commented-out Code (separate list)` as requested.

### Restore `react/prop-types` disable headers (master-aligned)

- Re-added `/* eslint-disable react/prop-types */` at the top of:
  - `src/common/List.tsx`
  - `src/dictionary/ui/editor/FormList.tsx`
  - `src/fragmentarium/ui/edition/TransliterationForm.test.tsx`
- Verification:
  - `git --no-pager diff master -- <three files>` → no diff output (matches `master` for these files).
  - `yarn lint` → failed due unrelated pre-existing formatting errors:
    - `src/__tests__/security-api.test.tsx` (`prettier/prettier`, delete leading blank line)
    - `src/__tests__/security-fragment-tabs.test.tsx` (`prettier/prettier`, delete leading blank line)

### Lint cleanup follow-up (security tests)

- Fixed top-of-file formatting and syntax issues in:
  - `src/__tests__/security-api.test.tsx`
  - `src/__tests__/security-fragment-tabs.test.tsx`
- Specific fixes:
  - removed leading blank lines,
  - restored missing closing `}` for `mockErrorReporter` object,
  - restored missing closing `}` for `mockProps` object.
- Verification:
  - `yarn lint` → passed.

## 2026-03-10

### File structure and test-placement analysis (documentation-only)

- Analyzed project-wide test placement with `find src -type f -name '*.test.ts' -o -name '*.test.tsx'`.
- Observed dominant repository convention: tests are colocated with the code they validate (same feature/domain directory).
- Verified `src/__tests__` is the only `__tests__` directory in the entire `src/` tree.
- Reviewed files added/renamed since `2026-01-01` using:
  - `git log --since='2026-01-01' --name-status --diff-filter=AR`
  - `git diff --name-status master...HEAD`

### Placement findings

- High-confidence mismatch cluster in `src/__tests__/`:
  - `src/__tests__/security-api.test.tsx`
  - `src/__tests__/security-auth.test.tsx`
  - `src/__tests__/security-fragment-tabs.test.tsx`
- Why flagged: each file validates feature-specific behavior (`http`, `auth`, `fragmentarium`) while project convention is feature-level colocation.

### Recommended target locations (no moves yet)

- `src/__tests__/security-api.test.tsx`
  - Recommended: `src/http/ApiClient.security.test.ts`
  - Reason: exercises `ApiClient` authorization/error logic.
- `src/__tests__/security-auth.test.tsx`
  - Recommended: `src/auth/react-auth0-spa.security.test.tsx`
  - Reason: exercises `Auth0Provider`, token/session handling, and guest-session behavior.
- `src/__tests__/security-fragment-tabs.test.tsx`
  - Recommended: `src/fragmentarium/ui/fragment/CuneiformFragmentEditor.security.test.tsx`
  - Reason: validates `EditorTabs` permission/tab visibility behavior.

### Additional likely mismatch from recent period

- `src/useObjectUrl.regression.test.tsx` (added in 2026-02 commit) imports `./common/useObjectUrl`, not a same-folder module.
- Existing `src/useObjectUrl.test.tsx` also imports `./common/useObjectUrl`.
- Recommendation: colocate both under `src/common/` with the hook, or retain one canonical suite in `src/common/` and de-duplicate overlap.

### Other files checked for placement anomalies (since 2026-01)

- No other high-confidence structural mismatches identified in added/renamed files.
- Root-level `TASK-683-*.md` artifacts are intentional task-tracking docs per current repo instructions.

### Relocation execution (requested)

- Relocated files with `git mv`:
  - `src/__tests__/security-api.test.tsx` -> `src/http/ApiClient.security.test.ts`
  - `src/__tests__/security-auth.test.tsx` -> `src/auth/react-auth0-spa.security.test.tsx`
  - `src/__tests__/security-fragment-tabs.test.tsx` -> `src/fragmentarium/ui/fragment/CuneiformFragmentEditor.security.test.tsx`
- Post-move validation:
  - `yarn lint` -> passed (existing TypeScript support warning from `@typescript-eslint/typescript-estree` only).
  - `CI=true yarn test --watch=false --runTestsByPath src/http/ApiClient.security.test.ts src/auth/react-auth0-spa.security.test.tsx src/fragmentarium/ui/fragment/CuneiformFragmentEditor.security.test.tsx` -> passed (`3` suites, `33` tests).

### Additional placement cleanup (useObjectUrl tests)

- Relocated root-level tests into `src/common/`:
  - `src/useObjectUrl.test.tsx` -> `src/common/useObjectUrl.basic.test.tsx`
  - `src/useObjectUrl.regression.test.tsx` -> `src/common/useObjectUrl.root-regression.test.tsx`
- Updated imports in relocated files from `./common/useObjectUrl` to `./useObjectUrl`.
- Validation after relocation:
  - `yarn lint` -> passed (same existing TypeScript support warning only).
  - `CI=true yarn test --watch=false --runTestsByPath src/common/useObjectUrl.basic.test.tsx src/common/useObjectUrl.root-regression.test.tsx src/common/useObjectUrl.regression.test.tsx` -> passed (`3` suites, `41` tests).
