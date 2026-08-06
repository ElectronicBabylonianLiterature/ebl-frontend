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

## Phase 2 — Remediation (complete, uncommitted → now committed through 1b0fe6b2)

Scope confirmed with the user: type-enforced write fix, all findings that concern the
codebase, and the 250-line refactor applied to **every `.ts`/`.tsx` file the PR touches**
(34 files at review time).

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

- [x] Every `.ts`/`.tsx` file this PR touches is at or under 250 lines. Re-verified at head
      `1b0fe6b2`: intersecting the over-250 list with the PR's changed-file list returns
      **zero** rows.

## Phase 3 — Re-review at head `1b0fe6b2` (2026-08-06)

- [x] Re-fetch every review event, inline comment and issue comment; record resolved /
      outdated status per thread
- [x] Re-check check runs + combined commit status on the head SHA
- [x] Re-run qlty locally (`qlty check` and `qlty smells`) scoped to the 385 changed source
      files, since the cloud `qlty check` status is `success` but its inline threads were
      auto-resolved as _outdated_ rather than actually fixed
- [x] Re-derive the 250-line gate at head
- [x] `yarn tsc` — **pass** (exit 0, 54.8 s)
- [x] `yarn test --watchAll=false` — **pass**, 402/402 suites, 3569 passed, 2 skipped
      (both pre-existing `xit`s in `Edition.test.tsx`), 50 snapshots, 335 s
- [x] Console-clean gate — **pass**, zero `console.*` / `Warning:` / act / unhandled rejections
- [x] `yarn lint` — **pass** (exit 0, 38.6 s)
- [x] Verify each of Fabdulla1's `CHANGES_REQUESTED` points against the current code
- [x] Rewrite `TASK-774-review.md` at head `1b0fe6b2`

### New findings raised in Phase 3

- [x] **N1 (Major)** — the Finding 6 splits reintroduced duplication: three
      file/split-sibling pairs shared verbatim fixtures or setup.
      **Fixed** by extracting each into a shared module:
      `http/withData.testSupport.tsx` (the 28-line harness, now a
      `createWithDataHarness()` factory plus `renderWithData` / `rerenderWithData` /
      `renderInErrorReporter`), `signs/ui/display/SignImages.testSupport.tsx` (the 48-line
      `croppedAnnotations` fixture plus `createMockSignService` / `setUpSignImages`), and
      `test-support/provenance-records.ts` (the 30-line `provenances` fixture, now the single
      source for both `SearchForm.testSupport.tsx` and `ColophonEditor.test.tsx`).
- [x] **N2 (Minor)** — `renderReads` / `renderWrites` collapsed onto one generic
      `renderRuns({ select, … })` parameterised by which runner it pulls off the hook tuple;
      the two names survive as one-line delegating wrappers so no call site changed.
- [x] **N3 (Minor)** — the vestigial `signal?: AbortSignal` is gone from
      `CuneiformFragment.tsx`'s `onSave` prop type.
- [x] **N4 (Minor)** — extracted `common/utils/applyWhenCurrent.ts`; all four `runWrite`
      consumers now pass `onSuccess` / `onError` handlers and the freshness check lives in
      one place. New module is at 100 % on every metric.
- [x] **N5 (Minor)** — the eleven newly-added files now use module-alias imports
      (plus `usePromiseEffect.test.tsx` and `ColophonEditor.test.tsx`, edited anyway).
- [ ] **N6 (Blocker, carried over)** — `main.yml` triggers only on `pull_request: branches:
    [master]`; this PR targets `chore/ts7-tsconfig-migration`, so lint/tsc/test/build have
      never run in CI on any commit of this branch. **Maintainer action — not fixable here.**
- [ ] **N7 (Blocker, carried over)** — `Fabdulla1`'s `CHANGES_REQUESTED` is still the review
      decision. **Maintainer action — not fixable here.**
- [x] **N8 (Nit)** — `Realia.sass` (453 lines) split into six partials, all under 190 lines.
      Verified behaviour-identical by compiling before and after with `sass` and diffing:
      **byte-identical CSS output**, and `yarn build` passes.
- [x] **N9 (Major, missed by the Phase 3 review)** — re-running `qlty smells` after the fixes
      and comparing against a base-branch worktree exposed one duplication the review had not
      reported: `ArchaeologyEditorFields.tsx`'s `RegularExcavationField` and
      `FindspotUncertainField` are 20-line near-identical components (mass 91), flagged at
      head but **not** at base — the split turned inline JSX into two exported components and
      made it visible. Fixed by collapsing both onto a private `CheckboxField`, keeping the
      two exports as thin wrappers so consumers are untouched.

### Verified pre-existing, deliberately not fixed here

Every other `qlty smells` finding on a changed file was checked against a base-branch
worktree and is pre-existing with identical mass: `ManuscriptForm.tsx`,
`DossiersSearchPage.tsx`, `Download.test.tsx`, `ApiClient.test.ts` (16 lines/mass 69 at base,
15/66 now), `WordDisplay.testSupport.ts` (relocated verbatim from `WordDisplay.test.tsx`),
`DetailsFields.tsx` (`Joins` complexity 22, relocated from `Details.tsx`), `setupTests.ts`,
`SignsSearch.tsx`, `test-support/utils.ts`, `GlossaryFactory.ts`. These belong in the
follow-up issue alongside the 54 pre-existing over-250-line files.

### Pre-existing issue found and fixed during remediation

- [x] `CuneiformFragment.tsx:145` declared `const [error, setError] = useState(null)`, which
      TypeScript infers as `useState<null>` — the state could never legally hold an `Error`.
      It only compiled because the old untyped `.catch((error) => …)` fed it `any`. Typing
      the `applyWhenCurrent` error handler surfaced it. Fixed at root:
      `useState<Error | null>(null)`, matching the component's own `error: Error | null` prop.

## Not done, and not to be done without an explicit ask

- No commit, branch or push.
- Nothing posted to GitHub; no reviewer assignments touched.
- `TASK-774-{todo,log,review,continuation-prompt}.md` must be deleted before merge, along
  with the nine `TASK-*.md` files already tracked on the branch.
