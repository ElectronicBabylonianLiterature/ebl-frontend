---
task_id: 774
document: handoff / continuation prompt
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
branch: chore/remove-bluebird
base_branch: chore/ts7-tsconfig-migration
date: 2026-09-09
last_updated: 2026-09-09 (review round 3 + remediation)
state: all findings from every round addressed; one finding withdrawn as incorrect; awaiting re-review
tracked_in_git: true (the TASK-*.md ignore rule was reverted at the user's request)
blocking_items: 1 (standing CHANGES_REQUESTED needs a re-review — nobody else can clear it)
---

# TASK-774 — Handoff

## In plain words

This PR removes the `bluebird` library and replaces it with the browser's own `AbortController`.

The tricky part is that "cancel" means two different things:

- **Reading data.** If you leave a page while it is still loading, cancelling is fine — just stop the download.
- **Saving data.** If you already sent a save to the server, cancelling the connection does **not** undo the save. You just stop hearing whether it worked. That is worse than useless.

So the PR does reads and writes differently. Reads get a real cancel signal. Writes never get one — instead, when a newer save starts, the older save keeps running and only its _screen update_ is thrown away. That is the right call, and it is now enforced by the type system rather than by everyone remembering the rule.

Everything else in the PR is tidying that came along with it: a stylesheet migration, splitting oversized files, and better tests.

## Review round 3 — what was found

Six findings. Five were real and are fixed. One was my mistake and is withdrawn.

| #   | In plain words                                                                                                                                                                                     | Outcome                     |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------- |
| F1  | The README promised "the compiler stops you cancelling a save" — but one type still allowed a cancel signal to be passed in, where it was silently thrown away. The promise was not actually true. | **Fixed**                   |
| F2  | Three leftover scratch `.md` files were still tracked and would have been dumped into `master`.                                                                                                    | **Fixed**                   |
| F3  | qlty reported 6 blocking issues. All 6 were copy-pasted blocks inside test files this PR itself adds.                                                                                              | **Fixed**                   |
| F4  | The coverage gate had almost no slack (~0.1%), so an unrelated rounding wobble could turn CI red.                                                                                                  | **Fixed**                   |
| F5  | I claimed two disabled tests came from the base PR.                                                                                                                                                | **Withdrawn — I was wrong** |
| F6  | The same type was declared twice in two places, and this PR changed only one copy, so they disagreed.                                                                                              | **Fixed**                   |

## What was done

**F1 + F6 together.** The `JsonApiClient` type moved into its own file, `src/http/JsonApiClient.ts`, and `postJson` no longer takes a cancel signal. `src/index.tsx` had been declaring this type without ever using it, and the duplicate copy in `appDriverHelpers.tsx` is gone — one definition now, four users.

This fixed a third thing nobody had noticed: two production files were importing a type from `index.tsx`, which is the file that boots the whole app (`createRoot`, `root.render`, `serviceWorker.unregister()`). It only stayed safe because the build tool happens to strip type-only imports. That trap is gone.

**F2.** The three `TASK-ts7-migration-*.md` files are untracked. Compared to `master`, the only `.md` change this branch makes is `README.md`.

**F3.** The two near-identical 401/403 tests became one `it.each`. The repeated Auth0 setup moved into `react-auth0-spa.testSupport.tsx` as five small helpers. The two test files shrank a lot — 128 → 57 lines and 94 → 50 — and read as intent rather than scaffolding. `qlty smells --all` no longer flags any of them. One assertion actually got stricter along the way.

**F4 — coverage, and a correction to the instruction.** The request was "100 for all cases". Setting `coverageThreshold.global` to 100 would grade the **entire repository**, not this PR. Measured properly: the repo is at **94.22% statements / 86.08% branches / 93.93% functions / 94.34% lines**, and **262 of 696 files** are below 100% somewhere. A global 100 would have failed CI instantly over hundreds of files this PR never touches.

So instead the config now has a realistic global floor (93 / 85 / 93 / 93) **plus per-path 100% gates on the ten files this PR owns**:

```text
src/common/hooks/usePromiseEffect.ts        src/common/utils/getOrFetchCachedValue.ts
src/common/utils/AbortableOperation.ts      src/common/utils/mapSeries.ts
src/common/utils/ConcurrencyLimiter.ts      src/http/ApiClient.ts
src/common/utils/SupersedableOperation.ts   src/http/withData.tsx
src/common/utils/abortError.ts
src/common/utils/applyWhenCurrent.ts
```

All ten verified at 100% on all four measures. This makes "100% on the code we changed" a gate the build actually enforces, instead of a rule people are asked to remember.

**`.gitignore` reverted, as asked.** The rule this PR added to hide `TASK-*.md` files is gone; `.gitignore` now matches the base branch exactly. Scratch docs show up as normal files in `git status` instead of disappearing. That is the point — F2 existed precisely because a file was invisible.

## The mistake worth learning from (F5)

I reported that two disabled tests (`xit`) in `Edition.test.tsx` came from the base PR #773. **That was wrong.** Checking the history properly:

```text
4db5c9cd (merge-base of this branch and master) -> xit = 2
4f71cb24 chore/ts7-tsconfig-migration           -> xit = 2
0e679943 this branch                            -> xit = 2
1dcc762e origin/master                          -> xit = 0
```

They predate both PRs. `master` fixed them separately in #767 by adding `src/editor/Editor.testSupport.tsx`, a file that has never existed on this branch line. A merge preview (`git merge-tree --write-tree origin/master HEAD`) confirms the merged result keeps master's working tests **and** this branch's changes. Nothing to fix, on either PR.

**Lesson:** before blaming a branch for a regression, check the merge-base. "It differs from master" and "this branch broke it" are not the same statement.

## Gates (all green at the committed state)

```text
yarn lint                        PASS
yarn tsc                         PASS
yarn test --watchAll=false       426 suites, 3695 passed, 2 skipped
console output                   zero
250-line ceiling                 PASS on every touched file
qlty duplication                 6 blocking issues -> 0
per-path coverage (10 files)     100% on all four measures
global coverage                  94.22 / 86.08 / 93.93 / 94.34 (floor 93 / 85 / 93 / 93)
dev container changes            none
new .md files vs master          none
```

Note on running tests locally: this container has roughly 2.5 GB free, and one `craco test --coverage` over 426 suites gets killed by the OOM killer ("the process exited too early"). The workaround is to run the suite in seven `--testPathPattern` shards as separate processes, and merge the coverage JSON with `istanbul-lib-coverage`. Scripts are in the session scratchpad. This is a local limitation only — CI runs it fine in one pass.

## Next steps

1. **Clear the standing review.** _(blocks the merge)_ The `CHANGES_REQUESTED` from 2026-08-04 is still the active state and only the reviewer can clear it. Everything it asked for is done — point at: `usePromiseEffect.ts`, where `runWrite` uses `SupersedableOperation` so no cancel signal is ever created for a save; `src/http/JsonApiClient.ts` and `ApiClient.ts`, where no write method accepts a signal anywhere now, in the type or the implementation; `usePromiseEffect.write.integration.test.tsx`, the integration test that was requested; and all seven files named in that review, now under 250 lines. Reviewer assignment deliberately untouched.
2. **Push and confirm CI is green.** _(blocks the merge)_ The remediation is committed but **not pushed**.
3. **Merge #773 first**, then let GitHub retarget this PR to `master`.
4. **Budget for merge conflicts.** A merge preview against master's current tip shows roughly **19 conflicting files**, including `InjectedApp.test.tsx`, `FragmentService.ts`, `FragmentRepository.ts`, `CuneiformFragment.tsx`, `TransliterationForm.tsx` and `Info.tsx`. Normal for a 471-file refactor against a moving target, but it is a real work item, not a formality.
5. **Re-check the `.md` list after retargeting** — `git diff --name-status origin/master HEAD -- '*.md'` should show only `M README.md`.
6. **Delete the scratch docs before merge.** `TASK-774-review.md`, `TASK-774-todo.md`, `TASK-774-log.md`, `TASK-774-handoff.md`, `TASK-774-merge-master-handoff.md`, and the three `TASK-ts7-migration-*.md` files. They are committed alongside the code (project convention) and are now _visible_ rather than ignored, so this is a deliberate deletion, not something to rely on `.gitignore` for.

Not this PR's problem, but worth logging:

7. **CodeQL by eye.** Both CodeQL checks pass, but the code-scanning alerts API is not readable with this environment's token, so that rests on the check run rather than an enumerated alert list. Worth a glance at the Security tab.
8. **250-line backlog.** Around 50 `.ts`/`.tsx` files repo-wide still exceed the ceiling (largest: `complexTestText.ts` 3514, `bibliography.tsx` 1290, `react-auth0-spa.test.tsx` 868). None are touched by this PR.
9. **Repo-wide coverage.** 262 of 696 files sit below 100% on some measure. If the goal really is 100% everywhere, that is a standalone programme of work — the per-path gates added here are the pattern to extend, file by file, as areas get touched.
10. **Relative imports.** Around 108 pre-existing relative imports remain in files this PR touches. The PR adds none.

## Correction to the previous handoff

The earlier version of this document said qlty's blocking issues were "_not_ enumerable locally: `.qlty/qlty.toml` enables no plugins, so a local `qlty check` reports nothing". **That is wrong.** `qlty check` needs a diff against an upstream and finds nothing on a clean tree, but **`qlty smells --all` enumerates them fine**. That is how all six were identified, attributed to specific files, and confirmed fixed — no dashboard credentials needed. Use `qlty smells --all` next time.

It also listed "clean the base branch" as a separate out-of-scope task; those three files are now untracked here (F2).
