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
