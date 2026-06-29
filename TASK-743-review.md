# TASK-743 — Review: PR #743 "Add Dictionary of Realia tool"

PR: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/743
Branch: `add-realia` → `master` · State: open

## Summary

Reviewed PR #743. Per the hard gate, all pre-existing GitHub review data was
fetched first: timeline review events and every inline/issue comment, with
resolution and outdated status.

- **Timeline reviews:** 6 events, all `COMMENTED` (no `APPROVED` /
  `CHANGES_REQUESTED`), all from the `qltysh[bot]` automated quality bot. No
  human reviewer has requested changes or approved.
- **Inline review comments:** 28 total, all from `qltysh[bot]`. GraphQL thread
  status: **18 resolved/outdated, 10 unresolved + current.**
- **Issue (general) comments:** 0.

All 10 unresolved findings were addressed at their root cause in this task
(see Findings). They split into two automated rule classes:
`qlty:boolean-logic` (overly complex binary expressions) and
`qlty:similar-code` (duplicated blocks — a DRY hard-gate violation).

## Findings

### Resolved in this task (the 10 unresolved + current bot threads)

| #   | File:Line (at flag)                                                  | Rule          | Resolution                                                                                                                                |
| --- | -------------------------------------------------------------------- | ------------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | `src/realia/domain/RealiaEntry.ts:78`                                | boolean-logic | Extracted the 5-clause `hasOwnContent` OR into a named `hasOwnContent(entry)` predicate using `[...].some(Boolean)`.                      |
| F2  | `src/realia/ui/RealiaAfoRegister.tsx:19`                             | boolean-logic | Replaced the 6-clause `Boolean(... \|\| ...)` in `afoEntryHasVisibleContent` with `[...].some(Boolean)`.                                  |
| F3  | `src/realia/ui/RealiaNavMenu.tsx:48` & `:128`                        | similar-code  | Extracted a shared `NavAnchor` component; the top, section, and subsection links now all reuse it (removes the duplicated anchor markup). |
| F4  | `src/realia/domain/RealiaEntry.afoVolume.test.ts:145` & `:166`       | similar-code  | Converted the `formatAfoRegisterVolumeTitle` suite to a single `it.each` table; duplicated arrange/assert blocks collapse to one.         |
| F5  | `src/realia/infrastructure/RealiaRepository.afo.test.ts:90` & `:110` | similar-code  | Converted the three AfO-string-derivation tests to one `it.each` table.                                                                   |
| F6  | `src/realia/ui/RealiaDisplay.afoRegister.test.tsx:108` & `:149`      | similar-code  | Extracted a `sharedAfoVolumeEntry(mainWord, entries)` builder reused by the three two-entry "AfO 44/45" tests.                            |

All six changes are behaviour-preserving refactors; no production logic was
altered (predicates evaluate identically; `NavAnchor` renders the same markup).

### Already resolved / outdated before this task (18 threads)

These were addressed by the PR author as the branch evolved (prior
`similar-code` / `boolean-logic` flags on `RealiaEntry.test.ts`,
`RealiaDisplay.test.tsx`, `RealiaDisplay.tsx`, `RealiaRepository.test.ts`).
GitHub marks them resolved+outdated. No action required.

### Process / repo

- F7 — `.github/copilot-instructions.md` did not make "fetch all pre-existing
  GitHub reviews and comments" a hard gate for reviewing. **Fixed:** added two
  hard-gate bullets to the Review Guidelines (fetch-all-first, and
  address-every-finding-including-pre-existing).

## Severity

| Finding | Severity                                                             |
| ------- | -------------------------------------------------------------------- |
| F1, F2  | Low — readability/complexity (no behaviour change).                  |
| F3–F6   | Low — DRY (test + view duplication); repo treats DRY as a hard gate. |
| F7      | Process — review-guideline gap.                                      |

No correctness, regression, or security findings. The bot raised no such issues,
and the Realia domain/repository/display logic carries dedicated unit + RTL
coverage (all green).

## Reproduction Steps

1. `gh`-equivalent via REST: `GET /repos/.../pulls/743/reviews`,
   `/pulls/743/comments`, `/issues/743/comments`.
2. Thread resolution via GraphQL `pullRequest.reviewThreads { isResolved
isOutdated path line }` → 10 unresolved+current.
3. Each flagged location inspected in the working tree and refactored.
4. Gates: `yarn tsc` (clean), `yarn lint` (clean after Prettier),
   `yarn test --watchAll=false` (332 suites / 3354 passed, 2 pre-existing skips,
   console-clean).

## Recommendation

Approvable from the automated-review standpoint: all 10 unresolved bot threads
are resolved at root cause and all hard gates pass. No human `CHANGES_REQUESTED`
is outstanding. Before merge, the bot threads should be marked resolved on
GitHub (the bot re-scans on push), and the `TASK-743-*.md` tracking files must
be removed.

## What Has To Be Done

1. **[done]** Resolve F1 — `RealiaEntry.ts` complex boolean → named predicate.
2. **[done]** Resolve F2 — `RealiaAfoRegister.tsx` complex boolean → `.some(Boolean)`.
3. **[done]** Resolve F3 — `RealiaNavMenu.tsx` duplicated anchors → shared `NavAnchor`.
4. **[done]** Resolve F4 — `RealiaEntry.afoVolume.test.ts` → `it.each`.
5. **[done]** Resolve F5 — `RealiaRepository.afo.test.ts` → `it.each`.
6. **[done]** Resolve F6 — `RealiaDisplay.afoRegister.test.tsx` → shared builder.
7. **[done]** Resolve F7 — add fetch-all + address-all hard gates to copilot instructions.
8. **[done]** Hard gates: `yarn tsc`, `yarn lint`, full `yarn test --watchAll=false` — all green, console-clean.
9. **[pending — push]** Push the branch so `qltysh[bot]` re-scans and the 10
   threads auto-resolve; confirm no new findings.
10. **[pending — pre-merge]** Remove `TASK-743-todo.md`, `TASK-743-log.md`,
    `TASK-743-review.md` before merging.
11. **[pending — external]** No human reviewer has reviewed yet; request review
    if required by the merge policy.
