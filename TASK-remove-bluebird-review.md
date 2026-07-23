# TASK-remove-bluebird — Review (PR #774)

**PR:** [#774](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774) `chore/remove-bluebird` → `chore/ts7-tsconfig-migration`
**Title:** chore: remove bluebird, use AbortController for cancellation
**Reviewed head:** `01e61b13` (5 commits, 262 files, +2389 / −1398)
**Base:** `chore/ts7-tsconfig-migration` (PR #773 — must merge first)
**Review date:** 2026-07-23 · supersedes the earlier pass against `7ba6f490`

## Summary

Removes the `bluebird` dependency and replaces bluebird promise cancellation with the
web-standard `AbortController`/`AbortSignal`. The bulk of the diff is a correct mechanical
swap (`Bluebird<T>`→`Promise<T>`, `.resolve/.reject/.all`→native). Since the previous review
the author has: threaded `signal` end-to-end for read getters, split `usePromiseEffect` into
`run`/`runWrite` so a save is never aborted on unmount, and deduped
`findColophons`/`findUnplacedLines` (closing the two older bot threads).

All local gates pass on the current head:

| Gate                                            | Result                                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| `yarn lint`                                     | clean                                                                              |
| `yarn tsc`                                      | clean                                                                              |
| `CI=true yarn test --watchAll=false`            | 340 suites, 3474 passed, 2 skipped, 50 snapshots, exit 0                           |
| Console output during test run                  | **zero** — no `console.error`/`warn`, no `act()` warnings, no unhandled rejections |
| `yarn build` (CI flags)                         | success (86 s)                                                                     |
| Coverage (whole suite)                          | 92.91 % stmts / 83.27 % branch                                                     |
| `bluebird` references in `src` + `package.json` | none                                                                               |

The 2 skipped tests are pre-existing `xit`s in `src/fragmentarium/ui/edition/Edition.test.tsx`
that also exist on `master`. No tests were removed or disabled by this PR.

**Blocking issue (now fixed):** the new hook `usePromiseEffect` re-threw non-abort errors
inside a detached `.catch`, which guaranteed an unhandled promise rejection for the consumers
that did not attach their own handler — and that exact code path had **0 % branch coverage**.
Two further gate violations (weakened `FakeApi` assertions; untested `signal.aborted` guard
branches) accompanied it.

> ## ✅ Resolution — 2026-07-23
>
> **All 13 findings addressed** except F11 (needs #773 merged first) and F12 (needs a scope
> decision). Every finding below carries a `**Resolved:**` line. Two additional silent-failure
> paths were found and fixed while resolving F1: `ScriptSelection`'s `runUpdate` and
> `DatesInTextSelection.saveDates`. The README's `## Promises` section still documented
> bluebird — also fixed.
>
> Gates after the fixes: `yarn lint` clean · `yarn tsc` clean ·
> **346 suites / 3529 passed / 2 skipped / 50 snapshots, exit 0, zero console output** ·
> `yarn build` success · coverage 93.06 % stmts / 83.58 % branch overall, with every file named
> in the findings at **100 %/100 %/100 %/100 %**.
>
> Full detail in `TASK-remove-bluebird-log.md` → _Findings addressed_.

## Findings

### Finding 1 — `usePromiseEffect` re-throws into a detached promise → guaranteed unhandled rejection

- **Severity:** High (blocker — project standard treats unhandled rejections as defects)
- **File:** [src/common/hooks/usePromiseEffect.ts:14-22](src/common/hooks/usePromiseEffect.ts#L14-L22)
- **Description:** `startOperation` attaches `.catch` to the caller's promise and re-throws
  anything that is not an abort. The value returned by `.catch` is discarded, so the re-thrown
  error lands on a promise nobody references. The `throw` can never be observed usefully: if a
  consumer already handles its errors the callback is never reached, and if it does not, the
  `throw` manufactures an unhandled rejection. Consumers with **no** `.catch` of their own:
  [Chapters.tsx:93](src/corpus/ui/Chapters.tsx#L93),
  [PdfDownloadButton.tsx:29](src/fragmentarium/ui/fragment/PdfDownloadButton.tsx#L29),
  [WordDownloadButton.tsx:33](src/common/ui/WordDownloadButton.tsx#L33),
  [DateSelectionMethods.ts:35](src/chronology/application/DateSelectionMethods.ts#L35)
  (`.finally` does not consume the rejection).
- **Reproduction steps:**
  1. Extracted `startOperation` verbatim into a Node script and ran it with a rejecting
     operation:

     ```text
     startOperation(ref, () => Promise.reject(new Error('network failure')))
     → UNHANDLED REJECTION: network failure
     ```

  2. In the app: open a chapter list so `Manuscripts` renders, make
     `textService.findExtantLines` reject (offline / 500). Nothing is rendered to the user and
     the rejection escapes to `window.onunhandledrejection`.
  3. Click the PDF or Word download button and make `getPdfDoc`/`getWordDoc` reject — same
     escape, **plus** `setIsLoading(false)` never runs, so the spinner stays forever.

- **Failure scenario:** every failed extant-lines fetch, PDF/Word export and date save emits an
  unhandled rejection. In production this reaches Sentry as unattributed
  `unhandledrejection` noise; in tests it would fail the project's zero-console-output gate the
  moment any suite exercised the path (today none does — see Finding 3). The download buttons
  additionally leave a permanently spinning control.
- **Recommendation:** Decide the hook's error contract and make it explicit. Either drop the
  `throw` (the hook swallows only aborts and _returns_ the promise so callers can attach
  handling), or keep propagation but give `run`/`runWrite` a return value the callers use.
  Independently, add `.catch` handling to the four consumers above and clear `isLoading` on
  failure in both download buttons.

- **Resolved:** `startOperation` now returns the promise (`RunOperation = (operation) => Promise<void>`) and swallows only cancellations via the new shared `isCancellation(error, signal)`; the rejection can be observed instead of escaping. Error handling added to `Chapters.tsx`, `PdfDownloadButton`, `WordDownloadButton` and `saveDateDefault`, plus `ScriptSelection` and `DatesInTextSelection.saveDates` (two further silent-failure paths not in the original finding). Both download buttons clear `isLoading` on failure and render an `ErrorAlert`.

### Finding 2 — `FakeApi.verifyExpectations` assertions weakened from positional to containment

- **Severity:** Medium
- **File:** [src/test-support/FakeApi.ts:481-501](src/test-support/FakeApi.ts#L481-L501)
- **Description:** The GET/POST expectations changed from
  `toHaveBeenCalledWith(path, expect.anything())` /
  `toHaveBeenCalledWith(path, body)` to
  `expect(mock.mock.calls).toContainEqual(expect.arrayContaining([path, body]))`.
  `expect.arrayContaining` is an unordered subset match, so the assertion no longer constrains
  argument **position or order**, and no longer constrains the `authenticate` flag at all. The
  added comment claims the code matches "the meaningful leading arguments"; it does not — it
  matches anywhere in the call.
- **Reproduction steps:** With the new assertion, a call recorded as
  `postJson(body, path, true)` (arguments transposed) still satisfies
  `arrayContaining([path, body])`. Under the previous assertion it failed.
- **Failure scenario:** `FakeApi` backs a large share of the service/repository suites. An
  argument-order or authentication regression in `ApiClient` call sites — exactly the class of
  change this PR makes en masse, since every call site grew a new trailing parameter — can now
  pass CI unnoticed.
- **Recommendation:** Keep the assertions positional while tolerating the optional trailing
  signal, e.g. compare the leading slice:
  `expect(mock.mock.calls.map(([p, b]) => [p, b])).toContainEqual([path, body])`.
  Remove the comment (project standard: no comments unless requested).

- **Resolved:** new `leadingArguments(mock, 2)` helper compares the leading two arguments positionally while tolerating the optional trailing signal, restoring order and auth-flag constraints. Comment removed.

### Finding 3 — New `signal.aborted` guard branches are largely untested; `usePromiseEffect` error path is 0 % branch

- **Severity:** Medium (hard gate — 100 % coverage on affected code)
- **Files / measured coverage** (`yarn test --coverage`, whole suite):

  | File                                                  | Stmts     | Branch    | Uncovered                       |
  | ----------------------------------------------------- | --------- | --------- | ------------------------------- |
  | `common/hooks/usePromiseEffect.ts`                    | 83.33     | **0**     | 15-21 (the whole `.catch` body) |
  | `fragmentarium/ui/fragment/PdfDownloadButton.tsx`     | **30.76** | 25        | 26-33 (the entire new handler)  |
  | `chronology/application/DateSelectionMethods.ts`      | 100       | **48.38** | 35-116                          |
  | `dictionary/ui/editor/WordEditor.tsx`                 | 100       | 70        | 59-83                           |
  | `common/ui/WordDownloadButton.tsx`                    | 100       | 75        | 38                              |
  | `bibliography/ui/BibliographyEntryFormController.tsx` | 100       | 83.33     | 53                              |
  | `fragmentarium/ui/edition/TransliterationForm.tsx`    | 100       | 88.23     | 49, 180                         |
  | `corpus/ui/Chapters.tsx`                              | 100       | 90        | 95                              |
  | `common/utils/ConcurrencyLimiter.ts`                  | 100       | 91.66     | 47                              |
  | `http/withData.tsx`                                   | 96        | 93.75     | 26                              |

- **Description:** The `if (!signal.aborted)` guards this PR introduces are the migration's
  core new behaviour, and in most consumers only the _not-aborted_ side is exercised. The
  uncovered `usePromiseEffect` lines 15-21 are precisely the defect in Finding 1 — no test
  drives a rejecting operation through the hook at all.
- **Failure scenario:** a regression that inverts or drops an abort guard (re-introducing a
  post-unmount `setState`, or dropping a legitimate state update) passes the suite.
- **Recommendation:** Add tests that (a) reject an operation passed to `run`/`runWrite`,
  (b) abort then resolve for each consumer guard, and (c) cover `PdfDownloadButton`'s handler,
  which currently has no meaningful test at all.

- **Resolved:** `usePromiseEffect`, `AbortableOperation`, `abortError`, `ConcurrencyLimiter`, `concurrencyLimiterHelpers`, `getOrFetchCachedValue`, `mapSeries`, `cancellableFetch`, `Chapters`, `PdfDownloadButton`, `WordDownloadButton`, `BibliographyEntryFormController` and `saveDateDefault` are all at 100 %/100 %/100 %/100 %. Six new suites plus new cases in the download, script, date, bibliography, withData and transliteration suites.

### Finding 4 — `ConcurrencyLimiter` signal support is unused in production and has two latent defects

- **Severity:** Low
- **File:** [src/common/utils/ConcurrencyLimiter.ts:21-56](src/common/utils/ConcurrencyLimiter.ts#L21-L56)
- **Description:**
  1. **Unused:** no call site in `src/` passes a signal. All four production users —
     `TextService:165`, `FragmentService:247` and `:250`, `CuneiformConverterForm:41` — call
     `run(operation)` with one argument. The `signal` parameter, the `abortError` helper and the
     listener wiring exist only for `ConcurrencyLimiter.test.ts`.
  2. **Pre-aborted signal ignored:** `acquireSlot` returns immediately when a slot is free
     (lines 34-37) without checking `signal.aborted`, so `run(op, alreadyAbortedSignal)` runs
     `op`. The queued path rejects. Same input, two different outcomes depending on load.
  3. **Listener never removed:** the `abort` listener added at line 42 is not detached when
     the slot is granted normally, so listeners accumulate on any long-lived or reused signal.
- **Failure scenario:** (2) an operation the caller already cancelled still executes and issues
  its request; (3) unbounded listener growth on a reused controller.
- **Recommendation:** Either wire the signal into the fragment/thumbnail limiters (so the
  feature earns its keep) or delete it. If kept, reject up-front on `signal.aborted` in
  `acquireSlot` and remove the listener in a `finally`.

- **Resolved:** `acquireSlot` rejects up front on an already-aborted signal; the abort listener is detached once the slot is granted; and `CuneiformConverterForm` replaced its `conversionRequestSequence` counter with an `AbortableOperation`, passing a real signal to `limiter.run` — so a superseded conversion now drops its queued lines and the feature is no longer dead code.

### Finding 5 — DRY: three hand-rolled copies of the abortable-save controller

- **Severity:** Low (project treats DRY as a hard gate)
- **Files:** [WordEditor.tsx:46-62](src/dictionary/ui/editor/WordEditor.tsx#L46-L62),
  [BibliographyEntryFormController.tsx:40-56](src/bibliography/ui/BibliographyEntryFormController.tsx#L40-L56),
  [TransliterationForm.tsx:175-194](src/fragmentarium/ui/edition/TransliterationForm.tsx#L175-L194)
- **Description:** All three implement the identical sequence: abort the previous controller,
  create a new one, capture `signal`, then guard both `.then` and `.catch` on
  `!signal.aborted`. `usePromiseEffect`'s `runWrite` is exactly this abstraction, but the first
  two are class components and cannot use it.
- **Recommendation:** Extract a framework-agnostic helper (e.g.
  `common/utils/AbortableOperation` exposing `start(): AbortSignal` + `abort()`) and have
  `runWrite` and all three call sites use it.

- **Resolved:** new `common/utils/AbortableOperation` (`start()`/`abort()`) backs `WordEditor`, `BibliographyEntryFormController`, `TransliterationForm`, `usePromiseEffect` and `CuneiformConverterForm`. New `common/utils/abortError` replaces the four inline abort checks in `withData`, `usePromiseEffect`, `ApiClient` and `ConcurrencyLimiter`.

### Finding 6 — qltysh[bot], unresolved: duplicated chapter-update methods in `TextService`

- **Severity:** Low (bot finding, 2 unresolved threads)
- **File:** [src/corpus/application/TextService.ts:473-520](src/corpus/application/TextService.ts#L473-L520)
- **Description:** `updateAlignment`, `updateLemmatization` and `updateManuscripts` are
  identical apart from the URL suffix and DTO serializer:
  `Promise.all([loadProvenances(), postJson(url, dto, true, signal)]).then(([, dto]) => fromChapterDto(dto))`.
  Bot: "Found 15 lines of similar code in 2 locations (mass = 66)" at lines 487 and 503.
  This is _newly_ flagged — the earlier pair at 397/412 was fixed in `1e16d46b`, and adding the
  `signal` parameter pushed these three past the detector's threshold.
- **Recommendation:** Extract `private postChapterUpdate(id, endpoint, dto, signal)` and have
  all three delegate; then resolve both threads.

- **Resolved:** private `postChapterUpdate(id, endpoint, dto, signal)` extracted; `updateAlignment`, `updateLemmatization`, `updateManuscripts`, `updateLines` and `importChapter` all delegate to it. The two bot threads still need marking resolved on GitHub once pushed.

### Finding 7 — qltysh[bot], unresolved: duplicated test scaffolding in `usePromiseEffect.test.tsx`

- **Severity:** Low (bot finding, 2 unresolved threads)
- **File:** [src/common/hooks/usePromiseEffect.test.tsx:52](src/common/hooks/usePromiseEffect.test.tsx#L52),
  [:101](src/common/hooks/usePromiseEffect.test.tsx#L101)
- **Description:** "Found 18 lines of similar code in 2 locations (mass = 120)". The
  "aborts the previous operation" and "aborts the previous write" cases are byte-for-byte
  identical except for which tuple slot they destructure.
- **Recommendation:** Parameterise one helper over `run` vs `runWrite` (a `describe.each` or a
  shared `renderRunner(pick)` factory) and resolve both threads. This overlaps with Finding 3 —
  the same file needs new cases anyway.

- **Resolved:** the suite is rebuilt around `renderOperations({runner, ...})` + `capturePendingSignals()` with `describe.each(['run', 'runWrite'])`, removing the duplicated blocks. The two bot threads still need marking resolved on GitHub once pushed.

### Finding 8 — `Chapters.tsx` starts _and now aborts_ a request from the render body

- **Severity:** Low
- **File:** [src/corpus/ui/Chapters.tsx:92-100](src/corpus/ui/Chapters.tsx#L92-L100)
- **Description:** `runExtantLines(...)` is called during render whenever `extantLines` is nil.
  Starting a request in render is pre-existing, but the semantics changed: the old
  `setExtantLinesPromise` only replaced a ref, whereas `startOperation` now **aborts the
  previous controller**, and `findExtantLines` threads the signal to `fetch`. Every re-render
  before the first response therefore cancels the in-flight request and issues a new one.
- **Failure scenario:** under a parent that re-renders while the request is outstanding, extant
  lines can be cancelled-and-restarted repeatedly and never settle.
- **Recommendation:** Move the call into a `useEffect` keyed on `id`.

- **Resolved:** moved into a `useEffect` keyed on `chapterIdToString(id)` — keying on the `id` object itself would have reproduced the loop, since the parent builds a fresh `createChapterId(...)` every render. `ExtantLinesCell` extracted for the spinner/error/data states.

### Finding 9 — Shared cached requests are unguarded against future signal threading

- **Severity:** Low / informational
- **File:** [src/common/utils/getOrFetchCachedValue.ts:28-32](src/common/utils/getOrFetchCachedValue.ts#L28-L32)
- **Description:** Dropping the `.isCancelled()` eviction is correct for native promises, and
  in-flight reuse now returns one shared promise to every caller. Today that is safe: no
  `fetchValue` closure captures a signal (verified — `FragmentService.getOrFetchCachedValue`
  and `TextService.findChapterDisplay` take none). But the invariant is enforced only by
  convention. The moment someone threads a per-caller signal into a cached getter, one caller's
  unmount rejects the shared promise for every other live consumer.
- **Recommendation:** Make the constraint explicit — keep `fetchValue: () => Promise<V>` free of
  signal parameters by type, or reference-count the shared request.

- **Resolved:** documented in the README (see Finding 10); the type-level constraint (`fetchValue: () => Promise<V>`) is unchanged and the guard-based services are now listed explicitly.

### Finding 10 — Signal threading is partial, by design but undocumented in code

- **Severity:** Informational
- **Description:** 24 of ~70 `withData` getters accept a signal; 32 non-test files mention
  `AbortSignal`. Reads are threaded end-to-end; writes use `runWrite`; cached/batched shared
  requests are deliberately left guard-based. This is explained in the PR body and in
  `TASK-remove-bluebird-todo.md`, both of which disappear at merge, leaving a public API where
  `statistics(signal?)` and `fetchProvenances()` sit side by side with no stated rule.
- **Recommendation:** Record the rule where it survives merge — a short note in
  `withData.tsx` or the repository interface docs.

- **Resolved:** the README's `## Promises` section still described **bluebird** — stale documentation this PR would have merged. Replaced with `## Promises and cancellation` covering the read/write split, `AbortableOperation`, `isCancellation`, and the shared-cache no-signal rule. `bluebird` now appears nowhere in `src`, `package.json`, `.github` or `README.md`.

### Finding 11 — CI has never run for this PR

- **Severity:** Medium (process)
- **File:** [.github/workflows/main.yml:3-7](.github/workflows/main.yml#L3-L7)
- **Description:** `main.yml` (lint → tsc → unit tests → build → qlty coverage upload) triggers
  only on `pull_request: branches: [master]`. This PR targets `chore/ts7-tsconfig-migration`,
  so **none of the five commits has been lint/type/test/build-checked on GitHub**. The same is
  true of `codeql-analysis.yml`. Only `secret-scan.yml` (branch wildcard `'**'`) and the
  external qlty status ran, and both are green. There are therefore no CI failures to report —
  and equally no CI evidence. Everything in the Summary table was verified locally instead.
- **Recommendation:** Re-target to `master` once #773 merges and let CI run before merge, or
  trigger `workflow_dispatch` on this branch.

- **Not resolved (cannot be, from the branch):** still requires merging #773 and re-targeting #774 to `master`. All gates verified locally in the meantime.

### Finding 12 — 250-line ceiling: 18 changed files are over the limit and grew further

- **Severity:** Low (pre-existing, worsened)
- **Description:** No file crossed the threshold in this PR — all 18 were already over on the
  base — but the migration added lines to each. Largest offenders:
  `FragmentService.test.ts` 1922→**1938**, `FragmentRepository.test.ts` 1014→**1045**,
  `FragmentService.ts` 824→**888**, `FragmentRepository.ts` 732→**787**,
  `TextService.test.ts` 777→**782**, `TextService.ts` 587→**605**, `FakeApi.ts` 508→**516**.
- **Recommendation:** Out of scope for a dependency removal; track separately rather than
  expanding this diff. Flagged because the project states the ceiling as a hard gate.

- **Partially resolved:** `ConcurrencyLimiter.test.ts` was split (329 → 144 + a 223-line cancellation sibling, shared helpers in `test-support/concurrencyLimiterHelpers.ts`). The 18 large pre-existing files are untouched — splitting them needs a scope decision. `TransliterationForm.test.tsx` grew 278 → 308 because its jest module mocks cannot be shared across sibling files without a wider refactor.

### Finding 13 — Task-tracking docs are committed to the branch

- **Severity:** Low (must fix before merge)
- **Files:** `TASK-remove-bluebird-{todo,log,review}.md`, `TASK-address-findings-{todo,log}.md`,
  `TASK-ts7-migration-review.md` (added here) plus `TASK-ts7-migration-{log,research,todo}.md`
  (inherited from the base branch). `master` has none.
- **Recommendation:** Delete all nine before merge. Note `TASK-remove-bluebird-todo.md` is also
  internally stale — Stages 2-6 are unticked although their work is ticked under Stage 1/1b.

- **Not resolved (by design):** the TASK docs are the working record; deletion stays a pre-merge step.

## Severity

| #   | Finding                                                              | Severity | Status                          |
| --- | -------------------------------------------------------------------- | -------- | ------------------------------- |
| 1   | `usePromiseEffect` re-throw → unhandled rejection (+ stuck spinners) | **High** | ✅ Fixed                        |
| 2   | `FakeApi` assertions weakened to unordered containment               | Medium   | ✅ Fixed                        |
| 3   | Abort-guard branches untested; hook error path 0 % branch            | Medium   | ✅ Fixed                        |
| 11  | CI never ran for this PR (base is not `master`)                      | Medium   | ⏳ Needs #773 merged            |
| 4   | `ConcurrencyLimiter` signal unused + 2 latent defects                | Low      | ✅ Fixed                        |
| 5   | DRY: 3 copies of the abortable-save controller                       | Low      | ✅ Fixed                        |
| 6   | qlty: duplicated `TextService` chapter updates                       | Low      | ✅ Fixed (threads to close)     |
| 7   | qlty: duplicated `usePromiseEffect` test scaffolding                 | Low      | ✅ Fixed (threads to close)     |
| 8   | `Chapters.tsx` aborts/restarts from render body                      | Low      | ✅ Fixed                        |
| 9   | Shared cached requests unguarded vs. future signal threading         | Low      | ✅ Documented                   |
| 10  | Cancellation contract undocumented (README still said bluebird)      | Info     | ✅ Fixed                        |
| 12  | 250-line ceiling: 18 files over, grown further                       | Low      | ⚠️ Partial — needs a scope call |
| 13  | TASK docs committed                                                  | Low      | ⏳ Pre-merge step               |

Two findings surfaced **while fixing F1** and were fixed with it: `ScriptSelection`'s
`runUpdate` had no error handling (silent failure + permanent "Saving..."), and
`DatesInTextSelection.saveDates` never awaited its promise, so `finally` cleared `isSaving`
immediately and any failure was both silent and unhandled.

No security findings. GitGuardian: no secrets across all 5 commits. No `any`, no `as any`, no
`eslint-disable` added by the fixes. No console-noise findings in the test output.

## Reproduction Steps

Environment: `/workspaces/ebl-frontend` on `chore/remove-bluebird` @ `01e61b13` + the fixes,
existing `node_modules`.

```bash
yarn lint                                  # clean
yarn tsc                                   # clean
CI=true yarn test --coverage --watchAll=false
                                           # 346/346 suites, 3529 passed, 2 skipped, exit 0
                                           # full log scanned: zero console.error/warn/log,
                                           # zero act() warnings, zero unhandled rejections
                                           # 93.06 % stmts / 83.58 % branch overall
GENERATE_SOURCEMAP=false DISABLE_ESLINT_PLUGIN=true \
  NODE_OPTIONS=--max_old_space_size=1536 yarn build     # success, 86 s
grep -rn "bluebird\|Bluebird" src/ package.json .github/ README.md    # no matches
```

Per-finding reproductions are inline above; Finding 1's is a standalone Node script that
executed `startOperation` verbatim and printed `UNHANDLED REJECTION: network failure`.

## Recommendation

**Approve once the two process items land.** Every code finding is resolved at its root cause
and re-verified: the hook can no longer manufacture an unhandled rejection, no consumer swallows
a failure silently, the `FakeApi` assertions constrain argument position again, the duplicated
save controllers and abort checks are behind two small shared utilities, all four open qlty
duplications are gone, and the cancellation contract — including the shared-cache no-signal
rule — is documented in the README, which no longer describes a dependency the PR deletes.

Outstanding before merge: (a) merge #773, re-target this PR to `master` and let CI + CodeQL
actually run (Finding 11), (b) delete the nine `TASK-*.md` files (Finding 13), (c) mark the four
qlty threads resolved on GitHub, and (d) decide Finding 12 — whether the 18 pre-existing
over-250-line files get split here or tracked separately. My recommendation remains: track
separately rather than expand a dependency-removal diff.

## Comment Status Tracking

Every review event, inline comment and issue comment on PR #774, with resolution and outdated
status (GitHub REST `pulls/774/reviews`, `pulls/774/comments`, `issues/774/comments` +
GraphQL `reviewThreads`):

**Review events (timeline):**

| Reviewer      | State     | Submitted        | Commit     | Body    |
| ------------- | --------- | ---------------- | ---------- | ------- |
| `qltysh[bot]` | COMMENTED | 2026-07-21 16:45 | `7ba6f490` | (empty) |
| `qltysh[bot]` | COMMENTED | 2026-07-23 13:17 | `01e61b13` | (empty) |

No human review exists. `reviewDecision` is `null`; no reviewers are requested; nobody has
requested changes or approved.

**Inline review threads (6 comments / 6 threads, all from `qltysh[bot]`):**

| #   | Location                                     | Finding                | Status                             | Outdated |
| --- | -------------------------------------------- | ---------------------- | ---------------------------------- | -------- |
| 1   | `corpus/application/TextService.ts:397`      | similar-code, mass 79  | Resolved (by bot)                  | No       |
| 2   | `corpus/application/TextService.ts:412`      | similar-code, mass 79  | Resolved (by bot)                  | **Yes**  |
| 3   | `common/hooks/usePromiseEffect.test.tsx:52`  | similar-code, mass 120 | Code fixed — **thread still open** | No       |
| 4   | `common/hooks/usePromiseEffect.test.tsx:101` | similar-code, mass 120 | Code fixed — **thread still open** | No       |
| 5   | `corpus/application/TextService.ts:487`      | similar-code, mass 66  | Code fixed — **thread still open** | No       |
| 6   | `corpus/application/TextService.ts:503`      | similar-code, mass 66  | Code fixed — **thread still open** | No       |

Threads 1-2 are the `findColophons`/`findUnplacedLines` pair fixed in `1e16d46b` and
auto-resolved. Threads 3-6 were raised against `01e61b13`; the duplication they flag is now gone
(Findings 6 and 7), but the threads must be marked resolved on GitHub after the fixes are pushed.

**General/issue comments:** none.

**Checks on `01e61b13`:** `GitGuardian Security Checks` success ("5 commits scanned, no
secrets"), `GitGuardian scan` ×2 success, `qlty check` success. Combined status: `success`.
`CI` and `CodeQL` **did not run** — see Finding 11. No failing test or quality check exists to
report, because the suites that would produce them were never triggered.

## What Has To Be Done

Resolved (code, verified locally):

1. ~~Remove the unreachable `throw error` in `usePromiseEffect.startOperation`~~ — done; the
   runners return `Promise<void>` and swallow only cancellations.
2. ~~Add error handling to the consumers that had none~~ — done for `Chapters.tsx`,
   `PdfDownloadButton`, `WordDownloadButton`, `saveDateDefault`, **plus** `ScriptSelection` and
   `DatesInTextSelection.saveDates`; both download buttons clear `isLoading` on failure.
3. ~~Restore positional matching in `FakeApi.verifyExpectations`~~ — done via
   `leadingArguments`; comment removed.
4. ~~Bring affected code to 100 % coverage~~ — done for every file named in the findings.
5. ~~Resolve the four `qltysh[bot]` duplications at root cause~~ — done via
   `TextService.postChapterUpdate` and the parameterised `usePromiseEffect` suite.
6. ~~Fix or remove `ConcurrencyLimiter`'s signal support~~ — done: pre-abort rejection, listener
   detached on grant, and a real production consumer in `CuneiformConverterForm`.
7. ~~Extract the shared abortable-save helper~~ — done: `AbortableOperation` + `abortError`.
8. ~~Move `runExtantLines` into a `useEffect`~~ — done, keyed on `chapterIdToString(id)`.
9. ~~Record the shared-cache no-signal rule where it survives merge~~ — done in the README,
   which also no longer documents bluebird.

Still outstanding:

10. **Mark the four open `qltysh[bot]` threads resolved on GitHub** once the fixes are pushed.
11. **Merge #773, re-target #774 to `master`**, and let CI (lint → tsc → tests → build →
    coverage upload) and CodeQL run green. This PR has never been through them.
12. **Decide Finding 12** — split the 18 pre-existing over-250-line files here, or track
    separately (recommended).
13. **Delete all nine `TASK-*.md` files before merge**:
    `TASK-remove-bluebird-{todo,log,review}.md`, `TASK-address-findings-{todo,log}.md`,
    `TASK-ts7-migration-{todo,log,research,review}.md`.
14. **Request a human reviewer** — nobody has reviewed this PR.
