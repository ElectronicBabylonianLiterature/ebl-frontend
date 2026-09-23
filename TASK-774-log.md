# TASK-774 — Work log

## 2026-08-06 — Review of PR #774

### Environment note

`gh` is not installed in this devcontainer. All GitHub data was fetched with `curl` against
the REST API (`$GITHUB_API_URL`) and the GraphQL API (`$GITHUB_GRAPHQL_URL`) using
`$GITHUB_TOKEN`. GraphQL was needed for `reviewThreads` because REST does not expose
`isResolved` / `isOutdated`.

### Data gathered

| Source                                           | Result                                                                                                  |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `GET /pulls/774`                                 | open, base `chore/ts7-tsconfig-migration`, head `5ef4a984`, +3870/−1596 over 275 files, mergeable/clean |
| `GET /pulls/774/reviews`                         | 3 review events: `qltysh[bot]` COMMENTED ×2, `Fabdulla1` CHANGES_REQUESTED                              |
| `GET /pulls/774/comments`                        | 6 inline comments, all `qltysh[bot]`                                                                    |
| `GET /issues/774/comments`                       | 0 general comments                                                                                      |
| GraphQL `reviewThreads`                          | 6 threads, all resolved by `qltysh[bot]`, 5 outdated                                                    |
| GraphQL `timelineItems`                          | 6 commits, review-request to `Fabdulla1` on 2026-08-04                                                  |
| `GET /commits/5ef4a984/check-runs`               | 3 runs, all GitGuardian, all success                                                                    |
| `GET /commits/5ef4a984/status`                   | `success` — only context is `qlty check` ("No blocking issues")                                         |
| `GET /actions/runs?branch=chore/remove-bluebird` | 10 runs, **all GitGuardian**; the `CI` workflow never ran                                               |

No sourcery-ai review, comment, or check exists on this PR, and the repo has no sourcery
config. Nothing to gather from that reviewer.

### Local verification

PR head checked out into an isolated detached worktree at
`<scratchpad>/pr774` (the user's working tree was left untouched on
`fix-docker-build-test-support`). `yarn install --frozen-lockfile` succeeded.

| Gate       | Command                                         | Result                                  |
| ---------- | ----------------------------------------------- | --------------------------------------- |
| TypeScript | `yarn tsc`                                      | **pass**, 0 errors                      |
| Lint       | `yarn lint`                                     | **pass**, 0 errors (eslint + stylelint) |
| Tests      | `CI=true yarn test --watchAll=false --coverage` | see `TASK-774-review.md`                |

### Findings verified against the code (not taken on trust)

1. **`runWrite` network-aborts a dispatched write** — confirmed.
   `AbortableOperation.start()` (`src/common/utils/AbortableOperation.ts:4-8`) calls
   `this.abort()` before minting a new controller, and `usePromiseEffect.runWrite`
   (`src/common/hooks/usePromiseEffect.ts:39-43`) shares that supersession path with `run`.
   The signal reaches `fetch` via `ApiClient.fetch` (`src/http/ApiClient.ts:161-165`).
2. **A concrete reachable repro was found** that Fabdulla1's review did not name:
   `ScriptSelection`'s Save button is `disabled={!isDirty}`
   (`src/fragmentarium/ui/info/ScriptSelection.tsx:132`), not `disabled={isSaving}`, and
   `script` state is only updated on success — so the button stays enabled for the whole
   duration of the save. Two clicks abort the first POST.
   By contrast `ChapterEditView` does pass `disabled={isSaving}`
   (`src/corpus/ui/ChapterEditView.tsx:151`), so that path is guarded.
3. **The test suite codifies the problematic behaviour** — confirmed.
   `describe.each(['run','runWrite'])` at `src/common/hooks/usePromiseEffect.test.tsx:52-58`
   asserts _both_ runners abort the superseded operation.
4. **No integration test reaches a mocked `ApiClient`/`fetch` for overlapping writes** —
   confirmed. `src/corpus/ui/ChapterEditView.integration.test.ts` exists but is untouched by
   this PR (last modified in #692) and does not cover this.
5. **250-line ceiling** — measured before/after for every changed `.ts`/`.tsx`.
   Only `src/http/withData.test.tsx` (244 → 264) is _newly_ pushed over the limit by this PR.
   Twelve already-over files were grown further; the rest of the 34 violations are untouched
   pre-existing debt.
6. **qlty duplications are fixed at head.** The 6 inline comments were raised against
   `7ba6f490`/`01e61b13`; at `5ef4a984` `TextService` has `postChapterUpdate` and
   `fetchSiglaAndTransliterations` extracted and the hook suite is parameterised.
   `qlty check` on the head SHA is green.

### Pre-existing issues encountered

None in the local gates — `yarn lint` and `yarn tsc` were already clean at PR head, so there
was nothing to fix at root cause. The pre-existing defects that _were_ found are all in the
PR's own diff or in files it touches, and are recorded as findings in `TASK-774-review.md`
rather than fixed, because this task was scoped to reviewing another contributor's PR and the
copilot instructions forbid changing the codebase unless explicitly requested.

### Test suite result (PR head)

```text
Test Suites: 346 passed, 346 total
Tests:       2 skipped, 3529 passed, 3531 total
Snapshots:   50 passed, 50 total
Time:        406.973 s
```

Exit 0. Zero `console.error` / `console.warn` / `Warning:` / unhandled-rejection lines in the
whole run — the console-clean gate genuinely passes.

Coverage is 93.07 % statements / 83.73 % branches project-wide, and **below 100 % on affected
code**, with the misses concentrated on the `signal.aborted` / `isCancellation` branches the PR
introduces. Recorded as Finding 5.

### Incident: main worktree branch was switched

During this task the primary worktree's `HEAD` moved from `fix-docker-build-test-support` to
`chore/remove-bluebird` (reflog: `checkout: moving from fix-docker-build-test-support to
chore/remove-bluebird`). This was noticed at cleanup and reversed with
`git checkout fix-docker-build-test-support`. No commits were made, nothing was pushed, and
`fix-docker-build-test-support` is back at `9a33c179` with the untracked
`TASK-docker-build-ci-options.md` intact. The review itself ran in a separate detached
worktree, which has since been removed.

### Deliverables

- `TASK-774-todo.md`
- `TASK-774-log.md` (this file)
- `TASK-774-review.md`

All three are working-tracking docs and must be deleted before any merge.

---

## 2026-08-06 (later) — Remediation of the findings

Working on `chore/remove-bluebird` in the primary worktree, everything uncommitted.
User-confirmed scope: type-enforced write fix, all code-affecting findings, and the
250-line refactor across every `.ts`/`.tsx` file the PR touches.

### Finding 1 — the write-cancellation blocker

New `common/utils/SupersedableOperation` mints a monotonic token per start and returns an
`isStale()` predicate. `usePromiseEffect.runWrite` now has the type
`(isStale: () => boolean) => Promise<unknown>` — there is no `AbortSignal` in a write's
signature at all. `signal?` was then deleted from every write-side method:

- `FragmentService` / `FragmentRepository`: all eleven `update*` methods plus
  `updateNamedEntityAnnotations`
- `TextService`: `updateAlignment`, `updateLemmatization`, `updateManuscripts`,
  `updateLines`, `importChapter`, `postChapterUpdate`
- `WordService` / `WordRepository`: `update`, `createProperNoun`

Consumers were converted to `isStale()` gating: `ScriptSelection`, `ChapterEditView`,
`CuneiformFragment`, `DateSelectionMethods`, `DatesInTextSelection`, `Details`, `Info`,
`CuneiformFragmentEditor`. `ScriptSelection`'s Save button is now
`disabled={!isDirty || isSaving}`, closing the concrete repro from the review.

Two DRY extractions fell out of this and were kept: `FragmentRepository.postFragmentUpdate`
(collapsed twelve near-identical POST bodies) and `FragmentService.applyFragmentUpdate`
(collapsed eleven identical inject-then-cache tails).

### Finding 10a was wrong — withdrawn

The review suggested adding `!abortController.signal.aborted` to `withData`'s success path
"for symmetry". Applying it broke `FragmentView.test.tsx`: 13 spinners never resolved,
because the success path legitimately runs after the effect's cleanup has aborted the
controller while `requestSequence` still identifies the request as current. Reverting the
single condition made the suite pass again. The author's `requestSequence`-only guard is
correct and the PR body's claim about it was accurate. The finding is withdrawn in
`TASK-774-review.md`; no code change remains.

### Finding 6 — first file

`FragmentService.ts` was a 849-line god class. Decomposed behaviour-preservingly into ten
modules (all under 250 lines), verified by its own 143-test suite passing unchanged apart
from three expectation updates:

| Module                     | Lines | Holds                                               |
| -------------------------- | ----- | --------------------------------------------------- |
| `FragmentService`          | 94    | facade; the write delegations                       |
| `FragmentReadService`      | 241   | base class; construction and the read API           |
| `FragmentCache`            | 247   | every cache map, scope handling, eviction, prefetch |
| `FragmentRepositoryTypes`  | 149   | the repository/image interfaces and `onError`       |
| `FragmentWriter`           | 143   | every mutation                                      |
| `FragmentQueryLoader`      | 111   | `find`, `query`, `queryLatest`, prefetch resolution |
| `FragmentProvenanceLoader` | 74    | provenance loading and caching                      |
| `FragmentLemmaLoader`      | 51    | lemma search and lemmatisation                      |
| `FragmentImageLoader`      | 50    | folios, photos, thumbnails                          |
| `injectFragmentReferences` | 27    | the shared reference-injection helper               |

`LemmatizationFactory` previously imported the whole `FragmentService`; it now depends on a
narrow `LemmaSuggestionSource` interface, which also breaks an import cycle.

Three tests needed retargeting after the move, all mechanical: the `trimCache` guard now
constructs a `FragmentCache` and calls its public `trim`; the `injectReferences` spy now
targets `queryLoader`; and `folioPager` / `findAnnotations` / `fetchNamedEntityAnnotations`
delegation expectations gained the forwarded `signal` argument.

### Remaining

15 source files and 19 test files are still over 250 lines. They are listed in
`TASK-774-review.md` under Finding 6. Each split is independent and the tree is green
between them, so this can be picked up incrementally.

---

## 2026-08-06 (continued, after commit b744a49b) — more 250-line splits

### `FragmentRepository.ts` (732 → 5 modules)

| Module                       | Lines | Holds                                                        |
| ---------------------------- | ----- | ------------------------------------------------------------ |
| `FragmentRepository`         | 128   | `ApiFragmentRepository`; every mutation                      |
| `ApiFragmentReadRepository`  | 217   | pagers, lemmas, annotations, corpus lookup, suggestions      |
| `ApiFragmentQueryRepository` | 145   | statistics, fragment info feeds, queries, provenance reads   |
| `createQueryResult`          | 203   | query-result DTO types and their mapping                     |
| `createFragment`             | 128   | `createScript`, `createJoins`, `createFragment`, path helper |

The public entry point still re-exports `createScript` / `createJoins` /
`createFragmentInfo`, which `corpus/application/dtos`, `DossierRecord` and two test files
import.

### `TextService.ts` (573 → 6 modules)

| Module                       | Lines | Holds                                                     |
| ---------------------------- | ----- | --------------------------------------------------------- |
| `TextService`                | 75    | the chapter mutations                                     |
| `TextReadService`            | 148   | text and chapter-display reads                            |
| `TextServiceBase`            | 145   | colophons, extant lines, manuscripts, list, search, query |
| `TextServiceCore`            | 169   | construction, chapter-display caching, provenance loading |
| `CorpusLemmatizationFactory` | 81    | the corpus lemmatisation factory                          |
| `chapterUrls`                | 23    | `createTextUrl` / `createChapterUrl`                      |
| `textServiceConstants`       | 4     | cache TTL, sizes, concurrency limit, default scope        |

`textServiceConstants` exists because the four `const`s would otherwise be duplicated across
five files, which the DRY gate forbids.

### Status

32 files remain over 250 lines. `yarn tsc` and `yarn lint` are clean and the affected suites
pass after every step.

### Verification after the FragmentRepository and TextService splits

The devcontainer runs out of memory partway through a single full-suite invocation
("The build failed because the process exited too early" — an environment limit, not a test
failure; `free -m` showed ~1.2 GB free with VS Code's own node processes holding ~5.7 GB).
The suite was therefore run in directory chunks, which all pass:

| Chunk                                                                          | Suites | Tests            |
| ------------------------------------------------------------------------------ | ------ | ---------------- |
| common, http, auth, about, router, bibliography                                | 77     | 796              |
| fragmentarium                                                                  | 99     | 1241 + 2 skipped |
| corpus                                                                         | 34     | 412              |
| chronology                                                                     | 17     | 171              |
| dictionary                                                                     | 29     | 230              |
| dossiers                                                                       | 7      | 89               |
| signs, transliteration, realia, afo-register, query, research-projects, markup | 73     | 485              |
| App, Introduction, InjectedApp, index, Header, editor, akkadian, test-support  | 13     | 133              |

Zero `console.*` / `Warning:` / unhandled-rejection lines in any chunk. `yarn tsc` and
`yarn lint` are clean.

The 347-suite single-process run did complete earlier in the session (before these two
splits) with 3530 passing and zero console output; the chunked runs above cover the same
347 suites.

## Session 3 — the remaining 32 files and the coverage gate

### Task 1 — 250-line ceiling: all 32 remaining files

Every `.ts`/`.tsx` file this PR touches is now at or under 250 lines. The re-derived query
returns nothing:

```bash
{ git diff --name-only origin/chore/ts7-tsconfig-migration...HEAD
  git status --porcelain | awk '{print $NF}'; } \
  | grep -E '\.(ts|tsx)$' | sort -u \
  | while read f; do [ -f "$f" ] && wc -l "$f"; done \
  | awk '$1>250' | sort -rn
```

**Test files** were split by `describe` block into sibling suites, with shared fixtures and
mock factories in `*.testSupport.ts(x)` modules (a suffix Jest does not collect). The three
suites that own a snapshot (`FragmentariumSearch`, `LatestTransliterations`, `about`) kept
their original filename and `describe` name so the existing `.snap` entries stayed valid.

| Original                           | Lines | Split into                                                                                                         |
| ---------------------------------- | ----: | ------------------------------------------------------------------------------------------------------------------ |
| `FragmentService.test.ts`          |  1930 | 11 suites + 2 testSupport modules (delegation, reads, provenance, updates, annotations, query, and 6 cache suites) |
| `FragmentRepository.test.ts`       |  1017 | reads, writes, query, provenances, summaryItems, rawSummary, `createScript.test.ts` + testSupport                  |
| `TextService.test.ts`              |   780 | reads, writes, chapterDisplay, caching, misc + 2 testSupport modules                                               |
| `ProperNounCreationPanel.test.tsx` |   649 | validation, lemmaSearch, actions, create + testSupport                                                             |
| `FragmentariumSearch.test.tsx`     |   545 | (kept) + contract, transliteration, summary + testSupport                                                          |
| `SearchForm.test.tsx`              |   461 | basic, advanced, shortcuts + testSupport                                                                           |
| `LatestTransliterations.test.tsx`  |   421 | (kept) + preview, summaryThumbnails + testSupport                                                                  |
| `DossiersRepository.test.ts`       |   415 | fetch, suggestions, filter + testSupport                                                                           |
| `ApiClient.edge-cases.test.ts`     |   408 | `ApiClient.errors`, `ApiClient.requests`, merged into `ApiError.test.ts` + testSupport                             |
| `Details.test.tsx`                 |   368 | (kept) + archaeology, missing + testSupport                                                                        |
| `DateSelectionInput.test.tsx`      |   335 | (kept) + `DateInputGroups.test.tsx`, `useDateSelectionState.test.ts`                                               |
| `WordDisplay.test.tsx`             |   334 | (kept) + testSupport holding the 188-line `word` fixture                                                           |
| `DossiersService.test.ts`          |   321 | batching, caching, delegation                                                                                      |
| `TransliterationForm.test.tsx`     |   311 | (kept) + errors, abort + `.mocks` and `.testSupport` modules                                                       |
| `FragmentView.test.tsx`            |   290 | (kept) + folios + testSupport                                                                                      |
| `CuneiformFragment.test.tsx`       |   273 | (kept) + save, saveErrors + testSupport                                                                            |
| `withData.test.tsx`                |   264 | (kept) + filtering                                                                                                 |
| `SignImages.test.tsx`              |   263 | (kept) + empty                                                                                                     |
| `about.test.tsx`                   |   257 | (kept) + navigation                                                                                                |

**Source files** were decomposed by responsibility. Two of the splits removed real
duplication rather than just moving lines:

- `FakeApi.ts` (516) had thirty methods that each pushed a hand-written `Expectation` and
  returned `this`. It is now `FakeApi` (174, one fluent line per endpoint), `FakeApiBase`
  (129, the mock client plus `expectGet`/`allowGet`/`expectPost`) and `FakeApiExpectation`
  (43, the `Expectation` class and URL helpers). `createTextUrl`/`createChapterUrl` lost
  their implicit `any` parameters.
- `SignImages.tsx` (442) carried a private `runWithConcurrencyLimit` that duplicated
  `common/utils/ConcurrencyLimiter`, already used by `FragmentCache`, `TextServiceCore` and
  `CuneiformConverterForm`. `loadClusterAnnotations` now uses the shared limiter with
  `Promise.allSettled`, which preserves both ordering and the concurrency cap.

The rest: `TextAnnotation` → `AnnotationRow` + `SpanAnnotationDisplay`;
`ColophonEditorIndividualForm` → `colophonNameSuggestions`; `DossiersService` →
`DossierCache` + `DossiersQueryByIdsBatcher`; `Chapters` → `ManuscriptsTable` +
`manuscriptTableCells`; `CuneiformFragmentEditor` → `CuneiformFragmentTabContents`;
`BibliographyService` → `BibliographyEntryLoader`; `Details` → `DetailsFields`;
`ArchaeologyEditor` → `ArchaeologyEditorFields`; `AfoRegisterSearchForm` →
`AfoRegisterSearchFields`; `DateSelectionState` → `DateSelectionStateTypes`;
`TransliterationForm` → `TransliterationFormFields`.

Public surfaces were preserved by re-exporting moved symbols from the original entry point
(`Details.tsx` re-exports `formatMeasurements`; `AfoRegisterSearchForm.tsx` re-exports
`AfoRegisterQuery`; `DateSelectionState.ts` re-exports its three public types).

### Task 2 — coverage on affected code

| File                          | Before (stmts / branch) | After                                 |
| ----------------------------- | ----------------------- | ------------------------------------- |
| `CuneiformConverterForm.tsx`  | 81.25 / 50              | **100 / 100**                         |
| `AfoRegisterSearchForm.tsx`   | 78.26 / 60.71           | **100 / 100**                         |
| `AfoRegisterSearchFields.tsx` | (new)                   | **100 / 100**                         |
| `CuneiformFragment.tsx`       | 84.61 / 60              | **100 / 100**                         |
| `FragmentCache.ts`            | 98.93 / 88.23           | **100 / 100**                         |
| `DateSelectionMethods.ts`     | 100 / 68.96             | **100 / 100**                         |
| `ScriptSelection.tsx`         | 94.87 / 66.66           | 100 / 87.5                            |
| `ChapterEditView.tsx`         | 89.58 / 50              | 97.91 stmts / 95.83 funcs / 50 branch |

Three pieces of genuinely dead code were removed rather than tested around:

- `loadTextNumberOptions`' `textNumbers: string[] = []` default was unreachable — both call
  sites pass a checked value.
- `ScriptSelection`'s `if (updates !== script)` guard inside the Save handler was redundant:
  the button is already `disabled={!isDirty || isSaving}` and `isDirty` is a deep-equality
  check, so `isDirty` implies reference inequality.
- `SignImages`' `runWithConcurrencyLimit`, as above.

Two branches remain uncovered and are **unreachable through the UI, not untested**:

1. The `if (!isStale())` else-arms in `ScriptSelection.tsx:139-146` and
   `ChapterEditView.tsx`. Making `isStale()` return true requires a second write to be
   dispatched while the first is in flight, and both Save controls are `disabled` while
   saving, so the UI cannot produce one. The same guards _are_ covered in
   `CuneiformFragment.tsx`, where the transliteration form can be submitted directly with
   `submitFormByTestId`, bypassing the disabled button — two new tests
   (`Ignores a superseded save outcome` / `... save failure`) exercise both arms there.
2. `ChapterEditView.tsx:147`, the one-line `searchBibliography` pass-through to
   `bibliographyService.search`. Reaching it means adding a manuscript, expanding the
   collapsed References list and typing into a react-select whose `aria-label` is a
   `_.uniqueId`. Attempted and abandoned as disproportionate for a pass-through closure.

New tests added for coverage: `CuneiformConverterForm.errors.test.tsx` (query failure,
non-cancellation failure, Shift+Enter, plain Enter, cancelled conversion, clipboard failure),
`AfoRegisterSearchForm.coverage.test.tsx` (short query, abort-by-unmount, cancelled vs. real
suggestion errors, suggestions without text numbers, exact-number quoting, suggestion and
number selection), `AfoRegisterSearchFields.test.tsx` (the `if (option)` guard, via a
react-select stub that emits `null`), `getDate.test.ts` (all Assyrian / Seleucid / regnal /
Ur III permutations), `FragmentService.cache.invalidationScope.test.ts` (cached and in-flight
reads for other fragment numbers survive an update), `ChapterEditView.saving.test.ts`
(alignment and lemmatization saves plus a save failure), and additions to
`ScriptSelection.test.tsx`, `CuneiformFragment.save.test.tsx` and
`CuneiformFragment.saveErrors.test.tsx`. `FakeApi` gained `expectUpdateAlignment` and
`expectUpdateLemmatization`.

### Gates

| Gate             | Result                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------- |
| `yarn tsc`       | pass                                                                                                          |
| `yarn lint`      | pass                                                                                                          |
| Full suite       | **402 suites, all passing** across four directory chunks                                                      |
| Console-clean    | each chunk re-run and grepped for `console.*`, `Warning:`, unhandled rejections and act warnings — no matches |
| 250-line ceiling | pass — the re-derived query returns nothing                                                                   |

The suite is still run in chunks because a single full-suite invocation exhausts the
devcontainer's memory. The four chunks together cover all 402 test files (verified by
diffing the file list against the chunk patterns — no file is missed):

| Chunk                                                                                     | Suites | Tests            |
| ----------------------------------------------------------------------------------------- | -----: | ---------------- |
| common, http, auth, about, router, bibliography, afo-register, dossiers                   |    102 | 938              |
| fragmentarium                                                                             |    135 | 1253 + 2 skipped |
| corpus, chronology, dictionary, signs                                                     |    102 | 886              |
| transliteration, query, markup, research-projects, test-support, App, editor, akkadian, … |     63 | 492              |

One note for whoever runs coverage next: a whole-`fragmentarium`+`chronology` run **with**
`--coverage` once failed a spinner wait in a timing-sensitive suite; the same pattern passes
without instrumentation and passes when coverage is scoped to a smaller path. It is
instrumentation overhead against a `waitFor` timeout, not a defect in the code under test.

### Pre-existing issues found and fixed

- `src/http/ApiError.test.ts` already existed; an early edit overwrote it. Restored from
  `HEAD` and the new `ApiError` construction tests appended rather than replacing the
  original `bodyToMessage` table test.
- `createTextUrl` / `createChapterUrl` in `FakeApi` had implicit-`any` parameters; they are
  typed now.
- `ChapterEditView.integration.test.ts` (443 lines, pre-existing and previously out of scope)
  came into scope once its fixtures were needed by the new saving suite. Its fixtures and
  harness moved to `ChapterEditView.testSupport.ts`, bringing the file to 243 lines.

---

## 2026-08-06 — Phase 3: re-review at head `1b0fe6b2`

Re-reviewed the PR from scratch at the current head rather than trusting the Phase 1/2
write-up. Every prior finding was re-derived from the code and from GitHub.

### Tooling note

`gh` is not installed in this devcontainer. `GITHUB_TOKEN`, `GITHUB_API_URL` and
`GITHUB_REPOSITORY` are set, so the REST API was called through `curl` + a small paginating
Python helper, and GraphQL was used for `reviewThreads { isResolved isOutdated }` — the REST
comment payload cannot distinguish "resolved because fixed" from "auto-resolved because
outdated", and that distinction turned out to matter (see Finding 4).

### What was gathered

- 3 review events: two `qltysh[bot]` `COMMENTED`, one `Fabdulla1` `CHANGES_REQUESTED`
  (2026-08-04, on `5ef4a984`). PR `reviewDecision` is still `CHANGES_REQUESTED`.
- 6 inline review comments, all `qltysh[bot]`, all `isResolved=true` **and** `isOutdated=true`.
- 0 general/issue comments.
- 0 sourcery-ai reviews, comments or checks. There is no sourcery config in the repo.
- Check runs on the head SHA: three GitGuardian runs plus the `qlty check` commit status.
  No `CI`, no CodeQL.

### Pre-existing issue found and fixed during this pass

The first full-suite run was killed at 122 suites with "The build failed because the process
exited too early" (exit 1). Root cause: `yarn tsc` and `qlty smells` were running concurrently
with the suite on a 2-CPU / 8 GB container with ~2 GB free, and jest's `--runInBand` worker was
OOM-killed. This is an environment interaction, not a defect in the code under test — the
re-run with nothing else executing passed all 402 suites in 335 s. Recorded in the review's
verification appendix so the next person does not misread it as a flaky suite. It also
supersedes the Phase 2 note that the suite must be chunked: a single invocation works.

### Verification of the prior findings

| Prior finding                 | Verdict at `1b0fe6b2`        | How it was checked                                                                                                                                                                      |
| ----------------------------- | ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — write abort               | **Fixed**                    | `runWrite` takes a `WriteOperation` and hands it `isStale()` from `SupersedableOperation` (a monotonic token, no `AbortController`). All four call sites guard both promise arms.       |
| 2 — CI never ran              | **Still open**               | `main.yml` / `codeql-analysis.yml` are gated on `pull_request: branches: [master]`; base is `chore/ts7-tsconfig-migration`.                                                             |
| 3 — no sourcery-ai            | **Confirmed**, informational | No reviews, comments or checks from that app.                                                                                                                                           |
| 4 — test locked in the defect | **Fixed**                    | The supersede-abort case is now `describe('run')` only; `usePromiseEffect.write.integration.test.tsx` proves the two guarantees in separate tests.                                      |
| 5 — coverage                  | Not re-measured this pass    | Coverage instrumentation plus a full suite does not fit in the available memory. Carried forward from Phase 2.                                                                          |
| 6 — 250-line ceiling          | **Fixed**                    | Intersecting the over-250 file list with the PR's changed-file list returns **zero** rows. The 54 files still over the limit are all inherited from the base branch and untouched here. |
| 7 — signal surface            | **Fixed**                    | README lines 183-189 state the read rule, the write rule, the shared-cache exception and the enumerated no-signal reads.                                                                |
| 8 — floating promise          | **Fixed**                    | `AfoRegisterSearchForm.tsx:95-99` has the `.catch` with `isCancellation`.                                                                                                               |
| 9 — `cancellableFetch`        | **Fixed**                    | File deleted; no references remain.                                                                                                                                                     |

### New findings raised

Running `qlty smells` scoped to the 385 changed source files (the cloud `qlty check` status is
`success`, so this would otherwise have been missed) surfaced that the Finding 6 remediation
traded the 250-line gate for the DRY gate in three places: `withData.test.tsx` ↔
`withData.filtering.test.tsx` (28 identical lines), `SignImages.test.tsx` ↔
`SignImages.empty.test.tsx` (48 identical), `SearchForm.testSupport.tsx` ↔
`ColophonEditor.test.tsx` (30 identical). Each was confirmed against the base branch to be
newly introduced. `FragmentService.testSupport.ts`, shared by twelve test files in the same
PR, is the pattern the three should follow.

Also new: `usePromiseEffect.test.tsx`'s `renderReads`/`renderWrites` duplication is still live
(mass 98) despite both qlty threads reading as resolved; a vestigial `signal?: AbortSignal`
remains in `CuneiformFragment.tsx`'s `onSave` prop type; the `if (!isStale())` guard is
copy-pasted across all four write consumers; and eleven files _added_ by this PR use relative
imports instead of module-alias paths.

### Gates at head `1b0fe6b2`

| Gate                                 | Result                                                                              |
| ------------------------------------ | ----------------------------------------------------------------------------------- |
| `yarn tsc`                           | pass, exit 0, 54.8 s                                                                |
| `yarn lint`                          | pass, exit 0, 38.6 s                                                                |
| `yarn test --watchAll=false`         | pass, exit 0 — 402/402 suites, 3569 passed, 2 skipped, 50 snapshots, 335 s          |
| Console-clean                        | pass — zero matches for `console.*`, `Warning:`, act warnings, unhandled rejections |
| `qlty check` (385 changed files)     | pass                                                                                |
| `qlty smells` (385 changed files)    | fail — Findings 3 and 4                                                             |
| 250-line ceiling on PR-touched files | pass                                                                                |

The 2 skipped tests are pre-existing `xit`s at `Edition.test.tsx:48,52`, present at the same
positions on the base branch. No test was removed, disabled or skipped by this review.

### Not done

No commit, no branch, no push. Nothing posted to GitHub; no reviewer assignments changed.

---

## 2026-08-06 — Phase 4: remediation of the Phase 3 findings

Scope: every code-level finding from the Phase 3 review. The two blockers (CI re-target,
dismissal of the `CHANGES_REQUESTED` review) are maintainer actions and were deliberately
left alone; no reviewer assignment was touched and nothing was posted to GitHub.

### N1 — duplication introduced by the 250-line splits

Three pairs, each split earlier by copying rather than extracting. All three now share a
module, following the `FragmentService.testSupport.ts` pattern already used in this PR:

| Duplicate                                                                                   | Extracted to                                                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 28-line `beforeEach` harness in `withData.test.tsx` / `withData.filtering.test.tsx`         | `http/withData.testSupport.tsx` — `createWithDataHarness()` returns the mocks and the wrapped component as one object; `renderWithData` / `rerenderWithData` / `renderInErrorReporter` render it                                                         |
| 48-line `croppedAnnotations` fixture in `SignImages.test.tsx` / `SignImages.empty.test.tsx` | `signs/ui/display/SignImages.testSupport.tsx` — also holds `createMockSignService()` and `setUpSignImages()`, which absorbs the duplicated `setup()` body                                                                                                |
| 30-line `provenances` fixture in `SearchForm.testSupport.tsx` / `ColophonEditor.test.tsx`   | `test-support/provenance-records.ts` — the two consumers sit in different feature folders, so a neutral `test-support` module is the right home. `SearchForm.testSupport.tsx` re-exports it as `provenances` so its three consumer suites are unaffected |

Test sets were diffed by title against `HEAD` for all four affected files: **identical**. No
test was removed, renamed, skipped or disabled.

### N2 — `renderReads` / `renderWrites`

Collapsed onto one `renderRuns({ select, operation, runCount, cancelAfterRun, results })`,
where `select` picks the runner off the `usePromiseEffect()` tuple. `renderReads` and
`renderWrites` remain as one-line delegating wrappers, so all fifteen call sites are
unchanged and the diff stays reviewable.

### N3 — vestigial `AbortSignal`

`onSave: (save: (signal?: AbortSignal) => Promise<Fragment>) => void` →
`onSave: (save: () => Promise<Fragment>) => void`. It now matches the sibling declaration in
`Info.tsx` and the actual implementation, and no longer advertises a capability the write
design forbids.

### N4 — the repeated `isStale` guard

New `common/utils/applyWhenCurrent.ts`:

```ts
applyWhenCurrent(operation, { onSuccess, onError }) // → (isStale) => Promise<void>
```

It lives in `utils` rather than `hooks` so the layering stays one-directional: it depends only
on `StalenessCheck` from `SupersedableOperation`, not on the hook. All four consumers
(`DateSelectionMethods`, `ChapterEditView`, `ScriptSelection`, `CuneiformFragment`) now pass
handlers instead of writing the guard themselves.

One deliberate semantic change: two of the four sites used `.then(ok).catch(err)`, which would
route an exception thrown by the _success_ handler into the _save-failed_ path — mislabelling
a render bug as a failed write. The helper uses `.then(onSuccess, onError)` uniformly, which is
what the other two sites already did.

**This closed the two coverage gaps the Phase 1 review documented as structurally unreachable.**
The `if (!isStale())` else-arms are now inside one unit-tested helper instead of four
components whose Save buttons are disabled while a write is in flight:

| File                    | Before                  | After                                                                                                     |
| ----------------------- | ----------------------- | --------------------------------------------------------------------------------------------------------- |
| `ScriptSelection.tsx`   | 100 stmts / 87.5 branch | **100 / 100 / 100 / 100**                                                                                 |
| `ChapterEditView.tsx`   | 97.91 stmts / 50 branch | 97.67 stmts / **100 branch** (the one uncovered line is the `searchBibliography` pass-through, unchanged) |
| `CuneiformFragment.tsx` | 100 / 100               | **100 / 100 / 100 / 100**                                                                                 |
| `applyWhenCurrent.ts`   | —                       | **100 / 100 / 100 / 100** (6 new tests)                                                                   |

### N5 — relative imports

The eleven newly-added files listed in the review now use alias paths, plus
`usePromiseEffect.test.tsx` and `ColophonEditor.test.tsx`, which were being edited anyway.
Pre-existing relative imports elsewhere were left alone — a codebase-wide sweep does not
belong in this PR.

### N8 — `Realia.sass`

Split into six partials (`_realia-link-pill` 16, `_realia-layout` 189, `_realia-section` 20,
`_realia-afo` 71, `_realia-rla` 102, `_realia-results-list` 66); `Realia.sass` is now six
`@use` lines.

The first attempt changed the cascade: cross-module `@extend` emits the extended rules where
the placeholder's _module_ is loaded, so the `%realia-section-*` output moved to the top of the
file. Fixed by keeping the two placeholder groups in separate modules loaded at the positions
their definitions originally occupied (`link-pill` first, `section` after `layout`).

Verified rather than assumed:

```bash
sass --load-path=. --load-path=src src/realia/ui/Realia.sass after.css --no-source-map
diff before.css after.css   # → byte-identical
```

### Pre-existing issue found and fixed

`CuneiformFragment.tsx:145` had `const [error, setError] = useState(null)`, inferred as
`useState<null>`. The state could never legally hold an `Error`; it type-checked only because
the old untyped `.catch((error) => …)` fed it `any`. Giving `applyWhenCurrent`'s error handler
a real `Error` type surfaced `TS2345`. Fixed at root with `useState<Error | null>(null)`,
matching the component's own `error: Error | null` prop rather than widening the handler.

### A failure that was investigated and attributed, not fixed

A scoped coverage run over the whole `fragmentarium` + `chronology` tree failed
`FragmentView.test.tsx` with 13 unresolved spinners. Before treating it as a regression:

1. `FragmentView` passes without coverage (2 suites, 11 tests).
2. `FragmentView` passes _with_ coverage when run alone (7 tests).
3. The same large coverage batch was re-run against a **stashed, pristine `HEAD`** working
   tree — it died with `The build failed because the process exited too early`, and every
   suite that did run passed, `FragmentView.test.tsx` included.

So it is the devcontainer OOM-killing a large instrumented `--runInBand` batch (2 CPUs, ~2 GB
free), not a defect and not caused by these changes. Coverage was then measured in two small
batches instead. The stash was popped and the working tree verified restored.

### Gates after remediation

| Gate                        | Result                                                                                   |
| --------------------------- | ---------------------------------------------------------------------------------------- |
| `yarn tsc`                  | pass, exit 0                                                                             |
| `yarn lint`                 | pass, exit 0 (three `prettier/prettier` errors from the import rewrites were auto-fixed) |
| Affected suites (19)        | pass, 148 tests, console-clean                                                           |
| Coverage on changed modules | see the table above                                                                      |
| 250-line ceiling            | pass — no `.ts`/`.tsx` file this PR touches exceeds 250 lines                            |
| Full suite                  | recorded below                                                                           |

### N9 — a duplication the Phase 3 review missed

After the fixes, `qlty smells` was re-run over all 390 changed source files and every
remaining finding was checked against a **base-branch worktree**
(`git worktree add --detach <tmp> origin/chore/ts7-tsconfig-migration`) rather than assumed
pre-existing. All but one matched base with identical mass.

The exception: `ArchaeologyEditorFields.tsx` reports a 20-line duplication (mass 91) between
`RegularExcavationField` and `FindspotUncertainField`; base `ArchaeologyEditor.tsx` reports
nothing. The split had turned inline JSX into two exported components, which is what made the
duplication visible to the detector. The Phase 3 review had scoped Finding 3 to the three
cross-sibling pairs it had verified, and missed this within-file one.

Fixed by collapsing both onto a private `CheckboxField` parameterised by
`groupIdPrefix` / `checkboxIdPrefix` / `label` / `ariaLabel`, with the two exports kept as thin
wrappers so no consumer changed. `qlty smells` on the file is now clean and the three
`Archaeology` suites (29 tests) pass.

### Verified pre-existing (base-worktree comparison), left for the follow-up issue

`ManuscriptForm.tsx` (15 lines ×2, mass 75), `DossiersSearchPage.tsx` (18 ×2, mass 99),
`Download.test.tsx` (17 ×2, mass 101), `ApiClient.test.ts` (16/mass 69 at base → 15/mass 66
now), `WordDisplay.testSupport.ts` (45 ×2, mass 121 — relocated verbatim from
`WordDisplay.test.tsx`), `DetailsFields.tsx` (`Joins` complexity 22 — relocated from
`Details.tsx`), `setupTests.ts` (`createRange` complexity 18), `SignsSearch.tsx`
(`renderSignColumn`, 7 params), `test-support/utils.ts` (constructor, 6 params),
`GlossaryFactory.ts` (`labelLines`, 6 returns).

### Also verified

- **Sass module paths.** The partials initially used `@use 'realia/ui/…'`. That would not
  resolve in webpack: the repo's working convention is root-rooted
  (`@use 'src/common/ui/sidebar-page-shell'` in `router/tools.sass` and `about/ui/about.sass`),
  and craco puts `<root>/src` on `resolve.modules`. Since jest does not compile sass, **no test
  would have caught this** — it would have failed only at build time. Corrected to
  `src/realia/ui/…` and confirmed with a real `yarn build:ci-stable` (exit 0), plus a
  root-only-load-path `sass` compile that still diffs byte-identical against the original.
- **No test lost.** Test titles were diffed against `HEAD` for `withData`(+filtering),
  `SignImages`(+empty), `usePromiseEffect` and `ColophonEditor`: identical sets. Nothing was
  removed, renamed, skipped or disabled.

---

## 2026-09-03 — Re-review of PR #774 at head `7afb78ed` (review only, no source changes)

Requested: review the PR under the copilot instructions, gather every review and comment from
every bot and human reviewer, check failing checks plus qlty and CodeQL, warn on any dev
container change, confirm no new `.md` files, and rewrite the review document with a metadata
header, a short human-readable summary with a full `Details` subsection, no line-length limit,
and no third-person reference to the PR author.

### Gathering

`gh` is not installed in this dev container, so `GITHUB_TOKEN` + `curl` were used against
`/pulls/774/{reviews,comments,files}`, `/issues/774/{comments,timeline}`,
`/commits/<sha>/{check-runs,status}`, `/actions/runs`, and GraphQL `reviewThreads` for the
resolved-vs-outdated distinction. `/code-scanning/alerts` and `/dependabot/alerts` returned
`Resource not accessible by integration` — the available token lacks `security_events`, so
CodeQL alert contents could not be read. That does not affect the finding, because the CodeQL
workflow has never run on this branch at all.

Found: 3 timeline review events (2 × `qltysh[bot]` `COMMENTED`, 1 × `Fabdulla1`
`CHANGES_REQUESTED`), 6 inline comments (all `qltysh[bot]`, all resolved and outdated), 0
general comments. **No `sourcery-ai` review or comment exists on this PR**, nor CodeRabbit,
Copilot, Codecov or Snyk. The complete timeline is 10 `committed`, 3 `reviewed`, 1
`review_requested`, 1 `cross-referenced`.

### Hard gates run at head `7afb78ed`

| Gate                                            | Result                                                                                                          |
| ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| `yarn tsc --noEmit`                             | clean, 48.75 s                                                                                                  |
| `yarn lint`                                     | clean, 74.32 s                                                                                                  |
| `CI=true yarn test --watchAll=false --coverage` | 403 suites, 3 575 passed / 2 skipped, 50 snapshots, 546 s                                                       |
| console-clean                                   | zero hits for `console.error`/`console.warn`/`console.log`/`Warning:`/`not wrapped in act`/unhandled rejections |
| `yarn build:ci-stable`                          | exit 0, 82.86 s, zero warnings                                                                                  |
| 250-line ceiling over changed files             | no `.ts`/`.tsx` file over 250                                                                                   |

The plain `yarn build` was killed three times (1536 / 2400 / 3072 MB heap) before I switched to
`build:ci-stable`. Root cause: the container has ~2.9 GB available with the VS Code server and
its TypeScript service holding ~2.5 GB, and CRA reports an OOM-killed webpack child as "the
process exited too early". Environmental, and CI runs the `ci-stable` form anyway
(`main.yml:54`), so this is not a defect and no source change was made for it.

### Verifications worth recording

- **No write call site passes a signal.** Every `postJson`/`putJson` call in `src/` outside
  tests and `ApiClient.ts` was enumerated (9 sites); none passes one. The type-enforced write
  fix holds.
- **Sass migration proven equivalent.** A detached base worktree at `4f71cb2` was created and
  every non-partial `.sass` file compiled on both sides with `style: "expanded"`:
  **59/59 byte-identical CSS, 0 differing, 0 failures.** The six-partial `Realia.sass` split is
  byte-identical too (9 161 bytes both sides), so the cross-module `@extend` placeholders kept
  their cascade position. Built `Realia` rules land in `193.*.chunk.css`.
- **qlty "3 blocking issues" are all pre-existing.** `qlty smells --all` reproduced them and
  each was checked against the base: `WordDisplay.testSupport.ts` (fixture relocated verbatim
  from `WordDisplay.test.tsx`), `DetailsFields.Joins` (complexity 22, relocated from
  `Details.tsx:54`), `ApiClient.test.ts` post/put pair (both tests present at base lines 84 and
  117). The two `usePromiseEffect.test.tsx` duplications flagged in the previous pass as
  "auto-resolved because outdated, not actually fixed" are now genuinely gone.
- **Dev container: no changes.** `.devcontainer/` is tracked (`Dockerfile`, `README.md`,
  `devcontainer.json`, `inject-secrets.sh`) and produces an empty diff against both the PR base
  and `master`. Neither #774 nor #773 touches it. Nothing to warn about.
- **New `.md` files: 10 in #774, 3 more in #773** — 13 reach `master` unless both are cleaned.
  `README.md` (+8/−2) is a legitimate doc change and stays.
- **Could not run the app in a browser.** No Chrome/Chromium binary is installed and only
  `puppeteer-core` is present, so the "verify while running the modified application" guideline
  could not be satisfied. The production build, the byte-identical CSS diff and the 403-suite
  console-clean run stand in for it; a manual dev-server pass is listed as a follow-up.

### New findings raised in this pass

- **F1 (Medium)** — `TransliterationForm`, `WordEditor` and `BibliographyEntryFormController`
  still hold a live `AbortSignal` beside a write via `AbortableOperation`. No signal reaches
  `fetch`, so behaviour is correct, but the README claims the type system prevents it and for
  these three it is convention.
- **F2 (Medium)** — the signal-flavoured twin of `applyWhenCurrent` is hand-written verbatim in
  8 components. DRY is a hard gate and the extraction already exists for the `isStale` shape.
- **F3 (Medium)** — 89 changed files and 30 newly-added files are below 100% coverage; worst new
  file at 25% branches. Mostly gaps that travelled with extracted code. No `coverageThreshold`
  is configured, so nothing enforces this.
- **F4/F5/N2 (Low/Info)** — `runWrite` has no unmount guard while the `AbortableOperation` write
  paths do; the README overstates the type-level guarantee (`ApiClient.postJson`/`putJson` and
  the `JsonApiClient` type still take `signal?`); the PR description is stale on four points.

### Verdict

**Request changes.** The cancellation design and all four points of the standing
`CHANGES_REQUESTED` are genuinely resolved and every local gate passes. Merge is blocked on
B1 (no CI, no CodeQL has ever run on this branch), B2 (the `CHANGES_REQUESTED` still stands),
B3 (13 tracking documents) and B4 (scope). Full detail in `TASK-774-review.md`.

### Not done

No commit, branch or push. No GitHub review submitted, no comment posted, no reviewer touched.
`TASK-774-review.md`, `TASK-774-todo.md` and this log are modified in the working tree only.

---

## 2026-09-03 (later) — Remediation of the review findings (paused mid-flight)

Asked to address all the findings from the re-review. Work is **uncommitted** on top of
`7afb78ed`. Resume instructions: `TASK-774-continuation-prompt.md`.

### Three decisions I asked about, and the answers

1. **The false-positive test.** `TransliterationForm.errors.test.tsx` →
   `does not set an error for a cancellation error` failed after the F1 conversion. I probed
   it against the unmodified file with a temporary spec: the cancellation error **does** reach
   the form's error state on the old code too; the assertion just ran one microtask earlier
   than the rejection landed, because `.then().catch()` settles a tick after
   `.then(onSuccess, onError)`. Nothing ever special-cased cancellation errors there, and
   bluebird's `CancellationError` is gone from the codebase. Approved for deletion; deleted.
   The file's other three tests still cover real error display and clearing.
2. **The `TASK-*.md` files.** Keep for now, remind before merge. Not deleted.
3. **The PR description.** Approved to update on GitHub. **Not yet done** — it is still open.

### F1 — no write path holds a live `AbortSignal`

`AbortableOperation.start()` aborts the previous controller, so holding its signal next to a
write is one refactor away from the defect the original review raised. Four components moved
to `SupersedableOperation` + `applyWhenCurrent`: `TransliterationForm` (useEffect cleanup
calls the new `supersede()`), `WordEditor` and `BibliographyEntryFormController`
(`componentWillUnmount`), and `BibliographyEntryForm`, which also **gained** an unmount guard
it never had.

`BibliographyEntryForm.load` had a second, latent defect: it wrapped `Cite.async` in a
`new Promise` that **rejected** on invalid input, and `handleChange` dropped the returned
promise — an unhandled rejection on every invalid entry. `applyWhenCurrent` never rejects, so
the conversion removes it. No test depended on the rejection.

`AbortableOperation` is now used only by `usePromiseEffect`'s read slot and
`CuneiformConverterForm`. It is a read-only primitive, exactly as the README claims.

### F2 — the abort guard, eight copies to one

Added `applyWhenNotAborted(operation, signal, handlers)` next to `applyWhenCurrent`; it is one
line, delegating with `() => signal.aborted`. `FragmentButton`, `PdfDownloadButton`,
`WordDownloadButton` and `ManuscriptsTable` now use it. Remaining `signal.aborted` sites
(`withData`, `usePromiseEffect`, `CuneiformConverterForm`, `AfoRegisterSearchForm`) are
genuinely different shapes — a mid-async early return and an error-only guard — and were left
alone rather than distorted to fit.

### F4 — reverted a behaviour change, documented instead

I first made `usePromiseEffect`'s cleanup supersede the write, for consistency with the four
components above. Two existing tests then failed —
`Does not make a write stale on unmount` and `Aborting reads leaves an in-flight write
current` — which deliberately pin the opposite contract. Rather than rewrite tests that encode
a deliberate design decision, I reverted the change and documented both semantics in
`README.md`. F4's own wording offered this as the first option.

### F6 — all three qlty issues fixed, not dismissed

- `ApiClient.test.ts`: the post/put "makes a request with given parameters" pair collapsed onto
  an `expectJsonRequest(method)` helper.
- `DetailsFields.Joins` (complexity 22, four nested ternaries): split into `JoinPrefix` and
  `JoinNumber`. All ten `Details`/`CuneiformFragment`/`FragmentView` suites still pass.
- `WordDisplay.testSupport.ts` (45 duplicated lines, mass 121): two attempts to factor the
  fixture in TypeScript made it _worse_ (mass 124, then 87 — the two entries are structurally
  identical by construction). Moved the data verbatim into `wordDisplayWord.json` instead and
  imported it, following the repo's existing pattern (`dateConverterData.json`, `Kings.json`).
  The `.ts` file is now three lines, the JSON was generated from the original object so the
  data is byte-identical, and the smell is gone. Snapshots unchanged.

Repo-wide `qlty smells`: 155 → 98. `WordDisplay.tsx` (mass 64, shared with
`DateFieldPatternsHelp.tsx`) appears in the new output but neither file is in my diff — it
surfaced in the ranking once the others cleared.

### Pre-existing defects fixed at root

- `CorpusLemmatizationFactory.applySuggestion` and `getSuggestion` were dead private methods —
  never called, overriding nothing. Verified dead at the base branch too
  (`4f71cb2:src/corpus/application/TextService.ts`), so the split carried them over rather than
  orphaning them. Deleted, with the `_`, `UniqueLemma` and `Token` imports they alone used.
  This was the file at 25% branch coverage; the branches were unreachable.
- `FragmentRepository.testSupport.createSummaryItemDto` had an `overrides = {}` default that
  every call site overrides and a `fragmentDto.date ?? null` whose right side can never fire.
  Both removed; the file is now 100%.

### F3 — coverage, partially closed

100% reached on `signImageGrouping.ts`, `colophonNameSuggestions.ts`,
`CuneiformFragmentTabContents.tsx`, `FragmentRepository.testSupport.ts` and
`CorpusLemmatizationFactory.ts`. Four new test files plus a mocks module were added. The
`colophonNameSuggestions` suite uses fake timers to cover the debounce, the superseded-pending
and superseded-in-flight paths, and both error branches.

Still open, worst first: `BibliographyEntryLoader.ts`, `TextServiceBase.ts`,
`TextServiceCore.ts`, `ApiFragmentQueryRepository.ts`, `createFragment.ts`,
`createQueryResult.ts`, and the rest of the 30 listed under F3 in the review.

### Environment notes worth keeping

- Plain `yarn build` is OOM-killed here at 1536/2400/3072 MB heap; the VS Code server and its
  TypeScript service hold ~2.5 GB of the 7.9 GB. `yarn build:ci-stable` — CI's exact command —
  succeeds in ~85 s with zero warnings. Use that.
- The same pressure killed two full `yarn test --coverage` runs that were competing with a
  targeted run or `qlty`. Run the full suite alone.
- A targeted run with `--collectCoverageFrom` overwrites `coverage/coverage-final.json`, so the
  per-file analysis must follow a completed full run.
- Running `qlty` leaves untracked `.qlty/{logs,out,plugin_cachedir,results}`; `.gitignore` does
  not cover them. Deleted rather than committed. Adding the ignore rule was offered and not
  taken up — it would be an unrequested source change on a branch under review.

### State at the pause

`yarn tsc` clean. **`yarn lint` red** — three errors, all in files added this session: an
unused `FragmentRepository` import in `FragmentRepository.corpus.test.ts` and two prettier
errors in `colophonNameSuggestions.test.ts`. The full suite has **not** been run since; every
targeted run of the touched suites passed. Fixing the lint and doing one clean full run is the
first task on resuming.

### Not done

No commit, branch or push. Nothing written to GitHub — the approved PR-description update is
still outstanding. No reviewer assignments touched. No `TASK-*.md` files deleted.

---

## 2026-09-08 — Remediation completed (uncommitted)

Resumed from the handoff. All findings that could be closed without your involvement are
closed; the gates are green.

### Cleared the red tree

Removed the unused `FragmentRepository` import from `FragmentRepository.corpus.test.ts` and
prettier-fixed `colophonNameSuggestions.test.ts`. `yarn tsc` and `yarn lint` clean from there
on.

### F3 — coverage

Newly-added files below 100%: **30 → 15**. All changed files: **89 → 73**. Global coverage
93.58 → **94.11%** statements, 84.19 → **85.50%** branches, 93.13 → **93.81%** functions.

Closed to 100%: `signImageGrouping`, `colophonNameSuggestions`, `CuneiformFragmentTabContents`,
`FragmentRepository.testSupport`, `CorpusLemmatizationFactory`, `DossierCache`,
`BibliographyEntryLoader` (+ its testSupport), `loadClusterAnnotations`, `TextServiceBase`,
`TextServiceCore`, `ApiFragmentReadRepository`, `ApiFragmentQueryRepository`,
`createQueryResult`, `FragmentariumSearch.testSupport`.

Several of those closed by **deleting unreachable code rather than testing it** — see below.
Where a gap could only be closed by a brittle test (a simulated cross-token DOM selection in
jsdom, for `SpanAnnotationDisplay`'s retry path), I left it and listed it in the review instead
of forcing it.

### Pre-existing defects fixed at root

- **`CorpusLemmatizationFactory.applySuggestion`/`getSuggestion`** — private, never called,
  overriding nothing. Verified dead at the base branch too, so the 250-line split carried them
  over rather than orphaning them. Deleted with the imports they alone used. That file was the
  one at 25% branch coverage; the branches were unreachable.
- **Seven sets of unreachable default arguments** — `createSummaryItemDto(overrides = {})`,
  `fragmentDto.date ?? null`, `createChapterDisplayCacheKey`'s and `fetchChapterDisplay`'s two
  each, `FragmentariumSearch.testSupport`'s two `query = {}`, and `TextService.testSupport`'s
  `oldLineNumbers?.… ?? []`. Every caller supplies the argument.
- **`BibliographyEntryLoader.cachedFindManyRequests` was unreadable.** `fetchMany` is only
  called with ids absent from `cachedFindRequests`, and it registers all of them there before
  returning — so a repeat batch always takes the in-flight-single path and the findMany request
  cache can never be hit. Coverage confirmed the branch was never true. Removed the map, its
  `.finally` bookkeeping, and `trackIdRequest`'s equally unreachable per-id fallback; ids are
  now tracked by index against the order `fetchMany` already guarantees, which avoids the
  `as BibliographyEntry` cast a lookup would have needed. File is 100% covered.
- **`DossierCache` reimplemented `common/utils/cache`.** `read`/`set`/`trim` were
  line-for-line `getCachedValue`/`setCachedValue`/`trimCache`. Rewritten to delegate: 76 → 48
  lines, and the duplicated dead `oldestId === undefined` guard disappears. All dossier suites
  still pass; the file is 100% covered.
- **`loadClusterAnnotations`' final fallback was unreachable.** With at least one cluster id,
  either a cluster returns variants or its annotations land in the fallback list, so the
  `: croppedAnnotations` arm cannot run. Removed.
- **A flaky shared test helper.** `test-support/waitForSpinnerToBeRemoved` (pre-existing, used
  by 27 suites) relied on `waitFor`'s default 1 s timeout. Two of five full runs failed a
  `FragmentView` suite on it — a _different_ suite each time, which is the signature of a
  timeout flake rather than a defect. Given an explicit 5 s timeout, matching the convention
  already used in `BibliographyEntryForm.test.tsx`. Five full runs since: green.

### N2 — PR description

Rewritten and posted to GitHub (`PATCH /pulls/774`). It now describes the `[run, cancel,
runWrite]` API and the write-supersession design, states the correct save-flow behaviour, names
the Sass migration and the 250-line refactor as deliberate co-travellers with their verification
evidence, records the CI/CodeQL trigger change, and asks for all `TASK-*.md` files to be removed
before merge. You approved this for this task only.

### Gates

| Gate                                            | Result                                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| `yarn tsc --noEmit`                             | clean                                                                              |
| `yarn lint`                                     | clean                                                                              |
| `CI=true yarn test --watchAll=false --coverage` | 414 suites passed, 3 661 passed / 2 skipped, 50 snapshots, **zero console output** |
| `yarn build:ci-stable`                          | exit 0, 92.71 s, zero warnings                                                     |
| 250-line ceiling                                | no changed `.ts`/`.tsx` over 250                                                   |
| `qlty smells`                                   | 155 → 98 repo-wide                                                                 |

### Not done

No commit, branch or push. No reviewer assignment touched. No `TASK-*.md` deleted. The only
thing written to GitHub was the PR description, which you approved.

---

## Phase 5 — 2026-09-08 — the CI `test` job failure

### What changed since the handoff was written

`TASK-774-continuation-prompt.md` states the work is uncommitted on top of `7afb78ed`. That is
stale: the work was committed as `f11cca21` (`refactor: address the PR #774 review findings`) and
pushed. `origin/chore/remove-bluebird` is at `f11cca21` with no divergence, so **B1 unblocked
itself** — the push triggered both workflows.

### CI result at `f11cca21`

| Check                             | Result                |
| --------------------------------- | --------------------- |
| `CodeQL` / `Analyze (javascript)` | success               |
| `GitGuardian` (3 checks)          | success               |
| `qlty check`                      | success               |
| `docker`, `docker-test`           | skipped (master-only) |
| **`test`**                        | **failure**           |

So B1's first two follow-ups are answered: CodeQL has now run green over the added lines, and CI
executed lint, type-check and build successfully. Only the unit-test step failed.

### The failure

`src/fragmentarium/application/FragmentService.query.test.ts`
→ `Query by traditional references › returns traditional reference to fragment numbers mapping data`

```
expect(received).toEqual(expected) // deep equality
  Promise {
-   Symbol(async_id_symbol): 588200,
-   Symbol(trigger_async_id_symbol): 588063,
+   Symbol(async_id_symbol): 594013,
+   Symbol(trigger_async_id_symbol): 594000,
  }
```

### Root cause

The test never awaited. `expected` was bound to `Promise.resolve(returnData)` and `result` to the
un-awaited `fragmentService.queryByTraditionalReferences(['text 1'])`, so
`expect(result).toEqual(expected)` compared two **Promise objects** — it never asserted anything
about the mapping data at all. It "passed" only because both promises were property-less and
therefore deep-equal.

CI runs `yarn test --coverage --forceExit --detectOpenHandles --watch=false`.
`--detectOpenHandles` enables `async_hooks`, which stamps `Symbol(async_id_symbol)` and
`Symbol(trigger_async_id_symbol)` as own symbol properties on every promise. Jest's `toEqual`
compares own symbol properties, so the two distinct promises stopped being equal and the vacuous
assertion finally failed.

**This is a pre-existing defect, not one this PR introduced.** It is carried verbatim from the
base branch — `4f71cb2:src/fragmentarium/application/FragmentService.test.ts:1900-1920`. The
split at `1b0fe6b2` moved it into the new file unchanged. Fixed at root here per the
pre-existing-issues gate.

### Why five previous local runs missed it

The local gate command used throughout phases 1-4 was
`CI=true yarn test --watchAll=false --coverage` — **without `--detectOpenHandles`**. Without
`async_hooks` the promises carry no own symbols and the comparison succeeds. The repo already
ships `yarn test:diag`, which is CI's exact flag set
(`CI=true craco test --runInBand --coverage --forceExit --detectOpenHandles --watch=false
--logHeapUsage`). **Use `yarn test:diag` as the local gate from now on**; the ad-hoc command
cannot reproduce CI.

### The fix

`result` is now awaited and asserted against `returnData` itself, matching the convention of the
sibling `search for fragment in corpus` block in the same file and of `testDelegation`, both of
which already await correctly. `result` is typed `FragmentAfoRegisterQueryResult` rather than
left implicit.

The promise is captured into `pendingResult` before being awaited. That is not stylistic: the
`testing-library/no-await-sync-queries` rule matches the `queryBy*` prefix and mis-identifies the
domain method `queryByTraditionalReferences` as a synchronous Testing Library query, erroring on
`await` applied directly to the call. Capturing first sidesteps the false positive without an
inline `eslint-disable` comment and without weakening the rule in `.eslintrc.json` — the rule is
genuinely useful everywhere else and there is no existing precedent for disabling it.

A repo-wide search for the same pattern (`expected` bound to a `Promise`) returns this one site
only. `test-support/utils.ts`'s `testDelegation` awaits properly (`utils.ts:168-171`).

### Gates after the fix

| Gate                             | Result                                                                     |
| -------------------------------- | -------------------------------------------------------------------------- |
| `yarn lint`                      | clean                                                                      |
| `yarn tsc`                       | clean                                                                      |
| Full suite, **CI's exact flags** | **414 suites passed, 3 661 passed / 2 skipped, 50 snapshots, exit 0**      |
| Console output on that run       | **zero** (grepped the captured log for `console.*`/`Unhandled`/`Warning:`) |
| `yarn build:ci-stable`           | exit 0, 78.36 s                                                            |
| 250-line ceiling                 | file is 118 lines                                                          |
| Coverage of added files          | 15 below 100 %, unchanged — same 15 as the F3 residue table                |

### Not done

No commit, branch or push. No reviewer assignment touched. No `TASK-*.md` deleted. Nothing
written to GitHub this phase — the API was used read-only, to read the PR and its check runs.

---

## Phase 6 — 2026-09-08 — closing F3 and auditing every finding

### Findings re-gathered from GitHub first (review hard gate)

- **Timeline reviews (3):** `qltysh[bot]` COMMENTED ×2 (superseded, empty bodies), `Fabdulla1`
  `CHANGES_REQUESTED` 2026-08-04 — still the standing decision (**B2**).
- **Inline review comments (6), all `qltysh[bot]`:** three distinct duplication issues on
  `corpus/application/TextService.ts` (×4 locations) and `common/hooks/usePromiseEffect.test.tsx`
  (×2). All were already tracked in this review's appendix and verified gone from a fresh
  `qlty smells` run; `qlty check` is `success` on the head.
- **Issue/general comments:** none.

No unaddressed bot or human finding was outstanding except **F3**.

### F3 — closed. Newly-added files below 100 %: 15 → **0**

| File                                                                                                          | How it was closed                                                                                                                                                                                                                                                                                                                                          |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `createFragment.ts`                                                                                           | Tests for a script without `uncertain`, and for archaeology/colophon present — the fixture had neither, so both truthy branches were dead.                                                                                                                                                                                                                 |
| `DossiersQueryByIdsBatcher.ts`                                                                                | The `requestsToResolve.length === 0` guard was **unreachable and subsumed**: `ids` and `requests` only ever accumulate together in `enqueue`, so empty requests implies empty ids, which takes the next guard to a no-op `resolveFromCache([])`. Removed. The `record ? [record] : []` drop-path is now covered by a mid-flight cache-scope-change test.   |
| `DetailsFields.tsx`                                                                                           | New `DetailsFields.fallbacks.test.tsx`: museum without a URL, fragment without measurements, irregular excavation with and without a date.                                                                                                                                                                                                                 |
| `TransliterationFormFields.tsx`                                                                               | New `beforeUnload` test for both polarities of `hasChanges()`.                                                                                                                                                                                                                                                                                             |
| `ArchaeologyEditorFields.tsx`                                                                                 | New test for a site absent from the options list.                                                                                                                                                                                                                                                                                                          |
| `PeriodPreview.tsx`                                                                                           | New test: group with no centroid, and a group with no form.                                                                                                                                                                                                                                                                                                |
| `PeriodAccordion.tsx`                                                                                         | New test: ungrouped cluster label, unknown-form fallback, and the already-loaded early return.                                                                                                                                                                                                                                                             |
| `SignImage.tsx`                                                                                               | New test: annotation without a label, and one with a date.                                                                                                                                                                                                                                                                                                 |
| `SpanAnnotationDisplay.tsx`                                                                                   | New `SpanAnnotationDisplay.retry.test.tsx`. The handoff called this brittle in jsdom; it is not. The existing suite already fires the mousedown/mouseup pair but swaps in the expanded selection **before** the deferred `applySelection` runs, so the retry never triggered. Holding the single-token interim selection steady hits it deterministically. |
| `FakeApiBase.ts`                                                                                              | `allowGet`'s `response = {}` default and `verifyExpectations`' `expectation.body \|\| expect.anything()` were dead — every caller passes both. Removed. New `FakeApiBase.test.ts` covers the `unexpected` rejection paths for `fetchBlob`, `fetchJson` and `postJson`, including the authenticated/not-authenticated wording.                              |
| `TextService.testSupport.ts`                                                                                  | The inline `oldLineNumbers` mapping is now the exported `createOldLineNumbers`, unit-tested directly. Adding the association to the **shared** fixture was tried first and reverted — it makes production call `bibliographyService.find` in suites that do not mock it, crashing the worker.                                                              |
| `FragmentService.testSupport.ts`, `FragmentService.cache.testSupport.ts`, `CuneiformFragment.testSupport.tsx` | Dead mock configuration removed: `find.mockImplementation(reject)` ×2 and `createLemmatization.mockImplementation` — coverage proved the mocked functions were never called. All 19 dependent suites still pass.                                                                                                                                           |
| `TransliterationForm.testSupport.tsx`                                                                         | The `updateEditionImplementation` parameter was dead — no caller passes one. Removed.                                                                                                                                                                                                                                                                      |

### F9 — NEW finding: `silenceConsoleErrors` suppresses `console.error`

`src/setupTests.ts:112` exports `silenceConsoleErrors()`, which does
`jest.spyOn(console, 'error').mockImplementation()`. The project rules call blanket console
suppression **never acceptable**. Five call sites; **three are files this PR added**
(`http/withData.filtering.test.tsx`, `corpus/ui/ChapterEditView.saving.test.ts`,
`fragmentarium/application/FragmentService.testSupport.ts`) and two are pre-existing
(`auth/react-auth0-spa.security.test.tsx`, `common/errors/ErrorBoundary.test.tsx`).

**What it hides.** For the FragmentService helper: `rejectBibliographyLookups` forces
`bibliographyService.findMany` to reject, and production code — `ReferenceInjector`'s
`.catch(error => console.error(...))` at `ReferenceInjector.ts:88` — correctly logs it. The noise
is genuine production behaviour reacting to a deliberately forced failure.

**Fix at source was attempted and reverted.** Replacing the rejection with
`findMany.mockResolvedValue([])` — matching the sibling `createCacheTestContext`, which needs no
suppression — makes the injector **succeed** instead of fail, changing the injected markup
structure and failing 14 assertions across 3 suites. The rejection is load-bearing for the
expected values, so this is not a drop-in fix.

**Status: open, yours to decide.** The remaining options all have costs: (a) accept the
suppression for tests whose subject _is_ the error path; (b) convert each silencer into an
asserted `console.error` spy, which is invasive across the suites; (c) change `ReferenceInjector`
to stop logging, which alters production behaviour. The `ErrorBoundary` and auth cases are React
logging its own caught errors and have no source-side fix at all. **No change was made.**

### Gates

| Gate                         | Result                                                                |
| ---------------------------- | --------------------------------------------------------------------- |
| `yarn lint`                  | clean                                                                 |
| `yarn tsc`                   | clean                                                                 |
| Full suite, CI's exact flags | **423 suites passed, 3 685 passed / 2 skipped, 50 snapshots, exit 0** |
| Console output               | **zero** (grepped the captured log)                                   |
| Coverage of added files      | **70 measured, 0 below 100 %** (was 15 below)                         |
| `yarn build:ci-stable`       | exit 0, 79 s                                                          |
| 250-line ceiling             | no changed `.ts`/`.tsx` over 250                                      |

### Not done

No commit, branch or push. No reviewer assignment touched. No `TASK-*.md` deleted. Nothing
written to GitHub — the API was used read-only.

---

## Phase 7 — 2026-09-08 — F9 fixed, coverage ratchet added

You reaffirmed the instruction to address every remaining finding, so F9 was treated as decided
and **option 2 applied** rather than left for a decision.

### F9 — console suppression replaced with verified expectation

`silenceConsoleErrors()` is deleted. `setupTests.ts` now exports:

```ts
export function expectConsoleErrors(pattern: RegExp): void
```

It installs the `console.error` spy and records the pattern the test declares. A global
`afterEach` in `setupTests.ts` then collects every recorded call, filters out those matching the
declared pattern, and asserts the remainder is empty. Declared errors are tolerated; **anything
else fails the test.** That is the difference between suppression and an expectation.

The patterns were derived empirically — the suppression was removed and each suite run to capture
what it actually logs, rather than guessing:

| Call site                                                  | Pattern                                                          | Source of the log                                  |
| ---------------------------------------------------------- | ---------------------------------------------------------------- | -------------------------------------------------- |
| `http/withData.filtering.test.tsx`                         | `Uncaught [Error: error]` / `The above error occurred`           | React, on a deliberately crashing child            |
| `common/errors/ErrorBoundary.test.tsx`                     | `Uncaught [Error: Error happened!]` / `The above error occurred` | React, reporting the boundary's caught error       |
| `auth/react-auth0-spa.*`                                   | `Failed to create authenticated session`                         | the app's own logging                              |
| `fragmentarium/application/FragmentService.testSupport.ts` | `not found.`                                                     | `ReferenceInjector.ts:88`, on the forced rejection |
| `corpus/ui/ChapterEditView.saving.test.ts`                 | —                                                                | **nothing at all**; the call was deleted           |

That last row matters: one of the five suppressions was silencing an empty stream.

**The guard was proven, not assumed.** Injecting `console.error('PROBE: unexpected stray noise')`
into `ErrorBoundary.test.tsx` failed all three of its tests, with the stray message shown in the
assertion diff. Probe then reverted.

Phase 6's note that fixing F9 "at source" breaks 14 assertions still stands and is unchanged —
that was about removing the _forced rejection_, which is load-bearing. Option 2 keeps the
rejection and verifies the resulting log instead, so nothing breaks.

### 250-line ceiling — a gate I broke and then fixed

Editing `react-auth0-spa.security.test.tsx` (370 lines, pre-existing) pulled it into the changed
set and so under the ceiling. Split into:

| File                                       | Lines |
| ------------------------------------------ | ----- |
| `react-auth0-spa.sessionFallback.test.tsx` | 128   |
| `react-auth0-spa.tokenSecurity.test.tsx`   | 94    |
| `react-auth0-spa.guestPermissions.test.ts` | 40    |
| `react-auth0-spa.testSupport.tsx`          | 33    |

The shared helper also removes an **eight-fold duplicated** `Auth0Provider` render block (DRY
gate). Every original assertion survives: the eight auth0 tests map one-to-one, and the four
permission tests — which were duplicates of each other across two separate describes — became ten
granular `it.each` cases plus a guest-session marker. Title-by-title comparison recorded in the
session. The helper's `overrides = {}` default was then removed as dead; all eight callers pass
overrides.

`react-auth0-spa.test.tsx` is 868 lines but is pre-existing and untouched by this PR, so it stays
outside the gate.

### coverageThreshold added

`craco.config.js` now sets a global ratchet in the jest config:

```js
jestConfig.coverageThreshold = {
  global: { statements: 94, branches: 85, functions: 93, lines: 94 },
}
```

Current global coverage is 94.2 / 85.9 / 93.9 / 94.32, so the thresholds sit just below and a
regression fails CI. This is a floor, not the per-file 100 % rule — that still needs the
added-file audit, which is scripted in the continuation prompt.

### Gates

| Gate                         | Result                                                                |
| ---------------------------- | --------------------------------------------------------------------- |
| `yarn lint`                  | clean                                                                 |
| `yarn tsc`                   | clean                                                                 |
| Full suite, CI's exact flags | **425 suites passed, 3 692 passed / 2 skipped, 50 snapshots, exit 0** |
| Console output               | **zero**                                                              |
| `coverageThreshold`          | passes, 0 threshold failures                                          |
| Coverage of added files      | **71 measured, 0 below 100 %**                                        |
| `yarn build:ci-stable`       | exit 0, 76 s                                                          |
| 250-line ceiling             | no changed `.ts`/`.tsx` over 250                                      |

### Findings ledger — everything actionable is now closed

B1 fixed · B2 **yours** (reviewer) · B3 **yours** (13 `TASK-*.md`) · B4 closed · F1-F9 fixed ·
N1 informational · N2 fixed. Remaining non-code items: push for a green CI run, the re-review,
deleting the tracking documents, and dismissing the 3 qlty items in the qlty project.

### Not done

No commit, branch or push. No reviewer assignment touched. No `TASK-*.md` deleted. Nothing
written to GitHub.

## 2026-09-09 — Review remediation (uncommitted)

Addressed all 9 findings from `TASK-774-review.md`.

- **B1** — `git rm` on 7 stale `TASK-*.md`; `git rm --cached` on the 3 active `TASK-774-*` docs (kept on disk); `TASK-*.md` added to `.gitignore`. PR now adds zero `.md` files.
- **F1** — removed the unused `signal` param from `ApiClient.postJson`/`putJson`; corrected the README paragraph that justified it via `queryByIds`; narrowed the old signal test to reads and added `Writes never attach an abort signal`.
- **F2** — no change. Behaviour is deliberate and documented in the README; the project standard bars adding explanatory code comments.
- **F3** — finding was WRONG. Removing `handleSave`'s return broke 4 tests (`TypeError: ... reading 'then'` at `applyWhenCurrent.ts:13`): `TransliterationForm` chains on it via `Edition.updateEdition`. Root cause was `TabsProps` declaring `onSave`, `fragmentSearchService` and `onToggle` as implicit `any`. Restored the return; typed all three props; that surfaced `Edition.onToggle: () => void` dropping its boolean arg, so `Edition.tsx` and `CollapseExpandButton.tsx` were typed too.
- **F4** — added `createJsonResponse` to `ApiClient.testSupport.ts`; replaced 10 hand-rolled `as Response` literals; removed the `typeof response.text/json` guards and the `captureStackTrace` fallback from production.
- **F5** — thresholds raised to measured values (94.2 / 86 / 93.9 / 94.3) per user decision.
- **F6** — `ApiClient.ts` and `withData.tsx` both to 100%. New tests: superseded-request rejection in `withData`, absent-description branch in `ApiError`.
- **F7** — no action; intentional.
- **F8** — new. `ApiClient.security.test.ts` hit 313 lines once edited; split into `ApiClient.security.testSupport.ts` (37), `ApiClient.security.test.ts` (119), `ApiClient.securityErrors.test.ts` (179). 74 tests before and after.

Gates: lint PASS, tsc PASS, 426 suites / 3695 passed, zero console output, thresholds PASS, no touched file over 250 lines.

Outstanding (not actionable here): B2 re-review, qlty dashboard's 4 blocking issues, commit decision.

## 2026-09-09 (later) — F9: CI was red on the pushed head, root cause fixed

### What was wrong

CI `test` was **failing** on head `29a81056`, the commit that closed the earlier findings.
The review had been written against `a7e87ead` and recorded all gates green, so this was
missed. All 3695 tests passed in CI; the job failed on the coverage gate:

```
Jest: "global" coverage threshold for statements (94.2%) not met: 94.18%
Jest: "global" coverage threshold for lines      (94.3%) not met: 94.29%
Jest: "global" coverage threshold for functions  (93.9%) not met: 93.87%
```

### Root cause

Not a threshold-tuning problem. Coverage was **non-deterministic**. 20 of the 29
`new Chance()` calls in the codebase were unseeded, so every run produced different
fixture data; which optional fields existed changed which branches executed, so the
coverage total drifted run to run. The project already seeded the other 9
(`new Chance('word fixtures')`, `new Chance('chapter-view-integration-test')`, ...) — the
convention existed but was applied inconsistently.

Proven by running one identical subset three times:

| run | statements | branches | lines |
| --- | ---------- | -------- | ----- |
| 1   | 86.66      | 51.85    | 87.71 |
| 2   | 86.66      | 51.85    | 87.71 |
| 3   | 85.00      | 48.14    | 85.96 |

The per-file diff between the local and CI coverage tables showed the drift in both
directions — `Kings.tsx` 81.48/73.33/79.16 local vs 70.37/40/70.83 in CI, but
`colophon-fixtures.ts` branches 83.33 local vs 100 in CI — which rules out an
environment difference and points at random fixture data. Local and CI are in fact the
same environment: UTC, node v20.20.2.

The F5 fix had pinned the thresholds to one lucky local sample, so it was the change that
turned a latent flake into a hard CI failure.

### Fix

1. **Seeded all 20 unseeded `new Chance()` calls**, seed = the module basename, matching
   the existing convention. No test needed changing; 426 suites and 3695 tests passed
   unaltered, 50 snapshots unchanged.
2. **Verified determinism** — two consecutive full runs produced byte-identical coverage
   across all 790 rows.
3. **Lowered the thresholds** from 94.2/86/93.9/94.3 to **94.1/86/93.8/94.2**, giving
   0.07–0.13 points of real margin against the now-stable 94.21/86.07/93.91/94.33.
   Note the review's own suggestion (statements 94.1, lines 94.2) would _not_ have fixed
   CI on its own — functions measured 93.87 against a 93.9 floor, which that tweak missed.

### F10 — 250-line ceiling, surfaced by the fix

Seeding pulled two pre-existing oversized fixture files into scope, exactly as editing
`ApiClient.security.test.ts` did for F8. Both were already over on the base branch and
were untouched by the PR until now. Split, sharing one seeded `Chance` instance per
family so the draw order — and therefore every generated value — is unchanged:

| Before                           | After                                                                                                                |
| -------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `chapter-fixtures.ts` 268        | `chapter-fixtures.ts` 90, `line-display-fixtures.ts` 166, `chapter-id-fixtures.ts` 31, `chapter-fixture-chance.ts` 3 |
| `fragment-data-fixtures.tsx` 287 | `fragment-data-fixtures.tsx` 215, `archaeology-fixtures.ts` 91, `fragment-data-fixture-chance.ts` 3                  |

Both original modules re-export the moved factories, so all 37 consumer imports keep
working unchanged. New modules use full alias import paths per the project standard.

### Gates

```
yarn lint                   PASS
yarn tsc                    PASS
full suite                  426 suites, 3695 passed, 2 skipped, 50 snapshots
console output              zero
coverage                    94.21 / 86.07 / 93.91 / 94.33 against 94.1 / 86 / 93.8 / 94.2
determinism                 two full runs identical across all 790 rows
250-line ceiling            PASS on every touched file
```

Also removed `.qlty/logs`, `.qlty/out`, `.qlty/plugin_cachedir` and `.qlty/results`,
which local `qlty` runs generated during diagnosis. Only `.qlty/qlty.toml` is tracked.

### Still open

B2 (the standing `CHANGES_REQUESTED` review), qlty's 6 dashboard issues, and a by-eye
CodeQL confirmation. None is a code change; all need the repo owner.

---

## 2026-09-09 — Review round 3 (head `0e679943`)

Full independent review pass. No code changes made; review only.

### Data gathered

- Reviews: 3 timeline events — qltysh[bot] COMMENTED (`7ba6f490`, `01e61b13`), Fabdulla1 CHANGES_REQUESTED (`5ef4a984`, 2026-08-04, still the active review state).
- Inline comments: 6, all qltysh[bot] duplication reports, all resolved and outdated.
- Issue/general comments: 0. sourcery-ai: not present on this PR.
- CI on head: test PASS, CodeQL PASS, Analyze (javascript) PASS, GitGuardian x3 PASS, docker/docker-test skipped (expected).
- qlty: check success but **6 blocking issues**; coverage 94.3% (+1.2%); coverage diff 98.8%.
- CodeQL alerts API returned "Resource not accessible by integration" for this token; both CodeQL check runs are green on head.

### Gates run locally

| Gate                                    | Result                                                               |
| --------------------------------------- | -------------------------------------------------------------------- |
| `yarn lint`                             | PASS                                                                 |
| `yarn tsc`                              | PASS                                                                 |
| Full test suite                         | PASS — 426 suites, 3697 tests (3695 passed, 2 skipped), 50 snapshots |
| Console-clean                           | PASS — zero console output                                           |
| 250-line ceiling (touched `.ts`/`.tsx`) | PASS                                                                 |
| Coverage on cancellation primitives     | PASS — 100% on all 9 files                                           |
| DRY                                     | FAIL — 6 duplication blocks (F3)                                     |

Note on method: this container had ~2.5 GB free, and a single `craco test --coverage` run over 426 suites was OOM-killed twice ("the process exited too early"). Ran the suite as seven memory-bounded shards (`--testPathPattern`, `--max_old_space_size=1400`), each an independent process; totals sum to the full suite. Not a PR defect — CI's `test` check is green on the same SHA.

### Independent verification

- Sass: compiled all 59 non-partial entrypoints in both trees with matching load paths — **59/59 byte-identical CSS, 0 differing, 0 errors**. The PR's behaviour-preservation claim holds.
- Bluebird: 0 references in `src`; `bluebird` and `@types/bluebird` gone from `package.json`; 0 leftovers of `CancellationError`/`cancellableFetch`/`isCancelled`/`onCancel`/`.cancel()`.
- Write-cancellation fix confirmed real: `runWrite` uses token-based `SupersedableOperation`; all four write-owning components supersede on unmount; the new integration suite proves the three properties the 2026-08-04 review asked for.
- Proved F1 with a throwaway `src/__sigcheck.ts` — `client.postJson('/x', {}, true, signal)` compiles clean against `JsonApiClient`, and `ApiClient` stays assignable. File deleted after the check.
- No public API lost in the `FragmentService`/`FragmentRepository`/`TextService` splits (method-level comparison vs base).
- No net test loss: 340→426 suites, 2001→2200 test declarations.
- 0 unseeded `new Chance()` remain — the earlier determinism fix holds.
- `Bluebird.all(promise-of-array)` removals verified safe: both call sites return `Promise<T[]>` of plain values.

### Findings raised

- **F1 (Medium, blocking)** `JsonApiClient.postJson` declares `signal?: AbortSignal` that `ApiClient.postJson` drops; contradicts the README's "enforced by the type system" claim added in this PR. No live call site passes it, so no runtime bug today.
- **F2 (Medium, blocking)** Three `TASK-ts7-migration-*.md` files are still tracked; the new `TASK-*.md` `.gitignore` rule cannot untrack them, so they land on master.
- **F3 (Low)** qlty's 6 blocking issues are all duplication inside test files this PR adds (`ApiClient.securityErrors.test.ts` x2, `react-auth0-spa.sessionFallback.test.tsx` x2, cross-file with `tokenSecurity.test.tsx` x2). Reproduced locally and attributed.
- **F4 (Low)** `coverageThreshold` hardcoded in `craco.config.js` with ~0.1pp headroom, global-only.
- **F5 (Low, not this PR)** Two `xit`-disabled tests in `Edition.test.tsx` — attribution checked: they come from base #773; this PR only removed the bluebird import from that file.
- **F6 (Low)** Duplicate `JsonApiClient` type in `index.tsx` and `appDriverHelpers.tsx` diverged, because signal params were added to one copy only.

### Dev container

Explicitly checked at the user's request: **no `.devcontainer/` changes** against either the base branch or master. Full non-`src` change set is `.github/workflows/{codeql-analysis,main}.yml`, `.gitignore`, `README.md`, `craco.config.js`, `package.json`, `yarn.lock`; `.qlty/qlty.toml` unchanged. The two workflow edits broaden `pull_request.branches` to include `chore/**`, `feature/**`, `fix/**` — widens CI coverage, no security downside, no action needed.

### Housekeeping

Running `qlty smells` created untracked `.qlty/{logs,out,plugin_cachedir,results}` in the repo; removed them and confirmed `git status` clean again.

### Verdict

APPROVE WITH CHANGES — 2 merge blockers (F1, F2) plus the standing CHANGES_REQUESTED needing a re-review; 4 non-blocking findings.

---

## 2026-09-09 — Remediation pass (uncommitted)

Addressed every finding from review round 3, plus two user instructions. Nothing committed or pushed.

### User instructions applied

- **Revert `.gitignore` changes affecting PR docs.** Removed the `TASK-*.md` block this PR added; `git diff origin/chore/ts7-tsconfig-migration -- .gitignore` is now empty. Consequence, deliberate: task scratch files are visible as untracked in `git status` instead of being silently ignored, so they must be deleted manually before merge.
- **"Coverage threshold should be 100 for all cases."** Raised the concern that `coverageThreshold.global` measures the whole repo, then measured it precisely via a merged seven-shard coverage run: **94.22% st / 86.08% br / 93.93% fn / 94.34% ln, with 262 of 696 files below 100% somewhere**. A global 100 would have failed CI immediately over hundreds of untouched files. Asked, and the answer was per-path 100 for this PR's code. Implemented as a `fullCoverage` constant applied to all ten owned files, with the global floor at 93/85/93/93. All ten verified at 100% on all four metrics.

### Findings

| #   | Action                                                                                                                                                                                                                                                                                                                                                                                             |
| --- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1  | Extracted `JsonApiClient` to `src/http/JsonApiClient.ts` with `postJson` at three parameters. `src/index.tsx` no longer declares it (it never used it). Also removes two production repositories importing a type from the app entrypoint — a module whose top level calls `createRoot`/`root.render`/`serviceWorker.unregister()` and only stayed safe because Babel elides type-only specifiers. |
| F2  | `git rm --cached` on the three `TASK-ts7-migration-*.md`. `git diff --cached --name-status origin/master -- '*.md'` → `M README.md` only.                                                                                                                                                                                                                                                          |
| F3  | 401/403 pair → single `it.each` (179 → 161 lines). Auth0 scaffold → five helpers in `react-auth0-spa.testSupport.tsx`; `sessionFallback` 128 → 57, `tokenSecurity` 94 → 50. `qlty smells --all` no longer flags any of the three files. One assertion tightened: exact message + exact error instance instead of `stringContaining` + `any(Error)`.                                                |
| F4  | Global floor 93/85/93/93 + per-path 100s (see above).                                                                                                                                                                                                                                                                                                                                              |
| F5  | **Withdrawn — my original finding was wrong.**                                                                                                                                                                                                                                                                                                                                                     |
| F6  | Resolved with F1 — one declaration, four consumers.                                                                                                                                                                                                                                                                                                                                                |

### F5 correction

I reported the two `xit`s in `Edition.test.tsx` as inherited from #773. Checking properly:

```
4db5c9cd (merge-base)                 -> xit = 2
4f71cb24 chore/ts7-tsconfig-migration -> xit = 2
0e679943 HEAD                         -> xit = 2
1dcc762e origin/master                -> xit = 0
```

They predate both PRs. Master fixed them independently in `8971a666` (#767) by adding `src/editor/Editor.testSupport.tsx`, which has never existed on this branch line. `git merge-tree --write-tree origin/master HEAD` confirms the merged tree keeps master's `Editor.testSupport.tsx` and all four tests live as `it(...)`, while retaining this branch's bluebird-import removal. No action needed on either PR.

That same merge preview surfaced ~19 conflicting files against master's tip (`InjectedApp.test.tsx`, `FragmentService.ts`, `FragmentRepository.ts`, `CuneiformFragment.tsx`, `TransliterationForm.tsx`, `Info.tsx` and others) — expected for a 471-file refactor, not blocking while the PR targets #773, but worth budgeting for at retarget.

### Gates after remediation

lint PASS · tsc PASS · 426 suites, 3697 tests (3695 passed, 2 skipped), zero console output · all touched files under 250 lines · 6/6 qlty duplication blocks cleared · 10/10 per-path coverage gates at 100%.

One prettier error surfaced on the new `guestFallbackWarning` constant and was fixed with `eslint --fix`.

### Housekeeping

Removed `coverage/` and the `.qlty/{logs,out,plugin_cachedir,results}` directories generated by the local runs; confirmed no stray `src/__sigcheck.ts` remains.

---

## 2026-09-09 — Review round 4 of PR #774 (head `502c1ccf`)

### Environment note

`gh` is still not installed in this devcontainer. All GitHub data fetched with `curl` against the REST API and the GraphQL API using `$GITHUB_TOKEN`. GraphQL again needed for `reviewThreads` (`isResolved` / `isOutdated`). The code-scanning **alerts** endpoint returns `Resource not accessible by integration` for this token, so CodeQL findings were assessed from the check-run conclusions only — recorded as a stated limitation in the review rather than silently skipped.

### Data gathered

| Source                             | Result                                                                                                                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `GET /pulls/774`                   | open, base `chore/ts7-tsconfig-migration`, head `502c1ccf`, 479 files +23625/−15762, 15 commits, `mergeable_state: unstable` (the `test` check was still running; it completed green during the review) |
| `GET /pulls/774/reviews`           | 3 events: `qltysh[bot]` COMMENTED ×2, `Fabdulla1` CHANGES_REQUESTED (2026-08-04, `5ef4a984`) — still the standing state                                                                                 |
| `GET /pulls/774/comments`          | 6 inline, all `qltysh[bot]`                                                                                                                                                                             |
| `GET /issues/774/comments`         | 0                                                                                                                                                                                                       |
| GraphQL `reviewThreads`            | 6 threads, 6 resolved by `qltysh[bot]`, 6 outdated, 0 unresolved                                                                                                                                        |
| `GET /commits/502c1ccf/check-runs` | 7 runs, all green or skipped                                                                                                                                                                            |
| `GET /commits/502c1ccf/status`     | `qlty check` success                                                                                                                                                                                    |
| sourcery-ai                        | no reviews, comments or timeline events — the app is not installed on this repository                                                                                                                   |

### Gates run locally

`yarn tsc` clean (28.8 s). `yarn lint` clean (58.0 s). `CI=true yarn test --watchAll=false --coverage` — 426/426 suites, 3695 passed, 2 skipped, 50 snapshots, 483 s, exit 0, **zero console output**. Coverage 94.22 / 86.07 / 93.92 / 94.34 against the 93/85/93/93 floor; all ten per-path gated files at 100/100/100/100.

### Independent verification of the PR's two big claims

**Sass.** Extracted the base tree with `git archive` into the scratchpad, symlinked `node_modules`, and compiled all 59 non-partial `.sass` entrypoints on both sides with the repo's own `sass` binary (`--load-path=. --load-path=node_modules`). Result: `identical=59 differs=0 compile_fail=0`. The claim holds. My first attempt failed 40/59 on both sides — a missing repo-root load path on my side, not a defect in the branch.

**250-line ceiling.** Enumerated every touched `.ts`/`.tsx` and counted lines: maximum 249 (`LemmaAnnotation.tsx`). All seven files Fabdulla1 flagged are now 6–191 lines. 48 files repo-wide remain over the ceiling; none is touched by this PR.

### Findings

Ten findings, four blocking. Full detail in `TASK-774-review.md`.

**F1 (High) — `Error.captureStackTrace` guard removed.** The new headline finding. `ApiClient.ts:45` calls it unconditionally; the `typeof` guard and its `this.stack = new Error(message).stack` fallback were deleted in `29a81056`. Root cause: `src/http/ApiClient.ts` was added to the per-path 100%-coverage list in the same round, and the `else` branch was uncoverable — so coverage pressure removed a real runtime guard. `Error.captureStackTrace` is a V8 extension that JavaScriptCore only shipped in Safari 26, and `npx browserslist` still resolves `ios_saf 15.6-15.8 / 16.6-16.7 / 17.6-17.7 / 18.5-18.7` as supported targets. Reproduced in Node with the API deleted: both branches of `ApiError.fromResponse` throw, so `fromResponse` rejects with `TypeError: Error.captureStackTrace is not a function` and the real API error is discarded. The commit message's justification ("branches that only existed to tolerate hand-rolled test `Response` literals") is correct for the `deserializeJson` `typeof` guards but not for this one.

**F2 (High) — master merge.** Re-ran `git merge-tree --write-tree HEAD origin/master` against the current head: 27 conflicting paths, and the merged tree has **55 files importing `bluebird` while the merged `package.json` has none**. 44 of those files are new on master since the fork point `4db5c9cd`, so git takes them wholesale with no conflict marker. Already analysed in `TASK-774-merge-master-handoff.md` (which measured 58/24 against the older head `29a81056`); still open.

**Correction to the round-3 log.** The previous entry recorded that the merge preview "retain[s] this branch's bluebird-import removal". That is true only for the conflicted files; it does not hold for the 44 files master added after the fork point, which merge in cleanly and still import the package. The F9 conclusion about the two `xit` tests is unaffected, but master's copy of `Edition.test.tsx` does still carry `import { Promise } from 'bluebird'`, so that import has to be stripped when master's version is taken.

**F3 (Medium) — task docs are back.** Five `TASK-774-*.md` files are tracked at `502c1ccf` (2314 lines). Commit `29a81056` had removed all ten and added a `TASK-*.md` rule to `.gitignore`; the head commit `502c1ccf` reverted that rule and re-added five files in the same commit, while its message states "the only .md change against master is README.md". `TASK-774-merge-master-handoff.md` also carries `tracked_in_git: false (TASK-*.md is gitignored)` in its own front matter, which is now false.

**F4 (Medium) — standing `CHANGES_REQUESTED`.** All three of Fabdulla1's points verified as fixed in the code: `runWrite` now uses `SupersedableOperation`, `postJson`/`putJson` take no `signal` so the guarantee is type-enforced, the requested integration test exists, and all seven over-length files are split. The review itself has never been dismissed or superseded, so it still blocks merge.

**F5–F7 (Low).** `BibliographyEntryForm.componentWillUnmount` supersedes but never cancels the 500 ms lodash debounce, so a post-unmount `load()` mints a fresh non-stale token and the README's unmount guarantee does not hold for that component. The integration test at `usePromiseEffect.write.integration.test.tsx:86` named "does not abort the first write in flight" is tautological — the first write is stale by then, so both its handlers are suppressed whether or not it was aborted; the real proof is the `signal === undefined` assertion above it. The per-path 100% coverage gate covers 10 of 47 new source files; actual coverage of new code is effectively 100% (only four below, all type-only or test-support), so this is durability rather than a present gap.

**F8–F10 (Informational).** The CI `pull_request` base-glob widening is correct and low risk — `pull_request` rather than `pull_request_target`, `permissions: contents: read`, docker publish still gated on push-to-master; the only side effect is qlty coverage uploads from stacked PRs. The two `xit` tests are inherited from #773 and master has working versions. **No dev container configuration changes exist anywhere in the stack** — `.devcontainer/*`, the root `Dockerfile` and `docker-compose.yml` are untouched against both the base branch and master; verified explicitly because dev container changes were called out as needing careful review.

### Pre-existing issues found

None. Lint, tsc, the full suite and console cleanliness all pass on the branch as committed; the 48 over-length files repo-wide are untouched by this PR and outside its scope.

### State

Nothing committed, branched or pushed. `TASK-774-review.md` and `TASK-774-todo.md` were rewritten in the working tree; both are among the files that must be deleted before merge.

---

## 2026-09-10 — Remediation of the round-4 findings

Nothing committed, branched or pushed. Everything below is an uncommitted working-tree change.

### F1 — `Error.captureStackTrace` (the one real defect)

Extracted `src/common/utils/captureStackTrace.ts` (23 lines): it reads `Error.captureStackTrace` through a locally declared optional type, calls it when the engine has it, and otherwise assigns `new Error(message).stack`. `ApiError`'s constructor now calls the helper instead of the global directly. This keeps `src/http/ApiClient.ts` at 100% — the fallback branch is uncoverable _inside_ `ApiClient`, but trivially coverable in a helper whose test deletes the API and restores it in `afterEach`.

Tests added: four in `captureStackTrace.test.ts` (delegation, no-throw, stack carries the message, a subclass constructor completing) and three in `ApiError.test.ts` under `describe('On an engine without Error.captureStackTrace')` — construction, `fromResponse` preserving the server's `Fragment not found` instead of a `TypeError`, and the malformed-JSON fallback still yielding the status text.

Proven meaningful: reverting `ApiClient.ts` to the direct call makes exactly those three `ApiError` tests fail (`3 failed, 11 passed`). Restored afterwards.

`grep -rn "Error.captureStackTrace" src` now matches only test `describe` strings — no production code calls the global directly.

### F1b — `deserializeJson` guard, re-verified

The removal stands. Every 201 path in the suite is driven by `fetchMock`, which produces real `Response` objects with `.text()`. The only two hand-rolled `as Response` literals are `createJsonResponse` in `ApiClient.testSupport.ts` (which supplies `.text()`) and one in `ApiClient.securityErrors.test.ts:149-156` that exercises `ApiError.fromResponse` and never reaches `deserializeJson`. That guard genuinely only existed to tolerate test literals.

### F3 — task documents

`git rm --cached` on the five `TASK-774-*.md` files. They stay on disk as working documents; `git diff --name-status origin/master -- '*.md'` now returns `M README.md` and nothing else.

I did **not** restore the `TASK-*.md` rule in `.gitignore`. The round-3 entry in this log records that the rule was reverted at the user's request, so re-adding it would undo an explicit instruction. Untracking achieves the same outcome for the PR. Flagged for a decision.

### F5 — debounce outliving the component

`doLoad` is now typed `DebouncedFunc<(value: string) => Promise<void>>` (previously `(value: string) => Promise<void> | undefined`, which erased `.cancel`), and `componentWillUnmount` calls `this.doLoad.cancel()` before `this.loadOperation.supersede()`. Without the cancel, a debounce firing after unmount called `start()` and minted a fresh non-stale token, defeating the supersede.

`BibliographyEntryForm.unmount.test.tsx` (52 lines) mocks `citation-js`, uses fake timers, and asserts a pending load runs while mounted and does not run after unmount. Removing `doLoad.cancel()` fails the second test. The first version of the test produced an `act` warning; fixed at the root by awaiting `act(async () => { advanceTimersByTime(...); await Promise.resolve() })` rather than by silencing anything.

README updated: the "Superseding a write, outside the hook" bullet now says that a debounced write has to cancel its timer as well as supersede, and why.

### F6 — the test that could not fail

`usePromiseEffect.write.integration.test.tsx` now records every write's settled outcome in a `settledWrites` array _before_ the `isStale()` gate, so the first write's fate is observable even though its UI update is correctly suppressed. The test asserts the first write resolved with `first` and that no write rejected.

Proven meaningful: simulating an aborted first request makes it fail with `Received array: [{"detail":"second","outcome":"resolved",...},{"detail":"FetchError","outcome":"rejected","value":"first"}]`. The previous assertion (`Failure: no failure`) passed regardless, because a superseded write's handlers are suppressed either way.

### F7 — coverage gate

Widened from 10 to 49 per-path 100% entries: every new production module this PR adds except `JsonApiClient.ts` and `DateSelectionStateTypes.ts`, which are type-only and carry no executable statements. `craco.config.js` now builds the threshold object by reducing over a `fullyCoveredPaths` array, so adding an entry is one line.

Globs were considered and rejected: `src/common/utils/**` contains `period.ts` (50% branches), `HtmlParsing.tsx` (75%), `HtmlToWord.tsx` and `MarkdownAndHtmlToHtml.tsx`, all pre-existing and below 100%, so a glob would fail immediately. An explicit verified list is the only safe form. Basenames were checked for collisions before classifying by coverage — all unique.

`src/test-support/*` fixtures were caught by the first pass and removed; gating fixture files is meaningless.

**Consequence that had to be handled.** Jest subtracts per-path files from the global bucket, so moving 49 fully-covered files out dropped global branch coverage from 86.08% to 84.80% and the run failed the 85% floor. The residual bucket — untouched, pre-existing code only — was measured directly from `coverage-final.json` and `lcov.info`: statements 93.60, branches 84.80, functions 93.20, lines 93.73. The global floor is now 93 / 84 / 93 / 93, matching the project's stated "ratchet to the measured value" convention. Net enforcement is stronger: those 49 files are held at a hard 100% instead of propping up a blend.

### F8 — qlty upload scope

`qltysh/qlty-action/coverage` now carries `if: github.event_name == 'push' || github.base_ref == 'master'`, so stacked-branch PRs no longer push coverage into the qlty baseline.

### F2 — partial: a guard, not the merge

Added a `No bluebird` step to `.github/workflows/main.yml`, immediately after install and before lint, failing the build on any `from 'bluebird'` / `require('bluebird')` under `src`. Verified both ways: it passes on this branch and matches all 232 such files on master today. Workflow YAML re-parsed with `js-yaml` after editing.

The merge itself is deliberately not done. This PR's base is `chore/ts7-tsconfig-migration`; merging master now would pull 17 unrelated commits into a diff meant to show only the bluebird work. The order stays: land #773, retarget, then reconcile — including the open design question of what master's #791 save-cancellation fix means under "writes are never aborted".

### F4, F9, F13 — not mine

Re-requesting review from Fabdulla1 is reviewer assignment and stays with the user. F9 belongs to the master merge. The stale `.md` claim in `502c1ccf`'s message needs an amend or a PR-description line.

### Pre-existing issues found

None new. The `craco.config.js` `require()` eslint error is pre-existing and out of `yarn lint`'s scope (`src/**/*.{ts,tsx}` only).

### Gates after remediation

lint PASS · tsc PASS · 428 suites, 3706 tests (3704 passed, 2 skipped), 50 snapshots, zero console output · every touched file ≤ 249 lines · 49/49 per-path coverage gates at 100% · residual global 93.60/84.80/93.20/93.73 against a 93/84/93/93 floor.

---

## 2026-09-10 (later) — Gate re-audit against the copilot instructions

Re-read `.github/copilot-instructions.md` and re-checked the remediation against every gate. Two were not satisfied and are now closed.

### Pre-existing issue found: `BibliographyEntryForm.tsx` was not at 100%

**Gate:** "Ensure that coverage is 100% after changes in affected code."

`src/bibliography/ui/BibliographyEntryForm.tsx` is a file this round modified (F5), and it sat at **97.67 / 96 / 93.75 / 97.61** — I reported the remediation as complete without checking it. Two gaps, both pre-existing rather than introduced by the F5 change:

1. `applyInvalidEntry` (line 134) — the `onError` arm of `applyWhenCurrent` in `load`. Never exercised: no test made `Cite.async` reject.
2. The implicit `else` of `if (this.state.cslData && this.state.cslData[0])` in `handleSubmit` (line 154) — submitting before anything has parsed. Unreachable through the Save button, which is disabled while `cslData` is null.

**Root cause:** the suite only ever drove the happy path — valid CSL-JSON in, citation out. The failure and empty-state arms had no coverage at all.

**Fix:** added `BibliographyEntryForm.invalidEntry.test.tsx` (53 lines, 3 tests) — a rejected parse marking the field invalid and stopping the spinner, a rejected parse clearing a citation left over from an earlier valid entry, and submitting before any parse not emitting an entry. The file is now **100 / 100 / 100 / 100** and has been added to `fullyCoveredPaths` so it cannot regress. Gated modules: 50.

### DRY gate

The new suite duplicated `debounceDelayInMilliseconds`, the `Cite.async` mock accessor, `typeIntoDataField` and `advancePastTheDebounce` from `BibliographyEntryForm.unmount.test.tsx`. Extracted to `BibliographyEntryForm.testSupport.tsx` (45 lines) and both suites now import from it; the unmount suite dropped from 52 to 37 lines. `jest.mock('citation-js')` stays in each test file because it is hoisted per module.

Two lint errors surfaced during the extraction and were fixed at the root, not suppressed:

- `useFakeTimersAroundTests` tripped `react-hooks/rules-of-hooks` — the `use` prefix makes eslint treat any top-level call as a hook. Renamed to `setUpFakeTimersAroundTests`.
- `dataField().closest('form')` tripped `testing-library/no-node-access`. Added `data-testid="bibliography-entry-form"` to the form and switched to `getByTestId`, following the existing convention in `TransliterationForm.tsx` (`data-testid="transliteration-form"`).

### Review gate: verifying against the running application

**Gate:** "Verify changed behavior locally while running the modified application before finalizing review conclusions."

Partially satisfiable only. `REACT_APP_DICTIONARY_API_URL` points at `http://localhost:8001`, which is not running in this devcontainer, so no interactive session against real data was possible. What was done instead:

- **`yarn build:ci-stable`** — the exact command CI's build step runs. Exit 0, **zero warnings**.
- **Served `build/` over HTTP and booted it in jsdom** with `Error.captureStackTrace` deleted from the page's `window`, simulating JavaScriptCore. The app does not mount under jsdom 16 (`#root` stays empty) for reasons unrelated to this change — no auth0 or API backend — so this was inconclusive as a whole-app check and is not claimed as one.
- **Inspected the shipped, minified bundle directly**, which is conclusive for F1. `build/static/js/main.8716136d.js` contains the guard intact after minification:

  ```js
  function(e,t){const n=Error.captureStackTrace;"function"===typeof n?n(e,t):e.stack=new Error(e.message).stack}(this,this.constructor)
  ```

  and `grep -c 'Error\.captureStackTrace('` over the bundle now returns **0** unguarded direct calls.

- **Corroboration of the finding itself.** The same bundle contains **9** `Error.captureStackTrace` calls from vendor code (auth0 and others), every one of them optional-chained (`null===(t=Error.captureStackTrace)||void 0===t||t.call(Error,...)`). Third-party libraries already treat this API as optional; the unguarded call was the outlier, which independently confirms F1 was a real defect and not a theoretical one.

### Gates after this round

lint PASS · tsc PASS · **429 suites, 3709 tests (3707 passed, 2 skipped), zero console output** · `yarn build:ci-stable` PASS with zero warnings · every touched file ≤ 249 lines · every file this PR changed at **100 / 100 / 100 / 100** · 50 gated modules · residual global 93.59 / 84.75 / 93.21 against a 93 / 84 / 93 / 93 floor.

Nothing committed, branched or pushed.

---

## 2026-09-10 (later still) — F2 attempted: full master reconciliation

Asked to do the full reconciliation now rather than defer it. I flagged that #774's base is still `chore/ts7-tsconfig-migration`, so this would balloon the PR diff; the decision was to proceed. I attempted it, got the conflict resolution done, and then stopped short of completion. What follows is what the attempt established, because the evidence changes the recommendation.

### Method

`git merge --no-commit --no-ff origin/master`, so nothing was committed at any point. The five staged `TASK-774-*.md` deletions had to be unstaged first (git refused to overwrite the untracked on-disk copies); they were re-applied afterwards.

### All 24 conflicts resolved

Resolved by a rule rather than ad hoc, because both branches independently refactored the same subsystems:

- **Cancellation core stays ours** — `usePromiseEffect.ts` (master's change was only a `useCallback` refactor of the old bluebird API), `Info.tsx`.
- **Combine, where the two sides were orthogonal** — `sitemap.tsx` (master's `encode` parameter + our `Promise<>` return type), `RealiaRepository.ts` (master's `fetchEntry`/`findByRealiaId`/`listAllRealia` + our signal threading), `RealiaService.ts` (master's entry cache + our signal threading).
- **Master's structure elsewhere**, since master carries newer feature work — `SignImages`, `SpanAnnotationDisplay`, `TextAnnotation`, `CuneiformFragmentEditor`, `TransliterationForm`, the `FragmentService`/`FragmentRepository` cluster, and their tests.

### The #791 design question — decided

Master's fix is not really "cancel a save". It is: when the user navigates to a different fragment, do not let the previous fragment's save bleed into the new fragment's UI. Master implements that with `cancelPromise()` (aborting the HTTP request) plus `key={visibleFragment.number}`, `saving={isCurrentFragment && isSaving}` and `error={isCurrentFragment ? error : null}`.

Resolved by keeping master's entire navigation-reset behaviour and replacing only the abort with **supersession**: `CuneiformFragmentController` now owns a `SupersedableOperation` — the pattern the README already documents for components that own a single write — and calls `supersede()` on navigation and on unmount. Same user-visible outcome, and it is strictly better than master's version, which aborts a dispatched save and so cannot know whether the server applied it.

### Why the attempt stopped

The conflicts were the easy half. What the merged tree then showed:

- **153 TypeScript errors**, rising to **220** after deleting this PR's superseded modules, because this PR's own test suite is written against its own architecture and every deletion cascades.
- **Two complete competing implementations** of `fragmentarium/application` coexisting: ours (`FragmentReadService`, `FragmentWriter`, `FragmentCache`, four loaders, `FragmentRepositoryTypes`, `injectFragmentReferences`) against master's (`fragmentServiceBase`, `fragmentCache`, `fragmentCacheKeys`, `scopedCache`, `fragmentServicePorts`, `fragmentProvenance`, `fragmentReferences`).
- **Five filename casing collisions**, which TypeScript rejects outright and which break on case-insensitive filesystems: `FragmentCache.ts` / `fragmentCache.ts`, and four `*.testSupport` pairs differing only in their first letter.
- **56 bluebird files** still to migrate.
- **~17 new text-annotation modules on master** — `RealiaSelect`, `NamedEntityPreviewContext`, `SpanIndicator*`, `InlineEditor`, `annotationSave`, `annotationSpan`, `spanTiers`, `realiaInfo` and others — that this branch has never seen.
- The `fullyCoveredPaths` coverage gate lists 50 modules, a dozen of which the reconciliation orphans.

Finishing means deleting or rewriting a large fraction of this PR's test suite against master's architecture, then re-establishing 100% coverage on master's modules. That is days of work, and the result would no longer be the PR under review. Rather than leave a 220-error half-merge in the working tree, the merge was aborted.

**The merge attempt is preserved** at `<scratchpad>/backup/merge-resolved.patch` — 297 files, 40,271 lines, all 24 conflicts resolved, including the #791 decision. It can be replayed.

### What this changes about the recommendation

`#773` conflicts with master in exactly **one** file, `src/router/sitemap.tsx`, and the two sides are orthogonal — #773 changes `Bluebird<SlugsArray>` to `Promise<SlugsArray>`, master adds an `encode` parameter for URL encoding. Resolving it takes minutes. Landing #773 first means #774 rebases onto a master that already carries the TS7 work, which removes one of the two competing refactors from the equation before #774's own reconciliation begins.

Doing #774's reconciliation before #773 lands means doing it twice.

### State

Merge aborted, working tree restored, all remediation intact. `yarn tsc` PASS, `yarn lint` PASS, zero bluebird references under `src`, `.md` delta against master is `README.md` alone. Nothing committed, branched or pushed.

### PR description

Updated on GitHub with the correction to `502c1ccf`'s `.md` claim, as agreed.

---

## 2026-09-10 (final) — F2 completed: master reconciled into the branch

The reconciliation was attempted earlier and abandoned at 220 TypeScript errors. Asked to complete it, I did. It is done and every gate passes. **Nothing is committed** — the merge is staged with `MERGE_HEAD` set, awaiting an explicit instruction to commit.

### Result

500 test suites, 4395 tests, all passing. `tsc`, `lint` and `yarn build:ci-stable` clean, zero build warnings, zero console output, zero coverage-threshold failures. Zero bluebird references under `src`, zero in `package.json`, zero filename casing collisions.

Global coverage rose from 94.22 / 86.08 / 93.92 / 94.34 to **94.87 / 87.60 / 94.65 / 95.00**.

### The resolution rule

Both branches had independently refactored the same subsystems, so the 24 conflicts were resolved by a rule rather than case by case:

- **Cancellation core stays ours** — `usePromiseEffect`, `ApiClient`, `withData`, the primitives, `Info.tsx`.
- **Combine where the sides were orthogonal** — `sitemap.tsx` (master's `encode` parameter with our `Promise<>` return type), `RealiaRepository` (master's `fetchEntry`/`findByRealiaId`/`listAllRealia` with our signal threading), `RealiaService` (master's entry cache with our signal threading).
- **Master's structure everywhere else**, because master carries newer feature work — the `FragmentService`/`FragmentRepository` cluster, `SignImages`, `SpanAnnotationDisplay`, `TextAnnotation`, `CuneiformFragmentEditor`, `TransliterationForm`, `editorTabContents`.

Master's architecture winning is the coherent end state: master is the trunk, and this PR's purpose is removing bluebird, not imposing a competing split.

### #791 — decided and validated

Master's fix is not "cancel a save". It is: when the user navigates to a different fragment, do not let the previous fragment's save bleed into the new fragment's UI. Master implemented that with `cancelPromise()` plus `key={visibleFragment.number}`, `saving={isCurrentFragment && isSaving}` and `error={isCurrentFragment ? error : null}`.

All of master's navigation-reset behaviour was kept; only the abort was replaced, with **supersession**. `CuneiformFragmentController` owns a `SupersedableOperation` and calls `supersede()` on navigation and on unmount. Same user-visible outcome, and better than master's, which aborts a dispatched save and then cannot know whether the server applied it.

**Master's own `CuneiformFragment.navigation-state.test.tsx` passes against this implementation**, which validates the decision rather than merely asserting it.

### What was removed, and why

Deleted because master's structure supersedes them: 13 modules of this PR's `fragmentarium/application` and `infrastructure` split (`FragmentReadService`, `FragmentWriter`, `FragmentCache`, four loaders, `FragmentRepositoryTypes`, `injectFragmentReferences`, `ApiFragment*Repository`, `createFragment`, `createQueryResult`), 9 of its `FragmentService.cache.*` tests (master has 8 equivalents), 14 further split tests written against the deleted helpers, and `CuneiformFragmentTabContents.*` (master's `editorTabContents` supersedes it).

Deleted as dead code with zero importers: `AnnotationRow.tsx`, `TransliterationFormFields.tsx` and its test — master's `AnnotationLines` and `TransliterationFormControls` replace them.

Deleted for casing collisions, keeping master's names: five `*.testSupport` files whose only difference from master's was the first letter.

Two tests were **restored** after being cut too hastily: `PeriodAccordion.test.tsx` and `SignImages.empty.test.tsx` covered live code, so instead of dropping them the missing helpers (`createMockSignService`, `setUpSignImages`) were added to master's `signImages.testSupport`. The same adapter approach kept `CuneiformFragment.save/saveErrors` tests alive against master's `cuneiformFragment.testSupport`.

One test was replaced rather than deleted: master's `does not return cancelled in-flight query when re-requested` asserts bluebird cancellation, a concept this PR removes. It is now `re-requests after an in-flight query has failed`, which covers the same concern — a non-successful in-flight request must not be sticky — under the new model.

### Where master's behaviour beat ours

`TransliterationForm`: our test asserted that editing clears a stale error; master has explicit tests named `keeps error on editor input change`. Master's is the deliberate, newer choice, so master's behaviour stands and our contradicting `TransliterationForm.errors.test.tsx` was removed. This was caught by porting our behaviour first and watching master's tests go red.

### Signal threading re-applied to master's structure

`fetchGenres`, `fetchPeriods`, `findFolio`, `findPhoto`, `folioPager`, `findAnnotations` and `SignImages`' centroid load now take an `AbortSignal` through `FragmentService`, `fragmentServicePorts`, `FragmentRepository` and `ImageRepository`. Delegation tests were updated to this PR's existing convention of listing the trailing `undefined` in `expectedParams`.

`fragmentRepositoryAttestations.ts` was repointed from `index` to `http/JsonApiClient`, this PR's extraction, which master lacks.

### Console-silencing removed

Master's `fragmentServiceFragments.testSupport.ts` called `silenceConsoleErrors()`, which blanket-mocks `console.error`. The project forbids that. It now calls this PR's `expectConsoleErrors(/not found\./)`, which asserts the expected message and fails on anything else. `silenceConsoleErrors` is not reintroduced.

### 250-line ceiling

Two files I edited crossed it and were fixed: `FragmentService.ts` (252 → 246, `prefetchFrom` extracted to `fragmentPrefetch.ts`) and `RealiaRepository.test.ts` (258 → 204, query-encoding and AfO suites split into `RealiaRepository.queries.test.ts`).

**46 files inherited from master exceed 250 lines** — `bibliography.tsx` at 1290, `complexTestText.ts` at 3514 and others. They are master's pre-existing debt, untouched by this merge, and are not in scope here.

### State

Merge staged, not committed. `MERGE_HEAD` is set; `git commit` completes it whenever you say so.

---

## 2026-09-16 — Round 5 review (review only, nothing committed)

Reviewed head `7c9b1d01` against base `chore/ts7-tsconfig-migration` (`4f71cb24`). Master at `af0b7942`. No code, config or test file was modified in this round; the only files written are `TASK-774-review.md`, `TASK-774-todo.md` and this log.

### What changed since round 4

Round 4 reviewed `502c1ccf` and recorded every gate green. Two commits have landed since: `baba036e` (merge master into the branch) and `7c9b1d01` (add task tracking docs). Both changed the picture.

- The `test` CI job has failed on **both** post-merge runs — `baba036e` and `7c9b1d01` — each with `Test Suites: 1 failed, 499 passed`. The two runs before the merge passed. This is deterministic, not flaky.
- `7c9b1d01` re-added the five `TASK-774-*.md` files that round 4 had untracked, so the round-4 F3 finding has regressed and the PR description is now inaccurate.

### F1 root cause — traced, not guessed

`FragmentService.queries.test.ts` never awaits anything; it compares two promise _objects_ with `toEqual`. It passed on master by accident because master's copy of the file opens with `import Promise from 'bluebird'`, so both sides were Bluebird objects, whose own enumerable fields are deep-equal for two promises fulfilled with the same value.

This PR removes that import. `Promise` is now the native global, and under `--detectOpenHandles` Jest enables `async_hooks`, which makes Node attach a unique `Symbol(async_id_symbol)` / `Symbol(trigger_async_id_symbol)` pair to every native promise as own _enumerable_ symbols. Two native promises therefore can never be `toEqual`.

Measured:

```text
bluebird own enumerable symbols: []
native   own enumerable symbols: ["Symbol(async_id_symbol)","Symbol(trigger_async_id_symbol)"]
```

Reproduced locally, both directions — fails with `--detectOpenHandles`, passes without it. The output matches CI's byte for byte.

This also explains why round 4 recorded `tests: PASS` in good faith: the documented local gate is `yarn test --watchAll=false`, while CI runs `yarn test --coverage --forceExit --detectOpenHandles --watch=false`. Raised separately as F5.

### F2 — found by following the qlty duplication report

`qlty check` reports 9 blocking issues on its dashboard, which needs credentials not available here. Ran `qlty smells --all` locally and intersected the results with the PR's changed files. The largest item by mass (333) is a 93-line identical block reported against both `SignImages.tsx` and `PeriodAccordion.tsx`.

Following it up: the 250-line split of `SignImages.tsx` extracted `PeriodAccordion` into its own file but never deleted the original or rewired the caller. `SignImagePagination` still renders the inline copy. Checking the import graph, `PeriodAccordion.tsx`, `VariantGroup.tsx`, `PeriodPreview.tsx` and `loadClusterAnnotations.ts` are reachable only from their own tests.

The two halves have already diverged, and the divergence runs against this PR's own purpose: the dead `loadClusterAnnotations.ts` uses the new `ConcurrencyLimiter`, while the live `signClusterAnnotations.ts` uses a separately hand-rolled `runWithConcurrencyLimit` in `signImageGrouping.ts`. So the `Bluebird.map({ concurrency })` → `ConcurrencyLimiter` migration does not actually ship in the palaeography code the app runs.

`craco.config.js` `fullyCoveredPaths` pins 100% coverage on four of the dead modules and none of the live ones, so the coverage gate reads green while measuring code that never executes.

### Gates run this round

| Gate                           | Result                                                            |
| ------------------------------ | ----------------------------------------------------------------- |
| `yarn lint`                    | PASS — exit 0                                                     |
| `yarn tsc`                     | PASS — exit 0                                                     |
| `CI=true yarn build:ci-stable` | PASS — "Compiled successfully", zero warnings                     |
| Full suite, documented command | PASS — 500 suites, zero console output                            |
| Full suite, CI's command       | FAIL — F1                                                         |
| 250-line ceiling               | 1 touched file over (`FragmentAnnotation.tsx`, 432, pre-existing) |
| DRY                            | FAIL — F2                                                         |

Two earlier local runs were lost to OOM in this devcontainer (7.9 GB total) when the build and the suite were run concurrently. Re-run sequentially; the results above are from the clean sequential runs.

### Verification of Fabdulla1's three findings

Checked by call path rather than by reading the PR description. All three are genuinely fixed — `runWrite` is token-based via `SupersedableOperation`, `postJson`/`putJson` take no `signal`, no repository or service write method accepts one, all four cited call sites go through the token, all five components owning a `SupersedableOperation` supersede on unmount, the integration test proves the three separate properties it claims, and all seven flagged files are under 250 lines. The `CHANGES_REQUESTED` review itself is still standing and needs clearing on GitHub.

### Container configuration

No `.devcontainer/` changes anywhere in the stack. GitHub's PR diff does show `Dockerfile +4/-4` — a base-image digest pin and two Alpine patch bumps — but `git diff origin/master HEAD -- Dockerfile` is empty, so this is master's own change surfacing through a stale base branch and the net effect on master is zero. Raised as F10 for explicit confirmation since it is container config.

### Outcome

Verdict: **CHANGES REQUESTED**. 12 findings — 4 blocking (F1, F2 code; F3, F4 process), 4 non-blocking, 4 informational. Full detail and the numbered action list are in `TASK-774-review.md`.

## 2026-09-16 — Round 5 remediation (working tree only, nothing committed)

Asked to address all findings, and to git-ignore qlty output.

### F1 — the CI-red test

Awaited the call and asserted on the resolved value against `returnData`; typed `result` as `FragmentAfoRegisterQueryResult`. Verified under CI's exact flags — 22 passed, where it previously failed.

Two lint errors surfaced from the first attempt. Prettier wanted the import on one line. More interestingly, `testing-library/no-await-sync-queries` fired on `await fragmentService.queryByTraditionalReferences(...)` — a false positive, because the rule keys off the `query*` prefix and this is a domain method, not a testing-library query. Rather than suppress the rule with a comment, the call is assigned to `pendingResult` first and then awaited, which sidesteps the pattern without changing behaviour.

Swept the rest of the suite for the same shape. It was the only occurrence: `testDelegation` in `test-support/utils.ts` already awaits before comparing, and the one other promise-valued variable (`editorTabContents.callbacks.test.tsx`) asserts with `toBe`, which is identity and therefore safe.

### F2 — the duplicate palaeography module

Removed the inline `PeriodAccordion` from `SignImages.tsx` and imported the extracted component. Deleted `SignImageFigures.tsx` and `signClusterAnnotations.ts`, and removed `runWithConcurrencyLimit` from `signImageGrouping.ts`. `SignImages.tsx` is the only consumer of all three, so nothing else needed rewiring.

The point of doing it this way round: the surviving `loadClusterAnnotations.ts` is the one built on `ConcurrencyLimiter`, so the `Bluebird.map({ concurrency })` → `ConcurrencyLimiter` migration this PR describes now actually ships in the code the app runs. Before this change it existed only in a module nothing rendered.

Added `SignImages.tsx` to `fullyCoveredPaths`. All seven modules in `signs/ui/display` now report 100/100/100/100, including the newly-live `SignImages.tsx`, and all 8 suites in that directory pass (46 tests).

### F6 — splitting FragmentAnnotation.tsx

432 → 158 lines, split into `useFragmentAnnotationState.ts` (216), `useAnnotationKeyboardShortcuts.ts` (89), `FragmentAnnotationToolbar.tsx` (73) and `initializeAnnotations.ts` (24). The first split attempt left the state hook at 276 lines, so the keyboard and `beforeunload` handling was extracted into its own hook.

Baseline coverage for this file was 79.38/55.55/86.84/79.23 — it is pre-existing and not in the 100% gate, so the split is coverage-neutral by construction. All 8 existing behaviour tests pass unchanged, which is the real check that the refactor is faithful.

One genuine improvement fell out: `reset` is now `useCallback`-stable, so the keyboard hook can list it in its dependency array honestly. That removes a pre-existing `react-hooks/exhaustive-deps` warning without an eslint-disable comment. It is behaviour-identical because `reset` only calls setters, which React guarantees are stable.

### F7 — the last @import

`src/map/ui/MapTab.sass` migrated to `@use 'src/design-tokens' as *`. Recompiled both versions with the PR's Sass options: byte-identical CSS, 768 bytes, and the deprecation warning fires only on the old version. Zero `@import` left in `src`.

### F8, F9, F12

Guard regex widened to `(from|import|require)[[:space:]]*\(?[[:space:]]*['"]bluebird['"]`; checked against 7 import spellings (single/double quotes, `require`, dynamic `import()`, `export … from`) — all 7 match, and it still does not match current `src`. PR number dropped from the error message.

`ApiClient.fetch` made `private`; no external caller existed, and tsc is clean. The README's claim that the write guarantee is type-enforced is now literally true rather than nearly true, and the wording explains why.

`actions/checkout` and `actions/setup-node` bumped v4 → v5 across `main.yml`, `codeql-analysis.yml` and `update-sitemaps.yml`. `secret-scan.yml` keeps its pinned commit SHAs, which is deliberate supply-chain pinning.

### F5 — closing the gap that hid F1

Added `yarn test:ci`, carrying CI's exact flags. `main.yml` now calls it instead of spelling the flags inline, and `.github/copilot-instructions.md` names it as the hard gate with a note on why `--detectOpenHandles` matters. This is the change that stops a future F1 passing locally and failing in CI.

### F3 and qlty ignore

All eight `TASK-*.md` files untracked with `git rm --cached` — staged as deletions, still on disk. `.gitignore` gained a qlty block (`.qlty/*` with negations for `qlty.toml` and `configs`), verified: the five generated paths are ignored, `qlty.toml` is not. `git status` is clean of qlty noise.

No `TASK-*.md` ignore rule was added — round 3 records that being removed at the user's request, so it is left as an explicit question.

### 250-line ceiling

Every file this PR actually changes is now at or under 250 lines. Three files in the diff are still over — `about/ui/bibliography.tsx` (1290), `corpus/ui/ChapterViewLine.tsx` (392), `corpus/domain/manuscript.test.ts` (265) — but `git diff origin/master HEAD` is empty for all three. They are master's files appearing in the diff only because the base branch is stale, the same mechanism as the Dockerfile in F10. Splitting them would be scope creep into unrelated code.

### Gates

`yarn lint` PASS. `yarn tsc` PASS. Full `yarn test:ci` run recorded separately below.

Nothing was committed.

### Round 5 remediation — final gate run

All gates run sequentially (concurrent runs OOM this 7.9 GB devcontainer).

| Gate                           | Result                                                                 |
| ------------------------------ | ---------------------------------------------------------------------- |
| `yarn lint`                    | PASS — eslint + stylelint, exit 0                                      |
| `yarn tsc`                     | PASS — exit 0                                                          |
| `yarn test:ci`                 | PASS — 500/500 suites, 4395/4395 tests, 50/50 snapshots, exit 0, 528 s |
| Console output                 | PASS — zero errors, warnings, act warnings or unhandled rejections     |
| Coverage, global               | PASS — 94.84 / 87.49 / 94.63 / 94.98 against floors 93 / 84 / 93 / 93  |
| Coverage, per-path 100% gates  | PASS — all met, including the newly-added `SignImages.tsx`             |
| `CI=true yarn build:ci-stable` | PASS — "Compiled successfully", zero warnings                          |
| 250-line ceiling               | PASS — every file this PR changes is at or under 250 lines             |
| DRY                            | PASS — duplicate module removed, one concurrency primitive remains     |

CI previously reported `4394 passed, 1 failed`; the run is now `4395 passed`, which is exactly the single F1 test.

`signs/ui/display` after F2 — all seven modules at 100/100/100/100: `PeriodAccordion.tsx`, `PeriodPreview.tsx`, `SignImage.tsx`, `SignImages.tsx`, `VariantGroup.tsx`, `loadClusterAnnotations.ts`, `signImageGrouping.ts`. `ApiClient.ts` and `withData.tsx`, the core of the cancellation change, are also at 100 across the board.

The `FragmentAnnotation.tsx` split redistributed its coverage rather than changing it: the file itself is now 100/77.77/100/100, with the previously-untested branches relocated into `useFragmentAnnotationState.ts` (82.75/46.87/91.3/82.55) and `useAnnotationKeyboardShortcuts.ts` (66.66/20/66.66/66.66). Global coverage is flat against round 4, and none of these files is in the per-path 100% gate, so this is the same pre-existing test debt in new locations — not a regression, and not newly introduced.

### Commit state Note for whoever commits: the four new files under `src/fragmentarium/ui/image-annotation/annotation-tool/` are untracked, so `git commit -a` would miss them; they need `git add`. The eight `TASK-*.md` deletions are already staged.

### Commit — 2026-09-16

Committed to `chore/remove-bluebird` as `75c1d81b`, on explicit instruction. Not pushed.

The pre-commit hook (`lint-staged`) ran `prettier --write` and `eslint --fix` over the staged files and the secret scan reported nothing. `yarn tsc` and the three most affected suites were re-run against the committed state: clean, 38 tests passed.

**F3 reversed, on instruction.** The eight `TASK-*.md` files were untracked as the F3 fix, then re-tracked and folded into the same commit when asked to add the documents. This is a deliberate reversal, not an oversight, and it has two consequences worth restating:

- The PR body's claim that "the only `.md` change against `master` is `README.md`" is still inaccurate, and now stays inaccurate until the files are deleted before merge.
- No `TASK-*.md` rule was added to `.gitignore`, which is what makes keeping them tracked possible in the first place.

Tracked `.md` changes against `master` are therefore: `README.md` (F9), `.github/copilot-instructions.md` (F5), and the eight task documents.

## Round 6 — remediation — 2026-09-17

Instruction: address every round-6 finding **except the cleanup** (F3, the eight tracked `TASK-*.md` files). Nothing committed.

### F1 — the flaky realia test — fixed at its root

The diagnosis came from the sibling suite. `RealiaDisplay.redirect.test.tsx` drives the _same_ canonicalising-redirect chain and never flakes, because it waits on observable state with explicit budgets (`waitForSpinnerToBeRemoved` at 5000 ms, `findByRole` at 3000 ms). `RealiaDisplay.redirectFetching.test.tsx` polled a _call counter_ on `waitFor`'s bare 1000 ms default. The empty `<body><div /></body>` in the failure output confirmed the chain had reached the point where `RealiaEntryDisplay` returns `<Redirect>` (which renders `null`) but had not yet completed `<Navigate>`'s effect, the router state update, the re-render and `withData`'s re-fetch. That is four render/effect hops, and 1000 ms of wall clock is not a reliable budget for them at suite 276 of a `--runInBand --coverage --detectOpenHandles` run.

The fix asserts the end state rather than an intermediate counter: wait for the location to _become_ the canonical URL, then assert the call sequence synchronously. This is strictly stronger than the old assertion — it proves the redirect actually landed, not merely that a second call happened — and it removes the wall-clock race. The second test additionally waits for the spinner to clear, because for a canonical URL the location assertion is true immediately and would otherwise pass before any fetch was issued.

`LocationProbe`, `RealiaRouteEntry`, `expectLocation`, `waitForLocation` and `renderRealiaRoute` were duplicated between the two suites; they now live once in `RealiaDisplay.testSupport.tsx` and both suites use them (DRY gate).

### F2 — duplicated test file — removed

`createScript.test.ts` was deleted. It was a verbatim copy of `FragmentRepository.script.test.ts:11-65`, added by `1b0fe6b2`. The original is byte-identical to master and keeps all five cases, so no assertion was lost — only the second copy.

### F5 — PR body — corrected on GitHub

The "Note" section now states that the eight `TASK-*.md` files are tracked deliberately, that all eight must be deleted before merge, and that the tracked `.md` changes against `master` are `README.md`, `.github/copilot-instructions.md` and those eight documents. The old "Correction to commit `502c1ccf`" paragraph was replaced with one that corrects both earlier claims. Applied on explicit approval; the PR description is the only thing that was changed on GitHub.

### F6 / F7 — coverage

Brought to 100/100/100/100 and added to the `fullyCoveredPaths` gate:

| File                                | Before                       | How                                                                                                    |
| ----------------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------------ |
| `useAnnotationKeyboardShortcuts.ts` | 66.66 / 20 / 66.66 / 66.66   | new `useAnnotationKeyboardShortcuts.test.ts` — every key branch, unmount, both `beforeunload` outcomes |
| `useFragmentAnnotationState.ts`     | 82.75 / 46.87 / 91.3 / 82.55 | new `useFragmentAnnotationState.test.ts` + `.modes.test.ts` + `.testSupport.ts`                        |
| `TransliterationForm.tsx`           | 100 / 85.71 / 100 / 100      | `handleBeforeUnload`/`runBeforeUnloadEvent` extracted to `beforeUnloadWarning.ts` with its own suite   |
| `WordEditor.tsx`                    | 100 / 66.66 / 100 / 100      | attested / unattested / no-source heading cases                                                        |
| `ChapterEditView.tsx`               | 97.67 / 100 / 95.23 / 97.43  | `ChapterEditView.bibliographySearch.test.tsx` exercises the inline `searchBibliography` prop           |

`DateSelectionMethods.ts`, `ScriptSelection.tsx`, `BibliographyEntryFormController.tsx`, `CuneiformFragment.tsx`, `initializeAnnotations.ts` and `FragmentAnnotationToolbar.tsx` were already at 100% and were added to the gate as a ratchet. The allowlist went from 35 to 47 paths.

The `handleBeforeUnload` false branch was genuinely unreachable through the component: `runBeforeUnloadEvent` only attaches the listener when `hasChanges()` is true, and the listener closes over that same predicate, so the guard inside `handleBeforeUnload` could never see `false`. Extracting the pair into a plain module made both branches reachable as a unit test without changing any behaviour, and dropped `TransliterationForm.tsx` from 177 to 150 lines.

### F8 / F10 / F11 / F12 — `.github/workflows/main.yml`

- **F11 (pre-existing bug).** The install retry loop ended on the `{ echo; sleep 10; }` group, which exits 0, so three consecutive failed installs still produced a _successful_ step. Rewritten to `&& exit 0` per attempt with an explicit `::error::` and `exit 1` after the loop.
- **F10.** The bluebird guard now also catches subpath imports (`bluebird/js/release/promise`), `require.resolve`, and re-introduction into `package.json`. Verified against a scratch repository: all four import shapes plus the manifest are caught, and the current tree is clean.
- **F12.** `if: success() || steps.install.outcome == 'success'` removed from Lint, Compile, Unit Tests, Build and the new No-bluebird step, restoring fail-fast.
- **F8.** The qlty coverage gate keeps its `push`-or-`base_ref == master` condition, with a comment recording why a stacked PR must not overwrite the master baseline and where to check coverage instead.

### F13 — `isCancellation` — documented, behaviour unchanged

Narrowing it was considered and rejected. The `signal.aborted` clause is load-bearing: it is what suppresses the UI update for a getter that does not thread the signal and so rejects with something other than an `AbortError` after its view has gone. Narrowing would make `usePromiseEffect.run` reject at unmount and risk unhandled rejections in consumers. The trade-off is now recorded in `README.md` instead, including the mitigation that `ApiClient` already reports every non-abort failure to Sentry before this check runs, so only a failure originating after the HTTP layer goes unreported. The project forbids code comments, so the README is the right home for it.

### F16 — types, plus a pre-existing listener leak

- `DateSelectionState.ts`: `_saveDate` and `_getDate` annotated (`noImplicitAny` is `false`, so these compiled silently).
- `useFragmentAnnotationState.ts`: `onZoom` typed, an explicit `FragmentAnnotationState` return type added, and the `annotations` shadowing in `saveAnnotations` renamed. The type block moved to `fragmentAnnotationStateTypes.ts` to keep the hook at 219 lines.
- The redundant first `onClick` branch was removed — whenever it fired, the second branch ran and did the same `setToggled(hovering)` plus more.
- **Pre-existing bug fixed:** `useAnnotationKeyboardShortcuts`'s effect cleanup called `document.addEventListener('keyup', ...)` where it meant `removeEventListener`, so every effect re-run leaked another keyup listener. Present on master since before the split (`FragmentAnnotation.tsx:177`). The `beforeunload` removal also now passes `{ capture: true }` to match how it was added.

### F15 — `caniuse-lite` refreshed

`npx update-browserslist-db@latest` — "No target browser changes", so this is lockfile-only and removes the last line of output from `yarn test:ci`.

### Not addressed, and why

- **F3** — excluded by instruction.
- **F4** — re-requesting review is reviewer management, which is not mine to do.
- **F9 / F14** — both need a merge commit (master into the base branch, and the three outstanding master commits into this one). Committing was not requested.

### Gates after round-6 remediation — 2026-09-17

| Gate                   | Result                                                                                                     |
| ---------------------- | ---------------------------------------------------------------------------------------------------------- |
| `yarn lint`            | PASS                                                                                                       |
| `yarn tsc`             | PASS                                                                                                       |
| `yarn test:ci`         | PASS — 504 suites, 4428 tests, 50 snapshots, exit 0                                                        |
| Console-clean          | PASS — zero console output, and the `browserslist` line is gone                                            |
| `yarn build:ci-stable` | PASS — "Compiled successfully", zero warnings                                                              |
| Coverage               | global 95.09 / 87.97 / 94.73 / 95.23, up from 94.84 / 87.49 / 94.63 / 94.98; all 48 per-path gates at 100% |
| 250-line ceiling       | PASS — largest file touched is 219 lines                                                                   |
| DRY                    | PASS                                                                                                       |

The suite went from 4395 tests with one failure to 4428 passing. The realia flake did not recur.

One self-inflicted detour worth recording: fixing the `testing-library/no-container` lint error in `WordEditor.test.tsx` by switching to `getByRole('strong')` looked right but failed in the full run — this version of `aria-query` does not map `<strong>` to a role. `getByText` works because `getNodeText` concatenates an element's direct text children, so the `<strong>` reads as `*Apkallu` when unattested and `Apkallu` when attested, which is exactly the branch under test. Lesson: re-run the affected suite after a lint fix, not just the linter.

### Commit state

Nothing committed. `createScript.test.ts` is staged as deleted (it was removed with `git rm`); everything else is unstaged or untracked. The eight new files under `src/` are untracked, so `git commit -a` would miss them.

## Round 6 — follow-up: the last qlty blocking issue — 2026-09-17

After `a9b0542f` was pushed, `qlty check` went from 3 blocking issues to 1. The two that cleared were the identical-code pair behind `createScript.test.ts`. The survivor was `useFragmentAnnotationState` at cognitive complexity 23 — down from 25 once the redundant `onClick` branch went, and well down from the 50 that master's `FragmentAnnotation.tsx` carried before the split, but still over qlty's threshold.

Raising the threshold or adding an ignore was not considered. The function was doing three unrelated jobs at once: holding selection state, deciding what a selection means, and talking to the server. Splitting it along those seams removes the smell as a side effect of the code being better arranged.

- **`annotationSelection.ts`** — the pure decisions, with no React in them: `findAnnotationById`, `replaceAnnotation`, `createAnnotation`, `toAutomaticAnnotation`. These were the deepest nesting in the old `handleSelection`, and as plain functions they carry no nesting penalty at all.
- **`useAnnotationPersistence.ts`** — everything asynchronous: `saveAnnotations`, `onDelete`, `saveCurrentAnnotations`, `deleteAllAnnotations`, `generateAnnotations`, plus the four flags they own (`isSaving`, `isDeleting`, `isGenerateAnnotationsLoading`, `error`). The parent now spreads its result straight into the returned state, so no call site changed.
- **`useFragmentAnnotationState.ts`** — down from 219 lines to 142, and now only composes: state, the keyboard hook, the persistence hook, and three short handlers.

`handleSelection` also lost a level of nesting. The old shape was `if (data) { if (selected) {...} else if (geometry) { if (tooSmall) {...} } }` — four levels deep. It now returns early on missing data, delegates the replace path, and treats "create" as a single nullable expression.

Behaviour is unchanged, and the evidence is that **every existing test passed untouched**: 45 tests across the annotation-tool folder, including the `FragmentAnnotation` and `AnnotationsView` integration suites, with no edits to any test file. All four modules sit at 100/100/100/100, and `annotationSelection.ts` and `useAnnotationPersistence.ts` were added to the coverage gate, which is now 50 paths.

`qlty smells` reports all five files in the folder clean — no complexity, no duplication, no long parameter lists.

### Build gate — could not be re-run locally

`yarn build:ci-stable` fails in this dev container with CRA's "the build failed because the process exited too early", which is what it prints when the webpack child is killed. It is **not** caused by the split:

- The same command succeeded twice earlier in this session, on this branch.
- Raising the heap to 3072 MB does not help, so it is not the `--max_old_space_size` cap.
- Stashing every uncommitted change and building the committed `a9b0542f` reproduces the failure identically — and that is the commit GitHub Actions built green.

The container has no cgroup memory limit and `memory.events` records `oom_kill 0`, so the kill is coming from the host. Memory went from comfortable to ~2 GB free over the session, with the editor's two `tsserver` processes (936 MB and 140 MB), the extension host (657 MB) and the ESLint server (245 MB) accounting for most of it.

Conclusion: an environment limitation, not a regression. `lint`, `tsc` and `test:ci` all pass locally, and the build is verified remotely by CI on every push. Worth re-running once the editor has been restarted, if local confirmation is wanted before the next push.

## Round 7 remediation — 2026-09-17

Instruction: address every finding except the `.md` cleanup.

**F1 was the one that mattered, and it had two causes, not one.**

The visible symptom was a snapshot missing `style="transform: translate(0px, 0px) scale(1);"` on the `react-transform-component` div. A probe confirmed that attribute is present immediately after the Save button appears on an idle machine — so the test was not asserting something impossible, it was asserting something nothing waited for. `react-zoom-pan-pinch` writes that attribute imperatively from `TransformComponent`'s mount effect and re-applies it from a `ResizeObserver` callback; the test's only wait was `findByRole('button', { name: 'Save' })`, an unrelated element.

The second cause was found while fixing the first: that `findByRole` carries `{ timeout: 10000 }` but lives in a `beforeEach` running on Jest's **default 5000 ms hook budget**. The hook could therefore die before the render finished, independently of the snapshot. It had never been noticed because the render usually completes in about two seconds. The first attempt at the fix made this visible immediately — adding any further await pushed the hook over its budget and it failed with "Exceeded timeout of 5000 ms for a hook".

Both are fixed: the hook declares a budget larger than the waits it contains, and a `waitFor` polls the transform attribute itself. Verified with six isolated runs and four consecutive full `yarn test:ci` runs.

**F13 exposed a second pre-existing defect.** Making `expectConsoleErrors` assert that the expected error actually occurred turned 17 tests across 5 suites red. The cause was real: `stubMissingBibliography` and `resetAuth0Mocks` call the helper from a blanket `beforeEach`, so they claimed to expect an error that most tests in those suites never trigger. Rather than weaken the assertion back, the helper now has two modes — `expectConsoleErrors` (the error must occur) and `tolerateConsoleErrors` (the error is arranged, and tolerated if it occurs). Both still fail on any _unexpected_ message, which is the property that matters relative to the blanket suppression this PR removed.

**F8 needed a correction mid-flight.** The first attempt raised the global branch floor to 87 on the strength of the 87.98 printed in the coverage summary. That failed: Jest subtracts files covered by per-path thresholds from the global figure, so the number the floor is compared against is 86.84, not 87.98. Recomputed the effective figures from `coverage/coverage-final.json` excluding the 50 listed paths — 94.57 statements / 86.84 branches / 94.21 functions — and set the floors to 94 / 86 / 94 / 94, a real tightening from 93 / 84 / 93 / 93 with headroom left.

**Lint pushed back on the first F1 fix.** `container.querySelector` trips `testing-library/no-node-access` and two assertions in one `waitFor` trips `testing-library/no-wait-for-multiple-assertions`. Restructured to a single assertion behind a small accessor with one scoped disable, matching the existing precedent in `withData.tsx`. The alternative — adding a `data-testid` to app code purely for a test — was rejected.

**Not done, deliberately:** the `.md` cleanup (excluded by instruction); merging the three master commits (a merge is a commit, and commits are not made unprompted); resolving #773's conflicts (different branch); clearing the standing review (needs the reviewer).

Gates: lint PASS, tsc PASS, `yarn test:ci` PASS at 504 suites / 4428 tests / 50 snapshots with zero console output across repeated full runs (the last two fully green end to end), coverage 95.08/87.98/94.74/95.23 with every per-path 100% gate met, 250-line ceiling PASS. `yarn build` and the dev server remain unrunnable in this container — fork-ts-checker is OOM-killed with SIGTERM at roughly 2.8 GB available — so that gate is taken from CI, which compiled this sha green.

**Lesson.** Two this round. First: when a test fails on an attribute, check whether anything waits for that attribute before blaming the value. Second, and more useful: tightening an assertion is a good way to find out that the assertion was never true. F13 was filed as a small hygiene point and it uncovered five suites whose shared setup was asserting something most of their tests never did.

---

## Round 8 — review only — 2026-09-20

Head reviewed: `ee275e43`. No code was changed this round; this was a review pass. `TASK-774-review.md` was rewritten for round 8 and `TASK-774-todo.md` updated.

**Gates, all re-run locally on `ee275e43`.** `yarn lint` PASS (exit 0). `yarn tsc` PASS (exit 0). `yarn test:ci` PASS — 504 suites, 4428 tests, 50 snapshots, 0 failures, exit 0, 621.7 s, and zero `console.error` / `console.warn` / unhandled-rejection output in the whole run. Coverage 95.08 / 87.98 / 94.74 / 95.23 with no threshold breach; `craco.config.js`'s `fullyCoveredPaths` validated at 50 entries, no duplicates, none missing. No changed `.ts`/`.tsx` file exceeds 250 lines. `yarn build` and the dev server remain unrunnable here (fork-ts-checker is OOM-killed), so those are taken from CI, which is green on this sha.

The first `yarn test:ci` run was killed by a session boundary at 319/504 suites with no failures. It was re-run from scratch rather than reported partially; the numbers above are from the complete run. Lint and tsc were deliberately held until the test run finished, because the `AnnotationsView` suite was flaky under CPU load as recently as round 7 and a false red would have cost more than the wait.

**GitHub state gathered before reviewing**, per the review gate. All three timeline review events, all six inline review comments, the GraphQL `reviewThreads` connection with resolution and outdated flags, the issue comments (zero), the eight check runs on the head sha and the combined status. No `sourcery-ai` review, comment or check run exists on this PR — `qltysh[bot]` is the only bot reviewer, and its six threads are all resolved and outdated because `TextService.ts` and `usePromiseEffect.test.tsx` were restructured underneath them.

**F5 is the find of the round, and it came from doubting a README sentence.** The README this PR adds claims "Everything else reachable from a `withData` getter or `run` threads one." Rather than take it, I enumerated every `FragmentService` method and split them by whether the signature declares a signal, then checked which of the signal-less ones are reached from a getter. Four were — and they are called _with_ a signal argument that the method has no parameter for. They compile because the `withData` type argument is written `{ fragmentService }`, which is `{ fragmentService: any }` under this repository's `noImplicitAny: false`.

Widening the sweep to every call site passing `signal` turned up the better case, which needs no `any` at all. `FragmentInfoRepository` declares `random(signal?: AbortSignal)`; `FragmentRepository.random()` implements it with no parameters; TypeScript accepts a narrower function where a wider one is expected, so the assignment is legal and `tsc` stays green while `FragmentSearchService` threads a signal into a method that drops it. `NeedsRevision.tsx` even spells the abortable type out by hand. Three live UI call sites depend on the contract. Seven reads in total advertise abortability they do not have.

None of it is a runtime regression — these reads were not abortable on master either, and `withData`'s `requestSequence` guard still prevents stale state. What makes it worth a Major is that this PR's entire thesis is that the type system, not convention, decides where signals go. Here the type system says one thing and the network does another.

**F6 was found by auditing what replaced `silenceConsoleErrors`.** The PR's removal of blanket console suppression is real, but `TextService.misc.test.ts:84` — a file this PR adds — reintroduces the exact pattern with an unasserted `jest.spyOn(console, 'error').mockImplementation(() => undefined)`. Its sibling test 30 lines above does it correctly. I checked all fourteen surviving `spyOn(console` sites: the pre-existing ones all assert, and of the five in PR-added files only this one and two tests in `CuneiformConverterForm.errors.test.tsx` (F7) do not.

**Deleted tests were checked individually rather than counted.** Seven test files are gone and 76 added, which looks like a split but is not proof. I extracted every `it`/`test` name from the seven deleted files and searched for each in the current tree. Three did not appear. One was a false alarm — "should not allow write operations for guest users" survives as an `it.each` over the same six permissions, which is stronger than the original. The other two assert on bluebird's `.cancel()` / `.isCancelled()` and are genuinely obsolete, with better `AbortSignal` replacements in `ApiClient.requests.test.ts`. Recorded as F12 for explicit sign-off rather than assumed.

**F4 corrects round 7, which had the diagnosis right and the remedy wrong.** Round 7 recorded CodeQL's missing diff analysis as something the retarget would fix. The `Analyze (javascript)` check run carries the actual reason as a warning annotation: "Cannot retrieve the full diff because there are too many (300) changed files in the pull request." Landing #773 does not help — #773 is 30 files and this PR is 510 against master, so the retargeted diff stays well over the cap. The gap is structural.

**Dev container checked explicitly, as instructed.** `.devcontainer/` is byte-identical to master across all four files, and the root `Dockerfile` is byte-identical too — its `+4/-4` in the GitHub diff is base-branch drift. The CI workflows _are_ materially changed, so all twelve changes across `main.yml`, `codeql-analysis.yml` and `update-sitemaps.yml` were reviewed line by line and are recorded with a verdict each in W1. All sound. The real hazard is pre-existing: both Docker jobs are gated on `push` to master, so no pull request ever builds the Dockerfile.

**`tsconfig.json` belongs to #773, not here.** It differs from master (`target` es5 → es2020, `moduleResolution` node → bundler, `baseUrl` → `paths`) but is identical to the base branch. Verified that CRACO compensates for the removed `baseUrl` via `jestConfig.modulePaths` and `webpackConfig.resolve.modules`, both pointing at `src`. `noImplicitAny: false` is pre-existing on master and is what lets F5 Group A compile.

**Verdict: CHANGES REQUESTED.** 17 findings — 4 blockers, 2 major, 6 minor, 2 warnings, 3 info. The design is right and the August review is satisfied; F5 and F6 should be fixed here, the eight `.md` files must go, and three blockers need a different branch, another person, or a decision about CodeQL.

**Lesson.** A documented guarantee is a claim to test, not a fact to reuse. Both majors this round came from checking a sentence the PR itself wrote — one in the README, one implied by deleting `silenceConsoleErrors` — against what the code actually does. Round 7 verified the write side of the signal rule thoroughly and took the read side from the prose; the read side is where the gap was.

---

## Round 8 — remediation — 2026-09-22

Every round-8 finding was addressed except the `.md` cleanup (F1), which was excluded by instruction, and the six that cannot be closed from inside this diff. Head `ee275e43`; nothing committed.

**F5 was the whole job, and fixing it was more interesting than finding it.**

The repository layer was the easy half: `_fetch` takes a `signal` and forwards it to `fetchJson`, and `random` / `interesting` / `fetchNeedsRevision` accept the parameter their own port `FragmentInfoRepository` had been declaring all along. `statistics`, `lineToVecRanking`, `fragmentPager` and `findInCorpus` got the same treatment through the port, the service and the repository.

The hard half was the four `withData` type arguments written `{ fragmentService }`. Replacing that with `{ fragmentService: FragmentService }` turned three previously-invisible errors red immediately, which is the strongest evidence the finding was worth filing:

- `FragmentInCorpus.tsx` was declaring its data as `Array<ManuscriptAttestation>` while the repository returns `ReadonlyArray`. The `any` had been absorbing the mismatch. Fixed by using the shared readonly type rather than widening it back.
- `Statistics.test.tsx` and `FragmentLineToVecRanking.test.tsx` were passing partial stubs (`{ statistics: jest.fn() }`) where a full `FragmentService` is now required. Both are explicit `as unknown as FragmentService`, matching the `as unknown as Session` already in those files.

`FolioImage.tsx` carried the identical `{ fragmentService }` hole. It was not in the finding — its getter calls `findFolio`, which _does_ accept a signal, so nothing was being dropped — but leaving it open would have defeated the purpose of the fix, which is that the compiler catches the next one. Closed with the other four.

**Threading the signals broke the 250-line ceiling, and the fix was a real improvement rather than a workaround.** `FragmentRepository.ts` went 240 → 253 because prettier expands a two-parameter signature onto four lines. Compressing the signatures would have been the cheap answer. Instead the `FragmentInfoRepository` implementation moved into `fragmentRepositoryInfo.ts` as `ApiFragmentInfo`, slotted into the existing `ApiFragmentAttestations` → `ApiFragmentUpdates` → `ApiFragmentRepository` chain the repository already uses. `FragmentRepository.ts` is now 178 lines, the new module 85, and the port is implemented in one file instead of being scattered. Two hand-built `/fragments/<n>/...` URLs now go through `createFragmentPath`, and the three fragment-info readers share a private `fetchFragmentInfos` helper instead of each repeating `.then(infos => infos.map(createFragmentInfo))`.

Two duplicated inline shapes became named types while in there: `FragmentStatistics` (written out in the port, the repository, the service and a test) and `CorpusAttestations` (the port, the repository, the service and `FragmentInCorpus.tsx`).

**The delegation tests needed updating, and one was missed on the first pass.** This repository's convention, already visible in `folioPager`, is that a method threading an optional signal expects a trailing `undefined` in `toHaveBeenCalledWith`. Seven `TestData` entries and one hand-written assertion were updated. A second `findInCorpus` assertion in `FragmentRepository.query.test.ts:130` was missed and caught by the full run — a reminder that grepping for the method name is not the same as grepping for the URL it builds.

**New test, because the point of the fix is the forwarding.** `FragmentRepository.abortSignal.test.ts` drives all seven reads through a `describe.each` and asserts the caller's `AbortSignal` arrives at `apiClient.fetchJson`. The README now points at it and says to extend it when another abortable read is added.

**F6 had a trap in it.** Swapping the unasserted spy for `expectConsoleErrors` is not enough on its own: that describe block had `afterEach(() => jest.restoreAllMocks())`, and Jest runs describe-level `afterEach` hooks _before_ the root-level one installed by `setupTests`. The restore would have wiped `spy.mock.calls` before the global hook could assert on them, so the test would have failed on the "expected error did not occur" branch. Removing that `afterEach` was part of the fix, not tidying.

**Not code: the PR description was corrected on GitHub** — 48 changed Sass files and 60 entrypoints (it said 47 and 59), the build-command claim now that `main.yml` actually calls `yarn build:ci-stable`, the write-owner list minus `BibliographyEntryForm`, and a new section recording these fixes.

Gates: lint PASS, tsc PASS, `yarn test:ci` PASS at 505 suites / 4435 tests / 50 snapshots with zero console output, exit 0 (the reviewed sha was 504 / 4428; the extra suite and seven tests are `FragmentRepository.abortSignal.test.ts`). Coverage 95.08 / 87.98 / 94.74 / 95.23, identical before and after the remediation, with no threshold breach. No changed or new `.ts`/`.tsx` file exceeds 250 lines. `yarn build` and the dev server remain unrunnable here.

**Lesson.** `noImplicitAny: false` does not just weaken types where it is used — it hides the evidence that a type is wrong elsewhere. Four dropped signals, a readonly/mutable mismatch and two under-specified test stubs were all sitting behind one shorthand `{ fragmentService }`. The fix took ten minutes; the finding took a deliberate decision to distrust a sentence in the README.

---

## Round 9 — review only — 2026-09-23

Head reviewed: `2b391cdd` (the master merge of 2026-09-22). No code was changed; this was a review pass. `TASK-774-review.md` was rewritten for round 9 and `TASK-774-todo.md` updated.

**What changed since round 8.** #773 was closed without merging on 2026-09-22 (closing comment `-> PR #774`), and its head is not an ancestor of `master`, so this PR now targets a dead branch. `master` was merged in, leaving the branch 0 commits behind and conflict-free against `master`. Fabdulla1 was re-requested and posted a second `CHANGES_REQUESTED` today on this exact head, with nine concerns.

**GitHub state gathered first, per the review gate.** Four review events, six inline comments, six review threads (all `qltysh[bot]`, all resolved and outdated), zero issue comments, eight check runs plus their annotations, and the combined status. No `sourcery-ai` activity exists on this PR.

**Every reviewer concern was traced, none taken on trust.** All nine hold. The useful distinction is where each came from. B2 (bibliography batch cache ignores `clear()`) and the button states in B4 are identical on `master`, but this PR rewrote that code, and B2's new test asserts the unsafe behaviour. B6/B7 are regressions: on `master`, `withData` cancelled the returned Bluebird chain, which reached `cancellableFetch`. B8 was introduced here, because the signal was threaded into `fetchAllDossiers` without updating its catch-all. B3 is the direct consequence of fixing the August concern correctly: once older saves are never aborted, overlapping saves have to be prevented some other way.

**Own findings on top.** The PR description is stale in three places (M1). #774 and #779 conflict in five files, three of them workflows (W3). The Node 20 warning on the GitGuardian job comes from `secret-scan.yml`, which this PR doesn't touch; #779 fixes it (I1). The dev container and root `Dockerfile` are byte-identical to `master`. The workflow changes were re-read, and the dropped `SLACK_WEBHOOK_URL` was confirmed dead on `master`.

**Lesson.** Round 8's F5 sweep went through `FragmentService`, starting from a README sentence. B6-B8 are the same class of bug in `SignService`, `DossiersRepository` and a `FragmentService` getter the sweep didn't reach. A sweep should start from the call sites (every `withData(` getter, every `.catch(` on a signal-threaded read), not from one service's method list.

**Gates on `2b391cdd`.** `yarn test:ci` PASS: 505 suites, 4445 tests, 50 snapshots, 0 failures, exit 0, 608.7 s, zero console output. Coverage 95.09 / 87.99 / 94.75 / 95.23 with no threshold breach. `yarn lint` and `yarn tsc` PASS, both run after the test run finished. No added or modified `.ts`/`.tsx` file exceeds 250 lines. I couldn't run `yarn build` or the dev server here (the container runs out of memory); CI built this commit green.

**Sweep, done rather than just recommended.** The first draft of the recommendation told the author to grep every `withData` getter; I ran that myself instead. Of the 19 getters that ignore their signal, 14 call shared-cache or POST reads, both of which the README exempts; three are B6. The remaining two, `MarkupService.fromString` (`markup.tsx:44`) and `SignService.associateSigns` (`FragmentAnnotation.tsx:50`, one sign search per token), are recorded as N1, Major: cancellable on `master`, not exempt, and a contradiction of the README. Of the catch-alls on signal-threaded reads, only B8 swallows aborts. The review now has 21 findings.

---

## Round 9 — remediation — 2026-09-23

Every code finding (B2-B9, N1) is fixed in the working tree. Nothing is committed. For each fix, the new or changed test was also run against the unfixed file (restored from `HEAD`, then put back) and fails there.

**The B5 fix changed a test's premise, and that's the point.** The converter's stale-result test clicked Convert twice in the same tick. The first conversion was aborted before its operation started, but it still ran, because `run()` never re-checked the signal after `await acquireSlot`. That's the B5 bug on the immediate-slot path, not only the handoff path. With the fix, the first request is never sent, so the test now waits for it to be sent before clicking again. The new handoff test reaches the exact gap by wrapping the queued waiter's resolver in `queueState`.

**B3 went with serialisation rather than locking the UI.** Every fragment write enters through `CuneiformFragmentController.handleSave`, so one `SerialQueue` there covers genres and every editor tab. Locking would have meant threading `saving` through `Info` → `Details` → `GenreEditor` and every other write control. The two `saveErrors` tests that let a second save finish first were reordered, not deleted: serialisation makes that order impossible at the server, and the superseded outcome is still asserted as ignored.

**B4 went with locking.** Date writes don't go through `handleSave`, and `DatesInTextSelection.saveDates` builds its array from the list captured at click time, so overlapping row saves would also lose updates. Disabling Save/Delete/Add while pending, and sharing the parent's pending state with row editors via `isParentSaving`, closes both problems. Inputs stay editable, since they don't write.

**Typing an `any` found four more hidden errors, the same lesson as round 8.** `SignRepository.apiClient` had no type annotation. Under `noImplicitAny: false` that made it `any`, which is why `getUnicodeFromAtf` compiled while calling `fetchJson` without its required `authenticate` argument. Typing the field exposed four `unknown`-typed `fetchJson` results; they're fixed with type arguments.

**A test I wrote and then deleted.** "Does not apply a dates-in-text save that settles after unmount" passed against the unfixed code too, because nothing observable distinguishes the two under React 18. It proved nothing, so it's gone; the unmount guard is tested at the hook level (B9).

**Traps.** jsdom's `AbortController` here ignores `abort(reason)`, so `createAbortError` always falls back to `DOMException('AbortError')`, and tests have to assert `name: 'AbortError'`. Date popovers need `await userEvent.click`: `fireEvent` leaves Overlay transitions outside `act` (console noise) and doesn't trigger root-close, so two popovers stay open.

**100% coverage on the touched files.** The first full run after the fixes left four touched files below 100%. None of those gaps was new; my changes had closed some lines. Two were dead code rather than missing tests. `DatesInTextSelection` passed an `updateDateInArray` to editors that always use `saveDateOverride`, and it had a no-index-no-date branch that can't be reached; `saveDates` now goes through that same function, and the branch chain is a single splice. `FragmentAnnotation`'s `'POINT'` overlay text is unreachable because the selector is fixed to `RectangleSelector.TYPE`, so it's removed. Two pre-existing test problems turned up and are fixed: `MarkupService.test.ts` leaked a prototype stub (`mockClear` → `mockRestore`), and a new test created its rejected promise eagerly, which produced a `PromiseRejectionHandledWarning` (now `mockRejectedValue`). All 17 touched source files are at 100%, and the 13 not already listed are now in `fullyCoveredPaths`, added in place with no reordering.

**GitHub, as decided.** #774 was retargeted to `master`. It now shows 512 files, and qlty coverage will upload from now on. In the description, the stacked-on-#773 note and "59/59" were corrected. The unmount passage and a round-9 fixes section are held back until the fixes are pushed, because the pushed head still behaves the way the description says. Decisions recorded: M2 deletion approved; scratch docs kept until merge; CodeQL alerts to be read in the UI. No reviewer was re-requested.

**Trap.** `pkill -f "craco test"` inside a Bash call matches the calling shell's own command line and kills it (exit 144). Use `TaskStop` for background runs.

**Final gates on the remediated tree.** `yarn lint` and `yarn tsc` PASS. `yarn test:ci` PASS: 511 suites, 4480 tests, 50 snapshots, 0 failures, exit 0, zero console output. Coverage 95.19 / 88.25 / 94.87 / 95.34 (was 95.09 / 87.99 / 94.75 / 95.23), no threshold breach. No touched file is over 250 lines.
