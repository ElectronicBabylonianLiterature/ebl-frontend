# TASK-pr767-since-last-review — TODO

Review the changes on `add-realia-annotation` (PR #767) made since
`TASK-pr767-post-docs-review.md`, which covered `f82c4bf7..59dc9bcd`.

## Scope

- [x] Determine the unreviewed range. Last review covered through `59dc9bcd`;
      its own fixes landed as `0082a777` and are described there as done.
- [x] Confirm the unreviewed product change is `b2404b16` (Redirect realia id
      URLs to the lemma URL).
- [x] Confirm `9286c18e` is docs-only.

## Hard gates

- [x] Fetch **every** pre-existing GitHub review (timeline review events) and
      **every** comment (inline + general/issue) for PR #767, with resolution
      status and outdatedness against the current head.
- [x] `yarn lint` — clean.
- [x] `yarn tsc` — clean.
- [x] `yarn test --watchAll=false` — zero failures **and** zero console output.
      363/363 suites, 3727 passed, 2 pre-existing skips, 0 console lines.
- [x] Coverage 100% on changed files. Full run with `--collectCoverageFrom`
      restricted to the changed files: 100% stmts/branch/funcs/lines on all of
      `RealiaDisplay.tsx`, `RealiaEntry.ts`, `SpanIndicator.tsx`,
      `SpanIndicatorView.tsx`, `useSpanIndicator.ts`, `cssCascade.testSupport.ts`.
- [x] 250-line ceiling on every changed script file.
- [x] API-call-efficiency audit of the touched fetching paths.
- [x] Data-kind separation audit.
- [x] Branch upstream verification (`branch.<name>.merge`, `@{push}`).

## Review artefacts

- [ ] Write `TASK-pr767-since-last-review-review.md` using the required
      template: `Summary`, `Findings`, `Severity`, `Reproduction Steps`,
      `Recommendation`, plus comment-status tracking and `What Has To Be Done`.
- [ ] Keep this TODO and the log updated while working.
- [ ] Remind the user to remove all `TASK-*.md` files before the PR merges.

## Second pass — fixes (user asked for all findings except doc removal)

- [x] F1 — remove the redundant request. `RealiaService` caches resolved entries
      via the house `common/utils/cache` (5 min TTL, 100 keys), keyed by both the
      requested id and the canonical `entry.id`.
- [x] F1 — prove it: `RealiaDisplay.redirectFetching.test.tsx` drives a real
      `RealiaService` over a mocked repository; `find` is asked twice, the
      repository is hit once.
- [x] F3 — extract `RealiaCrossReferenceLink`; all realia page URLs now go
      through `getRealiaPageUrl`.
- [x] F4 — cross-reference links always carry an accessible name.
- [ ] F2 — **needs user decision**: the false rationale lives in `b2404b16`'s
      pushed commit message. Correcting it rewrites history; not done.
- [x] Fix the flaky test found while verifying F1 (raced the redirect's
      transient render). 8/8 deterministic after the rewrite.
- [x] Widen `testDelegation` to accept a factory, so the cache does not break
      the shared-instance delegation tests. No test removed.
- [ ] Re-run all hard gates after the fixes.

## Notes

- The first pass was a review only, with no code changes, per the project rule.
  The second pass makes changes because the user explicitly requested them.
- Nothing is committed: the standing rule is no commit/branch/push without an
  explicit ask.
