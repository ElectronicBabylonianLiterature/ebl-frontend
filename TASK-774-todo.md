# TASK-774 — TODO

PR: [#774](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774)
Head reviewed: `eac106a4` · Base: `chore/ts7-tsconfig-migration` (#773)
Last updated: 2026-09-17 (round 6 review + remediation — every finding fixed except the cleanup, which was excluded by instruction)
Verdict: **13 of 18 findings fixed in the working tree, nothing committed.** F3 (delete the task docs) excluded by instruction; F4 (clear the review), F9 and F14 (merges) are yours.

## Round 6 — remediation — DONE

- [x] F1 — `RealiaDisplay.redirectFetching.test.tsx` now waits on the landed redirect, not a call counter on a 1000 ms budget
- [x] F1 — `LocationProbe`/`RealiaRouteEntry`/`expectLocation`/`waitForLocation`/`renderRealiaRoute` extracted into `RealiaDisplay.testSupport.tsx` (DRY)
- [x] F2 — deleted the verbatim duplicate `createScript.test.ts`
- [ ] F3 — delete the eight tracked `TASK-*.md` files — **excluded by instruction**
- [ ] F4 — dismiss / re-request the CHANGES_REQUESTED review — **yours**
- [x] F5 — PR description corrected on GitHub (the task docs are now described as deliberately tracked and due for deletion before merge)
- [x] F6 — `useAnnotationKeyboardShortcuts.ts` and `useFragmentAnnotationState.ts` brought to 100/100/100/100
- [x] F7 — `fullyCoveredPaths` extended from 35 to 47 paths, including every write-path file this PR touches
- [x] F8 — documented why stacked PRs do not upload coverage to qlty
- [ ] F9 — **needs a merge commit, not requested** — merge master into the base branch, or land #773 first
- [x] F10 — bluebird guard widened to subpaths, `require.resolve` and `package.json`; verified against a scratch repository
- [x] F11 — the install retry loop can now fail the step (pre-existing bug)
- [x] F12 — fail-fast restored across the CI job's steps
- [x] F13 — the `isCancellation` trade-off documented in `README.md`; behaviour deliberately unchanged
- [ ] F14 — merge the three outstanding master commits — **needs a merge commit, not requested**
- [x] F15 — `caniuse-lite` refreshed; "No target browser changes"
- [x] F16 — type annotations added, shadowing removed, redundant `onClick` branch dropped
- [x] Pre-existing — fixed the leaked `keyup` listener in `useAnnotationKeyboardShortcuts`'s effect cleanup

### Gates after remediation

- [x] `yarn lint` — PASS
- [x] `yarn tsc` — PASS
- [x] 250-line ceiling — PASS, largest touched file is 219 lines
- [x] `yarn test:ci` — PASS (504 suites, 4428 tests, 50 snapshots, exit 0)
- [x] Console-clean — PASS (zero console output; the `browserslist` line is gone too)
- [x] `yarn build:ci-stable` — PASS ("Compiled successfully", zero warnings)
- [x] Coverage — global 95.09 / 87.97 / 94.73 / 95.23 (up from 94.84 / 87.49 / 94.63 / 94.98); all 48 per-path gates at 100%

## Review pass — round 4 — DONE

- [x] Fetch all timeline review events (3: qltysh[bot] COMMENTED ×2, Fabdulla1 CHANGES_REQUESTED — still standing)
- [x] Fetch all inline review comments (6, all qltysh[bot]) with resolution + outdated status via GraphQL (6/6 resolved, 6/6 outdated)
- [x] Fetch all general/issue comments (0)
- [x] Check for sourcery-ai and other bot reviewers (sourcery-ai absent — not installed on this repo)
- [x] Check CI checks on head `502c1ccf` (all green: test, CodeQL, Analyze (javascript), GitGuardian ×3, qlty check; docker/docker-test skipped)
- [x] Check qlty status (`qlty check` = success; 0 blocking issues remaining)
- [x] Check CodeQL (both check runs green; alerts API returns `Resource not accessible by integration` for this token — noted as a limitation in the review)
- [x] Check for dev container configuration changes (**NONE** — verified vs base _and_ vs master; only the two workflow files changed in the whole stack)
- [x] Check for new `.md` files (**5 tracked `TASK-774-*.md` added**; `.gitignore` guard reverted in the head commit)
- [x] Gate: `yarn lint` — PASS
- [x] Gate: `yarn tsc` — PASS
- [x] Gate: full test suite — PASS (426 suites, 3695 passed, 2 skipped, 50 snapshots, exit 0)
- [x] Gate: console-clean — PASS (zero console errors, warnings, act warnings, unhandled rejections)
- [x] Gate: 250-line ceiling on touched `.ts`/`.tsx` — PASS (max 249, `LemmaAnnotation.tsx`)
- [x] Gate: coverage — global 94.22/86.07/93.92/94.34 vs 93/85/93/93; all 10 per-path gates at 100%
- [x] Independently verify the Sass claim by recompiling both trees — 59/59 byte-identical, 0 differ, 0 fail
- [x] Verify bluebird is gone from this branch (0 refs in `src`, absent from `package.json`, `cancellableFetch` deleted)
- [x] Verify the write-cancellation guarantee is structural (`postJson`/`putJson`/`JsonApiClient`/`getOrFetch` take no signal)
- [x] Review the CI `pull_request` base-glob widening for secret exposure (`pull_request` not `pull_request_target`; docker still master-gated)
- [x] Reproduce the `Error.captureStackTrace` regression in Node with the API deleted
- [x] Re-run `git merge-tree --write-tree HEAD origin/master` against the current head
- [x] Rewrite `TASK-774-review.md` — metadata header, friendly summary, Details table, per-finding detail, What Has To Be Done

## Remediation — 2026-09-10 — DONE (uncommitted working tree)

- [x] **F1** `captureStackTrace` helper extracted to `src/common/utils/captureStackTrace.ts`; `ApiError` uses it; 3 regression tests in `ApiError.test.ts` + 4 helper tests, all failing without the fix
- [x] **F1b** Re-verified the `deserializeJson` guard removal — genuinely test-only, stays removed
- [x] **F3** Five `TASK-774-*.md` untracked with `git rm --cached`; `.md` delta vs master is `README.md` only
- [x] **F5** `doLoad` typed `DebouncedFunc`; `componentWillUnmount` calls `.cancel()`; `BibliographyEntryForm.unmount.test.tsx` added (2 tests, one fails without the fix)
- [x] **F6** Write integration test now records each write's settled outcome and asserts the first resolved; verified it fails when the first request is disturbed
- [x] **F7** Per-path 100% gate widened from 10 to 49 production modules; global floor re-measured against untouched code only and set to 93/84/93/93 (measured 93.60/84.80/93.20/93.73)
- [x] **F8** qlty coverage upload gated on `push` or a `master` base
- [x] **F2 (partial)** `No bluebird` CI step added — fails the build on any bluebird import under `src`; verified clean here, matches all 232 files on master
- [x] README updated to document why a debounced write must cancel its timer as well as supersede
- [x] Gates re-run: lint PASS, tsc PASS, 428 suites / 3704 passed / zero console output / all touched files ≤ 249 lines

## Gate re-audit — 2026-09-10 — DONE

- [x] **Pre-existing** `BibliographyEntryForm.tsx` was at 97.67/96/93.75/97.61 despite being modified this round — the "100% on affected code" gate was not met and I had reported completion without checking. Root cause: the suite only drove the happy path, leaving `applyInvalidEntry` and the empty-submit branch uncovered
- [x] Added `BibliographyEntryForm.invalidEntry.test.tsx` (3 tests) — file is now 100/100/100/100 and added to `fullyCoveredPaths` (50 gated modules)
- [x] **DRY** Extracted the shared debounce/mock helpers to `BibliographyEntryForm.testSupport.tsx`; the unmount suite dropped 52 → 37 lines
- [x] Fixed two lint errors at the root: renamed `useFakeTimersAroundTests` (tripped `react-hooks/rules-of-hooks`) and replaced `.closest('form')` with a `data-testid`, following `TransliterationForm`'s convention
- [x] **Review gate** `yarn build:ci-stable` — exit 0, zero warnings
- [x] **Review gate** Verified the guard survives minification in the shipped bundle; 0 unguarded `Error.captureStackTrace(` calls remain, and 9 vendor calls in the same bundle are already optional-chained — independent confirmation that F1 was real
- [x] Verified every file this PR changed is at 100/100/100/100

## Could not be fully satisfied

- [ ] **Running the modified application interactively** — `REACT_APP_DICTIONARY_API_URL` is `http://localhost:8001`, which is not running here. The production build and a bundle inspection were done instead; a jsdom boot of the built app was inconclusive (no auth0/API) and is not claimed as verification.

## Deliberately not done

- [ ] **`.gitignore` `TASK-*.md` rule** — round 3 reverted it at your request; re-adding would undo an explicit instruction. Untracking the files achieves the same result. Ask and I will add it back.
- [ ] **Deleting the three untracked `TASK-ts7-migration-*.md`** — untracked, so they cannot reach the PR; deleting your scratch files is your call.

## NEXT STEPS — what is actually left

In order. None of these are code changes to this branch.

1. [ ] **Commit this merge** — done as of this commit; the tree was staged with `MERGE_HEAD` set until then.
2. [ ] **Land #773.** One conflict with master: `src/router/sitemap.tsx`. The sides are orthogonal — #773 changes `Bluebird<SlugsArray>` to `Promise<SlugsArray>`, master adds an `encode` parameter. Take both. Minutes of work.
3. [ ] **Let GitHub retarget #774 to master** once #773 lands.
4. [ ] **Re-request review from Fabdulla1** to clear the standing `CHANGES_REQUESTED` (2026-08-04). Every point in it is fixed in the code. Reviewer assignment is yours — I never touch it.
5. [ ] **Push and confirm CI is green** on the retargeted PR.
6. [ ] **Delete the eight scratch `.md` files** before merge: five `TASK-774-*.md`, three `TASK-ts7-migration-*.md`. All untracked, so none can reach the PR, but they are still on disk.
7. [ ] **Re-check `Edition.test.tsx`** after retargeting — master's two assertions should win, minus master's bluebird import.

## Known debt inherited from master — not this PR's to fix

- [ ] **46 files exceed the 250-line ceiling**, e.g. `about/ui/bibliography.tsx` (1290), `test-support/complexTestText.ts` (3514), `auth/react-auth0-spa.test.tsx` (868). These arrive with the merge untouched. Worth a separate ticket; fixing them here would bury the bluebird diff.
- [ ] **`REACT_APP_DICTIONARY_API_URL` points at `localhost:8001`**, which is not running in this devcontainer, so the app could never be verified interactively. The production build and a shipped-bundle inspection were done instead.

## Master merge — DONE 2026-09-10

- [x] **F2 COMPLETE** — 24 conflicts resolved by rule, #791 decided as supersede-not-abort, 500 suites / 4395 tests green, tsc + lint + build clean, zero console output, zero coverage-threshold failures, zero bluebird, zero casing collisions. Global coverage 94.87 / 87.60 / 94.65 / 95.00. Full account in `TASK-774-merge-master-handoff.md`.
- [x] Deleted this PR's competing `fragmentarium/application` split and its 23 orphaned tests; master's structure wins
- [x] Restored `PeriodAccordion.test.tsx` and `SignImages.empty.test.tsx` after cutting them too hastily — they cover live code
- [x] Replaced master's bluebird-cancellation query test with the equivalent under the new model
- [x] Removed master's `silenceConsoleErrors()` blanket mock in favour of `expectConsoleErrors(/not found\./)`
- [x] Re-applied signal threading to master's `FragmentService` / `fragmentServicePorts` / `FragmentRepository` / `SignImages`
- [x] Kept the two files I pushed over the 250-line ceiling under it: `FragmentService.ts` 252 → 246, `RealiaRepository.test.ts` 258 → 204

## Superseded blocker list

## Blockers — still open, not fixable in this diff

- [x] **F2 COMPLETE 2026-09-10** — master reconciled, all gates green, merge staged uncommitted. Earlier attempt: all 24 conflicts resolved and the #791 question decided (supersede, don't abort), but stopped at 220 TS errors — two competing `fragmentarium/application` implementations, 5 filename casing collisions, 56 bluebird files and ~17 unseen master modules. Merge aborted; attempt preserved as `merge-resolved.patch`. **Land #773 first** — it has exactly one conflict with master (`sitemap.tsx`, orthogonal sides)
- [ ] **F4** Re-request review from Fabdulla1 to clear the standing `CHANGES_REQUESTED` — reviewer assignment is yours
- [ ] **F9** At merge, take master's two `Edition.test.tsx` assertions minus its bluebird import
- [x] ~~Correct the `502c1ccf` claim about the `.md` delta in the PR description~~ — done on GitHub

## Original blocker list (round 4 review)

### As reviewed, before remediation

- [ ] **F1** Restore the `Error.captureStackTrace` guard in `src/http/ApiClient.ts:45`; extract into a tested helper so the 100% gate still holds
- [ ] **F2** Resolve the master merge — 44 new bluebird-importing files on master, 55 in the merged tree, 27 conflicting paths, and master's #791 save-cancellation fix to reconcile
- [ ] **F3** `git rm` the five `TASK-774-*.md` files and restore the `TASK-*.md` `.gitignore` rule
- [ ] **F4** Re-request review from Fabdulla1 to clear the standing `CHANGES_REQUESTED`

## Non-blocking

- [ ] **F5** Cancel the debounced `doLoad` in `BibliographyEntryForm.componentWillUnmount`; type it as `DebouncedFunc`
- [ ] **F6** Tighten or rename the "does not abort the first write in flight" test — it currently cannot fail
- [ ] **F7** Optionally widen the per-path 100% coverage gate to `src/common/utils/**` and `src/http/**`

## Informational — acknowledged, no action required

- [x] **F8** CI base-glob widening reviewed — low risk, correct trigger choice; optional qlty-upload gate on `github.base_ref`
- [x] **F9** Two `xit` tests in `Edition.test.tsx` inherited from #773; master has working versions — take master's side at merge
- [x] **F10** No dev container configuration changes anywhere in the stack

## Housekeeping before merge

- [x] ~~Delete the five tracked `TASK-774-*.md` files~~ — untracked instead, so they stay usable on disk while leaving the PR
- [ ] Delete the five `TASK-774-*.md` and three `TASK-ts7-migration-*.md` files from disk when the PR merges
- [x] ~~Add a CI guard against bluebird~~ — the `No bluebird` step
- [x] ~~Re-run all gates after the F1 fix~~

## Nothing committed

- [ ] No commits, branches or pushes were made. All remediation sits in the working tree awaiting your decision.

---

## Review pass — round 5 — 2026-09-16 — DONE

Review only. No code, config or test file was modified; the only file written is `TASK-774-review.md` plus this todo and the log.

- [x] Fetch all timeline review events (3 — unchanged: qltysh[bot] COMMENTED x2, Fabdulla1 CHANGES_REQUESTED still standing)
- [x] Fetch all inline review comments with resolution + outdated status via GraphQL (6/6 resolved, 6/6 outdated)
- [x] Fetch all general/issue comments (0)
- [x] Confirm no sourcery-ai or other bot reviewer participates (only qltysh[bot]; full timeline of 44 events checked)
- [x] Check CI checks on head `7c9b1d01` — **`test` FAILURE**; CodeQL, Analyze (javascript), GitGuardian x3 all SUCCESS; docker/docker-test skipped
- [x] Check qlty (`qlty check` status green, **9 blocking issues** on the dashboard; dashboard needs its own credentials, not available here — reproduced locally with `qlty smells --all` instead)
- [x] Check CodeQL ("No new alerts in code changed by this pull request"; repo-wide alert list still `Resource not accessible by integration` for this token)
- [x] Check for dev container configuration changes — **none in `.devcontainer/`**, but GitHub shows `Dockerfile +4/-4` (master's digest pin arriving via the stale base). Raised as F10 for explicit confirmation.
- [x] Check for new `.md` files — **5 `TASK-774-*.md` tracked again** (re-added by `7c9b1d01`), 8 against master counting #773's three
- [x] Gate: `yarn lint` — PASS
- [x] Gate: `yarn tsc` — PASS
- [x] Gate: `CI=true yarn build:ci-stable` — PASS, "Compiled successfully", zero warnings
- [x] Gate: full suite under the documented command — PASS, 500 suites, zero console output
- [x] Gate: full suite under **CI's** command — **FAIL**, `FragmentService.queries.test.ts` (F1); reproduced locally and root-caused
- [x] Gate: 250-line ceiling on touched files — 1 over (`FragmentAnnotation.tsx`, 432; pre-existing) — F6
- [x] Gate: DRY — **FAIL**, 93 duplicated lines + a duplicated concurrency primitive — F2
- [x] Verify Fabdulla1's three findings are genuinely fixed, by call path and not by PR description (all three confirmed fixed)
- [x] Verify bluebird removal (0 references in `src` and `package.json`; 3 transitive in `yarn.lock`)
- [x] Verify the Sass migration (47 files on `@use`, 0 `darken()`, 1 `@import` left in `MapTab.sass`) — F7

## Round 5 — remediation — 2026-09-16 — DONE

Applied to the working tree. **Nothing committed.**

- [x] **F1** `FragmentService.queries.test.ts` awaits the call and asserts on the resolved value; `result` typed `FragmentAfoRegisterQueryResult`; verified under CI's flags (22 passed)
- [x] **F1** Swept the suite — only occurrence; `testDelegation` already awaits, the other promise variable uses `toBe` (identity, safe)
- [x] **F2** Inline `PeriodAccordion` removed from `SignImages.tsx`; imports the extracted component
- [x] **F2** `SignImageFigures.tsx` and `signClusterAnnotations.ts` deleted; `runWithConcurrencyLimit` removed from `signImageGrouping.ts`
- [x] **F2** Live path now uses `ConcurrencyLimiter` — the PR's stated migration actually ships
- [x] **F2** `SignImages.tsx` added to `fullyCoveredPaths`; all 7 `signs/ui/display` modules at 100/100/100/100
- [x] **F3** All 8 `TASK-*.md` untracked, then **re-tracked and committed on explicit instruction** — they are part of the branch on purpose
- [x] **F5** `yarn test:ci` added with CI's exact flags; `main.yml` calls it; copilot-instructions names it as the gate
- [x] **F6** `FragmentAnnotation.tsx` split 432 → 158, plus 4 focused modules, all ≤ 216; 8 existing tests pass unchanged
- [x] **F6** `reset` made `useCallback`-stable so the keyboard hook depends on it honestly (removes a pre-existing exhaustive-deps warning without suppressing it)
- [x] **F7** `MapTab.sass` migrated to `@use`; recompiled — byte-identical CSS (768 bytes); zero `@import` left in `src`
- [x] **F8** Guard regex widened (7/7 import spellings incl. double quotes and dynamic import); PR number dropped from the message
- [x] **F9** `ApiClient.fetch` made `private`; README claim now literally true
- [x] **F12** `actions/checkout` and `actions/setup-node` bumped v4 → v5 in 3 workflows
- [x] On request: `.qlty/` generated output git-ignored, `.qlty/qlty.toml` still tracked
- [x] Gate: `yarn lint` — PASS
- [x] Gate: `yarn tsc` — PASS
- [x] Gate: `yarn test:ci` — PASS, 500/500 suites, 4395/4395 tests, 50 snapshots, exit 0, zero console output
- [x] Gate: coverage — global 94.84/87.49/94.63/94.98 vs floors 93/84/93/93; all per-path 100% gates met
- [x] Gate: `CI=true yarn build:ci-stable` — PASS, zero warnings
- [x] Gate: 250-line ceiling — every file this PR changes is ≤ 250
- [x] Gate: DRY — duplicate module removed, one concurrency primitive remains

## Round 5 — what remains (yours)

- [ ] **F4** Clear Fabdulla1's standing `CHANGES_REQUESTED` — reviewer assignment not touched
- [ ] **F10** Confirm the `Dockerfile` digest pin + package bumps (master's change via the stale base; HEAD == master)
- [x] **F3** `.gitignore` rule deliberately not added — the task docs are tracked on purpose
- [ ] Correct the PR description — it still says only `README.md` changes, which is not true while the task docs are tracked
- [x] Committed as `75c1d81b` on `chore/remove-bluebird` (not pushed)
- [ ] Confirm the `test` check is green on GitHub before re-review
- [ ] Land #773, let GitHub retarget to master, re-verify
- [ ] Delete the task-tracking docs before merge

## Noted, not acted on

- [ ] 3 files over the ceiling are byte-identical to master and unchanged by this PR: `about/ui/bibliography.tsx` (1290), `corpus/ui/ChapterViewLine.tsx` (392), `corpus/domain/manuscript.test.ts` (265) — own PR
