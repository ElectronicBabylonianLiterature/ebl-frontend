# TASK-683 Issues Summary

## Scope

This report summarizes issues/warnings observed from the latest local validation runs after CI workflow hardening changes.

## Latest Test Run

- Command: `CI=true yarn test --coverage --forceExit --detectOpenHandles --maxWorkers=50% --watch=false`
- Full output file: `TASK-683-test-output.txt`
- Result: **PASS** (`287` suites, `22127` passed, `2` skipped)

## Problem Table

| ID  | Area                 | Symptom / Warning                                                                      | Evidence                                                                                                 | Severity | Current Status          | Suggested Action                                                                             |
| --- | -------------------- | -------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- | -------- | ----------------------- | -------------------------------------------------------------------------------------------- |
| P1  | Build                | `yarn build` exits early with `The build failed because the process exited too early.` | Reproduced with `yarn build`, `CI=true yarn build`, sourcemap-off, ESLint-plugin-off, and increased heap | High     | Open                    | Validate on fresh runner/container; collect kernel/runner termination events where available |
| P2  | Tests                | React warning: `Spinner` uses `defaultProps` on function component                     | `74` occurrences in `TASK-683-test-output.txt`                                                           | Medium   | Open                    | Refactor `Spinner` to use default parameters                                                 |
| P3  | Tests                | React Router future flag warning: `v7_startTransition`                                 | `71` occurrences in `TASK-683-test-output.txt`                                                           | Low      | Open                    | Add Router future flags / prepare v7 migration path                                          |
| P4  | Tests                | React Router future flag warning: `v7_relativeSplatPath`                               | `71` occurrences in `TASK-683-test-output.txt`                                                           | Low      | Open                    | Add Router future flags / prepare v7 migration path                                          |
| P5  | Tests                | Warning from dossiers fetch fallback (`Failed to fetch filtered dossiers`)             | `2` occurrences in `TASK-683-test-output.txt`                                                            | Low      | Open                    | Confirm expected fallback behavior in test setup; reduce noisy warning if intentional        |
| P6  | Local validation env | Docker CLI unavailable locally for direct workflow command testing                     | `docker: command not found` from local check                                                             | Low      | Open                    | Validate Docker workflow steps on GitHub Actions runner                                      |
| P7  | Dependencies (known) | `react-dynamic-sitemap` React peer mismatch                                            | Latest already in use (`1.2.1`)                                                                          | Low      | Wontfix (plain updates) | Leave as known upstream constraint                                                           |
| P8  | Dependencies (known) | `react-image-annotation` / `styled-components` React peer mismatches                   | Latest already in use (`0.9.10`)                                                                         | Low      | Wontfix (plain updates) | Leave as known upstream constraint                                                           |

## Summary

- **Good news:** full CI-style test command passes and output has been captured in `TASK-683-test-output.txt`.
- **Primary blocker:** build early-exit remains unresolved and appears to be external process termination rather than deterministic app/test failure.
- **Secondary issues:** test output includes repeated non-fatal warnings (React defaultProps + React Router future flags) that should be tracked as cleanup work.
- **Environment caveat:** Docker workflow command path cannot be fully validated locally in this container due missing Docker CLI.

## Next Verification Checklist (Actions)

1. Run CI on a fresh GitHub Actions runner and compare build behavior to local container.
2. Inspect whether workflow retries/timeouts reduce flaky terminations for unit and docker jobs.
3. If build still terminates, capture runner-level termination diagnostics (job logs around abrupt end, infra events if available).
