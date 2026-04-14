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
