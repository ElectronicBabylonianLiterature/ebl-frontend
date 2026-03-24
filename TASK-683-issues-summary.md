# TASK-683 Issues Summary

## Scope

This report summarizes issues/warnings observed from the latest local validation runs after CI workflow hardening changes.

For the detailed build-termination investigation, see `TASK-683-build-investigation.md`.

## Status Update (2026-03-10)

- Commit `a141e29e` (singleton full-test guard + CI concurrency) was reverted by `576377ac` because it did not resolve the termination failure.
- The highest-priority unresolved problem remains full test process termination before Jest summary.

## Latest Test Run

- Command: `CI=true yarn test --coverage --forceExit --detectOpenHandles --maxWorkers=50% --watch=false`
- Full output file: `TASK-683-test-output.txt`
- Result: **PASS** (`287` suites, `22127` passed, `2` skipped)

## Problem Table

| ID  | Area                 | Symptom / Warning                                                                                                                              | Evidence                                                                                                                                                                                                                    | Severity | Current Status          | Suggested Action                                                                                                       |
| --- | -------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- | ----------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| P1  | Build/Test runtime   | Long runs exit early with `The build failed because the process exited too early.`                                                             | Root cause confirmed as OOM kill: only 2.1 GB available vs 2.5–4+ GB needed; no swap; exit 137 = SIGKILL; SIGTERM from container host agent before force-kill; see `TASK-683-build-investigation.md` § Root-Cause Deep-Dive | High     | Root cause confirmed    | Add `GENERATE_SOURCEMAP=false` to build script and Dockerfile; optionally add swap + upgrade Codespace machine type    |
| P2  | Tests                | React warning: `Spinner` uses `defaultProps` on function component                                                                             | `74` occurrences in `TASK-683-test-output.txt`                                                                                                                                                                              | Medium   | Open                    | Refactor `Spinner` to use default parameters                                                                           |
| P3  | Tests                | React Router future flag warning: `v7_startTransition`                                                                                         | `71` occurrences in `TASK-683-test-output.txt`                                                                                                                                                                              | Low      | Open                    | Add Router future flags / prepare v7 migration path                                                                    |
| P4  | Tests                | React Router future flag warning: `v7_relativeSplatPath`                                                                                       | `71` occurrences in `TASK-683-test-output.txt`                                                                                                                                                                              | Low      | Open                    | Add Router future flags / prepare v7 migration path                                                                    |
| P5  | Tests                | Warning from dossiers fetch fallback (`Failed to fetch filtered dossiers`)                                                                     | `2` occurrences in `TASK-683-test-output.txt`                                                                                                                                                                               | Low      | Open                    | Confirm expected fallback behavior in test setup; reduce noisy warning if intentional                                  |
| P6  | Local validation env | Docker CLI unavailable locally for direct workflow command testing                                                                             | `docker: command not found` from local check                                                                                                                                                                                | Low      | Open                    | Validate Docker workflow steps on GitHub Actions runner                                                                |
| P7  | Dependencies (known) | `react-dynamic-sitemap` React peer mismatch                                                                                                    | Latest already in use (`1.2.1`)                                                                                                                                                                                             | Low      | Wontfix (plain updates) | Leave as known upstream constraint                                                                                     |
| P8  | Dependencies (known) | `react-image-annotation` / `styled-components` React peer mismatches                                                                           | Latest already in use (`0.9.10`)                                                                                                                                                                                            | Low      | Wontfix (plain updates) | Leave as known upstream constraint                                                                                     |
| P9  | Test structure       | Security tests were centralized in `src/__tests__` instead of feature-level colocation                                                         | Relocated to `src/http/ApiClient.security.test.ts`, `src/auth/react-auth0-spa.security.test.tsx`, `src/fragmentarium/ui/fragment/CuneiformFragmentEditor.security.test.tsx`                                                 | Medium   | Resolved                | Keep security-focused naming while colocating by feature                                                               |
| P10 | Test structure       | Root-level `useObjectUrl` tests were outside module directory                                                                                  | Relocated to `src/common/useObjectUrl.basic.test.tsx` and `src/common/useObjectUrl.root-regression.test.tsx`                                                                                                                | Low      | Resolved                | Optionally de-duplicate overlap between `useObjectUrl.root-regression.test.tsx` and `useObjectUrl.regression.test.tsx` |
| P11 | Common structure     | `src/common` was flat and hard to maintain                                                                                                     | Subdivided into `src/common/ui/`, `src/common/hooks/`, `src/common/utils/`, `src/common/errors/`; imports updated across `src/`                                                                                             | Low      | Resolved                | Keep new files in the relevant subfolder and use full import paths                                                     |
| P12 | Lint dependencies    | `yarn lint` printed TypeScript support warning (`SUPPORTED TYPESCRIPT VERSIONS: >=4.7.4 <5.6.0`, local TS is `5.9.3`) before dependency resync | Root cause was install-state drift (`node_modules` had `@typescript-eslint/*@7.18.0` while lockfile tracked `8.56.1`); after clean install, integrity/lint/tsc all pass                                                     | Medium   | Resolved                | Keep `node_modules` lockfile-synced (`yarn install --frozen-lockfile` + integrity check) in local and CI workflows     |

## Summary

- **Good news:** baseline full CI-style test command has a passing historical run in `TASK-683-test-output.txt`.
- **Primary blocker (confirmed root cause):** OOM kill. Only ~2.1 GB available at build start vs 2.5–4+ GB needed by webpack. No swap space. SIGTERM from Codespace host agent, SIGKILL follows = exit 137. Identical budget constraint applies to GitHub Actions `ubuntu-latest` (7 GB total). Minimum fix: `GENERATE_SOURCEMAP=false` in `package.json` build script and Dockerfile.
- **Detailed evidence:** see `TASK-683-build-investigation.md` § Root-Cause Deep-Dive (OOM Kill) for environment metrics, signal sequence explanation, similar community cases, and ranked solutions.
- **Important:** the singleton/concurrency attempt was reverted because it did not fix termination behavior.
- **Secondary issues:** test output includes repeated non-fatal warnings (React defaultProps + React Router future flags) that should be tracked as cleanup work.
- **Structure follow-up:** security and `useObjectUrl` placement inconsistencies are resolved; optional overlap de-duplication remains for the two `useObjectUrl` regression suites.
- **Common follow-up:** `src/common` now uses the minimal four-way subdivision (`ui/hooks/utils/errors`) and import paths have been aligned.
- **Lint follow-up:** mismatch investigation is now resolved; warning disappeared after lockfile-synced reinstall and integrity verification.
- **Environment caveat:** Docker workflow command path cannot be fully validated locally in this container due missing Docker CLI.

## Next Verification Checklist (Actions)

1. Apply `GENERATE_SOURCEMAP=false` to `package.json` `build` script and to the Dockerfile `ENV` block before `RUN yarn build`.
2. Run `yarn build` three consecutive times in this Codespace and confirm no exit `137` / early-exit failures.
3. Add swap to the Codespace (`sudo fallocate -l 4G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile`) as an additional local stabilization measure.
4. Validate the Docker build path in a real GitHub Actions run (`docker` or `docker-test` job) after applying the Dockerfile change.
5. Optionally consolidate overlapping `useObjectUrl` regression suites to reduce duplicated assertions.
6. Add/install-step guardrails in CI (`yarn install --frozen-lockfile` and optional `yarn check --integrity`) to prevent node_modules drift recurrence.
