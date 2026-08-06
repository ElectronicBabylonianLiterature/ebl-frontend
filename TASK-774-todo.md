# TASK-774 — Review of PR #774 and remediation of its findings

## Phase 1 — Review (complete)

- [x] Fetch PR metadata, every timeline review event, every inline comment with
      resolution/outdated status, every general comment
- [x] Confirm no sourcery-ai review exists on this PR
- [x] Enumerate check runs and commit statuses; determine why `CI` never ran
- [x] Collect qlty findings and verify they are fixed at head
- [x] Run `yarn tsc`, `yarn lint`, full suite + coverage against PR head in an isolated worktree
- [x] Verify Fabdulla1's findings against the code; find a concrete repro for the write abort
- [x] Measure the 250-line gate before/after for every changed file
- [x] Write `TASK-774-review.md`

## Phase 2 — Remediation (in progress)

Scope confirmed with the user: type-enforced write fix, all findings that concern the
codebase, and the 250-line refactor applied to **every `.ts`/`.tsx` file the PR touches**
(34 files at review time). Work is happening on `chore/remove-bluebird`, uncommitted.

### Findings — all closed

- [x] **Finding 1 (Blocker)** — writes can no longer be network-aborted.
      `runWrite` hands the operation an `isStale()` predicate from the new
      `SupersedableOperation`; `signal?` removed from every write-side service and
      repository method so the type system forbids threading one into a write's `fetch`.
      `ScriptSelection`'s Save button is now `disabled={!isDirty || isSaving}`.
- [x] **Finding 4 (Major)** — `runWrite` removed from the parameterised supersession case;
      added `usePromiseEffect.write.integration.test.tsx`, which drives a component through
      `runWrite` → `ApiClient` → mocked `fetch` and proves (a) no abort signal is attached to
      a dispatched write, (b) a superseded write is not aborted, (c) a stale write cannot
      overwrite current UI state.
- [x] **Finding 7 (Minor)** — signals threaded through `folioPager`, `findAnnotations`,
      `fetchNamedEntityAnnotations` and their `withData` getters; README now states the read
      rule, the write rule and the deliberate exceptions.
- [x] **Finding 8 (Minor)** — `fetchTextNumberOptions` no longer floats; it has a `.catch`
      that swallows cancellations via `isCancellation` and surfaces real errors in a new
      `ErrorAlert`.
- [x] **Finding 9 (Nit)** — `cancellableFetch` and its test deleted; `ApiClient` calls
      `fetch` directly.
- [x] **Finding 10 (Nits)** — `mapSeries` lost its unused `index` parameter; the duplicated
      `console.error('Query Error:', …)` in `CuneiformConverterForm` is now one
      `reportQueryError` helper; `Chapters` renders one `ErrorAlert` for the table instead of
      one per manuscript row; the `postJson` boolean trap disappeared with the write change.
- [x] **Finding 10a — WITHDRAWN.** Adding `!signal.aborted` to `withData`'s success path
      broke 13 components in `FragmentView.test.tsx` (spinners never resolved). The author's
      `requestSequence`-only guard is correct; the change is reverted. See the log.
- [x] Repair the test expectations the write-signature change invalidated
      (`WordRepository`, `TextService`, `FragmentRepository`, `FragmentService`)

### Finding 6 — 250-line ceiling

- [x] `src/fragmentarium/application/FragmentService.ts` (849 lines) decomposed into ten
      modules, all under the limit: `FragmentService` (94), `FragmentReadService` (241),
      `FragmentCache` (247), `FragmentWriter` (143), `FragmentQueryLoader` (111),
      `FragmentRepositoryTypes` (149), `FragmentProvenanceLoader` (74),
      `FragmentLemmaLoader` (51), `FragmentImageLoader` (50),
      `injectFragmentReferences` (27). `LemmatizationFactory` now depends on a narrow
      `LemmaSuggestionSource` interface instead of the whole service.
- [ ] 15 remaining source files (see `TASK-774-review.md` Finding 6 for the list)
- [ ] 19 remaining test files

### Gates

- [x] `yarn tsc` clean after every step
- [x] `yarn lint` clean after every step
- [ ] Full suite green and console-clean (final run)
- [ ] 100 % coverage on affected code (Finding 5) — pending, must follow the file splits

## Not done, and not to be done without an explicit ask

- No commit, branch or push. Everything is uncommitted on `chore/remove-bluebird`.
- Nothing posted to GitHub; no reviewer assignments touched.
- `TASK-774-{todo,log,review}.md` must be deleted before merge, along with the nine
  `TASK-*.md` files already tracked on the branch.
