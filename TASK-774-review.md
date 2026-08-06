# TASK-774-review — PR #774 `chore: remove bluebird, use AbortController for cancellation`

- **PR**: [#774](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774)
- **Author**: khoidt
- **Head**: `5ef4a984a6d6d59039db04cfadea013a7efe457e`
- **Base**: `chore/ts7-tsconfig-migration` (stacked on #773, to be re-targeted to `master`)
- **Size**: +3870 / −1596 across 275 files, 6 commits
- **Mergeable**: yes (`clean`)
- **Reviewed**: 2026-08-06, against PR head, in an isolated worktree

---

## Summary

The PR does what it says: `bluebird` and `@types/bluebird` are gone from `package.json`, `src`
has zero `bluebird` references, and cancellation is expressed with the web-standard
`AbortController`/`AbortSignal` threaded from the React layer down into `fetch`. The
infrastructure work is solid — `ConcurrencyLimiter` correctly detaches its abort listener on
slot grant and does not leak slots, `getOrFetchCachedValue` de-duplicates in-flight requests,
and `Chapters.tsx` gains real error handling while moving a side-effect out of render into a
`useEffect`. All three local hard gates pass at head.

The blocking problem is the write path. `runWrite` reuses the same "abort the previous
operation" supersession semantics as `run`, and the resulting signal is passed all the way into
the POST. Starting a second save therefore aborts the first save's in-flight `fetch` — after
the request may already have reached and been applied by the server — and the client silently
classifies that as a cancellation, so no error surfaces. Fabdulla1 raised this as a design
concern; **it is reachable in shipped UI**: `ScriptSelection`'s Save button is
`disabled={!isDirty}`, not `disabled={isSaving}`, and stays enabled for the whole save.

The coverage picture reinforces this. The full suite passes with zero console output, but the
`signal.aborted` / `isCancellation` guards the PR adds to its consumers are among the least
covered lines in the change — including the very handler that decides whether a failed save is
shown to the user.

Everything else is secondary: one file newly pushed over the 250-line ceiling, an unevenly
applied signal surface, a now-vestigial `cancellableFetch`, and a floating promise in
`AfoRegisterSearchForm`.

### Comment status tracking

| Reviewer               | Type                                              | Threads | Status                                                             |
| ---------------------- | ------------------------------------------------- | ------- | ------------------------------------------------------------------ |
| `Fabdulla1`            | timeline review, `CHANGES_REQUESTED` (2026-08-04) | —       | **Unresolved — blocker**                                           |
| `qltysh[bot]`          | 2 × `COMMENTED`, 6 inline threads                 | 6       | All 6 **resolved** by the bot; 5 outdated. Verified fixed at head. |
| general/issue comments | —                                                 | 0       | —                                                                  |
| `sourcery-ai`          | —                                                 | 0       | **Never ran on this PR** (see Finding 3)                           |

Nobody has approved this PR. `Fabdulla1` is the only human reviewer and requested changes.

### Checks

| Check                                         | Conclusion                     |
| --------------------------------------------- | ------------------------------ |
| GitGuardian scan (push)                       | success                        |
| GitGuardian scan (pull_request)               | success                        |
| GitGuardian Security Checks                   | success                        |
| `qlty check` (commit status)                  | success — "No blocking issues" |
| **`CI` workflow (lint → tsc → test → build)** | **never ran** — see Finding 2  |
| **CodeQL**                                    | **never ran** — see Finding 2  |

### Local gate results (PR head, clean `yarn install --frozen-lockfile`)

| Gate                                            | Result                                                                                                |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| `yarn tsc`                                      | **pass** — 0 errors                                                                                   |
| `yarn lint` (eslint + stylelint)                | **pass** — 0 errors                                                                                   |
| `CI=true yarn test --watchAll=false --coverage` | **pass** — 346 suites, 3529 passed / 2 skipped, 50 snapshots, **zero console output**, exit 0 (407 s) |
| Coverage on affected code                       | **fail** — see Finding 5                                                                              |

After the remediation described below, the same gates on the working tree read:
`yarn tsc` **pass**, `yarn lint` **pass**, `CI=true yarn test --watchAll=false --coverage`
**pass** — 347 suites, 3530 passed / 2 skipped, 50 snapshots, **zero console output**, exit 0.

The console-clean gate is genuinely met: not one `console.error`, `console.warn`, `Warning:` or
unhandled-rejection line appears in the full run. That is worth calling out on a change this
size. The claim in the PR body ("340 suites, 3470 passed") is now 346 / 3529 at head, and still
accurate in substance.

---

## Findings

### Severity legend

`Blocker` — must be fixed before approval. `Major` — must be fixed before merge.
`Minor` — should be fixed. `Nit` — author's discretion.

---

### Finding 1 — `runWrite` aborts an already-dispatched server write — **Blocker**

**Category**: correctness / data integrity
**Files**: [src/common/utils/AbortableOperation.ts:4-8](src/common/utils/AbortableOperation.ts#L4-L8),
[src/common/hooks/usePromiseEffect.ts:10-23,39-43](src/common/hooks/usePromiseEffect.ts#L10-L23),
[src/fragmentarium/ui/info/ScriptSelection.tsx:130-158](src/fragmentarium/ui/info/ScriptSelection.tsx#L130-L158)

`AbortableOperation.start()` aborts the previous controller before creating a new one.
`runWrite` shares that path with `run`, and the signal it hands the operation is threaded into
the request body all the way to `fetch`:

```text
ScriptSelection.tsx:137  runUpdate((signal) => updateScript(updates, signal) …)
  → FragmentService.updateScript(number, script, signal)
  → FragmentRepository.updateScript(…, signal)
  → ApiClient.postJson(path, body, true, signal)
  → ApiClient.fetch  →  cancellableFetch(url, { …, signal })  →  fetch
```

The same shape is reachable from
[DateSelectionMethods.ts:43-59](src/chronology/application/DateSelectionMethods.ts#L43-L59),
[ChapterEditView.tsx:77-93](src/corpus/ui/ChapterEditView.tsx#L77-L93) and
[CuneiformFragment.tsx:147-173](src/fragmentarium/ui/fragment/CuneiformFragment.tsx#L147-L173).

This directly contradicts the PR's own stated design ("Save/download flows gate `setState` on
`signal.aborted` rather than aborting an in-flight write") and the dedicated tests
`Does not abort a write operation on unmount` / `…when cancel is called`. Those two guarantees
hold; the supersession one does not.

Once the connection is aborted the client cannot know whether the server applied the write, and
because `isCancellation` treats it as a cancellation the failure is swallowed entirely: both of
operation A's handlers are gated on `!signal.aborted`, so there is no error alert, no retry and
no log. The superseding write B then completes normally and clears `isSaving`, so the UI shows
an unqualified success — the user has no signal that anything was dropped, and no way to tell
whether the server ended up with A's payload, B's, or a partial application of both.

**Severity**: Blocker — a user's save can be dropped silently, with the UI reporting success.

**Reproduction steps**

1. Open a fragment in the Fragmentarium and click the Script edit button.
2. Change the period so the form is dirty. Save becomes enabled
   (`disabled={!isDirty}` — [ScriptSelection.tsx:132](src/fragmentarium/ui/info/ScriptSelection.tsx#L132)).
3. Click **Save**. `runUpdate` starts operation A; the POST is dispatched.
4. `script` state is only assigned in the success handler, so `isDirty` is still `true` and the
   button is still enabled. Click **Save** again before A settles.
5. `AbortableOperation.start()` aborts A's controller. A's `fetch` is aborted mid-flight even
   though the server may already have committed it.
6. Observed: A's abort is silent — no error, no log — and when B settles the UI reports plain
   success. Expected: the first write completes (or fails visibly); only its _UI update_ is
   discarded as stale.

Throttling the network in devtools makes the window trivial to hit.

**Recommendation**

Stop network-aborting writes. `runWrite` should hand the operation a signal used **only** to
gate `setState`, and must not abort a controller whose request has already been dispatched —
i.e. give `AbortableOperation` a separate "supersede without aborting" mode, or give writes a
distinct type that never reaches `ApiClient`. The alternative — proving every consumer makes
overlapping writes impossible — is fragile and, as step 4 shows, already false today.

Whichever route is taken, `ScriptSelection`'s Save button should also be
`disabled={!isDirty || isSaving}`; that is worth doing regardless, but it is a mitigation, not
the fix.

---

### Finding 2 — the CI workflow has never run on this PR — **Blocker**

**Category**: process / verification
**File**: [.github/workflows/main.yml:3-7](.github/workflows/main.yml#L3-L7)

```yaml
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
```

Because #774 targets `chore/ts7-tsconfig-migration`, neither `CI` nor `codeql-analysis` has ever
been triggered. Every workflow run on this branch (10 of them) is GitGuardian. Lint, `tsc`, the
test suite, the production build and the coverage upload have only ever been verified on
contributors' machines — on a 275-file, +3870/−1596 change that removes a core dependency.

The author's own `TASK-remove-bluebird-review.md` acknowledges this as outstanding item 11.

**Severity**: Blocker — approval would rest on unverified CI.

**Reproduction steps**

1. `GET /repos/.../actions/runs?branch=chore/remove-bluebird` → 10 runs, all `GitGuardian scan`.
2. `GET /repos/.../commits/5ef4a984/check-runs` → 3 runs, all GitGuardian.

**Recommendation**

Merge #773, re-target #774 to `master`, and require a green `CI` + CodeQL run before approval.
Separately, consider widening `main.yml` to `pull_request: branches: ['**']` so stacked PRs are
not silently unverified — that is a repo-wide gap this PR merely exposed.

---

### Finding 3 — no sourcery-ai review exists — **Informational**

The review request asked for sourcery-ai findings. There are none: sourcery-ai has never
reviewed, commented on, or checked this PR, and the repository contains no `.sourcery.yaml`.
The only automated reviewer configured is `qltysh[bot]`, plus GitGuardian for secrets. If
sourcery coverage is wanted, the app needs installing on the repo first — there is nothing to
address here.

---

### Finding 4 — the test suite locks in the behaviour Finding 1 asks to change — **Major**

**Category**: test correctness
**File**: [src/common/hooks/usePromiseEffect.test.tsx:52-58](src/common/hooks/usePromiseEffect.test.tsx#L52-L58)

```tsx
describe.each(runners)('%s', (runner) => {
  it('Aborts the previous operation when a new one supersedes it', () => {
    const { signals, operation } = capturePendingSignals()
    renderOperations({ runner, operation, runCount: 2 })
    expect(signals[0].aborted).toBe(true)
```

`runners` is `['run', 'runWrite']`, so this asserts that superseding a **write** aborts it. The
test confirms the implementation rather than the intended guarantee, and any fix for Finding 1
must delete or invert this case for `runWrite`.

There is also no test anywhere that reaches a mocked `ApiClient`/`fetch` and proves a second
write does not abort a dispatched first one.
`src/corpus/ui/ChapterEditView.integration.test.ts` would be the natural home but is untouched
by this PR (last changed in #692).

**Severity**: Major.

**Reproduction steps**

Read the file — `runners` on line 7, `describe.each` on line 52.

**Recommendation**

Once Finding 1 is settled, drop `runWrite` from the parameterised supersession case and add an
integration-level test that (a) asserts the first write's `fetch` is **not** aborted when a
second write starts, and (b) separately asserts the stale first result cannot update current UI
state. Those are two distinct guarantees and should be two distinct assertions.

---

### Finding 5 — the new cancellation branches are the least-covered code — **Major**

**Category**: test coverage
**Files**: see table

The repo gate is 100 % coverage on affected code. It is not met, and the misses are not
incidental — they land almost exactly on the abort/cancellation logic this PR introduces.

| File                                                                                             | Stmts | Branch | Uncovered lines                                  | What is uncovered                                                                    |
| ------------------------------------------------------------------------------------------------ | ----- | ------ | ------------------------------------------------ | ------------------------------------------------------------------------------------ |
| [CuneiformFragment.tsx](src/fragmentarium/ui/fragment/CuneiformFragment.tsx#L162-L164)           | 81.48 | 60     | 59, **162-164**, 170                             | the entire new `if (!signal.aborted)` save-error handler, plus the defensive `throw` |
| [CuneiformConverterForm.tsx](src/signs/ui/CuneiformConverter/CuneiformConverterForm.tsx#L84-L85) | 82.97 | 50     | 62-63, **84-85**, 95-97, 104                     | the `!isCancellation(error, signal)` outer guard and the per-line query `.catch`     |
| [ChapterEditView.tsx](src/corpus/ui/ChapterEditView.tsx#L98-L99)                                 | 89.58 | 50     | **98-99**, **121-122**, 156                      | `updateAlignment` and `updateLemmatization` signal threading is never invoked        |
| [AfoRegisterSearchForm.tsx](src/afo-register/ui/AfoRegisterSearchForm.tsx#L53-L55)               | 81.39 | 65.38  | 54, 91, 136, 153, 198-202, 229-230               | the `if (signal.aborted) return` early exit                                          |
| [ScriptSelection.tsx](src/fragmentarium/ui/info/ScriptSelection.tsx)                             | 94.87 | 62.50  | 74, 183                                          | —                                                                                    |
| [TextService.ts](src/corpus/application/TextService.ts)                                          | 91.45 | 53.57  | 110-120, 275, 356-360, 467-468, 586              | —                                                                                    |
| [FragmentRepository.ts](src/fragmentarium/infrastructure/FragmentRepository.ts)                  | 84.37 | 75.47  | 457, 489-490, 570-571, 603-604, 700-711, 751-779 | —                                                                                    |
| [withData.tsx](src/http/withData.tsx#L49-L52)                                                    | 100   | 92.85  | branch at 50                                     | one side of the `isCancellation` guard                                               |
| [ApiClient.ts](src/http/ApiClient.ts)                                                            | 98.46 | 94.11  | 52                                               | `Error.captureStackTrace` fallback                                                   |
| [DateSelectionMethods.ts](src/chronology/application/DateSelectionMethods.ts)                    | 100   | 82.75  | branches at 72, 108                              | —                                                                                    |
| [FragmentService.ts](src/fragmentarium/application/FragmentService.ts)                           | 100   | 93.10  | branches at 810-815                              | —                                                                                    |

Whole-project coverage at head is 93.07 % statements / 83.73 % branches.

Credit where due: the genuinely new modules are all at 100 % — `AbortableOperation.ts`,
`abortError.ts`, `mapSeries.ts`, `ConcurrencyLimiter.ts`, `usePromiseEffect.ts`,
`getOrFetchCachedValue.ts`, `Chapters.tsx`, `PdfDownloadButton.tsx`, `WordDownloadButton.tsx`.
The gap is in the _consumers_ that were adapted to the new API.

This matters more than a coverage percentage usually would. `CuneiformFragment.tsx:162-164` is
the handler that decides whether a failed save surfaces to the user, and it is the same code
path that Finding 1 shows is silently swallowing aborted writes today. It has no test.

**Severity**: Major — the repo gate is explicit, and the uncovered lines are the risky ones.

**Reproduction steps**

```bash
CI=true yarn test --watchAll=false --coverage
# read the per-file table for the files listed above
```

**Recommendation**

Bring the four `signal.aborted` / `isCancellation` consumer branches above to 100 % — each needs
one test that rejects the underlying operation and one that aborts the signal. Do this as part
of the Finding 1 fix, since the correct assertions depend on what the write semantics become.
`ScriptSelection`, `TextService` and `FragmentRepository` carry pre-existing gaps that predate
this PR; those belong in the follow-up issue, not here.

---

### Finding 6 — 250-line ceiling — **Major**

**Category**: repo hard gate
**Files**: see table

The copilot instructions treat 250 lines per `.ts`/`.tsx` as a hard gate. Measured
before-and-after for every changed file, **one file is newly pushed over the limit by this PR**:

| File                                                     | Before | After   |
| -------------------------------------------------------- | ------ | ------- |
| [src/http/withData.test.tsx](src/http/withData.test.tsx) | 244    | **264** |

Twelve files that were already over the limit were grown further by this PR:

| File                                                                                                                       | Before | After | Δ   |
| -------------------------------------------------------------------------------------------------------------------------- | ------ | ----- | --- |
| [src/fragmentarium/application/FragmentService.ts](src/fragmentarium/application/FragmentService.ts)                       | 824    | 888   | +64 |
| [src/fragmentarium/infrastructure/FragmentRepository.ts](src/fragmentarium/infrastructure/FragmentRepository.ts)           | 732    | 787   | +55 |
| [src/corpus/ui/Chapters.tsx](src/corpus/ui/Chapters.tsx)                                                                   | 268    | 299   | +31 |
| [src/fragmentarium/infrastructure/FragmentRepository.test.ts](src/fragmentarium/infrastructure/FragmentRepository.test.ts) | 1014   | 1045  | +31 |
| [src/fragmentarium/ui/edition/TransliterationForm.test.tsx](src/fragmentarium/ui/edition/TransliterationForm.test.tsx)     | 284    | 311   | +27 |
| [src/dossiers/infrastructure/DossiersRepository.test.ts](src/dossiers/infrastructure/DossiersRepository.test.ts)           | 398    | 415   | +17 |
| [src/fragmentarium/application/FragmentService.test.ts](src/fragmentarium/application/FragmentService.test.ts)             | 1922   | 1938  | +16 |
| [src/fragmentarium/ui/fragment/CuneiformFragmentEditor.tsx](src/fragmentarium/ui/fragment/CuneiformFragmentEditor.tsx)     | 303    | 314   | +11 |
| [src/corpus/application/TextService.ts](src/corpus/application/TextService.ts)                                             | 587    | 597   | +10 |
| [src/fragmentarium/ui/info/Details.tsx](src/fragmentarium/ui/info/Details.tsx)                                             | 283    | 292   | +9  |
| [src/test-support/FakeApi.ts](src/test-support/FakeApi.ts)                                                                 | 508    | 516   | +8  |
| [src/afo-register/ui/AfoRegisterSearchForm.tsx](src/afo-register/ui/AfoRegisterSearchForm.tsx)                             | 264    | 272   | +8  |

Twenty-one further violations exist in files this PR touches without growing (largest:
`FragmentService.test.ts`, `TextService.test.ts` at 782, `SignImages.tsx` at 442).

Fabdulla1's list additionally names `src/realia/ui/Realia.sass` (453 lines); the ceiling as
written applies to `.ts`/`.tsx` script files, so that one is out of scope of this gate.

**Severity**: Major for `withData.test.tsx` (the gate is unambiguous for a file the PR pushed
over). The other twelve are pre-existing debt this PR aggravates.

**Reproduction steps**

```bash
git diff --name-only origin/chore/ts7-tsconfig-migration...HEAD | grep -E '\.(ts|tsx)$' \
  | while read f; do [ -f "$f" ] && wc -l "$f"; done | awk '$1>250' | sort -rn
```

**Recommendation**

Split `withData.test.tsx` into sibling suites (e.g. `withData.cancellation.test.tsx` for the new
abort cases) — that is required by the gate and is small. For the twelve pre-existing files, do
**not** attempt the split inside this PR; a 275-file dependency removal is the wrong place for
it. Agree with the author's recommendation and track it as a separate follow-up issue.

---

### Finding 7 — the signal surface is applied inconsistently — **Minor**

**Category**: API design
**File**: [src/fragmentarium/application/FragmentService.ts:94-190](src/fragmentarium/application/FragmentService.ts#L94-L190)

Within the same interface, `fetchGenres` and `fetchPeriods` take a signal while
`fetchProvenances`, `fetchProvenance`, `fetchProvenanceChildren` and `fetchColophonNames` do
not; `findInCorpus` takes one but `find` does not; `updateLemmaAnnotation` takes one but
`updateLemmatization` does not; `query`/`queryLatest`/`findLemmas`/`listAllFragments` do not.

There is no stated rule, so a caller cannot tell whether omitting a signal means "not
cancellable" or "not migrated yet". The PR body's own caveat ("Data fetches abort the network
**iff** the getter threads the signal") is precisely this ambiguity.

**Severity**: Minor — no defect today, but it makes the abstraction unreliable to reason about.

**Reproduction steps**

Read the `FragmentRepository` interface declaration; compare `fetchGenres` and
`fetchProvenances`.

**Recommendation**

State the rule in code review terms and apply it uniformly: every read threads a signal; writes
do not (per Finding 1). Where a method is deliberately un-cancellable — e.g. the shared-cache
loaders, which the author notes must not take a signal because a cancelled caller would poison
the cache for everyone — leave a one-line reason in the README rather than a silent omission.

---

### Finding 8 — floating promise in `AfoRegisterSearchForm` — **Minor**

**Category**: correctness / console noise
**File**: [src/afo-register/ui/AfoRegisterSearchForm.tsx:121-129](src/afo-register/ui/AfoRegisterSearchForm.tsx#L121-L129)

```tsx
const controller = new AbortController()
fetchTextNumberOptions(
  query,
  textNumberOptions,
  setTextNumberOptions,
  afoRegisterService,
  controller.signal,
)
return () => controller.abort()
```

`fetchTextNumberOptions` is `async` and its result is neither awaited nor `.catch`-ed. If
`searchTextSuggestions` rejects — including with an `AbortError` once the getter threads the
signal further down — the rejection is unhandled. Under the repo's console-clean gate an
unhandled rejection in a test run is a defect, and in production it reaches
`window.onunhandledrejection`.

Note the signal is only used to gate `setState` _after_ the await
([line 53](src/afo-register/ui/AfoRegisterSearchForm.tsx#L53)); the underlying request is not
actually cancelled, so `controller.abort()` in the cleanup is cheaper than it looks.

**Severity**: Minor.

**Reproduction steps**

Make `afoRegisterService.searchTextSuggestions` reject and type into the AfO Register text
field; the rejection is reported as unhandled.

**Recommendation**

Attach a `.catch` that swallows cancellations via the existing `isCancellation` helper and
surfaces anything else, matching the pattern the PR already uses in `Chapters.tsx`.

---

### Finding 9 — `cancellableFetch` is now a no-op wrapper — **Nit**

**Category**: simplification
**File**: [src/http/cancellableFetch.ts:1-6](src/http/cancellableFetch.ts#L1-L6)

```ts
export default function cancellableFetch(
  url: string,
  options: RequestInit = {},
): Promise<Response> {
  return fetch(url, options)
}
```

It has exactly one production caller ([ApiClient.ts:161](src/http/ApiClient.ts#L161)) and a
6-case test file that now tests `fetch`. The name is also actively misleading: the function no
longer does anything to make a fetch cancellable.

**Severity**: Nit — dead abstraction, zero behavioural risk.

**Reproduction steps**

`grep -rn cancellableFetch src` → one production call site.

**Recommendation**

Inline `fetch` into `ApiClient.fetch` and delete both files. If the seam is wanted for test
injection, keep it but rename it to something honest.

---

### Finding 10 — smaller observations — **Nit**

| #   | File                                                                                                                               | Note                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 10a | [src/http/withData.tsx:44-48](src/http/withData.tsx#L44-L48)                                                                       | ~~The success path guards on `requestSequence` only; adding `!abortController.signal.aborted` would make it symmetric with the error path.~~ **WITHDRAWN — this finding was wrong.** Applying it broke `FragmentView.test.tsx`: 13 spinners never resolved, because the success path legitimately runs after the effect cleanup has aborted the controller while `requestSequence` still identifies the request as current. The `requestSequence`-only guard is correct and the PR body's claim about it is accurate. No change. |
| 10b | [src/common/utils/mapSeries.ts](src/common/utils/mapSeries.ts)                                                                     | New module with no dedicated test and no `signal` support (bluebird's `mapSeries` was cancellable). Its `index` argument is unused by all five call sites.                                                                                                                                                                                                                                                                                                                                                                       |
| 10c | [src/signs/ui/CuneiformConverter/CuneiformConverterForm.tsx:61,86](src/signs/ui/CuneiformConverter/CuneiformConverterForm.tsx#L61) | `console.error('Query Error:', error)` is duplicated in the same function — the DRY gate applies. Also, an `AbortError` from `limiter.run`'s queue rejects _outside_ the inner `.catch`, so it takes the outer path; that is correct, but the two log sites make it easy to misread.                                                                                                                                                                                                                                             |
| 10d | [src/corpus/ui/Chapters.tsx:82-84](src/corpus/ui/Chapters.tsx#L82-L84)                                                             | `ExtantLinesCell` renders a full `ErrorAlert` per manuscript row, so one failed `findExtantLines` paints N identical alerts down the table.                                                                                                                                                                                                                                                                                                                                                                                      |
| 10e | [src/http/ApiClient.ts:212-217](src/http/ApiClient.ts#L212-L217)                                                                   | `postJson(path, body, authenticate = true, signal?)` forces call sites to write the boolean literal `true` just to reach `signal` (e.g. `TextService.postChapterUpdate`). An options object would read better.                                                                                                                                                                                                                                                                                                                   |

---

## Severity

| Severity          | Count | Findings                                                                                   |
| ----------------- | ----- | ------------------------------------------------------------------------------------------ |
| **Blocker**       | 2     | 1 (write abort), 2 (CI never ran)                                                          |
| **Major**         | 3     | 4 (test locks in the defect), 5 (coverage on the new abort branches), 6 (250-line ceiling) |
| **Minor**         | 2     | 7 (inconsistent signal surface), 8 (floating promise)                                      |
| **Nit**           | 2     | 9 (`cancellableFetch`), 10 (a–e)                                                           |
| **Informational** | 1     | 3 (no sourcery-ai)                                                                         |

**Verdict: request changes.** Finding 1 is a silent data-integrity defect on a reachable path,
and Finding 2 means nothing about this PR has been verified by CI.

---

## Reproduction Steps

Consolidated; per-finding steps are inline above.

```bash
# 1. PR head in an isolated worktree
git fetch origin chore/remove-bluebird chore/ts7-tsconfig-migration
git worktree add --detach /tmp/pr774 5ef4a984a6d6d59039db04cfadea013a7efe457e
cd /tmp/pr774 && yarn install --frozen-lockfile

# 2. Hard gates
yarn tsc                                       # pass
yarn lint                                      # pass
CI=true yarn test --watchAll=false --coverage  # 346 suites pass, console-clean

# 3. Finding 6 — line-count gate
git diff --name-only origin/chore/ts7-tsconfig-migration...HEAD | grep -E '\.(ts|tsx)$' \
  | while read f; do [ -f "$f" ] && wc -l "$f"; done | awk '$1>250' | sort -rn

# 4. Finding 2 — CI never triggered
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" \
  "$GITHUB_API_URL/repos/$GITHUB_REPOSITORY/actions/runs?branch=chore/remove-bluebird" \
  | grep -o '"name":"[^"]*"' | sort -u
```

Finding 1 is reproduced through the UI; the steps are in that section.

---

## Recommendation

**Request changes.** The bluebird removal itself is well executed and worth landing, but not at
this head.

Before approval:

1. Resolve the write-cancellation design (Finding 1) so a dispatched write is never
   network-aborted by a superseding one, and back it with the integration test Fabdulla1 asked
   for (Finding 4).
2. Get the PR through a real CI run (Finding 2) by merging #773 and re-targeting to `master`.

Before merge: cover the new cancellation branches (Finding 5), split `withData.test.tsx`
(Finding 6), fix the floating promise (Finding 8), and delete all task-tracking `.md` files.

Defer to follow-up issues: the twelve pre-existing over-limit files, the signal-surface
consistency pass (Finding 7), and the `cancellableFetch` cleanup (Finding 9).

Credit where due: `ConcurrencyLimiter`'s cancellation handling is genuinely careful — the
listener is detached on slot grant, `createReleaseSlot` is idempotent, and the queued-abort /
slot-handoff race is covered by a dedicated test. The qlty duplications raised on earlier
commits were fixed at the root cause rather than suppressed.

---

## Remediation status (2026-08-06, uncommitted on `chore/remove-bluebird`)

The findings below were subsequently **fixed** in the working tree at the user's request.
This section records what changed; the numbered list that follows is the original action
list, kept for traceability.

| Finding                      | Status                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1 — write abort              | **Fixed.** `runWrite` hands an `isStale()` predicate from the new `SupersedableOperation`; `signal?` removed from every write-side service/repository method so the compiler forbids threading one into a write's `fetch`. `ScriptSelection`'s Save is now `disabled={!isDirty \|\| isSaving}`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 2 — CI never ran             | **Not fixable here.** Requires merging #773 and re-targeting the PR; that is a maintainer action.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 3 — no sourcery-ai           | Informational; nothing to fix.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 4 — tests lock in the defect | **Fixed.** `runWrite` dropped from the parameterised supersession case; new `usePromiseEffect.write.integration.test.tsx` drives `runWrite` → `ApiClient` → mocked `fetch` and proves no signal is attached, the first write is not aborted, and a stale write cannot overwrite current state.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| 5 — coverage                 | **Partly fixed.** Every module the Finding 1 fix introduced is at 100 % (`SupersedableOperation`, `usePromiseEffect`, `FragmentService`, `FragmentReadService`, `FragmentWriter`, `FragmentQueryLoader`, `FragmentProvenanceLoader`, `FragmentImageLoader`, `FragmentLemmaLoader`, `injectFragmentReferences`), and `Chapters.tsx` and `mapSeries.ts` reached 100 %. Consumer components still have gaps: `CuneiformFragment.tsx` (84.61 / 60), `ChapterEditView.tsx` (89.58 / 50), `CuneiformConverterForm.tsx` (81.25 / 50), `AfoRegisterSearchForm.tsx` (78.26 / 60.71), `ScriptSelection.tsx` (94.87 / 66.66), `DateSelectionMethods.ts` (100 / 68.96), `FragmentCache.ts` (98.93 / 88.23).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| 6 — 250-line ceiling         | **1 of 35 done.** `FragmentService.ts` (849) decomposed into ten modules, all under the limit. **34 files remain over 250 lines** — 13 source, 21 test — largest first: `FragmentService.test.ts` (1930), `FragmentRepository.test.ts` (1017), `TextService.test.ts` (780), `FragmentRepository.ts` (732), `ProperNounCreationPanel.test.tsx` (649), `TextService.ts` (573), `FragmentariumSearch.test.tsx` (545), `FakeApi.ts` (516), `SearchForm.test.tsx` (461), `SignImages.tsx` (442), `LatestTransliterations.test.tsx` (421), `DossiersRepository.test.ts` (415), `ApiClient.edge-cases.test.ts` (408), `Details.test.tsx` (368), `TextAnnotation.tsx` (346), `DateSelectionInput.test.tsx` (335), `ColophonEditorIndividualForm.tsx` (334), `WordDisplay.test.tsx` (334), `DossiersService.test.ts` (321), `DossiersService.ts` (319), `TransliterationForm.test.tsx` (311), `Chapters.tsx` (304), `CuneiformFragmentEditor.tsx` (303), `BibliographyService.ts` (291), `FragmentView.test.tsx` (290), `Details.tsx` (285), `ArchaeologyEditor.tsx` (285), `AfoRegisterSearchForm.tsx` (280), `DateSelectionState.ts` (279), `CuneiformFragment.test.tsx` (273), `withData.test.tsx` (264), `SignImages.test.tsx` (263), `about.test.tsx` (257), `TransliterationForm.tsx` (254). |
| 7 — signal surface           | **Fixed.** Signals threaded through `folioPager`, `findAnnotations`, `fetchNamedEntityAnnotations` and their `withData` getters; README states the read rule, the write rule and the deliberate exceptions.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| 8 — floating promise         | **Fixed.** `.catch` added, cancellations swallowed via `isCancellation`, real errors surfaced in an `ErrorAlert`.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| 9 — `cancellableFetch`       | **Fixed.** Wrapper and its test deleted; `ApiClient` calls `fetch` directly.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| 10 — nits                    | **Fixed**, except 10a which was **withdrawn as incorrect** (see the row in Finding 10).                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |

Two DRY extractions came out of the Finding 1 work and were kept:
`FragmentRepository.postFragmentUpdate` (collapsed twelve near-identical POST bodies) and
`FragmentService.applyFragmentUpdate` (collapsed eleven identical inject-then-cache tails).

---

## What Has To Be Done

Blockers are marked **[BLOCKER]** — the PR cannot be approved while any remain.

1. **[BLOCKER]** Redesign `runWrite` so superseding a write does **not** abort the previous
   write's in-flight `fetch`. Give writes a signal that gates `setState` only, or add a
   supersede-without-abort mode to `AbortableOperation`.
   (`src/common/utils/AbortableOperation.ts`, `src/common/hooks/usePromiseEffect.ts`)
2. **[BLOCKER]** Remove `runWrite` from the parameterised "Aborts the previous operation when a
   new one supersedes it" case in
   [src/common/hooks/usePromiseEffect.test.tsx:52-58](src/common/hooks/usePromiseEffect.test.tsx#L52-L58)
   and replace it with a case asserting the new guarantee.
3. **[BLOCKER]** Add an integration-level test reaching a mocked `ApiClient`/`fetch` that proves
   (a) a second write does not abort a dispatched first write, and (b) the stale first result
   cannot update current UI state. Two separate assertions.
4. **[BLOCKER]** Merge #773, re-target #774 to `master`, and let `CI` (lint → tsc → tests →
   build → coverage) and CodeQL run green. Attach the run links to the PR.
5. **[BLOCKER]** Re-request review from `Fabdulla1` and get the `CHANGES_REQUESTED` review
   dismissed or converted to an approval. It is the only human review and it is unresolved.
6. Disable `ScriptSelection`'s Save button while a save is in flight —
   `disabled={!isDirty || isSaving}`
   ([src/fragmentarium/ui/info/ScriptSelection.tsx:132](src/fragmentarium/ui/info/ScriptSelection.tsx#L132)).
   Audit the other `runWrite` consumers (`CuneiformFragment`, `DateSelectionMethods`,
   `DatesInTextSelection`) for the same gap.
7. Split [src/http/withData.test.tsx](src/http/withData.test.tsx) (264 lines) back under the
   250-line ceiling.
8. Add a `.catch` to the `fetchTextNumberOptions` call in
   [src/afo-register/ui/AfoRegisterSearchForm.tsx:122](src/afo-register/ui/AfoRegisterSearchForm.tsx#L122)
   that swallows cancellations via `isCancellation` and surfaces everything else.
9. Bring the new cancellation branches to 100 % coverage (Finding 5): the
   `if (!signal.aborted)` save-error handler in
   [CuneiformFragment.tsx:162-164](src/fragmentarium/ui/fragment/CuneiformFragment.tsx#L162-L164),
   the `!isCancellation(error, signal)` guard in
   [CuneiformConverterForm.tsx:84-85](src/signs/ui/CuneiformConverter/CuneiformConverterForm.tsx#L84-L85),
   `updateAlignment` / `updateLemmatization` in
   [ChapterEditView.tsx:98-99,121-122](src/corpus/ui/ChapterEditView.tsx#L98-L99), and the
   `signal.aborted` early exit in
   [AfoRegisterSearchForm.tsx:53-55](src/afo-register/ui/AfoRegisterSearchForm.tsx#L53-L55).
   Then confirm coverage is 100 % on all affected code and the full run is still console-clean.
10. **Delete all task-tracking `.md` files before merge** — nine are currently tracked on the
    branch: `TASK-remove-bluebird-{todo,log,review}.md`,
    `TASK-address-findings-{todo,log}.md`, `TASK-ts7-migration-{todo,log,research,review}.md`.
    The three review artefacts produced by this task — `TASK-774-{todo,log,review}.md` — must be
    removed too.
11. Follow-up issues (do **not** do these in this PR): split the twelve pre-existing
    over-250-line files; make the `signal` surface consistent across `FragmentRepository` /
    `TextService` (Finding 7); delete the vestigial `cancellableFetch` (Finding 9); address the
    Finding 10 nits.
12. Optional but recommended repo-wide: widen `main.yml` to
    `pull_request: branches: ['**']` so stacked PRs are not merged without CI ever running.

_No reviewer assignments were changed and nothing was posted to GitHub as part of this review._
