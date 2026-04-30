# TASK-001 — Fixes to Date Converter

## Source

Trello card: "Fixes to date converter" (reported by Zsombor Földi / ilya.o.khait)

## Checklist

### BUG-1 · Delete date hangs / does nothing

- [x] Trace and confirm the crash path in `Info.tsx updateDate`
- [x] Fix `updateDate` to handle `undefined` (deletion) without calling `.toDto()` on `undefined`
- [x] Verify `FragmentService.updateDate` / `FragmentRepository.updateDate` accept an optional DTO
- [x] Add / update tests
- [x] Fix library date-editor auto-scroll when opening edit date popover
- [x] Add / update tests for the date-editor scroll regression path

### BUG-2 · `isBroken` / `isUncertain` flags not shown on king names

- [x] Confirm root cause: `MesopotamianDate.fromJson()` discards `isBroken`/`isUncertain` from DTO when merging king from `findKingByOrderGlobal()`
- [x] Fix `fromJson()` to preserve `isBroken`/`isUncertain` from the DTO king field
- [x] Add / update tests

### BUG-3 · Non-numeric date spellings and year metadata

- [x] Review the attached analysis artifacts (`TASK-001-non_numeric_date_spellings_ebl.*`) and confirm the supported scope for converter-safe values
  - [x] Review the attached analysis artifacts (`TASK-001-non_numeric_date_spellings_ebl.*`) and confirm the supported scope for converter-safe values
  - [x] Implement year-only structured metadata for reconstruction and emendation:
  - [x] Add `isReconstructed` for `<>` display / storage semantics
  - [x] Add `isEmended` for `!` display / storage semantics
  - [x] Keep free-text values allowed in the editor for flexibility with explicit allowed patterns (`n` means number):
  - [x] `n`, `x`, `n+`, `x+n`, `n-n`, `n/n`, `n?`, `n!`, `(n)`, `[n]`, `<n>`, `n[a-z]` (number with trailing letter, e.g. `12a` / `12b`)
  - [x] Add non-blocking warnings for non-standard typed values that should use structured metadata or existing switches instead:
  - [x] If year contains `<...>`, warn to use `isReconstructed` instead of raw brackets
  - [x] If year contains `!`, warn to use `isEmended` instead of raw exclamation
  - [x] If any field contains `?`, warn to use `isUncertain` (instead of raw `?` typing)
  - [x] If year/day contains roman numerals or unrelated text fragments, warn that conversion may be skipped for that field
  - [x] Ensure conversion logic prefers structured year metadata and ignores supported non-numeric wrappers instead of failing on raw text
  - [x] Plan cleanup of existing `< >`, `!`, and `?` values once the new flow is in production
  - [x] Add / update tests
  - [x] All tests, lint, and tsc pass for date-fixes branch
  - [x] _Note: This is broader than a simple `< >` parsing fix and now tracks the agreed compromise direction._

### BUG-4 · Intercalary months not taken into account in conversion

- [x] Reproduce with `MNB.1129` (`Date: 16.VI².3 Cambyses (31 August 527 BCE PJC)`)
- [x] Trace through `setToMesopotamianDate` / `shiftMesopotamianMonthIfNoMatchFound` for the failing date
- [x] Identify which code path skips intercalary handling (SE-era path, king-date path, or data gap)
- [x] Fix the conversion to respect intercalary months correctly
- [x] Comprehensive check of all conversion paths for different intercalary months handling
- [x] Add / update tests

### BUG-5 · Year 0 of a king converted incorrectly (e.g. VAT.8439 Nabonidus+0 → Labaši-Marduk+3 months)

- [x] Confirm that `ZeroYearKingFinder` returns Labaši-Marduk as previous king of Nabonidus
- [x] Confirm `totalOfYears` for Labaši-Marduk is "3 months" and is non-numeric
- [x] Preserve original selected king name and displayed year `0` in the UI
- [x] Walk back past kings with non-numeric `totalOfYears` for calculation only
- [x] Fix `getPreviousKingAndYearIfYearZero` / `getLastYearField` accordingly
- [x] Comprehensive check of all conversion paths for different year 0 king-date handling
- [x] Fix `toDto()` to serialize the original king/year-0 (not the calculation-converted values) for correct round-trip persistence
- [x] Fix editor initialization to populate king and year from original user-entered values (not calculation-converted values)
- [x] Add / update tests

### Gates (must pass before PR)

- [x] `yarn lint` — no errors
- [x] `yarn tsc` — no errors
- [x] Full test suite — no failures, no console warnings/errors

### PR review follow-ups (PR #714)

- [x] F5: add radix `10` to `parseInt` in `parseDateFieldNumber`
- [x] F4: extract shared `<DateFieldWarnings>` component to remove duplicated warning render in `getDateInputGroup` / `getYearInputGroup`
- [x] F3: resolve `qltysh[bot]` similar-code finding on `DateFieldPatternsHelp.tsx` (rewrote popover with `Table`; reverted unrelated global `data-testid` on `HelpTrigger` to avoid 14 cross-suite snapshot regressions)
- [x] F6: scope "non-standard value" warning away from `month` (numeric only)
- [x] F7: drop inline `float: 'left'` layout in patterns help popover
- [x] F8: expand `DateFieldPatternsHelp.test.tsx` to assert each allowed pattern row, switch to alias import path
- [x] F10: rename `yearAndDayBasePattern` → `STANDARD_DATE_FIELD_PATTERN`, drop bare block scope in `dateFieldWarnings.ts`
- [x] BUG-2 regression tests: cover `fromJson` (all flag combinations + omitted), `toDto` (king flags forwarded), and full `toDto → fromJson` round-trip in `Date.test.ts`
- [x] Fix: non-pattern characters (e.g. `21%$`) not triggering non-standard warning — make `STANDARD_DATE_FIELD_PATTERN` a true whitelist; remove redundant `ROMAN_NUMERAL_PATTERN` and `normalizeDateFieldValue` import from `dateFieldWarnings.ts`; add `it.each` test for special-character inputs
- [x] Re-run gates after follow-ups: `yarn lint`, `yarn tsc`, full suite (1 isolated flaky test, passes alone)

### Refactor: split `Date.test.ts` into ≤250-line files

- [x] Read the full original `Date.test.ts` to understand structure and group tests
- [x] Identify all shared fixtures used across groups
- [x] Create `src/chronology/domain/Date.fromJson.test.ts` — fromJson, toDto, round-trip serialization (BUG-2 regression)
- [x] Create `src/chronology/domain/Date.toString.test.ts` — all `toString()` representation tests
- [x] Create `src/chronology/domain/Date.zeroYear.test.ts` — BUG-5 zero-year conversion/behaviour tests, `toJulianDate` branching, king edge cases
- [x] Create `src/chronology/domain/Date.intercalary.test.ts` — BUG-4 intercalary conversion tests, `ca.` approximate prefix tests, BUG-3 wrapped-year conversion test
- [x] Delete original `src/chronology/domain/Date.test.ts`
- [x] Move fixtures into `src/test-support/date-fixtures.ts` and update all imports
- [x] Fix false-positive `isNonStandardValue` for `<136!?>` in `dateFieldWarnings.ts`
- [x] Fix pre-existing flaky `Corpus.integration.test.ts` (unawaited promise + broken `waitForText` navigation)
- [x] `yarn lint` — no errors
- [x] `yarn tsc` — no errors
- [x] Full test suite — 299/299 suites, 0 failures

### Open / pending items

- [x] F2: populate PR description on GitHub — applied via API on 2026-04-30 (Summary, Bug fixes, Review follow-ups, Testing, Pre-existing flakes, Notes for reviewers)
- [ ] F1: remove all `TASK-001-*` files from the branch before merge (blocking per project rules)
- [ ] F12: open follow-up issue for pre-existing flakes (`Corpus.integration.test.ts`, occasional `CuneiformFragment.test.tsx` spinner-wait) — pending user approval. Detailed analysis and fix suggestions captured in [TASK-001-F12-flakes.md](TASK-001-F12-flakes.md).
- [x] Manual QA: run `TASK-001-manual-qa.md` against a live backend before merge
- [x] F13: reconcile qlty stylelint plugin so `*.sass` files no longer report `CssSyntaxError` — added minimal `.qlty/qlty.toml` excluding stylelint on `**/*.sass` (sass files remain linted locally and in CI by `yarn lint`, which honors the `customSyntax: postcss-sass` override)
- [x] F9: `Date.ts toDto()` — change `if (originalKing?.orderGlobal)` to `!= null` so `orderGlobal === 0` survives serialization
- [x] F11: extract `findKingAtOrderInDynasty(kings, orderInDynasty)` helper in `ZeroYearKingFinder.ts` and use `Array.find` instead of nested `for` loop
- [x] `parseDateFieldNumber`: add `"ca."` qualifier to converted modern date for approximate patterns `n+`, `x+n`, `n/n`, `n-n` — added `isApproximateDateFieldValue` helper in `parseDateFieldNumber.ts`; wired into `isApproximate()` in `DateBase.ts`; added `isApproximateDateFieldValue` unit tests and SE/Nabonassar-era integration tests in `Date.test.ts`
- [x] `parseDateFieldNumber`: `n-n` range logic verified — `parseDateFieldNumber('14-17')` correctly returns `14` (lower bound used for conversion); the range is now properly marked approximate via `isApproximateDateFieldValue`

### Manual QA follow-ups (post-commit 5a927b88)

- [x] Fix: `1!` allowed in month/day; `1!!!!!` → non-standard warning only (year emended warning removed for month/day)
- [x] Fix: single info icon above date input groups, not one per field
- [x] Fix: equal-width year/month/day inputs (`flex: 0 0 8em`)
- [x] Move all inline `style={{…}}` in `src/chronology/**/*.tsx` to per-component `.sass` files
  - [x] `DateSelectionInput.sass` (new) — field input, switch, patterns help, input-group layout
  - [x] `DateDisplay.sass` (new) — calendar toggle underline/dotted/cursor
  - [x] `DateSelection.sass` (new) — popover max-width
- [x] Fix: year row deformed — Reconstructed/Emended moved to second line, aligned under Broken/Uncertain; input same width as month/day
- [x] Fix: form fields missing `id`/`name` — added to all `Form.Control` and `react-select` (`inputId`/`name`) in chronology
- [x] Fix: sass 4-space indentation → 2-space to match project convention (resolves QLTY CssSyntaxError)
- [x] Fix: `n[a-z]` popover cell wrapping — `white-space: nowrap` via `.date-field-patterns-help__pattern`
- [x] Fix: QLTY similar-code — exported `dateFieldPatterns` from `DateFieldPatternsHelp.tsx`; test imports it instead of duplicating
- [x] Fix: snapshot regression in `LatestTransliterations.test.tsx` — updated to reflect `className` replacing inline `style`
- [x] Gates: lint ✓, tsc ✓, 17 suites / 156 tests ✓
