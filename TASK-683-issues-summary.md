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
