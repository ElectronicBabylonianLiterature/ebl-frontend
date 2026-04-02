# TASK-683 Issues Summary

## Scope

This report summarizes issues/warnings observed from the latest local validation runs after CI workflow hardening changes.

For the detailed build-termination investigation, see `TASK-683-build-investigation.md`.

## Status Update (2026-03-25)

- Commit `a141e29e` (singleton full-test guard + CI concurrency) was reverted by `576377ac` because it did not resolve the termination failure.
- Latest diagnostic run (`yarn test:diag`) completed successfully with final Jest summary (no early-exit marker).
- Repeatability verification completed: three consecutive `yarn test:diag` runs (`run1`, `run2`, `run3`) all reached final Jest summary with no early-exit marker.
- Build A/B verification completed in the same Codespace session:
  - `CI=true yarn build` failed with the early-exit marker.
  - `CI=true GENERATE_SOURCEMAP=false yarn build` passed.
- Workflow fix implemented with production-safe scope:
  - `.github/workflows/main.yml` Build step now sets `GENERATE_SOURCEMAP=false`.
  - `package.json` and `Dockerfile` were intentionally left unchanged so production builds keep sourcemaps enabled.
- Warning inventory has been refreshed from the latest diagnostic log and compact hotspot artifact.

## Status Update (2026-04-01)

- Source log audited: `TASK-683-test-output-rerun-2026-04-01-alltests.txt`.
- Full test run completed with final Jest summary:
  - `289` suites passed, `22235` tests passed, `2` skipped, `0` failed.
- Warning/failure trend update:
  - No failing suites remain in this run.
  - Remaining console noise is concentrated in a smaller set of recurring warning classes.

### Remaining Warning Inventory (2026-04-01 all-tests run)

| Warning Class                                                    | Count |
| ---------------------------------------------------------------- | ----: |
| React Router Future Flag Warning                                 |    12 |
| `styled-components` legacy contextTypes API warning              |     8 |
| `useLayoutEffect` SSR warning                                    |     7 |
| JSX spread warning: props object containing `key`                |     6 |
| `Unhandled rejection` (`Unexpected not-authenticated fetchJson`) |     2 |
| jsdom `window.open` not implemented                              |     1 |
| `ReactDOMTestUtils.act` deprecated warning                       |     0 |

### Test-only expected error-simulation noise (kept for now)

- `Error: Uncaught [Error: Out of memory]` in `useObjectUrl` regression scenarios: `4` occurrences.
- `Error: Uncaught [Error: Invalid URL]` in `useObjectUrl` regression scenarios: `2` occurrences.

These occur in tests that intentionally assert error paths and currently still print jsdom/react console noise. They are not failing assertions in the latest run.

### Test-only cleanup update (2026-04-01, post-audit)

- Implemented test-only fixes for these warning classes:
  - jsdom `window.open` not implemented.
  - `Unhandled rejection` from `/fragments/X.1` in `TextView.integration.test.ts`.
  - Test-local React Router future-flag warnings in suites with custom router wrappers.
  - SSR `useLayoutEffect` warnings in `PdfExport.test.ts` and `WordExport.test.tsx`.
- Implemented scoped test-only suppression for transitive `react-image-annotation` warnings in the two annotation suites without changing tested behavior.
- Focused verification passed across all modified suites (`12` suites / `35` tests), plus hard gates `yarn lint` and `yarn tsc`.

### Status Refresh (2026-04-01, fresh all-tests capture)

- Source log audited: `TASK-683-test-output-rerun-2026-04-01-alltests-post-fixes.txt`.
- Full test run completed with final Jest summary:
  - `289` suites passed, `22235` tests passed, `2` skipped, `0` failed.
  - Time: `280.555 s`.
- Updated warning inventory from this fresh run:
  - React Router Future Flag Warning: `0`
  - `styled-components` legacy contextTypes warning: `0`
  - `useLayoutEffect` SSR warning: `0`
  - JSX spread warning (`key` in props spread): `3`
  - `Unhandled rejection` (`Unexpected not-authenticated fetchJson`): `0`
  - jsdom `window.open` not implemented: `0`
  - `ReactDOMTestUtils.act` deprecated warning: `0`
- Expected error-path console noise unchanged:
  - `Error: Uncaught [Error: Out of memory]`: `4`
  - `Error: Uncaught [Error: Invalid URL]`: `2`
- Remaining warning class is now narrowed to JSX spread-with-`key`, which is rooted in non-test component code and remains blocked under the current tests-only scope.

### Status Correction (2026-04-02, artifact truth-check)

- Source log audited: `TASK-683-test-output-rerun-2026-04-01-alltests-truly-clean.txt`.
- Full test run Jest summary remains green:
  - `289` suites passed, `22236` tests passed, `2` skipped, `0` failed.
  - Time: `304.244 s`.
- Artifact-level console truth-check:
  - `grep -c '● Console' TASK-683-test-output-rerun-2026-04-01-alltests-truly-clean.txt` = `6`.
  - Console blocks are present at lines: `14`, `85`, `1008`, `1068`, `1104`, `1266`.
- Correction: prior "final zero-noise" / "console-clean" wording was inaccurate.
- Current conclusion: full suite is green, but global console-noise cleanup is not complete yet.

### Status Refresh (2026-04-02, final all-tests rerun)

- Source log audited: `TASK-683-test-output-2026-04-02-all.txt`.
- Full test run completed with final Jest summary:
  - `289` suites passed, `22236` tests passed, `2` skipped, `0` failed.
  - Time: `301.476 s`.
- Artifact-level console truth-check:
  - `grep -c '● Console' TASK-683-test-output-2026-04-02-all.txt` = `0`.
- Update: this supersedes the earlier correction section tied to `TASK-683-test-output-rerun-2026-04-01-alltests-truly-clean.txt`.
- Current conclusion: full suite is green and console-noise cleanup is complete for the latest full-run artifact.

## Latest Test Run

- Command: `yarn test:diag`
- Full output file: `TASK-683-test-diag-2026-03-25.txt`
- Result: **PASS** (`289` suites, `22235` passed, `2` skipped)

## Problem Table

| ID  | Area                 | Symptom / Warning                                                                                                                              | Evidence                                                                                                                                                                                                                                                     | Severity | Current Status          | Suggested Action                                                                                                       |
| --- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| P1  | Build/Test runtime   | Long runs exit early with `The build failed because the process exited too early.`                                                             | Root cause confirmed as OOM kill: only 2.1 GB available vs 2.5–4+ GB needed; no swap; local A/B showed `CI=true yarn build` fails while `CI=true GENERATE_SOURCEMAP=false yarn build` passes; PR #692 CI `test` job confirmed green on GitHub Actions runner | High     | Resolved                | `GENERATE_SOURCEMAP=false` scoped to the CI Build step only; confirmed in GitHub Actions runner context (PR #692)      |
| P2  | Tests                | React-Bootstrap warning: `controlId` ignored on `FormLabel` when `htmlFor` is specified                                                        | `153` occurrences in `TASK-683-test-diag-2026-03-25.txt`                                                                                                                                                                                                     | Medium   | Open                    | Avoid combining parent `controlId` with explicit child `htmlFor`                                                       |
| P3  | Tests                | React-Bootstrap warning: `controlId` ignored on `FormControl` when `id` is specified                                                           | `153` occurrences in `TASK-683-test-diag-2026-03-25.txt`                                                                                                                                                                                                     | Medium   | Open                    | Avoid combining parent `controlId` with explicit child control `id`                                                    |
| P4  | Tests                | React warning: state updates not wrapped in `act(...)`                                                                                         | `173` occurrences in `TASK-683-test-diag-2026-03-25.txt`                                                                                                                                                                                                     | Medium   | Open                    | Wrap async UI state updates with `act`-safe helpers in affected tests                                                  |
| P5  | Tests                | React Router future-flag warnings                                                                                                              | `26` occurrences in `TASK-683-test-diag-2026-03-25.txt`                                                                                                                                                                                                      | Low      | Open                    | Align test router setup with selected future-flag policy                                                               |
| P6  | Tests                | Invalid DOM nesting warnings (`validateDOMNesting`)                                                                                            | `10` occurrences in `TASK-683-test-diag-2026-03-25.txt`                                                                                                                                                                                                      | Medium   | Open                    | Fix invalid markup composition in affected components/tests                                                            |
| P7  | Local validation env | Docker CLI unavailable locally for direct workflow command testing                                                                             | `docker: command not found` from local check                                                                                                                                                                                                                 | Low      | Open                    | Validate Docker workflow steps on GitHub Actions runner                                                                |
| P8  | Dependencies (known) | `react-dynamic-sitemap` React peer mismatch                                                                                                    | Latest already in use (`1.2.1`)                                                                                                                                                                                                                              | Low      | Wontfix (plain updates) | Leave as known upstream constraint                                                                                     |
| P9  | Dependencies (known) | `react-image-annotation` / `styled-components` React peer mismatches                                                                           | Latest already in use (`0.9.10`)                                                                                                                                                                                                                             | Low      | Wontfix (plain updates) | Leave as known upstream constraint                                                                                     |
| P10 | Test structure       | Security tests were centralized in `src/__tests__` instead of feature-level colocation                                                         | Relocated to `src/http/ApiClient.security.test.ts`, `src/auth/react-auth0-spa.security.test.tsx`, `src/fragmentarium/ui/fragment/CuneiformFragmentEditor.security.test.tsx`                                                                                  | Medium   | Resolved                | Keep security-focused naming while colocating by feature                                                               |
| P11 | Test structure       | Root-level `useObjectUrl` tests were outside module directory                                                                                  | Relocated to `src/common/useObjectUrl.basic.test.tsx` and `src/common/useObjectUrl.root-regression.test.tsx`                                                                                                                                                 | Low      | Resolved                | Optionally de-duplicate overlap between `useObjectUrl.root-regression.test.tsx` and `useObjectUrl.regression.test.tsx` |
| P12 | Common structure     | `src/common` was flat and hard to maintain                                                                                                     | Subdivided into `src/common/ui/`, `src/common/hooks/`, `src/common/utils/`, `src/common/errors/`; imports updated across `src/`                                                                                                                              | Low      | Resolved                | Keep new files in the relevant subfolder and use full import paths                                                     |
| P13 | Lint dependencies    | `yarn lint` printed TypeScript support warning (`SUPPORTED TYPESCRIPT VERSIONS: >=4.7.4 <5.6.0`, local TS is `5.9.3`) before dependency resync | Root cause was install-state drift (`node_modules` had `@typescript-eslint/*@7.18.0` while lockfile tracked `8.56.1`); after clean install, integrity/lint/tsc all pass                                                                                      | Medium   | Resolved                | Keep `node_modules` lockfile-synced (`yarn install --frozen-lockfile` + integrity check) in local and CI workflows     |

## Summary

- **Good news:** latest diagnostic full run (`yarn test:diag`) completed successfully with final Jest summary in `TASK-683-test-diag-2026-03-25.txt`.
- **Termination stability status:** confirmed repeatable in three consecutive full diagnostic runs (`TASK-683-test-diag-2026-03-25-run1.txt`, `TASK-683-test-diag-2026-03-25-run2.txt`, `TASK-683-test-diag-2026-03-25-run3.txt`) with no `process exited too early` marker.
- **Primary blocker status: RESOLVED.** OOM kill root cause confirmed and fixed. `GENERATE_SOURCEMAP=false` in the CI Build step (`commit c748b4d8`) prevents source map generation in constrained runners. Confirmed green on GitHub Actions ubuntu-latest runner (PR #692 `test` job = success).
- **Detailed evidence:** see `TASK-683-build-investigation.md` § Root-Cause Deep-Dive (OOM Kill) for environment metrics, signal sequence explanation, similar community cases, and ranked solutions.
- **Important:** the singleton/concurrency attempt was reverted because it did not fix termination behavior.
- **Secondary issues:** warning logs were actualized from the latest run and now show the main cleanup classes as `controlId` warnings, `act(...)` warnings, Router future-flag warnings, and `validateDOMNesting` warnings.
- **Important caveat:** termination stability is distinct from test correctness; repeat runs still showed failing suites (`LatestTransliterations.test.tsx` snapshot and `AnnotationsView.integration.test.ts` in one run), which remain open follow-up work.
- **Structure follow-up:** security and `useObjectUrl` placement inconsistencies are resolved; optional overlap de-duplication remains for the two `useObjectUrl` regression suites.
- **Common follow-up:** `src/common` now uses the minimal four-way subdivision (`ui/hooks/utils/errors`) and import paths have been aligned.
- **Lint follow-up:** mismatch investigation is now resolved; warning disappeared after lockfile-synced reinstall and integrity verification.
- **Environment caveat:** Docker workflow command path cannot be fully validated locally in this container due missing Docker CLI.

## Next Verification Checklist (Actions)

1. ~~Validate the updated GitHub Actions `test` job in runner context and confirm the CI Build step completes without the early-exit marker.~~ **Done — PR #692 CI `test` job: success.**
2. Validate the Docker build path in a real GitHub Actions run (`docker` or `docker-test` job), because Docker CLI is unavailable locally. _(Will be validated when PR merges to master.)_
3. Add swap to the Codespace (`sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`) only if additional local production-style build investigation is still needed.
4. Optionally consolidate overlapping `useObjectUrl` regression suites to reduce duplicated assertions.
5. Add/install-step guardrails in CI (`yarn install --frozen-lockfile` and optional `yarn check --integrity`) to prevent node_modules drift recurrence.
6. Use `TASK-683-test-diag-hotspots-2026-03-25.md` as the current warning/heap baseline for trend tracking.
