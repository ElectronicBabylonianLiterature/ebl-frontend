# TASK-remove-bluebird — Work Log

Remove the `bluebird` dependency, replacing promise cancellation with the web-standard
`AbortController`/`AbortSignal`. Branch `chore/remove-bluebird`; separate PR from #773.

## Approach

**AbortSignal threading** (user's choice over a custom cancellable-promise wrapper). The
`AbortController` lives in the React layer; a `signal` threads down to `fetch`.

## Core changes

- **`cancellableFetch`** → thin native `fetch(url, options)` (signal arrives via options).
- **`ApiClient`** → native promises; `signal?: AbortSignal` threaded through
  `fetch`/`fetchJson`/`fetchBlob`/`postJson`/`putJson` into the fetch options.
  `AbortError` is **excluded** from error capture (an abort is expected, not a fault).
- **`withData`** → owns an `AbortController` per request, passes `signal` to the getter,
  `abort()`s on cleanup; cancellation detected via `AbortError`/`signal.aborted` (was
  `CancellationError`/`.isCancelled()`).
- **`usePromiseEffect`** → new `[run, cancel]` API. `run(operation => Promise)` owns an
  `AbortController`, aborts the previous run, swallows `AbortError`. All 8 consumers
  migrated (gate their state updates on `!signal.aborted`).
- **`ConcurrencyLimiter`** → native queue; optional `signal` aborts a _queued_ operation
  (removes it from the queue). Running operations are not interrupted (native limitation)
  but still release their slot on completion.
- **`getOrFetchCachedValue`** → in-flight requests are always reused (the `.isCancelled()`
  cache-eviction path is gone; a failed request still evicts via `.finally`).
- **Class save-forms** (`WordEditor`, `BibliographyEntryFormController`,
  `BibliographyEntryForm`) and **`TransliterationForm`** → `AbortController` field/ref,
  gate `setState` on `signal.aborted`.

## Bluebird-specific helpers

- `Promise.mapSeries`/`Bluebird.mapSeries` → new `common/utils/mapSeries` helper
  (sequential async map) in `TextService`, `LemmatizationFactory`.
- `Bluebird.map(_, _, { concurrency })` (CuneiformConverterForm) → routed through
  `ConcurrencyLimiter` (preserves the bound).
- `Promise.config({ cancellation: true })` removed from `index.tsx` / `setupTests.ts`.
- `.all(promise-of-array)` (Bluebird deep-resolve) simplified in `AfoRegisterRepository`,
  `GlossaryFactory`, `WordDisplayLogograms`; one tuple-inference annotation in
  `WordInfoLemmas`.

## Mechanical sweep

175 files: `import … from 'bluebird'` removed; `Bluebird<T>`→`Promise<T>`;
`.resolve/.reject/.all`→native. Test mocks kept explicit `Bluebird.resolve` where they
fed Bluebird-typed services → converted to native `Promise.resolve`.

## Test rewrites (cancellation semantics changed)

`cancellableFetch`, `withData`, `usePromiseEffect`, `ApiClient.edge-cases`,
`ConcurrencyLimiter`, `FragmentButton`, `WordEditor`, `BibliographyEditor`,
`FragmentService` — rewritten from Bluebird `.cancel()`/`.isCancelled()` assertions to
`AbortController`-observable behavior (signal aborted, no state update after unmount,
signal forwarded to fetch, aborted-queued-op removed, re-fetch after failed in-flight).
Aborted queued promises get `.catch()` guards to keep the console-clean gate.

## Dependency

`bluebird` + `@types/bluebird` removed from `package.json`; `yarn install` rerun.
(`node_modules/bluebird` remains only as a transitive dep of other packages; src has
zero references.)

## Behaviour notes / deliberate changes

- Data fetches (`withData` getters) abort the network on unmount **iff** the getter
  threads the signal to the service; where it does not, the existing `requestSequence`
  guard still prevents stale state (no correctness regression).
- Save/download flows gate state updates on `signal.aborted` rather than aborting the
  network mid-write (aborting an in-flight write is undesirable anyway).
- A "cancelled in-flight request" is no longer a concept; the cache reuses in-flight
  requests and evicts on settle.

## Gates

- `yarn tsc` → clean (184 files changed, +957/−996).
- `yarn lint` → clean (after prettier auto-fix).
- Full `CI=true yarn test --watch=false` → recorded here.
- `yarn build` → to run after tests.

## Review pass — 2026-07-23, head `01e61b13` (PR #774)

Full re-review of the PR at its current head, superseding the pass against `7ba6f490`.
Findings recorded in `TASK-remove-bluebird-review.md`.

### Pre-existing GitHub state gathered first (hard gate)

- Review events: 2 × `qltysh[bot]` COMMENTED (`7ba6f490`, `01e61b13`), both with empty bodies.
  No human review; `reviewDecision` = null; no requested reviewers; no issue/general comments.
- Inline threads: 6 comments / 6 threads, all `qltysh[bot]` similar-code. Threads at
  `TextService.ts:397`/`:412` resolved (the `:412` one outdated) — fixed by `1e16d46b`.
  Threads at `usePromiseEffect.test.tsx:52`/`:101` and `TextService.ts:487`/`:503` unresolved,
  not outdated.
- Checks on `01e61b13`: GitGuardian ×3 success, `qlty check` success, combined status success.

### Pre-existing issue found: CI has never run for this PR

Root cause: `.github/workflows/main.yml` and `codeql-analysis.yml` trigger only on
`pull_request: branches: [master]`, and #774 targets `chore/ts7-tsconfig-migration`. Only
`secret-scan.yml` (wildcard `'**'`) fires. No CI failure exists to fix — the lint/tsc/test/
build/coverage pipeline simply never executed against any of the 5 commits. Recorded as
Finding 11; resolution is to re-target to `master` after #773 merges (or `workflow_dispatch`).
All gates were therefore verified locally instead.

### Gates re-run locally on `01e61b13`

- `yarn lint` → clean (65 s).
- `yarn tsc` → clean (42 s).
- `CI=true yarn test --watchAll=false` → 340/340 suites, 3474 passed, 2 skipped, 50 snapshots,
  exit 0. Full (untruncated) log scanned: zero `console.error`/`warn`/`log`, zero `act()`
  warnings, zero unhandled rejections. The 2 skips are pre-existing `xit`s in
  `Edition.test.tsx` that also exist on `master`.
- `yarn build` with the CI flags → success (86 s).
- `CI=true yarn test --coverage --watchAll=false` → 92.91 % stmts / 83.27 % branch overall;
  per-file gaps on affected code tabulated in Finding 3.
- `grep -rn "bluebird\|Bluebird" src/ package.json` → no matches.

### Findings raised (13)

Blockers: 1 (`usePromiseEffect` re-throws into a detached promise → guaranteed unhandled
rejection; reproduced standalone in Node), 2 (`FakeApi.verifyExpectations` weakened from
positional to unordered `arrayContaining` matching), 3 (new `signal.aborted` guard branches
largely untested; the hook's error path is 0 % branch), 11 (no CI), plus the 4 unresolved bot
threads (6, 7) and the committed TASK docs (13). Non-blocking: 4, 5, 8, 9, 10, 12.

No changes were made to `src/` — this was a review-only pass.

## Findings addressed — 2026-07-23 (same review head, `01e61b13` + fixes)

All 13 review findings acted on. Code changes only in `src/` plus `README.md`; nothing committed.

### F1 — `usePromiseEffect` unhandled rejection (blocker)

Root cause: `startOperation` attached `.catch` and re-threw non-abort errors into a promise
nobody referenced, so the rejection was guaranteed to be unhandled for any consumer without its
own handler. Reproduced standalone in Node before the fix.

Fix: `startOperation` now returns the resulting promise (`run`/`runWrite`: `RunOperation =
(operation) => Promise<void>`), swallowing only cancellations via the new shared
`isCancellation(error, signal)`. A real error is still propagated, but on a promise the caller
can observe rather than into the void. Every consumer that had no handler now has one:

- `Chapters.tsx` — read moved into `useEffect` (F8) with an error branch and an `ErrorAlert` in
  the extant-lines cell instead of an endless spinner.
- `PdfDownloadButton.tsx` / `WordDownloadButton.tsx` — `.catch` that surfaces an `ErrorAlert`
  **and** clears `isLoading`, fixing the permanently-spinning control.
- `DateSelectionMethods.saveDateDefault` — rewritten from `.then/.finally/.then` to
  `.then(onSuccess, onError)`; new `setSaveError` threaded through `DateEditorStateProps` and
  rendered as an `ErrorAlert` in `DateEditor`'s popover.
- `ScriptSelection.tsx` — **additional consumer not caught in the review**: `runUpdate` had no
  error handling either, so a failed script save was silent and left "Saving..." forever.
- `DatesInTextSelection.saveDates` — pre-existing defect found while fixing the above: the
  promise was never awaited, so `finally` cleared `isSaving` immediately and a failure was
  both silent and unhandled. Now awaited with `catch` → `setSaveError` → `ErrorAlert`.

### F2 — `FakeApi` assertions

Restored positional matching via a `leadingArguments(mock, 2)` helper that compares the leading
two arguments and tolerates the optional trailing signal, so argument order and the auth flag
are constrained again. Comment removed (project standard: no comments).

### F3 — coverage

Everything changed by this PR that I touched is now at 100 %/100 %/100 %/100 %:
`usePromiseEffect`, `AbortableOperation`, `abortError`, `ConcurrencyLimiter`,
`concurrencyLimiterHelpers`, `getOrFetchCachedValue`, `mapSeries`, `cancellableFetch`,
`withData` (stmts/fn/lines), `Chapters`, `PdfDownloadButton`, `WordDownloadButton`,
`BibliographyEntryFormController`, `saveDateDefault`. New suites:
`abortError.test.ts`, `AbortableOperation.test.ts`, `ConcurrencyLimiter.cancellation.test.ts`,
`DateSelectionMethods.test.ts`, `Chapters.test.tsx`, `PdfDownloadButton.test.tsx`, plus new
cases in the download/script/date/bibliography/withData/transliteration suites.

### F4 — `ConcurrencyLimiter`

- `acquireSlot` now rejects up front when `signal.aborted`, instead of running the operation
  whenever a slot happened to be free.
- The abort listener is removed once the slot is granted (`waitingResolver` calls
  `removeEventListener`), so listeners no longer accumulate on a reused signal.
- No longer dead code: `CuneiformConverterForm` replaced its `conversionRequestSequence`
  counter with an `AbortableOperation` and passes the signal to `limiter.run`, so a superseded
  conversion now drops its queued lines instead of running them.

### F5 — DRY

New `common/utils/AbortableOperation` (`start(): AbortSignal` / `abort()`) replaces the three
hand-rolled copies in `WordEditor`, `BibliographyEntryFormController` and `TransliterationForm`,
and backs `usePromiseEffect` and `CuneiformConverterForm`. New `common/utils/abortError`
(`isAbortError` / `isCancellation` / `createAbortError`) replaces the four separate inline
abort checks in `withData`, `usePromiseEffect`, `ApiClient` and `ConcurrencyLimiter`.

### F6 / F7 — the four open qlty threads

- `TextService`: `updateAlignment`, `updateLemmatization`, `updateManuscripts`, `updateLines`
  and `importChapter` now delegate to a private `postChapterUpdate(id, endpoint, dto, signal)`.
- `usePromiseEffect.test.tsx`: rewritten around `renderOperations({runner, ...})` +
  `capturePendingSignals()` with a `describe.each(['run', 'runWrite'])`, removing the duplicated
  blocks the bot flagged at `:52`/`:101`.

### F8 — `Chapters.tsx`

`runExtantLines` moved out of the render body into a `useEffect` keyed on
`chapterIdToString(id)` (the `id` prop is a fresh object every parent render, so keying on the
object itself would have reproduced the abort/restart loop). Extracted `ExtantLinesCell` for the
spinner/error/data states.

### F9 / F10 — documenting the cancellation contract

The README's `## Promises` section still described **bluebird** — stale docs this PR would have
merged. Replaced with `## Promises and cancellation`, covering the read/write split, the
`AbortableOperation` pattern, `isCancellation`, and an explicit statement that shared cached
requests must not take a signal (with the list of guard-based services). `grep` now finds zero
`bluebird` references in `src`, `package.json`, `.github` **and** `README.md`.

### F11 — CI

Unchanged and unfixable from here: `main.yml`/`codeql-analysis.yml` only trigger on PRs into
`master`. Still requires merging #773 and re-targeting #774. All gates verified locally instead.

### F12 — 250-line ceiling

Not addressed; see the review. `ConcurrencyLimiter.test.ts` was split (329 → 144 + a 223-line
cancellation sibling, shared helpers in `test-support/concurrencyLimiterHelpers.ts`), but the 18
large pre-existing files remain over the limit. `TransliterationForm.test.tsx` grew 278 → 308
because its jest module mocks cannot be shared across sibling files without a wider refactor.

### F13 — TASK docs

Still present by design (they are the working record); deletion remains a pre-merge step.

### Pre-existing flaky test found and fixed while re-running the gates

`src/dictionary/ui/editor/FormInput.test.tsx` → "Value is a form › Displays all notes" failed
once in a full run and passed on re-run. Root cause: `src/test-support/word-fixtures.ts` created
its `Chance` instance **unseeded** (`new Chance()`), so `chance.word()` occasionally produced the
string `"on"` — which collides with the implicit `value="on"` of the `attested` checkbox, making
`screen.getByDisplayValue(note)` match two elements. Fixed at the root by seeding the instance
(`new Chance('word fixtures')`), matching the pattern already used elsewhere in the repo (e.g.
`TextView.integration.test.ts`). Full suite green afterwards.

Nine other `src/test-support/*fixtures*.ts` files still create unseeded `Chance` instances and
carry the same latent flakiness. Not changed here: reseeding them would shift fixture values
feeding snapshot tests, which is a separate change and not one of this PR's findings.

### Final gate results after every fix

- `yarn lint` → clean.
- `yarn tsc` → clean.
- `CI=true yarn test --watchAll=false` → **346 suites / 3529 passed / 2 skipped / 50 snapshots,
  exit 0, zero console output**.
- `yarn build` (CI flags) → success (71 s).
- Coverage → 93.06 % stmts / 83.58 % branch overall; every file named in the findings at 100 %.
