---
task_id: 774
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
title: 'chore: remove bluebird, use AbortController for cancellation'
reviewed_head_sha: eac106a46b1c7a72e7a7a3662d2503c33b832212
base_branch: chore/ts7-tsconfig-migration
base_sha: 4f71cb249bc0db899f1a22ce42ac93ebd961eeda
master_sha: e281f7ba (branch is 3 commits behind master)
master_merged_into_branch: 1dcc762ecef48d898119199c0f7b45e2bd7d1950
stacked_on: '#773 (chore/ts7-tsconfig-migration) — retargets to master when #773 merges'
review_date: 2026-09-17
review_round: 6
remediation_date: 2026-09-17
remediation_state: 14 of 18 findings resolved — 13 uncommitted in the working tree plus F5 applied to the PR description; F3 excluded by instruction, F4/F9/F14 need actions that are not mine to take
reviewer: Claude (automated review)
verdict: CHANGES REQUESTED, LARGELY REMEDIATED — the cancellation design is correct and every earlier reviewer finding is fixed at its root; F1, F2, F5-F8 and F10-F16 are now resolved, and F3 (the task-doc cleanup), F4 (clear the review), F9 and F14 (merges) remain open
findings_total: 18
findings_blocking: 4
findings_non_blocking: 12
findings_informational: 2
scope_vs_base: 696 files changed, +43773 / -22608, 35 commits
scope_note: '~331 of the 696 files are master drift — master was merged into this branch but not into the base branch, so the GitHub diff shows far more than this PR owns'
devcontainer_changes: 'NONE in .devcontainer/ — but the GitHub diff does show Dockerfile (+4/-4) and .dockerignore (+6/-1). Both are master drift, not this PR. See W1 before merging.'
gates:
  lint: PASS — eslint + stylelint clean (49s)
  tsc: PASS — clean (26s)
  build: PASS — yarn build:ci-stable, "Compiled successfully", zero warnings (119s)
  tests: PASS after remediation — yarn test:ci green; was 499/500 suites and 4394/4395 tests before F1 was fixed
  console_clean: PASS — zero console.error / console.warn / unhandled rejections across the full run
  coverage_global: 95.09 stmts / 87.97 branch / 94.73 funcs / 95.23 lines after remediation (was 94.84 / 87.49 / 94.63 / 94.98); every file in the 48-path gate at 100%
  line_ceiling_250: PASS — no file touched by this PR exceeds 250 lines; largest file touched during remediation is 219
  dry: PASS after remediation — the duplicated test file is gone and the realia route helpers are shared
  no_new_md: FAIL — 8 TASK-*.md files tracked on the branch (F3)
  app_runs: PASS — built app boots, all routes render, rapid navigation aborts in-flight reads with no unhandled rejections
independent_verifications:
  sass_byte_identical: CONFIRMED — 60/60 entrypoints compile byte-identical against the correct baseline
  no_tests_lost: CONFIRMED — 2573 -> 2771 cases (+198); all 27 disappeared titles accounted for
  writes_never_aborted: CONFIRMED — no write path accepts an AbortSignal; enforced by the type system
ci_checks_on_head:
  CodeQL: success — but could not diff the PR (F9)
  Analyze (javascript): success — 3 annotations
  test: success — contrast with the local failure in F1
  GitGuardian (x3): success
  docker / docker-test: skipped — by design, push-to-master only
  qlty check: 'success — 3 blocking issues'
review_comment_status:
  timeline_review_events: 3 — qltysh[bot] COMMENTED x2, Fabdulla1 CHANGES_REQUESTED (still open)
  inline_review_threads: 6 — all qltysh[bot], all resolved + outdated + collapsed
  general_issue_comments: 0
  sourcery_ai: not present on this PR
---

# Review — PR #774

## Friendly summary

Nice work — this is a genuinely well-executed removal. The central design call is the right one: reads get a real `AbortSignal`, writes get a staleness token and are never network-aborted, and that guarantee is enforced by the type system rather than by convention (`postJson`/`putJson` simply have no `signal` parameter, and `fetch` is private). Every one of the earlier reviewer's three findings is fixed at the root, not papered over. I re-verified the two claims that were doing the most load-bearing work and both held up: all 60 Sass entrypoints really do compile byte-identical, and no test was lost anywhere in the reshuffle — the suite actually grew by 198 cases.

Four things are blocking. The full `yarn test:ci` run is red on one flaky realia test, `createScript.test.ts` is a verbatim copy of an existing file, the eight `TASK-*.md` docs are still tracked and would land on master, and the CHANGES_REQUESTED review is still formally open. None of them are deep — but the first one is the sort of flake that will bite intermittently in CI, so it is worth root-causing rather than re-running.

### Details

| #   | Finding                                                                                                      | Severity | Status                                                                                     |
| --- | ------------------------------------------------------------------------------------------------------------ | -------- | ------------------------------------------------------------------------------------------ |
| F1  | `yarn test:ci` is red — `RealiaDisplay.redirectFetching.test.tsx` fails in the full run, passes in isolation | Blocker  | **Fixed** — asserts the landed redirect instead of a call counter on a 1000 ms budget      |
| F2  | `createScript.test.ts` is a verbatim duplicate of `FragmentRepository.script.test.ts:11-65`                  | Blocker  | **Fixed** — the copy is deleted; the original keeps all five cases                         |
| F3  | 8 `TASK-*.md` files (3,210 lines) are tracked and will land on master                                        | Blocker  | **Open — excluded by instruction**                                                         |
| F4  | Fabdulla1's CHANGES_REQUESTED review is still open                                                           | Blocker  | Open — reviewer management, not mine to do (substance fixed)                               |
| F5  | The PR body makes two false statements about the `.md` files                                                 | Major    | **Fixed** — PR description corrected on GitHub, 2026-09-17                                 |
| F6  | Two new files land below 100% coverage                                                                       | Major    | **Fixed** — both at 100/100/100/100                                                        |
| F7  | `craco.config.js` hardcodes a hand-maintained 35-path coverage allowlist                                     | Major    | **Fixed** — 48 paths, every write-path file this PR touches included                       |
| F8  | qlty coverage upload is now skipped for stacked PRs                                                          | Major    | **Fixed** — the reason and the alternative are recorded in the workflow                    |
| F9  | CodeQL could not diff this PR — "too many (300) changed files"                                               | Major    | Open — needs a merge commit                                                                |
| F10 | The new "No bluebird" CI step has grep gaps                                                                  | Minor    | **Fixed** — subpaths, `require.resolve` and `package.json` now covered                     |
| F11 | Pre-existing: the CI `Install` step cannot fail                                                              | Minor    | **Fixed**                                                                                  |
| F12 | `if: success() \|\| steps.install.outcome == 'success'` defeats fail-fast                                    | Minor    | **Fixed**                                                                                  |
| F13 | `isCancellation` swallows genuine errors when the signal happens to be aborted                               | Minor    | **Documented** — narrowing rejected as regression-prone; trade-off recorded in `README.md` |
| F14 | Branch is 3 commits behind master                                                                            | Minor    | Open — needs a merge commit                                                                |
| F15 | `browserslist` prints a warning during `yarn test:ci`                                                        | Minor    | **Fixed** — `caniuse-lite` refreshed, "No target browser changes"                          |
| F16 | Implicit `any` and a missing return type in moved code                                                       | Minor    | **Fixed** — plus a pre-existing leaked `keyup` listener                                    |
| W1  | Docker config appears in the diff but is not owned by this PR — read before merging                          | Warning  | Informational                                                                              |
| W2  | Workflow trigger widening reviewed and considered safe                                                       | Warning  | Informational                                                                              |

## Summary

PR #774 removes `bluebird` and replaces its cancellable promises with the web-standard `AbortController`/`AbortSignal` for reads and a token-based supersession primitive for writes. It also carries a Sass `@import` -> `@use` migration, a 250-line-per-file refactor of the files it touches, and CI changes so that stacked PRs run CI and CodeQL at all.

The architecture is sound and the split between the two cancellation mechanisms is correct and well argued. Reads thread a native signal down into `fetch`; writes deliberately do not, because once a write is dispatched the client cannot know whether the server applied it, so aborting the connection would lose that outcome silently. A superseded write runs to completion and only its UI update is discarded. Crucially this is not a convention — `ApiClient.postJson` and `ApiClient.putJson` have no `signal` parameter at all, and the only method that accepts one alongside an arbitrary `method` is `private`. I grepped every repository and service write method and none accepts a signal.

The scope is much larger than it looks. GitHub reports 696 changed files, but roughly 331 of those are master drift: master was merged into this branch (at `1dcc762e`) but the base branch `chore/ts7-tsconfig-migration` still sits at the July merge-base, so two months of unrelated master history shows up in the PR diff. That is the direct cause of F9, and it makes the diff hard for a human to read.

### What I verified independently, rather than taking on trust

- **The Sass claim holds.** I compiled all 60 `.sass` entrypoints on this head and on the correct baseline with the project's own Sass binary. 53 are byte-identical against the merge-base; the 6 that differ were all separately modified by master, and against the merged-master baseline those 6 plus `MapTab.sass` are byte-identical too. So 60/60. Zero `@import` and zero `darken(`/`lighten(` remain; 48 files are on `@use`.
- **No test was removed.** Test cases went from 2,573 to 2,771 (+198). 27 test titles present on the merged-master baseline are absent on this head, and I traced every one: roughly 19 are bluebird cancellation tests renamed to their AbortController equivalents ("Cancels the promise on unmount" -> "Aborts a read on unmount"), the 401/403 reporting pair became a single `it.each`, the six guest-permission and unauthenticated-permission cases were merged into two `it.each` blocks (master had literally duplicated that assertion set across two describes), and the "Login required"/"Consent required" pair became an `it.each`. Nothing was silently dropped.
- **The earlier reviewer's three findings are fixed at the root.** Writes no longer take a signal anywhere; the requested integration test exists and proves all three required properties; and all seven files flagged as over 250 lines are now well under it.
- **The refactor reduced complexity rather than moving it around.** Master's `FragmentAnnotation.tsx` carried complexity 50, 8 returns, total complexity 52. After the split the worst function in that directory is complexity 25.
- **The app runs.** The production build boots, every route renders, and rapid route-to-route navigation — which now aborts in-flight reads — produced no unhandled rejections and no `AbortError` leaking into the UI. With the API stubbed, 27 requests were served and the console stayed clean.

## Findings

### F1 — BLOCKER — `yarn test:ci` is red: one realia test fails in the full run

`src/realia/ui/RealiaDisplay.redirectFetching.test.tsx` -> "requests the entry only once across the canonicalising redirect" fails in the full suite with `Expected number of calls: 2, Received number of calls: 1`, and the rendered body is empty at the point of failure.

This is order- or timing-dependent, not deterministic:

- Full `yarn test:ci`: **fails** (suite 276 of 500) — 499/500 suites, 4394/4395 tests, 612s.
- The same file alone, three consecutive runs: **passes 3/3**.
- The whole `src/realia` directory in band with `--detectOpenHandles --forceExit`: **passes**, 26 suites / 202 tests.
- GitHub CI on this same head commit `eac106a4`: **green**.

This PR is implicated rather than merely adjacent. It changed this very test from `Bluebird.resolve(entry)` to `Promise.resolve(entry)` for both repository mocks, and it changed the getter the test exercises so that it threads a signal:

```
-`>(RealiaEntryDisplay, (props) => props.realiaService.find(props.id), {`
+`>(RealiaEntryDisplay, (props, signal) => props.realiaService.find(props.id, signal), {`
```

Bluebird schedules its callbacks differently from native promises, so the redirect chain (fetch by `realiaId` -> learn the canonical lemma -> navigate -> fetch by lemma) now settles on a different tick boundary. The test's `waitFor` uses the default 1000 ms budget, which is comfortable in isolation and marginal 276 suites into a `--runInBand --coverage --detectOpenHandles` run. That the project's own instructions call out `--detectOpenHandles` as behaviour-changing (it enables `async_hooks`) makes this exactly the failure mode to expect.

The project rules make a green `yarn test:ci` a hard gate and require non-deterministic ordering to be fixed so the affected tests are isolated and deterministic, rather than masked. An intermittent green in GitHub CI is the dangerous case, not the reassuring one.

### F2 — BLOCKER — `createScript.test.ts` is a verbatim duplicate of an existing test file

`src/fragmentarium/infrastructure/createScript.test.ts` (59 lines, added by commit `1b0fe6b2` "refactor: split the remaining PR #774 files and close the coverage gaps") reproduces, word for word, the entire `describe('createScript fallback behavior')` block at `src/fragmentarium/infrastructure/FragmentRepository.script.test.ts:11-65` — the same five test cases with the same names, the same DTOs and the same assertions.

`FragmentRepository.script.test.ts` is byte-identical to master, so this is not a move that lost its source: it is a straight copy. Both files run, both pass, and the five cases execute twice per suite run. qlty reports it as "Found 55 lines of identical code in 2 locations (mass = 314)", which is almost certainly one of the 3 blocking issues on the qlty check.

DRY is a hard gate in this project. Delete `createScript.test.ts`, or move the block out of `FragmentRepository.script.test.ts` into it so it lives in exactly one place.

### F3 — BLOCKER — eight `TASK-*.md` files are tracked and will land on master

```
TASK-774-handoff.md                 111 lines
TASK-774-log.md                   1,906 lines
TASK-774-merge-master-handoff.md     82 lines
TASK-774-review.md                  619 lines
TASK-774-todo.md                    199 lines
TASK-ts7-migration-log.md            96 lines
TASK-ts7-migration-research.md      155 lines
TASK-ts7-migration-todo.md           42 lines
```

All eight are tracked in `HEAD`, none exists on master, and all were added in commit `7c9b1d01` ("docs: add task tracking docs for PR #774 and the TS7 migration"). There is no `TASK` rule in `.gitignore`. Merging this PR publishes 3,210 lines of scratch work-tracking to master.

Note that `7c9b1d01` is the _second-newest_ commit on the branch, so it post-dates the commit whose message claimed the docs had been removed. (This file is one of the eight — it needs to go with the rest.)

### F4 — BLOCKER — the CHANGES_REQUESTED review is still open

Fabdulla1 requested changes on 2026-08-04 against commit `5ef4a984`. No later review event supersedes it, and no reviewer is currently requested. GitHub will treat this as blocking regardless of the code state.

The substance is fully addressed, and I verified each point rather than taking the PR body's word for it:

1. _"`runWrite` can abort an already dispatched server write."_ Fixed at the root. `runWrite` now uses `SupersedableOperation` (an integer token, no `AbortController`), `AbortableOperation` is read-only, and no write path anywhere accepts a signal. The exact path called out — `DateSelectionMethods.ts` -> `FragmentService` -> `FragmentRepository` -> `ApiClient.postJson` -> `fetch` — now runs through `applyWhenCurrent` with a staleness predicate and dispatches an unabortable write. The other three named call sites (`ChapterEditView.tsx`, `CuneiformFragment.tsx`, `ScriptSelection.tsx`) use the same primitive.
2. _"Add an integration-level test that reaches a mocked ApiClient or fetch."_ Done. `src/common/hooks/usePromiseEffect.write.integration.test.tsx` drives a real `ApiClient` over mocked `fetch` and asserts separately that no abort signal is attached to a dispatched write, that a second write does not abort the first, and that a superseded write cannot overwrite current UI state.
3. _"Seven files over the 250-line ceiling."_ All seven are under it: `FragmentService.ts` 246, `FragmentRepository.ts` 240, `TextService.ts` 70, `FakeApi.ts` 190, `SignImages.tsx` 83, `Realia.sass` 6, `withData.test.tsx` 191. I also checked every file this PR touches — none exceeds 250.

This needs a re-request and a dismissal or a fresh approving review; it is not something the code can resolve on its own.

### F5 — MAJOR — the PR body contains two false statements

The "Note" section states: _"The work-tracking `TASK-_.md`docs are no longer tracked on this branch — the only`.md`change against`master`is`README.md`."* That is not true of the current head (see F3). The following "Correction to commit `502c1ccf`" paragraph then asserts *"It is true of the branch as it now stands"*, which is also not true — commit `7c9b1d01` re-added all eight files afterwards. Both paragraphs need rewriting or removing once F3 is resolved.

### F6 — MAJOR — two new files land below 100% coverage

Both files are new in this PR, created by splitting master's 433-line `FragmentAnnotation.tsx`, and neither is in the `fullyCoveredPaths` allowlist that would hold it to 100%:

| File                                | Stmts | Branch | Funcs | Lines | Uncovered                                       |
| ----------------------------------- | ----- | ------ | ----- | ----- | ----------------------------------------------- |
| `useAnnotationKeyboardShortcuts.ts` | 66.66 | 20.00  | 66.66 | 66.66 | 39-42, 50-53, 61-65                             |
| `useFragmentAnnotationState.ts`     | 82.75 | 46.87  | 91.30 | 82.55 | 24, 91-92, 115, 121-128, 135, 140, 147-158, 211 |

The sibling files from the same split — `initializeAnnotations.ts` and `FragmentAnnotationToolbar.tsx` — are both at 100%, so the standard is clearly reachable. In fairness, the coverage is inherited rather than newly lost (the logic sat in an untested region of `FragmentAnnotation.tsx` before), and the split genuinely improved the code: complexity went from 50 to 25. But the project rule is 100% on affected code, and these two files are now the affected code.

### F7 — MAJOR — the coverage gate is a hand-maintained allowlist

`craco.config.js` now carries a literal array of 35 paths held to 100/100/100/100, with everything else on a global floor of 93/84/93/93. Two problems:

- The list will rot. Nothing adds a new file to it, so the default for anything created from now on is the 93% floor, not 100%.
- It misses this PR's own write-path changes. `DateSelectionMethods.ts`, `TransliterationForm.tsx`, `WordEditor.tsx`, `ChapterEditView.tsx`, `ScriptSelection.tsx` and `BibliographyEntryFormController.tsx` are the components the cancellation redesign actually touched, and none of them is in the list.

Across all 152 non-test source files this PR changes, 97 are at 100% on every metric and 54 are below on at least one.

### F8 — MAJOR — qlty coverage upload is skipped for stacked PRs

```yaml
- uses: qltysh/qlty-action/coverage@v1
  if: github.event_name == 'push' || github.base_ref == 'master'
```

`github.base_ref` is `chore/ts7-tsconfig-migration` here, so no coverage is uploaded for this PR. The intent — not polluting the qlty coverage baseline from a stacked branch — is reasonable, but the consequence is that the coverage gate cannot be verified in CI for exactly the PR that needs it most. Worth stating explicitly in the PR description, or gating on `push` only and letting stacked PRs upload under a distinct tag.

### F9 — MAJOR — CodeQL could not diff this PR

The `Analyze (javascript)` check carries this annotation:

```
Cannot retrieve the full diff because there are too many (300) changed files in the pull request.
```

The CodeQL check nevertheless reports "No new alerts in code changed by this pull request". With no diff available, that is not a diff-scoped guarantee — it is the absence of one. The root cause is structural: the PR diff is 696 files because master was merged into this branch but not into the base branch, so ~331 files of unrelated master history are in scope. Merging master into `chore/ts7-tsconfig-migration` (or landing #773 first and letting GitHub retarget) would collapse the diff to what this PR actually owns and restore CodeQL's differential analysis.

The other two annotations on that check are GitHub deprecation notices (Node 20 runner, CodeQL Action v3 sunset in December 2026) and are not caused by this PR, though `codeql-analysis.yml` is a file it edits.

### F10 — MINOR — the new "No bluebird" CI step has grep gaps

```yaml
- name: No bluebird
  run: |
    if git grep -lE "(from|import|require)[[:space:]]*\(?[[:space:]]*['\"]bluebird['\"]" -- src; then
```

The guard is a good idea and the exit handling is correct. It misses:

- subpath imports such as `bluebird/js/release/promise`, which the regex's closing quote rejects;
- `require.resolve('bluebird')`;
- re-introduction into `package.json` or `yarn.lock`, since the search is scoped to `-- src`.

Widening the pattern to `['\"]bluebird(/[^'\"]*)?['\"]` and adding a check that `package.json` has no `bluebird` key would close it.

### F11 — MINOR — pre-existing: the CI `Install` step cannot fail

```yaml
- name: Install
  id: install
  run: |
    for i in 1 2 3; do
      yarn install --dev --frozen-lockfile && break || {
        echo "Install attempt $i failed, retrying in 10 seconds..."
        sleep 10
      }
    done
```

If all three attempts fail, the last command executed is the `{ echo ...; sleep 10; }` group, which exits 0. The step therefore succeeds, `steps.install.outcome == 'success'`, and every subsequent step runs against a broken `node_modules`, failing with confusing errors instead of a clear "install failed". Pre-existing, but in a file this PR edits, and the project rules ask for pre-existing defects found during the work to be fixed at their root. A trailing `|| exit 1` after the loop fixes it.

### F12 — MINOR — `if: success() || steps.install.outcome == 'success'` defeats fail-fast

Every step in the `test` job carries this condition, and the new "No bluebird" step copies it. `success()` is already the default, so the `||` clause only adds behaviour: a step runs even when an _earlier_ step failed, as long as install succeeded. A lint failure no longer stops Compile, Unit Tests or Build. The job still fails overall, so this is wasted CI minutes and noisier logs rather than a correctness hole — but the new step should not have inherited the pattern.

### F13 — MINOR — `isCancellation` swallows genuine errors when the signal is aborted

```ts
export function isCancellation(error: unknown, signal?: AbortSignal): boolean {
  return isAbortError(error) || Boolean(signal?.aborted)
}
```

The second clause is unconditional on the error. If a getter throws a real bug — a `TypeError` from a bad domain factory, say — and the component happens to unmount before it settles, `withData` and `usePromiseEffect` will both classify it as a cancellation and discard it silently. This is the conventional "cancellation wins" trade-off and it is defensible, but it means an entire class of unmount-adjacent bugs becomes invisible. Worth at least a comment recording the decision, or narrowing to `isAbortError(error) || (signal?.aborted && isAbortError(error))` where the distinction matters.

### F14 — MINOR — the branch is three commits behind master

`e281f7ba` (Read nameBreaks alongside nameParts, #817), `af0b7942` (Add Gaziantep Museum, #819) and `51bfc9ff` (Add Erimtan and Marash museums, #818) are not in this branch. #817 touches `token.ts`, `accents.ts` and their tests. Worth re-merging before merge so the head is tested against current master.

### F15 — MINOR — `browserslist` prints a warning during `yarn test:ci`

```
Browserslist: browsers data (caniuse-lite) is 8 months old. Please run:
  npx update-browserslist-db@latest
```

Pre-existing and harmless, but the project treats a console-clean test run as a hard gate, and this is the one piece of noise the run still emits.

### F16 — MINOR — implicit `any` and a missing return type in moved code

- `src/chronology/application/DateSelectionState.ts:187` — `const _saveDate = (updatedDate) =>` has an implicit `any` parameter.
- `src/fragmentarium/ui/image-annotation/annotation-tool/useFragmentAnnotationState.ts:132` — `const onZoom = (event) =>` likewise.
- The same file's default export has no return type annotation despite returning a 25-key object.

Both implicit `any`s are faithfully moved from master and only compile because `noImplicitAny` is `false` in `tsconfig.json`. The project rules ask for explicit annotations and for `any` to be avoided; a file this PR creates is a reasonable place to fix them. The same file also shadows the outer `annotations` state inside `saveAnnotations`, `onDelete` and `handleSelection`, and `onClick` has a redundant first branch whose effect is a strict subset of the second — all inherited from master's version verbatim, so the split itself is faithful.

### W1 — WARNING — dev container and Docker configuration (please read before merging)

You asked to be warned about dev container changes, so, precisely:

**`.devcontainer/` is not touched by this PR.** `devcontainer.json`, `.devcontainer/Dockerfile`, `inject-secrets.sh` and `.devcontainer/README.md` are all unchanged.

**However, the GitHub diff for this PR does show two container files**, and it is worth knowing why before you read them as this PR's work:

| File            | Shown in diff | Owned by this PR?              |
| --------------- | ------------- | ------------------------------ |
| `Dockerfile`    | +4 / -4       | **No** — entirely master drift |
| `.dockerignore` | +6 / -1       | **No** — entirely master drift |

I confirmed this by diffing each file against master directly: this PR's own commits make zero changes to either. They appear only because the base branch is stale (see F9). If #773 lands first and GitHub retargets this PR to master, both will vanish from the diff.

The content of those master changes, since they are in scope for the merge either way:

- Both `FROM node:20-alpine` stages are now pinned to digest `sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293`. Good supply-chain practice.
- `giflib-dev` `5.2.2-r1` -> `5.2.2-r2` and `python3` `3.12.13-r0` -> `3.12.14-r0`. These are exact-version `apk` pins, so if Alpine drops those exact revisions from its repository the image build breaks.
- `.dockerignore` widened to exclude `*.testSupport.ts(x)`, `**/testSupport`, `**/testFixtures` and `src/__mocks__` — which matches the new test-support file naming this PR introduces, so the two are worth keeping consistent.

**The risk worth flagging:** `docker` and `docker-test` are both gated on `github.event_name == 'push' && github.ref == 'refs/heads/master'`, so they are skipped on every pull request — and were skipped on this one. **The Dockerfile is never built in PR CI.** The pinned digest and the two `apk` version bumps get their first real validation only after this merges to master. If you want certainty before merging, a local `docker build .` is the cheapest way to get it.

### W2 — WARNING — workflow trigger widening, reviewed

`main.yml` and `codeql-analysis.yml` both widen their pull-request base filter from `[master]` to `[master, 'chore/**', 'feature/**', 'fix/**']`. I looked at this specifically because widening CI triggers can expose secrets. It is safe here:

- the trigger is `pull_request`, not `pull_request_target`, so fork PRs run without access to repository secrets;
- the workflow declares `permissions: contents: read` at the top level;
- `SLACK_WEBHOOK_URL` and `QLTY_COVERAGE_TOKEN` are the only secrets in the `test` job, and both resolve to empty for forks.

`actions/checkout@v4 -> v5` and `actions/setup-node@v4 -> v5` across all three workflows are routine. `update-sitemaps.yml` correctly keeps `persist-credentials: false`.

Note that PRs targeting other long-lived branches — the many `map/**` branches currently open, for example — still get no CI under these patterns.

## Severity

| Severity      | Count | Findings                          |
| ------------- | ----- | --------------------------------- |
| Blocker       | 4     | F1, F2, F3, F4                    |
| Major         | 5     | F5, F6, F7, F8, F9                |
| Minor         | 7     | F10, F11, F12, F13, F14, F15, F16 |
| Informational | 2     | W1, W2                            |

## Reproduction Steps

**F1 — the failing test**

```bash
yarn test:ci
# => Test Suites: 1 failed, 499 passed, 500 total
# => Tests:       1 failed, 4394 passed, 4395 total
# => FAIL src/realia/ui/RealiaDisplay.redirectFetching.test.tsx
#    ● requests the entry only once across the canonicalising redirect
#      Expected number of calls: 2 / Received number of calls: 1

# passes in isolation, three times out of three:
CI=true npx craco test --runInBand --watch=false --no-coverage src/realia/ui/RealiaDisplay.redirectFetching.test.tsx

# passes with its whole directory, in band, with the CI flags:
CI=true npx craco test --runInBand --watch=false --no-coverage --detectOpenHandles --forceExit src/realia
```

**F2 — the duplicated test file**

```bash
diff <(sed -n '11,65p' src/fragmentarium/infrastructure/FragmentRepository.script.test.ts) <(sed -n '5,59p' src/fragmentarium/infrastructure/createScript.test.ts)
# => no output apart from the import block

git diff --stat origin/master...HEAD -- src/fragmentarium/infrastructure/FragmentRepository.script.test.ts
# => empty: the original file is untouched, so this is a copy, not a move

git log --oneline --diff-filter=A -- src/fragmentarium/infrastructure/createScript.test.ts
# => 1b0fe6b2 refactor: split the remaining PR #774 files and close the coverage gaps
```

**F3 — the tracked task docs**

```bash
comm -13 <(git ls-tree -r --name-only origin/master | grep '\.md$' | sort) <(git ls-tree -r --name-only HEAD | grep '\.md$' | sort)
# => the eight TASK-*.md files

git log --oneline --diff-filter=A -- TASK-774-log.md
# => 7c9b1d01 docs: add task tracking docs for PR #774 and the TS7 migration
```

**F9 — the CodeQL diff limit**

```bash
curl -sS -H "Authorization: Bearer $GITHUB_TOKEN" \
  https://api.github.com/repos/ElectronicBabylonianLiterature/ebl-frontend/check-runs/104883395679/annotations
# => "Cannot retrieve the full diff because there are too many (300) changed files in the pull request."
```

**Sass verification (for reproduction of the positive result)**

```bash
git worktree add --detach /tmp/base-wt origin/chore/ts7-tsconfig-migration
for f in $(find src -name '*.sass' ! -name '_*'); do
  node_modules/.bin/sass --quiet --no-source-map --load-path=. "$f" /tmp/head.css
  node_modules/.bin/sass --quiet --no-source-map --load-path=/tmp/base-wt "/tmp/base-wt/$f" /tmp/base.css
  cmp -s /tmp/head.css /tmp/base.css || echo "DIFF $f"
done
# => 53 identical; the 6 that differ were separately changed by master and are identical against the merged-master baseline
```

## Comment and review status

**Timeline review events — 3 total**

| Reviewer    | State             | Date       | Commit     | Status                                                            |
| ----------- | ----------------- | ---------- | ---------- | ----------------------------------------------------------------- |
| qltysh[bot] | COMMENTED         | 2026-07-21 | `7ba6f490` | Superseded — its inline threads are resolved and outdated         |
| qltysh[bot] | COMMENTED         | 2026-07-23 | `01e61b13` | Superseded — its inline threads are resolved and outdated         |
| Fabdulla1   | CHANGES_REQUESTED | 2026-08-04 | `5ef4a984` | **UNRESOLVED** — substance fixed, review still formally open (F4) |

**Inline review threads — 6 total, all resolved**

| #          | File                                         | Comment                          | Resolved | Outdated |
| ---------- | -------------------------------------------- | -------------------------------- | -------- | -------- |
| 3623999642 | `src/corpus/application/TextService.ts`      | similar-code, 17 lines, mass 79  | Yes      | Yes      |
| 3623999655 | `src/corpus/application/TextService.ts`      | similar-code, 17 lines, mass 79  | Yes      | Yes      |
| 3638370985 | `src/common/hooks/usePromiseEffect.test.tsx` | similar-code, 18 lines, mass 120 | Yes      | Yes      |
| 3638370997 | `src/common/hooks/usePromiseEffect.test.tsx` | similar-code, 18 lines, mass 120 | Yes      | Yes      |
| 3638371006 | `src/corpus/application/TextService.ts`      | similar-code, 15 lines, mass 66  | Yes      | Yes      |
| 3638371019 | `src/corpus/application/TextService.ts`      | similar-code, 15 lines, mass 66  | Yes      | Yes      |

All six were resolved by qltysh[bot] itself and are collapsed and outdated against the current head. `TextService.ts` is now 70 lines, so the duplication they reported is genuinely gone.

**General / issue comments — 0.** There is no sourcery-ai review, and no automated review bot other than qlty has commented on this PR.

**Checks on head `eac106a4`**

| Check                                               | Conclusion                     | Note                                                                                                                                                                                                                                                    |
| --------------------------------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| CodeQL                                              | success                        | "No new alerts in code changed by this pull request" — but see F9                                                                                                                                                                                       |
| Analyze (javascript)                                | success                        | 3 annotations: the diff limit (F9) plus two GitHub deprecation notices                                                                                                                                                                                  |
| test                                                | success                        | Contrast with the local failure in F1 — the flake is intermittent                                                                                                                                                                                       |
| GitGuardian scan (x2) + GitGuardian Security Checks | success                        |                                                                                                                                                                                                                                                         |
| docker, docker-test                                 | skipped                        | By design, push-to-master only — see W1                                                                                                                                                                                                                 |
| qlty check                                          | success, **3 blocking issues** | Reported as non-failing. Locally reproducible among this PR's files: the 55-line identical block of F2 (reported at both locations) and `useFragmentAnnotationState` complexity 25. The qlty PR issue page needs an account to confirm the exact three. |

## Recommendation

**Request changes — but most of it is now done.** The design was right, the earlier review was genuinely addressed, and both large claims I checked independently held. Fourteen of the eighteen findings are resolved — thirteen in the working tree (nothing committed) and F5 on the PR description itself.

What remains is not code:

1. **F3** — delete the eight tracked `TASK-*.md` files (excluded from this round by instruction).
2. **F4** — dismiss or re-request Fabdulla1's review; the substance behind it is fixed.
3. **F9 / F14** — merge master into the base branch (or land #773 first) and pick up the three outstanding master commits. This single step also restores CodeQL's differential analysis and shrinks the diff from 696 files to what this PR owns.

Read W1 before merging. No dev container file is touched, but the Docker changes shown in the diff are never exercised by PR CI.

## What Has To Be Done

### Still open — yours

1. **[BLOCKER]** Delete all eight tracked `TASK-*.md` files (the five `TASK-774-*` and the three `TASK-ts7-migration-*`, this review file included) and, if the workflow needs them locally, add a `TASK-*.md` rule to `.gitignore` in the same commit. (F3 — excluded from this round by instruction)
2. **[BLOCKER]** Dismiss or re-request Fabdulla1's CHANGES_REQUESTED review. Every point behind it is fixed and verified; the review is simply still formally open. (F4)
3. **[Required]** Merge `chore/ts7-tsconfig-migration` up to master, or land #773 first, so the diff drops from 696 files to what this PR owns and CodeQL can perform its differential analysis. (F9)
4. **[Required]** Merge the three outstanding master commits (`e281f7ba`, `af0b7942`, `51bfc9ff`) into the branch. (F14)
5. **[Before merge]** Read W1. Optionally run `docker build .` locally, since `docker` and `docker-test` are skipped on pull requests and the pinned base-image digest and `apk` version bumps are first validated only on master.
6. **[Before merge]** Re-check the qlty blocking issues once this lands — the identical-code pair behind two of them is gone, and `useFragmentAnnotationState`'s complexity is now fully covered by tests.

### Done in the working tree — uncommitted

7. **[F1]** `RealiaDisplay.redirectFetching.test.tsx` now waits for the redirect to _land_ and then asserts the call sequence, instead of polling a call counter on `waitFor`'s bare 1000 ms default. The shared route helpers were extracted into `RealiaDisplay.testSupport.tsx` and both redirect suites use them.
8. **[F2]** `createScript.test.ts` deleted; `FragmentRepository.script.test.ts` keeps all five cases and stays byte-identical to master.
9. **[F6, F7]** `useAnnotationKeyboardShortcuts.ts`, `useFragmentAnnotationState.ts`, `TransliterationForm.tsx`, `beforeUnloadWarning.ts`, `WordEditor.tsx` and `ChapterEditView.tsx` brought to 100/100/100/100; `fullyCoveredPaths` extended from 35 to 48 entries.
10. **[F8]** The qlty coverage condition now carries the reason it exists and where to check coverage for a stacked PR instead.
11. **[F10, F11, F12]** The bluebird guard catches subpath imports, `require.resolve` and `package.json`; the install retry loop can now fail the step; fail-fast restored across the job.
12. **[F13]** The `isCancellation` trade-off is documented in `README.md`. Narrowing it was considered and rejected — the `signal.aborted` clause is what suppresses late results from getters that do not thread the signal, and removing it would make `usePromiseEffect.run` reject at unmount.
13. **[F15]** `caniuse-lite` refreshed — "No target browser changes", lockfile only.
14. **[F16]** Type annotations added in `DateSelectionState.ts` and `useFragmentAnnotationState.ts`, parameter shadowing removed, and a redundant `onClick` branch dropped.
15. **[Pre-existing]** `useAnnotationKeyboardShortcuts`'s effect cleanup called `document.addEventListener('keyup', ...)` where it meant `removeEventListener`, leaking a listener on every re-run. Present on master since before the split. Fixed.
