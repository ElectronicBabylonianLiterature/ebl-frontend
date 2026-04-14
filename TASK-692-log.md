# TASK-692 Work Log

## 2026-04-14

- Started conflict-resolution task for merge from master into branch update-eslint.
- Enumerated merge conflicts via git status and SCM conflict list.
- Conflicted files detected:
  - src/corpus/application/dtos.ts
  - src/corpus/domain/line-details.ts
  - src/corpus/ui/manuscripts/ChapterManuscripts.tsx
  - src/corpus/ui/manuscripts/ManuscriptForm.tsx
  - src/fragmentarium/ui/front-page/LatestTransliterations.test.tsx
- Resolved conflicts in all 5 files.
- Resolution approach applied:
  - Keep branch import/style conventions (`common/utils/period`, `common/ui/List`).
  - Keep master semantic intent (explicit `getProvenanceByName`, preserve `withData` wrapping where introduced by master).
  - Apply master test behavior in LatestTransliterations setup (remove spinner-wait call).
- Verified no conflict markers remain in src/\*\*.
- Staged resolved files so Git no longer reports unmerged paths.
- Ran gates:
  - `yarn lint` passed (includes a TypeScript version support warning from @typescript-eslint, no lint failures).
  - `yarn tsc` passed with no errors.

## 2026-04-14 (Unexpected Break Follow-up)

- Reproduced `yarn test:fast` failure as process termination:
  - `The build failed because the process exited too early.`
- Verified prior mitigation from deleted TASK-683 documentation in commit history (`2b2425d3^`): use bounded heap + `--runInBand` for stability under constrained environments.
- Confirmed targeted file (`CuneiformFragment.test.tsx`) passes in stable single-process mode; issue is execution stability, not inherent test logic in that file.
- Ran full suite under stable profile and found deterministic test failure in `src/corpus/ui/ManuscriptPopover.test.tsx` snapshot due unseeded provenance abbreviations.
- Applied fixes:
  - `package.json` `test:fast` now uses `NODE_OPTIONS=--max_old_space_size=1536` with `--runInBand --watch=false`.
  - `src/corpus/ui/ManuscriptPopover.test.tsx` now seeds required provenance records via `setProvenanceRecords(...)` to remove hidden inter-test dependency.
- Additional root-cause refinement:
  - Added default provenance seed records in `src/corpus/domain/provenance.ts` so baseline siglum abbreviations are available before async provenance fetch.
  - Switched `ManuscriptPopover.test.tsx` from `setProvenanceRecords(...)` to non-pruning `upsertProvenanceRecord(...)` to avoid cross-test shared-state truncation.
- Additional flake fix:
  - `src/fragmentarium/ui/text-annotation/TextAnnotation.test.tsx` used `waitFor(async () => userEvent.click(...))`, which retried side effects and became flaky under full-suite load.
  - Replaced that pattern with a single click followed by `findByLabelText(...)` for deterministic async waiting.
- Console-noise fix:
  - Traced `console.warn` in `FragmentInCorpus.test.tsx` to `ChapterCrumb.link` generating URLs with embedded `//` when chapter stage abbreviation is empty.
  - Updated `ChapterCrumb.link` to omit empty path segments and added a regression test.
  - Follow-up fix: guard `stageToAbbreviation(...)` itself so empty stages do not throw before filtering.
- Stable fast-test command selected after full-suite validation:
  - `NODE_OPTIONS=--max_old_space_size=1536 craco test --maxWorkers=1 --workerIdleMemoryLimit=512MB --bail --no-coverage --watch=false`

## Critical Issue Identified (Hardcoded Provenance Fallback - REMOVED)

**Problem:** Added a `fallbackProvenanceByName` map as a workaround for unseeded provenance records causing empty abbreviations in tests. This is a **bad practice** because:

- Provenance data should come from the database/API, not be hardcoded in production code
- Creates maintenance burden and staleness risk
- Masks the real root issues instead of fixing them

**Root Causes NOT addressed:**

1. `setProvenanceRecords()` is destructive: when tests call it with partial data (e.g., only Babylon), it clears global state and loses other provenances
2. Tests have implicit dependencies on initialization order and rely on side effects from other tests
3. Some test suites don't initialize provenance data, assuming it's already loaded

**Proper Fix (TODO for user/team):**

1. Ensure `src/corpus/domain/provenance.test.ts` calls `setProvenanceRecords()` with **complete** provenance data during test setup initialization (not partial subsets)
2. Document that `setProvenanceRecords()` is destructive and only for test initialization
3. Consider refactoring tests that use partial provenance data to use `upsertProvenanceRecord()` instead, or to not modify global state
4. Remove the fallback map (removed in this log update)

The hardcoded map was **removed** in this session.

## 2026-04-14 (index.tsx TypeScript diagnostics follow-up)

- Investigated TypeScript diagnostics in `src/index.tsx` for side-effect imports:
  - `bootstrap/dist/css/bootstrap.min.css`
  - `./index.sass`
- Root cause: missing ambient module declarations for style imports in `src/declarations.d.ts`.
- Applied fix in `src/declarations.d.ts`:
  - `declare module '*.css'`
  - `declare module '*.sass'`
- Re-ran validation gates:
  - `yarn lint` passed.
  - `yarn tsc` passed.
- Confirmed no remaining diagnostics in `src/index.tsx`.

## 2026-04-14 (ChapterView snapshot regression follow-up)

- Reproduced failing snapshots in `src/corpus/ui/ChapterView.integration.test.ts`:
  - `Display chapter Show manuscripts 1`
  - `Display chapter Sidebar 1`
- Root cause: missing provenance abbreviations (`Standard Text`, `Nippur`) in this suite's runtime state, causing sigla to render without provenance prefixes.
- Applied test-only fix in `src/corpus/ui/ChapterView.integration.test.ts`:
  - Added suite-local provenance seeding with `upsertProvenanceRecords(...)` in `beforeEach`.
  - Added provenance state restore via `restoreProvenanceState(...)` in `afterEach`.
- Re-ran target suite: all ChapterView tests and snapshots now pass.

## 2026-04-14 (Merge conflict follow-up: src/index.tsx)

- After fetching latest `origin/master`, reproduced merge conflict reported by GitHub in `src/index.tsx`.
- Conflict was between import paths introduced on master (`common/ErrorBoundary`, `common/SentryErrorReporter`) and branch paths (`common/errors/...`) plus stale imports no longer needed after `InjectedApp` extraction.
- Resolved by keeping valid existing imports:
  - `common/errors/ErrorBoundary`
  - `common/errors/SentryErrorReporter`
- Removed conflict markers and obsolete imports from the conflicting hunk.
- Marked file as resolved with `git add src/index.tsx`.
- Re-ran quality gates:
  - `yarn lint` passed.
  - `yarn tsc` passed.

## 2026-04-14 (Workflow/stylelint/boolean-logic findings follow-up)

- Investigated reported findings:
  - `zizmor:zizmor/excessive-permissions` in `.github/workflows/main.yml`
  - `stylelint:CssSyntaxError` in `src/common/ui/AppContent.sass`
  - `qlty:boolean-logic` in `src/common/utils/HtmlToWord.tsx`
- Applied workflow hardening by adding minimal top-level permissions:
  - `permissions: { contents: read }`
- Resolved style parser finding by migrating AppContent stylesheet from indented Sass to SCSS:
  - Updated import in `src/common/ui/AppContent.tsx` to `./AppContent.scss`
  - Added `src/common/ui/AppContent.scss`
  - Removed `src/common/ui/AppContent.sass`
- Refactored `getTransliterationText(...)` in `src/common/utils/HtmlToWord.tsx` to named predicates and reduced boolean complexity while preserving behavior.

## 2026-04-14 (Correction: prefer .sass + parser config)

- Reverted prior `.sass` -> `.scss` workaround for `AppContent` because project convention uses `.sass`.
- Restored `src/common/ui/AppContent.sass` and updated `src/common/ui/AppContent.tsx` import back to `.sass`.
- Added stylelint override in `.stylelintrc.json` to parse indented Sass via `postcss-sass` for `**/*.sass`.
- Installed `postcss-sass` as a dev dependency so parser behavior is explicit and portable across CI/local tooling.
- Kept local `lint` script on the project's existing stable scope (`src/**/*.css`) after observing stylelint runtime errors when expanding local lint to all `.sass` files under current rule set.
- While validating the Sass path, detected and fixed accidental duplication/corruption in `src/common/ui/AppContent.sass` (`top: 0.main` sequence).
- Normalized `AppContent.sass` declarations to satisfy stylelint for that file (quoted URL value, short hex color, compact padding shorthand).
- Confirmed direct lint of `src/common/ui/AppContent.sass` now passes.
- Enabled `.sass` linting in project gate by updating `package.json` lint script to `stylelint 'src/**/*.{css,sass}'`.
- Investigated parser crashes in:
  - `src/fragmentarium/ui/search/FragmentariumSearchResult.sass`
  - `src/fragmentarium/ui/text-annotation/TextAnnotation.sass`
- Root cause: stylelint selector-parser interactions with the standard selector rule set on indented Sass syntax (`postcss-sass`) for these files.
- Fixed by removing file-level ignores and adding Sass-specific rule overrides that disable selector-parser-sensitive rules while preserving Sass lint execution as a gate.
- Confirmed no parser crashes remain:
  - `yarn stylelint 'src/**/*.{css,sass}'` passed.
- Confirmed full gates pass with Sass lint included:
  - `yarn lint` passed
  - `yarn tsc` passed

## 2026-04-14 (Sass semantic audit)

- Audited all modified `.sass` files via full git diff.
- Found unintended semantic drift introduced during earlier bulk stylelint fix attempts (e.g., removed mixin imports/usages, altered selectors/value forms).
- Reverted all `.sass` file changes to eliminate semantic drift; verified no staged or unstaged `.sass` diffs remain.
- Kept Sass lint as a gate and adjusted Sass-specific stylelint override rules for stylistic-only checks, avoiding forced non-semantic rewrites.
- Revalidated successfully:
  - `yarn stylelint 'src/**/*.{css,sass}'`
  - `yarn lint`
  - `yarn tsc`

## 2026-04-14 (Sass lint tightening)

- Tightened Sass lint override in `.stylelintrc.json` by explicitly enforcing baseline correctness rules for `**/*.sass`:
  - `no-empty-source`
  - `block-no-empty`
  - `comment-no-empty`
  - `color-no-invalid-hex`
  - `declaration-block-no-shorthand-property-overrides`
  - `declaration-block-no-duplicate-custom-properties`
  - `unit-no-unknown`
  - `property-no-unknown`
- Kept parser-stability and legacy-style compatibility null-overrides to avoid stylelint crashes and avoid forcing broad non-semantic rewrites.
- Validation after tightening:
  - `yarn stylelint 'src/**/*.{css,sass}'` passed
  - `yarn lint` passed
  - `yarn tsc` passed

## 2026-04-14 (Additional Sass rule tightening - auto-fix friendly)

- Further tightened Sass override by re-enabling auto-fix-friendly baseline style rules inherited from `stylelint-config-standard` (kept parser/manual-refactor-sensitive rules disabled).
- Verified lint gate behavior on all Sass files with non-destructive run:
  - `yarn stylelint 'src/**/*.{css,sass}' --formatter verbose` passed, `.sass` files actively checked.
- Noted toolchain caveat: running `stylelint --fix` on all Sass files can incorrectly empty two files in this environment (`src/_fonts.sass`, `src/fragmentarium/ui/text-annotation/NamedEntities.sass`), so global Sass autofix is avoided; linting remains enforced and crash-free.
- Revalidated full gates:
  - `yarn lint` passed
  - `yarn tsc` passed

## 2026-04-14 (User-requested full Sass rollback)

- Reverted all `.sass` file modifications (staged and unstaged) to preserve existing Sass semantics.
- Verified no `.sass` files remain modified.
- Since reverted legacy Sass patterns conflict with some stricter Sass style rules, updated only `.stylelintrc.json` Sass override to relax those style-only rules while keeping `.sass` linting in gate.
- Revalidated:
  - `yarn lint` passed
  - `yarn tsc` passed
