# TASK-683 Issues Summary

## Scope

This report summarizes issues/warnings observed from the latest local validation runs after CI workflow hardening changes.

## Latest Test Run

- Command: `CI=true yarn test --coverage --forceExit --detectOpenHandles --maxWorkers=50% --watch=false`
- Full output file: `TASK-683-test-output.txt`
- Result: **PASS** (`287` suites, `22127` passed, `2` skipped)

## Problem Table

| ID  | Area                 | Symptom / Warning                                                                                                                              | Evidence                                                                                                                                                                    | Severity | Current Status          | Suggested Action                                                                                                       |
| --- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| P1  | Build                | `yarn build` exits early with `The build failed because the process exited too early.`                                                         | Reproduced with `yarn build`, `CI=true yarn build`, sourcemap-off, ESLint-plugin-off, and increased heap                                                                    | High     | Open                    | Validate on fresh runner/container; collect kernel/runner termination events where available                           |
| P2  | Tests                | React warning: `Spinner` uses `defaultProps` on function component                                                                             | `74` occurrences in `TASK-683-test-output.txt`                                                                                                                              | Medium   | Open                    | Refactor `Spinner` to use default parameters                                                                           |
| P3  | Tests                | React Router future flag warning: `v7_startTransition`                                                                                         | `71` occurrences in `TASK-683-test-output.txt`                                                                                                                              | Low      | Open                    | Add Router future flags / prepare v7 migration path                                                                    |
| P4  | Tests                | React Router future flag warning: `v7_relativeSplatPath`                                                                                       | `71` occurrences in `TASK-683-test-output.txt`                                                                                                                              | Low      | Open                    | Add Router future flags / prepare v7 migration path                                                                    |
| P5  | Tests                | Warning from dossiers fetch fallback (`Failed to fetch filtered dossiers`)                                                                     | `2` occurrences in `TASK-683-test-output.txt`                                                                                                                               | Low      | Open                    | Confirm expected fallback behavior in test setup; reduce noisy warning if intentional                                  |
| P6  | Local validation env | Docker CLI unavailable locally for direct workflow command testing                                                                             | `docker: command not found` from local check                                                                                                                                | Low      | Open                    | Validate Docker workflow steps on GitHub Actions runner                                                                |
| P7  | Dependencies (known) | `react-dynamic-sitemap` React peer mismatch                                                                                                    | Latest already in use (`1.2.1`)                                                                                                                                             | Low      | Wontfix (plain updates) | Leave as known upstream constraint                                                                                     |
| P8  | Dependencies (known) | `react-image-annotation` / `styled-components` React peer mismatches                                                                           | Latest already in use (`0.9.10`)                                                                                                                                            | Low      | Wontfix (plain updates) | Leave as known upstream constraint                                                                                     |
| P9  | Test structure       | Security tests were centralized in `src/__tests__` instead of feature-level colocation                                                         | Relocated to `src/http/ApiClient.security.test.ts`, `src/auth/react-auth0-spa.security.test.tsx`, `src/fragmentarium/ui/fragment/CuneiformFragmentEditor.security.test.tsx` | Medium   | Resolved                | Keep security-focused naming while colocating by feature                                                               |
| P10 | Test structure       | Root-level `useObjectUrl` tests were outside module directory                                                                                  | Relocated to `src/common/useObjectUrl.basic.test.tsx` and `src/common/useObjectUrl.root-regression.test.tsx`                                                                | Low      | Resolved                | Optionally de-duplicate overlap between `useObjectUrl.root-regression.test.tsx` and `useObjectUrl.regression.test.tsx` |
| P11 | Common structure     | `src/common` was flat and hard to maintain                                                                                                     | Subdivided into `src/common/ui/`, `src/common/hooks/`, `src/common/utils/`, `src/common/errors/`; imports updated across `src/`                                             | Low      | Resolved                | Keep new files in the relevant subfolder and use full import paths                                                     |
| P12 | Lint dependencies    | `yarn lint` printed TypeScript support warning (`SUPPORTED TYPESCRIPT VERSIONS: >=4.7.4 <5.6.0`, local TS is `5.9.3`) before dependency resync | Root cause was install-state drift (`node_modules` had `@typescript-eslint/*@7.18.0` while lockfile tracked `8.56.1`); after clean install, integrity/lint/tsc all pass     | Medium   | Resolved                | Keep `node_modules` lockfile-synced (`yarn install --frozen-lockfile` + integrity check) in local and CI workflows     |

## Summary

- **Good news:** full CI-style test command passes and output has been captured in `TASK-683-test-output.txt`.
- **Primary blocker:** build early-exit remains unresolved and appears to be external process termination rather than deterministic app/test failure.
- **Secondary issues:** test output includes repeated non-fatal warnings (React defaultProps + React Router future flags) that should be tracked as cleanup work.
- **Structure follow-up:** security and `useObjectUrl` placement inconsistencies are resolved; optional overlap de-duplication remains for the two `useObjectUrl` regression suites.
- **Common follow-up:** `src/common` now uses the minimal four-way subdivision (`ui/hooks/utils/errors`) and import paths have been aligned.
- **Lint follow-up:** mismatch investigation is now resolved; warning disappeared after lockfile-synced reinstall and integrity verification.
- **Environment caveat:** Docker workflow command path cannot be fully validated locally in this container due missing Docker CLI.

## Next Verification Checklist (Actions)

1. Run CI on a fresh GitHub Actions runner and compare build behavior to local container.
2. Inspect whether workflow retries/timeouts reduce flaky terminations for unit and docker jobs.
3. If build still terminates, capture runner-level termination diagnostics (job logs around abrupt end, infra events if available).
4. Optionally consolidate overlapping `useObjectUrl` regression suites to reduce duplicated assertions.
5. Add/install-step guardrails in CI (`yarn install --frozen-lockfile` and optional `yarn check --integrity`) to prevent node_modules drift recurrence.
