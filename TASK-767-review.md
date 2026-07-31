# TASK-767 — Review: PR #767 "Add realia annotation layer to named entity annotation"

- **PR**: <https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/767>
- **Head SHA reviewed**: `7d5015e2124cf6486deac70724386f692e3de655`
- **Base**: `master` (now at `e96b8536`; the base recorded at PR creation was `24d6dd36`)
- **GitHub state at review time**: open, `mergeable: true`, `mergeable_state: blocked`
- **Status**: findings F1–F6 and F8 are **fixed on this branch** and re-verified
  against the merge with current `master`. F7 and F9 are recorded as deliberately not
  applied, with reasons. F10 is external and remains open.

## Summary

Realia annotations are added as a second annotation layer running in parallel to the
existing named-entity layer. The two layers are held structurally apart — `namedEntities`
and `realia` stay separate lists from the API boundary through `AnnotationSpans`, the
reducer state, component props and each lookup, and are rendered one after the other
rather than merged. `layer` is a required discriminant on the derived types, so
`isRealiaAnnotationSpan` narrows both branches without a cast. Display data (`tier`,
`name`, `layer`) is derived client-side and stripped by a single helper,
`omitDerivedSpanFields`, at the one place that builds the outbound payload; a repository
test pins that payload shape. `realiaInfo` is embedded in the fragment response rather
than fetched per id, and is never echoed back.

The four Data Architecture checks and the four API Call Efficiency checks all pass. Every
gate is green on the merge with current `master`, and all 72 changed source files are at
100% on statements, branches, functions and lines.

Two genuine defects were found (F1, F2) alongside the reviewer's live `CHANGES_REQUESTED`
points; all in-repository findings are now resolved. **The remaining blocker to merge is
F10, which is outside this repository.**

## CI Status

### Remote checks on head `7d5015e2124cf6486deac70724386f692e3de655`

No check is failing; no CI-derived finding was raised.

| Check                                | Status    | Conclusion                                                         |
| ------------------------------------ | --------- | ------------------------------------------------------------------ |
| `test`                               | completed | **success**                                                        |
| `CodeQL`                             | completed | **success** — "No new alerts in code changed by this pull request" |
| `Analyze (javascript)`               | completed | **success**                                                        |
| `GitGuardian scan` (run 30353183456) | completed | **success**                                                        |
| `GitGuardian scan` (run 30353182952) | completed | **success**                                                        |
| `GitGuardian Security Checks`        | completed | **success** — "No secrets detected", 29 commits scanned            |
| `docker`                             | completed | skipped (runs only on push to `master`)                            |
| `docker-test`                        | completed | skipped (runs only on push to `master`)                            |

| Commit status        | State       | Description            |
| -------------------- | ----------- | ---------------------- |
| `qlty check`         | **success** | No blocking issues     |
| `qlty coverage diff` | **success** | 100.0% (75% threshold) |
| `qlty coverage`      | **success** | 94.0% (+0.8% change)   |

Combined commit status: **success**.

### Local gates on the merge with `master`

`master` moved since the PR base was recorded, so the gates were run on `origin/master`
(`e96b8536`) merged with `add-realia-annotation` in a scratch worktree, with the fixes
applied, from a `--frozen-lockfile` install. The merge is clean.

| Gate                                    | Result                                                            |
| --------------------------------------- | ----------------------------------------------------------------- |
| `yarn install --frozen-lockfile`        | exit 0                                                            |
| `yarn tsc`                              | exit 0                                                            |
| `yarn lint` (eslint + stylelint)        | exit 0                                                            |
| `yarn build`                            | exit 0                                                            |
| `yarn test --watchAll=false`            | **386/386 suites, 3875 passed, 2 skipped, 50 snapshots**          |
| Console output during the suite         | **zero**                                                          |
| Coverage of all 72 changed source files | **100% statements / 100% branches / 100% functions / 100% lines** |

`yarn build` failed twice when run in the same batch as lint and the full suite; run on
its own on the same merge it completes in ~93 s with exit 0. The box has 7.9 GB of RAM and
the batched run exhausted it — an environment artifact, not a build defect.

### qlty

- Local `qlty check` over every changed file: **no issues**.
- Local `qlty smells`: two findings remain, both pre-existing and unchanged by this PR —
  `Fragment`'s 34-parameter constructor (F9, see below) and `TestData`'s 6-parameter
  constructor. The similar-code finding this review's own fix briefly introduced between
  `TextAnnotation.save.test.tsx` and `TextAnnotation.saveOutcomes.test.tsx` was resolved by
  extracting `annotationSave.testSupport.tsx`.

## Comment status tracking

| Thread                    | Author        | Path                                 | Resolved | Outdated |
| ------------------------- | ------------- | ------------------------------------ | -------- | -------- |
| T1 similar-code (mass 84) | `qltysh[bot]` | `TextAnnotationContext.test.tsx:105` | resolved | outdated |
| T2 similar-code (mass 84) | `qltysh[bot]` | `TextAnnotationContext.test.tsx:121` | resolved | outdated |
| T3 similar-code (mass 92) | `qltysh[bot]` | `TextAnnotationContext.test.tsx:157` | resolved | outdated |
| T4 similar-code (mass 92) | `qltysh[bot]` | `TextAnnotationContext.test.tsx:175` | resolved | outdated |
| T5 boolean-logic          | `qltysh[bot]` | `cssCascade.testSupport.ts:110`      | resolved | outdated |

All 5 inline threads are resolved and outdated. General / issue comments: **0**.

### Timeline review events

| Review     | Author        | State             | Commit     | Status                                           |
| ---------- | ------------- | ----------------- | ---------- | ------------------------------------------------ |
| 4686217547 | `qltysh[bot]` | COMMENTED         | `f37f6df0` | superseded                                       |
| 4703525359 | `qltysh[bot]` | COMMENTED         | `123f5f3a` | superseded                                       |
| 4753665596 | `Fabdulla1`   | APPROVED          | `b4b16fe5` | superseded                                       |
| 4753712550 | `Fabdulla1`   | CHANGES_REQUESTED | `b4b16fe5` | both points already resolved on `7d5015e2`       |
| 4815952885 | `Fabdulla1`   | CHANGES_REQUESTED | `7d5015e2` | **live — all 5 points now fixed on this branch** |

Already resolved on the reviewed head, re-verified:

- The display control reads `title={'Toggle annotations'}` / `aria-label={'toggle-annotations'}`.
- `TextAnnotation.save.test.tsx` asserts both lists are submitted together and that `tier`,
  `name` and `layer` are stripped from every submitted span.

## Findings

### F1 — `RealiaSelect` search had no rejection path, no ordering guard, no cancellation — **Blocker · FIXED**

`RealiaSelect.tsx:50-53` chained `.then(callback)` with no `.catch`, so a rejected
`realiaService.search` became an unhandled rejection and the picker stayed on "Loading…".
`debounce` cancels pending _invocations_, not in-flight _requests_, so a slow query A could
overwrite a newer query B's results, and `loadOptions.cancel` on unmount cancelled only the
debounce.

**Fix.** The loader moved to `fragmentarium/ui/text-annotation/realiaOptionLoader.ts`,
which now stamps each search with a request id and applies a response only when it is still
the latest and the loader has not been disposed; rejections resolve to `[]` through the
same path; clearing the query and unmounting both invalidate in-flight requests.

`loadRealiaOptions` also now converts the Bluebird promise with a helper that attaches its
handlers **synchronously**:

```ts
function toNativePromise<T>(promise: PromiseLike<T>): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    promise.then(resolve, reject)
  })
}
```

`Promise.resolve(bluebird)` attaches its handler a microtask later, which is long enough
for Bluebird to report the rejection as unhandled — a real console-noise source in the
browser, not just in tests.

**Tests.** `realiaOptionLoader.test.ts` and `RealiaSelect.test.tsx` cover all five
scenarios the reviewer listed: a rejected search produces no unhandled rejection, the
loading state clears, a stale result cannot replace a newer one, unmounting mid-request
updates no state, and an existing selection survives a failure.

### F2 — A failed post-save refresh was reported as a failed save — **Blocker · FIXED**

`FragmentService.updateNamedEntityAnnotations` chains POST → `injectReferences` (a further
bibliography round-trip) → `cacheUpdatedFragment`, and `SpanAnnotationDisplay` only updated
its saved baseline when the whole chain resolved. A refresh failure after a successful POST
left the editor dirty and reporting failure, inviting a duplicate re-POST.

**Fix.** The two outcomes are now separated at the service boundary:

```ts
.then((persisted: Fragment) =>
  this.injectReferences(persisted)
    .then((fragment) => ({ fragment: this.cacheUpdatedFragment(fragment), refreshError: null }))
    .catch((error: Error) => ({ fragment: persisted, refreshError: error })),
)
```

Persistence failure rejects; refresh failure resolves with the persisted fragment and a
`refreshError`. `SpanAnnotationDisplay` advances the saved baseline as soon as persistence
succeeds, shows an `ErrorAlert` only for a real save failure, and shows a distinct warning
for a refresh failure. The shared contract lives in
`fragmentarium/ui/text-annotation/annotationSave.ts`.

**Tests.** `FragmentService.namedEntities.test.ts` covers save-ok/refresh-ok,
save-ok/refresh-fail and save-fail at the service level;
`TextAnnotation.saveOutcomes.test.tsx` covers the same three at the UI level plus "retrying
after a refresh-only failure does not duplicate the save" and "an edit made while the save
is in flight stays dirty rather than being marked saved".

### F3 — `any` and an eslint-disable in `injectedApp.testSupport.tsx` — **Major · FIXED**

`jest.MockedClass<any>` and its `@typescript-eslint/no-explicit-any` suppression are
replaced by a structural type describing exactly what the function reads:

```ts
interface MockedConstructorCalls {
  mock: { calls: readonly (readonly unknown[])[] }
}
```

### F4 — Annotation state was seeded once at mount and never resynchronised — **Major · FIXED**

`useAnnotationContext` uses `useReducer`'s lazy initialiser and `TextAnnotation.tsx` seeds
`initialAnnotations` with `useState`'s, so both ignored later prop values — and the
`withData(...)` call passed no `watch`, so `fullConfig.watch` defaulted to `() => []` and a
`number` change neither refetched nor reseeded.

**Fix.** `TextAnnotation` now declares `{ watch: (props) => [props.number] }`. On a fragment
change `withData` clears its data, unmounts the subtree and remounts it with the new
fragment, so the reducer is reseeded.

**Tests.** `TextAnnotation.fragmentChange.test.tsx` asserts both the refetch and the
reseed. Both tests were confirmed to **fail** with the `watch` config removed, so they are
load-bearing rather than vacuous.

### F5 — Nothing asserted that Word / PDF export excludes annotation UI — **Major · FIXED**

**Fix.** `export.annotations.test.ts` renders the exact tree the exporters build
(`TransliterationLines` under `RouterLinkModeContext` and `DictionaryContext`, with no
annotation provider) for the annotated fixture and asserts the output contains no
`span-indicator`, `data-span-id`, `role="link"`, `tabindex`, `named-entity__*` class or
`named-entity-preview` wrapper — while still containing the words themselves, so the test
cannot pass by rendering nothing. A second block asserts that `WordExport.tsx`,
`PdfExport.tsx` and `corpus/ui/WordExport.tsx` do not reference `NamedEntityPreview` at
all, which is what makes the guard catch a future provider move. That guard was confirmed
to fail when the provider is wired into `WordExport.tsx`.

An earlier attempt extracted the exporters' shared render step into a helper module. It was
reverted: editing `WordExport.tsx` and `PdfExport.tsx` pulled two large legacy files the PR
had never touched into the changed set, and with them their pre-existing coverage gaps
(`PdfExport.tsx` 86% statements / 70% branches). Guarding an invariant is not worth
importing unrelated coverage debt into this PR.

### F6 — The PR pushed already-oversized files further past the 250-line ceiling — **Major · FIXED**

Every changed file is now **at or below its `master` size**, and several are well below:

| File                                                          | `master` | before fix |      now |
| ------------------------------------------------------------- | -------: | ---------: | -------: |
| `src/fragmentarium/infrastructure/FragmentRepository.ts`      |      732 |        739 |  **556** |
| `src/fragmentarium/application/FragmentService.ts`            |      824 |        830 |  **732** |
| `src/signs/ui/display/SignImages.tsx`                         |      441 |        450 |  **371** |
| `src/fragmentarium/infrastructure/FragmentRepository.test.ts` |     1014 |       1178 |  **950** |
| `src/fragmentarium/application/FragmentService.test.ts`       |     1922 |       1990 | **1922** |
| `src/signs/ui/display/SignImages.test.tsx`                    |      258 |        418 |  **198** |
| `src/fragmentarium/ui/fragment/CuneiformFragment.test.tsx`    |      274 |        297 |  **165** |
| `src/fragmentarium/domain/fragment.ts`                        |      257 |        267 |  **216** |

New focused modules: `fragmentQueryMapping.ts`, `fragmentServicePorts.ts`,
`fragmentTypes.ts`, `signImageGrouping.ts`, `realiaOptionLoader.ts`, `annotationSave.ts`,
and the sibling suites / support modules `FragmentRepository.{factories,summary,namedEntities}.test.ts`,
`FragmentService.namedEntities.test.ts`, `SignImages.edgeCases.test.tsx`,
`fragmentRepository.testSupport.ts`, `signImages.testSupport.tsx`,
`cuneiformFragment.testSupport.tsx`, `annotationSave.testSupport.tsx`.

**Not fully met, and stated plainly:** five files remain over 250 lines in absolute terms
(`FragmentService.test.ts` 1922, `FragmentRepository.test.ts` 950, `FragmentService.ts`
732, `FragmentRepository.ts` 556, `SignImages.tsx` 371). All five were far over on `master`
already and all are now smaller than on `master`. Decomposing a 1922-line suite or an
824-line service into eight modules each is a separate refactor with its own regression
risk, and does not belong in a realia-annotation PR.

### F7 — Repository-policy changes bundled into a feature PR — **Minor · NOT APPLIED (deliberate)**

`.github/copilot-instructions.md` (+197 lines of policy) and the two `.husky` hooks are
governance changes unrelated to realia annotation. They are **not** split out, for two
reasons: the PR description already discloses them explicitly, which is the alternative
resolution this finding offered; and removing them would strip out the `master`-push
protection and the very standards this review applies. Splitting them is the author's call,
not a defect to be silently corrected.

### F8 — `role="link"` was announced but a plain click did nothing — **Minor · FIXED**

The read-only indicator set `role="link"`, `tabIndex={0}` and an "Open the Realia page…"
accessible name, and `Enter` / `Space` opened the page — but a mouse click only worked with
`Alt` held, so assistive technology announced a link an ordinary click would not follow.

**Fix.** `useSpanIndicator` now exposes `openRealiaPageOnClick` (left button, no modifier
required) alongside the Alt-gated `openRealiaPage`, and takes the hint text as a parameter.
`SpanIndicatorView` (read-only) uses plain-click activation and the new
`realiaPageLinkHint`; `SpanIndicator` (editor) keeps `Alt`+click and `realiaPageHint`,
because there a plain click selects the span for editing.

### F9 — `Fragment`'s constructor takes 34 positional parameters — **Minor · NOT APPLIED (deliberate)**

`qlty smells` reports "Function with many parameters (count = 34)"; the PR adds `realia`
and `realiaInfo` as parameters 33 and 34. The remote `qlty check` reports it as
non-blocking.

The parameter-object rewrite was implemented and then **reverted**, because every available
form makes the code worse:

- `Object.assign(this, fields)` plus `export interface Fragment extends FragmentFields {}`
  works and is sound, but eslint rejects it with
  `@typescript-eslint/no-unsafe-declaration-merging`. Suppressing that would be exactly the
  eslint-disable this review objects to in F3.
- Declaring the 34 fields explicitly requires 34 definite-assignment assertions (`!`) under
  `strict: true`, trading a lint smell for weaker type checking, and costs more lines than
  the constructor it replaces.
- `Fragment.create` must keep picking the 34 fields explicitly regardless: it is called as
  `Fragment.create({ ...dto, … })`, so a spread would attach every DTO key to the instance.

Reducing this properly means grouping related fields across the domain — a real refactor,
worth doing on its own, not as a side effect of adding two fields.

### F10 — Merging before `ebl-api` #740 breaks the existing named-entity feature — **Blocker (external) · OPEN**

The PR description says the deployed API "does not accept realia spans yet". Reading
`ebl-api` `master` directly shows the mismatch is wider than a rejected realia span:

- `ebl/fragmentarium/web/named_entities.py` — `on_post` does `data = req.media["annotations"]`.
  The frontend posts `{ namedEntities, realia }` with **no `annotations` key**, so the
  request raises `KeyError` → **500**, not a 422.
- `on_get` returns a **flat list**, while `createAnnotationSpans` reads
  `dto.namedEntities ?? []` and `dto.realia ?? []` — so against the current API **every
  existing named-entity annotation reads as empty** in the editor.

That second point is the serious one: it is a regression to a shipped feature, not an
incomplete new one. The counterpart change — `ebl-api` PR #740, head
`add-realia-annotation-api` — adds the `namedEntities` / `realia` payload keys and
`RealiaAnnotationSpanSchema`, and is **open and unmerged**.

This is an action outside this repository, so it is recorded rather than fixed.

## Severity

| Id  | Finding                                                     | Severity               | Status                                                    |
| --- | ----------------------------------------------------------- | ---------------------- | --------------------------------------------------------- |
| F10 | `ebl-api` #740 not merged — existing annotations read empty | **Blocker (external)** | **Open**                                                  |
| F1  | `RealiaSelect` rejection / race / cancellation              | Blocker                | Fixed                                                     |
| F2  | Refresh failure reported as save failure                    | Blocker                | Fixed                                                     |
| F3  | `any` + eslint-disable in `injectedApp.testSupport.tsx`     | Major                  | Fixed                                                     |
| F4  | Mount-only annotation state initialisation                  | Major                  | Fixed                                                     |
| F5  | No export negative assertions                               | Major                  | Fixed                                                     |
| F6  | 250-line ceiling breached by grown files                    | Major                  | Fixed (no file grows; five remain over in absolute terms) |
| F7  | Repository-policy changes bundled in a feature PR           | Minor                  | Not applied — disclosed in the PR description             |
| F8  | `role="link"` without plain-click activation                | Minor                  | Fixed                                                     |
| F9  | `Fragment` constructor at 34 parameters                     | Minor                  | Not applied — see reasons above                           |

## Reproduction Steps

**F1** — mock `realiaServiceMock.search` to reject, type `Apk`, advance the 300 ms debounce:
before the fix the rejection was unhandled and the menu never left its loading state. Race
variant: resolve query A after 500 ms and query B after 10 ms, type A then B — B's options
rendered, then A's replaced them. Both are now covered by tests.

**F2** — stub the POST to resolve and `injectReferences` to reject, delete a tag and press
Save: before the fix an error appeared and the Save button stayed enabled although the
annotation was persisted, so pressing Save again re-POSTed it.

**F4** — render `TextAnnotation` and change `number` without unmounting: before the fix
neither a refetch nor a reseed happened. Verified by removing the `watch` config and
watching both tests fail.

**F5** — wire `NamedEntityPreviewProvider` into `WordExport.tsx` and run
`yarn test --watchAll=false src/fragmentarium/ui/fragment/export.annotations.test.ts`: the
guard fails, as confirmed during this review.

**F6** —

```sh
git diff --name-only origin/master...HEAD | grep -E '\.tsx?$' |
  while read f; do [ -f "$f" ] && n=$(wc -l < "$f") && [ "$n" -gt 250 ] && echo "$n $f"; done | sort -rn
```

**F10** — point the frontend at an `ebl-api` deployment built from `master`, open the
named-entity annotation tab of a fragment that already has annotations (the editor shows
none), add a tag and press Save (the request 500s on `KeyError: 'annotations'`).

## Recommendation

**Do not merge yet — but the blocker is now external, not in this repository.**

Every in-repository finding is resolved and re-verified on the merge with current `master`:
`tsc`, `lint` and `build` exit 0, 386/386 suites and 3875 tests pass with **zero console
output**, and all 72 changed source files are at 100% on statements, branches, functions
and lines. `qlty check` is clean and the only remaining `qlty smells` findings are two
pre-existing constructors, one of which (F9) is deliberately left alone with reasons stated.

F10 remains: until `ebl-api` #740 is merged and deployed, this PR makes existing
named-entity annotations read as empty and makes saving fail with a 500. Once that is
deployed and the re-run checks on the new head are green, this PR is ready to approve.

## What Has To Be Done

1. **[Blocker · F10 · outside this repository]** Get `ebl-api` PR #740 merged **and
   deployed** before #767 is merged. Confirm on the deployed API that
   `GET /fragments/{number}/named-entities` returns `{ namedEntities, realia }` and that
   `POST` accepts the same shape.
2. **[Author decision · F7]** Decide whether `.github/copilot-instructions.md` and the two
   `.husky` hooks stay in this PR (they are disclosed in the description) or move to a
   separate repository-policy PR.
3. **[Author decision · F9]** Decide whether `Fragment`'s 34-parameter constructor is worth
   a dedicated refactor. It is not fixable cleanly as part of this PR — see the finding.
4. **[Author decision · F6]** Decide whether the five files still over 250 lines in absolute
   terms (all pre-existing, all now smaller than on `master`) warrant a follow-up split.
5. **Push the branch**, then re-fetch the check runs and commit statuses for the new head
   and confirm every one is green.
6. **Re-review**: request a fresh review from `Fabdulla1` to clear the outstanding
   `CHANGES_REQUESTED` (review `4815952885`), all five points of which are now addressed.
   Reviewer assignment is the author's to make — this review does not add reviewers.
7. **Before merge**: delete `TASK-767-todo.md`, `TASK-767-log.md` and `TASK-767-review.md`.
