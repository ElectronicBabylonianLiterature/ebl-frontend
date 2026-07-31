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

---

## Second review round — head `f93df64333e79f5abe92079eeb9c260acdbd9101`

The fixes from the first round were committed as `f93df643` and pushed;
`git ls-remote origin refs/heads/add-realia-annotation` confirms the remote head matches
local `HEAD`. `master` has since moved from `e96b8536` to `d9312619` (6 commits), so every
gate was re-run against the new merge.

### Gathering (re-fetched, not reused)

- Check runs (8) and commit statuses (3) for `f93df643`: all `success` or `skipped`.
  Combined status `success`. Nothing failing, so no CI-derived finding.
- Review threads (GraphQL `reviewThreads`): 5, all `qltysh[bot]`, all resolved + outdated.
- Timeline review events: 5. Latest is `4815952885` `CHANGES_REQUESTED` on `7d5015e2`;
  the fixes landed in `f93df643`, so the state is stale rather than unaddressed.
- Issue / general comments: 0.
- qlty: remote `qlty check` "No blocking issues"; local `qlty check` over all 137 changed
  `.ts`/`.tsx`/`.sass` files reports "✔ No issues"; local `qlty smells` reports only the two
  pre-existing constructors (`Fragment` 34 params, `TestData` 6 params). The qlty web UI
  needs a login, so the issue list was reproduced with the local CLI.

### Re-verification of all seven reviewer points

All seven are **fixed** on this head and were each traced to the code that fixes them —
see the point-by-point table in `TASK-767-review.md`. The `RealiaSelect` fix in particular
was checked in full: `realiaOptionLoader.ts` guards response ordering by request id, marks
itself disposed on unmount, routes rejections through the same `respond` path, and converts
the Bluebird promise with handlers attached synchronously so no unhandled rejection is
reported.

### Gates on the merge with `origin/master` (`d9312619`, merge head `200a9c59`)

`yarn.lock` and `package.json` were confirmed byte-identical between the worktree and the
main tree before linking `node_modules`, so the lockfile-consistent install carried over.

| Gate                              | Result                                               |
| --------------------------------- | ---------------------------------------------------- |
| `yarn install --frozen-lockfile`  | exit 0                                               |
| merge with `origin/master`        | clean                                                |
| `yarn tsc`                        | exit 0 (31 s)                                        |
| `yarn lint`                       | exit 0 (50 s)                                        |
| `yarn build`                      | exit 0 (170 s)                                       |
| `yarn test --watchAll=false`      | 386/386 suites, 3875 passed, 2 skipped, 50 snapshots |
| Console output                    | zero                                                 |
| Coverage, 72 changed source files | 100 / 100 / 100 / 100                                |

`yarn build` completed on the first attempt this time, run on its own rather than batched.
Coverage was read out of `coverage-final.json` per file (`s`, every arm of `b`, and `f`),
not from the summary table, so branch-only gaps could not hide behind a 100% line figure.
All 72 files were present in the report and none was below 100%.

The 2 skipped tests are `xit` at `src/fragmentarium/ui/edition/Edition.test.tsx:49,53`,
both present on `master`, in a file this PR does not touch.

### Application run

`yarn start` compiled the merged tree cleanly and served HTTP 200 at `localhost:3199` with
`No issues found.` from the typecheck. The annotation flow itself could not be exercised:
`REACT_APP_DICTIONARY_API_URL` is `http://localhost:8001` with no `ebl-api` running, and the
tab is behind Auth0 plus `isAllowedToAnnotateFragments`.

### New findings this round

- **N1 (Major, open).** `TextAnnotation.tsx:76-80` fetches `find` **and**
  `fetchNamedEntityAnnotations`, but this PR's own `createFragmentAnnotationSpans` derives
  the identical `AnnotationSpans` from the fragment for the display path. One avoidable
  request plus two mappings of the same value. The PR did improve it — on `master` the two
  calls were a sequential waterfall, now they are parallel. Not fixable before `ebl-api`
  #740 ships, because the fragment route only gains `realia` / `realiaInfo` there.
  A semantic difference has to be settled first: the API returns entities with empty spans,
  `fragmentSpans.ts` filters those out.
- **N2 (Minor, fixed here).** `SignImages.tsx` gained a three-line explanatory comment,
  against the no-comments rule. Removed. The code it documented was verified correct —
  `clusterIds` is derived from `croppedAnnotations`, so the removed `: croppedAnnotations`
  fallback really was unreachable. Re-verified after the edit: eslint clean, `yarn tsc`
  exit 0, the three `SignImages` suites pass (20 tests), the file is still 100 / 100 / 100 /
  100, no console output.

### External blocker re-checked

`ebl-api` PR #740 is **still open and unmerged**. `ebl/fragmentarium/web/named_entities.py`
on `ebl-api` `master` still reads `req.media["annotations"]` in `on_post` (→ `KeyError`, 500)
and returns a flat list from `on_get` (→ every existing annotation reads as empty against
`dto.namedEntities ?? []`). F10 stands.

### State left behind

The comment removal in `src/signs/ui/display/SignImages.tsx` is **uncommitted** in the
working tree, along with the updated task docs. The scratch worktree was removed and
`git worktree list` shows no leftover; the `.qlty` run artefacts were deleted.

---

## Round 3 — remediation of every open finding (working tree, uncommitted)

The user chose: split all five oversized files to ≤250 lines; remove
`fetchNamedEntityAnnotations` and its tests; and strip the repository-policy files out of
this PR, because master-push protection is now enforced on GitHub itself.

### F7 — policy files restored from `master`

`.github/copilot-instructions.md`, `.husky/pre-commit` and `.husky/pre-push` were restored
with `git checkout origin/master -- <path>` and each verified byte-identical to
`origin/master` (`git diff --quiet origin/master -- <path>` exits 0 for all three);
`git diff origin/master --stat -- .github .husky` is empty.

Worth noting for the follow-up policy PR: `master`'s version of the instructions keeps the
250-line, DRY, 100%-coverage, console-clean and test-removal rules, but **loses** the
branch's Data Architecture, API Call Efficiency, "CI — The Remote Result Is the Gate" and
Git Branching sections. Those went with the revert.

### N1 — one request instead of two

`TextAnnotation` now loads only `fragmentService.find(number)` and seeds the reducer from
`createFragmentAnnotationSpans(fragment)`, the same derivation the display path already
used. `fetchNamedEntityAnnotations` is gone from `FragmentService`, `ApiFragmentRepository`
and the `FragmentRepository` port, along with the now-meaningless `createAnnotationSpans`
DTO helper.

One behavioural detail had to be settled first. `GET /fragments/{number}/named-entities`
returns entities whose `span` is `[]` (registered on the fragment, attached to no word),
while `createFragmentAnnotationSpans` filtered those out. Filtering them in the editor would
have **deleted** such annotations on the next save. The filter was therefore removed, so the
derived value matches the API exactly. Nothing renders differently: `SpanIndicators` filters
by `span.includes(wordId)`, so an empty span produces no indicator either way.

Test support was reworked to seed annotations through the fragment: `withAnnotationSpans`
(`src/test-support/annotated-fragment.ts`) writes an `AnnotationSpans` back onto a fragment's
`namedEntities`, `realia` and word tokens. `fragmentSpans.test.ts` now asserts the empty-span
behaviour, and both cross-kind negative tests were kept and strengthened — a foreign id still
resolves to nothing. A new test pins that opening the editor issues exactly one `find`.

### F9 — `Fragment` constructor

The 34 positional parameters are replaced by a single `FragmentProps` argument with 34
explicit `readonly` field declarations assigned in the constructor body — no
definite-assignment assertions, no declaration merging, no eslint suppression. `Fragment.create`
delegates to it. The two direct `new Fragment(...)` call sites were converted to object form.
`qlty smells` no longer reports `Fragment`.

### F6 — every changed file is now at or under 250 lines

| File                         | before | now | new siblings                                                                                                                  |
| ---------------------------- | -----: | --: | ----------------------------------------------------------------------------------------------------------------------------- |
| `FragmentService.ts`         |    729 | 246 | `fragmentServiceBase`, `fragmentCache`, `scopedCache`, `fragmentCacheKeys`, `fragmentProvenance`, `fragmentReferences`        |
| `FragmentRepository.ts`      |    541 | 234 | `fragmentFactories`, `fragmentRepositoryUpdates`, `fragmentRepositoryAttestations`                                            |
| `SignImages.tsx`             |    368 | 209 | `signClusterAnnotations`, `SignImageFigures`                                                                                  |
| `FragmentService.test.ts`    |   1921 | 214 | 13 sibling suites + `fragmentService.testSupport`, `fragmentServiceCache.testSupport`, `fragmentServiceFragments.testSupport` |
| `FragmentRepository.test.ts` |    950 | 190 | 6 sibling suites, shared constants moved into `fragmentRepository.testSupport`                                                |
| `test-fragment.ts`           |    560 | 126 | `test-fragment-dto`, `test-fragment-lines`, `test-fragment-more-lines`                                                        |

`test-fragment.ts` and `fragment-fixtures.ts` were not in the changed set before this round;
the F9 refactor pulled them in, which is why `test-fragment.ts` needed splitting too.

The two service classes and the repository were decomposed by extracting cohesive
collaborators rather than by moving lines around: a `ScopedCache` that owns cache scope,
generation and the shared get-or-fetch; a `FragmentCache` built on it; free functions for
provenance fetching, reference injection and cache-key construction; and base classes holding
the mutation surface (`FragmentServiceBase`, `ApiFragmentUpdates`, `ApiFragmentAttestations`).
Behaviour is unchanged — the cache-key format, the generation bump on invalidation and the
scope-change clearing were all preserved verbatim and are covered by the split cache suites.

`FragmentService.trimCache` had no production caller and existed only for one test; it now
lives on `FragmentCache` and that test constructs a `FragmentCache` directly instead of
reaching through the service with a cast.

### Follow-on quality

Splitting `test-fragment.ts` surfaced a pre-existing near-duplicate `externalNumbers` fixture
shared with `src/fragmentarium/domain/Fragment.test.ts` (30 lines, mass 113). `Fragment.test.ts`
now spreads the shared fixture and overrides the five values it deliberately differs on.

### Gate results

| Gate                                    | Result                                                          |
| --------------------------------------- | --------------------------------------------------------------- |
| `yarn tsc` on the merge with `d9312619` | exit 0                                                          |
| `yarn lint` on the merge                | exit 0                                                          |
| `yarn test --watchAll=false` (local)    | **405/405 suites, 3863 passed, 2 skipped, zero console output** |
| `qlty check` over 178 changed files     | ✔ No issues                                                     |
| `qlty smells` over the same set         | only the pre-existing `TestData` 6-parameter constructor        |

The merge worktree was built from `origin/master` (`d9312619`), merged with the branch, then
had the uncommitted working-tree changes applied on top (`git diff HEAD --binary` plus the 42
untracked files), so the gates ran against exactly what CI would build once this is pushed.

`TestData`'s 6-parameter constructor in `src/test-support/utils.ts` is left alone: it is
pre-existing, untouched by this PR's diff, non-blocking on remote `qlty check`, and converting
it to a parameter object would rewrite every `new TestData(...)` call site across a dozen
unrelated test files — dragging them into the changed set and under the 250-line gate.

### State left behind

Everything in round 3 is **uncommitted** in the working tree. It must be committed and pushed
before CI can confirm it. `F10` is unchanged: `ebl-api` #740 is still open, so this PR must
not merge yet.

### Coverage gaps found and closed

The first coverage pass on the merge showed four files below 100%, all from code the round-3
refactor introduced. Each was closed by deleting dead code rather than by writing a test for
it, per the "prefer deleting a dead branch to testing it" rule:

- `scopedCache.ts` and `fragmentCache.ts` — the `= () => defaultCacheScope` default arguments
  were unreachable, because `FragmentServiceBase` already defaults the resolver and always
  passes one down. Both parameters are now required.
- `fragmentServiceCache.testSupport.ts` — `bibliographyService.find.mockImplementation(...)`
  was never invoked by any cache suite. Removed.
- `fragmentServiceFragments.testSupport.ts` — `bibliographyService.find.mockImplementation(...)`
  was never invoked either. Removed; the `findMany` stub next to it **is** load-bearing (the
  update suites fail without it) and was kept.

The re-measured run has all 92 changed source files at 100% on statements, branches, functions
and lines.
