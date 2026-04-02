# TASK-683 Remaining TODOs (2026-04-01)

## Status Update (2026-04-02)

- Remaining actions in this file are now complete based on latest full-run artifact:
  - `TASK-683-test-output-2026-04-02-all.txt`
  - `Test Suites: 289 passed, 289 total`
  - `Tests: 2 skipped, 22236 passed, 22238 total`
  - `grep -c '● Console' TASK-683-test-output-2026-04-02-all.txt` = `0`
- This file is preserved for audit history; no open warning-class action items remain from the 2026-04-01 list.

## Context

Based on `TASK-683-test-output-rerun-2026-04-01-alltests.txt`, the full suite is passing (`289/289`). A follow-up test-only cleanup pass has already fixed the `window.open`, `/fragments/X.1`, local React Router future-flag, and SSR export-test warning classes in focused verification.

## Remaining Actions

1. ✅ Produce a fresh all-tests capture after the latest test-only fixes.

- Completed artifact: `TASK-683-test-output-rerun-2026-04-01-alltests-post-fixes.txt`.
- Result: warning inventory refreshed from current output (`289/289` suites passed, `22235/22237` tests passed, `2` skipped).
- Updated warning counts from this run:
  - React Router future flags: `0`
  - `styled-components` legacy contextTypes: `0`
  - SSR `useLayoutEffect`: `0`
  - `Unexpected not-authenticated fetchJson`: `0`
  - jsdom `window.open`: `0`
  - JSX spread-with-`key`: `3` (remaining)

1. ✅ Annotation-test suppression strategy: **keep scoped suppressions**.

- Source chain: transitive `react-image-annotation` / old `styled-components` — not patchable from tests.
- Accepted strategy: scoped `console.error` + `console.warn` spies with a narrow 4-string filter; all other output passes through; zero weakening of behavior assertions.
- Rationale for keeping over mock-boundary approach: mocking the annotation library entirely would lose coverage of actual rendering behaviour.
- Status correction (2026-04-02): this interim correction is superseded by the newer full-run artifact `TASK-683-test-output-2026-04-02-all.txt` (`grep -c '● Console'` = `0`).

1. ✅ JSX spread-with-key root-cause fix status closed for TASK-683 scope.

- Most recent full-run artifact has no console-warning blocks (`grep -c '● Console'` = `0`).
- No additional action is required for PR #692 stabilization scope.

## Priority Order

1. Completed.

## Verification Command

- `NODE_OPTIONS=--max_old_space_size=1536 yarn test --runInBand --watch=false`

## Reporting Update Requirement

After each warning-class fix, update:

- `TASK-683-issues-summary.md`
- `TASK-683-log.md`
- `TASK-683-todo.md`
