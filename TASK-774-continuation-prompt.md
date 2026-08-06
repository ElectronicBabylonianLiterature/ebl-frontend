# TASK-774 — continuation prompt

Paste everything below the line into a fresh session. It is written to be
self-contained: it assumes no memory of the previous conversation.

---

## Prompt

Read `.github/copilot-instructions.md` first and follow every gate in it. Never commit,
branch or push unless I explicitly ask in that message — a past "please commit" is spent
permission and does not carry forward.

You are continuing remediation work on PR #774
(`chore: remove bluebird, use AbortController for cancellation`,
ElectronicBabylonianLiterature/ebl-frontend). Two commits of that work are already on the
branch. Your job is to finish the two items still open.

### Where things are

- Branch: `chore/remove-bluebird`, already checked out in `/workspaces/ebl-frontend`.
  Its base is `chore/ts7-tsconfig-migration` (PR #773), not `master`.
- Last two commits: `c563799d` (FragmentRepository + TextService splits) and `b744a49b`
  (the write-cancellation fix and the other findings).
- `yarn tsc`, `yarn lint` and the full test suite are **green** at that point, with zero
  console output. Do not start by assuming something is broken.
- The full review, with every finding and its status, is in `TASK-774-review.md`.
  The work log is `TASK-774-log.md`; the checklist is `TASK-774-todo.md`.
  All `TASK-*.md` files must be deleted before the PR merges — do not delete them yet.

### Task 1 — bring 32 files under the 250-line ceiling

The copilot instructions treat 250 lines per `.ts`/`.tsx` file (tests included) as a hard
gate. Thirty-two files that this PR touches are still over. Largest first:

| Lines | File                                                                              |
| ----- | --------------------------------------------------------------------------------- |
| 1930  | `src/fragmentarium/application/FragmentService.test.ts`                           |
| 1017  | `src/fragmentarium/infrastructure/FragmentRepository.test.ts`                     |
| 780   | `src/corpus/application/TextService.test.ts`                                      |
| 649   | `src/fragmentarium/ui/fragment/lemma-annotation/ProperNounCreationPanel.test.tsx` |
| 545   | `src/fragmentarium/ui/search/FragmentariumSearch.test.tsx`                        |
| 516   | `src/test-support/FakeApi.ts`                                                     |
| 461   | `src/fragmentarium/ui/SearchForm.test.tsx`                                        |
| 442   | `src/signs/ui/display/SignImages.tsx`                                             |
| 421   | `src/fragmentarium/ui/front-page/LatestTransliterations.test.tsx`                 |
| 415   | `src/dossiers/infrastructure/DossiersRepository.test.ts`                          |
| 408   | `src/http/ApiClient.edge-cases.test.ts`                                           |
| 368   | `src/fragmentarium/ui/info/Details.test.tsx`                                      |
| 346   | `src/fragmentarium/ui/text-annotation/TextAnnotation.tsx`                         |
| 335   | `src/chronology/ui/DateEditor/DateSelectionInput.test.tsx`                        |
| 334   | `src/fragmentarium/ui/fragment/ColophonEditorIndividualForm.tsx`                  |
| 334   | `src/dictionary/ui/display/WordDisplay.test.tsx`                                  |
| 321   | `src/dossiers/application/DossiersService.test.ts`                                |
| 319   | `src/dossiers/application/DossiersService.ts`                                     |
| 311   | `src/fragmentarium/ui/edition/TransliterationForm.test.tsx`                       |
| 304   | `src/corpus/ui/Chapters.tsx`                                                      |
| 303   | `src/fragmentarium/ui/fragment/CuneiformFragmentEditor.tsx`                       |
| 291   | `src/bibliography/application/BibliographyService.ts`                             |
| 290   | `src/fragmentarium/ui/fragment/FragmentView.test.tsx`                             |
| 285   | `src/fragmentarium/ui/info/Details.tsx`                                           |
| 285   | `src/fragmentarium/ui/fragment/ArchaeologyEditor.tsx`                             |
| 280   | `src/afo-register/ui/AfoRegisterSearchForm.tsx`                                   |
| 279   | `src/chronology/application/DateSelectionState.ts`                                |
| 273   | `src/fragmentarium/ui/fragment/CuneiformFragment.test.tsx`                        |
| 264   | `src/http/withData.test.tsx`                                                      |
| 263   | `src/signs/ui/display/SignImages.test.tsx`                                        |
| 257   | `src/about/ui/about.test.tsx`                                                     |
| 254   | `src/fragmentarium/ui/edition/TransliterationForm.tsx`                            |

Re-derive this list rather than trusting it — it will drift as you work:

```bash
{ git diff --name-only origin/chore/ts7-tsconfig-migration...HEAD
  git status --porcelain | awk '{print $NF}'; } \
  | grep -E '\.(ts|tsx)$' | sort -u \
  | while read f; do [ -f "$f" ] && wc -l "$f"; done \
  | awk '$1>250' | sort -rn
```

Work one file at a time, largest first, keeping the tree compiling and green between files.
Behaviour must not change.

**Patterns that worked on the three files already done** (`FragmentService.ts` 849 → 10
modules, `FragmentRepository.ts` 732 → 5, `TextService.ts` 573 → 7):

- _Source classes_: extract collaborators by responsibility first (caching, DTO mapping,
  URL building), then, if still over, split the class into a base and a subclass —
  `class Foo extends FooReadService` — putting shared helpers in the **base** and the code
  that calls them in the derived class. Getting that direction wrong produces a cascade of
  "Property 'x' does not exist" errors; if you see those, you split the wrong way round.
  Change `private` to `protected` on anything the subclass needs.
- Keep the original module's public surface: re-export moved symbols from the entry point
  so external importers keep working (`export { createScript } from './createFragment'`).
- If the same `const` would end up duplicated in several new files, put it in a small
  shared constants module — the DRY gate applies to the split too.
- _Test files_: split by `describe` block into sibling suites
  (`Foo.cache.test.ts`, `Foo.updates.test.ts`, …). Shared fixtures and mock factories go
  into a `Foo.testSupport.ts` module — that suffix is an existing repo convention
  (`src/router/Tools.testSupport.tsx`, `src/realia/ui/RealiaDisplay.testSupport.tsx`) and
  Jest does not pick it up as a suite. `jest.mock(...)` calls are hoisted per module, so
  each split file needs its own; that small duplication is acceptable jest boilerplate.

**Import hygiene.** `@typescript-eslint/no-unused-vars` is an error, so split files must not
carry unused imports, and `eslint --fix` will not remove them. A helper that does this
automatically was written during the previous session; recreate it if useful — it runs
eslint with `--format json`, deletes every import specifier reported unused, repeats until
clean, then runs prettier. Practically: give each new file the full original import block,
then strip.

### Task 2 — 100 % coverage on affected code

The copilot instructions require 100 % coverage on code the change touches. Everything the
write-cancellation fix introduced is already at 100 %. These consumer components still have
gaps, and the uncovered lines are mostly the `isStale()` / `isCancellation` branches:

| File                                                         | Stmts | Branch |
| ------------------------------------------------------------ | ----- | ------ |
| `src/afo-register/ui/AfoRegisterSearchForm.tsx`              | 78.26 | 60.71  |
| `src/signs/ui/CuneiformConverter/CuneiformConverterForm.tsx` | 81.25 | 50     |
| `src/fragmentarium/ui/fragment/CuneiformFragment.tsx`        | 84.61 | 60     |
| `src/corpus/ui/ChapterEditView.tsx`                          | 89.58 | 50     |
| `src/fragmentarium/ui/info/ScriptSelection.tsx`              | 94.87 | 66.66  |
| `src/fragmentarium/application/FragmentCache.ts`             | 98.93 | 88.23  |
| `src/chronology/application/DateSelectionMethods.ts`         | 100   | 68.96  |

Each needs a test that rejects the underlying operation and one that makes the operation
stale. `src/common/hooks/usePromiseEffect.write.integration.test.tsx` is a good model for
driving a component through `runWrite` with a mocked `fetch`.

Re-measure with `CI=true yarn test --watchAll=false --coverage` and read the per-file table.

### Gates — all must pass before you call the work done

1. `yarn tsc` — zero errors
2. `yarn lint` — zero errors
3. `CI=true yarn test --watchAll=false --coverage` — zero failures **and zero console
   output**. Never silence a warning by mocking `console.error`/`console.warn`; fix the
   source.
4. 100 % coverage on affected code
5. No `.ts`/`.tsx` file over 250 lines
6. DRY — no domain logic or mapping duplicated across the new modules

**Memory constraint:** this devcontainer OOMs partway through a single full-suite run
("The build failed because the process exited too early" — that is the environment, not a
test failure). Run the suite in directory chunks instead, e.g.
`--testPathPattern="src/(common|http|auth|about|router|bibliography)"`, then `fragmentarium`,
then `corpus|chronology|dictionary|dossiers`, then the rest, then the loose files under
`src/` (`App`, `Introduction`, `InjectedApp`, `index`, `Header`, `editor`, `akkadian`,
`test-support`). All 347 suites pass this way today.

### Repo conventions you must follow

- `yarn`, never `npm`.
- Absolute import paths via the module aliases (`common/utils/x`), not `./x`.
- Full variable and function names; no `any`/`unknown` unless genuinely necessary.
- No comments in code unless asked.
- Never remove, skip or disable an existing test without explicit approval.
- Keep `TASK-774-todo.md` and `TASK-774-log.md` updated as you go, and update
  `TASK-774-review.md` if a finding's status changes.

### Two things to know that are not obvious from the code

1. **Writes must never carry an `AbortSignal`.** The original defect was that a superseding
   write aborted the first write's in-flight `fetch` after the server may already have
   applied it, silently. The fix removed `signal?` from every write-side service and
   repository method so the compiler forbids it; `runWrite` hands the operation an
   `isStale()` predicate from `common/utils/SupersedableOperation` instead. If a split or a
   new test tempts you to reintroduce a signal on a write, don't. The rule is written up in
   the README under "Promises and cancellation".
2. **Do not add `!signal.aborted` to `withData`'s success path.** It looks like it would
   make the success and error paths symmetric. It does not: it breaks `FragmentView.test.tsx`
   (13 spinners never resolve), because that path legitimately runs after the effect cleanup
   has aborted the controller while `requestSequence` still identifies the request as
   current. This was tried, reverted, and recorded as a withdrawn finding in
   `TASK-774-review.md`.

### Out of scope

- Do not commit, branch or push unless I ask.
- Do not post anything to GitHub and do not touch reviewer assignments.
- Do not delete the `TASK-*.md` files yet — they go before merge, in the same commit as the
  code.
- Getting CI to run on this PR needs #773 merged and the base retargeted to `master`; that
  is a maintainer action, not yours.
