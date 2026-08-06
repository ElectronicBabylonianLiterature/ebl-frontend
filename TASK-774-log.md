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
