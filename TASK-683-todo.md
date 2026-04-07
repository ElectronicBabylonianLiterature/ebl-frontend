# TASK-683 TODO

## Goal

Upgrade `@typescript-eslint` stack to support TypeScript 5.9.x cleanly, verify local lint/test/build, and confirm CI/remote actions remain aligned.

Detailed build-termination findings: `TASK-683-build-investigation.md`.

## Progress

- [x] Capture current dependency/config baseline (`package.json`, ESLint configs, workflows) (captured throughout log entries from 2026-02-25 onwards)
- [x] Run `yarn tsc`, `yarn test --coverage`, and `yarn build` (all pass: tsc passes, test job passes in CI runner, build passes via `GENERATE_SOURCEMAP=false` in CI; verified 2026-03-31)
- [x] Verify GitHub Actions workflows still use correct commands/runtime (CI `test` job confirmed green on GitHub Actions runner for PR #692; commit `c748b4d8`)
- [x] Resolve/reproduce build issue: `yarn build` exits early (`The build failed because the process exited too early`) (OOM root cause confirmed; fixed via `GENERATE_SOURCEMAP=false` in CI Build step; verified in GitHub Actions runner context via PR #692 `test` success)
- [x] Review warning: `bare-fs@4.5.3: The engine "bare" appears to be invalid` (traced: lighthouse → puppeteer-core → @puppeteer/browsers → tar-fs → bare-fs; `bare` is a new JS runtime unknown to yarn engine checker; cosmetic noise only; no runtime impact; accepted as known noise)
- [x] Review warning: `bare-os@3.6.2: The engine "bare" appears to be invalid` (same transitive chain as bare-fs; accepted as known cosmetic noise from lighthouse deps)
- [x] Stabilize full test termination first and obtain one complete rerun with Jest final summary (confirmed repeatable on 2026-03-25: 3/3 `yarn test:diag` runs reached final Jest summary without early-exit marker)
- [x] Verify CPU-saturation mitigation for full test runs in Codespace (`test` script now uses `--runInBand`); CI `test` job passed green on GitHub Actions runner without process kill events
- [x] Add a dedicated diagnostic test command with `--logHeapUsage` for memory/CPU investigation runs (`yarn test:diag`)
- [x] Generate compact hotspot report artifact from diagnostic run (`TASK-683-test-diag-hotspots-2026-03-25.md`)
- [x] Update dependency declarations and `resolutions`
- [x] Reinstall dependencies with `yarn install` and refresh lockfile
- [x] Run `yarn lint` and fix upgrade-related config/rule breaks only
- [x] Investigate and document lint TypeScript warning root cause (`@typescript-eslint` runtime install drift vs lockfile)
- [x] Treat build/test terminations as shared runner-process-kill class issue and keep CI mitigations aligned (unit-test + docker workflows hardened with retries/timeouts)
- [x] Review warning: `Resolution field "eslint@8.57.1" is incompatible with requested version "eslint@^7.12.0"`
- [x] Review warning: `webpack-dev-server > webpack-dev-middleware@5.3.4 has unmet peer dependency "webpack@^4.0.0 || ^5.0.0"`
- [x] Review warning: `bootstrap@5.3.8 has unmet peer dependency "@popperjs/core@^2.11.8"`
- [x] Review warning: `react-dynamic-sitemap@1.2.1 has incorrect peer dependency "react@^16.13.1"` (wontfix via plain updates; latest version already in use)
- [x] Review warning: `react-image-annotation@0.9.10 has incorrect peer dependency "react@^16.3"` (wontfix via plain updates; latest version already in use)
- [x] Review warning: `react-image-annotation > styled-components@3.4.10 has incorrect peer dependency "react@>= 0.14.0 < 17.0.0-0"` (wontfix via plain updates; inherited from package above)
- [x] Decide and apply mitigation for `postcss-resolve-url` deprecation warning (`resolve-url-loader` transitive upgrade)
- [x] Summarize changes, risks, and follow-up cleanup reminder
- [x] Create artifacts: full test output log and issues summary table
- [x] Create separate detailed all-test-issues table with locations and solution options
- [x] Re-run full CI-style test suite and save output to a new log file (`TASK-683-test-output-rerun-2026-03-10-2.txt`)
- [x] Create new rerun issues summary file from latest output (`TASK-683-test-issues-rerun-2026-03-10-2.md`)
- [x] Audit repo for commented-out test assertions/placeholders and document findings in `TASK-683-commented-test-assertions-audit.md`
- [x] Restore identified commented-out assertions and placeholders in affected test files, then verify with focused test runs
- [x] Audit `src/` for recently added comments and document findings in `TASK-683-src-comments-audit.md`
- [x] Restore removed `/* eslint-disable react/prop-types */` headers in targeted files and verify against `master`
- [x] Analyze `src/__tests__` placement against project-wide test structure conventions
- [x] Audit files added/renamed since `2026-01-01` for structure-placement mismatches
- [x] Decide relocation plan for out-of-place test files
- [x] Relocate `src/__tests__/` security tests to feature-co-located paths and verify lint/focused tests
- [x] Relocate root-level `useObjectUrl` tests to `src/common/` and verify lint/focused tests
- [x] Subdivide `src/common` into `ui`, `hooks`, `utils`, `errors` and update affected imports
- [x] Revert singleton/concurrency commit (`a141e29e`) because test termination remained unresolved
- [x] Document constrained no-infrastructure OOM-prevention plan for build and tests (planning only, no code/workflow implementation yet)
- [x] Revalidate blocker with fresh 2026-03-25 probes (`yarn build` twice + `CI=true yarn build`) and reconcile conflicting artifact claims (result: blocker still open; reliability not proven)
- [x] Run A/B proof for build instability (`yarn build` vs `GENERATE_SOURCEMAP=false yarn build`, including `CI=true` variants) and document causal difference
- [x] Implement production-safe sourcemap disablement fix: add `GENERATE_SOURCEMAP=false` to CI workflow Build step only (not to package.json or Dockerfile to preserve production behavior)
- [x] Validate CI-style build passes with new GENERATE_SOURCEMAP=false flag (`CI=true GENERATE_SOURCEMAP=false yarn build` -> exit 0, no early-exit marker, 65.73s)
- [x] Investigate test diagnostic hotspots report (`TASK-683-test-diag-hotspots-2026-03-25.md`) and research all 5 warning classes
- [x] Fix React Router future flag warnings (26 occurrences): add `future` prop to `BrowserRouter` in `src/index.tsx`
- [x] Fix `controlId ignored on FormLabel/FormControl` warnings (306 occurrences): remove redundant `htmlFor`/`id` from `LemmaInput.tsx` where `controlId` on `Form.Group` handles binding
- [x] Fix `validateDOMNesting` warnings (10 occurrences): fixed 3 structural HTML violations across `SignsSearch.tsx`, `fragmentarium.tsx`, `line-tokens.test.tsx`
- [x] Restore weakened/semantic-risk test changes identified in `TASK-683-test-semantic-changes-audit.md`
- [x] Re-fix warning sources in restored tests without weakening assertions (About/Bibliography/BibliographyEditor/WordExport/LemmaAnnotation/TransliterationForm)
- [x] Actualize semantic audit to current state (`TASK-683-test-semantic-changes-audit.md`)
- [x] Audit changes in tests in PR 661(`PR-661-test-changes-analysis.md`)
- [x] Capture complete all-tests output from latest rerun (`TASK-683-test-output-rerun-2026-04-01-alltests.txt`)
- [x] Audit remaining warning classes and counts from latest all-tests output
- [x] Update related PR/task documentation with latest all-tests audit status
- [x] Create dedicated remaining-actions document (`TASK-683-remaining-todos-2026-04-01.md`)
- [x] Mark `act(...)` warning cleanup complete after latest all-tests audit confirmed `0` occurrences in `TASK-683-test-output-rerun-2026-04-01-alltests.txt`
- [x] Fix jsdom `window.open` warning in `SubmitCorrectionsButton.test.tsx` without changing button assertions
- [x] Fix unexpected `/fragments/X.1` fetch warning in `TextView.integration.test.ts` without weakening integration coverage
- [x] Fix test-local React Router future-flag warnings in affected suites with explicit future flags
- [x] Fix SSR `useLayoutEffect` warning noise in export tests with scoped test-only suppression
- [x] Suppress transitive `react-image-annotation` warning noise in annotation suites without altering tested interactions
- [x] Produce a fresh all-tests capture to refresh remaining warning counts after the latest test-only cleanup pass (`TASK-683-test-output-rerun-2026-04-01-alltests-post-fixes.txt`)
- [x] Replace export-path router/popover SSR warning sources with export-safe rendering and verify with focused export tests
- [x] Fix JSX key-spread warnings at source in annotation and colophon flows without suppression
- [x] Remove local styled-components/overlay warning sources from the annotation tool without weakening annotation behavior
- [x] Eliminate jsdom navigation noise from word download tests by asserting the download side effect directly
- [x] Make `useObjectUrl` fail-safe on browser object URL API errors and rework regression tests to assert graceful behavior without uncaught console noise
- [x] Produce true zero-noise all-tests capture (`TASK-683-test-output-2026-04-02-all.txt`: `289/289` suites passed, `grep -c '● Console'` = `0`)

## 2026-04-07 Review Follow-up

- [x] Fix F1 from `TASK-683-review.md`: remove global console suppression from `src/common/errors/ErrorBoundary.comprehensive.test.tsx` and replace it with per-test targeted `console.error` assertions
- [x] Fix F2 from `TASK-683-review.md`: remove `NODE_ENV !== 'test'` warning suppression from `src/dossiers/infrastructure/DossiersRepository.ts`
- [x] Fix F2 test coverage: assert dossier warning paths in `src/dossiers/infrastructure/DossiersRepository.test.ts`
- [x] Fix F3 from `TASK-683-review.md`: convert suppression-only Auth0 warning/error spies into asserting spies in `src/auth/react-auth0-spa.test.tsx` and `src/auth/react-auth0-spa.security.test.tsx`
- [x] Fix F4 from `TASK-683-review.md`: remove permanent `DISABLE_ESLINT_PLUGIN=true` from the default `build` script while keeping CI/Docker-specific env overrides in their own call sites
- [x] Run focused tests for ErrorBoundary, DossiersRepository, and Auth0 suites
- [x] Run `yarn lint`
- [x] Run `yarn tsc`
- [x] Run full test suite and confirm console-clean output remains `0`
- [ ] F5 pre-merge cleanup: remove `TASK-683-*`, `PR-661-test-changes-analysis.md`, and related task artifacts only in the final merge-prep cleanup once active task documentation is no longer needed
- [x] Investigate persistent local `yarn build` early-exit after review fixes and capture actionable findings in task log
- [x] Add dedicated stable build command (`yarn build:ci-stable`) for deterministic CI-like production builds
- [x] Verify `yarn build:ci-stable` succeeds on current workspace state

## Notes

- Use `yarn` only.
- Keep both `eslint.config.js` and `.eslintrc.json` as requested.
- Pin TypeScript to `5.9.x` as requested.
