# TASK-remove-bluebird — TODO

Remove the `bluebird` dependency entirely, replacing promise cancellation with the
web-standard `AbortController`/`AbortSignal` threaded through the fetch chain.
Chosen approach: **AbortSignal threading** (not a custom promise wrapper).
Branch: `chore/remove-bluebird`. Separate PR from #773 (tsconfig migration).

Scope: 176 files import bluebird. ~18 use the cancellation API; a handful use
`mapSeries`/`delay`/`reflect`/`Promise.config`/`try`/`map`; the rest are mechanical
`Promise` typings + `.resolve/.reject/.all` (native-compatible).

Status: [x] done · [~] in progress · [ ] pending

## Stage 1 — fetch foundation (signal → fetch) [DONE]

- [x] `cancellableFetch.ts` → native `fetch`, signal via options.
- [x] `ApiClient.ts` → native `Promise`, thread `signal?` through fetch/fetchJson/fetchBlob/postJson/putJson; skip capturing `AbortError`.
- [x] `withData.tsx` → own `AbortController`, pass `signal` to getter, `abort()` on cleanup; detect `AbortError`/`signal.aborted`.
- [x] Global mechanical sweep of 175 files (imports removed, `Bluebird<T>`→`Promise<T>`, `.resolve/.reject/.all`→native).
- [x] `Promise.config` (bluebird cancellation) removed from `index.tsx` + `setupTests.ts`.
- [x] `mapSeries` native helper + TextService/LemmatizationFactory.
- [x] 4 `.all(promise-of-array)` / tuple-inference fixes (AfoRegisterRepository, GlossaryFactory, WordDisplayLogograms, WordInfoLemmas).

## Stage 1b — cancellation consumers [DONE]

- [x] `usePromiseEffect.ts` → `AbortController` `[run, cancel]` API + 8 consumers migrated.
- [x] `ConcurrencyLimiter.ts` (+ test) → signal-based queue abort.
- [x] `getOrFetchCachedValue.ts` → in-flight reuse (dropped `.isCancelled()`).
- [x] Save-forms: `WordEditor`, `TransliterationForm`, `BibliographyEntryForm(Controller)`.
- [x] `CuneiformConverterForm` → concurrency via `ConcurrencyLimiter`.
- [x] Rewrote 10 cancellation test suites to AbortController semantics.

## Gates

- [x] `yarn tsc` → clean.
- [x] `yarn lint` → clean.
- [x] Full `CI=true yarn test --watchAll=false` → 340 suites / 3470 passed, 2 skipped (pre-existing), console-clean.
- [x] `yarn build` → success.
- [x] `bluebird` + `@types/bluebird` removed from package.json.
- [x] Commit + push branch (`7ba6f490`, pushed to `origin/chore/remove-bluebird`).
- [x] Open PR (separate from #773) → #774.
- [ ] Remove TASK docs before merge.

## Review follow-ups — head `01e61b13`, 2026-07-23

Raised in `TASK-remove-bluebird-review.md`. All code findings resolved on 2026-07-23; the
remaining boxes are pre-merge/process steps.

- [x] **F1** `usePromiseEffect.startOperation` now returns the promise (`RunOperation`) and
      swallows only cancellations, so it can no longer manufacture an unhandled rejection.
- [x] **F1** Error handling added to `Chapters.tsx`, `PdfDownloadButton`, `WordDownloadButton`,
      `saveDateDefault`, plus `ScriptSelection` and `DatesInTextSelection.saveDates` (two extra
      silent-failure paths found while fixing). Both download buttons clear `isLoading` on failure.
- [x] **F2** `FakeApi.verifyExpectations` compares the leading arguments positionally via
      `leadingArguments`; added comment removed.
- [x] **F3** Every file changed by this PR that the findings named is at 100 % statements,
      branches, functions and lines. New suites for `abortError`, `AbortableOperation`,
      `ConcurrencyLimiter` cancellation, `saveDateDefault`, `Chapters`, `PdfDownloadButton`.
- [x] **F4** `ConcurrencyLimiter` rejects on an already-aborted signal and detaches the abort
      listener once the slot is granted; `CuneiformConverterForm` now passes a real signal, so the
      feature is no longer dead code.
- [x] **F5** `common/utils/AbortableOperation` + `common/utils/abortError` replace the three
      duplicated save controllers and the four inline abort checks.
- [x] **F6** `TextService.postChapterUpdate` extracted; five methods delegate to it.
- [x] **F7** `usePromiseEffect.test.tsx` rewritten around a shared `renderOperations` helper and
      `describe.each(['run', 'runWrite'])`.
- [x] **F8** `runExtantLines` moved into a `useEffect` keyed on `chapterIdToString(id)`;
      `ExtantLinesCell` extracted for the spinner/error/data states.
- [x] **F9/F10** README `## Promises` section (which still documented bluebird) replaced with
      `## Promises and cancellation`, including the shared-cache no-signal rule.
- [ ] **Resolve the four qlty threads on GitHub** once the branch is pushed (F6/F7 code is fixed).
- [ ] **F11** Merge #773, re-target #774 to `master`, let CI + CodeQL run green (they never have).
- [ ] **F12** 250-line ceiling: 18 pre-existing files remain over the limit — needs a decision on
      whether to split them here or track separately. `ConcurrencyLimiter.test.ts` was split.
- [ ] **F13** Delete all nine `TASK-*.md` files before merge.
- [x] Gates re-run after the fixes: `yarn lint`, `yarn tsc`, full suite (console-clean),
      `yarn build`, coverage.
- [ ] Request a human reviewer (none has reviewed yet).
