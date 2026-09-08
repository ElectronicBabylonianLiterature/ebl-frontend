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

## Phase 3 — Re-review at head `7afb78ed` (2026-09-03, complete)

Full re-review requested. Nothing in `src/` was changed during this phase; the only file
written is `TASK-774-review.md`.

- [x] Re-fetch every timeline review event, inline comment and general comment with
      resolution/outdated status (REST + GraphQL `reviewThreads`); confirm no `sourcery-ai`
      or other review bot has ever touched this PR
- [x] Re-check check runs and commit statuses at head; confirm `CI` and `CodeQL` have still
      never run on any of the ten commits
- [x] Reproduce the qlty "3 blocking issues" locally and classify each as new or pre-existing
- [x] Verify all four points of Fabdulla1's standing `CHANGES_REQUESTED` against the code
- [x] Re-run the 250-line gate over every changed file
- [x] Hard gates: `yarn tsc`, `yarn lint`, full suite + coverage, `yarn build:ci-stable`
- [x] Confirm zero console output across the full run
- [x] Measure coverage of the changed and newly-added surface from `coverage-final.json`
- [x] **Dev container check (explicitly requested):** confirm `.devcontainer/` is untouched by
      #774 and by base #773, against both the PR base and `master`
- [x] **New `.md` files check (explicitly requested):** enumerate every `.md` in the diff
- [x] Prove the out-of-scope Sass migration is behaviour-preserving: compile all 59
      entrypoints against a base worktree and diff the CSS
- [x] Rewrite `TASK-774-review.md` with a metadata header (date, verdict, gate results), a
      short human-readable summary section with a full `Details` subsection, no line-length
      limit, and no third-person reference to the PR author

## Still not done, and not to be done without an explicit ask

- No commit, branch or push. The review file is left modified in the working tree.
- Nothing posted to GitHub; no reviewer assignments touched; no review submitted.
- `TASK-774-{todo,log,review,continuation-prompt}.md` must still be deleted before merge,
  along with the other six `TASK-*.md` files on this branch and the three on #773.

## Phase 4 — Remediation of the review findings (2026-09-03, paused mid-flight)

Full detail and the resume instructions are in `TASK-774-continuation-prompt.md`.

### Closed

- [x] **F1** — no write path holds a live `AbortSignal`. `TransliterationForm`, `WordEditor`,
      `BibliographyEntryFormController` and `BibliographyEntryForm` moved to
      `SupersedableOperation` + `applyWhenCurrent`. `AbortableOperation` is now read-only.
- [x] **F2** — added `applyWhenNotAborted`; the eight hand-written abort guards are gone.
- [x] **F4** — resolved by documenting the `runWrite` unmount semantics in `README.md`.
      The behaviour change was attempted and reverted: two existing `usePromiseEffect` tests
      deliberately pin the current semantics. Do not re-attempt without asking.
- [x] **F5** — README's type-level claim corrected and scoped to service/repository writes.
- [x] **F6** — all three qlty blocking issues fixed at root, not dismissed.
      Repo-wide `qlty smells` 155 → 98.
- [x] **B1** — `CI` and `CodeQL` now trigger for PRs based on `chore/**`, `feature/**`, `fix/**`.
- [x] Pre-existing dead code removed: `CorpusLemmatizationFactory.applySuggestion`/
      `getSuggestion` (dead at the base branch too) and two unreachable branches in
      `createSummaryItemDto`.
- [x] One test deleted **with explicit approval**: the false-positive
      `does not set an error for a cancellation error` in `TransliterationForm.errors.test.tsx`.

### Open

- [ ] **Fix the three lint errors** left in the tree (unused import in
      `FragmentRepository.corpus.test.ts`, two prettier errors in
      `colophonNameSuggestions.test.ts`). The tree is red until this is done.
- [ ] Run the full suite once, alone, and confirm zero failures and zero console output.
- [ ] **F3** — coverage. Closed: `signImageGrouping`, `colophonNameSuggestions`,
      `CuneiformFragmentTabContents`, `FragmentRepository.testSupport`,
      `CorpusLemmatizationFactory`. Still open, worst first: `BibliographyEntryLoader.ts`,
      `TextServiceBase.ts`, `TextServiceCore.ts`, `ApiFragmentQueryRepository.ts`,
      `createFragment.ts`, `createQueryResult.ts`, and the rest of the 30 in the review.
- [ ] **N2** — update the PR description on GitHub. Approved for this task only; confirm again
      in a later session before writing to GitHub.
- [ ] **B2** — re-review from `Fabdulla1`. Never touch reviewer assignment via the API.
- [ ] **B3** — delete the 13 `TASK-*.md` files (10 here, 3 on #773) before merge. Remind, do
      not delete unprompted.
- [ ] Optional: add `coverageThreshold` to the Jest config so the 100% gate is mechanical.

## Phase 4 — outcome (2026-09-08, complete for everything actionable locally)

- [x] Lint fixed; `yarn tsc`, `yarn lint`, `yarn build:ci-stable` and the full suite are all green
      (414 suites, 3 661 passed / 2 skipped, 50 snapshots, zero console output).
- [x] **F3** — newly-added files below 100%: 30 → 15. All changed files: 89 → 73. Global
      coverage 93.58 → 94.11% statements, 84.19 → 85.50% branches, 93.13 → 93.81% functions.
      New suites: `signImageGrouping`, `colophonNameSuggestions`,
      `CuneiformFragmentTabContents.saving`, `FragmentRepository.corpus`,
      `FragmentRepository.lookups`, `BibliographyEntryLoader.{find,batch}`, `DossierCache`,
      `loadClusterAnnotations`, `createFragment.sparse`, `TextService.lineDetails`, plus
      additions to `TextService.misc`, `TextService.chapterDisplay`,
      `FragmentRepository.rawSummary` and `DossiersService.batching`.
- [x] **N2** — PR description rewritten and posted to GitHub.
- [x] Pre-existing defects fixed at root: dead code in `CorpusLemmatizationFactory`, seven sets
      of unreachable default arguments, the unreachable batch cache in
      `BibliographyEntryLoader`, duplicated cache logic in `DossierCache`, the unreachable
      fallback in `loadClusterAnnotations`, and the flaky 1 s timeout in the shared
      `waitForSpinnerToBeRemoved` helper.

## Phase 5 — 2026-09-08 — CI ran, and the `test` job failed

- [x] Reconciled the stale handoff: the phase-4 work is committed as `f11cca21` and pushed;
      `origin/chore/remove-bluebird` matches it. The push is what finally triggered CI.
- [x] **B1 — CodeQL and CI have now run on `f11cca21`.** CodeQL green over the added lines;
      GitGuardian and `qlty check` green; CI's lint, type-check and build steps all green.
- [x] **Fixed the failing `test` job at root.**
      `FragmentService.query.test.ts` → `returns traditional reference to fragment numbers
    mapping data` asserted `expect(result).toEqual(expected)` where **both sides were
      un-awaited Promises** — it never tested the data. It failed only in CI because
      `--detectOpenHandles` enables `async_hooks`, which stamps `Symbol(async_id_symbol)` onto
      promises, and jest's `toEqual` compares own symbol properties.
      **Pre-existing** — carried verbatim from `4f71cb2:.../FragmentService.test.ts:1900-1920`.
      Now awaits and asserts against `returnData`, typed `FragmentAfoRegisterQueryResult`.
- [x] Verified no second instance of the pattern exists repo-wide; `testDelegation` awaits
      correctly.
- [x] Re-ran every gate with **CI's exact flags** this time: lint clean, `tsc` clean, 414 suites
      passed / 3 661 tests / 50 snapshots with **zero console output**, `build:ci-stable` exit 0.

### Process fix

- [ ] **Use `yarn test:diag` as the local test gate.** It is already CI's exact flag set. The
      command used in phases 1-4 (`CI=true yarn test --watchAll=false --coverage`) omits
      `--detectOpenHandles` and therefore cannot reproduce CI. Five clean local runs missed this.

## Phase 6 — 2026-09-08 — F3 closed, every finding audited

- [x] Re-gathered every GitHub finding: 3 timeline reviews, 6 inline `qltysh[bot]` comments,
      0 issue comments. All six bot comments were already verified resolved; `qlty check` is
      green on the head. Only **F3** was genuinely outstanding.
- [x] **F3 closed.** Newly-added files below 100 %: **15 → 0**; all 70 added files are at 100 %
      statements, branches and functions. Nine closed with new tests, six by deleting provably
      dead code (dead mock configuration in four test-support helpers, a dead default argument
      and a dead `||` fallback in `FakeApiBase`, a dead helper parameter, and an unreachable
      guard in `DossiersQueryByIdsBatcher`).
- [x] `SpanAnnotationDisplay`'s retry — previously judged too brittle for jsdom — turned out to
      be deterministically testable; the existing suite simply swapped the selection too early.
- [x] All gates re-run with CI's exact flags: 423 suites, 3 685 passed / 2 skipped, 50 snapshots,
      **zero console output**, `build:ci-stable` exit 0, nothing over 250 lines.

## Phase 7 — 2026-09-08 — F9 fixed, ratchet added, every code finding closed

- [x] **F9 fixed.** `silenceConsoleErrors` deleted; `setupTests.ts` now exports
      `expectConsoleErrors(pattern)`, which declares the expected errors and fails the test on
      any unmatched `console.error`. Patterns derived empirically per call site. One of the five
      call sites (`ChapterEditView.saving.test.ts`) logged **nothing** and was simply removed.
- [x] Guard proven, not assumed: a stray `console.error` probe failed all three `ErrorBoundary`
      tests, then was reverted.
- [x] **250-line gate restored.** Editing the 370-line `react-auth0-spa.security.test.tsx`
      brought it under the ceiling, so it was split into three suites plus a shared testSupport
      that also kills an eight-fold duplicated `Auth0Provider` render block. All assertions
      preserved; the duplicated permission tests became ten `it.each` cases.
- [x] **`coverageThreshold` added** to `craco.config.js` — global ratchet at 94/85/93/94, just
      under the current 94.2/85.9/93.9/94.32.
- [x] Gates: lint clean, `tsc` clean, **425 suites / 3 692 tests, zero console output**,
      0 threshold failures, 71 added files all at 100 %, build exit 0, nothing over 250 lines.

### Still open — none of it is mine to do

- [ ] **B1 residue** — CI must go green on the _new_ head once this is pushed. Ask first.
- [ ] **B2** — re-review from `Fabdulla1`. Never touch reviewer assignment via the API.
- [ ] **B3** — delete the 13 `TASK-*.md` files (10 here, 3 on #773) before merge.
- [ ] **qlty project** — dismiss the 3 pre-existing blocking issues in the qlty dashboard (F6).
      That is an action in their web UI, not in this repo.

## Next steps, in order (2026-09-08)

1. [ ] **Push the branch** so CI runs on the new head. Everything else is blocked on this.
       _Ask before pushing — it is not pre-approved._
2. [ ] **Verify the CI run**: `test`, `CodeQL`, `Analyze (javascript)`, GitGuardian ×3 and
       `qlty check` all green.
3. [ ] **Re-review from `Fabdulla1`** (B2) — requested by `khoidt`, never via the API.
4. [ ] **Dismiss the 3 qlty blocking issues** in the qlty dashboard (F6).
5. [ ] **Merge #773 first** — it is the base of this PR.
6. [ ] **Delete the 13 `TASK-*.md` files immediately before merge** (B3): 10 here, 3 on #773.
       Keep them until then; they are the working record.

Nothing in this list is a code change. Every code-level finding is closed.
