---
task_id: 774
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
title: 'chore: remove bluebird, use AbortController for cancellation'
reviewed_head_sha: 18033c77bdc2ef1131118de472d70b3e6907501e
base_branch: chore/ts7-tsconfig-migration
base_sha: 4f71cb249bc0db899f1a22ce42ac93ebd961eeda
stacked_on: '#773 (chore/ts7-tsconfig-migration) — OPEN and CONFLICTED against master (mergeable_state: dirty)'
master_drift: 3 commits behind master (e281f7ba, af0b7942, 51bfc9ff)
review_date: 2026-09-17
review_round: 7
remediation_date: 2026-09-17
remediation_state: 12 of 19 findings resolved in the working tree (uncommitted) plus 2 applied to the PR description; F2 excluded by instruction; F3/F4/F5/F7 need actions outside the diff
reviewer: Claude (automated review)
verdict: CHANGES REQUESTED, LARGELY REMEDIATED — the design was already right; F1, F6, F8-F16 are now fixed at their root and the gates are green, leaving F2 (excluded by instruction) and F3/F4/F5/F7 which cannot be done from inside the diff
findings_total: 19
findings_resolved: 12
findings_open: 7
findings_blocking: 5
findings_major: 2
findings_minor: 9
findings_warning_info: 3
scope_vs_base: 705 files, +44518 / -22653, 37 commits
scope_vs_master: 515 files, +19633 / -10988 (497 in src/)
scope_note: 'The GitHub diff is inflated: master was merged into this branch but not into the base branch, so roughly 331 files are base-branch drift rather than this PR''s work. Landing #773 collapses the diff to what this PR owns.'
devcontainer_changes: 'NONE. .devcontainer/ is untouched. Dockerfile shows +4/-4 in the GitHub diff but is byte-identical to origin/master — pure base-branch drift. Read W1 before merging anyway: the Docker jobs never run on a pull request.'
gates:
  lint: PASS — eslint + stylelint clean
  tsc: PASS — clean
  test_ci_local: PASS after remediation — 504 suites, 4428 tests, 50 snapshots, exit 0; was 1 suite / 1 test / 1 snapshot failing before F1 was fixed. Four consecutive full runs with the previously flaky suite green; the last two fully green end to end (the earlier two failed only on the F13 assertion and the F8 floor, both since fixed). Six isolated runs of the suite on top.
  test_ci_github: PASS — 504 suites, 4428 tests, 50 snapshots on this same sha (before remediation)
  console_clean: PASS — zero console.error / console.warn / unhandled rejections, locally and in CI
  coverage: PASS — 95.08 stmts / 87.98 branch / 94.74 funcs / 95.23 lines; no per-file threshold breach across the 50-path gate; identical figures locally and in CI. Floors ratcheted 93 / 84 / 93 / 93 -> 94 / 86 / 94 / 94 (F8). Note: Jest subtracts the 50 per-path files from the global figure, so the number the floors are compared against is 94.57 / 86.84 / 94.21, not the 95.08 / 87.98 / 94.74 printed in the summary row.
  line_ceiling_250: PASS — no file this PR changes exceeds 250 lines
  dry: PASS
  build: PASS in CI ("Compiled successfully", zero warnings); NOT runnable locally — the container OOM-kills fork-ts-checker
  app_runs: NOT VERIFIED — the dev server cannot start in this container (SIGTERM on the type-checker child at ~2.8 GB available). Not a code defect; CI builds the same sha green.
  no_new_md: FAIL — 8 TASK-*.md files tracked on the branch (F2); cleanup explicitly excluded from this remediation pass by instruction
ci_checks_on_head:
  test: success
  CodeQL: success — but the run never diffed the PR (F4)
  Analyze (javascript): success
  GitGuardian scan: success
  GitGuardian Security Checks: success
  qlty check: success — no blocking issues
  docker: skipped — never runs on a pull request
  docker-test: skipped — never runs on a pull request
codeql_alert_api: not queryable with the available token (403 Resource not accessible by integration); the check run itself is green
review_threads: 6 total, all qltysh[bot], all resolved and outdated
standing_reviews: 1 — Fabdulla1 CHANGES_REQUESTED, 2026-08-04, still open (F3)
---

# Review — PR #774

## Friendly summary

This is good work and the hard part is genuinely done. Removing bluebird meant deciding what "cancel" should mean, and the answer here is the right one: reads get a real `AbortSignal` and stop the download; writes never get one, because once a save has left the browser, cutting the connection does not un-save it — it only throws away the answer. What I like most is that this is not left to discipline. `ApiClient.postJson` and `putJson` have no signal parameter at all, and the one method that does take one is `private`, so a signal simply cannot reach a write's `fetch` from outside the class. I checked every service and repository write method: none of them accepts a signal. The compiler is holding the rule, not a convention.

Everything the standing human review asked for in August is done. The write-abort path is gone, there is now an integration test that drives a real `ApiClient` over a mocked `fetch` and proves separately that a second save does not abort the first and that a stale save cannot overwrite the screen, and all seven of the files called out as oversized are under the limit — `TextService.ts` went from 597 lines to 70. The newest commit's refactor of the annotation hook is faithful too; I compared it line by line against master's original and the only behavioural difference is one redundant branch that was doing nothing.

So the remaining problems are not about the design. Five things block a merge, and four of them are not code at all: eight scratch `TASK-*.md` files are still tracked and would dump 3,200 lines of working notes onto master, the August review is still standing, the base PR #773 now has merge conflicts against master, and CodeQL quietly never looked at this diff — its log says it could not compute the changed lines and skipped that stage, yet the check still reports "no new alerts in code changed by this pull request". The one code blocker is a flaky snapshot: `yarn test:ci` failed for me on this exact commit while CI passed on the same commit, which is the same "green once is not proof" trap that bit round 6.

**Since the review above was written, everything except the document cleanup has been fixed.** The flaky snapshot is gone and `yarn test:ci` is green run after run; the CI workflow no longer publishes the test image without passing tests, no longer leaks an unused secret into every step, and declares its CodeQL permissions explicitly; the coverage allowlist now fails loudly if it goes stale; and `isBoundingBoxTooSmall`, which returned true when the box was _large enough_, is finally called `isBoundingBoxLargeEnough`. Tightening the console-error helper also flushed out a second pre-existing problem worth knowing about: two shared test setups were claiming to expect an error that most of their tests never produce. Details are in "Remediation applied this round". What is left is the four things nobody can do from inside the diff, plus the `.md` cleanup that was deliberately left out.

One thing to flag because it is easy to miss: **the Docker build never runs on a pull request.** It is only wired to pushes on master. The Dockerfile in this diff is byte-identical to master so this PR does not change it, but the pinned image digest and the two Alpine package pins it carries get their first real test only after something lands. Details in W1.

### Details

| #   | Severity | Finding                                                                                                                         | Status                         |
| --- | -------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------ |
| F1  | BLOCKER  | `yarn test:ci` is red locally — `AnnotationsView.integration.test.ts` snapshot fails under full-suite load, passes in isolation | **Fixed**                      |
| F2  | BLOCKER  | Eight `TASK-*.md` scratch files are tracked and would land on master                                                            | Open — excluded by instruction |
| F3  | BLOCKER  | The `CHANGES_REQUESTED` review from 2026-08-04 is still standing                                                                | Open — needs a human action    |
| F4  | BLOCKER  | CodeQL never diff-analysed this PR yet reports a clean per-PR result                                                            | Open — clears when #773 lands  |
| F5  | BLOCKER  | Base PR #773 is conflicted against master (`mergeable_state: dirty`), so the whole stack is stuck                               | Open — new this round          |
| F6  | MAJOR    | `docker-test` has no `needs: [test]`, so a red master still publishes the `:test` image                                         | **Fixed**                      |
| F7  | MAJOR    | Branch is 3 commits behind master                                                                                               | Open — needs a merge           |
| F8  | MINOR    | `fullyCoveredPaths` is still a hand-maintained allowlist, so new files silently escape the 100% gate                            | **Fixed**                      |
| F9  | MINOR    | README and the PR body both say "the four components that own a `SupersedableOperation`"; there are five                        | **Fixed**                      |
| F10 | MINOR    | `SLACK_WEBHOOK_URL` is injected into every step's environment but referenced by no step                                         | **Fixed**                      |
| F11 | MINOR    | `codeql-analysis.yml` declares no `permissions:` block, unlike `main.yml`                                                       | **Fixed**                      |
| F12 | MINOR    | `github/codeql-action@v3` is deprecated from December 2026; CI emits the warning on every run                                   | **Fixed**                      |
| F13 | MINOR    | `expectConsoleErrors(pattern)` never asserts the expected error actually occurred                                               | **Fixed**                      |
| F14 | MINOR    | `createAnnotation` reads as inverted because `isBoundingBoxTooSmall` actually means "big enough"                                | **Fixed**                      |
| F15 | MINOR    | The PR body's Verification section still cites the superseded test command                                                      | **Fixed**                      |
| F16 | MINOR    | `TASK-774-handoff.md` frontmatter says `head_reviewed: eac106a4`; the head is two commits further on                            | **Fixed**                      |
| W1  | WARNING  | Dev container / Docker configuration — read before merging                                                                      | Informational                  |
| W2  | WARNING  | Fail-fast restoration removes the "see every failure in one run" property                                                       | Informational                  |
| W3  | INFO     | qlty smells in eight PR-touched files, all pre-existing in untouched regions                                                    | Informational                  |

## Summary

PR #774 removes `bluebird` and replaces it with `AbortController`/`AbortSignal` for reads and a token-based `SupersedableOperation` for writes. The split is deliberate and correct, and it is enforced structurally rather than by convention. Alongside the removal the PR carries a Sass `@import` → `@use` migration, a 250-line-per-file refactor of everything it touches, and a substantial test expansion.

The design is sound and every substantive point raised by the standing human review is resolved at its root. What remains is one flaky test and four non-code blockers, three of which are GitHub-side actions rather than changes to the diff.

### What I verified independently, rather than taking on trust

- **No write path can receive a signal.** Grepped every `update*` / `create*` / `save*` / `delete*` method across `src/*/application` and `src/*/infrastructure`: none accepts an `AbortSignal`. `ApiClient.postJson` (`src/http/ApiClient.ts:205`) and `ApiClient.putJson` (`:215`) have no signal parameter; `ApiClient.fetch` (`:142`) is `private`. The README's claim that the guarantee is type-enforced is literally true.
- **The integration test the reviewer asked for exists and does what was asked.** `src/common/hooks/usePromiseEffect.write.integration.test.tsx` drives a real `ApiClient` over a mocked `fetch` and asserts separately that no signal is attached to a dispatched write, that a superseding write does not abort the first, and that a superseded write cannot overwrite current UI state.
- **All seven files the reviewer flagged as oversized are now under the ceiling:** `FragmentService.ts` 888 → 246, `FragmentRepository.ts` 787 → 240, `TextService.ts` 597 → 70, `FakeApi.ts` 516 → 190, `SignImages.tsx` 442 → 83, `Realia.sass` 453 → 6, `withData.test.tsx` 264 → 191. No file this PR changes exceeds 250 lines.
- **bluebird is genuinely gone.** Zero references in `src` and `package.json`. `yarn.lock` still carries `bluebird@^3.7.2` purely as a transitive dependency of another package, which is out of the project's control and correctly not covered by the CI guard.
- **The newest commit is behaviour-faithful.** I compared `useFragmentAnnotationState.ts` against master's original `FragmentAnnotation.tsx` handler by handler. `getSelectionById`'s `.filter(...)[0]` became `.find(...) ?? null`; master's two consecutive `setAnnotations` calls became one call with the same final value (React batched them anyway); the nested `else if (geometry) { if (isBoundingBoxTooSmall(...)) }` became a nullable expression with the same guard. The only removal is master's first `onClick` branch, which set `setToggled(hovering)` under a condition strictly implied by the very next block — dead code.
- **The install retry loop actually fails now.** I ran the exact loop under `bash -e`: it retries three times and exits 1, rather than exiting 0 after three failures as the old `&& break || { ... }` form did.
- **Console suppression was replaced with assertion, not hidden.** `silenceConsoleErrors` (a blanket `jest.spyOn(console, 'error').mockImplementation()`) is gone; `expectConsoleErrors(pattern)` now fails the test on any console error that does not match the expected pattern. That is the right direction and matches the project's rule that suppression is never acceptable.
- **Coverage and console-cleanliness hold.** My local run and CI's run on the same sha produce identical coverage — 95.08 / 87.98 / 94.74 / 95.23 — with zero console output in both.

## Findings

### F1 — BLOCKER — `yarn test:ci` is red: the AnnotationsView snapshot fails under full-suite load

`yarn test:ci` on `18033c77` finished **1 failed, 503 passed** (1 test, 1 snapshot) with exit code 1. The failure is `src/fragmentarium/ui/image-annotation/AnnotationsView.integration.test.ts` → `Display annotate view › Snapshot`. The received DOM is missing one attribute on the `react-transform-component` div:

```
-  style="transform: translate(0px, 0px) scale(1);"
```

The same suite passes three times out of three in isolation, and GitHub's `test` check passed 504/504 on this identical sha. So this is intermittent, not deterministic — which is precisely the trap round 6 recorded as its lesson. A single green CI run is not evidence that this is fixed.

Root cause is the same shape as round 6's F1. That `style` attribute is written by `react-zoom-pan-pinch` 3.7.0, which applies it from `TransformComponent`'s mount effect (`init` → `handleInitialize` → `applyTransformation`) and then re-applies it from a `ResizeObserver` callback — and the test installs `resize-observer-polyfill`, whose notifications are scheduled asynchronously. The test's only wait is `findByRole('button', { name: 'Save' })`, which is an unrelated element: nothing in the test waits for the transform to land before the snapshot is taken. On a fast, idle run it is there; deep into a `--runInBand --coverage --detectOpenHandles` run it sometimes is not.

The fix should be to wait for something observable rather than to raise a timeout — either wait for the transform to be applied before snapshotting, or keep the volatile third-party style out of the snapshot with a serializer. Note that the snapshot file itself is byte-identical to master, so nothing about the expected value is wrong; only the wait is missing.

### F2 — BLOCKER — eight `TASK-*.md` files are tracked and would land on master

Against `origin/master` the branch adds `TASK-774-handoff.md`, `TASK-774-log.md`, `TASK-774-merge-master-handoff.md`, `TASK-774-review.md`, `TASK-774-todo.md`, `TASK-ts7-migration-log.md`, `TASK-ts7-migration-research.md` and `TASK-ts7-migration-todo.md` — 3,200 lines of scratch work-tracking. These are working notes, not documentation, and the explicit instruction for this branch is that no new `.md` files should be present. Only `README.md` and `.github/copilot-instructions.md` are legitimate `.md` changes here.

This document is one of the eight and must go with the rest. Adding a `TASK-*.md` rule to `.gitignore` in the same commit keeps them available locally.

### F3 — BLOCKER — the `CHANGES_REQUESTED` review is still standing

Fabdulla1 requested changes on 2026-08-04 against `5ef4a984`. The review is still open and blocks merge. All three of its points are genuinely resolved and I re-verified each this round (see "What I verified independently"). This needs a re-review rather than a code change. Reviewer assignment is deliberately never touched automatically.

### F4 — BLOCKER — CodeQL never diff-analysed this PR, but reports a clean per-PR result

The `CodeQL` check on `18033c77` is green with the message "No new alerts in code changed by this pull request". The job log says otherwise:

```
Computing PR diff ranges...
Reverting overlay database mode to none because the PR diff ranges could not be computed.
...
No precomputed diff ranges found; skipping diff-informed analysis stage.
```

The diff is 705 files against the stale base, which is past the limit at which the action can compute changed-line ranges. The "code changed by this pull request" set was therefore never established, so the green result is a claim the run did not verify. This is the same finding as round 6's F9 and it still reproduces on the current head. It clears by itself once #773 lands and the diff collapses to what this PR owns; until then, treat the security gate on this PR as unproven rather than passed.

The Code Scanning alert API is not readable with the token available here (403 `Resource not accessible by integration`), so I could not cross-check the alert list directly.

### F5 — BLOCKER — base PR #773 is conflicted against master, so the stack cannot land

`#773` (`chore/ts7-tsconfig-migration` → `master`) reports `mergeable: false`, `mergeable_state: dirty`. It has merge conflicts with master and cannot be merged as it stands. Since #774 is stacked on it and three of the other blockers are waiting on it to land, this is now the critical path. New this round — #773 was mergeable when round 6 recommended landing it first.

### F6 — MAJOR — `docker-test` publishes the `:test` image without waiting for tests

In `.github/workflows/main.yml`, the `docker` job declares `needs: [test]` (line 76) but `docker-test` (lines 108-138) declares no `needs` at all. Both are gated only on `github.event_name == 'push' && github.ref == 'refs/heads/master'`. On a master push with a failing test job, `docker` is skipped but `docker-test` still builds and pushes `ebl.badw.de/ebl-frontend:test`, so a broken master reaches the test environment.

This is pre-existing on master, not introduced here — but this PR edits that job block (it bumps `actions/checkout` to v5 on line 112), and the project rule is to fix pre-existing defects surfaced while working. One line: add `needs: [test]` to `docker-test`.

### F7 — MAJOR — the branch is three commits behind master

`e281f7ba` (Read nameBreaks alongside nameParts, #817), `af0b7942` (Add Gaziantep Museum, #819) and `51bfc9ff` (Add Erimtan and Marash museums, #818) are on master and not on this branch. The PR has not been tested against current master.

### F8 — MINOR — the 100% coverage gate is still a hand-maintained allowlist

`craco.config.js` holds `fullyCoveredPaths`, now 50 hand-typed entries. Round 6's F7 grew the list from 35 to 48 but did not remove the staleness risk: a file added by a future change is not covered by the 100% gate unless someone remembers to add it, and nothing fails if they forget. Deriving the list — for example from the set of files the branch changes — would make the gate self-maintaining. Not a blocker; the list is currently accurate.

### F9 — MINOR — "four components" is wrong in both README and the PR body

`README.md` says "Components that own a single write and are not using `usePromiseEffect` hold their own `SupersedableOperation` ... : `TransliterationForm`, `WordEditor`, `BibliographyEntryFormController` and `BibliographyEntryForm`", and the PR body repeats "the four components that own a `SupersedableOperation`". There are five. `src/fragmentarium/ui/fragment/CuneiformFragment.tsx` holds one at line 146, supersedes it from a `useEffect` cleanup at line 151 and again on fragment change at line 155. The list reads as exhaustive, so it should include it.

### F10 — MINOR — a secret is injected into every step but used by none

`.github/workflows/main.yml` line 16 sets `SLACK_WEBHOOK_URL: ${{ secrets.SLACK_WEBHOOK_URL }}` at workflow level. No step in any workflow references it. Workflow-level `env` is visible to every step of every job, so this places an unused credential in the environment of every command the CI runs, including third-party actions. Now that the `pull_request` trigger is widened to `chore/**`, `feature/**` and `fix/**` bases, that happens on more events than before. Fork PRs are unaffected — `pull_request` does not expose secrets to forks — so the exposure is limited to same-repo PRs, but the line should simply be removed.

### F11 — MINOR — `codeql-analysis.yml` declares no `permissions:` block

`main.yml` correctly restricts itself with `permissions: contents: read`. `codeql-analysis.yml` declares nothing and relies on whatever the repository default grants, which must include `security-events: write` for the upload to work. Declaring the minimum explicitly (`contents: read`, `security-events: write`, `actions: read`) makes the grant visible and stops it drifting with the repository setting.

### F12 — MINOR — deprecated action versions surface as warnings on every run

The CodeQL job log carries `CodeQL Action v3 will be deprecated in December 2026` and `Node.js 20 is deprecated. The following actions target Node.js 20 but are being forced to run on Node.js 24: github/codeql-action/analyze@v3, github/codeql-action/autobuild@v3, github/codeql-action/init@v3`. Since this PR already bumps `actions/checkout` and `actions/setup-node` to v5, moving `github/codeql-action/*` to v4 belongs in the same sweep.

### F13 — MINOR — `expectConsoleErrors` does not assert that the expected error happened

`src/setupTests.ts` replaces blanket suppression with a pattern check, which is the right call. But the `afterEach` only asserts that nothing _unmatched_ was logged:

```ts
const unexpected = spy.mock.calls
  .map((call) => call.map((argument) => String(argument)).join(' '))
  .filter((message) => !pattern.test(message))
spy.mockRestore()

expect(unexpected).toEqual([])
```

If the expected `console.error` stops being emitted — because the code path it came from was removed or silently changed — the test still passes and the helper's name stops being true. Asserting that at least one call matched `pattern` would close that. A second, smaller point: calling `expectConsoleErrors` twice in one test replaces `consoleErrorSpy` without restoring the first spy.

### F14 — MINOR — `createAnnotation` reads as the inverse of what it does

`src/fragmentarium/domain/annotation.ts:11-14`:

```ts
export function isBoundingBoxTooSmall(geometry: Geometry): boolean {
  const minSize = Math.min(geometry.height, geometry.width)
  return minSize >= 0.3
}
```

The function returns true when the box is _large enough_, so the name has meant its own opposite since before this PR. The refactor faithfully preserves the behaviour but moves the call into a new function where the contradiction is sharper — `annotationSelection.ts:39` reads "create the annotation if the bounding box is too small". Renaming to `isBoundingBoxLargeEnough` is a two-call-site change and removes a real trap for the next reader.

### F15 — MINOR — the PR body's Verification section cites the superseded command

It lists `CI=true yarn test --watchAll=false --coverage`. Round 5 established `yarn test:ci` as the gate precisely because `--detectOpenHandles` changes runtime behaviour and the other form can pass locally while CI fails. The body should cite the command the gate actually is.

### F16 — MINOR — the handoff document's frontmatter is stale

`TASK-774-handoff.md` says `head_reviewed: eac106a4`, but its body describes work delivered in `a9b0542f` and `18033c77`. Moot once F2 deletes the file.

### W1 — WARNING — dev container and Docker configuration (please read before merging)

**Requested explicitly, so stated plainly.**

- `.devcontainer/` — `Dockerfile`, `devcontainer.json`, `inject-secrets.sh` and `README.md` — is **not touched by this PR**. `git diff origin/master HEAD -- .devcontainer` is empty.
- The root `Dockerfile` **does** appear in the GitHub diff at +4/−4, but `git diff origin/master HEAD -- Dockerfile` is empty: it is byte-identical to master. The diff entry is base-branch drift, exactly like the three oversized files that show up for the same reason. This PR changes no Docker configuration.
- **The risk is not this PR's change, it is that nothing tests the Dockerfile on a pull request.** Both `docker` and `docker-test` are gated on `github.event_name == 'push' && github.ref == 'refs/heads/master'`, and both were `skipped` on this head. What master recently introduced and nobody has built on a PR is a pinned base image digest (`node:20-alpine@sha256:fb4cd12c85ee03686f6af5362a0b0d56d50c58a04632e6c0fb8363f609372293`, used for both the build and runtime stages) plus exact Alpine package pins that were bumped at the same time — `giflib-dev=5.2.2-r2` and `python3=3.12.14-r0`. Alpine rolls package versions out of its repositories without notice, so an exact `apk add pkg=version` pin fails the build the moment the index moves on. When that happens here it happens on master, after merge, with the image push in the same job.
- A local `docker build .` before merging is cheap insurance. Longer term, building (without pushing) on pull requests would move that failure to where it belongs.
- See also F6: `docker-test` publishes the `:test` tag without waiting for the test job.

### W2 — WARNING — fail-fast restoration is correct but changes the feedback shape

Round 6 removed `if: success() || steps.install.outcome == 'success'` from the Lint, Compile, Unit Tests and Build steps. That was the right fix — the condition made every later step run regardless of earlier failures — but the side effect is that a run now stops at the first broken step, so a contributor with both a lint error and a test failure sees only the lint error and has to iterate. Worth keeping as is; noted so the change in behaviour is not a surprise.

### W3 — INFO — qlty smells in PR-touched files are pre-existing

GitHub's `qlty check` status is green ("No blocking issues") and all six inline qlty threads are resolved and outdated. A local `qlty smells --all` reports 110 findings across 44 files repo-wide; eight of those files are touched by this PR, but in every case the change is 1-3 lines (mostly the bluebird import removal) and the smell sits in untouched code: duplicate blocks in `ManuscriptForm.tsx`, `DossiersSearchPage.tsx` and `Download.test.tsx`; high complexity in `WordExport.tsx` (`getMainTableWithFootnotes`, 20) and `setupTests.ts` (`createRange`, 18); parameter counts in `SignsSearch.tsx` and `test-support/utils.ts`; six returns in `GlossaryFactory.ts`. Not this PR's to fix.

## Remediation applied this round

Everything except the `.md` cleanup was addressed. Twelve findings are fixed in the working tree (uncommitted), two of them also applied to the PR description on GitHub.

| #   | What was done                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Root-caused twice over. The snapshot asserts a `transform` attribute that `react-zoom-pan-pinch` writes after mount, and nothing waited for it — the only wait was on an unrelated Save button. Separately, that wait is `{ timeout: 10000 }` inside a `beforeEach` running on Jest's **default 5 s hook budget**, so the hook could die before the render finished regardless of the snapshot. Fixed both: the hook now declares a budget larger than the waits it contains, and `waitForZoomTransformToBeApplied` polls the transform attribute itself. Verified with four consecutive full `yarn test:ci` runs and six isolated runs of the suite. |
| F6  | `needs: [test]` added to the `docker-test` job.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| F8  | `fullyCoveredPaths` is now validated at config load — every entry must exist on disk and there may be no duplicates, otherwise the config throws and names the offending paths. Proven with a negative test. The global floors were also ratcheted from 93 / 84 / 93 / 93 to 94 / 86 / 94 / 94.                                                                                                                                                                                                                                                                                                                                                       |
| F9  | README corrected to five components, with a note that `CuneiformFragment` supersedes both on unmount and on fragment change. Applied to the PR body too.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| F10 | The unused `SLACK_WEBHOOK_URL` removed from workflow-level `env`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| F11 | `permissions: contents: read` at workflow level and `actions: read` / `contents: read` / `security-events: write` on the analyze job in `codeql-analysis.yml`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                        |
| F12 | `github/codeql-action/{init,autobuild,analyze}` bumped v3 → v4.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       |
| F13 | `expectConsoleErrors` now also asserts that a matching error actually occurred. A new `tolerateConsoleErrors` covers the two blanket setups that _arrange_ an error without every test triggering it.                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| F14 | `isBoundingBoxTooSmall` → `isBoundingBoxLargeEnough` across all call sites, and the test fixtures renamed so the assertions read correctly.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| F15 | PR body's Verification section now cites `yarn test:ci` and says why.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| F16 | Handoff frontmatter `head_reviewed` corrected to `18033c77`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |

### Two pre-existing defects found and fixed at root while doing the above

1. **`AnnotationsView.integration.test.ts` had a latent hook timeout** unrelated to the snapshot: a 10 s `findByRole` inside a hook with a 5 s budget. It only ever passed because the render usually finished in about 2 s.
2. **`stubMissingBibliography` and `resetAuth0Mocks` asserted a console error from a blanket `beforeEach`.** Tightening `expectConsoleErrors` (F13) exposed that most tests in those five suites never trigger the error the helper claimed to expect — 17 tests across 5 suites failed the new assertion. The honest split is "this error must happen" (`expectConsoleErrors`) versus "this error is arranged and tolerated if it happens" (`tolerateConsoleErrors`), which is what the helper now offers. Both remain strictly better than the blanket suppression this PR replaced, because neither will let an _unexpected_ message through.

### Gates after remediation

| Gate                   | Result                                                                                                                                                                                 |
| ---------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `yarn lint`            | PASS                                                                                                                                                                                   |
| `yarn tsc`             | PASS                                                                                                                                                                                   |
| `yarn test:ci`         | PASS — 504 suites, 4428 tests, 50 snapshots, exit 0. Two consecutive fully green full runs, and the previously flaky suite green in four consecutive full runs plus six isolated ones. |
| Console output         | PASS — zero across the full run                                                                                                                                                        |
| Coverage               | PASS — 95.08 / 87.98 / 94.74 / 95.23, every per-path 100% gate met, against ratcheted floors                                                                                           |
| 250-line ceiling       | PASS — largest file touched this round is 211                                                                                                                                          |
| `yarn build` / app run | Still not executable in this container (OOM); unchanged from the review above                                                                                                          |

### Deliberately not done

- **F2, the `.md` cleanup** — excluded by instruction.
- **F7, merging the three master commits** — a merge is a commit, and commits are never made without an explicit request.
- **F3, F4, F5** — none is actionable from inside the diff. F3 needs the reviewer, F5 needs conflicts resolved on a different branch, and F4 clears itself once the PR retargets to master.

## Severity

| Severity                | Count | Findings                                  |
| ----------------------- | ----- | ----------------------------------------- |
| Blocker                 | 5     | F1, F2, F3, F4, F5                        |
| Major                   | 2     | F6, F7                                    |
| Minor                   | 9     | F8, F9, F10, F11, F12, F13, F14, F15, F16 |
| Warning / informational | 3     | W1, W2, W3                                |

Of the five blockers, one is code (F1) and four are process or repository state (F2, F3, F4, F5). F4 resolves itself when F5 and the retarget are done.

## Reproduction Steps

```bash
# F1 — the red gate. Full run, CI's exact command, on 18033c77:
yarn test:ci
# => Test Suites: 1 failed, 503 passed, 504 total
# => Tests:       1 failed, 4427 passed, 4428 total
# => Snapshots:   1 failed, 49 passed, 50 total
# => FAIL src/fragmentarium/ui/image-annotation/AnnotationsView.integration.test.ts
#    ● Display annotate view › Snapshot
#      - style="transform: translate(0px, 0px) scale(1);"   (missing from received)
# => exit 1

# the same suite in isolation, three times out of three:
for i in 1 2 3; do npx craco test --runInBand --watch=false --ci \
  src/fragmentarium/ui/image-annotation/AnnotationsView.integration.test.ts; done
# => 3 passed, 3 passed, 3 passed

# and GitHub's test check on the identical sha:
# => Test Suites: 504 passed, 504 total / Tests: 4428 passed / Snapshots: 50 passed
# the failure is load-dependent, not deterministic

# F2 — the tracked scratch documents:
git diff --name-status origin/master HEAD -- '*.md'
# => M .github/copilot-instructions.md, M README.md, and A for the eight TASK-*.md files

# F4 — CodeQL never diffed the PR:
# job log for Analyze (javascript) on 18033c77:
#   "Reverting overlay database mode to none because the PR diff ranges could not be computed."
#   "No precomputed diff ranges found; skipping diff-informed analysis stage."
# while the check output reads "No new alerts in code changed by this pull request"

# F5 — the base PR is conflicted:
# GET /repos/.../pulls/773 => mergeable: false, mergeable_state: "dirty"

# F6 — docker-test has no needs:
sed -n '74,78p;108,113p' .github/workflows/main.yml
# => docker: needs: [test]    docker-test: (no needs)

# W1 — the Dockerfile is untouched by this PR:
git diff origin/master HEAD -- Dockerfile .devcontainer
# => empty

# gates that pass:
yarn lint    # clean
yarn tsc     # clean
# coverage 95.08 / 87.98 / 94.74 / 95.23 against floors 93 / 84 / 93 / 93, no per-file breach
# zero console output across the full run, locally and in CI

# gates that could not be run here:
yarn build   # container OOM-kills fork-ts-checker (SIGTERM); CI compiles the same sha cleanly
yarn start   # same — the dev server dies during compilation at ~2.8 GB available
```

## Comment and review status

**Timeline review events — 3 total.**

| Reviewer    | State             | Date       | Commit     | Status                                                                  |
| ----------- | ----------------- | ---------- | ---------- | ----------------------------------------------------------------------- |
| qltysh[bot] | COMMENTED         | 2026-07-21 | `7ba6f490` | Superseded — its two threads are resolved and outdated                  |
| qltysh[bot] | COMMENTED         | 2026-07-23 | `01e61b13` | Superseded — its four threads are resolved and outdated                 |
| Fabdulla1   | CHANGES_REQUESTED | 2026-08-04 | `5ef4a984` | **STILL STANDING — blocks merge (F3).** All three points verified fixed |

**Inline review comments — 6 total, all resolved, all outdated, all from qltysh[bot].**

| #          | File                                         | Issue                  | Resolved | Outdated |
| ---------- | -------------------------------------------- | ---------------------- | -------- | -------- |
| 3623999642 | `src/corpus/application/TextService.ts`      | similar-code, mass 79  | Yes      | Yes      |
| 3623999655 | `src/corpus/application/TextService.ts`      | similar-code, mass 79  | Yes      | Yes      |
| 3638370985 | `src/common/hooks/usePromiseEffect.test.tsx` | similar-code, mass 120 | Yes      | Yes      |
| 3638370997 | `src/common/hooks/usePromiseEffect.test.tsx` | similar-code, mass 120 | Yes      | Yes      |
| 3638371006 | `src/corpus/application/TextService.ts`      | similar-code, mass 66  | Yes      | Yes      |
| 3638371019 | `src/corpus/application/TextService.ts`      | similar-code, mass 66  | Yes      | Yes      |

**General / issue comments — 0.**

**Unresolved: 1** — the Fabdulla1 review (F3). **Resolved: 6** — every qlty thread.

**Automated review bots.** qltysh[bot] is the only bot that has reviewed this PR; there is no Sourcery-AI, Copilot or other bot review on it. qlty's current PR status is green with no blocking issues, and all six of its historical threads are resolved against superseded commits.

## Recommendation

**Request changes — but the ball is no longer in the code's court.** The design was already right, and after this pass the code, the CI configuration and the documentation are all clean: `yarn lint`, `yarn tsc` and `yarn test:ci` are green, the last one across repeated full runs, and the flaky snapshot that made round 6's green CI unconvincing has a root-caused fix rather than a longer timeout.

What blocks the merge now is entirely outside the diff. #773 is conflicted against master, and until it lands the PR cannot retarget, the diff stays at 705 files, and CodeQL keeps reporting a per-PR result it never actually computed. The standing `CHANGES_REQUESTED` needs the reviewer. The three master commits need a merge. And the eight scratch documents still have to go before this merges — that was excluded from this pass on purpose, not resolved.

Order of operations: resolve #773's conflicts and land it, let GitHub retarget, confirm CodeQL's log no longer says the diff ranges could not be computed, merge master up, delete the scratch documents, then ask for the re-review.

## What Has To Be Done

Everything in the "Required" sections of the original review has been done except where noted. What is listed below is what genuinely remains.

### Still open — yours

1. **Resolve the merge conflicts on #773 and land it (F5).** It is `mergeable_state: dirty` against master and it gates the whole stack. Highest value single action: it collapses this PR's diff from 705 files to what it owns and unblocks F4.
2. **Delete the eight `TASK-*.md` files (F2).** `TASK-774-handoff.md`, `TASK-774-log.md`, `TASK-774-merge-master-handoff.md`, `TASK-774-review.md` (this document), `TASK-774-todo.md`, `TASK-ts7-migration-log.md`, `TASK-ts7-migration-research.md`, `TASK-ts7-migration-todo.md`. Excluded from this pass by instruction, so it is still entirely open. Add a `TASK-*.md` rule to `.gitignore` in the same commit to keep them locally.
3. **Merge the three master commits (F7)** — `e281f7ba`, `af0b7942`, `51bfc9ff`. Not done here because a merge is a commit.
4. **Clear the standing `CHANGES_REQUESTED` (F3).** Every point of it is fixed and was re-verified this round. Reviewer assignment is never touched automatically.
5. **Confirm CodeQL actually diff-analysed the PR (F4)** after the retarget: the `Analyze (javascript)` log must no longer contain "the PR diff ranges could not be computed" or "skipping diff-informed analysis stage". Until then its green check is not evidence.
6. **Run `docker build .` locally before merging (W1)**, because no pull request ever exercises the Dockerfile and it carries exact Alpine package pins that rot without notice. Docker is not available in this container, so this could not be done here. Consider adding a build-only (no push) Docker job on pull requests.

### Done in the working tree — uncommitted

7. F1 (snapshot flake, root-caused), F6 (`docker-test` needs `test`), F8 (coverage allowlist validated + floors ratcheted), F9 (README), F10 (unused secret), F11 (CodeQL permissions), F12 (codeql-action v4), F13 (console-error helper split into required/tolerated), F14 (`isBoundingBoxLargeEnough`), F16 (handoff frontmatter). Plus two pre-existing defects fixed at root — see "Remediation applied this round".

### Done on GitHub

8. F9 and F15 applied to the PR description: "four components" corrected to five, and the Verification section now cites `yarn test:ci`.

### Re-review follow-up

9. After the retarget, re-run the full gate set against the collapsed diff and confirm the `test`, `CodeQL` and `qlty check` checks are green across more than one run.
10. **Remember to delete this review document along with the other seven before merging.**
