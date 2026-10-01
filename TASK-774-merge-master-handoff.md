---
task_id: 774-merge
document: handoff — merging master into chore/remove-bluebird
pull_request: https://github.com/ElectronicBabylonianLiterature/ebl-frontend/pull/774
branch: chore/remove-bluebird
base_branch: chore/ts7-tsconfig-migration (#773)
merged_from: origin/master (17 commits ahead of the fork point 4db5c9cd)
date: 2026-09-10
status: DONE — master reconciled into the branch, all gates green. SUPERSEDED on 2026-09-23 by TASK-774-handoff.md (#773 closed unmerged; #774 retargeted to master)
tracked_in_git: false (untracked on purpose; delete before merge)
---

# Handoff — merging master into `chore/remove-bluebird`

**This is finished.** An earlier attempt was abandoned at 220 TypeScript errors; the merge was then redone and completed. What follows records how, and what is left.

## Result

| Gate                                    | Result                                    |
| --------------------------------------- | ----------------------------------------- |
| `yarn tsc`                              | PASS                                      |
| `yarn lint`                             | PASS                                      |
| `yarn test --watchAll=false --coverage` | PASS — 500 suites, 4395 tests, 0 failures |
| Console output                          | zero                                      |
| Coverage thresholds                     | zero failures                             |
| `yarn build:ci-stable`                  | PASS, zero warnings                       |
| bluebird under `src`                    | 0                                         |
| bluebird in `package.json`              | 0                                         |
| Filename casing collisions              | 0                                         |

Global coverage went from 94.22 / 86.08 / 93.92 / 94.34 to **94.87 / 87.60 / 94.65 / 95.00**.

## Why it was hard

Not a routine catch-up merge. Both branches had independently refactored the same subsystems, so the merged tree briefly held two complete implementations of `fragmentarium/application`, five filename pairs differing only in their first letter, 56 files importing a package that had been removed, and ~17 text-annotation modules on master this branch had never seen.

## The rule used to resolve the 24 conflicts

- **Cancellation core stays ours** — `usePromiseEffect`, `ApiClient`, `withData`, the primitives, `Info.tsx`.
- **Combine where the two sides were orthogonal** — `sitemap.tsx` (master's `encode` parameter, our `Promise<>` return type), `RealiaRepository` (master's `fetchEntry` / `findByRealiaId` / `listAllRealia`, our signal threading), `RealiaService` (master's entry cache, our signal threading).
- **Master's structure everywhere else** — master is the trunk and carries newer feature work: the `FragmentService` / `FragmentRepository` cluster, `SignImages`, `SpanAnnotationDisplay`, `TextAnnotation`, `CuneiformFragmentEditor`, `TransliterationForm`, `editorTabContents`.

Master's architecture winning is the coherent end state. This PR's job is removing bluebird, not imposing a competing split.

## The #791 question — decided

Master's fix is not "cancel a save". It is: when the user navigates to another fragment, do not let the previous fragment's save bleed into the new fragment's UI.

All of master's navigation-reset behaviour was kept — `key={visibleFragment.number}`, `saving={isCurrentFragment && isSaving}`, `error={isCurrentFragment ? error : null}` — and only the abort was replaced, with **supersession**. `CuneiformFragmentController` owns a `SupersedableOperation` and supersedes on navigation and on unmount.

Same user-visible outcome, and better than master's: master aborts a dispatched save and then cannot know whether the server applied it.

**Master's own `CuneiformFragment.navigation-state.test.tsx` passes against this implementation.**

## What was removed

Superseded by master's structure: 13 modules of this PR's `fragmentarium/application` and `infrastructure` split, 9 `FragmentService.cache.*` tests (master has 8 equivalents), 14 further split tests written against the deleted helpers, and `CuneiformFragmentTabContents.*`.

Dead code, zero importers: `AnnotationRow.tsx`, `TransliterationFormFields.tsx` and its test — master's `AnnotationLines` and `TransliterationFormControls` replace them.

Casing collisions, keeping master's names: five `*.testSupport` files.

**Two tests were cut too hastily and restored**: `PeriodAccordion.test.tsx` and `SignImages.empty.test.tsx` cover live code, so the missing helpers were added to master's `signImages.testSupport` instead of dropping the tests. The same adapter approach kept the `CuneiformFragment.save` / `saveErrors` tests alive.

**One test was replaced, not deleted**: master's `does not return cancelled in-flight query when re-requested` asserts bluebird cancellation, which this PR removes. It is now `re-requests after an in-flight query has failed` — same concern, new model.

## Where master's behaviour beat ours

`TransliterationForm`: our test asserted that editing clears a stale error; master has explicit tests named `keeps error on editor input change`. Master's is the deliberate, newer choice, so master's behaviour stands and our contradicting test was removed. Found by porting our behaviour first and watching master's tests go red.

## Console silencing removed

Master's `fragmentServiceFragments.testSupport.ts` called `silenceConsoleErrors()`, a blanket `console.error` mock. The project forbids that. It now calls `expectConsoleErrors(/not found\./)`, which asserts the expected message and fails on anything else.

## Still to do

1. **Land #773 first.** It has exactly one conflict with master, `src/router/sitemap.tsx`, and the two sides are orthogonal — #773 changes `Bluebird<SlugsArray>` to `Promise<SlugsArray>`, master adds an `encode` parameter for URL encoding. Take both. Minutes of work.
2. **Retarget #774 to master** once #773 lands. GitHub does this automatically.
3. **Re-request review from Fabdulla1** to clear the standing `CHANGES_REQUESTED` from 2026-08-04. Every point in it is fixed in the code.
4. **Delete the five `TASK-774-*.md` files and the three `TASK-ts7-migration-*.md` files** before merge. All are untracked, so none can reach the PR, but they are still on disk.
5. **Check `Edition.test.tsx`** after retargeting — master's two assertions should win, minus master's bluebird import.
6. **46 files inherited from master exceed the 250-line ceiling** (`bibliography.tsx` at 1290, `complexTestText.ts` at 3514, and others). Master's pre-existing debt, untouched by this merge, out of scope here — worth a separate ticket.
