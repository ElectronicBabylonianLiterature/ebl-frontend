# TASK-743-REVIEW-2 — Review PR #743 changes since the last cleanup (9f534d5d)

## Scope

Review commits `9f534d5d..HEAD`: master merge (f0aea64e), query encoding
(563bd213), Tools breadcrumb (60c43aa7), wikidata investigation docs (93e07bc8),
RlA page embed (6a55be85), 404-lemmas investigation docs (6836b3e2). Then address
all findings directly.

## TODO

- [x] Read `.github/copilot-instructions.md` and follow it.
- [x] HARD GATE: fetch all pre-existing GitHub reviews/comments + resolution
      status (8 timeline reviews incl. Fabdulla1 CHANGES_REQUESTED; 29 threads:
      28 resolved, 1 unresolved+current = query encoding, fixed in 563bd213).
- [x] Review the full diff (correctness, regressions, security, coverage, DRY,
      250-line gate, console noise).
- [x] Run gates: yarn tsc, yarn lint, full test suite.
- [x] Write `TASK-743-REVIEW-2-review.md` (Summary/Findings/Severity/
      Reproduction Steps/Recommendation/What Has To Be Done, comment status).
- [x] Address every finding at root cause (F2 pagePosition helper, F3 comments
      removed, F4 unavailable-toggle hidden + retry test); gates re-run green.
- [x] Mark 404-lemmas task resolved (user confirmed data-side fix).
- [ ] Remove TASK-743-REVIEW-2-\*.md (and other TASK files) before merge.
