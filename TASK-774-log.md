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
