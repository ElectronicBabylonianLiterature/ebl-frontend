# TASK-767 — Review: PR #767 "Add realia annotation layer to named entity annotation"

- **PR**: <https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/767>
- **Head reviewed**: `f93df64333e79f5abe92079eeb9c260acdbd9101`
- **Base**: `master` at `d93126190b58fb9af1df4cc76294664c36b48be1`
- **Working tree**: every fix below round 2 is **applied but uncommitted**. CI has not seen it.
- **Status**: every in-repository finding is now **resolved**. The one remaining blocker,
  **F10**, is in another repository.

## Summary

Realia annotations are a second annotation layer running in parallel to the named-entity
layer. The two kinds stay structurally apart end to end — separate fields on the DTO, on
`AnnotationSpans`, in the reducer, in props and in each lookup, rendered by two separate
`SpanIndicators` passes. `layer` is a required discriminant, so `isRealiaAnnotationSpan`
narrows both branches with no cast. `tier`, `name` and `layer` are stripped by the single
helper `omitDerivedSpanFields` at the one place that builds the outbound payload, pinned by
a repository test. `realiaInfo` is embedded in the fragment response and never echoed back.

All seven points from the reviewer's two `CHANGES_REQUESTED` reviews were verified fixed on
`f93df643`. This review then raised two further findings (**N1**, **N2**), and the user asked
for every open finding to be addressed. **N1**, **N2**, **F6**, **F7** and **F9** are now all
resolved in the working tree.

## CI Status

### Remote checks on head `f93df643`

Every check run and commit status was fetched from the GitHub API. **No check is failing**,
so no CI-derived finding is raised.

| Check                         | Check-run id | Status    | Conclusion  |
| ----------------------------- | ------------ | --------- | ----------- |
| `test`                        | 91116808843  | completed | **success** |
| `CodeQL`                      | 91117068477  | completed | **success** |
| `Analyze (javascript)`        | 91116808789  | completed | **success** |
| `GitGuardian scan`            | 91116808689  | completed | **success** |
| `GitGuardian scan`            | 91116805673  | completed | **success** |
| `GitGuardian Security Checks` | 91116803735  | completed | **success** |
| `docker`                      | 91118459355  | completed | skipped     |
| `docker-test`                 | 91116809713  | completed | skipped     |

| Commit status        | State       | Description            |
| -------------------- | ----------- | ---------------------- |
| `qlty check`         | **success** | No blocking issues     |
| `qlty coverage diff` | **success** | 100.0% (75% threshold) |
| `qlty coverage`      | **success** | 94.0% (+0.8% change)   |

Combined commit status: **success**.

**These conclusions describe `f93df643`, not the working tree.** The round-3 changes are
uncommitted, so CI has not run against them; the gates below were run locally against the
merge instead.

### Local gates on the merge with `master`, including the round-3 changes

The merge worktree was built from `origin/master` (`d9312619`), merged with
`add-realia-annotation`, and had the uncommitted working-tree changes applied on top
(`git diff HEAD --binary` plus the 38 untracked files) — so the gates ran on exactly what CI
will build once this is pushed. `yarn.lock` and `package.json` were confirmed byte-identical
between the worktree and the `--frozen-lockfile` install.

| Gate                                    | Result                                                            |
| --------------------------------------- | ----------------------------------------------------------------- |
| `yarn install --frozen-lockfile`        | exit 0                                                            |
| `git merge --no-ff origin/master`       | clean, no conflicts                                               |
| `yarn tsc`                              | exit 0                                                            |
| `yarn lint` (eslint + stylelint)        | exit 0                                                            |
| `yarn build`                            | exit 0 (143 s)                                                    |
| `yarn test --watchAll=false`            | **406/406 suites, 3872 passed, 2 skipped, 50 snapshots** (403 s)  |
| Console output during the suite         | **zero**                                                          |
| Coverage of all 92 changed source files | **100% statements / 100% branches / 100% functions / 100% lines** |

Coverage was measured over the **full suite** with `--collectCoverageFrom` set to each of the
92 changed non-test `.ts`/`.tsx` files, and `coverage-final.json` was read directly: `s`, every
arm of `b`, and `f` were checked per file. All 92 were present and none was below 100% on any
metric, so no branch-only gap is hiding behind a 100% line figure.

Four gaps surfaced on the first pass and were closed by deleting dead code rather than by
adding tests: the `= () => defaultCacheScope` default arguments on `ScopedCache` and
`FragmentCache` (both callers always pass a resolver) and two never-invoked
`bibliographyService` stubs in the new test-support modules.

The 2 skipped tests are `xit` in `src/fragmentarium/ui/edition/Edition.test.tsx`; both are on
`master` and that file is not in this PR's changed set.

### qlty

- Remote `qlty check` on `f93df643`: **No blocking issues**.
- Local `qlty check` over all 176 changed files: **✔ No issues**.
- Local `qlty smells`: **one** finding remains — `TestData`'s 6-parameter constructor in
  `src/test-support/utils.ts`. `Fragment`'s 34-parameter constructor is gone (F9), and the
  30-line `externalNumbers` duplication that the `test-fragment.ts` split surfaced is gone.
- All five inline qlty threads on the PR are **resolved** and **outdated**.

### Application run

`yarn start` compiles the merged tree cleanly and serves HTTP 200. The annotation flow could
not be exercised interactively: `REACT_APP_DICTIONARY_API_URL` points at
`http://localhost:8001` with no `ebl-api` running, and the tab is behind Auth0 plus
`isAllowedToAnnotateFragments`. Behaviour is covered by the suite; live verification is
blocked by the same dependency as F10.

## Comment status tracking

### Inline review threads

| Thread                    | Author        | Path                                 | Resolved | Outdated |
| ------------------------- | ------------- | ------------------------------------ | -------- | -------- |
| T1 similar-code (mass 84) | `qltysh[bot]` | `TextAnnotationContext.test.tsx:105` | resolved | outdated |
| T2 similar-code (mass 84) | `qltysh[bot]` | `TextAnnotationContext.test.tsx:121` | resolved | outdated |
| T3 similar-code (mass 92) | `qltysh[bot]` | `TextAnnotationContext.test.tsx:157` | resolved | outdated |
| T4 similar-code (mass 92) | `qltysh[bot]` | `TextAnnotationContext.test.tsx:175` | resolved | outdated |
| T5 boolean-logic          | `qltysh[bot]` | `cssCascade.testSupport.ts:110`      | resolved | outdated |

**5 threads, 5 resolved, 0 unresolved.** General / issue comments: **0**.

### Timeline review events

| Review     | Author        | State             | Commit     | Status                                           |
| ---------- | ------------- | ----------------- | ---------- | ------------------------------------------------ |
| 4686217547 | `qltysh[bot]` | COMMENTED         | `f37f6df0` | superseded                                       |
| 4703525359 | `qltysh[bot]` | COMMENTED         | `123f5f3a` | superseded                                       |
| 4753665596 | `Fabdulla1`   | APPROVED          | `b4b16fe5` | superseded                                       |
| 4753712550 | `Fabdulla1`   | CHANGES_REQUESTED | `b4b16fe5` | both points fixed, re-verified on `f93df643`     |
| 4815952885 | `Fabdulla1`   | CHANGES_REQUESTED | `7d5015e2` | all five points fixed, re-verified on `f93df643` |

The PR still reads `CHANGES_REQUESTED` only because the reviewer has not looked at it since
`7d5015e2`. Clearing it needs a fresh review, not a code change.

#### Point-by-point re-verification

| #   | Reviewer's point                                              | Where it is fixed                                                                                                                                                       |
| --- | ------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Toggle says "Toggle named entities" but controls both layers  | `FragmentDisplaySettings.tsx` — `title={'Toggle annotations'}`, `aria-label={'toggle-annotations'}`                                                                     |
| 2   | Workflow test: both arrays submitted, derived fields stripped | `TextAnnotation.save.test.tsx` — asserts `tier`, `name`, `layer` absent from every submitted span of both lists                                                         |
| 3   | `any` + eslint-disable in `injectedApp.testSupport.tsx`       | Replaced by the structural `MockedConstructorCalls`; no `no-explicit-any` suppression in any changed file                                                               |
| 4   | `RealiaSelect` rejection / stale-response race / unmount      | `realiaOptionLoader.ts` — request-id ordering guard, `isDisposed` flag, rejections through the same `respond`, Bluebird handlers attached synchronously                 |
| 5   | Refresh failure reported as a save failure                    | `FragmentService.updateNamedEntityAnnotations` resolves `{ fragment, refreshError }`; `SpanAnnotationDisplay` advances the baseline on persistence and warns separately |
| 6   | `useAnnotationContext` seeded once at mount                   | `TextAnnotation.tsx` — `{ watch: (props) => [props.number] }`; `TextAnnotation.fragmentChange.test.tsx` asserts refetch and reseed                                      |
| 7   | No negative assertions for Word / PDF export                  | `export.annotations.test.ts` — renders the exporters' tree and asserts no annotation markup, plus a static guard on the three export modules                            |

## Findings

### N1 — The editor fetched annotations the fragment response already carried — **Major · FIXED**

`TextAnnotation.tsx` loaded the editor with two requests, `find` and
`fetchNamedEntityAnnotations`. The second was redundant: this PR's own
`createFragmentAnnotationSpans` derives the identical `AnnotationSpans` from
`fragment.namedEntities`, `fragment.realia` and the word tokens — which is what the _display_
path already did. One avoidable request, and two mappings of the same value to keep in step.

**Fix.** `TextAnnotation` now loads only `fragmentService.find(number)` and seeds the reducer
from `createFragmentAnnotationSpans(fragment)`. `fetchNamedEntityAnnotations` is removed from
`FragmentService`, `ApiFragmentRepository` and the `FragmentRepository` port, together with
the now-unreachable `createAnnotationSpans` DTO helper. Their tests were removed with the
user's explicit approval, since the code path they asserted no longer exists.

**One behavioural detail had to be settled first.** `GET /fragments/{number}/named-entities`
returns entities whose `span` is `[]` — registered on the fragment but attached to no word —
whereas `createFragmentAnnotationSpans` filtered those out. Deriving with the filter in place
would have silently **deleted** such annotations on the next save. The filter was therefore
removed so the derived value matches the API exactly. Nothing renders differently:
`SpanIndicators` filters by `span.includes(wordId)`, so an empty span produces no indicator
either way.

**Tests.** `withAnnotationSpans` (`src/test-support/annotated-fragment.ts`) writes an
`AnnotationSpans` back onto a fragment, so every editor suite now seeds through the fragment.
`fragmentSpans.test.ts` pins the empty-span behaviour and keeps both cross-kind negative tests
— a foreign id still resolves to nothing. `TextAnnotation.fragmentChange.test.tsx` asserts the
editor issues exactly one `find`.

### N2 — Explanatory comment added against the no-comments rule — **Minor · FIXED**

`src/signs/ui/display/SignImages.tsx` gained a three-line comment explaining why the dead
`: croppedAnnotations` fallback could be removed. The Coding Standards forbid comments unless
requested. The comment is removed; the code change it documented was verified correct —
`clusterIds` is derived from `croppedAnnotations`, so the removed branch really was
unreachable.

### F6 — The 250-line ceiling — **Major · FIXED**

Every file in the changed set is now at or under 250 lines. Verified with:

```sh
{ git diff --name-only origin/master...HEAD; git status --short | awk '{print $2}'; } |
  sort -u | grep -E '\.tsx?$' |
  while read f; do [ -f "$f" ] && n=$(wc -l < "$f") && [ "$n" -gt 250 ] && echo "$n $f"; done
```

| File                         | before | now | extracted into                                                                                                         |
| ---------------------------- | -----: | --: | ---------------------------------------------------------------------------------------------------------------------- |
| `FragmentService.ts`         |    729 | 246 | `fragmentServiceBase`, `fragmentCache`, `scopedCache`, `fragmentCacheKeys`, `fragmentProvenance`, `fragmentReferences` |
| `FragmentRepository.ts`      |    541 | 234 | `fragmentFactories`, `fragmentRepositoryUpdates`, `fragmentRepositoryAttestations`                                     |
| `SignImages.tsx`             |    368 | 209 | `signClusterAnnotations`, `SignImageFigures`                                                                           |
| `FragmentService.test.ts`    |   1921 | 211 | 13 sibling suites + 3 test-support modules                                                                             |
| `FragmentRepository.test.ts` |    950 | 190 | 6 sibling suites; shared constants moved into `fragmentRepository.testSupport`                                         |
| `test-fragment.ts`           |    560 | 126 | `test-fragment-dto`, `test-fragment-lines`, `test-fragment-more-lines`                                                 |

`test-fragment.ts` and `fragment-fixtures.ts` were not in the changed set before this round —
the F9 refactor pulled them in, which is why the former needed splitting too.

The decomposition extracts cohesive collaborators rather than shuffling lines: a `ScopedCache`
owning cache scope, generation and the shared get-or-fetch; a `FragmentCache` built on it;
free functions for provenance fetching, reference injection and cache-key construction; and
base classes holding the mutation surface. The cache-key format, the generation bump on
invalidation and the scope-change clearing were preserved verbatim and are covered by the
split cache suites.

`FragmentService.trimCache` had no production caller and existed only to reach a defensive
branch from one test. It now lives on `FragmentCache`, and that test constructs a
`FragmentCache` directly instead of reaching through the service with a cast.

### F7 — Repository-policy changes bundled into a feature PR — **Minor · FIXED**

`.github/copilot-instructions.md` and both `.husky` hooks are restored from `origin/master`
and verified byte-identical (`git diff origin/master -- .github .husky` is empty). The user
confirmed master-push protection is now enforced on GitHub itself, so the hooks are redundant.

**Worth carrying into the follow-up policy PR:** `master`'s instructions keep the 250-line,
DRY, 100%-coverage, console-clean and test-removal rules, but **lose** the branch's Data
Architecture, API Call Efficiency, "CI — The Remote Result Is the Gate" and Git Branching
sections. Those went with the revert.

### F9 — `Fragment`'s 34-parameter constructor — **Minor · FIXED**

The positional constructor is replaced by a single `FragmentProps` argument with 34 explicit
`readonly` field declarations assigned in the constructor body. No definite-assignment
assertions, no declaration merging, no eslint suppression — the three objections that caused
the earlier attempt to be reverted. `Fragment.create` delegates to it, and both direct
`new Fragment(...)` call sites were converted to object form. `qlty smells` no longer reports
`Fragment`.

### F10 — Merging before `ebl-api` #740 breaks the existing named-entity feature — **Blocker (external) · OPEN**

Re-verified during this review. `ebl-api` PR #740 ("Realia annotation API: resolve realiaInfo
on every fragment-returning route") is **open and unmerged**. On `ebl-api` `master`,
`ebl/fragmentarium/web/named_entities.py` still has:

- `on_post`: `data = req.media["annotations"]`. The frontend posts `{ namedEntities, realia }`
  with no `annotations` key → `KeyError` → **500**, not a 422.
- `on_get`: returns a **flat list**. The frontend reads `namedEntities` / `realia` keys, so
  against the current API **every existing named-entity annotation reads as empty**.

The second point is a regression to a shipped feature, not an incomplete new one. Confirmed on
the #740 branch that `FragmentSchema` gains `named_entities` and `realia`, and `FragmentDtoSchema`
gains `realiaInfo` on every fragment-returning route — which is also what N1's fix depends on.

This is outside this repository, so it is recorded rather than fixed.

### Not applied, with reasons

**`TestData`'s 6-parameter constructor** (`src/test-support/utils.ts`) is the only remaining
`qlty smells` finding. It is pre-existing, untouched by this PR's diff, and non-blocking on
remote `qlty check`. Converting it to a parameter object would rewrite every
`new TestData(...)` call site across a dozen unrelated test files, dragging them into the
changed set and under the 250-line and coverage gates. Left alone deliberately.

## Severity

| Id  | Finding                                                     | Severity               | Status                             |
| --- | ----------------------------------------------------------- | ---------------------- | ---------------------------------- |
| F10 | `ebl-api` #740 not merged — existing annotations read empty | **Blocker (external)** | **Open**                           |
| N1  | Editor round-tripped for data the fragment already carries  | Major                  | **Fixed**                          |
| F6  | Files over the 250-line ceiling                             | Major                  | **Fixed** — none remain            |
| N2  | Comment added against the no-comments rule                  | Minor                  | **Fixed**                          |
| F7  | Repository-policy changes bundled in a feature PR           | Minor                  | **Fixed** — restored from `master` |
| F9  | `Fragment` constructor at 34 parameters                     | Minor                  | **Fixed**                          |

F1–F5 and F8 from the first round were fixed in `f93df643` and re-verified point by point.

## Reproduction Steps

**N1** — open the named-entity annotation tab with the network panel open. Before the fix two
requests went out, `GET /fragments/{number}` and `GET /fragments/{number}/named-entities`, and
the first response already contained everything the second returned. Now exactly one request
is issued, pinned by `TextAnnotation.fragmentChange.test.tsx`. The empty-span nuance: give a
fragment an entity attached to no word — before the fix the derived path dropped it and the
next save would have deleted it; now it survives, as `fragmentSpans.test.ts` asserts.

**N2** —

```sh
git diff origin/master...HEAD -- 'src/**/*.ts' 'src/**/*.tsx' |
  grep -nE "^\+\s*(//|/\*|\*)" | grep -vE "eslint|@ts-|istanbul|prettier"
```

Now empty apart from lines moved unchanged out of files already on `master`.

**F6** — the line-count sweep quoted in the finding; it now prints nothing.

**F7** — `git diff origin/master --stat -- .github .husky`; now empty.

**F9** — `qlty smells src/fragmentarium/domain/fragment.ts`; `Fragment` is no longer reported.

**F10** — point the frontend at an `ebl-api` deployment built from `master`, open the
named-entity annotation tab of a fragment that already has annotations (the editor shows
none), add a tag and press Save (the request 500s on `KeyError: 'annotations'`).

## Recommendation

**Do not merge yet — the only blocker left is external.**

Every in-repository finding is resolved. On the merge with current `master`, `tsc` and `lint`
exit 0, 405/405 suites and 3863 tests pass with zero console output, `qlty check` is clean, and
no changed file exceeds 250 lines. `qlty smells` is down to one pre-existing constructor.

**F10** remains: until `ebl-api` #740 is merged _and deployed_, this PR makes existing
named-entity annotations read as empty and makes saving fail with a 500. N1's fix also depends
on #740 shipping, since the fragment route only carries `realia` and `realiaInfo` there.

## What Has To Be Done

1. **[Blocker · F10 · outside this repository]** Get `ebl-api` PR #740 merged **and deployed**
   before #767 is merged. Confirm on the deployed API that a fragment response carries
   `namedEntities`, `realia` and `realiaInfo`, and that `POST /named-entities` accepts
   `{ namedEntities, realia }`.
2. **Commit and push** the round-3 changes — they are uncommitted, so CI has not seen them.
   Then re-fetch the check runs and commit statuses for the new head and confirm every one is
   green.
3. **[Follow-up PR · F7]** Re-raise the repository-policy changes on their own branch. Note
   that reverting `.github/copilot-instructions.md` to `master` also dropped the Data
   Architecture, API Call Efficiency, CI-as-a-gate and Git Branching sections.
4. **[Optional]** Decide whether `TestData`'s 6-parameter constructor deserves its own
   refactor. It is not worth doing inside this PR — see the finding.
5. **Re-review**: request a fresh review from `Fabdulla1` to clear the outstanding
   `CHANGES_REQUESTED` (review `4815952885`), all points of which are addressed. Reviewer
   assignment is the author's to make — this review does not add reviewers.
6. **Before merge**: delete `TASK-767-todo.md`, `TASK-767-log.md` and `TASK-767-review.md`.
