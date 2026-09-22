---
task_id: 774
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
title: 'chore: remove bluebird, use AbortController for cancellation'
reviewed_head_sha: ee275e43248ea13ebf2a828cc1fe30255911c36b
base_branch: chore/ts7-tsconfig-migration
base_sha: 4f71cb249bc0db899f1a22ce42ac93ebd961eeda
pr_state: 'open, mergeable: true, mergeable_state: clean (against its own base)'
stacked_on: '#773 (chore/ts7-tsconfig-migration) — OPEN and CONFLICTED against master (mergeable_state: dirty, last updated 2026-08-05)'
master_drift: 3 commits behind master (e281f7ba, af0b7942, 51bfc9ff)
review_date: 2026-09-20
review_round: 8
reviewer: Claude (automated review)
remediation_date: 2026-09-22
remediation_state: '11 of 17 findings closed in the working tree (F5-F11, W5) plus three applied to the PR description on GitHub. F1 excluded by instruction; F2, F3, F4, F12, W1, W2 and W3 cannot be closed from inside this diff.'
verdict: CHANGES REQUESTED — every finding inside the diff is now fixed (F5 through F11, verified by the gates below), and the PR description is corrected. What blocks a merge is outside the code: the eight scratch .md files (excluded from this pass by instruction), the conflicted base PR #773, the outstanding CHANGES_REQUESTED, and CodeQL's inability to diff a PR this size.
findings_total: 17
findings_blocking: 4
findings_major: 2
findings_minor: 6
findings_warning: 2
findings_info: 3
scope_vs_base: 707 files, +44625 / -22668, 38 commits
scope_vs_master: 510 files, +19743 / -10796
scope_note: 'The GitHub diff is inflated: master was merged into this branch but not into the base branch, so roughly 197 files are base-branch drift rather than this PR''s work. Landing #773 (30 files) collapses the GitHub diff to about 510 files — still over CodeQL''s 300-file cap, so it does not fix F4.'
devcontainer_changes: 'NONE. .devcontainer/ is byte-identical to master (Dockerfile, devcontainer.json, inject-secrets.sh, README.md). The root Dockerfile is also byte-identical to master — its +4/-4 in the GitHub diff is base-branch drift. The CI workflows ARE materially changed; see W1 for a line-by-line verdict. Read W1 before merging: no pull request ever builds the Dockerfile.'
tsconfig_note: 'tsconfig.json differs from master (target es5 -> es2020, moduleResolution node -> bundler, baseUrl -> paths) but is IDENTICAL to the base branch, so those changes belong to #773, not to this PR. CRACO compensates for the removed baseUrl via jestConfig.modulePaths and webpackConfig.resolve.modules; verified working. noImplicitAny: false is pre-existing on master and is what lets F5 Group A compile.'
gates:
  note: 'Two sets. "review" is the reviewed sha ee275e43; "remediated" is the working tree after the round-8 fixes.'
  lint: PASS (review) / PASS (remediated) — eslint + stylelint clean, exit 0
  tsc: PASS (review) / PASS (remediated) — clean, exit 0
  test_ci_local: 'PASS (review) — 504 suites, 4428 tests, 50 snapshots, 0 failures, exit 0, 621.7s. PASS (remediated) — 505 suites, 4435 tests, 50 snapshots, 0 failures, exit 0, 796.9s; +1 suite and +7 tests are FragmentRepository.abortSignal.test.ts.'
  console_clean: PASS (review) / PASS (remediated) — zero console.error / console.warn / unhandled rejections in both full runs
  coverage: 'PASS (review) / PASS (remediated) — 95.08 stmts / 87.98 branch / 94.74 funcs / 95.23 lines, identical before and after, no threshold breach. Note Jest subtracts the 50 per-path files from the global figure, so the floors (94 / 86 / 94 / 94) are checked against roughly 94.57 / 86.84 / 94.21, not the printed summary row.'
  coverage_allowlist: PASS — craco.config.js validates fullyCoveredPaths at load; 50 entries, no duplicates, none missing
  line_ceiling_250: 'PASS (review) / PASS (remediated) — no changed or new .ts/.tsx file exceeds 250 lines. Threading the signals pushed FragmentRepository.ts to 253, so ApiFragmentInfo was extracted to fragmentRepositoryInfo.ts: 177 and 84 lines respectively.'
  dry: 'PASS (review, with one exception) / PASS (remediated) — main.yml now calls yarn build:ci-stable instead of repeating its environment; FragmentStatistics and CorpusAttestations replace shapes that were written out four times each; three fragment-info readers share a private helper; two hand-built URLs go through createFragmentPath.'
  no_new_md: FAIL — 8 TASK-*.md files tracked on the branch (F1); the cleanup was excluded from this pass by instruction
  build: PASS in CI; NOT runnable locally — the container OOM-kills fork-ts-checker
  app_runs: NOT VERIFIED — the dev server cannot start in this container (SIGTERM on the type-checker child). Not a code defect; CI compiled the reviewed sha green.
  docker_build: NOT VERIFIED — Docker is unavailable in this container, and no pull request ever builds the Dockerfile (W1)
ci_checks_on_head:
  test: success
  CodeQL: 'success — but the verdict is unearned; the diff stage was skipped (F4)'
  Analyze (javascript): 'success, with 1 warning annotation: "Cannot retrieve the full diff because there are too many (300) changed files in the pull request."'
  GitGuardian scan: success
  GitGuardian Security Checks: success — 38 commits scanned, no secrets
  qlty check: 'success, "No blocking issues" — static analysis only; coverage was never uploaded for this PR (W2)'
  docker: skipped — never runs on a pull request
  docker-test: skipped — never runs on a pull request
codeql_alert_api: 'not queryable with the available token (403 Resource not accessible by integration) for either ?pr=774 or ?ref=refs/heads/chore/remove-bluebird; the branch alerts have to be read in the UI'
review_threads: 6 total, all qltysh[bot], all resolved and outdated
standing_reviews: 1 — Fabdulla1 CHANGES_REQUESTED, 2026-08-04, still open (F3); all three of its concerns verified fixed this round
issue_comments: 0
other_review_bots: 'none — no sourcery-ai review, comment or check run exists on this PR; qltysh[bot] is the only bot reviewer'
requested_reviewers: none currently assigned
---

# Review — PR #774

## Friendly summary

The design is right and it has held up under eight rounds of looking at it. Reads get a real `AbortSignal`; writes never do, because once a save has left the browser, cutting the connection does not un-save it — it only throws away the answer. And that rule is enforced by the compiler, not by discipline: `postJson` and `putJson` have no signal parameter, and the one method that takes one is `private`. Everything the August review asked for is done, and every gate is green.

One real thing turned up this round. Seven reads _look_ abortable and are not — they pass a signal into a method that has no signal parameter, so it is quietly dropped. Three of those are fully typed and still wrong: `FragmentInfoRepository` declares `random(signal?)` but `FragmentRepository.random()` takes no arguments, and TypeScript accepts that happily. Nothing breaks, but the README now claims otherwise, and that wants fixing before this lands. The rest is bookkeeping — an unasserted `console.error` mock that slipped back in, a few counts that drifted, and the eight `TASK-*.md` scratch files that still have to go. The two hardest blockers are not in this code at all: #773 is still conflicted and gates the stack, and CodeQL has never actually looked at this diff.

## Summary

PR #774 removes `bluebird` and replaces its cancellable promises with the web-standard `AbortController`/`AbortSignal` for reads and a token-based supersession primitive for writes. Alongside that it carries a Sass `@import` → `@use` migration (48 files), a 250-line-per-file refactor of everything it touches, and CI/CodeQL configuration so stacked PRs based on `chore/**`, `feature/**` and `fix/**` are no longer merged without checks.

The central design decision is correct and is enforced structurally rather than by convention: `ApiClient.postJson` and `ApiClient.putJson` accept no `signal`, and `ApiClient.fetch` — the only method that takes one alongside an arbitrary method — is `private`, so a signal cannot reach a write's `fetch` from outside the class. Every service and repository write method was checked; none accepts a signal. `JsonApiClient`'s `postJson` declares no signal either.

All three concerns from the standing August review are resolved, and the requested integration test exists and is genuine. Every local gate is green: lint and tsc clean, 504 suites / 4428 tests / 50 snapshots passing with zero console output, coverage 95.08 / 87.98 / 94.74 / 95.23 with no threshold breach, and no changed `.ts`/`.tsx` file over 250 lines.

Seventeen items are recorded below: four blockers, two major, six minor, two warnings and three informational. Only one blocker is about this code — the other three are the stacked base branch, the outstanding review event, and CodeQL's inability to diff a PR this size. The one substantive code finding is F5: seven reads accept an `AbortSignal` that is dropped before it reaches `fetch`, which contradicts the README section this PR adds.

## Findings

| #   | Finding                                                                                                                       | Severity | Status                         |
| --- | ----------------------------------------------------------------------------------------------------------------------------- | -------- | ------------------------------ |
| F1  | Eight `TASK-*.md` scratch documents tracked on the branch; no `.gitignore` rule                                               | Blocker  | Open — excluded by instruction |
| F2  | #773 open and `mergeable_state: dirty` against master; gates the whole stack                                                  | Blocker  | Open — yours                   |
| F3  | Standing `CHANGES_REQUESTED` (2026-08-04) still open; all its concerns verified fixed                                         | Blocker  | Open — needs the reviewer      |
| F4  | CodeQL never diff-analysed the PR (300-file cap); landing #773 will not fix it                                                | Blocker  | Open — needs a decision        |
| F5  | Seven reads accept an `AbortSignal` that never reaches `fetch`; README claims otherwise                                       | Major    | **Fixed**                      |
| F6  | Unasserted `console.error` suppression reintroduced in `TextService.misc.test.ts:84`                                          | Major    | **Fixed**                      |
| F7  | Blanket `beforeEach` console spy covers two non-asserting tests in `CuneiformConverterForm.errors.test.tsx`                   | Minor    | **Fixed**                      |
| F8  | `BibliographyEntryForm` documented as a write owner; it guards a read                                                         | Minor    | **Fixed**                      |
| F9  | PR description misstates CI's build command; `main.yml:59` duplicates `build:ci-stable`                                       | Minor    | **Fixed**                      |
| F10 | Sass counts in the PR description drifted (47 → 48 files, 59 → 60 entrypoints)                                                | Minor    | **Fixed**                      |
| F11 | `initializeAnnotations` recomputes `tokens.flat()` per annotation (pre-existing, faithfully extracted)                        | Minor    | **Fixed**                      |
| F12 | Two bluebird-cancellation tests deleted — justified and superseded, but needs explicit sign-off                               | Minor    | Open — needs approval          |
| W1  | Dev container untouched and Dockerfile identical to master; CI workflows materially changed; no PR ever builds the Dockerfile | Warning  | Open — Docker unavailable here |
| W2  | qlty coverage never uploaded for stacked PRs, so the green `qlty check` carries no coverage verdict                           | Warning  | Open — after retarget          |
| W3  | Three commits behind master                                                                                                   | Info     | Open — needs a merge commit    |
| W4  | Pre-existing oversized files; none touched by this PR                                                                         | Info     | Noted                          |
| W5  | `Introduction.sass` (727) and `project.sass` (261) touched but not split, while `Realia.sass` was                             | Info     | Addressed — no claim made      |

## Severity

| Severity | Count | Meaning                                                                                                           |
| -------- | ----- | ----------------------------------------------------------------------------------------------------------------- |
| Blocker  | 4     | Must be cleared before merge. F1 and F4 are actionable here; F2 and F3 need a different branch or another person. |
| Major    | 2     | Should be fixed in this PR. F5 contradicts documented behaviour; F6 reintroduces the pattern this PR removed.     |
| Minor    | 6     | Worth fixing before merge; none changes runtime behaviour.                                                        |
| Warning  | 2     | Not defects. Read before merging — they describe what the green checks do _not_ cover.                            |
| Info     | 3     | Context; no action required beyond a decision on W5.                                                              |

## Remediation applied

Applied on 2026-09-22 against `ee275e43`, in the working tree. Everything except the `.md` cleanup (F1) was addressed; F2, F3, F4, F12, W1, W2 and W3 cannot be closed from inside this diff and are listed with what each one needs.

**F5 — the signal now reaches `fetch`.** `FragmentRepository._fetch` takes a `signal` and passes it to `fetchJson`; `random`, `interesting` and `fetchNeedsRevision` take the `signal` their own port already declared; `statistics`, `lineToVecRanking`, `fragmentPager` and `findInCorpus` take one through the service and the port. `FragmentRepository.abortSignal.test.ts` is new and asserts, for all seven, that the caller's signal arrives at `apiClient.fetchJson`. The five `withData` type arguments written `{ fragmentService }` are now `{ fragmentService: FragmentService }` — the fifth, `FolioImage.tsx`, was not in the original finding but is the identical hole and was closed with it, which is the point of the fix: the compiler now rejects the next dropped argument rather than swallowing it.

Removing the `any` immediately surfaced three errors that had been invisible, which is the best evidence the finding was real: `FragmentInCorpus.tsx` was declaring a mutable-array shape incompatible with the repository's `ReadonlyArray`, and two test files were passing partial stubs where a `FragmentService` was required. All three are fixed rather than cast away — `FragmentInCorpus` now uses the shared type, and the two stubs are explicit `as unknown as FragmentService`, matching the `as unknown as Session` precedent already in those files.

**Two duplicated shapes became named types.** `statistics`'s `{ transliteratedFragments; lines; totalFragments }` was written out in the port, the repository, the service and a test; `findInCorpus`'s attestation pair was written out in the port, the repository, the service and `FragmentInCorpus.tsx`. Both are now `FragmentStatistics` and `CorpusAttestations` in `fragmentServicePorts.ts`.

**The `FragmentInfoRepository` implementation moved to its own module.** Threading the signals pushed `FragmentRepository.ts` from 240 to 253 lines, over the ceiling. Rather than compress the signatures, `statistics`, `lineToVecRanking`, `fragmentPager`, `random`, `interesting`, `fetchNeedsRevision` and `_fetch` moved into `fragmentRepositoryInfo.ts` as `ApiFragmentInfo`, inserted into the existing `ApiFragmentAttestations` → `ApiFragmentUpdates` → `ApiFragmentRepository` chain. `FragmentRepository.ts` is now 178 lines, the new module 85, and the `FragmentInfoRepository` port is implemented in one place. The three `fetchFragmentInfos` callers share a private helper instead of repeating `.then(infos => infos.map(createFragmentInfo))`, and two hand-built `/fragments/<n>/...` URLs now go through `createFragmentPath`.

**F6, F7 — console suppression.** `TextService.misc.test.ts` no longer installs an unasserted spy; both provenance tests use `expectConsoleErrors`, which asserts the arranged error actually occurred and still fails on anything unexpected. The first test's exact-argument check is preserved by matching the error text in the pattern. The `afterEach(jest.restoreAllMocks)` in that describe was removed — it would have restored the spy before `setupTests`' own `afterEach` could read it. In `CuneiformConverterForm.errors.test.tsx` the two tests that never touched the shared spy now assert `expect(consoleErrorSpy).not.toHaveBeenCalled()`, matching the precedent already in that file; all six tests now check it.

**F8, F9, F10 — documentation.** `README.md` no longer calls `BibliographyEntryForm` a write owner; the bullet now describes the primitive as guarding _operations that cannot take a signal_ and names `BibliographyEntryForm`'s `Cite.async` as the read case. The "Reads that take no signal" list is now accurate and says explicitly that an accepted-then-dropped signal is a defect, with the TypeScript reason it is not caught. The shared-cache list gained `fetchProvenance` and `fetchProvenanceChildren`, which are cached paths and were missing from it. The PR description was corrected on GitHub: 48 changed Sass files and 60 entrypoints, the build-command claim, the write-owner list, and a new section recording these fixes. `.github/workflows/main.yml:59` now runs `yarn build:ci-stable` instead of repeating its environment inline, which makes the description's claim true and leaves one definition of the CI build.

**F11.** `initializeAnnotations` hoists `tokens.flat()` above the `map`; the inner `find` parameter was renamed to stop shadowing the outer `token`.

**W5 — no action needed.** The recommendation was to avoid claiming the Sass ceiling had been addressed. No such claim exists in the PR description or the README, so nothing had to change. `Introduction.sass` and `project.sass` are left alone; both are one-line touches and the 250-line rule covers `.ts`/`.tsx`.

**Still open, and why.** F1 is excluded by instruction. F2 needs #773's conflicts resolved on a different branch. F3 needs the reviewer. F4 needs either a split under CodeQL's 300-file cap or a manual read of the branch alerts. F12 needs explicit approval for two test removals. W1's `docker build .` needs an environment with Docker. W2 can only be checked after the retarget. W3 needs a merge commit, which was not requested.

## Details

### F1 — Eight `TASK-*.md` scratch documents are tracked on the branch — BLOCKER

**What.** `git diff --name-status origin/master...HEAD -- '*.md'` reports eight added files: `TASK-774-handoff.md`, `TASK-774-log.md`, `TASK-774-merge-master-handoff.md`, `TASK-774-review.md` (this document), `TASK-774-todo.md`, `TASK-ts7-migration-log.md`, `TASK-ts7-migration-research.md`, `TASK-ts7-migration-todo.md`. These are work-tracking scratch, not documentation, and no new `.md` file may be present when this merges. There is also no `TASK-*` rule in `.gitignore`, so nothing stops them coming back.

**Reproduction.** `git diff --name-status origin/master...HEAD -- '*.md'` — expect only `README.md` and `.github/copilot-instructions.md`; eight `A` lines appear instead. `grep -n TASK .gitignore` returns nothing.

**Recommendation.** Delete all eight in one commit and add a `TASK-*.md` line to `.gitignore` in the same commit, so the files survive locally but never get staged again.

### F2 — #773 is open and conflicted against master, and gates the whole stack — BLOCKER

**What.** This PR's base is `chore/ts7-tsconfig-migration`, which is PR #773. The API reports #773 as `state: open`, `mergeable: false`, `mergeable_state: dirty`, last updated 2026-08-05. Until #773's conflicts are resolved and it lands, #774 cannot reach master no matter how green it is. #774's own state against its base is `mergeable_state: clean`, so this is entirely #773's problem.

**Reproduction.** `curl -s -H "Authorization: Bearer $GITHUB_TOKEN" .../pulls/773` → `mergeable_state: dirty`.

**Recommendation.** Resolve #773's conflicts and land it. It is the single highest-value action available — 30 files, and it unblocks everything downstream.

### F3 — The standing `CHANGES_REQUESTED` review is still open — BLOCKER

**What.** Review `4854993025`, `CHANGES_REQUESTED`, submitted 2026-08-04 against commit `5ef4a984`. Every substantive point in it is now fixed, and I re-verified each one this round:

- _"`runWrite` can abort an already dispatched server write"_ — fixed. `runWrite` hands out an `isStale()` predicate from `SupersedableOperation`, never a signal. The exact path named in the review (`DateSelectionMethods` → `FragmentService` → `FragmentRepository` → `postJson` → `fetch`) is now guard-based: `DateSelectionMethods.ts:43-55` wraps the update in `applyWhenCurrent`, and `postJson` has no signal parameter to abort with. The other three named entry points (`ChapterEditView.tsx:60,81`, `ScriptSelection.tsx:64`, `CuneiformFragment.tsx:146-178`) are the same shape.
- _"add an integration-level test that reaches a mocked ApiClient or fetch"_ — done. `src/common/hooks/usePromiseEffect.write.integration.test.tsx` renders a real form over a real `ApiClient` with `fetch` mocked, and asserts separately that no signal is attached to a dispatched write, that a second write does not abort the first, and that a superseded write cannot overwrite current UI state.
- _"files that hit the 250-line ceiling"_ — all seven named files are under the limit; `TextService.ts` went from 597 lines to 70.

The review event itself still stands, and a `CHANGES_REQUESTED` blocks approval regardless of whether the concerns are addressed.

**Recommendation.** Ask the reviewer to re-review and dismiss. Reviewer assignment is never touched automatically.

### F4 — CodeQL has never diff-analysed this PR, and landing #773 will not fix that — BLOCKER

**What.** The `CodeQL` check on the current head is green with the title _"No new alerts in code changed by this pull request"_, but that title is not evidence. The `Analyze (javascript)` check run on the same sha carries a warning annotation:

> `Cannot retrieve the full diff because there are too many (300) changed files in the pull request.`

CodeQL's diff-informed analysis is capped at 300 changed files. This PR shows 707 against its base, so the stage was skipped and the "no new alerts in code changed by this pull request" verdict was reached without ever computing what that code is.

Round 7 recorded this as something the retarget would fix. It will not. `git diff --name-only origin/master...HEAD` is **510 files**, and #773's own diff is only 30 — so after #773 lands and this PR retargets to master, the diff will still be roughly 480-510 files, still well over the 300-file cap. The gap is structural, not an artefact of the stacking.

**Reproduction.** `curl .../check-runs/105254872913/annotations` → the warning above. `git diff --name-only origin/master...HEAD | wc -l` → 510. `git diff --name-only origin/master...origin/chore/ts7-tsconfig-migration | wc -l` → 30.

**Recommendation.** Either split this PR so each piece lands under 300 changed files (the Sass `@import` → `@use` migration is 48 files and entirely separable from the bluebird work, as is the 250-line test split), or accept that CodeQL cannot diff this PR and read the branch-level alerts by hand at `/security/code-scanning?query=pr:774+tool:CodeQL+is:open` before merging. Do not treat the green check as coverage. The alerts REST API returns `403 Resource not accessible by integration` for the available token, so this has to be read in the UI.

### F5 — Seven reads advertise abortability they do not have — MAJOR

**What.** Seven call sites pass an `AbortSignal` into a method that has no signal parameter. The argument is silently discarded and the request is never abortable. They split into two groups by _how_ the type system fails to catch it.

**Group A — hidden behind an implicit `any`.** Four `withData` getters. The middle type argument is written as `{ fragmentService }`, which in a type position means `{ fragmentService: any }`. `tsconfig.json` sets `noImplicitAny: false` (pre-existing on master), so this compiles and passing an extra argument typechecks vacuously:

| Call site                                                           | Calls                                                         | Declared as                                                        |
| ------------------------------------------------------------------- | ------------------------------------------------------------- | ------------------------------------------------------------------ |
| `src/fragmentarium/ui/front-page/Statistics.tsx:60`                 | `fragmentService.statistics(signal)`                          | `statistics(): Promise<...>` — `FragmentService.ts:44`             |
| `src/fragmentarium/ui/line-to-vec/FragmentLineToVecRanking.tsx:100` | `fragmentService.lineToVecRanking(props.number, signal)`      | `lineToVecRanking(number: string)` — `FragmentService.ts:52`       |
| `src/fragmentarium/ui/fragment/FragmentInCorpus.tsx:23`             | `fragmentService.findInCorpus(props.fragment.number, signal)` | `findInCorpus(number: string)` — `FragmentService.ts:106`          |
| `src/fragmentarium/ui/fragment/FragmentPager.tsx:55`                | `fragmentService.fragmentPager(props.fragmentNumber, signal)` | `fragmentPager(fragmentNumber: string)` — `FragmentService.ts:148` |

**Group B — fully typed and still wrong.** This is the interesting one, because no `any` is involved. `FragmentInfoRepository` in `src/fragmentarium/application/FragmentSearchService.ts:12-16` declares:

```ts
random(signal?: AbortSignal): FragmentInfosPromise
interesting(signal?: AbortSignal): FragmentInfosPromise
fetchNeedsRevision(signal?: AbortSignal): FragmentInfosPromise
```

`FragmentRepository` implements all three with **no parameters at all** (`FragmentRepository.ts:94`, `:100`, `:106`), each calling `this._fetch({ ... })`, and `_fetch(params)` at `:112` calls `apiClient.fetchJson(url, false)` with no signal. TypeScript accepts a function of fewer parameters where more are expected, so this assignment is legal and `yarn tsc` stays green. `FragmentSearchService` dutifully threads the signal (`:26`, `:36`, `:46`) into a method that ignores it.

Three live UI call sites rely on that contract:

| Call site                                              | Chain                                                                                                       |
| ------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------- |
| `src/fragmentarium/ui/front-page/LuckyButton.tsx:17`   | `FragmentSearchService.random(signal)` → `FragmentRepository.random()` → `_fetch` → `fetchJson(url, false)` |
| `src/fragmentarium/ui/PioneersButton.tsx:16`           | same, `interesting`                                                                                         |
| `src/fragmentarium/ui/front-page/NeedsRevision.tsx:33` | same, `fetchNeedsRevision`                                                                                  |

`NeedsRevision.tsx:25-28` even writes the prop type out explicitly as `fetchNeedsRevision: (signal?: AbortSignal) => Promise<readonly FragmentInfo[]>`. The type is deliberate, documented, and unfulfilled.

**Why it matters.** This is not a runtime regression — these reads were not abortable on master either, and `withData`'s `requestSequence` guard still prevents stale state, so nothing renders wrongly. But `README.md` asserts the opposite in the section this PR adds: _"Reads that take no signal ... Everything else reachable from a `withData` getter or `run` threads one."_ That sentence is false for seven reads. The whole point of this PR's design is that the type system, not convention, enforces where signals go; here the type system says "abortable" and the network says otherwise.

**Reproduction.** Open `/fragmentarium` and navigate away while the "needs revision" list is loading — the request continues to completion. Compare `FragmentSearchService.ts:13-15` against `FragmentRepository.ts:94,100,106`. Or attach `signal.addEventListener('abort', ...)` in `NeedsRevision`'s getter and confirm the underlying `fetch` is never cancelled.

**Recommendation.** Thread the signal the last mile: give `FragmentRepository._fetch(params, signal?)` the parameter and pass it to `fetchJson`, then give `random` / `interesting` / `fetchNeedsRevision` the `signal?: AbortSignal` their own port already promises. Do the same for `statistics`, `lineToVecRanking`, `findInCorpus` and `fragmentPager`, and replace the four `{ fragmentService }` type arguments with `{ fragmentService: FragmentService }` so the compiler catches the next one. If any of these are deliberately left unabortable, say so in the README's "Reads that take no signal" list instead of leaving the blanket claim standing.

### F6 — Unasserted `console.error` suppression reintroduced in a new test file — MAJOR

**What.** `src/corpus/application/TextService.misc.test.ts:84`, in the test _"retries provenance preload after a failed first attempt"_:

```ts
jest.spyOn(console, 'error').mockImplementation(() => undefined)
```

The spy is never asserted on and never referenced again. That is blanket suppression: any `console.error` this test emits, expected or not, is swallowed. This PR's own achievement was deleting `silenceConsoleErrors` and replacing it with the pattern-scoped `expectConsoleErrors` / `tolerateConsoleErrors` helpers — and this file, which the PR adds, reintroduces exactly the pattern that was removed. The sibling test 30 lines above does it correctly, asserting `expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to preload provenances', provenanceError)`.

**Reproduction.** `sed -n '80,90p' src/corpus/application/TextService.misc.test.ts`. Introduce an unrelated `console.error` anywhere in the `findManuscripts` path and the test still passes silently.

**Recommendation.** Replace with `expectConsoleErrors(/Failed to preload provenances/)` from `setupTests`, which both tolerates the arranged error and asserts it actually occurred, and fails on anything unexpected.

### F7 — Blanket `beforeEach` console spy covers two tests that never assert on it — MINOR

**What.** `src/signs/ui/CuneiformConverter/CuneiformConverterForm.errors.test.tsx:29` installs `jest.spyOn(console, 'error').mockImplementation(...)` in a `beforeEach` that applies to every test in the file. Four of the six tests assert on the spy; _"converts on Shift + Enter"_ (`:71`) and _"does not convert on Enter without Shift"_ (`:84`) never do. For those two, console noise is suppressed with nothing checking it. Same class as F6, smaller blast radius, and also a file this PR adds.

**Recommendation.** Move the spy into the four tests that assert on it, or give the two that do not an `expect(consoleErrorSpy).not.toHaveBeenCalled()`.

### F8 — `BibliographyEntryForm` is documented as a write owner; it guards a read — MINOR

**What.** `README.md` and the PR description both list five components that \*"own a single **write\***" and hold their own `SupersedableOperation`: `TransliterationForm`, `WordEditor`, `BibliographyEntryFormController`, `BibliographyEntryForm` and `CuneiformFragment`. Four of those are writes. `BibliographyEntryForm`'s `loadOperation` (`BibliographyEntryForm.tsx:51,117-121`) guards `Cite.async(value)` — a debounced **read**, which uses the supersession primitive rather than a signal because citation-js has no abort support at all.

The code is right; the sentence is not. This is the same class as round 7's F9 (_"four components"_ → five), so doc accuracy in this area has now been wrong twice.

**Recommendation.** Reword to say the primitive guards _operations that cannot take a signal_ — which covers both the writes and `Cite.async` — and name `BibliographyEntryForm` as the read case explicitly.

### F9 — The PR description misstates CI's build command, and the workflow duplicates a script that already exists — MINOR

**What.** The Verification section claims `yarn build:ci-stable` is _"the command CI's build step runs"_. It is not. `.github/workflows/main.yml:59` runs `GENERATE_SOURCEMAP=false DISABLE_ESLINT_PLUGIN=true NODE_OPTIONS=--max_old_space_size=1536 yarn build`, spelled out inline. The effect is equivalent — `package.json` defines `build:ci-stable` as exactly that env plus `craco build` — but the claim is literally false, and the workflow is hand-copying a script that exists three lines away in `package.json`, which is the DRY gate's whole subject.

**Recommendation.** Change `main.yml:59` to `run: yarn build:ci-stable`. Then the description's claim becomes true and there is one definition of the CI build instead of two.

### F10 — Sass counts in the PR description have drifted — MINOR

**What.** The description says the migration covers _"47 files"_ and that _"all 59 Sass entrypoints"_ compile byte-identically. Actual: 42 modified plus 6 added (the `Realia.sass` split partials) = **48** changed `.sass` files, and **60** entrypoints in `src` (69 total, 9 partials).

**Reproduction.** `git diff --name-status origin/master...HEAD -- '*.sass' '*.scss' | awk '{print $1}' | sort | uniq -c` → `6 A`, `42 M`. `find src \( -name '*.sass' -o -name '*.scss' \) ! -name '_*' | wc -l` → 60.

**Recommendation.** Update both numbers, or drop the counts and keep the byte-identical claim, which is the part that matters.

### F11 — `initializeAnnotations` recomputes `tokens.flat()` once per annotation — MINOR

**What.** `src/fragmentarium/ui/image-annotation/annotation-tool/initializeAnnotations.ts:10-17` calls `tokens.flat()` inside `initialAnnotations.map(...)`, so the whole token matrix is flattened once per annotation — O(annotations × tokens) where O(annotations + tokens) would do. I diffed it against `origin/master:src/.../FragmentAnnotation.tsx:67-81` and the extraction is byte-identical, so this is pre-existing and not a regression. But pulling the function out into its own module was the natural moment to hoist the `flat()` out of the loop, and it was not taken.

**Recommendation.** Hoist `const flatTokens = tokens.flat()` above the `map`. One line, behaviour identical, and the file is already on the 100% coverage list so the existing tests cover it.

### F12 — Two tests were deleted; the removal is justified but needs explicit sign-off — MINOR

**What.** `src/http/ApiClient.edge-cases.test.ts` was split up and two of its tests did not survive: _"Cancelled promise rejects without completing"_ and _"Request cancellation is available on all methods"_. Both assert on `promise.cancel()` / `promise.isCancelled()` — bluebird APIs that no longer exist, so the assertions are genuinely no longer meaningful. Equivalents now exist and are stronger: `ApiClient.requests.test.ts` has _"Forwards the abort signal to fetch"_, _"The abort signal can be passed to the read methods"_ and _"Writes never attach an abort signal"_.

I checked the other five deleted test files and every one of their tests is re-homed — including the security suite, where _"should not allow write operations for guest users"_ survives as an `it.each` over the same six permissions in `react-auth0-spa.guestPermissions.test.ts:25`.

**Recommendation.** No code change needed, but the project rule is that no test is removed without explicit approval. Confirm these two and the record is clean.

### W1 — Dev container and infrastructure — WARNING, read before merging

**`.devcontainer/` is untouched.** `git diff --stat origin/master HEAD -- .devcontainer` is empty. All four files — `Dockerfile`, `devcontainer.json`, `inject-secrets.sh`, `README.md` — are byte-identical to master. **The root `Dockerfile` is also byte-identical to master**; it shows `+4/-4` in the GitHub diff purely because master was merged into this branch and not into the base branch, so that hunk is base-branch drift, not this PR's work.

**The CI workflows are materially changed, and they deserve the scrutiny.** Reviewed line by line against master:

| File                           | Change                                                                                                          | Verdict                                                                                                                                                                |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `main.yml:7`                   | `pull_request.branches` gains `chore/**`, `feature/**`, `fix/**`                                                | Correct, and the reason this PR has CI at all                                                                                                                          |
| `main.yml:20,22`               | `checkout@v4` → `v5`, `setup-node@v4` → `v5`                                                                    | Fine, green on this sha                                                                                                                                                |
| `main.yml:12-14`               | `SLACK_WEBHOOK_URL` env removed                                                                                 | Correct — `grep -rn SLACK .github/ package.json` returns nothing; it was dead and injected into every step's environment                                               |
| `main.yml:29-35`               | Install retry `break` → `exit 0`, plus an explicit `::error::` and `exit 1` after three attempts                | Correct, and a real fix: the old loop exited 0 after three failures                                                                                                    |
| `main.yml:37-46`               | New "No bluebird" guard step                                                                                    | Sound; `git grep` inside an `if` condition is not affected by `bash -e`                                                                                                |
| `main.yml:48-59`               | `if: success() \|\| steps.install.outcome == 'success'` removed from Lint / Compile / Unit Tests / Build        | Behaviour change: the job now fails fast instead of running every step whenever install succeeded. Stricter and correct, but CI will now report only the first failure |
| `main.yml:56`                  | Unit Tests now `yarn test:ci`                                                                                   | Correct — matches the documented gate                                                                                                                                  |
| `main.yml:66-70`               | qlty coverage upload gated on `push \|\| base_ref == 'master'`                                                  | Deliberate; see W2                                                                                                                                                     |
| `main.yml:107`                 | `docker-test` gains `needs: [test]`                                                                             | Real fix: a red master previously still built and pushed `ebl-frontend:test`                                                                                           |
| `codeql-analysis.yml:24-32`    | Explicit top-level `contents: read` and job-level `actions: read` / `contents: read` / `security-events: write` | Security improvement — stops inheriting the repository default                                                                                                         |
| `codeql-analysis.yml:48,62,76` | `codeql-action` v3 → v4, `checkout@v4` → `v5`                                                                   | Ahead of the December 2026 v3 deprecation, green on this sha                                                                                                           |
| `update-sitemaps.yml:14,19`    | `checkout@v4` → `v5`, `setup-node@v4` → `v5`; `persist-credentials: false` preserved                            | Fine                                                                                                                                                                   |

**The thing to actually worry about:** both Docker jobs are `if: github.event_name == 'push' && github.ref == 'refs/heads/master'`, so **no pull request ever builds the Dockerfile**. It carries exact Alpine package pins that rot silently, and the first anyone finds out is a push to master. That is pre-existing, not introduced here, but it is why a Dockerfile change would sail through unchecked.

**Recommendation.** Run `docker build .` locally before merging — I could not, as Docker is unavailable in this container. Longer term, add a build-only (no push, no registry login) Docker job that runs on pull requests.

### W2 — qlty's green check carries no coverage verdict on this PR — WARNING

**What.** `main.yml:66-67` uploads coverage only when `github.event_name == 'push' || github.base_ref == 'master'`. This PR's base is `chore/ts7-tsconfig-migration`, so no `lcov.info` is ever sent. The `qlty check` status is green with _"No blocking issues"_, but that verdict covers static analysis only — coverage was never measured on the qlty side for any commit on this branch.

The reasoning in the workflow comment is sound: a stacked PR is measured against its own base, so uploading it would overwrite the master baseline with a partial figure. The consequence is that the first real qlty coverage check on this work happens **after** the retarget to master, i.e. after review is over.

**Recommendation.** Treat local `yarn test:ci` as the coverage gate until the retarget, then re-check `qlty check` on the retargeted PR before merging. `craco.config.js` enforces the same thresholds locally, so the exposure is small, but the green check should not be read as "coverage is fine".

### W3 — Three commits behind master — INFO

`e281f7ba`, `af0b7942`, `51bfc9ff`. Unchanged since round 7. Not urgent while #773 gates the stack, but merge them before the retarget so conflicts surface here rather than on master.

### W4 — Pre-existing oversized files, none of them this PR's — INFO

The 250-line gate passes for this PR: no `.ts`/`.tsx` file it changes exceeds 250 lines. The repository still has plenty that do — `complexTestText.ts` (3514), `bibliography.tsx` (1290), `react-auth0-spa.test.tsx` (868), `SearchFormDossier.test.tsx` (786), `PdfExport.tsx` (775) — but this PR touches none of them, so they are out of scope here.

### W5 — Two oversized Sass files were touched but not split, while `Realia.sass` was — INFO

`src/Introduction.sass` (727 lines) and `src/about/ui/project.sass` (261) are both over 250 and both touched by this PR — one line each, the `@import` → `@use` migration. The 250-line rule covers `.ts`/`.tsx`, so this is not a gate breach. But the August review's own ceiling list named `src/realia/ui/Realia.sass` (453), and that one _was_ split into six partials. The standard was applied to one Sass file and not to the two larger ones sitting next to it.

**Recommendation.** Either split them too or leave all three alone — but pick one rule. Given both are one-line touches, leaving them is defensible; just do not claim the Sass ceiling was addressed.

## Reproduction Steps

Every finding above carries its own reproduction inline. The shared setup:

```bash
git fetch origin
git checkout chore/remove-bluebird          # ee275e43
yarn install --frozen-lockfile
yarn lint && yarn tsc && yarn test:ci
```

Scope and drift:

```bash
git diff --shortstat origin/chore/ts7-tsconfig-migration...HEAD   # 707 files — what GitHub shows
git diff --shortstat origin/master...HEAD                         # 510 files — what this PR owns
git rev-list --count HEAD..origin/master                          # 3
```

GitHub state (no `gh` CLI in this container; `curl` + `$GITHUB_TOKEN`):

```bash
API=https://api.github.com/repos/ElectronicBabylonianLiterature/ebl-frontend
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "$API/pulls/774/reviews?per_page=100"
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "$API/pulls/774/comments?per_page=100"
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "$API/issues/774/comments?per_page=100"
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "$API/commits/ee275e43/check-runs?per_page=100"
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "$API/check-runs/105254872913/annotations"   # the CodeQL 300-file warning
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "$API/pulls/773"                             # mergeable_state: dirty
```

## Recommendation

**Still request changes, but the code is now ready.** Every finding inside this diff is fixed: F5 through F11 are applied and verified, and the PR description is corrected on GitHub. What remains is not about the code.

Four items block a merge and none can be closed from inside the diff. #773 is conflicted and gates the stack (F2). The August `CHANGES_REQUESTED` needs the reviewer to dismiss it (F3) — every concern in it has been verified fixed across two rounds now. CodeQL has never diff-analysed this PR and the retarget will not change that (F4), so either the PR is split under the 300-file cap or the branch alerts get read by hand. And the eight `TASK-*.md` scratch files still have to go (F1), which was excluded from this pass by instruction.

Two need a decision rather than work: sign-off on the two deleted bluebird-cancellation tests (F12), and a local `docker build .` before merging, because no pull request ever exercises the Dockerfile (W1).

## Comment Status Tracking

Gathered from the timeline review events, the inline review comments, the issue comments and the GraphQL `reviewThreads` connection on head `ee275e43`.

**Review threads — 6 total, all resolved, all outdated.**

| Thread                 | Author        | Path                                             | Resolved | Outdated | Resolved by   |
| ---------------------- | ------------- | ------------------------------------------------ | -------- | -------- | ------------- |
| Similar code, mass 79  | `qltysh[bot]` | `src/corpus/application/TextService.ts:394`      | Yes      | Yes      | `qltysh[bot]` |
| Similar code, mass 79  | `qltysh[bot]` | `src/corpus/application/TextService.ts:412`      | Yes      | Yes      | `qltysh[bot]` |
| Similar code, mass 120 | `qltysh[bot]` | `src/common/hooks/usePromiseEffect.test.tsx:52`  | Yes      | Yes      | `qltysh[bot]` |
| Similar code, mass 120 | `qltysh[bot]` | `src/common/hooks/usePromiseEffect.test.tsx:101` | Yes      | Yes      | `qltysh[bot]` |
| Similar code, mass 66  | `qltysh[bot]` | `src/corpus/application/TextService.ts:487`      | Yes      | Yes      | `qltysh[bot]` |
| Similar code, mass 66  | `qltysh[bot]` | `src/corpus/application/TextService.ts:503`      | Yes      | Yes      | `qltysh[bot]` |

All six are outdated against the current head because `TextService.ts` was split (597 lines → 70) and `usePromiseEffect.test.tsx` was restructured, so the flagged ranges no longer exist.

**Timeline review events — 3 total.**

| Review       | Author        | State               | Date       | Commit     | Status                                                                               |
| ------------ | ------------- | ------------------- | ---------- | ---------- | ------------------------------------------------------------------------------------ |
| `4746909786` | `qltysh[bot]` | `COMMENTED`         | 2026-07-21 | `7ba6f490` | Resolved, outdated                                                                   |
| `4764412287` | `qltysh[bot]` | `COMMENTED`         | 2026-07-23 | `01e61b13` | Resolved, outdated                                                                   |
| `4854993025` | `Fabdulla1`   | `CHANGES_REQUESTED` | 2026-08-04 | `5ef4a984` | **UNRESOLVED — blocks approval (F3).** All three concerns verified fixed this round. |

**Issue comments — 0.** No general PR comments exist.

**Other review bots.** No `sourcery-ai` review, comment or check run exists on this PR; the only bot reviewer is `qltysh[bot]`. GitGuardian and CodeQL report via check runs only, not comments.

**Requested reviewers — none currently assigned.** Reviewer assignment is not touched automatically.

## What Has To Be Done

Numbered from what genuinely remains. Items 1-10 of the original list were applied on 2026-09-22; see **Remediation applied** for what changed and why.

### Blockers

1. **Resolve #773's merge conflicts and land it (F2).** It is `mergeable_state: dirty` against master and only 30 files. Nothing downstream can merge until it does. — _yours_
2. **Clear the standing `CHANGES_REQUESTED` (F3).** Every concern is fixed and has now been re-verified in two consecutive rounds; the review event needs a re-review and dismissal. — _needs the reviewer_
3. **Delete the eight `TASK-*.md` documents (F1)** — `TASK-774-handoff.md`, `TASK-774-log.md`, `TASK-774-merge-master-handoff.md`, `TASK-774-review.md` (this document), `TASK-774-todo.md`, `TASK-ts7-migration-log.md`, `TASK-ts7-migration-research.md`, `TASK-ts7-migration-todo.md` — and add a `TASK-*.md` rule to `.gitignore` in the same commit. — _excluded from this pass by instruction_
4. **Decide how CodeQL gets a real verdict (F4).** Either split the PR under the 300-file cap — the Sass migration is 48 files and entirely separable, as is the test split — or read the branch alerts at `/security/code-scanning?query=pr:774+tool:CodeQL+is:open` before merging. Landing #773 will not fix this; the diff against master is 510 files. The alerts REST API returns `403` for the available token, so this has to be done in the UI.

### Approval needed

5. **Confirm the removal of two tests (F12)** — _"Cancelled promise rejects without completing"_ and _"Request cancellation is available on all methods"_. Both assert on bluebird's `.cancel()` / `.isCancelled()`, which no longer exist, and both are superseded by stronger `AbortSignal` tests in `ApiClient.requests.test.ts`. Every test in the other six deleted files was verified re-homed. No test is removed without explicit approval. — _yours_

### Before merge

6. **Run `docker build .` locally (W1).** No pull request ever builds the Dockerfile, and it carries exact Alpine pins. Docker is unavailable in this container. Consider adding a build-only Docker job on pull requests.
7. **Merge the three master commits (W3)** — `e281f7ba`, `af0b7942`, `51bfc9ff` — so conflicts surface here rather than on master. _Not done: a merge is a commit, and commits are not made unprompted._
8. **Re-check `qlty check` after the retarget to master (W2)**, when coverage is uploaded for the first time.
9. **Re-run the full gate set against the collapsed diff** after the retarget, and confirm `test`, `CodeQL` and `qlty check` are green across more than one run.
10. **Delete this review document** along with the other seven `TASK-*.md` files before merging.
