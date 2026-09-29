---
task_id: 774
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
pr_title: 'chore: remove bluebird, use AbortController for cancellation'
review_round: 10
review_date: 2026-09-29
reviewer: Claude (automated review)
reviewed_head_sha: eb730de4 (fix: address the PR #774 round-9 review findings)
previous_round_head: 2b391cdd
base_branch: master
master_sha: ca8ba82b (Make Acquisition an array, #821)
pr_state: 'open; after remediation: master merged (c742c21e), CI green, mergeable_state blocked only by the required review'
review_decision: CHANGES_REQUESTED (Fabdulla1, 2026-09-23, on 2b391cdd — not yet re-reviewed on eb730de4)
master_drift: '1 commit behind origin/master (#821); CONFLICT in src/fragmentarium/ui/info/Details.tsx'
remediation_date: 2026-09-29
remediation_state: 'Committed locally 2026-09-29, not pushed. R2, R4, R5, R7, R8, R9 fixed in the working tree with tests that fail without the fix; R6 no change needed (jsdom has no AbortSignal.reason); R1 merge resolution verified in a scratch worktree but not applied (needs a commit); M1/W2 description drafted, not posted. The 45 over-ceiling files go to a separate PR (user decision 2026-09-29).'
final_state_2026-09-29: 'All round-10 findings resolved or closed with evidence; no open items. CI green on c742c21e (test, CodeQL, qlty no blocking issues). Awaiting Fabdulla1 re-review.'
verdict: 'CHANGES REQUESTED (at review time) — eb730de4 fixes 8 of the 9 reviewer concerns cleanly and B3 only partially (named-entity saves bypass the new SerialQueue). The branch now conflicts with master, qlty reports a new blocking issue, and the reviewer has not re-reviewed.'
findings_total: 18
findings_blocking: 6
findings_major: 1
findings_minor: 7
findings_warning: 3
findings_info: 2
reviewer_findings_round9: '9 concerns: B1 fixed (retargeted); B2, B4, B5, B6, B8, B9 fixed; B7 fixed in code, test weaker than asked; B3 PARTIAL'
scope_vs_master: 521 files, +20852 / -11018
devcontainer_changes: 'NONE — .devcontainer/ and Dockerfile are byte-identical to origin/master. CI workflows ARE changed (main.yml, codeql-analysis.yml, update-sitemaps.yml) and were re-read in full this round; unchanged since round 9 and sound (W1).'
new_md_files: 'FAIL — eight TASK-*.md files are tracked on the branch (B11). README.md and .github/copilot-instructions.md are modifications, not new files.'
gates:
  lint: PASS — yarn lint exit 0, no output
  tsc: PASS — yarn tsc exit 0
  test_ci_local: 'PASS on eb730de4 before remediation — 511/511 suites, 4480 tests, 50 snapshots, exit 0, 553 s'
  console_clean: 'PASS on eb730de4 — zero console / Warning / unhandled-rejection output (a local-only Browserslist data-age notice precedes the run; it is absent from CI)'
  coverage: 'PASS on eb730de4 — 95.19 / 88.25 / 94.87 / 95.34, no threshold breach'
  remediated_tree: 'PASS — lint exit 0, tsc exit 0, test:ci 513/513 suites, 4488 tests, 50 snapshots, exit 0, 464 s, zero console output; coverage 95.2 / 88.25 / 94.87 / 95.34; every changed source file 100%; no qlty smell new against master'
  line_ceiling_250: PASS — no .ts/.tsx file touched by eb730de4 exceeds 250 lines
  dry: 'MINOR — four new/changed tests hand-roll console spies instead of the shared expectConsoleErrors helper (R9)'
  build: 'PASS in CI (yarn build:ci-stable, "Compiled successfully"); NOT runnable here (container OOM)'
  app_runs: NOT VERIFIED — the dev server cannot start in this container (OOM)
  docker_build: NOT VERIFIED — no Docker here, and no PR job builds it (W1)
ci_checks_on_head:
  test: 'success — merge ref 0016eae (eb730de4 + e281f7ba): lint, tsc, test:ci 511/511 suites, 4480/4480 tests, 50/50 snapshots, build compiled; no console output'
  CodeQL: 'success, "No new alerts in code changed by this pull request" — unearned: diff skipped at the 300-file cap (B12)'
  Analyze (javascript): 'success, warning: "Cannot retrieve the full diff because there are too many (300) changed files in the pull request."'
  GitGuardian: success (x3) — no secrets
  qlty check: 'FAIL-ish — status success but "1 blocking issue" (R4)'
  qlty coverage: 95.3% (+1.1% change)
  qlty coverage diff: 'not computed — "Pull request has 521 changed files (max 500)" (W2)'
  docker / docker-test: skipped — master pushes only
codeql_alert_api: not queryable with the available token (403)
review_threads: 6 total, all qltysh[bot], all resolved and outdated
standing_reviews: 'Fabdulla1 CHANGES_REQUESTED 2026-09-23 on 2b391cdd (current, blocks approval). Fabdulla1 CHANGES_REQUESTED 2026-08-04 on 5ef4a984 (superseded).'
issue_comments: 0
other_review_bots: none — no sourcery-ai review, comment or check run; qltysh[bot] is the only bot reviewer
requested_reviewers: none pending
---

# Review — PR #774, round 10

## Review summary

This round is mostly good news. The round-9 commit really does fix almost everything Fabdulla1 asked for: the bibliography cache no longer leaks across logins, date saves lock properly, the limiter race is closed, cancellations reach the network, and each fix comes with a test that fails without it. One gap is left: named-entity annotation saves go around the new save queue, so they can still overtake an edition save that's in flight, and the README now says something that isn't quite true. Apart from that, it's housekeeping: #821 landed on master and now conflicts in `Details.tsx`, qlty has flagged one new blocking issue (most likely the converter form's complexity), and Fabdulla1 still needs to take another look. The dev container and Dockerfile are untouched; the CI workflow changes are the same ones reviewed last round and are fine.

### Details

| #   | Severity                               | Where                                                                                                                                                                  | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                      | What to do                                                                                                                                                                                                                                                                                                    | Status                                                                                                                                                                         |
| --- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| R1  | Blocker                                | `src/fragmentarium/ui/info/Details.tsx`                                                                                                                                | #821 (`ca8ba82b`, Acquisition → array) landed on master after round 9. The PR is `mergeable_state: dirty`; `git merge-tree` reports a content conflict in `Details.tsx`. CI's green `test` ran against the older base `e281f7ba`.                                                                                                                                                                                                                                                                                                                                                                                            | Merge `master`, resolve `Details.tsx` against #821's array-shaped acquisition, rerun all gates.                                                                                                                                                                                                               | **Fixed** — `c742c21e` (merge of `master`, verified resolution; `test:ci` 513 suites green)                                                                                    |
| R2  | Blocker (Major) — reviewer B3, partial | `src/fragmentarium/ui/fragment/editorTabContents.tsx:70-78`; `CuneiformFragmentEditor.tsx:131`; `README.md` ("routes every fragment save through a SerialQueue")       | `NamedEntityAnnotationContents` calls `fragmentService.updateNamedEntityAnnotations` directly and only enqueues `Promise.resolve(result.fragment)` afterwards, so the write itself skips the queue. The "named entities" tab is not disabled while saving (only `references`/`archaeology`/`colophon`/`permissions` use `props.disabled`). Save an edition (slow), switch to named entities and save: the NE write reaches the server immediately, finishes first, and its older fragment then supersedes the edition result in the UI.                                                                                      | Enqueue the whole NE write through `props.onSave` (keep the annotation result for `TextAnnotation`, e.g. capture it inside the queued operation), add a reverse-completion test (edition pending, NE saved, NE resolves first → NE not dispatched until the edition settles), and keep the README claim true. | **Fixed** — `f8204f90`                                                                                                                                                         |
| B10 | Blocker                                | Review state                                                                                                                                                           | Fabdulla1's `CHANGES_REQUESTED` (2026-09-23, on `2b391cdd`) still stands. No review on `eb730de4`; no reviewer is currently requested.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                       | After R1/R2 are pushed, ask Fabdulla1 for a re-review.                                                                                                                                                                                                                                                        | **Done** — review re-requested from Fabdulla1 after CI went green on the final head (asked for explicitly)                                                                     |
| B11 | Blocker                                | Repo root                                                                                                                                                              | Eight `TASK-*.md` scratch files are tracked (five `TASK-774-*`, three `TASK-ts7-migration-*`). No new `.md` files may land.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Delete all eight right before merge.                                                                                                                                                                                                                                                                          | **Done** — `TASK-*.md` untracked and ignored via `.gitignore` in the final cleanup commit; files kept locally                                                                  |
| B12 | Blocker                                | CodeQL                                                                                                                                                                 | `Analyze (javascript)` still warns "too many (300) changed files"; the diff is now 521 files, so "No new alerts" means nothing was compared.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 | Read the branch's CodeQL alerts in the GitHub UI before merging (token gets 403), or split the PR.                                                                                                                                                                                                            | **Done** — local CodeQL 2.27.1 code-scanning suite (87 rules): 0 results on the branch, 0 on master                                                                            |
| R4  | Blocker (qlty gate)                    | `src/signs/ui/CuneiformConverter/CuneiformConverterForm.tsx:23`                                                                                                        | qlty reports "1 blocking issue" on `eb730de4` (round 9 had none). The qlty page isn't readable without JS, so I reproduced it locally: `qlty check` on all 510 changed files is clean, and `qlty smells` on head vs. master differs in exactly one item: **Function with high complexity (count = 22): `CuneiformConverterForm`**. It's the only new smell, so it is almost certainly the blocker. The component is also 171 lines with a 60-line `handleConvert`.                                                                                                                                                           | Extract the per-line conversion (limiter + `getUnicodeFromAtf` + cancellation-aware error handling + reassembly) into a small tested module, e.g. `signs/application/convertAtfLines.ts`, and keep the component to state and rendering. Confirm the qlty status turns clean.                                 | **Fixed** — `f8204f90`; qlty check "No blocking issues" on `c742c21e`                                                                                                          |
| R5  | Minor — reviewer B7, test              | `CuneiformConverterForm.test.tsx`, `SignService.test.ts`, `SignRepository.test.ts`, `ApiClient.requests.test.ts`                                                       | The code threads the converter signal all the way to `fetchJson`, but each layer is tested against a mock of the next. Nothing asserts the real `RequestInit.signal` for this path, which is what the reviewer asked for.                                                                                                                                                                                                                                                                                                                                                                                                    | Add one test that drives `SignRepository.getUnicodeFromAtf` over a real `ApiClient` with `fetchMock` and asserts the `signal` on the captured `RequestInit`, as `FragmentRepository.abortSignal.test.ts` does.                                                                                                | **Fixed** — `f8204f90`                                                                                                                                                         |
| R6  | Minor — reviewer B5, test              | `src/common/utils/ConcurrencyLimiter.handoff.test.ts:35`                                                                                                               | Asserts `rejects.toMatchObject({ name: 'AbortError' })`; the reviewer asked for "rejected with the abort reason".                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Assert `rejects.toBe(controller.signal.reason)`.                                                                                                                                                                                                                                                              | **No change needed** — jsdom 16.7 has no `AbortSignal.reason`; `toBe(signal.reason)` compares with `undefined` (tried, fails)                                                  |
| R7  | Minor                                  | `src/common/utils/SerialQueue.ts:5`                                                                                                                                    | `this.tail.then(operation)` calls each operation with the previous operation's result. Harmless for today's zero-argument callers, but a surprising contract for a shared utility.                                                                                                                                                                                                                                                                                                                                                                                                                                           | `this.tail.then(() => operation())`, plus a test that the operation receives no argument.                                                                                                                                                                                                                     | **Fixed** — `f8204f90`                                                                                                                                                         |
| R8  | Minor                                  | `src/fragmentarium/ui/fragment/CuneiformFragment.tsx:148`; `FragmentView.tsx:113`                                                                                      | `CuneiformFragment` isn't keyed by fragment number, so it is reused across navigation. `isSaving`/`saveOperation` reset when the fragment changes, but `saveQueue` doesn't. A save still pending on K.1 silently delays every save on K.2.                                                                                                                                                                                                                                                                                                                                                                                   | Reset the queue together with `saveOperation.supersede()` in the fragment-change effect (or key the component by number), with a test.                                                                                                                                                                        | **Fixed** — `f8204f90`                                                                                                                                                         |
| R9  | Minor (DRY)                            | `CuneiformConverterForm.errors.test.tsx:29`; `DossiersRepository.fetch.test.ts:60`; `DossiersRepository.filter.test.ts:124`; `auth/react-auth0-spa.testSupport.tsx:87` | Round 8 (F9) replaced blanket console silencing with the shared `expectConsoleErrors`/`tolerateConsoleErrors` helpers in `setupTests.ts`. These new or changed tests hand-roll `jest.spyOn(console, …).mockImplementation()` instead. They do assert on the calls, so it's not silent suppression, but it duplicates the helper and bypasses its "no unexpected errors" check.                                                                                                                                                                                                                                               | Use `expectConsoleErrors` (and add a `console.warn` twin if the dossier tests need it).                                                                                                                                                                                                                       | **Fixed** — `f8204f90`                                                                                                                                                         |
| M1  | Minor                                  | PR description                                                                                                                                                         | Still stale: "`usePromiseEffect`'s cleanup aborts the read only; a write in flight at unmount still runs its `onSuccess`" is false since B9. There's no round-9 section (SerialQueue, date locks, limiter re-check, signal threading, Dossiers abort).                                                                                                                                                                                                                                                                                                                                                                       | Update the behaviour note and add a round-9 section.                                                                                                                                                                                                                                                          | **Fixed** — PR description updated on GitHub                                                                                                                                   |
| W1  | Warning                                | `.devcontainer/`, `Dockerfile`, `.github/workflows/`                                                                                                                   | **Dev container and Dockerfile unchanged** (byte-identical to master). Workflows are changed vs. master and were re-read in full: checkout/setup-node v5, codeql-action v4, least-privilege `permissions`, retry-then-fail install loop, the no-bluebird guard, `yarn test:ci` / `yarn build:ci-stable`, `docker-test` `needs: [test]`, qlty coverage only for master-based PRs, `pull_request` also for `chore/**`, `feature/**`, `fix/**`. The removed `SLACK_WEBHOOK_URL` env was never read on master. Fail-fast (dropped `if: success() \|\| …`) is the deliberate round-8 F12 change. No PR job builds the Dockerfile. | Run `docker build .` before merging.                                                                                                                                                                                                                                                                          | **Done as far as possible here** — no Docker daemon; Dockerfile unchanged and built on master 2026-09-28; Docker-pruned context type-checks; frozen install + build pass in CI |
| W2  | Warning                                | qlty coverage diff                                                                                                                                                     | Now that the base is master, coverage uploads, but qlty won't compute the diff coverage: "Pull request has 521 changed files (max 500)". Total coverage 95.3% (+1.1%).                                                                                                                                                                                                                                                                                                                                                                                                                                                       | Rely on the local `test:ci` thresholds and `fullyCoveredPaths`; mention it in the PR.                                                                                                                                                                                                                         | **Fixed** — note in the PR description                                                                                                                                         |
| W3  | Warning                                | #779                                                                                                                                                                   | #774 and #779 now conflict in **six** files: `codeql-analysis.yml`, `main.yml`, `update-sitemaps.yml`, `craco.config.js`, `DateSelectionMethods.test.ts` (add/add) and, new since round 9, `src/test-support/waitForSpinnerToBeRemoved.ts`.                                                                                                                                                                                                                                                                                                                                                                                  | Whoever lands second resolves them; keep #779's pinned action SHAs and this PR's `test:ci`/`build:ci-stable`.                                                                                                                                                                                                 | **Done** — trial merge with #779 resolved and verified (tsc, lint, 29 suites); recipe in the handoff                                                                           |
| I1  | Info                                   | `FragmentAnnotation.tsx:147`                                                                                                                                           | The overlay's `type === 'POINT'` branch was removed (only `RectangleSelector` is used, so it was dead code); the visible text is unchanged. Out of scope for the review concerns, but harmless.                                                                                                                                                                                                                                                                                                                                                                                                                              | Nothing.                                                                                                                                                                                                                                                                                                      | Noted — out of scope, harmless                                                                                                                                                 |
| I2  | Info                                   | CI                                                                                                                                                                     | `ubuntu-latest` moves to Ubuntu 26 on 2026-10-19; Node 20 deprecation on `qltysh/qlty-action/coverage@v1`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   | Nothing here.                                                                                                                                                                                                                                                                                                 | **Fixed** — qlty coverage action moved to the SHA-pinned v2.3.0 (`node24`), same pin as #779; `ubuntu-latest` notice needs no action                                           |

## Remediation applied (round 10)

Everything below is committed locally on top of `eb730de4` and not pushed. Each new test was run against the unfixed code and fails there.

| #   | Change                                                                                                                                                                                                                                                                                                                                                                                | Test that proves it                                                                                                                            |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| R2  | `NamedEntityAnnotationContents` passes the `updateNamedEntityAnnotations` call itself to `onSave`, so it enters the `SerialQueue` before anything is sent, and returns the captured save result afterwards. The README states the rule (hand `onSave` the request, never one already sent). A failed NE save now also shows the page-level `ErrorAlert`, as edition saves already do. | `editorTabContents.test.tsx` — "sends the annotation write only when the save queue runs it"                                                   |
| R4  | Per-line conversion moved from `CuneiformConverterForm` (171 → 117 lines) into `signs/ui/CuneiformConverter/convertAtfLines.ts`, which is added to `fullyCoveredPaths`. `qlty smells` reports nothing for either file.                                                                                                                                                                | `convertAtfLines.test.ts` (order and blank lines, word separator, failed line, abort, four-line limit); the existing form tests pass unchanged |
| R5  | No code change needed; the missing proof was added.                                                                                                                                                                                                                                                                                                                                   | `SignService.abortSignal.test.ts` — real `ApiClient`, asserts `RequestInit.signal`; fails when `SignRepository` drops the signal               |
| R6  | Not changed. jsdom 16.7.0 has no `AbortSignal.reason`, so `createAbortError` falls back to a fresh `DOMException` and `rejects.toBe(controller.signal.reason)` compares with `undefined` (tried; it fails). The `AbortError` assertion is the strongest correct one in this environment.                                                                                              | —                                                                                                                                              |
| R7  | `SerialQueue.enqueue` calls `operation()` with no argument.                                                                                                                                                                                                                                                                                                                           | `SerialQueue.test.ts` — "does not pass the previous result to the next operation"                                                              |
| R8  | The fragment-change effect in `CuneiformFragment` replaces the save queue.                                                                                                                                                                                                                                                                                                            | `CuneiformFragment.navigation-state.test.tsx` — "does not hold a new fragment save behind a pending save of the previous fragment"             |
| R9  | `setupTests.ts` capture is per console method: `expectConsoleWarnings` added, the helpers return their spy, and `observeConsole(method)` is a pass-through spy that is restored automatically. All spies are restored before any check runs. The converter errors test, both dossier tests and the auth test support use them.                                                        | The migrated tests themselves                                                                                                                  |
| R1  | Trial merge in a detached scratch worktree. #821 split `Details.tsx` into its own `DetailsItems.tsx` while this PR split it into `DetailsFields.tsx`. Resolution: keep this PR's `Details.tsx` / `DetailsFields.tsx`, port #821's one behaviour change (`fragment.acquisitions.map(...)`), delete `DetailsItems.tsx`.                                                                 | Merged tree: `yarn tsc` clean; `src/fragmentarium/ui/info`, `src/fragmentarium/domain`, `FragmentRepository.delegation` → 29 suites, 477 tests |

**Pre-existing, outside this PR — decided 2026-09-29: separate PR.** 45 script files on the branch are still over the 250-line ceiling (75 on master). Three of them (`react-auth0-spa.test.tsx`, `ErrorBoundary.comprehensive.test.tsx`, `ResultPageButtons.edge-cases.test.tsx`) also hand-roll console mocks; touching them would add over-ceiling files to this PR, so they belong in a separate split-up PR.

## Summary

PR #774 removes `bluebird`, using `AbortController`/`AbortSignal` for reads and a token-based `SupersedableOperation` for writes, plus a Sass `@use` migration, a 250-line refactor and CI changes. Round 10 reviews `eb730de4`, the single commit pushed since round 9, which addresses Fabdulla1's nine concerns from 2026-09-23. Each fix was traced in the code and its proving test identified. Eight hold up; B3 is partial (R2). Separately, master moved (R1), qlty found a new blocking smell (R4), and a few tests are weaker than the reviewer asked (R5, R6).

## Findings

Full details are in the **Details** table above. Extra evidence:

**Round-9 fixes verified.**

- **B2** — `clear()` bumps `cacheGeneration` (`BibliographyEntryLoader.ts:105`); batch and fallback writes go through `cacheEntryFromGeneration` (`:120-149`). Proven by the inverted "A batch that settles after a clear does not cache its entries" and the new fallback test.
- **B3** — `handleSave` enqueues through `SerialQueue` (`CuneiformFragment.tsx:168`). `SerialQueue` doesn't stall after a rejection (`tail` swallows it; "runs the next operation after a failed one"). Proven by "dispatches an info save only after the previous one has settled". Gap: R2.
- **B4** — Delete `disabled={isSaving}`, Save `!isSelectedDateValid || isSaving` (`DateSelection.tsx:87`, `:103`); rows get `isParentSaving`; Add disabled; `saveDates` goes through `runWrite` + `applyWhenCurrent`. Proven by `pendingDateWrites.test.tsx`.
- **B5** — re-check inside `try` at `ConcurrencyLimiter.ts:21-28`, so `finally` releases the slot. Proven by `ConcurrencyLimiter.handoff.test.ts` (see R6).
- **B6 / N1** — signals forwarded at `Annotator.tsx:82-83`, `SearchFormPeriod.tsx:142`, `WordDisplayLogograms.tsx:91-92`, plus markup and `FragmentAnnotation`. Proven by `withDataGetters.abortSignal.test.tsx`. The only remaining signal-less call in those files is `fragmentService.find`, a shared-cache read that is exempt by design.
- **B7** — form → service → repository → `fetchJson` (`CuneiformConverterForm.tsx:54-55`, `SignService.ts:56-57`, `SignRepository.ts:132-138`); cancellations are rethrown, not reported. Test gap: R5.
- **B8** — `isAbortError` rethrown before the fallback (`DossiersRepository.ts:30-32`). Proven by "rethrows an abort instead of falling back to an empty result".
- **B9** — cleanup calls `cancel()` then `writeOperation.current.supersede()` (`usePromiseEffect.ts:21-27`). Proven by "Makes a write stale on unmount".

**R2.** `editorTabContents.tsx:70-78`:

```
props.fragmentService
  .updateNamedEntityAnnotations(props.fragment.number, annotations)
  .then((result) => props.onSave(() => Promise.resolve(result.fragment)).then(() => result))
```

The HTTP write starts before `onSave` is ever called. `EditionContents` and `LemmatizationContents` correctly pass the service call itself into `onSave`.

**R4.** `qlty 0.639.0`: `qlty check --upstream origin/master` found "no modified files", so it was rerun with the 510 added/modified paths passed explicitly: "No issues". `qlty smells --no-snippets` on the same `.ts/.tsx/.js` paths on `eb730de4` (12 smells) vs. the same paths on `origin/master` (21 smells): the only smell present on head and absent on master is `Function with high complexity (count = 22): CuneiformConverterForm`.

**Console handling.** `setupTests.ts` has no global console mock. `expectConsoleErrors`/`tolerateConsoleErrors` install a spy only when a test opts in, and an `afterEach` fails the test on any `console.error` that doesn't match the declared pattern (round 8, F9). R9 covers the tests that don't use it.

## Severity

| Severity | Count | Findings                                             |
| -------- | ----- | ---------------------------------------------------- |
| Blocker  | 6     | R1, R2, B10, B11, B12, R4                            |
| Major    | 1     | R2 (counted within the blockers; reviewer-requested) |
| Minor    | 7     | R5, R6, R7, R8, R9, M1 — and R2's README sentence    |
| Warning  | 3     | W1, W2, W3                                           |
| Info     | 2     | I1, I2                                               |

Round-9 carry-over: B1 → fixed (base is master). B2, B4, B5, B6, B8, B9, N1 → fixed and verified. B3 → partial (R2). B7 → fixed, test gap (R5). B10, B11, B12 → open. M1 → partly open. M2 → approved (closed). W1, W3 → open. W2 → replaced by the qlty findings (R4, W2). I1 (secret-scan Node 20) → dropped, the warning isn't on this head's GitGuardian runs.

## Reproduction Steps

```bash
git fetch origin
git checkout chore/remove-bluebird          # eb730de4
yarn lint && yarn tsc && yarn test:ci
```

R1:

```bash
git merge-tree --write-tree --name-only origin/master HEAD   # CONFLICT (content): src/fragmentarium/ui/info/Details.tsx
```

R2: open a fragment with edit rights, throttle `POST /fragments/<n>/edition` in DevTools, save the edition, switch to "named entities" and save an annotation. The NE request is sent immediately, while the edition request is still pending. If the NE request finishes first, the edition result is discarded and the UI shows the NE response's fragment.

R4:

```bash
git diff --name-only --diff-filter=AM origin/master...HEAD > changed.txt
qlty smells --no-snippets $(grep -E '\.(ts|tsx|js)$' changed.txt)   # compare with the same run on origin/master
```

R6 / R7 / R8: read `ConcurrencyLimiter.handoff.test.ts:35`, `SerialQueue.ts:5` and `CuneiformFragment.tsx:148-161`.

W3:

```bash
git merge-tree --write-tree --name-only HEAD origin/fix-sitemap-automation-bot-identity   # 6 CONFLICT lines
```

## Recommendation

**Request changes.** It's close. Merge master (R1), route the named-entity save through the queue (R2), and split the converter form so qlty is clean (R4). Tighten the two tests the reviewer asked for (R5, R6) and the small `SerialQueue` fixes (R7, R8) in the same pass. Then update the description (M1) and ask Fabdulla1 for a re-review. Delete the scratch docs (B11) and read the CodeQL alerts (B12) right before merging.

## Comment Status Tracking

Gathered on head `eb730de4` from timeline review events, inline review comments, issue comments and the GraphQL `reviewThreads` connection.

**Review threads — 6 total, all resolved, all outdated.**

| Thread                 | Author        | Path                                         | Resolved | Outdated |
| ---------------------- | ------------- | -------------------------------------------- | -------- | -------- |
| Similar code, mass 79  | `qltysh[bot]` | `src/corpus/application/TextService.ts`      | Yes      | Yes      |
| Similar code, mass 79  | `qltysh[bot]` | `src/corpus/application/TextService.ts`      | Yes      | Yes      |
| Similar code, mass 120 | `qltysh[bot]` | `src/common/hooks/usePromiseEffect.test.tsx` | Yes      | Yes      |
| Similar code, mass 120 | `qltysh[bot]` | `src/common/hooks/usePromiseEffect.test.tsx` | Yes      | Yes      |
| Similar code, mass 66  | `qltysh[bot]` | `src/corpus/application/TextService.ts`      | Yes      | Yes      |
| Similar code, mass 66  | `qltysh[bot]` | `src/corpus/application/TextService.ts`      | Yes      | Yes      |

**Timeline review events — 4 total.**

| Review       | Author        | State               | Date       | Commit     | Status                                                                                                    |
| ------------ | ------------- | ------------------- | ---------- | ---------- | --------------------------------------------------------------------------------------------------------- |
| `4746909786` | `qltysh[bot]` | `COMMENTED`         | 2026-07-21 | `7ba6f490` | Resolved, outdated                                                                                        |
| `4764412287` | `qltysh[bot]` | `COMMENTED`         | 2026-07-23 | `01e61b13` | Resolved, outdated                                                                                        |
| `4854993025` | `Fabdulla1`   | `CHANGES_REQUESTED` | 2026-08-04 | `5ef4a984` | Superseded; all concerns fixed in rounds 7–8                                                              |
| `5292160027` | `Fabdulla1`   | `CHANGES_REQUESTED` | 2026-09-23 | `2b391cdd` | **UNRESOLVED — blocks approval.** 9 concerns: 8 fixed in `eb730de4`, B3 partial (R2). Awaiting re-review. |

**Timeline since round 9.** Base changed to `master` (2026-09-23 21:22). `eb730de4` pushed (2026-09-23 21:40). No reviews, comments or review requests since.

**Issue comments — 0.** **Other review bots — none** (no sourcery-ai review, comment or check run). **Requested reviewers — none pending.**

## What Has To Be Done

### Blockers

1. **Merge `master` and resolve `src/fragmentarium/ui/info/Details.tsx` (R1)** against #821's array-shaped acquisition. Rerun lint, tsc and `yarn test:ci`.
2. **Route the named-entity annotation write through the save queue (R2)**: enqueue the service call itself via `props.onSave`, add a reverse-completion test with an edition save pending, and keep the README's "every fragment save" sentence true.
3. **Clear the qlty blocking issue (R4)**: extract the converter's line-conversion logic out of `CuneiformConverterForm` into a tested module, then confirm `qlty check` shows no blocking issues.
4. **Ask Fabdulla1 for a re-review (B10)** once 1–3 are pushed and green.
5. **Read the branch's CodeQL alerts in the GitHub UI (B12)** before merging (the diff exceeds the 300-file cap).
6. **Delete the eight `TASK-*.md` files (B11)** right before merge: `TASK-774-handoff.md`, `TASK-774-log.md`, `TASK-774-merge-master-handoff.md`, `TASK-774-review.md`, `TASK-774-todo.md`, `TASK-ts7-migration-log.md`, `TASK-ts7-migration-research.md`, `TASK-ts7-migration-todo.md`.

### Code and test follow-ups (same pass)

7. **R5** — add a real-`ApiClient` test asserting `RequestInit.signal` for `getUnicodeFromAtf`.
8. **R6** — assert `rejects.toBe(controller.signal.reason)` in `ConcurrencyLimiter.handoff.test.ts`.
9. **R7** — `SerialQueue.enqueue`: `this.tail.then(() => operation())`, with a test.
10. **R8** — reset the save queue when the displayed fragment changes, with a test.
11. **R9** — switch the four hand-rolled console spies to the shared `expectConsoleErrors` helper.

### Before merge

12. **M1** — fix the stale unmount note in the PR description and add a round-9 section.
13. **W1** — run `docker build .` locally; no PR job builds the Dockerfile.
14. **W2** — note in the PR that qlty's diff coverage isn't computed above 500 files; rely on `test:ci` thresholds.
15. **W3** — plan the six-file #779 conflict.
16. Confirm `test`, `CodeQL` and `qlty check` are green on the new head.
