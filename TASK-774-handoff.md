---
task_id: 774
document: handoff / continuation prompt
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
branch: chore/remove-bluebird
base_branch: master
head: '716df2ba (2026-10-01), pushed; uncommitted on top: the C1–C3 CI/devcontainer fix (TASK-774-ci-canvas-*.md)'
date: 2026-10-01
state: 'Container rebuilt, 716df2ba pushed. CI test failed at Install (canvas has no Node 24 prebuild; runner lacks cairo/pixman) — fixed locally, uncommitted. Open: commit + push the fix (your request), CI green, PR description, Fabdulla1 re-review, #823 rebase.'
tracked_in_git: 'yes — TASK-*.md are no longer gitignored (your request, 2026-09-30) and are committed with the code; remove them in their own cleanup commit before merge'
gates: 'lint PASS, tsc PASS, test:ci PASS on Node 20 and Node 24.21.0 (646 suites / 5546 tests / 47 snapshots, zero console output), coverage 98.35/95.75/98.35/98.45, every touched file 100%, no touched file over 250 lines, CodeQL 0, qlty smells 55 → 21 files repo-wide'
follow_up_pr: '#823 (chore/split-oversized-files), stacked on this branch: needs a rebase dropping its splits of the 17 files split here; keeps PdfExport complexity, TestData and the 42 untouched oversized files'
---

# TASK-774 — Handoff

## In plain words

This PR removes the `bluebird` library and cancels requests with the browser's own `AbortController`. Reads can be cancelled; writes never are, and saves that could overlap wait in a queue.

Round 12 reviewed the pushed round-11 commit, found a handful of real problems, and fixed all of them together with everything left over: the newest `master` (#765) is merged, all relative imports are gone, the project runs on Node 24, every file the PR touches is fully tested and under 250 lines, and two old bugs were fixed (Julian January/February dates were off by a day or two; the export credit line never listed who worked on a fragment). Everything is committed locally, nothing is pushed.

## Next steps, in order

1. ~~Rebuild the dev container~~ — done 2026-10-01. ~~Push~~ — done (716df2ba).
2. **Commit and push the CI fix** (only on your explicit request): `.github/workflows/main.yml` installs the canvas build libraries; `.devcontainer/devcontainer.json` gains the GitHub CLI feature (and is now Prettier-formatted); `.devcontainer/README.md`. See `TASK-774-ci-canvas-log.md`.
3. **Check CI** on the merge ref: the `test` job now runs on Node 24; GitHub's CodeQL must stay green (its diff view is still truncated at 300 files; the local run found 0 on the full tree).
4. **m5 — update the PR description** with the draft in `TASK-774-review.md` ("Draft PR description update (m5)").
5. **B1 — Fabdulla1's re-review.** Their CHANGES_REQUESTED review of 2026-09-29 is fully addressed; reviewer assignment is yours.
6. **#823** — rebase onto this branch and drop its versions of the 17 files split here (`complexTestText.ts`, `PdfExport.tsx`, `SearchFormDossier.test.tsx`, `ChapterViewLine.tsx`, `LineVariant.test.ts`, `notFoundRoutes.test.tsx`, `SearchForm.tsx`, `LemmaAnnotationButton.test.tsx`, `useObjectUrl.regression.test.tsx`, `DisplayToken.tsx`, `line.ts`, `text.test.ts`, `Introduction.tsx`, `DateBase.ts`, `ChapterLines.tsx`, `manuscript.test.ts`, `DateConverterFormOptions.tsx`), plus `ErrorBoundary.comprehensive.test.tsx`, `ChapterView.integration.test.ts`, `dtos.ts` and `test-corpus-text.ts`, which were also split here.
7. **After merge:** watch the first `docker` / `docker-test` run on master (the Docker image now builds on `node:24.21.0-alpine3.23`; no PR job builds it). Then remove the `TASK-*.md` files in their own commit.

## What is still open

| Item                                                                                                     | Why it is open                                                                                                                                                 | Where it goes                                                                                                      |
| -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| B1 — reviewer re-review                                                                                  | Needs the push and Fabdulla1                                                                                                                                   | You                                                                                                                |
| m5 — PR description                                                                                      | Drafted; you chose to publish after the push                                                                                                                   | You, after step 2                                                                                                  |
| Running the app                                                                                          | The dev server runs out of memory in this container; never verified locally                                                                                    | CI build after the push; a quick manual check of the fragment editor, annotation tool and image tabs is worthwhile |
| `PdfExport` complexity (6 qlty smells in the split modules), `TestData` (6-parameter constructor, `any`) | Assigned to #823 by your 2026-09-29/30 decision                                                                                                                | #823                                                                                                               |
| 42 untouched files over 250 lines                                                                        | Not touched by this PR                                                                                                                                         | #823                                                                                                               |
| 7 justified casts/suppressions                                                                           | Not defects: 3 deliberately invalid test payloads, exif-js typing (`getData(url: string)` but reads a `Blob`), `withData`'s dynamic `watch()` deps, `TestData` | Keep (TestData → #823)                                                                                             |
| `ChapterInfoLine` type unused after a dead-code removal in `dtos.ts`                                     | Noticed by a worker, not removed                                                                                                                               | Next touch of `corpus/domain/ChapterInfo`                                                                          |

## Round-12 status

| ID    | In plain words                                                    | Status                                        |
| ----- | ----------------------------------------------------------------- | --------------------------------------------- |
| B1    | Reviewer still has "changes requested"                            | **Open** — push, then re-review               |
| M1    | A failed save could be hidden by a later one                      | **Fixed** — `useFragmentSaves`                |
| M2    | Deleting an annotation during "Generate" brought it back          | **Fixed**                                     |
| M3    | Two tests were deleted without asking                             | **Fixed** — restored                          |
| M4    | Image tabs mixed two kinds of keys; `?tab=0abc` showed nothing    | **Fixed** — `ImageTabController`              |
| M5    | New files missing from the 100%-coverage list                     | **Fixed** — 98 entries                        |
| M6    | One test file hid console errors                                  | **Fixed** — split, asserts its errors         |
| M7    | Untested lines in files the PR touches                            | **Fixed** — 0 gaps in 1032 files              |
| M8    | Relative imports left                                             | **Fixed** — 450 rewritten                     |
| M9    | Node 20 end of life                                               | **Fixed** — Node 24, ⚠️ dev container changed |
| m1–m4 | Stale annotation error, fragile retry test, tuple payloads, casts | **Fixed** (7 justified exceptions)            |
| m5    | PR description out of date                                        | **Drafted** — publish after push              |
| W1–W3 | CI workflows, tool blind spots, dev container                     | Checked; ⚠️ W3 needs the rebuild              |
| I1    | Oversized files                                                   | 17 split here (your decision); rest in #823   |
| I2    | `master` moved (#765)                                             | **Merged**                                    |

## If #779 lands after this PR (W3 recipe)

- Workflows: take #779's SHA pins on every conflicting `uses:` line. In `main.yml`'s qlty step keep this PR's comment block and `if: github.event_name == 'push' || github.base_ref == 'master'`. Keep the No-bluebird step, `yarn test:ci`, `yarn build:ci-stable`, permissions and `docker-test` `needs: [test]`.
- `craco.config.js`: keep #779's `configureJest` / `configureWebpack` structure and its `scripts/` test roots; port this PR's `fullyCoveredPaths`, `validateFullyCoveredPaths`, per-path 100% thresholds, global floors 94/86/94/94, `modulePaths`, `resolve.modules`, and the shorter Sass `silenceDeprecations: ['legacy-js-api']` / `ignoreWarnings` lists.
- `DateSelectionMethods.test.ts` (both added it): keep this PR's version; fold #779's "saves a changed date" into the save test (index 2); move #779's extra `getDate` assertions into `getDate.test.ts`.
- `waitForSpinnerToBeRemoved.ts`: #779's typed signature and constant name, this PR's 5000 ms timeout.
- #779's new `src/chronology/ui/DateEditor/DateSelection.dates.test.tsx` imports bluebird; switch it to `Promise.resolve`, or the No-bluebird step and `tsc` fail.

## Things worth knowing

- **Save queues.** Every fragment save goes through the `SerialQueue` in `useFragmentSaves` (used by `CuneiformFragment`): editor tabs and genres via `onSave`, sidebar script/date/dates-in-text via `enqueueSave`. Hand the queue the request itself, never a promise already started. Success is applied only for the latest save; errors are shown for every save while the same fragment is displayed. Annotation-list writes have their own queue in `useAnnotationPersistence`; card and keyboard deletes lock while a write or generation is pending.
- **`withData`** applies a result only when it is the latest request and its signal isn't aborted; `retry: true` adds a Retry button. It uses the named `useState` again (the old call-order mock test is gone).
- **Console in tests:** `expectConsoleErrors` / `expectConsoleWarnings` (assert, and require a match) and `observeConsole` (pass-through) from `setupTests`. `tolerateConsoleErrors` no longer exists. Never `jest.spyOn(console, ...).mockImplementation()`.
- **Signals:** `withDataGetters.abortSignal.test.tsx`, `corpusGetters.abortSignal.test.tsx` and `TextService.abortSignal.test.ts` show how to prove a signal reaches `fetch`; `test-support/pendingRead.ts` is the shared helper.

## Traps met

- The dev container ships cairo/pango/pixman dev packages, so `canvas` 2.11 builds from source there on Node 24; GitHub's ubuntu runner does not have them. A local Node 24 install proves nothing about CI's install step.
- `gh` is provided by the dev container's `github-cli` feature; on a container built before that feature, install it from cli.github.com's apt repo.

- jsdom 16.7 has no `AbortSignal.reason`; expect `name: 'AbortError'`.
- `qlty check --upstream origin/master` sees "no modified files" here; pass paths explicitly.
- A session restart wipes the `/tmp` scratchpad. Keep worktrees, patches and downloads under `/workspaces/ebl-frontend.worktrees/`.
- CodeQL JS analysis needs about 3 GB (`--ram=3200`); run it with nothing else heavy resident.
- Never run lint, tsc, qlty or CodeQL alongside `yarn test:ci`.
- A test file's own `afterEach(jest.clearAllMocks)` runs before `setupTests`' console check and erases the spy history — don't add one.
- `testing-library/no-await-sync-queries` mistakes `dossiersService.queryByIds` for a DOM query; use `await expect(...).resolves`.
- A targeted `--coverage` run overwrites `coverage/lcov.info`; compute diff coverage only from a full `yarn test:ci` report.
- `jest.mocked` does not exist in this Jest version; type mocks with `jest.MockedFunction<...>` or `jest.Mocked<Pick<...>>`.
- Yarn 1 enforces `engines` on every `yarn` command. With `engines` at `^24.0.0`, nothing runs on a Node 20 container; rebuild the dev container, or put a Node 24 binary first on `PATH` (one is unpacked at `/workspaces/ebl-frontend.worktrees/node24-tool/node-v24.21.0-linux-x64/bin`).
- `uniqueRecord` collapses record entries of the same user, type and day; tests that need several entries need distinct ones.
- An integration suite that renders the whole app can exceed Jest's 5 s hook timeout on a cold start under full-suite load; `ChapterView.integration.testSupport.ts` gives its setup 30 s.
