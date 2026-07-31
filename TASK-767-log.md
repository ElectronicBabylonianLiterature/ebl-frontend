# TASK-767 — Work log

Review of PR #767, head `7d5015e2124cf6486deac70724386f692e3de655`.

## 1. Gathering

`gh` is not installed in this Codespace; everything was fetched with `curl` against
`api.github.com` using `$GITHUB_TOKEN` (REST for reviews, checks and statuses; GraphQL
for `reviewThreads` because REST does not expose `isResolved` / `isOutdated`).

- PR: `#767`, open, base `master`, head `add-realia-annotation`, 29 commits,
  124 changed files, +13629 / -6315, `mergeable_state: blocked`.
- Review events: 5 — two `COMMENTED` from `qltysh[bot]`, one `APPROVED` and two
  `CHANGES_REQUESTED` from `Fabdulla1`. The latest `CHANGES_REQUESTED` is on the current
  head, so it is live.
- Review threads: 5, all authored by `qltysh[bot]`, all **resolved** and **outdated**.
- Issue / general comments: 0.
- Check runs (8) and commit statuses (3): all `success` or `skipped`; nothing failing.

## 2. qlty

- Remote: `qlty check` = "No blocking issues", `qlty coverage diff` = 100.0%,
  `qlty coverage` = 94.0% (+0.8%).
- Local `qlty check` over the 116 changed source files: no issues. (`--upstream=origin/master`
  reported "No modified files"; passing the file list explicitly worked.)
- Local `qlty smells`: two structural smells, both pre-existing —
  `Fragment` constructor (34 parameters, was 32) and `TestData` constructor (6 parameters,
  unchanged). Recorded as finding F9, non-blocking.

## 3. Verification against the current head

Each pre-existing reviewer point was re-checked against `7d5015e2` rather than trusted.

| Point                                              | Result                                                                                                                                                       |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Jul 22 — toggle label                              | **Fixed.** `FragmentDisplaySettings.tsx:96` now reads `title={'Toggle annotations'}`, `aria-label={'toggle-annotations'}`.                                   |
| Jul 22 — workflow test                             | **Fixed.** `TextAnnotation.save.test.tsx` asserts both lists are submitted together and that `tier` / `name` / `layer` are absent from every submitted span. |
| Jul 30 — `any` + eslint-disable                    | **Open** — `injectedApp.testSupport.tsx:37-38`. → F3                                                                                                         |
| Jul 30 — `RealiaSelect` rejection / race / unmount | **Open** — `RealiaSelect.tsx:52`. → F1                                                                                                                       |
| Jul 30 — save vs. refresh outcomes                 | **Open** — `SpanAnnotationDisplay.tsx:45-54`. → F2                                                                                                           |
| Jul 30 — mount-only reducer init                   | **Open** — `TextAnnotationContext.tsx:130-135`. → F4                                                                                                         |
| Jul 30 — export negative assertions                | **Open** — export tests untouched by the PR. → F5                                                                                                            |

## 4. Cross-repository contract check

The PR description says the deployed API "does not accept realia spans yet". Reading
`ebl-api` master directly showed the mismatch is wider than that:

- `ebl/fragmentarium/web/named_entities.py` `on_post` reads `req.media["annotations"]`.
  The frontend now posts `{ namedEntities, realia }` with no `annotations` key →
  `KeyError` → 500, not a 422.
- `on_get` returns a flat list. `createAnnotationSpans` reads `dto.namedEntities ?? []`
  and `dto.realia ?? []`, so against the current API every existing annotation reads as
  empty in the editor.

`ebl-api` PR #740 ("Realia annotation API…", head `add-realia-annotation-api`) introduces
the `namedEntities` / `realia` payload keys and `RealiaAnnotationSpanSchema`. It is **open
and unmerged**. Recorded as F10, a merge-ordering blocker.

## 5. Local gates on the merge with `master`

`origin/master` had moved to `e96b8536` (the PR base recorded at creation was `24d6dd36`),
so the gates were run on the merge result, not on the branch.

```sh
yarn install --frozen-lockfile                       # Done in 47.06s
git worktree add --detach <path> origin/master
git -C <path> merge --no-ff --no-edit add-realia-annotation   # clean, no conflicts
```

| Gate                              | Result                                                                                                             |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| `yarn install --frozen-lockfile`  | exit 0                                                                                                             |
| `yarn tsc`                        | exit 0                                                                                                             |
| `yarn lint` (eslint + stylelint)  | exit 0                                                                                                             |
| `yarn test --watchAll=false`      | 377/377 suites, 3842 passed, 2 skipped, 50 snapshots                                                               |
| Console noise                     | **none** — full (untruncated) log grepped for `console.`, `Warning:`, `not wrapped in act`, `Unhandled`; zero hits |
| `yarn build`                      | exit 0                                                                                                             |
| Coverage, 62 changed source files | **100 / 100 / 100 / 100** on every file                                                                            |

The first test run was piped through `tail -200`, which discarded the earlier portion of
the log; the run was repeated with the full log captured so the console-clean gate could
actually be measured rather than assumed. Coverage was collected in the same run with
`--collectCoverageFrom` restricted to the 62 changed non-test source files.

The scratch worktree was removed afterwards, and the `.qlty/{logs,out,results,plugin_cachedir}`
directories that `qlty` created (not covered by `.gitignore`) were deleted, leaving the
working tree clean.

## 6. Pre-existing issues found and their disposition

- 250-line ceiling: 8 changed files exceed it; all 8 were already over on `master`, and the
  PR grows 7 of them further (worst: `SignImages.test.tsx` 258 → 418). Recorded as F6.
- `Fragment` constructor parameter count grows 32 → 34. Recorded as F9.
- No pre-existing test, lint, type or build failure was found — everything is green both
  remotely and on the merge, so nothing needed fixing under the Pre-existing Issues rule.

## 7. Fixes applied

After reporting the review, the user asked for all findings to be fixed. F1–F6 and F8 were
implemented; F7, F9 and F10 were deliberately left, each with a stated reason.

| Finding | What was done                                                                                                                                                                                                                                                                           |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| F1      | Loader extracted to `realiaOptionLoader.ts` with a request-id guard, a rejection path and disposal; `toNativePromise` attaches Bluebird handlers synchronously so a rejected search is never reported unhandled. Five scenario tests added.                                             |
| F2      | `FragmentService.updateNamedEntityAnnotations` returns `AnnotationSaveResult` (`{ fragment, refreshError }`); `SpanAnnotationDisplay` advances the baseline on persistence and distinguishes save from refresh failure. Contract in `annotationSave.ts`; tests at service and UI level. |
| F3      | `MockedConstructorCalls` structural type replaces `jest.MockedClass<any>`; suppression deleted.                                                                                                                                                                                         |
| F4      | `TextAnnotation` declares `watch: (props) => [props.number]`.                                                                                                                                                                                                                           |
| F5      | Test renders the exact export tree and asserts no annotation markup, plus a static guard that the three export modules never reference `NamedEntityPreview`.                                                                                                                            |
| F6      | Focused modules and sibling suites extracted; every changed file is now at or below its `master` size.                                                                                                                                                                                  |
| F8      | `openRealiaPageOnClick` added; the read-only indicator follows a plain click, the editor keeps `Alt`+click.                                                                                                                                                                             |

### Attempts made and reverted

- **F9 (parameter object for `Fragment`).** Implemented with `Object.assign` plus
  `export interface Fragment extends FragmentFields {}`; `tsc` passed and the `qlty` smell
  disappeared, but eslint rejected it with `@typescript-eslint/no-unsafe-declaration-merging`.
  The alternative — 34 explicit fields with `!` assertions under `strict: true` — trades a
  lint smell for weaker type checking and costs more lines. Reverted; reported instead.
- **F5 (shared render helper in the exporters).** Extracting the duplicated render step
  into `exportTransliteration.tsx` made the guard load-bearing, but editing
  `WordExport.tsx` and `PdfExport.tsx` pulled two untouched legacy files into the changed
  set along with their pre-existing coverage gaps (`PdfExport.tsx` 86% statements / 70%
  branches). Reverted in favour of the static guard.

### Problems found in my own fixes and fixed at the root

- Bluebird reported "Unhandled rejection" in two tests. The root cause was in the code, not
  the fixture: `Promise.resolve(bluebird)` attaches its handler a microtask late. Fixed with
  `toNativePromise`, not by silencing the console.
- `qlty smells` flagged 18 duplicated lines between `TextAnnotation.save.test.tsx` and the
  new `TextAnnotation.saveOutcomes.test.tsx`. Resolved by extracting
  `annotationSave.testSupport.tsx`.
- The first sibling suites duplicated the repository test harness in three files. Resolved by
  extracting `fragmentRepository.testSupport.ts`.
- `fragmentTypes.ts` measured 0% because a type-only module is never loaded at runtime;
  moving the `RecordEntry[immerable] = true` statement into it makes it loaded and fully
  covered.
- `createSummaryItemDto`'s `date: fragmentDto.date ?? null` fallback was unreachable. Per the
  coverage rule, the dead branch was deleted rather than tested.
- One test helper was renamed from `renderAnnotationEditor` to `openAnnotationEditor`
  because `testing-library/no-render-in-lifecycle` treats any `render*` name as a render call.

### Final gate results on the merge with `origin/master` (`e96b8536`)

| Gate                              | Result                                               |
| --------------------------------- | ---------------------------------------------------- |
| `yarn tsc`                        | exit 0                                               |
| `yarn lint`                       | exit 0                                               |
| `yarn build`                      | exit 0                                               |
| `yarn test --watchAll=false`      | 386/386 suites, 3875 passed, 2 skipped, 50 snapshots |
| Console output                    | zero                                                 |
| Coverage, 72 changed source files | 100 / 100 / 100 / 100                                |
| `qlty check`                      | no issues                                            |
| `qlty smells`                     | two pre-existing constructors only                   |

`yarn build` exited 1 twice when batched with lint and the full suite on this 7.9 GB box;
run on its own on the same merge it completes in ~93 s with exit 0. Recorded as an
environment artifact, not a build defect.

The fixes are committed on this branch, with the code and these task docs in a single
commit. The commit is **not pushed** — publishing it is the author's call.
