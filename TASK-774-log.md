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
