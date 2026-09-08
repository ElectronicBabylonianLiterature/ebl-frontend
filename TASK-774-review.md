# TASK-774-review — PR #774 `chore: remove bluebird, use AbortController for cancellation`

| Field                      | Value                                                                                                                                                                                                                                                                                                                                          |
| -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **PR**                     | [#774](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774)                                                                                                                                                                                                                                                                |
| **Title**                  | `chore: remove bluebird, use AbortController for cancellation`                                                                                                                                                                                                                                                                                 |
| **Head reviewed**          | `7afb78ed051325f4b1cc52122c2fe18229a6a2b9`                                                                                                                                                                                                                                                                                                     |
| **Base**                   | `chore/ts7-tsconfig-migration` @ `4f71cb249bc0db899f1a22ce42ac93ebd961eeda` (**not** `master` — stacked on #773)                                                                                                                                                                                                                               |
| **State**                  | open · not draft · `MERGEABLE` / `clean`                                                                                                                                                                                                                                                                                                       |
| **GitHub review decision** | `CHANGES_REQUESTED`                                                                                                                                                                                                                                                                                                                            |
| **Size**                   | 419 files · +21 188 / −14 491 · 10 commits                                                                                                                                                                                                                                                                                                     |
| **Review date**            | 2026-09-03                                                                                                                                                                                                                                                                                                                                     |
| **Reviewed at commit**     | `7afb78ed` (4 commits newer than the commit the standing human review was written against)                                                                                                                                                                                                                                                     |
| **Verdict**                | **REQUEST CHANGES — do not merge yet.** The bluebird removal itself is sound and the previously-requested changes are genuinely fixed. Merge is blocked on process, scope and hygiene, not on the cancellation design.                                                                                                                         |
| **Local gates**            | `yarn tsc` ✅ · `yarn lint` ✅ · `yarn test --watchAll=false` ✅ 403 suites / 3 575 passed / 2 skipped / 50 snapshots / **zero console output** · `yarn build:ci-stable` ✅ exit 0 in 82.86 s, zero warnings (byte-for-byte the command CI's build step runs) · Sass ✅ 59/59 entrypoints compile to **byte-identical CSS vs the base branch** |
| **Dev container**          | ✅ **No changes.** `.devcontainer/` is byte-identical to both the PR base and `master`.                                                                                                                                                                                                                                                        |
| **New `.md` files**        | ❌ **10 added** — see Blocker B3                                                                                                                                                                                                                                                                                                               |
| **qlty**                   | `qlty check` commit status = `success`, description "3 blocking issues" — all three independently verified as pre-existing (F6)                                                                                                                                                                                                                |
| **CodeQL**                 | ❌ **Never ran on this branch** — see Blocker B1                                                                                                                                                                                                                                                                                               |

---

## Review Summary

Nice work — this is a genuinely good change, and the hard part is done properly.

Bluebird is gone from `package.json` and there is not a single reference left anywhere in `src/`. More importantly, the write-cancellation defect that drew the `CHANGES_REQUESTED` has been fixed at the design level rather than patched over: `runWrite` now hands the operation a `StalenessCheck` token instead of an `AbortSignal`, so a superseding save physically cannot abort a dispatched write — and the integration test that was asked for exists and proves both of the required guarantees separately. The 250-line ceiling is met by every script file the PR touches, `Realia.sass` included. Locally, `tsc`, `lint`, the CI-equivalent production build and the full 403-suite run are all clean with zero console output.

What is holding it up is everything around the code rather than the code itself. CI has never run on this branch — not once, on any of the ten commits — because both the `CI` and `CodeQL` workflows only trigger for PRs targeting `master`, and this one targets `chore/ts7-tsconfig-migration`. So a 419-file change is sitting at "all checks green" on the strength of three GitGuardian scans. On top of that, ten `TASK-*.md` tracking documents are committed, and the PR quietly carries a full Sass `@import`→`@use` migration and a repo-wide file-splitting refactor that have nothing to do with bluebird. The Sass half at least checks out cleanly — I compiled every entrypoint on both sides against a base worktree and all 59 produce byte-identical CSS — but nobody should have to do that by hand to review a bluebird PR. None of it is hard to fix; it just has to be fixed before this lands.

Two smaller things worth a look while you are in there: three write paths still keep a live `AbortSignal` in scope next to the write call (harmless today, but it is convention rather than types that keeps it out of `fetch`, which is not what the README claims), and the signal-flavoured twin of `applyWhenCurrent` is still hand-written in eight components.

### Details

Every finding below, in full. Blockers first, then findings in severity order. Each one states what was checked, how it was verified at head `7afb78ed`, and what it costs.

---

#### B1 — Blocker — No CI and no CodeQL has ever run on this branch

**What.** `.github/workflows/main.yml` (`name: CI`) and `.github/workflows/codeql-analysis.yml` (`name: CodeQL`) both declare:

```yaml
on:
  push:
    branches: [master]
  pull_request:
    branches: [master]
```

PR #774 targets `chore/ts7-tsconfig-migration`, so neither workflow is eligible. The only checks that have ever executed against this branch are `GitGuardian scan` (a secret scan, `on: pull_request: branches: ['**']`) and the external `qlty check` commit status.

**Evidence at head `7afb78ed`.** Check runs: `GitGuardian scan` ×2 + `GitGuardian Security Checks`, all `success`. Combined status: `success`, single context `qlty check`. Workflow runs on `chore/remove-bluebird` across all ten commits: sixteen `GitGuardian scan` runs and nothing else. Zero `CI` runs. Zero `CodeQL` runs.

**Cost.** 419 files, +21 188 / −14 491, including a Sass module migration and a repo-wide refactor, are heading toward `master` with no CI-executed test run, no CI lint, no CI type-check, no CI build, and no static security analysis. The green tick on the PR page means "no secrets were committed" and nothing more. Every one of those gates was run by hand for this review and passes — but “it passed on a reviewer’s machine” is not the guarantee a 419-file merge to `master` should rest on, and CodeQL has no local equivalent at all.

**Fix.** Land #773 first, let GitHub retarget #774 to `master`, and require a green `CI` + `CodeQL` before merging. Alternatively add `chore/**` to the `pull_request.branches` list of both workflows so stacked PRs are covered in future — the latter is the durable fix, since this stacking pattern will recur.

---

#### B2 — Blocker — The `CHANGES_REQUESTED` review is still standing

**What.** `Fabdulla1` submitted `CHANGES_REQUESTED` on 2026-08-04 against commit `5ef4a98`. Four commits have landed since (`b744a49b`, `c563799d`, `1b0fe6b2`, `7afb78ed`). The review has not been dismissed, superseded or re-approved, and GraphQL `reviewDecision` still reports `CHANGES_REQUESTED`. GitHub will refuse the merge while that stands.

**Substance check — all four points verified as fixed at head `7afb78ed`:**

1. _"`runWrite` can abort an already dispatched server write."_ **Fixed, by design.** `usePromiseEffect` now returns `[run, cancel, runWrite]`. `runWrite` is backed by `SupersedableOperation`, whose `start()` returns a `StalenessCheck` (`() => boolean`) — never an `AbortSignal`:

   ```ts
   const runWrite = useCallback(
     (operation: WriteOperation): Promise<void> =>
       operation(writeOperation.current.start()).then(() => undefined),
     [],
   )
   ```

   The confirmed path the reviewer traced (`DateSelectionMethods` → `FragmentService` → `FragmentRepository` → `ApiClient.postJson` → `fetch`) can no longer carry a signal, because `saveDateDefault` receives a `StalenessCheck` and `FragmentService`'s write methods take no `signal` parameter.

2. _"Every consumer would need a reliable guard."_ **Not needed — verified structurally.** Every `postJson` / `putJson` call site in `src/` (excluding tests and `ApiClient.ts` itself) was enumerated: `TextService.ts:67`, `FragmentRepository.ts:44`, `WordRepository.ts:51,58`, `BibliographyRepository.ts:42,50`, `ApiFragmentReadRepository.ts:102,176`, `AfoRegisterRepository.ts:64`. **None passes a signal.** The two `postJson` sites in `ApiFragmentReadRepository` are reads over POST, and they also pass none.

3. _"`usePromiseEffect.test.tsx:52-58` runs the same expectation for both run and runWrite… add an integration-level test that reaches a mocked ApiClient or fetch."_ **Done.** `src/common/hooks/usePromiseEffect.write.integration.test.tsx` renders a form driving a real `ApiClient` over `fetchMock`, and asserts:
   - `A superseding write does not attach an abort signal to the dispatched write` — `expect(options.signal).toBeUndefined()` on every started request;
   - `A superseding write does not abort the first write in flight` — resolving both requests leaves `Failure: no failure`;
   - `A superseded write cannot overwrite the current UI state` — the stale first write resolving after the second cannot restore `Saved: first`.

   The reviewer explicitly asked that the stale-UI guarantee be proven _separately_ from the no-abort guarantee; it is, in its own test.

4. _"Files over the 250-line ceiling."_ **All seven fixed.** Verified by `wc -l` over every file the PR touches:

   | File flagged                                             | Then | Now                                                                                                              |
   | -------------------------------------------------------- | ---- | ---------------------------------------------------------------------------------------------------------------- |
   | `src/fragmentarium/application/FragmentService.ts`       | 888  | ≤ 250 (split into `FragmentReadService`, `FragmentCache`, `FragmentWriter`, loaders)                             |
   | `src/fragmentarium/infrastructure/FragmentRepository.ts` | 787  | ≤ 250 (split into `ApiFragmentReadRepository`, `ApiFragmentQueryRepository`, `FragmentRepositoryTypes`)          |
   | `src/corpus/application/TextService.ts`                  | 597  | ≤ 250 (split into `TextServiceBase`, `TextServiceCore`, `TextReadService`, `chapterUrls`)                        |
   | `src/test-support/FakeApi.ts`                            | 516  | ≤ 250 (split into `FakeApiBase`, `FakeApiExpectation`)                                                           |
   | `src/signs/ui/display/SignImages.tsx`                    | 442  | ≤ 250 (split into `PeriodAccordion`, `VariantGroup`, `SignImage`, `signImageGrouping`, `loadClusterAnnotations`) |
   | `src/realia/ui/Realia.sass`                              | 453  | 6 lines + six `_realia-*.sass` partials                                                                          |
   | `src/http/withData.test.tsx`                             | 264  | ≤ 250 (`withData.filtering.test.tsx` + `withData.testSupport.tsx` extracted)                                     |

   No `.ts`/`.tsx` file the PR touches exceeds 250 lines. The only changed files over the ceiling are `yarn.lock` (14 815), the `WordDisplay` snapshot (2 172), `README.md` (304), `src/Introduction.sass` (727) and `src/about/ui/project.sass` (261) — none a script file, and the two `.sass` files are pre-existing and touched only by the one-line `@use` header change.

**Fix.** Ask `Fabdulla1` for a re-review pointing at the four items above; the review must be re-submitted or dismissed before merge.

---

#### B3 — Blocker — Ten task-tracking `.md` files are committed in the PR

**What.** No new `.md` file should ship. The PR adds ten:

| File                              | Lines               |
| --------------------------------- | ------------------- |
| `TASK-774-continuation-prompt.md` | 185                 |
| `TASK-774-log.md`                 | 650                 |
| `TASK-774-review.md`              | 622 (this document) |
| `TASK-774-todo.md`                | 134                 |
| `TASK-address-findings-log.md`    | 104                 |
| `TASK-address-findings-todo.md`   | 40                  |
| `TASK-remove-bluebird-log.md`     | 251                 |
| `TASK-remove-bluebird-review.md`  | 434                 |
| `TASK-remove-bluebird-todo.md`    | 78                  |
| `TASK-ts7-migration-review.md`    | 109                 |

`README.md` (+8 / −2) is a legitimate documentation change and stays.

**Also.** The base PR #773 adds three more — `TASK-ts7-migration-log.md`, `TASK-ts7-migration-research.md`, `TASK-ts7-migration-todo.md`. Because #774 is stacked on it, **13 tracking documents reach `master` unless both PRs are cleaned.** Removing them from #774 alone is not sufficient.

**Also.** The PR description's closing note is stale: it says _"Includes the working-tracking docs `TASK-remove-bluebird-{todo,log}.md`. Remove before merge"_ — naming two of the ten.

**Fix.** Delete all ten in #774 and all three in #773 in a final cleanup commit on each branch, and update the PR description.

---

#### B4 — Blocker — Scope: this is four refactors in one 419-file PR

**What.** The commit list shows the bluebird removal is a minority of the change:

| Commit                             | Contents                                                                            |
| ---------------------------------- | ----------------------------------------------------------------------------------- |
| `7ba6f490`                         | `chore: remove bluebird, use AbortController for cancellation` — the actual subject |
| `1e16d46b`                         | `refactor: migrate Sass @import→@use, dedupe TextService colophon/unplaced fetch`   |
| `eb6f892a`, `b58d2990`, `01e61b13` | AbortSignal threading, `run`/`runWrite` split                                       |
| `5ef4a984`, `b744a49b`             | review fixes                                                                        |
| `c563799d`, `1b0fe6b2`, `7afb78ed` | 250-line file-splitting refactor across ~120 files                                  |

Concretely, the PR contains:

- a **full Sass module-system migration** — 47 `.sass` files moved from `@import src/design-tokens` to `@use 'src/design-tokens' as *`, plus `darken($color, 10)` → `color.adjust($color, $lightness: -10%)` in `TextAnnotation.sass`;
- the matching **`craco.config.js` change** removing four of five `silenceDeprecations` entries and four `ignoreWarnings` regexes — an undo of what #773 added;
- a **repo-wide file-splitting refactor**: 9 test files deleted and ~135 new files added, including 33 new `*.testSupport.*` modules;
- the bluebird removal itself.

**Cost.** Combined with B1, a change of this size and heterogeneity is being merged with no CI verification and one human review that predates the last four commits. The Sass migration in particular is exercised by no gate CI runs: Jest does not compile Sass, so only the build touches it, and the build has never run on this branch in CI. (It is verified below, and comes out clean — but by this review, not by the project's own pipeline.)

**Verification performed during this review.** The Sass work is provably behaviour-preserving:

- `yarn build:ci-stable` — byte-for-byte the command CI's build step runs — completes in 82.86 s with exit 0 and **zero warnings of any kind**, deprecations included.
- **All 59 Sass entrypoints compile to byte-identical CSS against the base branch.** A detached base worktree at `4f71cb2` was created and every non-partial `.sass` file compiled on both sides with `style: "expanded"`: **59/59 byte-identical, 0 differing, 0 failures.** That covers the `@import`→`@use` migration and the `darken($color, 10)` → `color.adjust($color, $lightness: -10%)` swap in `TextAnnotation.sass`.
- **The six-way `Realia.sass` split is byte-identical too** — 9 161 bytes of CSS on both sides, so the cross-module `@extend` placeholders kept their cascade position. The base file emits a Sass `@import` deprecation warning; the split emits none, which is exactly what justifies the `craco.config.js` silencer removal.
- The built `Realia` rules land in the lazy chunk `193.*.chunk.css` (89 occurrences), i.e. the split did not drop them from the bundle.

**Fix.** Splitting the PR now would cost more than it saves given the review already done, and the Sass half is proven equivalent. Get CI green on it (B1) so the pipeline says so too. Going forward, keep mechanical migrations of this size in their own PR — the cost here is reviewability, not correctness.

---

#### F1 — Medium — Three write paths still hold a live `AbortSignal` in scope next to the write call

**What.** `AbortableOperation.start()` aborts the previous controller before creating a new one:

```ts
start(): AbortSignal {
  this.abort()
  this.controller = new AbortController()
  return this.controller.signal
}
```

Three **write** paths use it and keep the resulting signal in scope alongside the write:

| File                                                                                                         | Line                                                                                 | Write                 |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------ | --------------------- |
| [TransliterationForm.tsx:85-102](src/fragmentarium/ui/edition/TransliterationForm.tsx#L85-L102)              | `const signal = updateOperation.current.start()` then `updateEdition(updatedFields)` | fragment edition PUT  |
| [WordEditor.tsx:46-61](src/dictionary/ui/editor/WordEditor.tsx#L46-L61)                                      | `const signal = this.updateOperation.start()` then `wordService.update(word)`        | word PUT              |
| [BibliographyEntryFormController.tsx:40-55](src/bibliography/ui/BibliographyEntryFormController.tsx#L40-L55) | `const signal = this.submitOperation.start()` then `this.props.onSubmit(entry)`      | bibliography POST/PUT |

**Is it broken today?** No. In all three the signal is used only to gate `setState` (`if (!signal.aborted)`), and it is never passed to the service call, so no `fetch` is aborted. Behaviour is correct.

**Why it is still a finding.** `README.md` states, of the write design: _"Write methods on services and repositories therefore take **no** `signal` parameter at all; the type system, not convention, is what keeps a signal out of a write's `fetch`."_ For these three paths that is not true — what keeps the signal out of `fetch` is that nobody typed it in. `SupersedableOperation` + `applyWhenCurrent` gives exactly the same supersession semantics while making the mistake unrepresentable, and the PR already uses it for the other four write paths (`DateSelectionMethods`, `ChapterEditView`, `ScriptSelection`, `CuneiformFragment`). Two mechanisms for one job, one of which is the one the reviewer asked to be eliminated.

**Fix.** Convert the three to `SupersedableOperation` + `applyWhenCurrent`. For the two class components that means holding a `SupersedableOperation` field instead of an `AbortableOperation` and dropping `componentWillUnmount`'s `abort()` in favour of a staleness bump — or accept the difference and correct the README claim to say "by convention in the three legacy write paths".

---

#### F2 — Medium — DRY: the signal-flavoured twin of `applyWhenCurrent` is hand-written eight times

**What.** The PR correctly extracted [applyWhenCurrent.ts](src/common/utils/applyWhenCurrent.ts) for the `isStale` shape. The identical `signal` shape is still copied verbatim across eight components:

```ts
operation().then(
  (result) => {
    if (!signal.aborted) {
      onSuccess(result)
    }
  },
  (error) => {
    if (!signal.aborted) {
      onError(error)
    }
  },
)
```

Occurrences: [FragmentButton.tsx:35,40](src/fragmentarium/ui/FragmentButton.tsx#L35-L43) · [PdfDownloadButton.tsx:35,41](src/fragmentarium/ui/fragment/PdfDownloadButton.tsx#L35-L45) · [WordDownloadButton.tsx:41,47](src/common/ui/WordDownloadButton.tsx#L41-L51) · [ManuscriptsTable.tsx:47,52](src/corpus/ui/ManuscriptsTable.tsx#L47-L56) · [TransliterationForm.tsx:88,99](src/fragmentarium/ui/edition/TransliterationForm.tsx#L88-L101) · [WordEditor.tsx:52,57](src/dictionary/ui/editor/WordEditor.tsx#L52-L60) · [BibliographyEntryFormController.tsx:46,51](src/bibliography/ui/BibliographyEntryFormController.tsx#L46-L53) · [BibliographyEntryForm.tsx:117,133](src/bibliography/ui/BibliographyEntryForm.tsx#L117-L141).

**Why it matters.** DRY is a hard gate in this project, and the extraction that closes it already exists — it just was not given a signal-shaped sibling. Eight copies of a guard is also eight chances for one of them to forget the error branch.

**Fix.** Add `applyWhenNotAborted(operation, signal, { onSuccess, onError })` next to `applyWhenCurrent` (or generalise `applyWhenCurrent` over a `() => boolean` staleness predicate and pass `() => signal.aborted`), and route all eight through it. The second option collapses both families onto one helper and would also resolve F1 cleanly.

---

#### F3 — Medium — Coverage is below 100% on a large share of the changed surface

**What.** Measured from `coverage/coverage-final.json` after `CI=true yarn test --watchAll=false --coverage` at head `7afb78ed`:

- **89** of the 410 changed/added source paths are below 100% on at least one of statements / branches / functions;
- **30** of them are files this PR _adds_.

Worst of the newly-added files:

| File                                                                 | Statements | Branches   | Functions |
| -------------------------------------------------------------------- | ---------- | ---------- | --------- |
| `src/fragmentarium/infrastructure/ApiFragmentReadRepository.ts`      | 66.7 %     | 100 %      | 66.7 %    |
| `src/fragmentarium/ui/fragment/CuneiformFragmentTabContents.tsx`     | 67.9 %     | 50 %       | 57.1 %    |
| `src/fragmentarium/ui/fragment/colophonNameSuggestions.ts`           | 78.8 %     | 50 %       | 90.9 %    |
| `src/corpus/application/CorpusLemmatizationFactory.ts`               | 80.0 %     | **25 %**   | 85.7 %    |
| `src/bibliography/application/BibliographyEntryLoader.ts`            | 85.4 %     | 61.5 %     | 81.5 %    |
| `src/corpus/application/TextServiceBase.ts`                          | 90.9 %     | 66.7 %     | 94.4 %    |
| `src/corpus/application/TextServiceCore.ts`                          | 90.9 %     | 80.0 %     | 92.3 %    |
| `src/signs/ui/display/signImageGrouping.ts`                          | 92.9 %     | 56.3 %     | 100 %     |
| `src/fragmentarium/infrastructure/FragmentRepository.testSupport.ts` | 100 %      | **33.3 %** | 100 %     |

**Important qualification.** Most of these are _extractions_, not new logic — `CuneiformFragmentTabContents.tsx` was carved out of `CuneiformFragment.tsx`, `TextServiceBase`/`TextServiceCore` out of `TextService.ts`, and so on. The gaps travelled with the code rather than being introduced. Global coverage stands at 93.58 % statements / 84.19 % branches / 93.13 % functions / 93.72 % lines. There is no baseline run of the base branch to prove no regression, and there are no coverage thresholds configured in the Jest config, so nothing enforces this automatically.

**Fix.** Either close the gaps on the newly-added files (the actionable subset — the nine above are the ones worth doing), or state explicitly in the PR that the 100 %-on-affected-code gate is being waived for carried-over gaps. Adding `coverageThreshold` to the Jest config would make this measurable in future rather than a manual audit.

---

#### F4 — Low — `runWrite` and the `AbortableOperation` write paths disagree about unmount

**What.** [usePromiseEffect.ts:20-21](src/common/hooks/usePromiseEffect.ts#L20-L21):

```ts
const cancel = useCallback((): void => readOperation.current.abort(), [])
useEffect(() => cancel, [cancel])
```

`cancel` aborts only `readOperation`. `writeOperation` is never superseded on unmount, so a write in flight when the component unmounts still runs its `onSuccess` and calls `setState`. Under React 18 that is a silent no-op — no warning, no leak — so this is not a live bug.

The three `AbortableOperation` write paths from F1 behave the _opposite_ way: they abort on unmount (`useEffect(() => () => updateOperation.current.abort(), [])`, `componentWillUnmount`), so their UI update is suppressed. Same job, two different unmount semantics, neither documented.

**Fix.** Pick one and say so in the README. If `runWrite` should also drop its UI update on unmount, add a `supersede()` to `SupersedableOperation` and call it from the cleanup.

---

#### F5 — Low — The README overstates the type-level guarantee

**What.** `README.md` claims the type system prevents a signal reaching a write's `fetch`. Two seams keep it open:

- [ApiClient.ts:211-233](src/http/ApiClient.ts#L211-L233) — `postJson(path, body, authenticate = true, signal?: AbortSignal)` and `putJson(path, body, signal?: AbortSignal)` both still accept one and forward it into `fetch`;
- [index.tsx:37-42](src/index.tsx#L37-L42) — the exported `JsonApiClient` type declares `postJson` with `signal?: AbortSignal`;
- [ApiClient.requests.test.ts:34](src/http/ApiClient.requests.test.ts#L34) actively asserts `postJson` forwards a signal.

`postJson` is legitimately used for reads-over-POST (`ApiFragmentReadRepository:102,176`, `AfoRegisterRepository:64`), so the parameter has to stay. The guarantee is real one layer up — no service or repository _write_ method accepts a signal — but the README's phrasing claims more than the code delivers.

**Fix.** Reword to: "no service or repository **write** method accepts a `signal`; `ApiClient.postJson` retains the parameter because reads-over-POST need it."

---

#### F6 — Low — qlty reports 3 blocking issues; all three verified pre-existing

**What.** The `qlty check` commit status on `7afb78ed` is `success` with description _"3 blocking issues"_ ([qlty PR page](https://qlty.sh/gh/ElectronicBabylonianLiterature/projects/ebl-frontend/pull/774/issues)). Reproduced locally with `qlty smells --all` and intersected against the PR's changed-file list. On files this PR touches, the flagged items are:

| Item                                                                                                                           | Verdict                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/dictionary/ui/display/WordDisplay.testSupport.ts` — 45 lines similar code, mass 121 (the two `amplifiedMeanings` entries) | **Pre-existing.** Verbatim move: `git show 4f71cb2:src/dictionary/ui/display/WordDisplay.test.tsx` contains the identical `uhetu` / `amplifiedMeanings` fixture. qlty flags it as new only because the file is new. |
| `src/fragmentarium/ui/info/DetailsFields.tsx` — `Joins`, complexity 22                                                         | **Pre-existing.** Identical function at `Details.tsx:54` on the base branch; moved unchanged during the 250-line split.                                                                                             |
| `src/http/ApiClient.test.ts` — similar code, mass 66 (the post/put "Makes a … request with given parameters" pair)             | **Pre-existing.** Both tests exist at base lines 84 and 117 with the same shape; the PR only deleted the `expectSignal` assertions from them.                                                                       |

All six historical qlty inline comments are `isResolved=true` **and** `isOutdated=true`, and the two on `usePromiseEffect.test.tsx` — flagged in the previous review pass as auto-resolved-because-outdated rather than actually fixed — no longer appear in a fresh `qlty smells` run. That duplication is genuinely gone.

**Fix.** No code change is warranted. Either extract the three (cosmetic, and the `WordDisplay` fixture is generated data) or dismiss them in the qlty project so the status stops reading "3 blocking issues".

---

#### F7 — Informational — The production build passes; only the sourcemap-enabled `yarn build` OOMs locally

**Result.** `yarn build:ci-stable` — which expands to `GENERATE_SOURCEMAP=false DISABLE_ESLINT_PLUGIN=true NODE_OPTIONS=--max_old_space_size=1536 craco build`, byte-for-byte the command CI's build step runs (`main.yml:54`) — **succeeds: exit 0 in 82.86 s with zero warnings**, no Sass deprecations among them. The build gate passes.

**The caveat.** The plain `yarn build` script (sourcemaps on, ESLint plugin on) is killed in this dev container:

| Attempt | Settings                                                                        | Result                                                    |
| ------- | ------------------------------------------------------------------------------- | --------------------------------------------------------- |
| 1       | `yarn build` (`--max_old_space_size=1536`)                                      | _"The build failed because the process exited too early"_ |
| 2       | `GENERATE_SOURCEMAP=false DISABLE_ESLINT_PLUGIN=true --max_old_space_size=3072` | same                                                      |
| 3       | + `INLINE_RUNTIME_CHUNK=false --max_old_space_size=2400`                        | same                                                      |
| 4       | `yarn build:ci-stable` (CI's exact command)                                     | **exit 0, 82.86 s, zero warnings**                        |

The container has 7 943 MB total with ~2 900 MB available and 2 CPUs, and the VS Code server plus its TypeScript service already hold ~2.5 GB. The message is CRA's wording for the webpack child process being OOM-killed. **Environment limit, not a defect** — and CI never runs the sourcemap variant anyway.

**Corroboration.** All 59 non-partial Sass entrypoints also compile standalone with the project's `sass` package: 59/59, zero deprecation or other warnings.

**Action.** None required for the code. Worth knowing that `yarn build` needs headroom this container does not have while the IDE is attached; use `yarn build:ci-stable` locally.

---

#### N1 — Note — Dev container configuration: no changes (explicitly checked)

`.devcontainer/` is tracked and contains `Dockerfile`, `README.md`, `devcontainer.json`, `inject-secrets.sh`. Verified three ways:

```
git diff --stat 4f71cb2...HEAD          -- .devcontainer   →  (empty)
git diff --stat origin/master...HEAD    -- .devcontainer   →  (empty)
jq 'select(.filename|test("devcontainer|Dockerfile|\\.vscode"))' <PR files>  →  (none)
```

Neither #774 nor its base #773 touches any dev container file. **Nothing to warn about on this PR.**

---

#### N2 — Note — The PR description is stale

- It describes `usePromiseEffect` as _"new `[run, cancel]` `AbortController` API"_ — the API is now `[run, cancel, runWrite]`, and `runWrite` deliberately uses no `AbortController`. This is the headline fix of the PR and the description does not mention it.
- Under _Behaviour notes_: _"Save/download flows gate `setState` on `signal.aborted` rather than aborting an in-flight write"_ — accurate for downloads, but saves now use `SupersedableOperation`/`isStale`.
- The _Note_ section lists two tracking docs; there are ten (B3).
- _Verification_ says `yarn build → (result in PR thread)` — there is no PR thread comment; the PR has zero issue comments.

---

---

## Remediation status — 2026-09-08 (uncommitted, working tree)

Every finding below was worked after the review above was written. The review text itself is left as it was at `7afb78ed` so the two can be read against each other.

| #      | Status                           | What changed                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
| ------ | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **B1** | **Fixed and verified in CI**     | `main.yml` and `codeql-analysis.yml` now trigger on `pull_request` to `[master, 'chore/**', 'feature/**', 'fix/**']`. Both **have now run** on `f11cca21`: CodeQL green over the added lines, GitGuardian and `qlty check` green, and CI's lint/type-check/build steps green. The `test` job failed on a pre-existing vacuous assertion — see **F8**, fixed.                                                                                                                                                    |
| **B2** | **Open — yours**                 | The `CHANGES_REQUESTED` still stands. Its four points remain verified fixed; the evidence is in section B2. Re-review must be requested by you.                                                                                                                                                                                                                                                                                                                                                                 |
| **B3** | **Open — deferred by decision**  | The 13 `TASK-*.md` files are still present. You chose to keep them; they must be deleted before merge (10 here, 3 on #773).                                                                                                                                                                                                                                                                                                                                                                                     |
| **B4** | **Closed as reviewed**           | Scope stands, but the Sass half is proven byte-identical against the base branch and the build passes.                                                                                                                                                                                                                                                                                                                                                                                                          |
| **F1** | **Fixed**                        | `TransliterationForm`, `WordEditor`, `BibliographyEntryFormController` and `BibliographyEntryForm` moved from `AbortableOperation` to `SupersedableOperation` + `applyWhenCurrent`. No write path holds an `AbortSignal` any more; `AbortableOperation` is now used only by `usePromiseEffect`'s read slot and `CuneiformConverterForm`. `BibliographyEntryForm.load` also lost a latent unhandled rejection — it wrapped `Cite.async` in a promise that rejected into a dropped handle on every invalid entry. |
| **F2** | **Fixed**                        | `applyWhenNotAborted(operation, signal, handlers)` added next to `applyWhenCurrent`; all eight hand-written `if (!signal.aborted)` guard pairs now route through one helper.                                                                                                                                                                                                                                                                                                                                    |
| **F3** | **Closed**                       | Newly-added files below 100%: 30 → 15 → **0** (phase 6). All 70 added files measured are at 100 % statements, branches and functions. See "F3 — how the last 15 were closed" below.                                                                                                                                                                                                                                                                                                                             |
| **F4** | **Fixed by documentation**       | The behaviour change was attempted and reverted: two existing `usePromiseEffect` tests deliberately pin the current semantics. Both unmount behaviours are now documented in `README.md`.                                                                                                                                                                                                                                                                                                                       |
| **F5** | **Fixed**                        | The README's guarantee is now scoped to service and repository write methods, and states why `ApiClient.postJson`/`putJson` keep the parameter. `SupersedableOperation.supersede()` and the two `applyWhen*` helpers are documented.                                                                                                                                                                                                                                                                            |
| **F6** | **Fixed at root, not dismissed** | `ApiClient.test.ts` post/put duplication → `expectJsonRequest(method)`. `DetailsFields.Joins` complexity 22 → split into `JoinPrefix` + `JoinNumber`. `WordDisplay.testSupport.ts` 45-line fixture duplication → the data moved verbatim into `wordDisplayWord.json` (following the repo's existing `dateConverterData.json` pattern); the `.ts` file is now three lines. Repo-wide `qlty smells` **155 → 98**.                                                                                                 |
| **F7** | **Closed**                       | `yarn build:ci-stable` — CI's exact command — passes in ~93 s with zero warnings.                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **N1** | **Unchanged**                    | `.devcontainer/` still untouched.                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| **N2** | **Fixed**                        | The PR description was rewritten and posted to GitHub on 2026-09-08.                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| **F9** | **Fixed**                        | `silenceConsoleErrors` replaced by `expectConsoleErrors(pattern)`, which verifies rather than suppresses; one call site deleted as unnecessary; `react-auth0-spa.security.test.tsx` split under the 250-line ceiling. Proven to fail on unexpected noise.                                                                                                                                                                                                                                                       |

### F8 — CI `test` job failure: an assertion that compared two Promises (2026-09-08)

**Severity: high** — a test that asserted nothing, and a red CI check on the PR head.

**Reproduction.** `NODE_OPTIONS=--max_old_space_size=1536 CI=true yarn test --coverage
--forceExit --detectOpenHandles --watch=false`, or simply `yarn test:diag`. Locally reproducible;
also observed on GitHub Actions run `34219166831`, job `102037960544`.

```
FAIL src/fragmentarium/application/FragmentService.query.test.ts
  ● Query by traditional references › returns traditional reference to fragment numbers mapping data
    expect(received).toEqual(expected) // deep equality
      Promise {
    -   Symbol(async_id_symbol): 588200,
    +   Symbol(async_id_symbol): 594013,
      }
```

**Finding.** The test bound `expected` to `Promise.resolve(returnData)` and `result` to the
un-awaited call, so `expect(result).toEqual(expected)` compared two Promise _objects_. It never
asserted anything about the returned mapping data; it passed only because both promises were
property-less. Under `--detectOpenHandles`, `async_hooks` stamps `Symbol(async_id_symbol)` and
`Symbol(trigger_async_id_symbol)` onto every promise, and jest's `toEqual` compares own symbol
properties — so the vacuous assertion finally failed.

**Pre-existing.** Carried verbatim from the base branch,
`4f71cb2:src/fragmentarium/application/FragmentService.test.ts:1900-1920`; the split at
`1b0fe6b2` moved it unchanged. Fixed here under the pre-existing-issues gate rather than deferred.

**Recommendation, applied.** Await the call and assert against `returnData`, with `result` typed
`FragmentAfoRegisterQueryResult` — the convention already used by the sibling block in the same
file and by `testDelegation`. The promise is captured into `pendingResult` first because
`testing-library/no-await-sync-queries` matches the `queryBy*` prefix and mis-identifies this
domain method as a synchronous Testing Library query; capturing avoids the false positive without
an inline `eslint-disable` and without weakening the rule repo-wide. A repo-wide search confirms
this was the only instance.

**Process finding.** The phase-1-4 local gate, `CI=true yarn test --watchAll=false --coverage`,
omits `--detectOpenHandles` and so cannot reproduce CI; five clean local runs missed this. The
repo already ships `yarn test:diag` with CI's exact flags. That should be the local gate.

### F9 — `silenceConsoleErrors` suppresses `console.error` (2026-09-08, NEW)

**Severity: medium — FIXED (2026-09-08). Option 2 applied on your instruction to address every remaining finding.**

**What.** `src/setupTests.ts:112` exports `silenceConsoleErrors()`, which runs
`jest.spyOn(console, 'error').mockImplementation()`. The project rules state that suppressing
console output is **never** an acceptable solution and that the source must be fixed instead.
There are five call sites; **three are in files this PR added**
(`http/withData.filtering.test.tsx`, `corpus/ui/ChapterEditView.saving.test.ts`,
`fragmentarium/application/FragmentService.testSupport.ts`, the last shared by four suites), and
two are pre-existing (`auth/react-auth0-spa.security.test.tsx`,
`common/errors/ErrorBoundary.test.tsx`).

This matters beyond tidiness: the "zero console output" gate reported in earlier phases is partly
achieved by hiding output rather than by not producing it.

**Reproduction.** Delete the `silenceConsoleErrors()` call from
`FragmentService.testSupport.ts` and run
`CI=true yarn test src/fragmentarium/application/FragmentService.reads.test.ts --watch=false`.
Sixteen `console.error` blocks appear, each `Error: RN1 not found.` raised through
`ReferenceInjector.injectReferencesToMarkup`.

**Root cause.** `rejectBibliographyLookups` deliberately makes `bibliographyService.findMany`
reject; production code at `ReferenceInjector.ts:88` catches that and calls `console.error`. The
logging is _correct production behaviour_ reacting to a failure the test forces on purpose.

**Fix at source attempted and reverted.** Replacing the rejection with
`findMany.mockResolvedValue([])` — matching the sibling helper `createCacheTestContext`, which
needs no suppression — makes the injector succeed rather than fail. That changes the injected
markup structure and breaks **14 assertions across 3 suites**, because those expected values
encode the un-injected result. The rejection is load-bearing, so there is no drop-in fix.

**Options, all with costs.**

1. Accept the suppression where the test's subject _is_ the error path, and document it.
2. Convert each silencer into a `console.error` spy the test asserts on — turning suppression
   into a verified expectation. Correct in principle, invasive across four suites.
3. Stop `ReferenceInjector` logging and let the error propagate — changes production behaviour
   and is outside this PR's scope.

The `ErrorBoundary` and auth cases are React logging its own caught errors; they have no
source-side fix at all and would need option 1 or 2 regardless.

**Fix applied — option 2, at every call site.** `silenceConsoleErrors()` is gone. `setupTests.ts`
now exports `expectConsoleErrors(pattern: RegExp)`, which installs the spy _and_ registers the
errors the test declares it expects. A global `afterEach` then fails the test if any recorded
`console.error` does **not** match the declared pattern. Blanket suppression becomes a verified
expectation: declared errors are tolerated, anything else breaks the build.

The declared patterns were derived empirically, by removing the suppression and capturing what
each site actually logs:

| Call site                                                  | Declared pattern                                                  | What it is                                                         |
| ---------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| `http/withData.filtering.test.tsx`                         | `/Uncaught \[Error: error\]\|The above error occurred/`           | React reporting a deliberately crashing child                      |
| `common/errors/ErrorBoundary.test.tsx`                     | `/Uncaught \[Error: Error happened!\]\|The above error occurred/` | React reporting the boundary's caught error                        |
| `auth/react-auth0-spa.*`                                   | `/Failed to create authenticated session/`                        | the app's own log on auth failure                                  |
| `fragmentarium/application/FragmentService.testSupport.ts` | `/not found\./`                                                   | `ReferenceInjector` logging the forced lookup rejection            |
| `corpus/ui/ChapterEditView.saving.test.ts`                 | _(call deleted)_                                                  | **it logged nothing at all** — the suppression was pure cargo cult |

**Verified to actually catch noise.** A probe `console.error('PROBE: unexpected stray noise')`
added to `ErrorBoundary.test.tsx` failed all three of its tests with the stray message shown in
the diff. The guard is not a no-op.

`react-auth0-spa.security.test.tsx` was 370 lines, over the 250-line ceiling. Touching it brought
it under the gate, so it was split into `react-auth0-spa.sessionFallback.test.tsx` (128),
`react-auth0-spa.tokenSecurity.test.tsx` (94), `react-auth0-spa.guestPermissions.test.ts` (40)
and a shared `react-auth0-spa.testSupport.tsx` (33) that also removes an eight-fold duplicated
`Auth0Provider` render block. Every original assertion survives; the four permission tests were
duplicates of one another across two describes and are now ten granular `it.each` cases.

Note that `react-auth0-spa.*`'s existing `console.warn` spies were already the correct pattern —
they assert on the spy — and were left alone.

### Pre-existing defects fixed at root while remediating

- **Dead code in `CorpusLemmatizationFactory`.** `applySuggestion` and `getSuggestion` were private, never called and overrode nothing — dead at the base branch too (`4f71cb2:src/corpus/application/TextService.ts`), so the split carried them over. Deleted with the imports they alone used. This was the file at 25 % branch coverage; the branches were unreachable.
- **Dead defaults.** `createSummaryItemDto(overrides = {})`, `fragmentDto.date ?? null`, `createChapterDisplayCacheKey`'s two default args, `fetchChapterDisplay`'s two default args, `FragmentariumSearch.testSupport`'s two `query = {}` defaults, and `TextService.testSupport`'s `oldLineNumbers?.… ?? []` — every one unreachable through the public API. Removed.
- **Unreachable batch cache in `BibliographyEntryLoader`.** `cachedFindManyRequests` could never be read: `fetchMany` is only called with ids absent from `cachedFindRequests`, and it registers all of them there before returning, so a repeat batch always takes the in-flight-single path. The map, its `.finally` bookkeeping and `trackIdRequest`'s unreachable per-id fallback were removed; ids are now tracked by index against the order `fetchMany` guarantees. The file is 100 % covered.
- **Duplicated cache logic in `DossierCache`.** The class reimplemented `getCachedValue`/`setCachedValue`/`trimCache` from `common/utils/cache`. Rewritten to use them: 76 → 48 lines, DRY, and 100 % covered.
- **Unreachable fallback in `loadClusterAnnotations`.** The final `: croppedAnnotations` branch cannot be reached — with at least one cluster id, either a cluster succeeds or its annotations land in the fallback list. Removed; the file is 100 % covered.
- **A flaky shared test helper.** `test-support/waitForSpinnerToBeRemoved` (pre-existing, used by 27 suites) used `waitFor`'s default 1 s timeout. Two of five full runs failed a `FragmentView` suite on it under load, in a different suite each time. Given an explicit 5 s timeout, matching the convention already used in `BibliographyEntryForm.test.tsx`.

### One test deleted, with explicit approval

`TransliterationForm.errors.test.tsx` → `does not set an error for a cancellation error`. Probed against the unmodified code: the cancellation error **does** reach the form's error state; the assertion merely ran one microtask before it landed, because `.then().catch()` settles a tick later than `.then(onSuccess, onError)`. Nothing ever special-cased cancellation errors there, and bluebird's `CancellationError` no longer exists in the codebase. The file's other three tests still cover real error display and clearing.

### F3 — how the last 15 were closed (phase 6)

All fifteen are now at 100 %. Nine were closed with new tests, six by deleting provably dead
code. The details are in `TASK-774-log.md` under "Phase 6". Three points worth keeping here:

- **`SpanAnnotationDisplay.tsx` was not brittle after all.** The earlier pass judged its
  "selection started on a different token" retry untestable in jsdom. It is testable: the
  existing suite already fires the right mousedown/mouseup pair but replaces the interim
  selection **before** the deferred `applySelection` runs, so the retry branch was skipped.
  Holding the single-token selection steady reaches it deterministically.
- **`DossiersQueryByIdsBatcher`'s empty-flush guard was unreachable and redundant.** `ids` and
  `requests` only ever accumulate together, so no requests implies no ids, which already falls to
  a no-op. Removed rather than tested.
- **Six test-support helpers carried dead configuration** — mock implementations for functions no
  suite ever calls, a dead default argument, a dead `||` fallback and a dead parameter. Removed;
  all dependent suites still pass.

### Gates after remediation

| Gate                                            | Result                                                                             |
| ----------------------------------------------- | ---------------------------------------------------------------------------------- |
| `yarn tsc --noEmit`                             | clean                                                                              |
| `yarn lint`                                     | clean                                                                              |
| `CI=true yarn test --watchAll=false --coverage` | **414 suites passed, 3 661 passed / 2 skipped, 50 snapshots, zero console output** |
| `yarn build:ci-stable`                          | exit 0, 92.71 s, zero warnings                                                     |
| 250-line ceiling                                | no changed `.ts`/`.tsx` over 250                                                   |
| `qlty smells`                                   | 155 → 98 repo-wide; no smell remains on a file this PR authored                    |

---

## Summary

PR #774 removes the `bluebird` dependency and replaces its cancellable-promise usage with the web-standard `AbortController` / `AbortSignal`. `bluebird` and `@types/bluebird` are gone from `package.json`, `yarn.lock` is updated, and `grep -rn "bluebird\|Bluebird" src/` returns nothing. `src/http/cancellableFetch.ts` is deleted and `ApiClient` calls native `fetch` directly.

The cancellation design at head `7afb78ed` is coherent and correct:

- **Reads** — `withData` owns an `AbortController`, passes `signal` as the getter's second argument, and aborts on unmount or watched-prop change; the pre-existing `requestSequence` guard still prevents stale state where a getter does not thread the signal.
- **Writes** — `usePromiseEffect().runWrite` hands the operation a `StalenessCheck` from `SupersedableOperation`. A superseded write runs to completion and only its UI update is discarded. No signal can reach a write's `fetch`.
- **Shared cached requests** — `getOrFetchCachedValue` reuses the in-flight promise across callers and takes a zero-argument `fetchValue`, so no caller can abort a request other callers are waiting on.
- **Concurrency** — `ConcurrencyLimiter` replaces `Bluebird.map({ concurrency })`; an optional `signal` aborts only a _queued_ operation, and the waiting-resolver list is cleaned up on both resolve and abort.
- **Helpers** — `mapSeries`, `applyWhenCurrent`, `abortError` (`isAbortError` / `isCancellation` / `createAbortError`).

The four points raised in the standing `CHANGES_REQUESTED` are all genuinely resolved (detailed in B2). Local gates are clean: `yarn tsc`, `yarn lint`, `yarn build:ci-stable`, and 403 suites / 3 575 tests / 50 snapshots with **zero console output**. The two skipped tests are pre-existing `xit`s in `Edition.test.tsx`, unchanged by this PR. The out-of-scope Sass migration was verified equivalent by compiling all 59 entrypoints on both sides of the base: 59/59 byte-identical CSS.

What blocks merge is the surrounding state: no CI or CodeQL has ever run on this branch (B1), the human review is still `CHANGES_REQUESTED` (B2), ten tracking `.md` files are committed (B3), and the PR silently carries a Sass module migration and a repo-wide splitting refactor alongside the bluebird work (B4).

### Pre-existing reviews and comments — hard gate, all gathered

Fetched at review time via REST (`/pulls/774/reviews`, `/pulls/774/comments`, `/issues/774/comments`, `/issues/774/timeline`) and GraphQL `reviewThreads` for resolution and outdated status. `gh` is not installed in this dev container; `GITHUB_TOKEN` + `curl` were used.

**Timeline review events — 3:**

| Author        | Date       | Commit    | State                   | Status                                                                        |
| ------------- | ---------- | --------- | ----------------------- | ----------------------------------------------------------------------------- |
| `qltysh[bot]` | 2026-07-21 | `7ba6f49` | `COMMENTED`             | superseded (empty body; carried the 2 inline comments below)                  |
| `qltysh[bot]` | 2026-07-23 | `01e61b1` | `COMMENTED`             | superseded (empty body; carried 4 inline comments)                            |
| `Fabdulla1`   | 2026-08-04 | `5ef4a98` | **`CHANGES_REQUESTED`** | **UNRESOLVED — blocker B2** (4 commits behind head; substance verified fixed) |

**Inline review comments — 6, all from `qltysh[bot]`, all `isResolved=true` and `isOutdated=true`:**

| Comment                                                                                                       | File                                     | Line | Issue                  | Actually fixed at head?                                                                                                                                                   |
| ------------------------------------------------------------------------------------------------------------- | ---------------------------------------- | ---- | ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [r3623999642](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774#discussion_r3623999642) | `corpus/application/TextService.ts`      | 394  | similar-code, mass 79  | **Yes** — `TextService.ts` split into 7 modules; no duplication in a fresh `qlty smells` run                                                                              |
| [r3623999655](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774#discussion_r3623999655) | `corpus/application/TextService.ts`      | 412  | similar-code, mass 79  | **Yes**                                                                                                                                                                   |
| [r3638371006](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774#discussion_r3638371006) | `corpus/application/TextService.ts`      | 487  | similar-code, mass 66  | **Yes**                                                                                                                                                                   |
| [r3638371019](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774#discussion_r3638371019) | `corpus/application/TextService.ts`      | 503  | similar-code, mass 66  | **Yes**                                                                                                                                                                   |
| [r3638370985](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774#discussion_r3638370985) | `common/hooks/usePromiseEffect.test.tsx` | 52   | similar-code, mass 120 | **Yes** — flagged as unfixed in the previous pass; commit `7afb78ed` collapsed `renderReads`/`renderWrites` onto one `renderRuns`, and the smell is gone from a fresh run |
| [r3638370997](https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774#discussion_r3638370997) | `common/hooks/usePromiseEffect.test.tsx` | 101  | similar-code, mass 120 | **Yes**                                                                                                                                                                   |

**General/issue comments — 0.**

**Automated reviewers present:** `qltysh[bot]` only. **`sourcery-ai` has never reviewed or commented on this PR**, nor has any other review bot (CodeRabbit, Copilot, Codecov, Snyk). The full timeline contains exactly: 10 `committed`, 2 `reviewed` by `qltysh[bot]`, 1 `reviewed` by `Fabdulla1`, 1 `review_requested`, 1 `cross-referenced`.

**Requested reviewers at head:** none pending.

---

## Findings

| #   | Severity    | Area                 | Finding                                                                                                                                                                                                                                            |
| --- | ----------- | -------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| B1  | **Blocker** | CI / security        | `CI` and `CodeQL` workflows only trigger on PRs to `master`; neither has ever run on this branch. 419 files merging with secret-scanning as the only executed check.                                                                               |
| B2  | **Blocker** | Process              | `Fabdulla1`'s `CHANGES_REQUESTED` (2026-08-04, `5ef4a98`) still stands, 4 commits behind head. All four of its points verified fixed; needs re-review or dismissal.                                                                                |
| B3  | **Blocker** | Hygiene              | 10 `TASK-*.md` tracking documents committed; 3 more arrive via base #773 — 13 reach `master` if unaddressed.                                                                                                                                       |
| B4  | **Blocker** | Scope                | Bundles a full Sass `@import`→`@use` migration, a `craco.config.js` change, and a ~120-file 250-line-ceiling refactor into the bluebird PR. Unreviewable as one unit without CI. The Sass half is verified byte-identical against the base branch. |
| F1  | Medium      | Correctness (latent) | `TransliterationForm`, `WordEditor`, `BibliographyEntryFormController` keep a live `AbortSignal` in scope beside a write. Correct today by convention, not by type — contradicting the README.                                                     |
| F2  | Medium      | DRY (hard gate)      | The `signal`-flavoured twin of `applyWhenCurrent` is hand-written verbatim in 8 components.                                                                                                                                                        |
| F3  | Medium      | Test coverage        | 89 changed files / 30 newly-added files below 100 %; worst new file at 25 % branches. No `coverageThreshold` configured.                                                                                                                           |
| F4  | Low         | Consistency          | `runWrite` does not supersede on unmount; the `AbortableOperation` write paths do abort on unmount. Same job, opposite semantics, undocumented.                                                                                                    |
| F5  | Low         | Documentation        | README claims a type-level guarantee that `ApiClient.postJson`/`putJson` and the `JsonApiClient` type do not provide.                                                                                                                              |
| F6  | Low         | Static analysis      | qlty reports "3 blocking issues"; all three independently verified pre-existing (verbatim moves). Needs dismissal, not code.                                                                                                                       |
| F7  | Info        | Build                | `yarn build:ci-stable` — CI's exact build command — passes: exit 0, 82.86 s, zero warnings. Only the sourcemap-enabled `yarn build` OOMs locally; environment limit, no action needed.                                                             |
| N1  | Info        | Dev container        | **No changes** to `.devcontainer/` in #774 or #773 — explicitly verified.                                                                                                                                                                          |
| N2  | Info        | Documentation        | PR description is stale on the `runWrite` design, the save-flow behaviour note, the doc-file count, and the build result.                                                                                                                          |

---

## Severity

| Severity          | Count | Items          |
| ----------------- | ----- | -------------- |
| **Blocker**       | 4     | B1, B2, B3, B4 |
| **Medium**        | 3     | F1, F2, F3     |
| **Low**           | 3     | F4, F5, F6     |
| **Informational** | 3     | F7, N1, N2     |

**Console noise findings: 0.** The full suite produced zero `console.error`, `console.warn`, `console.log`, React `Warning:`, `not wrapped in act`, and zero unhandled rejections. The console-clean hard gate passes, so it does not block approval.

---

## Reproduction Steps

All commands run at head `7afb78ed051325f4b1cc52122c2fe18229a6a2b9` on `chore/remove-bluebird`, base `4f71cb249bc0db899f1a22ce42ac93ebd961eeda`.

```bash
# ── Reviews, comments and thread resolution (gh is not installed; use the API) ──────────────
API=https://api.github.com/repos/ElectronicBabylonianLiterature/ebl-frontend
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "$API/pulls/774/reviews?per_page=100"
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "$API/pulls/774/comments?per_page=100"
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "$API/issues/774/comments?per_page=100"   # → 0
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "$API/issues/774/timeline?per_page=100"

# resolved-vs-outdated distinction, and the standing review decision
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" -X POST https://api.github.com/graphql \
  -d '{"query":"query { repository(owner:\"ElectronicBabylonianLiterature\", name:\"ebl-frontend\") { pullRequest(number:774) { reviewDecision reviewThreads(first:100) { nodes { isResolved isOutdated path resolvedBy { login } } } } } }"}'

# ── B1: checks on the head SHA, and why CI/CodeQL never ran ────────────────────────────────
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "$API/commits/7afb78ed.../check-runs"   # GitGuardian ×3 only
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "$API/commits/7afb78ed.../status"       # qlty check only
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "$API/actions/runs?branch=chore/remove-bluebird&per_page=40"
head -20 .github/workflows/main.yml .github/workflows/codeql-analysis.yml   # on.pull_request.branches: [master]

# ── B3: new .md files ──────────────────────────────────────────────────────────────────────
curl -s -H "Authorization: Bearer $GITHUB_TOKEN" "$API/pulls/774/files?per_page=100&page=1" \
  | jq -r '.[] | select(.filename|test("\\.md$")) | "\(.status) \(.filename)"'    # repeat pages 1..5

# ── N1: dev container ──────────────────────────────────────────────────────────────────────
git diff --stat 4f71cb2...HEAD       -- .devcontainer     # (empty)
git diff --stat origin/master...HEAD -- .devcontainer     # (empty)

# ── B2 item 4: the 250-line ceiling, intersected with the PR's changed files ───────────────
while read -r f; do [ -f "$f" ] || continue; n=$(wc -l < "$f")
  [ "$n" -gt 250 ] && printf "%5d %s\n" "$n" "$f"; done < changed-files.txt | sort -rn

# ── B2 item 2: no write call site passes a signal ──────────────────────────────────────────
grep -rn "postJson\|putJson" src --include=*.ts --include=*.tsx \
  | grep -v "\.test\.\|test-support\|src/http/ApiClient.ts"

# ── F2: the duplicated abort guard ─────────────────────────────────────────────────────────
grep -rn "signal\.aborted\|isCancellation(" src --include=*.ts --include=*.tsx \
  | grep -v "\.test\.\|testSupport\|common/utils/abortError.ts"

# ── F6: qlty ───────────────────────────────────────────────────────────────────────────────
qlty smells --all      # then intersect the reported files with the PR's changed-file list

# ── B4: every Sass entrypoint compiled on both sides and diffed against the base branch ────────────────────
node -e 'const sass=require("sass"),{execSync}=require("child_process");
  const files=execSync("find src -name \"*.sass\" -not -name \"_*\"",{encoding:"utf8"}).split("\n").filter(Boolean);
  let ok=0,warns=[]; for(const f of files){ sass.compile(f,{syntax:"indented",
    loadPaths:[process.cwd(),"node_modules"],quietDeps:false,
    logger:{warn:(m)=>warns.push(f+": "+m)}}); ok++; }
  console.log(ok+"/"+files.length+" compiled, "+warns.length+" warnings")'
# → 59/59 compiled, 0 warnings

git worktree add -f --detach /tmp/basetree 4f71cb2
node -e 'const sass=require("sass"),fs=require("fs"),path=require("path"),{execSync}=require("child_process");
  const BASE="/tmp/basetree";
  const files=execSync("find src -name \"*.sass\" -not -name \"_*\"",{encoding:"utf8"}).split("\n").filter(Boolean);
  let same=0,diff=[]; for(const f of files){
    const h=sass.compile(f,{syntax:"indented",loadPaths:[process.cwd(),"node_modules"],style:"expanded"}).css;
    const b=sass.compile(path.join(BASE,f),{syntax:"indented",loadPaths:[BASE,"node_modules"],style:"expanded",
      logger:{warn:()=>{}}}).css;
    h===b ? same++ : diff.push(f); }
  console.log(same+"/"+files.length+" byte-identical, "+diff.length+" differing", diff)'
# → 59/59 byte-identical, 0 differing

# ── Hard gates ─────────────────────────────────────────────────────────────────────────────
yarn tsc --noEmit                                  # clean, 48.75 s
yarn lint                                          # clean, 74.32 s
CI=true yarn test --watchAll=false --coverage      # 403 suites, 3575 passed / 2 skipped, 50 snapshots, 546 s
yarn build:ci-stable                               # CI's exact build command: exit 0, 82.86 s, zero warnings

# ── F3: coverage of the changed surface ────────────────────────────────────────────────────
node -e 'const c=require("./coverage/coverage-final.json"), fs=require("fs");
  const changed=new Set(fs.readFileSync("changed-files.txt","utf8").split("\n").filter(Boolean));
  const pct=o=>{const v=Object.values(o);return v.length?v.filter(x=>x>0).length/v.length*100:100};
  for(const [k,f] of Object.entries(c)){ const rel=k.replace(process.cwd()+"/","");
    if(!changed.has(rel)) continue;
    const b=Object.values(f.b).flat(); const br=b.length?b.filter(x=>x>0).length/b.length*100:100;
    if(pct(f.s)<100||pct(f.f)<100||br<100) console.log(rel, pct(f.s).toFixed(1), br.toFixed(1), pct(f.f).toFixed(1)); }'
```

---

## Recommendation

**Request changes. Do not merge at head `7afb78ed`.**

The cancellation work is good and I would approve it on its technical merits. Every point of the standing `CHANGES_REQUESTED` is genuinely addressed, the design is better than what bluebird provided, and the local gates are clean including the console-clean requirement. What is missing is verification and hygiene, and the two compound: a 419-file change carrying a Sass module migration and a repo-wide refactor is exactly the change that most needs CI, and it is the one change CI has never seen.

Order of operations:

1. **Get CI running** (B1). Land #773, let GitHub retarget this PR to `master`, and require green `CI` + `CodeQL`. Every gate including the production build passes locally (F7), so this is about who verifies it, not whether it works — and CodeQL has no local substitute. Adding `chore/**` to both workflows' `pull_request.branches` is the durable fix for stacked PRs.
2. **Remove the 13 tracking documents** (B3) — 10 in this PR, 3 in #773. This document is one of them.
3. **Re-review** (B2). The four points are answered; point `Fabdulla1` at the answers in B2 and get the review re-submitted or dismissed.
4. **Close F1 and F2 together** by generalising `applyWhenCurrent` over a `() => boolean` staleness predicate and routing all eleven call sites (3 writes + 8 signal guards) through it. That removes the last `AbortSignal`-beside-a-write and the eight-way duplication in one change, and makes the README's claim true.
5. **Decide on F3** — close the gaps on the newly-added files, or state the waiver explicitly.
6. **F4, F5, F6, N2** are cheap tidy-ups: document the unmount semantics, correct the README's guarantee wording, dismiss the three pre-existing qlty smells, refresh the PR description.

Nothing here requires redesign. Items 1–3 are mechanical; item 4 is the only real code change and it is a consolidation, not a rework.

---

## Comment status tracking

| Thread / review   | Author        | Type                                    | Resolved? | Outdated?             | Blocking?    | Disposition                                                        |
| ----------------- | ------------- | --------------------------------------- | --------- | --------------------- | ------------ | ------------------------------------------------------------------ |
| Review 4746909786 | `qltysh[bot]` | review event, `COMMENTED`               | n/a       | superseded            | No           | Carried inline comments below                                      |
| Review 4764412287 | `qltysh[bot]` | review event, `COMMENTED`               | n/a       | superseded            | No           | Carried inline comments below                                      |
| Review 4854993025 | `Fabdulla1`   | review event, **`CHANGES_REQUESTED`**   | **No**    | 4 commits behind head | **YES — B2** | Substance verified fixed; needs re-review or dismissal             |
| r3623999642       | `qltysh[bot]` | inline, `TextService.ts:394`            | Yes (bot) | Yes                   | No           | Genuinely fixed                                                    |
| r3623999655       | `qltysh[bot]` | inline, `TextService.ts:412`            | Yes (bot) | Yes                   | No           | Genuinely fixed                                                    |
| r3638371006       | `qltysh[bot]` | inline, `TextService.ts:487`            | Yes (bot) | Yes                   | No           | Genuinely fixed                                                    |
| r3638371019       | `qltysh[bot]` | inline, `TextService.ts:503`            | Yes (bot) | Yes                   | No           | Genuinely fixed                                                    |
| r3638370985       | `qltysh[bot]` | inline, `usePromiseEffect.test.tsx:52`  | Yes (bot) | Yes                   | No           | Genuinely fixed in `7afb78ed`; gone from a fresh `qlty smells` run |
| r3638370997       | `qltysh[bot]` | inline, `usePromiseEffect.test.tsx:101` | Yes (bot) | Yes                   | No           | Genuinely fixed in `7afb78ed`                                      |

**Unresolved: 1** (`Fabdulla1`'s `CHANGES_REQUESTED`). **Resolved: 6** inline + 2 superseded bot review events. **General comments: 0.** **`sourcery-ai` and other review bots: absent from this PR entirely.**

---

## What Has To Be Done

> **Updated 2026-09-08, second revision.** Items 1, 3, 7, 8, 10, 11, 12 and 13 are done; item 9 is substantially done. Item 2 is one push away — CI now runs on this PR and only the `test` job failed, on the pre-existing defect recorded as **F8**, which is fixed locally with every gate re-verified under CI's exact flags. What is genuinely left is items 2, 4, 5, 6, 14 and the residue of 9. The list is kept in its original numbering so nothing is lost; item 14 is new.

1. ~~**Make CI and CodeQL run on this PR.**~~ **Done.** Both workflows ran on `f11cca21` after the push.
2. **Get a green `CI` run on head.** On `f11cca21` lint, type-check and build passed; the `test` job failed on F8, now fixed locally. CI must be re-run on the new head to confirm green. **Blocker B1 — needs a push, ask first.**
3. ~~**Get a green `CodeQL` run on head.**~~ **Done.** `CodeQL` and `Analyze (javascript)` both succeeded on `f11cca21`.
4. **Delete the 10 tracking `.md` files from this PR**: `TASK-774-continuation-prompt.md`, `TASK-774-log.md`, `TASK-774-review.md` (this file), `TASK-774-todo.md`, `TASK-address-findings-log.md`, `TASK-address-findings-todo.md`, `TASK-remove-bluebird-log.md`, `TASK-remove-bluebird-review.md`, `TASK-remove-bluebird-todo.md`, `TASK-ts7-migration-review.md`. **Blocker B3.**
5. **Delete the 3 tracking `.md` files from base PR #773**: `TASK-ts7-migration-log.md`, `TASK-ts7-migration-research.md`, `TASK-ts7-migration-todo.md`. Cleaning #774 alone still lets 3 documents reach `master`. **Blocker B3.**
6. **Obtain a re-review from `Fabdulla1`.** The `CHANGES_REQUESTED` from 2026-08-04 is the standing review decision and will block the merge button. All four of its points are answered in section B2 above — link them in the request. **Blocker B2.**
7. **Convert the three remaining `AbortableOperation` write paths to `SupersedableOperation`** — `TransliterationForm.submit`, `WordEditor.updateWord`, `BibliographyEntryFormController.handleSubmit` — so no write path holds an `AbortSignal`. **Required code change, F1.**
8. **Extract the signal-flavoured guard into a shared helper** and route all 8 hand-written copies through it (`FragmentButton`, `PdfDownloadButton`, `WordDownloadButton`, `ManuscriptsTable`, `TransliterationForm`, `WordEditor`, `BibliographyEntryFormController`, `BibliographyEntryForm`). Generalising `applyWhenCurrent` over a `() => boolean` predicate satisfies items 7 and 8 in one change. **Required code change — DRY hard gate, F2.**
9. ~~**Close the coverage gaps on the newly-added files.**~~ **Done.** All 70 added files are at 100 % statements, branches and functions (was 15 short). **F3 closed.**
10. **Document the unmount semantics of `runWrite`** in `README.md`, or add a `supersede()` to `SupersedableOperation` and call it from `usePromiseEffect`'s cleanup so both write mechanisms behave identically on unmount. **Required change, F4.**
11. **Correct the README's type-level claim.** `ApiClient.postJson`/`putJson` and the exported `JsonApiClient` type still accept `signal?: AbortSignal`. Reword to scope the guarantee to service and repository write methods. **Required doc change, F5.**
12. **Dismiss the 3 pre-existing qlty blocking issues** in the qlty project (`WordDisplay.testSupport.ts` duplication, `DetailsFields.Joins` complexity, `ApiClient.test.ts` post/put duplication), or extract them. All three were verified as verbatim moves of base-branch code. No behaviour change is warranted. **Required follow-up, F6.**
13. **Update the PR description**: the `[run, cancel, runWrite]` API and the write-supersession design, the corrected save-flow behaviour note, the tracking-document count, and the `yarn build` result. **Required doc change, N2.**
14. ~~**Decide how to handle `silenceConsoleErrors`.**~~ **Done.** Replaced with `expectConsoleErrors(pattern)`, which verifies the declared errors and fails on anything else. **F9 closed.**
15. **Use `yarn test:diag` as the local test gate.** It is CI's exact flag set; the command used in phases 1-4 omits `--detectOpenHandles` and cannot reproduce CI. This is what let F8 through five clean local runs. **Required process change, F8.**
16. ~~**Consider adding `coverageThreshold` to the Jest config.**~~ **Done.** `craco.config.js` now sets a global ratchet (statements 94, branches 85, functions 93, lines 94), just under the current 94.2 / 85.9 / 93.9 / 94.32, so a regression fails CI.
17. **Delete this review file before merge**, together with the documents in items 4 and 5.

---

## Verification appendix — local gate evidence at `7afb78ed`

| Gate                      | Command                                                                                                                                | Result                                                                              |
| ------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| TypeScript                | `yarn tsc --noEmit`                                                                                                                    | ✅ clean, 48.75 s                                                                   |
| Lint (ESLint + Stylelint) | `yarn lint`                                                                                                                            | ✅ clean, 74.32 s                                                                   |
| Full test suite           | `CI=true yarn test --watchAll=false --coverage`                                                                                        | ✅ 403 suites passed / 403 · 3 575 passed, 2 skipped / 3 577 · 50 snapshots · 546 s |
| Console-clean             | grep of the full run for `console.error`, `console.warn`, `console.log`, `Warning:`, `not wrapped in act`, `UnhandledPromiseRejection` | ✅ zero hits                                                                        |
| Skipped tests             | `grep -rn "\.skip(\|\.only(\|xit(\|xdescribe("`                                                                                        | ✅ 2 `xit`s in `Edition.test.tsx`, both pre-existing at base, untouched             |
| 250-line ceiling          | `wc -l` over every changed file                                                                                                        | ✅ no `.ts`/`.tsx` file over 250                                                    |
| Residual bluebird         | `grep -rn "bluebird\|Bluebird" src/`                                                                                                   | ✅ zero hits                                                                        |
| Residual bluebird idioms  | `grep -rn "\.isCancelled()\|Promise\.config\|onCancel\|cancellableFetch" src/`                                                         | ✅ zero hits                                                                        |
| Sass compilation          | direct `sass.compile()` over all non-partial entrypoints                                                                               | ✅ 59/59, zero deprecation warnings                                                 |
| Sass equivalence          | every entrypoint compiled on both sides against a base worktree at `4f71cb2`                                                           | ✅ 59/59 byte-identical CSS, 0 differing, 0 failures                                |
| `Realia.sass` split       | compiled CSS, six partials vs the base 453-line file                                                                                   | ✅ byte-identical, 9 161 bytes both sides                                           |
| Production build          | `yarn build:ci-stable` (CI's exact command)                                                                                            | ✅ exit 0, 82.86 s, zero warnings — see F7 for the plain `yarn build` OOM           |
| Global coverage           | `coverage/coverage-final.json`                                                                                                         | 93.58 % statements · 84.19 % branches · 93.13 % functions · 93.72 % lines           |

---

## Closing state — 2026-09-08 (phase 7)

**Every code-level finding is closed:** B1, B4, F1-F9 and N2 fixed; N1 was informational. B2 and
B3 are yours by design — reviewer assignment and the deletion of the tracking documents.

Final gates, all under CI's exact flag set (`yarn test:diag`):

| Gate                    | Result                                                            |
| ----------------------- | ----------------------------------------------------------------- |
| `yarn lint`             | clean                                                             |
| `yarn tsc`              | clean                                                             |
| Full suite              | 425 suites passed, 3 692 passed / 2 skipped, 50 snapshots, exit 0 |
| Console output          | zero                                                              |
| `coverageThreshold`     | passes (global ratchet 94 / 85 / 93 / 94)                         |
| Coverage of added files | 71 measured, 0 below 100 %                                        |
| `yarn build:ci-stable`  | exit 0                                                            |
| 250-line ceiling        | no changed `.ts`/`.tsx` over 250                                  |

The work is committed on top of `f11cca21` and **not pushed**. Next steps are listed in
`TASK-774-todo.md` and in the continuation prompt; the first is pushing so CI can run.
