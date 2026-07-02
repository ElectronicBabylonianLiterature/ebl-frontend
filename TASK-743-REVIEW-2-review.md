# TASK-743-REVIEW-2 — Review: PR #743 changes since last cleanup (9f534d5d)

Scope: `9f534d5d..HEAD` — master merge `f0aea64e` (PR #722 content, reviewed in
its own PR; only our conflict resolution is in scope), `563bd213` query
encoding, `60c43aa7` Tools breadcrumb, `93e07bc8` wikidata docs, `6a55be85` RlA
page embed, `6836b3e2` 404 docs.

## Summary

Hard gate honoured first: all pre-existing GitHub review data fetched.

- **Timeline reviews (8):** 6 × `qltysh[bot]` COMMENTED; **Fabdulla1**
  COMMENTED + **CHANGES_REQUESTED** (2026-06-30, "Just one comment, other than
  that, everything looks great").
- **Review threads (29):** 26 resolved+outdated, 2 resolved+current,
  **1 unresolved+current** — Fabdulla1's query-encoding comment on
  `RealiaRepository.ts`. The code fix already landed (`563bd213`, encode +
  table-driven hardening tests); the GitHub thread is simply not yet resolved
  and the CHANGES_REQUESTED state stands until re-review.
- **Issue comments:** 0.

Code review of the branch-side diff surfaced 3 code findings (below), all
addressed at root cause in this pass.

## Findings

| #   | Location                                                            | Finding                                                                                                                                                                                                                                                                                                                               |
| --- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | GitHub review state                                                 | Fabdulla1's CHANGES_REQUESTED + 1 unresolved thread. The requested change (encode the search query) is implemented in `563bd213` with tests. Remaining work is process: reply on the thread pointing at the fix, resolve it, and re-request review. Outward-facing GitHub actions — left for the PR author (see What Has To Be Done). |
| F2  | `src/realia/ui/ReallexikonArticle.tsx`                              | DRY (hard gate): `pageNumber`/`pageCount` arithmetic (`scan - startScan + 1`, `endScan - startScan + 1`) duplicated in `pageCaption` and `RlaPage`. Extracted a shared `pagePosition(info, scan)` helper used by both.                                                                                                                |
| F3  | `src/realia/infrastructure/rlaPageIndex.ts`, `rlaPageIndex.test.ts` | Prose comments added, contrary to the project rule "Do not add comments to the code unless explicitly requested" (boundary-page comment in the source; narrow-no-break-space comment in the test). Removed; the eslint-disable directive (functional, with its required justification) stays.                                         |
| F4  | `src/realia/ui/ReallexikonArticle.tsx:123`                          | The "Show RlA page" toggle stays rendered in the `unavailable` state, offering a retry that can never succeed (the index is cached and the article has no image). Toggle now hidden for `unavailable`; the `error` state intentionally keeps it (the cache is cleared on failure, so retry genuinely refetches).                      |

Reviewed and found sound (no findings): query-encoding fix + tests; breadcrumb
change + link assertions; merge conflict resolution (router.tsx keeps
ScrollToTop + lazy routing; toolsRoutes keeps the Realia superset design with
type-only imports; toolsRoutes.entities repointed to sitemapConfig); badw index
parsing (regex extracts digits only — no injection surface into image URLs);
permission note; 100% coverage on all three new files; docs-only commits.

## Severity

| Finding | Severity                                                                                |
| ------- | --------------------------------------------------------------------------------------- |
| F1      | Blocker (process) — CHANGES_REQUESTED must be cleared before merge; code already fixed. |
| F2      | Low — DRY hard-gate violation, no behaviour change.                                     |
| F3      | Low — project-instruction violation, no behaviour change.                               |
| F4      | Low — misleading UI affordance in a rare state.                                         |

No correctness, regression, or security findings. No console noise: the full
suite runs with zero console output (hard gate verified below).

## Reproduction Steps

1. Review data: REST `pulls/743/reviews`, `pulls/743/comments`,
   `issues/743/comments`; GraphQL `reviewThreads { isResolved isOutdated }`.
2. Diff: `git diff 9f534d5d..HEAD` (branch-side files reviewed line by line).
3. F2/F3/F4: see file/line references above.
4. Gates before and after fixes: `yarn tsc`, `yarn lint`, full
   `yarn test --watchAll=false` (results below).
5. Local behaviour verification: performed continuously by the PR author in the
   running app during this work (sticky controls, page counts pp. 75–78,
   lemma 404s now resolved data-side); this container has no browser/app access.

## Comment status tracking

- Resolved: 28 of 29 threads (26 outdated, 2 current).
- Unresolved: 1 — Fabdulla1 on `RealiaRepository.ts` (query encoding). Code
  fix landed in `563bd213`; thread awaits reply + resolution on GitHub.

## Recommendation

Mergeable after: (a) the Fabdulla1 thread is replied to/resolved and re-review
clears the CHANGES_REQUESTED state, and (b) all `TASK-*.md` tracking files are
removed. Code findings F2–F4 are fixed in this pass; all hard gates green.

## What Has To Be Done

1. **[done]** F2 — extract shared `pagePosition` helper (DRY).
2. **[done]** F3 — remove prose comments from `rlaPageIndex.ts` / test.
3. **[done]** F4 — hide the toggle in the `unavailable` state.
4. **[done]** Re-run hard gates after fixes: `yarn tsc`, `yarn lint`, full
   suite with zero console output, 100% coverage on affected files.
5. **[done]** F1 — replied to Fabdulla1's thread pointing at `563bd213`
   (reply 3514469899), resolved the thread (0 unresolved threads remain), and
   re-requested review from Fabdulla1. The `CHANGES_REQUESTED` decision stands
   until Fabdulla1 re-reviews — that dismissal is theirs to make.
6. **[done]** Pushed `add-realia` (`6836b3e2..520d18b2`) so `qltysh[bot]`
   re-scans the new RlA-embed code; watch for fresh bot findings.
7. **[pending — external]** Fabdulla1 re-review to clear CHANGES_REQUESTED.
8. **[pre-merge]** Remove all `TASK-*.md` tracking files (743, REVIEW-2,
   QUERY-ENCODE, BREADCRUMB-TOOLS, REALIA-WIKIDATA, 404-LEMMAS, RLA-EMBED).
