---
task_id: 774-merge
document: handoff — merge master into chore/remove-bluebird
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
branch: chore/remove-bluebird @ 29a81056
base_branch: chore/ts7-tsconfig-migration @ 4f71cb24
master: 1dcc762e
date: 2026-09-09
status: NOT STARTED — analysis only, nothing merged
tracked_in_git: false (TASK-*.md is gitignored)
---

# Handoff — merging master into `chore/remove-bluebird`

Nothing has been merged. This is the reconnaissance, done read-only with `git merge-tree`, so the working tree is untouched and the branch is exactly as committed at `29a81056`.

## The short version

This is not a routine catch-up merge. Two things make it substantial:

1. **Master reintroduces bluebird into 58 files, 46 of them silently** — no conflict marker, no prompt. Master never stopped using bluebird and the 17 new commits added 163 bluebird lines. Since `package.json` merges with our removal winning, the result is 58 files importing a package that is not installed. This is the bulk of the work and is invisible in the conflict list.
2. **Master and this branch independently refactored the same files**, and master's #791 bug fix touches the exact component this PR rewrote — in a way that **cannot be ported mechanically**, because it cancels an in-flight save and the whole point of this PR is that saves are never cancelled.

Master also reintroduces one sass `@import`, which this PR migrated away from and stopped silencing. The base branch's TS7 work, by contrast, is entirely safe — master never touches `tsconfig.json` or `craco.config.js`.

There are **24 conflicting files**, but the conflict count badly understates the job. Do not treat "no conflict markers left" as done.

## Where the branches stand

```
master                        1dcc762e   (17 commits ahead of the fork point)
chore/ts7-tsconfig-migration  4f71cb24   17 behind master,  2 ahead   ← the PR's base
chore/remove-bluebird         29a81056   17 behind master, 15 ahead   ← this branch
fork point                    4db5c9cd   "Update sitemap files (#772)"
```

Master changed 299 files since the fork point; this branch changed 451. The overlap is where the trouble is.

## Decide this first: which branch gets the merge

The PR targets `chore/ts7-tsconfig-migration`, not master. So "merge master in" is ambiguous, and the choice matters:

**Option A — merge master into the base first, then base into this branch.** Keeps the stack honest and keeps the PR diff readable, since the PR only ever shows changes relative to its base. Two merges instead of one, and the conflicts get resolved in the branch where they belong. **Recommended** if the stack is being kept.

**Option B — merge master straight into `chore/remove-bluebird`.** One merge, but the PR diff against `chore/ts7-tsconfig-migration` will then include all 17 master commits as noise, making the review harder rather than easier.

**Option C — retarget the PR to master and merge master in.** Cleanest end state if the ts7 branch is going to land first or is no longer needed. Worth asking whether the stack is still wanted before doing any merge work.

Confirm this choice before touching anything — resolving 24 conflicts in the wrong branch means doing it twice.

## Master brings bluebird back — 46 files, silently

**This is the biggest item, and the one most likely to be missed.**

Master never stopped using bluebird, and the 17 new commits **added 163 bluebird lines, including 45 new `import ... from 'bluebird'` statements**. Merging master pulls all of it into the branch whose entire purpose is removing bluebird.

The trap is the split between what you will see and what you will not:

|                                           | Files carrying bluebird after the merge |
| ----------------------------------------- | --------------------------------------- |
| Land as **conflicts** — you will see them | 12                                      |
| Merge **silently** — no marker, no prompt | **46**                                  |
| **Total**                                 | **58**                                  |

Meanwhile `package.json` merges cleanly with **our** removal winning: neither `bluebird` nor `@types/bluebird` is a dependency in the merged result. So the merged tree has 58 files importing a package that is not installed and whose types are gone. `yarn tsc` will fail loudly — which is the saving grace, but it will fail with a wall of errors that does not obviously point at "master reintroduced bluebird".

Nine of the silent arrivals are **production source files, brand new from master**, which this branch has never seen — so there is nothing to conflict with and they simply appear, fully bluebird-based:

```
src/fragmentarium/application/fragmentCache.ts
src/fragmentarium/application/fragmentProvenance.ts
src/fragmentarium/application/fragmentReferences.ts
src/fragmentarium/application/fragmentServiceBase.ts
src/fragmentarium/application/fragmentServicePorts.ts
src/fragmentarium/application/scopedCache.ts
src/fragmentarium/infrastructure/fragmentRepositoryAttestations.ts
src/fragmentarium/infrastructure/fragmentRepositoryUpdates.ts
src/fragmentarium/ui/fragment/editorTabContents.tsx
```

These came from master's own `#767` and `#791` refactors, which split `FragmentService` and `FragmentRepository` along different seams than this PR did. They are not stale duplicates to delete — they carry real behaviour — but every one of them needs converting to `AbortSignal` / native promises before this branch is coherent again.

The remaining 37 silent files are tests and test helpers in the same areas (`FragmentService.cache*.test.ts`, `FragmentRepository.*.test.ts`, `CuneiformFragment.navigation-state.test.tsx`, `TransliterationForm.validationErrors.test.tsx`, `injectedApp.testSupport.tsx`, `MapTab.testSupport.tsx`, and others).

**Practical consequence:** the conversion work in this merge is larger than the conflict count suggests. 24 conflicts is the visible part; 46 silently-merged bluebird files is the actual workload. Budget accordingly, and treat "the merge has no remaining conflict markers" as meaning nothing on its own.

**How to verify you have finished:**

```bash
# must return zero once the merge is complete
git grep -lie bluebird -- 'src/*' | wc -l
git grep -lie bluebird -- package.json yarn.lock   # yarn.lock may keep a transitive entry; src and package.json must be clean
```

Run that check _before_ running the test suite — a green partial run means nothing while imports are still unresolved.

## Everything master reintroduces that this PR stack removes

Beyond bluebird, both this PR and its base branch remove specific things. Master, having forked before either, can bring them back. Here is the full audit.

**What the base branch (`chore/ts7-tsconfig-migration`) removes** — from `tsconfig.json`: `"target": "es5"` (→ `es2020`), `"moduleResolution": "node"` (→ `bundler`), `"baseUrl": "src"` (→ `"paths": { "*": ["./src/*"] }`), plus `downlevelIteration` and `ignoreDeprecations: "5.0"` deleted outright. Removing `baseUrl` needs CRACO compensation, which lives in `craco.config.js` as the `jestConfig.modulePaths` block.

**What this PR removes:** bluebird, `cancellableFetch.ts`, and sass `@import` (migrated to `@use`) — the latter accompanied by _narrowing_ `craco.config.js` so `@import`, `global-builtin` and `color-functions` deprecations are no longer silenced and the matching `ignoreWarnings` patterns are gone.

| Removed by                          | Does master reintroduce it?                 | Visible as a conflict? |
| ----------------------------------- | ------------------------------------------- | ---------------------- |
| bluebird (this PR)                  | **Yes — 163 lines, 45 imports, 58 files**   | 12 of 58 only          |
| sass `@import` (this PR)            | **Yes — `src/map/ui/MapTab.sass`**          | **No — silent**        |
| `cancellableFetch.ts` (this PR)     | No                                          | —                      |
| `tsconfig.json` options (base)      | No — master never touches `tsconfig.json`   | —                      |
| CRACO `baseUrl` compensation (base) | No — master never touches `craco.config.js` | —                      |
| deprecated sass colour functions    | No — none added                             | —                      |
| files over the 250-line ceiling     | No new master file breaches it              | —                      |

### The sass one

Master's `0852971b "dev: added map MVP (#750)"` adds `src/map/ui/MapTab.sass`, whose first line is:

```sass
@import src/design-tokens
```

It is a brand-new file, so it **arrives with no conflict**. After the merge it is the only `@import` left in the entire tree — and the merged `craco.config.js` is this PR's narrowed version:

```js
silenceDeprecations: ['legacy-js-api'] // 'import' no longer silenced
ignoreWarnings: [
  /Failed to parse source map/,
  /Deprecation .* legacy JS API/, // the @import pattern is gone
]
```

So the build will start emitting a sass `@import` deprecation warning that this PR deliberately arranged to have nothing left to emit. Convert it to `@use` as part of the merge — that is a one-line change and keeps the branch's own cleanup intact. Note the whole `src/map/` MVP is new surface from master that this PR has never seen; check it for bluebird at the same time.

### The good news

The base branch's work is entirely safe. Master modifies neither `tsconfig.json` nor `craco.config.js` in any of the 17 commits, so every TS7 migration decision — the `es2020` target, `bundler` resolution, the `paths`-for-`baseUrl` swap, the dropped `downlevelIteration` and `ignoreDeprecations` — survives the merge untouched, along with the CRACO `modulePaths` compensation and the coverage thresholds. Nothing in the base PR needs redoing.

## The hard one: #791 conflicts with this PR's core design

Master's `1dcc762e "Bug fixes (#791)"` changed `CuneiformFragmentController` — the exact component this PR rewrote — to reset state when navigating between fragments:

```tsx
const isCurrentFragment = currentFragment.number === fragment.number
const visibleFragment = isCurrentFragment ? currentFragment : fragment

useEffect(() => {
  if (currentFragment.number !== fragment.number) {
    cancelPromise() // ← the problem
    setFragment(fragment)
    setError(null)
    setIsSaving(false)
  }
}, [cancelPromise, currentFragment.number, fragment])
```

plus `key={visibleFragment.number}`, `saving={isCurrentFragment && isSaving}` and `error={isCurrentFragment ? error : null}`.

This is a real user-facing fix and **must not be lost**. But `cancelPromise()` there is a bluebird `.cancel()` on the save promise, and this PR's central guarantee is that a dispatched write is never cancelled. So porting it verbatim is impossible and porting it carelessly would reintroduce the bug the whole PR exists to fix.

The right translation is to **supersede** the in-flight write rather than abort it — discard its UI update, let the request finish. That is exactly what `SupersedableOperation` does, and exactly what `usePromiseEffect` currently does **not** expose: it returns `[run, cancel, runWrite]`, where `cancel` aborts reads only, and the write token is deliberately never superseded.

This is finding **F2** from the review, which was closed as "no change needed". Merging master reopens it. The likely resolution is to add a fourth element to the tuple — `supersedeWrites()` — and call it in the navigation effect. Note that `usePromiseEffect.test.tsx:165-170` and `:199-218` currently assert the _opposite_ behaviour on unmount; those tests are about unmount, not navigation, so they should still hold, but read them before changing the hook.

Also from #791, in files this branch touched:

- `TransliterationForm.tsx` was refactored on master (−101 lines, extracting a new `TransliterationFormControls.tsx`) while this branch also rewrote it. Both refactors are real; neither is a superset of the other.
- New tests arrive that must survive: `CuneiformFragment.navigation-state.test.tsx` (134 lines), `TransliterationForm.validationErrors.test.tsx` (79 lines), `LemmaAnnotationButton.caret.test.tsx` (41 lines).

## The other trap: both sides split the same files

Master's `8971a666 (#767)` split the same oversized files this PR split, independently. That produces two conflict shapes that are easy to resolve wrongly:

**`modify/delete` — 2 files.** This branch deleted them; master modified them. Git leaves _master's_ version in the tree, so a careless `git add` resurrects a file this PR deliberately removed.

| File                         | Master's version            | What actually happened                  |
| ---------------------------- | --------------------------- | --------------------------------------- |
| `FragmentService.test.ts`    | 211 lines, modified by #767 | Deleted here, split into focused suites |
| `FragmentRepository.test.ts` | 171 lines, modified by #767 | Deleted here, split into focused suites |

Correct resolution: keep the deletion, and move master's #767 additions into the corresponding split file. Do **not** restore either file — both would breach the 250-line ceiling and undo work the previous reviewer explicitly asked for.

**`add/add` — 5 files.** Both sides created a file with the same path and different content. Neither side's version is complete; these need a genuine union, not a pick.

| File                                    | Master | Ours |
| --------------------------------------- | ------ | ---- |
| `FragmentService.provenance.test.ts`    | 109    | 191  |
| `FragmentRepository.query.test.ts`      | 206    | 156  |
| `FragmentRepository.rawSummary.test.ts` | 98     | 206  |
| `signImageGrouping.ts`                  | 89     | 40   |
| `SpanAnnotationDisplay.tsx`             | 170    | 157  |

Watch the line counts: `FragmentRepository.query.test.ts` merged naively could land near 250+ and breach the ceiling. Budget for another split.

## Full conflict list (24 files)

**content (17):** `InjectedApp.test.tsx`, `usePromiseEffect.ts`, `FragmentService.ts`, `FragmentRepository.ts`, `TransliterationForm.test.tsx`, `TransliterationForm.tsx`, `CuneiformFragment.test.tsx`, `CuneiformFragment.tsx`, `CuneiformFragmentEditor.tsx`, `Info.tsx`, `TextAnnotation.tsx`, `RealiaService.ts`, `RealiaRepository.ts`, `sitemap.test.tsx`, `sitemap.tsx`, `SignImages.test.tsx`, `SignImages.tsx`

**add/add (5)** and **modify/delete (2)** as tabled above.

`usePromiseEffect.ts` itself is the easy one despite being the headline file: master's only change to it (#791) was wrapping the returned functions in `useCallback`, which this branch's rewrite already does. Take ours; nothing is lost.

## Free win: master fixes a latent Docker break on this branch

Master's `aea1dca3 (#780)` widened `.dockerignore` because `*.testSupport.*` helpers were being copied into the production image, where they failed to resolve `src/test-support` imports and broke `yarn build` with TS2307 errors.

This branch has **24 `*.testSupport.*` files** and the old, narrow `.dockerignore`:

```
ours:                      master:
src/**/*.test.ts           src/**/*.test.ts
src/**/*.test.tsx          src/**/*.test.tsx
src/test-support           src/**/*.testSupport.ts
                           src/**/*.testSupport.tsx
                           src/**/testSupport
                           src/**/testFixtures
                           src/__mocks__
                           src/test-support
```

The `docker` and `docker-test` jobs only run on push to master, so **this breakage is invisible on the PR and would only surface after merge**. `.dockerignore` is not in the conflict list — this branch never touched it, so master's version applies cleanly. Just do not "helpfully" revert it.

Verified as safe: all 24 helpers on this branch follow the `*.testSupport.*` convention, and the three non-conforming helpers (`TransliterationForm.mocks.tsx`, `CuneiformFragmentTabContents.mocks.tsx`, `realiaRepositoryTestData.ts`) do not import `src/test-support`. The last of those is pre-existing on master, where Docker builds pass.

## Suggested order of work

1. Confirm the merge target (Option A / B / C above).
2. Branch from the current tip **with `--no-track`** before merging, so a mistake is cheap and no stray upstream is set.
3. Take master's `.dockerignore` and `package.json` resolutions first — mechanical, gets them out of the way.
4. Resolve the 2 `modify/delete` pairs by keeping the deletions and relocating master's #767 test additions into the split files.
5. Resolve the 5 `add/add` files as genuine unions, checking line counts as you go.
6. Resolve the 17 content conflicts, leaving `CuneiformFragment.tsx` and `TransliterationForm.tsx` for last.
7. Port #791's navigation fix onto the new cancellation model — supersede the write, do not abort it. Expect to extend `usePromiseEffect`.
8. **Convert every remaining bluebird file**, including the 46 that merged silently and the 9 brand-new production modules from master. Verify with `git grep -lie bluebird -- 'src/*'` returning zero.
9. **Convert `src/map/ui/MapTab.sass` from `@import` to `@use`**, and review the rest of the new `src/map/` MVP for bluebird.
10. Re-run every gate. Do not trust a green partial run on a merge this size.

## Gates to re-run afterwards

```
yarn lint
yarn tsc
CI=true yarn test --watchAll=false --coverage     # expect 426+ suites, zero console output
```

Plus the project-specific checks that a merge can silently break:

- **250-line ceiling** on every file the merge touched — the `add/add` unions are the likely offenders.
- **Zero console output.** Master's new tests have not run against this branch's rewritten components.
- **Coverage thresholds** in `craco.config.js` are currently `94.2 / 86 / 93.9 / 94.3`, passing with a 0.01–0.02 point margin. Master's 299 changed files will move the global number. If the merge fails on thresholds, that is a threshold-tuning problem, not necessarily a coverage regression — check which direction it moved before adding tests.
- **Zero bluebird in `src/` and `package.json`.** This is the one gate specific to this PR's purpose, and the merge actively works against it.
- **Zero sass `@import`.** `git grep -n "@import" -- '*.sass' '*.scss'` must return nothing, or the build emits deprecation warnings this PR removed the suppression for.
- **No new `.md` files.** `TASK-*.md` is gitignored as of `29a81056`, but master may carry its own; check `git diff --name-status <base>...HEAD -- '*.md' | grep '^A'` before finalising.

## Still open from the review (unchanged by this merge)

1. The `CHANGES_REQUESTED` review from 2026-08-04 is still standing and needs a re-review. Reviewer assignment has deliberately not been touched.
2. `qlty check` passes but its dashboard reports 4 blocking issues that are not mirrored to GitHub: https://qlty.sh/gh/ElectronicBabylonianLiterature/projects/ebl-frontend/pull/774/issues
3. CodeQL passed, but the alerts API was not readable with the available token, so that rests on the check-run conclusion rather than an enumerated alert list.

## Local files (gitignored)

`TASK-774-review.md`, `TASK-774-todo.md`, `TASK-774-log.md`, `TASK-774-handoff.md`, `TASK-774-merge-master-handoff.md`
