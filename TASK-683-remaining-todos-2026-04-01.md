# TASK-683 Remaining TODOs (2026-04-01)

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

1. Decide whether to keep or replace the annotation-test suppressions.

- Source chain remains the transitive `react-image-annotation` / old `styled-components` stack.
- Current state: scoped suppression in the two affected annotation suites keeps behavior coverage intact and removes test noise.
- Done when: either the suppression remains as the accepted test-only strategy or a stricter mock boundary is implemented without weakening assertions.

1. JSX spread-with-key root-cause fix is blocked by the current scope.

- Hotspot remains in production component code under `src/fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation.tsx`.
- Current constraint: no non-test code changes are allowed.
- Done when: either the tests-only constraint changes and the production fix is approved, or the warning is accepted as unresolved at source.

## Priority Order

1. Fresh all-tests capture.
2. Annotation-test suppression follow-up decision.
3. JSX spread-with-key source decision if scope changes.

## Verification Command

- `NODE_OPTIONS=--max_old_space_size=1536 yarn test --runInBand --watch=false`

## Reporting Update Requirement

After each warning-class fix, update:

- `TASK-683-issues-summary.md`
- `TASK-683-log.md`
- `TASK-683-todo.md`
