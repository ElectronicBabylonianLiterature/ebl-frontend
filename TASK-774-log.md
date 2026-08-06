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
