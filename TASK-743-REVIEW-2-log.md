# TASK-743-REVIEW-2 — Work Log

## 1. Hard gate: pre-existing review data fetched first

- 8 timeline reviews: 6 × qltysh[bot] COMMENTED; Fabdulla1 COMMENTED +
  **CHANGES_REQUESTED** (2026-06-30).
- 29 review threads via GraphQL: 26 resolved+outdated, 2 resolved+current,
  1 **unresolved+current** — Fabdulla1's query-encoding comment on
  `RealiaRepository.ts`; already fixed in code by `563bd213`.
- 0 issue comments.

## 2. Review scope and method

Diff `9f534d5d..HEAD`. Master-merge content (PR #722) reviewed only for our
conflict resolution (previously audited; tsc/tests prove integration). Branch
files reviewed line by line: query encoding, breadcrumbs, RlA embed
(rlaPageIndex, ReallexikonArticle, RealiaReallexikon, Realia.sass, tests),
docs-only commits.

## 3. Findings and fixes (all addressed this pass)

- **F1 (blocker, process):** CHANGES_REQUESTED + 1 unresolved thread; the code
  fix landed in `563bd213`. Remaining: reply/resolve on GitHub + re-request
  review — outward-facing, left to the PR author.
- **F2 (DRY hard gate):** duplicated page arithmetic in `ReallexikonArticle`
  (`pageCaption` + `RlaPage`) → extracted shared `pagePosition(info, scan)`.
- **F3 (project rule "no comments"):** removed the prose comments added in
  `rlaPageIndex.ts` (boundary page) and `rlaPageIndex.test.ts` (nnbsp note);
  kept the functional eslint-disable directive.
- **F4 (misleading affordance):** the "Show RlA page" toggle remained rendered
  in the `unavailable` state though retry can never succeed → toggle now hidden
  for `unavailable`; `error` intentionally keeps it (cache cleared on failure,
  retry refetches). Tests updated to lock in both behaviours (hidden toggle on
  unavailable; successful retry after error).

## 4. Gates after fixes

- `yarn lint` (eslint + stylelint): clean.
- `yarn tsc`: clean.
- Full `yarn test --watchAll=false`: 336 suites / 3396 passed, 2 pre-existing
  skips, 0 failures, zero console output.
- Coverage on affected files (`rlaPageIndex.ts`, `ReallexikonArticle.tsx`,
  `RealiaReallexikon.tsx`): 100% statements/branches/functions/lines.
- Line counts: all affected files ≤ 176 lines (250 gate).

## 5. Housekeeping

- Marked TASK-REALIA-404-LEMMAS as resolved (user-confirmed data-side fix; no
  frontend change needed, matching the investigation conclusion).
- Review exported to `TASK-743-REVIEW-2-review.md` with the mandated sections
  and comment-status tracking.
