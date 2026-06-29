# TASK-REALIA-RLA-COUNT — Work Log

## Goal

In Realia search, count RlA (Reallexikon) articles in the result badge, just as
AfO articles are counted.

## Investigation

- Badge logic lives in `getSourceBadges` in
  `src/realia/ui/RealiaResultsList.tsx`. The RlA badge was presence-only
  (`{ label: 'RlA' }`) while AfO already carried
  `{ label: 'AfO', count: entry.afoRegister.length }`.
- `RealiaEntry.reallexikon` is already a `ReallexikonEntry[]`, so the count is
  just `entry.reallexikon.length`; no domain/repository/DTO changes needed.

## Changes

- `src/realia/ui/RealiaResultsList.tsx` — RlA badge now pushes
  `{ label: 'RlA', count: entry.reallexikon.length }`.

## Tests

- `src/realia/ui/RealiaResultsList.test.tsx` — renamed the badge test to
  "renders RlA, AfO and References counts"; built 2 RlA / 3 AfO / 1 reference;
  asserts the rendered counts are `['(2)', '(3)', '(1)']`. Relaxed the RlA
  assertion from `toHaveTextContent(/^RlA$/)` to `toBeInTheDocument()` (matching
  the AfO assertion), since the badge now renders label and count in sibling
  spans so the badge's full text content is "RlA(2)".

## Pre-existing/affected failures fixed (same task)

The full suite surfaced 2 failures, both in
`src/realia/ui/RealiaSearch.integration.test.tsx`, both a direct consequence of
this change (legitimate UI change, not a defect to mask):

1. "renders the rich preview..." — its `getAllByText(/^\(\d+\)$/)` assertion
   `['(2)', '(5)']` now also receives the new RlA `(1)` count first. Root cause:
   the RlA badge now emits a count. Fixed by updating the expectation to
   `['(1)', '(2)', '(5)']`.
2. "matches the rendered rich-preview markup" — snapshot now includes the new
   `realia-results-list__source-count` span "(1)" under the RlA badge. Inspected
   the diff (only the added RlA count span, nothing else) and updated the
   snapshot with `--updateSnapshot` on that file only.

## Gates

- `yarn lint` — PASS (eslint + stylelint, zero errors).
- `yarn tsc` — PASS (zero errors).
- Full `yarn test --watchAll=false` — PASS: 324 suites, 3341 passed / 2 skipped,
  50 snapshots passed, zero console output.

## Process note

- These TASK-\*.md tracking files were initially missed for this task; created
  to comply with the mandatory per-task TODO/log convention.
- Reminder: remove all TASK-\*.md tracking files before merging.
