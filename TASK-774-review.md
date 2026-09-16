---
task_id: 774
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
title: 'chore: remove bluebird, use AbortController for cancellation'
reviewed_head_sha: 7c9b1d01b1f1dca80af9e6c139e7d2e8146a8394
base_branch: chore/ts7-tsconfig-migration
base_sha: 4f71cb249bc0db899f1a22ce42ac93ebd961eeda
master_sha: af0b7942b14fc9299c604714bf93c14895d9d28a
stacked_on: '#773 (chore/ts7-tsconfig-migration) — retargets to master when #773 merges'
review_date: 2026-09-16
review_round: 5
remediation_date: 2026-09-16
remediation_state: committed on chore/remove-bluebird as 75c1d81b (not pushed)
reviewer: Claude (automated review)
verdict: FINDINGS ADDRESSED — 9 of 10 actionable findings fixed and committed; F3 reversed by request (task docs are tracked on purpose); F4 and F10 are yours
findings_total: 12
findings_blocking: 4
findings_non_blocking: 4
findings_informational: 4
scope_vs_base: 690 files changed, +43136 / -22170, 34 commits
devcontainer_changes: NONE in .devcontainer/ — but the GitHub diff does show Dockerfile +4/-4; see F10 before merging
gates_at_review_time:
  tests_ci_command: FAIL — `--detectOpenHandles` made FragmentService.queries.test.ts fail deterministically (F1)
  line_ceiling_250: PARTIAL — 1 touched file over the limit (F6)
  dry: FAIL — 93 duplicated lines plus a duplicated concurrency primitive (F2)
gates_after_remediation:
  lint: PASS — eslint + stylelint clean
  tsc: PASS — clean
  build: PASS — CI=true yarn build:ci-stable, "Compiled successfully", zero warnings
  tests: PASS — `yarn test:ci` (CI's exact flags): 500/500 suites, 4395/4395 tests, 50 snapshots, exit 0
  console_output: PASS — zero console errors, warnings, act warnings or unhandled rejections
  coverage_global: PASS — 94.84 / 87.49 / 94.63 / 94.98 against floors 93 / 84 / 93 / 93
  coverage_gated_paths: PASS — every per-path 100% gate met, including the newly-added SignImages.tsx
  line_ceiling_250: PASS — every file this PR changes is at or under 250 lines
  dry: PASS — duplicate module removed; one concurrency primitive remains
ci_checks:
  test: FAILURE
  CodeQL: SUCCESS — no new alerts in code changed by this PR
  Analyze (javascript): SUCCESS
  GitGuardian (x3): SUCCESS — no secrets detected
  qlty check: SUCCESS (status) — 9 blocking issues on the qlty dashboard
  docker / docker-test: SKIPPED (master-push only)
review_threads: 6 total, 6 resolved, 0 unresolved, all outdated
timeline_reviews: 3 total — Fabdulla1 CHANGES_REQUESTED (standing), qltysh[bot] COMMENTED x2
requested_reviewers: none currently
---

# Review — PR #774: remove bluebird, use AbortController for cancellation

## Friendly summary

The bluebird removal itself is in good shape and I'd be happy to sign off on that part. Fabdulla1's main objection from August is properly fixed: writes are no longer network-abortable, `postJson`/`putJson` genuinely have no `signal` parameter, and the new integration test actually proves it rather than restating the implementation. All seven files flagged for the 250-line ceiling are now well under it. Lint, tsc and the production build are clean.

Two things block it. CI is red, and it's a real failure, not infrastructure: deleting `import Promise from 'bluebird'` from `FragmentService.queries.test.ts` quietly changed what that test compares, and it now fails every run under CI's flags. It passes locally only because the documented local command omits the flag CI uses — which is also why the last round recorded tests as passing. The other is that the palaeography split shipped twice: `SignImages.tsx` still contains the original 93-line `PeriodAccordion` inline, and the extracted `PeriodAccordion.tsx` next to it is reachable only from its own test. The two copies have already drifted apart, and the one the app actually renders is the one that _didn't_ get the new `ConcurrencyLimiter`.

Also, the five `TASK-774-*.md` files are tracked again — the last commit put them back, so the PR description's claim that only `README.md` changes is no longer true.

**Update, same day:** all of that is now fixed in the working tree (nothing committed). CI's failing test awaits properly, the duplicate palaeography module is gone and the live path finally uses `ConcurrencyLimiter`, and the task docs are untracked. Two things are still yours: clearing the standing review, and confirming the `Dockerfile` line. Details in the remediation table below.

### Details

| #   | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Severity   | Status              | Where                                                                          |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------- | ------------------- | ------------------------------------------------------------------------------ |
| F1  | CI `test` job fails: `expect(result).toEqual(expected)` compares two un-awaited native Promises. Removing the bluebird import flipped this from accidentally-passing to always-failing under `--detectOpenHandles`. Reproduced locally; fails with the flag, passes without it. Also `let result` is untyped (implicit `any`).                                                                                                                                                                                                                          | **High**   | **Blocker**         | `src/fragmentarium/application/FragmentService.queries.test.ts:55-64`          |
| F2  | The palaeography refactor left a verbatim duplicate. `SignImages.tsx` still defines `PeriodAccordion` inline (93 identical lines, qlty mass 333) and renders _that_ copy. The extracted `PeriodAccordion.tsx`, `PeriodPreview.tsx`, `VariantGroup.tsx` and `loadClusterAnnotations.ts` are imported only by their own tests — dead in production. The two loaders have diverged: the dead one uses the new `ConcurrencyLimiter`, the live one uses a separate `runWithConcurrencyLimit`. The 100% coverage gate pins the dead files, not the live ones. | **High**   | **Blocker**         | `src/signs/ui/display/`                                                        |
| F3  | Five `TASK-774-*.md` files are tracked again, re-added by HEAD commit `7c9b1d01`. Eight `.md` files total against master counting #773's three. The PR body states the opposite.                                                                                                                                                                                                                                                                                                                                                                        | **Medium** | **Blocker**         | repo root                                                                      |
| F4  | `CHANGES_REQUESTED` from Fabdulla1 (2026-08-04) is still the standing review state. The code findings behind it are fixed, but the review itself has to be cleared on GitHub.                                                                                                                                                                                                                                                                                                                                                                           | **Medium** | **Blocker**         | PR #774                                                                        |
| F5  | The documented local test gate (`yarn test --watchAll=false`) is not the command CI runs (`yarn test --coverage --forceExit --detectOpenHandles --watch=false`). That gap is exactly how F1 reached master-bound CI while local runs and the previous review round both reported green.                                                                                                                                                                                                                                                                 | **Medium** | Non-blocking        | `.github/workflows/main.yml:58` vs `.github/copilot-instructions.md`           |
| F6  | `FragmentAnnotation.tsx` is 432 lines, over the 250-line ceiling, and this PR touches it. Pre-existing (433 on master) and the PR only removed two bluebird lines — but the PR body claims a "250-line-per-file refactor across the files this PR touches", which does not hold for this file.                                                                                                                                                                                                                                                          | Low        | Non-blocking        | `src/fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation.tsx` |
| F7  | `MapTab.sass` still uses `@import` while this PR removed `'import'` from `silenceDeprecations` and dropped the matching `ignoreWarnings` entry. The build is currently clean because sass-loader does not surface it, but it is the one file the 47-file `@use` migration missed, and it breaks at Dart Sass 3.0.                                                                                                                                                                                                                                       | Low        | Non-blocking        | `src/map/ui/MapTab.sass:1`                                                     |
| F8  | The new `No bluebird` CI guard misses `require("bluebird")` with double quotes and dynamic `import('bluebird')`. It also hardcodes a PR number in an error message that will outlive the PR.                                                                                                                                                                                                                                                                                                                                                            | Low        | Non-blocking        | `.github/workflows/main.yml:39-45`                                             |
| F9  | `README.md` says a write signal is "enforced by the type system rather than by convention". `ApiClient.fetch` is public and takes both an arbitrary `method` and a `signal`, so the guarantee is enforced by convention at that one seam. No caller does this today.                                                                                                                                                                                                                                                                                    | Low        | Non-blocking        | `README.md`, `src/http/ApiClient.ts:142-147`                                   |
| F10 | **Container config.** No `.devcontainer/` changes anywhere in the stack. But GitHub's PR diff _does_ show `Dockerfile +4/-4` — a base-image digest pin and two Alpine package bumps. This is master's own change flowing in because the base branch is stale; HEAD's `Dockerfile` is byte-identical to master, so the net effect on master is zero. Flagging it because it is container config and it is visible in the PR.                                                                                                                             | Info       | Verify before merge | `Dockerfile`                                                                   |
| F11 | The qlty coverage upload is now skipped for stacked PRs, so this PR's own coverage is never uploaded and the 100% claim is not machine-verified on the PR itself. Deliberate and reasonable; noting the consequence.                                                                                                                                                                                                                                                                                                                                    | Info       | Acknowledge         | `.github/workflows/main.yml:64-65`                                             |
| F12 | CI emits Node 20 deprecation warnings — `actions/checkout@v4` and `actions/setup-node@v4` are being forced onto Node 24. Repo-wide, not introduced here.                                                                                                                                                                                                                                                                                                                                                                                                | Info       | Acknowledge         | `.github/workflows/main.yml`                                                   |

### Remediation — 2026-09-16

Applied to the working tree in this session. **Nothing was committed.**

| #   | Status                                     | What changed                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| --- | ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | **Fixed**                                  | `FragmentService.queries.test.ts` now awaits the call and asserts on the resolved value against `returnData`; `result` is typed `FragmentAfoRegisterQueryResult`. Verified under CI's exact flags: 22 passed. Swept the suite — this was the only occurrence; `testDelegation` already awaited correctly, and the one other promise variable uses `toBe` (identity), which is safe.                                                                |
| F2  | **Fixed**                                  | Deleted the inline `PeriodAccordion` from `SignImages.tsx` and imported the extracted component. Deleted `SignImageFigures.tsx` and `signClusterAnnotations.ts`; removed `runWithConcurrencyLimit` from `signImageGrouping.ts`. The live path now uses `ConcurrencyLimiter`, so the PR's stated migration actually ships. Added `SignImages.tsx` to `fullyCoveredPaths`. All seven modules in `signs/ui/display` report **100 / 100 / 100 / 100**. |
| F3  | **Reversed by request**                    | The eight `TASK-*.md` files were untracked, then re-tracked and committed on explicit instruction. They are deliberately part of the branch again, so the PR body's "only `README.md` changes" line is still inaccurate and the files still have to be deleted before merge.                                                                                                                                                                       |
| F4  | **Open — yours**                           | Reviewer assignment is not touched. The `CHANGES_REQUESTED` review still needs clearing on GitHub.                                                                                                                                                                                                                                                                                                                                                 |
| F5  | **Fixed**                                  | Added `yarn test:ci`, carrying CI's exact flags. `main.yml` now calls it, and `.github/copilot-instructions.md` names it as the hard gate, with a note on why `--detectOpenHandles` matters.                                                                                                                                                                                                                                                       |
| F6  | **Fixed**                                  | `FragmentAnnotation.tsx` split 432 → 158 lines, into `useFragmentAnnotationState.ts` (216), `useAnnotationKeyboardShortcuts.ts` (89), `FragmentAnnotationToolbar.tsx` (73) and `initializeAnnotations.ts` (24). All eight existing tests pass unchanged. `reset` is now `useCallback`-stable so the keyboard hook depends on it honestly, which also removes a pre-existing `exhaustive-deps` warning without suppressing it.                      |
| F7  | **Fixed**                                  | `src/map/ui/MapTab.sass` migrated to `@use 'src/design-tokens' as *`. Recompiled both versions: **byte-identical CSS**, 768 bytes. Zero `@import` left in `src`.                                                                                                                                                                                                                                                                                   |
| F8  | **Fixed**                                  | Guard regex widened to `(from\|import\|require)[[:space:]]*\(?[[:space:]]*['"]bluebird['"]`; matches all 7 import spellings including double quotes and dynamic `import()`, and still does not match current `src`. Message no longer hardcodes the PR number.                                                                                                                                                                                     |
| F9  | **Fixed**                                  | `ApiClient.fetch` is now `private` — no external caller existed. The README claim that the write guarantee is type-enforced is now literally true, and the wording says why.                                                                                                                                                                                                                                                                       |
| F10 | **Confirmed benign — needs your sign-off** | `Dockerfile` is byte-identical to master. Same applies to three other files the stale base makes look changed: `about/ui/bibliography.tsx` (1290 lines), `corpus/ui/ChapterViewLine.tsx` (392) and `corpus/domain/manuscript.test.ts` (265). All three are over the 250-line ceiling but are **master's files, unchanged by this PR** — splitting them would be scope creep.                                                                       |
| F11 | **Acknowledged**                           | Unchanged and deliberate.                                                                                                                                                                                                                                                                                                                                                                                                                          |
| F12 | **Fixed**                                  | `actions/checkout` and `actions/setup-node` bumped v4 → v5 across `main.yml`, `codeql-analysis.yml` and `update-sitemaps.yml`. `secret-scan.yml` keeps its pinned SHAs.                                                                                                                                                                                                                                                                            |

Also done on request, outside the findings: `.qlty/` generated output (`logs`, `out`, `results`, `plugin_cachedir`, `sources`) is now git-ignored while `.qlty/qlty.toml` stays tracked.

**Open question for you.** `.gitignore` still has no `TASK-*.md` rule, so the files can be re-added by a future `git add -A` — which is exactly how they came back this round. The round-3 notes record that you asked for that rule to be removed, so I have not re-added it. Say the word and I will.

**250-line ceiling.** Every file this PR actually changes is now at or under 250 lines.

---

## Findings

### F1 — CI `test` job fails: the query test compares two un-awaited Promises

**Severity: High. Blocker.**

`src/fragmentarium/application/FragmentService.queries.test.ts:55-64`:

```ts
const expected = Promise.resolve(returnData)
let result
beforeEach(async () => {
  fragmentRepository.queryByTraditionalReferences.mockReturnValue(
    Promise.resolve(returnData),
  )
  result = fragmentService.queryByTraditionalReferences(['text 1'])
})
test('returns traditional reference to fragment numbers mapping data', () =>
  expect(result).toEqual(expected))
```

Nothing is ever awaited. `result` is the promise the mock returned and `expected` is a different promise; the assertion compares two promise _objects_, never the value inside them. It has never tested what its name claims.

It passed on master by accident. Master's copy of this file opens with `import Promise from 'bluebird'`, so both sides were Bluebird objects — plain JS objects whose own enumerable fields (`_bitField`, `_fulfillmentHandler0`, …) happen to be deep-equal for two promises fulfilled with the same value. This PR removes that import, so `Promise` is now the native global. Under `--detectOpenHandles` Jest enables `async_hooks`, and Node then attaches a unique `Symbol(async_id_symbol)` / `Symbol(trigger_async_id_symbol)` pair to every native promise as **own enumerable** symbols. Two native promises can therefore never be `toEqual`.

Measured directly:

```text
bluebird own enumerable symbols: []
native   own enumerable symbols: ["Symbol(async_id_symbol)","Symbol(trigger_async_id_symbol)"]
```

This is deterministic, not flaky. The `test` job has failed on both runs since the master merge — `baba036e` and `7c9b1d01` — each with `Test Suites: 1 failed, 499 passed` and `Tests: 1 failed, 4394 passed`. The two runs before the merge (`0e679943`, `502c1ccf`) passed, because the bluebird import was still present in the merged-in file at that point.

Secondary defect in the same block: `let result` has no type annotation, so it is an implicit `any`, against the project's type-annotation rule.

#### Reproduction steps

```bash
# Fails — this is CI's flag set
CI=true npx craco test --watchAll=false \
  --runTestsByPath src/fragmentarium/application/FragmentService.queries.test.ts \
  --detectOpenHandles --forceExit
```

```text
- Expected  - 2
+ Received  + 2

  Promise {
-   Symbol(async_id_symbol): 5635,
-   Symbol(trigger_async_id_symbol): 1508,
+   Symbol(async_id_symbol): 11560,
+   Symbol(trigger_async_id_symbol): 11547,
  }

Test Suites: 1 failed, 1 total
Tests:       1 failed, 21 passed, 22 total
```

```bash
# Passes — the documented local command, no --detectOpenHandles
CI=true npx craco test --watchAll=false \
  --runTestsByPath src/fragmentarium/application/FragmentService.queries.test.ts
```

```text
Test Suites: 1 passed, 1 total
Tests:       22 passed, 22 total
```

Identical to CI's output at <https://github.com/ElectronicBabylonianLiterature/ebl-frontend/actions/runs/34988160664/job/104445531406>.

#### Recommendation

Await the promise and assert on the resolved value, and type the variable. Something like:

```ts
let result: FragmentAfoRegisterQueryResult
beforeEach(async () => {
  fragmentRepository.queryByTraditionalReferences.mockReturnValue(
    Promise.resolve(returnData),
  )
  result = await fragmentService.queryByTraditionalReferences(['text 1'])
})
test('returns traditional reference to fragment numbers mapping data', () =>
  expect(result).toEqual(returnData))
```

Then grep the suite for the same shape — any other `expect(<unawaited promise>).toEqual(<promise>)` is the same latent bug and was being held up by the same bluebird accident.

---

### F2 — The palaeography refactor shipped a dead duplicate of the module it split

**Severity: High. Blocker.** DRY is a hard gate, and this also silently reverts part of the PR's own headline change.

`SignImages.tsx` was meant to be split under the 250-line ceiling. It is now 200 lines — but the split extracted the component into new files **without removing the original or rewiring the caller**.

`src/signs/ui/display/SignImages.tsx:92-200` still defines `PeriodAccordion` inline, and `SignImagePagination` at line 73 renders that local definition. `src/signs/ui/display/PeriodAccordion.tsx:14-122` is a verbatim copy of it. qlty flags exactly this: _"Found 93 lines of identical code in 2 locations (mass = 333)"_, reported against both files.

Import graph — the extracted set is reachable only from tests:

| Module                      | Imported by                                             |
| --------------------------- | ------------------------------------------------------- |
| `PeriodAccordion.tsx`       | `PeriodAccordion.test.tsx` only                         |
| `VariantGroup.tsx`          | `PeriodAccordion.tsx` only                              |
| `PeriodPreview.tsx`         | `PeriodAccordion.tsx`, `PeriodPreview.test.tsx`         |
| `loadClusterAnnotations.ts` | `PeriodAccordion.tsx`, `loadClusterAnnotations.test.ts` |

Nothing in the application renders `PeriodAccordion.tsx`. The live path is `SignImages.tsx` → `SignImageFigures.tsx` (`PeriodPreview`, `VariantGroup`) → `signClusterAnnotations.ts`. So the module exists twice, in full.

**The copies have already diverged, and the wrong one is live.** The PR's stated migration is `Bluebird.map({ concurrency })` → `ConcurrencyLimiter`. Only the dead copy got it:

- `loadClusterAnnotations.ts:37` (**dead**) — `const limiter = new ConcurrencyLimiter(clusterVariantConcurrencyLimit)`
- `signClusterAnnotations.ts:33` (**live**) — `runWithConcurrencyLimit(clusterIds, 4, …)`, a separate hand-rolled worker-pool in `signImageGrouping.ts:57-89`

So `ConcurrencyLimiter` is not actually used by the palaeography code the app runs; a third concurrency primitive was written instead, duplicating its purpose. That is a second DRY violation on its own.

**The coverage gate certifies the dead copy.** `craco.config.js` `fullyCoveredPaths` pins 100% coverage on `PeriodAccordion.tsx`, `PeriodPreview.tsx`, `VariantGroup.tsx`, `loadClusterAnnotations.ts` and `signImageGrouping.ts` — four of those five are unreachable in production. The live `SignImages.tsx`, `SignImageFigures.tsx` and `signClusterAnnotations.ts` are not in the list. The gate reads green while measuring code that never runs.

#### Reproduction steps

```bash
# 93-line duplicate, both halves
sed -n '92,200p' src/signs/ui/display/SignImages.tsx > /tmp/inline.tsx
sed -n '14,122p'  src/signs/ui/display/PeriodAccordion.tsx > /tmp/extracted.tsx
diff /tmp/inline.tsx /tmp/extracted.tsx   # 2 differing lines only: `export default` and the `: JSX.Element` return type

# nothing in the app imports the extracted component
grep -rn "signs/ui/display/PeriodAccordion'" src --include=*.ts --include=*.tsx
#   -> src/signs/ui/display/PeriodAccordion.test.tsx:5   (only hit)

# the two concurrency helpers
grep -n "ConcurrencyLimiter"        src/signs/ui/display/loadClusterAnnotations.ts   # dead copy
grep -n "runWithConcurrencyLimit"   src/signs/ui/display/signClusterAnnotations.ts   # live copy

# qlty agrees
qlty smells --all | grep -A2 "SignImages.tsx"
#   Found 93 lines of identical code in 2 locations (mass = 333)
```

Deleting `src/signs/ui/display/PeriodAccordion.tsx` and its test leaves the application byte-identical — which is the clearest demonstration that it is dead.

#### Recommendation

Pick one copy and delete the other, then point `SignImages.tsx` at it:

1. Delete the inline `PeriodAccordion` from `SignImages.tsx:92-200` and import `signs/ui/display/PeriodAccordion` instead.
2. Collapse `SignImageFigures.tsx` into `PeriodPreview.tsx` + `VariantGroup.tsx` (or the reverse) — keep one.
3. Collapse `signClusterAnnotations.ts` and `loadClusterAnnotations.ts` into one module, keeping the `ConcurrencyLimiter` implementation so the PR's stated migration actually ships.
4. Delete `runWithConcurrencyLimit` from `signImageGrouping.ts` once nothing uses it.
5. Re-point `fullyCoveredPaths` at whichever modules survive, and add `SignImages.tsx` to it.

`SignImages.tsx` drops to roughly 90 lines once the inline copy goes, so the 250-line ceiling is satisfied by the split that was intended rather than by a duplicate.

---

### F3 — Five `TASK-774-*.md` files are tracked again

**Severity: Medium. Blocker.** This is a regression of the round-4 finding of the same name.

```bash
$ git diff --name-status origin/chore/ts7-tsconfig-migration...HEAD -- '*.md'
M       README.md
A       TASK-774-handoff.md
A       TASK-774-log.md
A       TASK-774-merge-master-handoff.md
A       TASK-774-review.md
A       TASK-774-todo.md
```

They were re-added by the current HEAD commit, `7c9b1d01 docs: add task tracking docs for PR #774 and the TS7 migration`. Counting #773's three, the stack adds eight `.md` files against master:

```bash
$ git diff --name-only origin/master...HEAD -- '*.md'
README.md
TASK-774-handoff.md
TASK-774-log.md
TASK-774-merge-master-handoff.md
TASK-774-review.md
TASK-774-todo.md
TASK-ts7-migration-log.md
TASK-ts7-migration-research.md
TASK-ts7-migration-todo.md
```

The PR description currently states: _"The work-tracking `TASK-_.md`docs are no longer tracked on this branch — the only`.md`change against`master`is`README.md`."\* That is no longer accurate and should be corrected or the files untracked.

`.gitignore` is byte-identical to master, so nothing stops them coming back a third time.

#### Recommendation

`git rm --cached TASK-774-*.md` (and the three `TASK-ts7-*.md` on #773), keeping the files on disk. If you want a durable guard rather than repeating this each round, a `TASK-*.md` line in `.gitignore` would do it — flagging rather than doing it, since the round-3 notes record that you asked for that rule to be removed. This review file is itself one of the five and should go with them.

---

### F4 — `CHANGES_REQUESTED` is still the standing review state

**Severity: Medium. Blocker.** Process only.

Timeline: Fabdulla1 was requested on 2026-08-04T09:09:19Z and submitted `CHANGES_REQUESTED` the same day at 13:27:43Z. No later review supersedes it. There are no currently-requested reviewers.

All three of the substantive points in that review are fixed, and I verified each rather than taking the PR description's word for it:

1. **"`runWrite` can abort an already dispatched server write."** Fixed. `runWrite` now uses `SupersedableOperation` (a monotonic token, no `AbortController`) — `usePromiseEffect.ts:33-37`. `ApiClient.postJson`/`putJson` take no `signal` and call `this.fetch(...)` without one (`ApiClient.ts:205-219`). No repository or service write method accepts a signal. All four cited call paths now go through the token: `DateSelectionState.ts:178`, `ChapterEditView.tsx:60`, `ScriptSelection.tsx:64`, `CuneiformFragment.tsx:146`. The five components owning their own `SupersedableOperation` all supersede on unmount.
2. **"Add an integration-level test that reaches a mocked ApiClient or fetch."** Done — `usePromiseEffect.write.integration.test.tsx` drives a real `ApiClient` over mocked `fetch` and asserts separately that no signal is attached, that a second write does not abort the first, and that a superseded write cannot overwrite current UI state.
3. **"Files over the 250-line ceiling."** All seven are now under it: `FragmentService.ts` 246, `FragmentRepository.ts` 240, `TextService.ts` 70, `FakeApi.ts` 190, `SignImages.tsx` 200, `Realia.sass` 6, `withData.test.tsx` 191. (`SignImages.tsx` is under the limit but see F2 for _how_.)

The review still has to be cleared on GitHub. I do not touch reviewer assignment.

---

### F5 — The documented local test gate is not the command CI runs

**Severity: Medium. Non-blocking**, but it is the mechanism by which F1 got this far.

- `.github/copilot-instructions.md` and the PR's own verification section: `yarn test --watchAll=false`
- `.github/workflows/main.yml:58`: `NODE_OPTIONS=--max_old_space_size=1536 yarn test --coverage --forceExit --detectOpenHandles --watch=false`

`--detectOpenHandles` changes observable behaviour, not just reporting — it enables `async_hooks`, which is precisely what makes F1 fail. A gate that cannot reproduce CI is not a gate. The previous review round recorded `tests: PASS` in good faith for this reason.

#### Recommendation

Add a script that mirrors CI exactly — for example `"test:ci": "yarn test --coverage --forceExit --detectOpenHandles --watch=false"` — have `main.yml` call it, and make that the command the instructions name as the hard gate.

---

### F6 — `FragmentAnnotation.tsx` is over the 250-line ceiling

**Severity: Low. Non-blocking.**

`src/fragmentarium/ui/image-annotation/annotation-tool/FragmentAnnotation.tsx` is 432 lines and is the only `.ts`/`.tsx` file this PR touches that exceeds 250.

It is pre-existing — 433 lines on master — and the PR's edit is minimal (dropping the `Bluebird` import and changing one return type to `Promise<void>`), so the change did not push it over. Recording it because the PR body claims a "250-line-per-file refactor across the files this PR touches", which is not true of this one. Either split it or soften the claim.

For context, 46 files repo-wide are over the ceiling; the rest are untouched by this PR.

---

### F7 — `MapTab.sass` still uses `@import`

**Severity: Low. Non-blocking.**

This PR migrated 47 Sass files from `@import` to `@use` and removed `'import'`, `'global-builtin'` and `'color-functions'` from `silenceDeprecations` in `craco.config.js`, plus the matching `ignoreWarnings` regexes. One file was missed:

```sass
# src/map/ui/MapTab.sass:1
@import src/design-tokens
```

It is unchanged from master and is compiled into the build (`MapTab.tsx:13` imports it; `MapTab` is lazy-loaded from `toolsContent.tsx:30`).

Compiled directly under the PR's new options, Dart Sass 1.97.3 does warn:

```text
SASS WARN: Sass @import rules are deprecated and will be removed in Dart Sass 3.0.0. [deprecation import]
```

I checked whether this breaks the "zero warnings" claim, and it does not — `CI=true yarn build:ci-stable` reports `Compiled successfully.` with no warnings, because sass-loader does not surface this particular deprecation to webpack. So the build gate genuinely passes. It is a loose end that will become a hard failure at Dart Sass 3.0.

---

### F8 — The `No bluebird` CI guard has gaps

**Severity: Low. Non-blocking.**

`.github/workflows/main.yml:39-45`:

```yaml
- name: No bluebird
  if: success() || steps.install.outcome == 'success'
  run: |
    if git grep -lE "from 'bluebird'|from \"bluebird\"|require\('bluebird'\)" -- src; then
      echo "::error::bluebird was removed in #774; the files above import it again."
      exit 1
    fi
```

The step works — it correctly exits 0 when nothing matches, and the `if:` condition on the following steps means a failure here does not mask lint/tsc/test results. Two gaps:

- `require("bluebird")` with double quotes is not matched, though `require('bluebird')` is.
- Dynamic `import('bluebird')` is not matched.
- The message hardcodes `#774`, which will read oddly once the PR is history. "bluebird was removed from this project" is enough.

---

### F9 — `README.md` slightly overstates the write guarantee

**Severity: Low. Non-blocking.**

`README.md` says: _"`ApiClient.postJson` and `ApiClient.putJson` do not accept a `signal` at all, so a signal cannot reach a write's `fetch` — the guarantee is enforced by the type system rather than by convention."_

`ApiClient.fetch` is public and takes `(path, authenticate, options: Options, signal?: AbortSignal)`, and `Options` carries `method`. So `apiClient.fetch(path, true, createOptions(body, 'POST'), signal)` type-checks. No caller does this — `postJson` and `putJson` are the only POST/PUT call sites — so the guarantee holds in practice, but at that seam it is convention.

Either narrow the wording, or make `fetch` private and expose the two read helpers plus the two write helpers.

---

### F10 — Container configuration: `Dockerfile` appears in the PR diff

**Severity: Info. Please confirm before merge — you asked to be warned about container config changes.**

**No `.devcontainer/` changes** anywhere in the stack:

```bash
$ git diff --name-status origin/chore/ts7-tsconfig-migration...HEAD -- .devcontainer/ docker-compose.yml .dockerignore
(empty)
$ git diff --name-status origin/master...HEAD -- .devcontainer/
(empty)
```

However, GitHub's file list for this PR **does** include `Dockerfile`, `modified +4/-4`:

```diff
-FROM node:20-alpine AS build
+FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293 AS build
-	giflib-dev=5.2.2-r1 \
+	giflib-dev=5.2.2-r2 \
-	python3=3.12.13-r0 \
+	python3=3.12.14-r0 \
-FROM node:20-alpine
+FROM node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293
```

This is not authored by this PR. It is master's own change (a base-image digest pin plus two Alpine package bumps) arriving via the master merge, and it shows up in the PR diff only because the base branch `chore/ts7-tsconfig-migration` predates it. HEAD's `Dockerfile` is byte-identical to master's:

```bash
$ git diff origin/master HEAD -- Dockerfile
(empty)
```

So the net effect on master is zero, and the change itself is a security improvement (pinning the base image by digest). The three changes are consistent with each other — both `FROM` lines get the same digest, and the package bumps are patch-level. Nothing here looks unexpected. Confirming it explicitly because it is container configuration and a reviewer reading the GitHub diff will see it presented as this PR's work.

The `docker` and `docker-test` jobs are `SKIPPED` on this PR (they are gated on pushes to master), so the image is not actually built or pushed from here.

---

### F11 — The qlty coverage upload is skipped for stacked PRs

**Severity: Info. Acknowledge.**

`.github/workflows/main.yml:64-65` adds `if: github.event_name == 'push' || github.base_ref == 'master'` to the `qltysh/qlty-action/coverage` step. This was the round-4 remediation for widened base globs, and it is the right call — it stops stacked PRs polluting the coverage baseline.

The consequence worth stating: this PR never uploads its own coverage, so its 100% coverage claim is not verified by any external gate on the PR. Combined with F2 — where the per-file gate points at dead files — coverage on this PR is currently self-reported.

---

### F12 — Node 20 deprecation warnings in CI

**Severity: Info. Acknowledge.** Not introduced by this PR.

```text
Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to run on Node.js 24:
actions/checkout@v4, actions/setup-node@v4.
```

Worth a separate housekeeping PR to move to `actions/checkout@v5` / `actions/setup-node@v5`.

---

## Verified as claimed

Checked rather than taken on trust:

| Claim                                       | Result                                                                                                                                                    |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn lint` clean                           | **PASS** — eslint + stylelint, exit 0                                                                                                                     |
| `yarn tsc` clean                            | **PASS** — exit 0                                                                                                                                         |
| `yarn build:ci-stable` clean, zero warnings | **PASS** — `CI=true`, `Compiled successfully.`, no warnings                                                                                               |
| Full suite green, zero console output       | **PASS** under the documented command — 500 suites, zero `console.error`/`console.warn`/unhandled rejections. **FAIL** under CI's command (F1)            |
| bluebird gone from `src` and `package.json` | **PASS** — zero references in either; 3 transitive entries remain in `yarn.lock`, as the PR states                                                        |
| Writes are never network-aborted            | **PASS** — verified through every call path, not just the primitives (see F4)                                                                             |
| Sass `@import` → `@use` migration           | **PASS with one exception** — 47 files migrated, zero `darken()` remaining, one `@import` left (F7)                                                       |
| 250-line ceiling on the seven flagged files | **PASS** — all ≤ 246 lines (but see F2 for `SignImages.tsx` and F6 for `FragmentAnnotation.tsx`)                                                          |
| CodeQL                                      | **PASS** — "No new alerts in code changed by this pull request"; `Analyze (javascript)` success                                                           |
| Secrets                                     | **PASS** — GitGuardian ×3, no secrets detected                                                                                                            |
| No dev container changes                    | **PASS** for `.devcontainer/`; see F10 for `Dockerfile`                                                                                                   |
| No skipped or disabled tests                | **PASS** — zero `xit`, `xdescribe`, `it.skip`, `test.skip` or `describe.skip` anywhere in `src`. Round 4's two `xit` tests in `Edition.test.tsx` are gone |
| No write method accepts an `AbortSignal`    | **PASS** — 67 methods declare `signal?: AbortSignal`, none of them writes; every POST/PUT path goes through `postJson`/`putJson`, which take none         |

Repo-wide pre-existing CodeQL alerts could not be enumerated — the available token lacks the `code-scanning` scope. The PR-scoped CodeQL result above is from the check run on the head commit and is authoritative for this PR.

---

## Severity

| Severity | Count | Findings       |
| -------- | ----- | -------------- |
| High     | 2     | F1, F2         |
| Medium   | 3     | F3, F4, F5     |
| Low      | 4     | F6, F7, F8, F9 |
| Info     | 3     | F10, F11, F12  |

Blocking: F1, F2, F3, F4. F1 and F2 are code; F3 and F4 are process.

---

## Reproduction Steps

Consolidated; per-finding detail is under each finding above.

```bash
# F1 — CI-red test. Fails with the flag, passes without it.
CI=true npx craco test --watchAll=false \
  --runTestsByPath src/fragmentarium/application/FragmentService.queries.test.ts \
  --detectOpenHandles --forceExit          # 1 failed
CI=true npx craco test --watchAll=false \
  --runTestsByPath src/fragmentarium/application/FragmentService.queries.test.ts   # 22 passed

# F1 — the underlying mechanism
node -e "
const ah=require('async_hooks'); ah.createHook({init(){},destroy(){}}).enable();
const BB=require('bluebird');
const syms=o=>Object.getOwnPropertySymbols(o).filter(s=>o.propertyIsEnumerable(s)).map(String);
console.log('bluebird:', JSON.stringify(syms(BB.resolve({a:1}))));
console.log('native  :', JSON.stringify(syms(Promise.resolve({a:1}))));"

# F2 — the duplicate, and the fact that the extracted copy is dead
diff <(sed -n '92,200p' src/signs/ui/display/SignImages.tsx) \
     <(sed -n '14,122p' src/signs/ui/display/PeriodAccordion.tsx)
grep -rn "signs/ui/display/PeriodAccordion'" src --include=*.ts --include=*.tsx

# F3 — tracked task docs
git diff --name-status origin/chore/ts7-tsconfig-migration...HEAD -- '*.md'

# F7 — the missed Sass file
node -e "
const sass=require('sass');
sass.compile('src/map/ui/MapTab.sass',{loadPaths:['.','src','node_modules'],syntax:'indented',
  quietDeps:true,silenceDeprecations:['legacy-js-api'],
  logger:{warn(m){console.log('SASS WARN:',m)}}});"

# F10 — container config
git diff --name-status origin/master...HEAD -- .devcontainer/    # empty
git diff origin/master HEAD -- Dockerfile                        # empty
```

---

## Comment and review status

### Timeline review events — 3 total

| When                 | Who         | State               | Status                                                        |
| -------------------- | ----------- | ------------------- | ------------------------------------------------------------- |
| 2026-08-04T13:27:43Z | Fabdulla1   | `CHANGES_REQUESTED` | **Unresolved** — code findings fixed, review not cleared (F4) |
| 2026-07-23T13:17:09Z | qltysh[bot] | `COMMENTED`         | Resolved — all threads closed                                 |
| 2026-07-21T16:45:50Z | qltysh[bot] | `COMMENTED`         | Resolved — all threads closed                                 |

### Inline review threads — 6 total, 6 resolved, 0 unresolved

All six are qlty `similar-code` reports, all resolved by `qltysh[bot]` and all outdated against the current head.

| Path                                         | Report                      | Resolved | Outdated |
| -------------------------------------------- | --------------------------- | -------- | -------- |
| `src/corpus/application/TextService.ts`      | 17 similar lines (mass 79)  | yes      | yes      |
| `src/corpus/application/TextService.ts`      | 17 similar lines (mass 79)  | yes      | yes      |
| `src/corpus/application/TextService.ts`      | 15 similar lines (mass 66)  | yes      | yes      |
| `src/corpus/application/TextService.ts`      | 15 similar lines (mass 66)  | yes      | yes      |
| `src/common/hooks/usePromiseEffect.test.tsx` | 18 similar lines (mass 120) | yes      | yes      |
| `src/common/hooks/usePromiseEffect.test.tsx` | 18 similar lines (mass 120) | yes      | yes      |

### General / issue comments — 0

None on this PR.

### Automated review bots

No `sourcery-ai` review or comment exists on this PR — the only bot participating is `qltysh[bot]`. The `qlty check` commit status is green but reports **9 blocking issues** on the qlty dashboard (<https://qlty.sh/gh/ElectronicBabylonianLiterature/projects/ebl-frontend/pull/774/issues>); that dashboard needs its own credentials, which are not available here, so the nine could not be enumerated item by item. A local `qlty smells --all` run over the files this PR touches surfaces the duplication behind F2 as the largest item by mass (333), along with `SignImage.tsx` (144), `PeriodPreview.tsx` (119), `VariantGroup.tsx` (115) and `createScript.test.ts` (314) — most of which resolve once F2 is fixed.

---

## Recommendation

**Originally: request changes.** After the same-day remediation, every actionable finding is fixed in the working tree and the two remaining items are process, not code.

The verdict below is kept as written at review time; the remediation table near the top records what changed.

The bluebird work itself is sound and the August review's objections are genuinely resolved. Two things need fixing in the diff before this is mergeable:

- **F1** is small — await the promise, type the variable — and it turns CI green. Worth grepping the suite for the same pattern while you are in there, since bluebird was masking it everywhere it occurs.
- **F2** is the one with real substance. The refactor is half-applied: the app renders a duplicate of the component that was supposedly extracted, the two copies have drifted, the live one missed the `ConcurrencyLimiter` migration this PR is about, and the coverage gate is pointed at the dead half. It is a contained fix — delete one copy of each of the three pairs and rewire one import — but until it lands, both the DRY gate and the coverage claim are not actually met.

**F3** and **F4** are process and can be done at any point before merge.

The remaining findings are non-blocking. **F5** is worth doing regardless of this PR, because it is the reason F1 was not caught locally.

On **F10**: the `Dockerfile` change in the GitHub diff is master's, not this PR's, and HEAD matches master exactly — but please confirm you are happy with it, since it is container configuration and the diff presents it as part of this PR.

Merge order is unchanged: land #773, let GitHub retarget this PR to master, then re-verify.

---

## What Has To Be Done

Items 1-8 and 12-16 from the original list are **done** — see the remediation table near the top of this document. What remains:

**Yours — cannot be done from inside the diff.**

1. **Clear the standing review (F4).** Fabdulla1's `CHANGES_REQUESTED` from 2026-08-04 needs a re-review once these changes land. Reviewer assignment is yours; I do not add or re-request reviewers.
2. **Confirm the `Dockerfile` (F10)** — digest-pinned base image plus `giflib-dev` and `python3` patch bumps. It is master's change arriving through a stale base branch and HEAD matches master byte-for-byte, so merging changes nothing on master. Flagged because it is container configuration.
3. **Decide on a `.gitignore` guard for `TASK-*.md` (F3).** The files are untracked now, but nothing stops a future `git add -A` re-adding them — which is how they came back this round. The rule was removed at your request in round 3, so re-adding it is your call.
4. **Correct the PR description (F3).** The "no longer tracked on this branch" paragraph becomes true again once the staged untracking is committed. The "250-line-per-file refactor across the files this PR touches" claim is now accurate too.
5. **Review the commit before making it.** Everything above sits uncommitted in the working tree.

**After the changes land.**

6. **Confirm the `test` check is green on GitHub** before asking for re-review.
7. **Land #773 first**, let GitHub retarget this PR to `master`, then re-verify the gates against the retargeted diff.
8. **Delete the task-tracking docs** — `TASK-774-todo.md`, `TASK-774-log.md`, `TASK-774-handoff.md`, `TASK-774-merge-master-handoff.md` and this review file — along with #773's three, before merge.

**Noted, not acted on.**

9. **Three files remain over the 250-line ceiling** — `about/ui/bibliography.tsx` (1290), `corpus/ui/ChapterViewLine.tsx` (392), `corpus/domain/manuscript.test.ts` (265). All three are byte-identical to master and unchanged by this PR; they only appear in the diff because the base branch is stale. Splitting them belongs in its own PR.
10. **The qlty coverage upload stays skipped for stacked PRs (F11)** — deliberate, unchanged.
