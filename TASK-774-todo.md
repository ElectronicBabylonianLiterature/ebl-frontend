# TASK-774 — TODO

PR: [#774](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774)
Head reviewed: `0e679943` · Base: `chore/ts7-tsconfig-migration` (#773)
Last updated: 2026-09-09 (review round 3)

## Review pass (this session) — DONE

- [x] Fetch all timeline review events (3: qltysh x2 COMMENTED, Fabdulla1 CHANGES_REQUESTED)
- [x] Fetch all inline review comments (6, all qltysh) + resolution/outdated status (all resolved+outdated)
- [x] Fetch all general/issue comments (0)
- [x] Check for sourcery-ai review/comments (none present on this PR)
- [x] Check CI checks on head (all green: test, CodeQL, Analyze (javascript), GitGuardian x3; docker/docker-test skipped)
- [x] Check qlty statuses (check: 6 blocking issues; coverage 94.3%; coverage diff 98.8%)
- [x] Reproduce qlty's 6 blocking issues locally (`qlty smells --all`) and attribute them
- [x] Check CodeQL alerts (API not accessible to this token; both CodeQL checks green on head)
- [x] Check for dev container configuration changes (NONE — verified vs base and vs master)
- [x] Check for new `.md` files (3 tracked `TASK-ts7-migration-*.md` inherited from #773)
- [x] Gate: `yarn lint` — PASS
- [x] Gate: `yarn tsc` — PASS
- [x] Gate: full test suite — PASS (426 suites, 3695 passed, 2 skipped, 50 snapshots)
- [x] Gate: console-clean — PASS (zero console output across all shards)
- [x] Gate: 250-line ceiling on touched `.ts`/`.tsx` — PASS
- [x] Gate: coverage on affected core files — PASS (100% on all 9 cancellation-primitive files)
- [x] Verify Sass `@import`→`@use` claim (59/59 entrypoints byte-identical CSS)
- [x] Verify no public API lost in the 250-line splits
- [x] Verify no net test loss (340→426 suites, 2001→2200 declarations)
- [x] Write `TASK-774-review.md` with metadata header, summary, Details, and What Has To Be Done

## Remediation pass — DONE (uncommitted working tree)

- [x] **F1** `JsonApiClient` extracted to `src/http/JsonApiClient.ts`; `signal` removed from `postJson`; `src/index.tsx` no longer declares it; 3 consumers updated
- [x] **F2** `git rm --cached` the three `TASK-ts7-migration-*.md` files — `.md` delta vs master is now `README.md` only
- [x] **F3** 401/403 tests collapsed into `it.each` (179 → 161 lines)
- [x] **F3** Shared Auth0 scaffold lifted into `react-auth0-spa.testSupport.tsx` (sessionFallback 128 → 57, tokenSecurity 94 → 50); all 6 qlty blocks cleared
- [x] **F4** Global floor widened to 93/85/93/93 **and** per-path 100/100/100/100 gates added for the 10 files this PR owns
- [x] **F6** Single `JsonApiClient` declaration; divergent copy in `appDriverHelpers.tsx` removed
- [x] **F5** WITHDRAWN — the `xit`s predate both PRs (present at merge-base); master fixed them in #767 and the merge preserves that fix
- [x] Reverted the `TASK-*.md` rule from `.gitignore` (at user request) — `.gitignore` matches base exactly
- [x] Re-ran all gates: lint PASS, tsc PASS, 426 suites / 3695 passed / 0 console output
- [x] Verified per-path coverage gates against merged 7-shard coverage data — all 10 at 100%

## Still outstanding — not mine to do

- [ ] **BLOCKER** Re-review needed to clear the standing `CHANGES_REQUESTED` from 2026-08-04
- [ ] Commit the working tree (nothing committed or pushed — awaiting explicit go-ahead)
- [ ] Merge #773 first, let GitHub retarget this PR to master
- [ ] Re-confirm F2 holds against master after retarget; budget for ~19 conflicting files
- [ ] Delete the five `TASK-774-*.md` and three `TASK-ts7-migration-*.md` scratch files before merge (now visible as untracked, since the ignore rule was reverted)
